#!/usr/bin/env bash
# =============================================================================
# patch-dsh-escalation-noop.sh — dsh-sandbox「同模式 sandbox 升级」no-op 补丁
#
# 背景
# ----
# 会话沙箱模式为 danger-full-access 时本来就不受限，但 bash/fs 等工具的 schema
# 仍暴露 sandbox_permissions 参数，部分模型（尤其 gpt-5.6-luna）会反复传它。
# @deepseek-ai/dsh-sandbox 的 approveEscalation() 对「请求模式 == 当前模式」
# （同模式，非严格更宽）直接抛错，导致每次工具调用失败。
#
# 本脚本把全局 dsh 安装里 dsh-sandbox/lib/index.js 的 approveEscalation 中一行
# 改为：同模式请求直接返回（no-op 放行），真实升级仍走审批，降级仍拒绝。
#
# 幂等：以 marker 注释 "local patch (user)" 检测，已打补丁时直接跳过。
# 首次打补丁前自动备份原文件到 ~/.dsh/patches/dsh-sandbox.index.js.orig。
#
# DSH 每次升级/重装（vendor 文件被还原）后需要重新执行本脚本。
#
# 用法
# ----
#   bash patch-dsh-escalation-noop.sh            # 自动定位全局 DSH
#   DSH_ROOT=/path/to/dsh bash patch-dsh-escalation-noop.sh
#
# 执行完成后请重启 dsh web 服务（退出 DSH Launcher / 杀掉 dsh web 进程后重启）。
# =============================================================================
set -euo pipefail

if [[ -n "${DSH_ROOT:-}" ]]; then
  DSH_DIR="$DSH_ROOT"
else
  DSH_DIR="$(npm root -g)/@deepseek-ai/dsh"
fi

DSS="$DSH_DIR/node_modules/@deepseek-ai/dsh-sandbox/lib/index.js"

[[ -f "$DSS" ]] || { echo "✗ 找不到 $DSS"; exit 1; }
echo "目标文件: $DSS"

# ---------- 幂等检测 ----------
if grep -q "local patch (user)" "$DSS"; then
  echo "✓ 已打过补丁（marker 存在），跳过"
  exit 0
fi

# ---------- 首次打补丁前备份 ----------
BACKUP_DIR="${HOME}/.dsh/patches"
BACKUP="$BACKUP_DIR/dsh-sandbox.index.js.orig"
if [[ ! -f "$BACKUP" ]]; then
  mkdir -p "$BACKUP_DIR"
  cp "$DSS" "$BACKUP"
  echo "✓ 原文件已备份到 $BACKUP"
else
  echo "✓ 备份已存在: $BACKUP"
fi

# ---------- 应用补丁 ----------
python3 - "$DSS" <<'PY'
import sys

path = sys.argv[1]
src = open(path, encoding="utf-8").read()

orig = ('if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) '
        'throw new Error(`sandbox escalation to "${mode}" is not strictly wider '
        "than this call's current \"${effectiveMode}\" mode`);")

new = ('if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) {\n'
       '\t// local patch (user): a request for the mode the call already runs under is a\n'
       '\t// no-op grant — nothing widens, so it never prompts a human. Prevents models\n'
       '\t// that habitually pass sandbox_permissions from hard-failing every call.\n'
       '\tif (mode === effectiveMode) return mode;\n'
       '\tthrow new Error(`sandbox escalation to "${mode}" is not strictly wider '
       "than this call's current \"${effectiveMode}\" mode`);\n"
       '}')

count = src.count(orig)
if count != 1:
    sys.exit(f"✗ 目标代码出现 {count} 次（期望恰好 1 次）——vendor 文件可能已被 DSH 升级改动，"
             f"请人工核对 {path} 后再打补丁（或先回滚备份）")

open(path, "w", encoding="utf-8").write(src.replace(orig, new))
PY

echo "✓ 补丁已应用"

cat <<'EOF'

✅ 完成。行为矩阵：
   - 同模式 danger→danger：直接返回该 mode（no-op 放行，不再报错）
   - 真实升级 workspace→danger：仍走审批
   - 降级：仍抛 "not strictly wider"
请重启 dsh web 服务使新代码加载。回滚：
  cp ~/.dsh/patches/dsh-sandbox.index.js.orig <上述目标文件>
EOF