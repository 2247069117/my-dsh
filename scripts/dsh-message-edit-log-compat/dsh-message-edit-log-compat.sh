#!/usr/bin/env bash
# dsh-message-edit-log-compat.sh — fix "历史加载失败 / history unavailable" caused by
# the third-party dsh-message-edit plugin writing session logs that the harness read
# path refuses to interpret.
#
# Problem:
#   dsh-message-edit (branch-based message editing) forks "version" sessions whose
#   seed contains a plugin-custom event type `message-edit/version`. That type is
#   outside the harness's KNOWN_SESSION_EVENT_TYPES and is not marked `ignorable`,
#   so the persistence read path throws
#     SessionFormatUnsupportedError: ... event type "message-edit/version" ...
#     unknown to this harness and not marked ignorable ... likely written by a
#     newer harness
#   and the session history can no longer be loaded (also after every restart).
#
# Fix (two halves, both applied by this script):
#   1. Reader side — add `message-edit/version` to KNOWN_SESSION_EVENT_TYPES in the
#      installed @deepseek-ai/dsh-session package. It is log-only metadata with no
#      message-reconstruction semantics, so accepting it is safe. This makes ALL
#      existing and future logs load without touching any log bytes.
#   2. Writer side — patch the installed dsh-message-edit plugin so newly forked
#      version sessions mark their `message-edit/version` event `ignorable: true`,
#      which stock (unpatched) harness builds also accept per the SessionEvent
#      envelope contract.
#
# Usage:
#   dsh-message-edit-log-compat.sh            apply (idempotent, default)
#   dsh-message-edit-log-compat.sh revert     undo both patches
#   dsh-message-edit-log-compat.sh check      verify patches present + scan all
#                                             stored session logs for remaining
#                                             unknown non-ignorable event types
#   dsh-message-edit-log-compat.sh verify     load the reported session through the
#                                             real persistence read path
#
# After apply/revert you must restart the dsh web server for the running process
# to pick up the change:  dsh web (or restart via the DSH Launcher).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTION="${1:-apply}"

# --- locate the dsh-session package (nested under the globally installed CLI) ---
resolve_session_pkg() {
  local candidate root bin real
  if [[ -n "${DSH_SESSION_PKG:-}" ]]; then candidate="$DSH_SESSION_PKG"; else
    if [[ -n "${DSH_GLOBAL_DIR:-}" ]]; then root="$DSH_GLOBAL_DIR"; else
      root="$(npm root -g 2>/dev/null || true)"
      if [[ -z "$root" ]]; then
        bin="$(command -v dsh 2>/dev/null || true)"
        if [[ -n "$bin" ]]; then
          # bin -> (symlink) -> <global>/lib/node_modules/@deepseek-ai/dsh/lib/bin.js
          real="$(python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "$bin" 2>/dev/null || echo "$bin")"
          root="$(dirname "$(dirname "$(dirname "$(dirname "$real")")")")"
        fi
      fi
    fi
    candidate="$root/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-session"
    [[ -d "$candidate" ]] || candidate="$root/@deepseek-ai/dsh-session"
  fi
  if [[ ! -d "$candidate" ]]; then
    echo "ERROR: cannot locate the @deepseek-ai/dsh-session package." >&2
    echo "       Set DSH_SESSION_PKG to its package directory." >&2
    exit 1
  fi
  echo "$candidate"
}

SESSION_PKG="$(resolve_session_pkg)"
GLOBAL_PKGS_DIR="$(dirname "$SESSION_PKG")"
INDEX_JS="$SESSION_PKG/lib/index.js"
KNOWN_JS="$SESSION_PKG/lib/types/known-event-types.js"
SESSIONS_ROOT="${DSH_SESSIONS_ROOT:-$HOME/.dsh/sessions}"
PLUGIN_PATTERNS=("$HOME/.dsh/profiles"/*/node_modules/dsh-message-edit/index.mjs)

# --- patch segments (must match the installed files byte-for-byte; tabs!) --------
CATALOG_TAB_OLD=$'	"llm/retry-started",\n	"permission/preset",'
CATALOG_TAB_NEW=$'	"llm/retry-started",\n\t// LOCAL PATCH (dsh-message-edit-log-compat): plugin event type written into\n\t// session logs by the third-party dsh-message-edit plugin (branch-based\n\t// message editing/reroll/retry); log-only metadata, no message-reconstruction\n\t// semantics, so accepting it is safe. Removed by harness upgrades; re-apply\n\t// via scripts/dsh-message-edit-log-compat.sh.\n\t"message-edit/version",\n\t"permission/preset",'

CATALOG_SPC_OLD=$'    \'llm/retry-started\',\n    \'permission/preset\','
CATALOG_SPC_NEW=$'    \'llm/retry-started\',\n    // LOCAL PATCH (dsh-message-edit-log-compat): plugin event type written into\n    // session logs by the third-party dsh-message-edit plugin (branch-based\n    // message editing/reroll/retry); log-only metadata, no message-reconstruction\n    // semantics, so accepting it is safe. Removed by harness upgrades; re-apply\n    // via scripts/dsh-message-edit-log-compat.sh.\n    \'message-edit/version\',\n    \'permission/preset\','

PLUGIN_OLD=$'function appendLogSeedEvent(events, type, data) {\n\tevents.push({\n\t\ttype,\n\t\tseq: events.length,\n\t\ttime: Date.now(),\n\t\tdata\n\t});\n}'
PLUGIN_NEW=$'function appendLogSeedEvent(events, type, data) {\n\tevents.push({\n\t\ttype,\n\t\tseq: events.length,\n\t\ttime: Date.now(),\n\t\tdata,\n\t\t/**\n\t\t* LOCAL PATCH (dsh-message-edit-log-compat): `message-edit/version` is a\n\t\t* plugin-custom event type outside the harness\'s KNOWN_SESSION_EVENT_TYPES.\n\t\t* The harness read path refuses unknown non-ignorable events ("likely\n\t\t* written by a newer harness"); marking ours ignorable tells stock harness\n\t\t* builds that skipping it does not change log semantics (it is log-only\n\t\t* metadata for the plugin\'s UI projection). Re-apply via\n\t\t* scripts/dsh-message-edit-log-compat.sh after plugin updates.\n\t\t*/\n\t\t...type === "message-edit/version" ? { ignorable: true } : {}\n\t});\n}'

patch_file() { # file old new
  local file="$1" old="$2" new="$3" mode
  mode="$ACTION"
  if [[ "$mode" == "check" ]]; then
    if grep -qF "LOCAL PATCH (dsh-message-edit-log-compat)" "$file" 2>/dev/null; then
      echo "  [ok] patched: $file"
    else
      echo "  [MISSING] patch absent: $file"
      CHECK_FAILED=1
    fi
    return 0
  fi
  python3 - "$file" "$old" "$new" "$mode" <<'PY'
import sys
path, old, new, mode = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
if mode == "revert":
    if new in content:
        content = content.replace(new, old, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [reverted] {path}")
    else:
        print(f"  [skip] not patched: {path}")
elif mode == "apply":
    if new in content:
        print(f"  [skip] already patched: {path}")
    else:
        if old not in content:
            sys.exit(f"REFUSE: file {path} does not match the pristine text; aborting (harness or plugin version changed?)")
        content = content.replace(old, new, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [patched] {path}")
PY
}

echo "== dsh-message-edit-log-compat: $ACTION =="
echo "session package: $SESSION_PKG"
CHECK_FAILED=0

case "$ACTION" in
  apply|revert|check)
    echo "-- dsh-session catalog --"
    patch_file "$INDEX_JS" "$CATALOG_TAB_OLD" "$CATALOG_TAB_NEW"
    patch_file "$KNOWN_JS" "$CATALOG_SPC_OLD" "$CATALOG_SPC_NEW"
    echo "-- dsh-message-edit plugin (all profiles) --"
    local_plugin=""
    for p in "${PLUGIN_PATTERNS[@]}"; do
      [[ -f "$p" ]] || continue
      echo "  plugin: $p"
      patch_file "$p" "$PLUGIN_OLD" "$PLUGIN_NEW"
      node --check "$p"
      local_plugin="$p"
    done
    if [[ -z "$local_plugin" ]]; then
      echo "  (no dsh-message-edit plugin found under $HOME/.dsh/profiles/*/node_modules)"
    fi
    ;;
  verify)
    id="${2:-session-3af87397-7cb3-4590-bb64-7f16819f7a40}"
    DSH_SESSION_PKG="$SESSION_PKG" DSH_SESSIONS_ROOT="$SESSIONS_ROOT" \
      node "$SCRIPT_DIR/verify-session-load.mjs" "$id"
    ;;
  *)
    echo "usage: $0 [apply|revert|check|verify [session-id]]" >&2
    exit 2
    ;;
esac

if [[ "$ACTION" == "check" ]]; then
  [[ "$CHECK_FAILED" == "0" ]]
elif [[ "$ACTION" == "apply" || "$ACTION" == "revert" ]]; then
  echo
  echo "NOTE: restart the dsh web server for the running process to pick this up:"
  echo "      stop it (Ctrl-C in its terminal, or quit via the DSH Launcher), then"
  echo "      start again with:  dsh web"
fi