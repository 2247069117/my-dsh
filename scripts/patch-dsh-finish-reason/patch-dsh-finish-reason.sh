#!/usr/bin/env bash
# =============================================================================
# patch-dsh-finish-reason.sh — 让 DSH 容忍「流结束没有 finish_reason」的端点
#
# 背景
# ----
# 不少 OpenAI 兼容网关（opencode.ai zen/go 的 ox-alpha-free、部分代理/中转
# 路由等）在 SSE 流结束时从不发送 finish_reason，而 DSH 内置的 pi-ai (0.82.x)
# 把这种情况当作协议错误抛出 "Stream ended without finish_reason"，导致已生成
# 的一大段推理/输出被丢弃并整轮重试。该检查是 openai-completions 适配器的
# 通用逻辑，任何自定义路由都可能触发，不只某一家。
#
# 本脚本对全局安装的 DSH 做三步修补（每步幂等，可重复执行）：
#   1. 将 @deepseek-ai/dsh-llm-pi-ai 依赖的 pi-ai 从 ^0.82.1 升到 ^0.84.2
#      （pi-ai ≥0.83 新增 OpenAICompletionsCompat.supportsFinishReason）。
#   2. 在 dsh-llm-pi-ai 的编译产物 lib/index.js 中把 supportsFinishReason 加入
#      COMPLETIONS_COMPAT_GATE（offer）与 compatProfile 的 z.object 模式。
#   3. 默认值注入：手写声明的自定义路由（不在 pi-ai 内置 catalog 中）且协议为
#      openai-completions 的模型，resolveModelCompat 默认补上
#      supportsFinishReason: false —— 流自然结束不再报错，内容完整保留。
#      catalog 内置路由保持 pi-ai 的严格检测；settings.yaml 里显式声明
#      compat.supportsFinishReason 仍可覆盖默认值。
#
# DSH 每次升级/重装后需要重新执行本脚本。
#
# 用法
# ----
#   bash patch-dsh-finish-reason.sh            # 自动定位全局 DSH
#   DSH_ROOT=/path/to/dsh bash patch-dsh-finish-reason.sh
#
# 执行完成后请重启 dsh web 服务（退出 DSH Launcher / 杀掉 dsh web 进程后重启）。
# =============================================================================
set -euo pipefail

if [[ -n "${DSH_ROOT:-}" ]]; then
  DSH_DIR="$DSH_ROOT"
else
  GLOBAL_ROOT="$(npm root -g)"
  DSH_DIR="$GLOBAL_ROOT/@deepseek-ai/dsh"
fi

LLM_PI_AI_DIR="$DSH_DIR/node_modules/@deepseek-ai/dsh-llm-pi-ai"
PI_AI_DIR="$DSH_DIR/node_modules/@earendil-works/pi-ai"
LIB="$LLM_PI_AI_DIR/lib/index.js"

[[ -d "$LLM_PI_AI_DIR" ]] || { echo "✗ 找不到 $LLM_PI_AI_DIR"; exit 1; }
[[ -f "$LIB" ]] || { echo "✗ 找不到 $LIB"; exit 1; }

echo "DSH 目录: $DSH_DIR"

# ---------- 1) 升级 pi-ai 到支持 supportsFinishReason 的版本 ----------
if [[ -f "$PI_AI_DIR/package.json" ]]; then
  INSTALLED="$(node -p "require('$PI_AI_DIR/package.json').version")"
else
  INSTALLED=""
fi

NEED_INSTALL=1
if [[ -n "$INSTALLED" && "$INSTALLED" != 0.82* ]]; then
  # 已不是 0.82 系列就不再强改依赖
  NEED_INSTALL=0
  echo "✓ pi-ai 已安装 $INSTALLED（>=0.83 即含 supportsFinishReason 支持）"
fi

if [[ "$NEED_INSTALL" == 1 ]]; then
  echo "→ 升级 pi-ai ($INSTALLED → ^0.84.2)…"
  perl -0pi -e 's/"@earendil-works\/pi-ai": "\^0\.82\.1"/"@earendil-works\/pi-ai": "^0.84.2"/' \
    "$LLM_PI_AI_DIR/package.json"
  (cd "$DSH_DIR" && npm install --no-audit --no-fund --loglevel=error)
  INSTALLED="$(node -p "require('$PI_AI_DIR/package.json').version")"
  echo "✓ pi-ai 现为 $INSTALLED"
fi

# ---------- 2) 让 dsh-llm-pi-ai 把 supportsFinishReason 当作可配置字段 ----------
# 2a. COMPLETIONS_COMPAT_GATE 标记 offer
if grep -q 'supportsFinishReason: "offer"' "$LIB"; then
  echo "✓ gate 已含 supportsFinishReason: offer，跳过"
else
  perl -0pi -e 's/(\tsupportsUsageInStreaming: "offer",)(\n\tmaxTokensField: "offer",)/$1\n\tsupportsFinishReason: "offer",$2/' "$LIB"
  grep -q 'supportsFinishReason: "offer"' "$LIB" || { echo "✗ gate 补丁未生效"; exit 1; }
  echo "✓ gate 补丁完成"
fi

# 2b. compatProfile 的 z.object 模式声明字段
if grep -q 'supportsFinishReason: z.boolean()' "$LIB"; then
  echo "✓ schema 已含 supportsFinishReason: z.boolean()，跳过"
else
  perl -0pi -e 's/(\tsupportsUsageInStreaming: z\.boolean\(\),)(\n\tmaxTokensField: z\.union\(MAX_TOKENS_FIELDS\),)/$1\n\tsupportsFinishReason: z.boolean(),$2/' "$LIB"
  grep -q 'supportsFinishReason: z.boolean()' "$LIB" || { echo "✗ schema 补丁未生效"; exit 1; }
  echo "✓ schema 补丁完成"
fi

# ---------- 3) 自定义路由默认 supportsFinishReason: false ----------
if grep -q 'local patch (user): custom routes default' "$LIB"; then
  echo "✓ 自定义路由默认值已注入，跳过"
else
  python3 - "$LIB" <<'PY'
import sys

path = sys.argv[1]
src = open(path, encoding="utf-8").read()

anchor = "\tif (Object.keys(configured).length === 0) return {};"
inject = (
    "\t// local patch (user): custom routes default supportsFinishReason=false — gateways\n"
    "\t// outside pi-ai's catalog often end streams without a final finish_reason, and\n"
    "\t// treating that as a protocol error discards generated content and retries.\n"
    "\tif (base === void 0 && api === \"openai-completions\" && configured.supportsFinishReason === void 0) {\n"
    "\t\tconfigured.supportsFinishReason = false;\n"
    "\t}\n"
)

count = src.count(anchor)
if count != 1:
    sys.exit(f"✗ 锚点出现 {count} 次（期望 1 次）——vendor 文件可能已被 DSH 升级改动，"
             f"请人工核对 {path} 后再打补丁")

open(path, "w", encoding="utf-8").write(src.replace(anchor, inject + anchor))
PY
  grep -q 'local patch (user): custom routes default' "$LIB" || { echo "✗ 默认值注入未生效"; exit 1; }
  echo "✓ 自定义路由默认值注入完成"
fi

node --check "$LIB" || { echo "✗ 语法检查失败，请回滚备份"; exit 1; }

cat <<'EOF'

✅ 全部完成。接下来重启 dsh web 服务（退出 DSH Launcher.app 或 kill 掉 `dsh web`
   进程后重新打开），使新代码加载。

   说明：
   - 所有手写声明的 openai-completions 自定义路由（如 opencode、中转网关等）现在
     默认容忍「流结束不带 finish_reason」，内容不再被丢弃重试。
   - settings.yaml 里显式的：
         compat:
           supportsFinishReason: false
     仍有效但已非必需；若某个路由想保持严格检测，显式声明
         compat:
           supportsFinishReason: true
     即可覆盖默认值。
EOF