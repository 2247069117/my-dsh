#!/usr/bin/env bash
# =============================================================================
# patch-dsh-finish-reason.sh — 让 DSH 容忍「流结束没有 finish_reason」的端点
#
# 背景
# ----
# opencode.ai zen/go 的 ox-alpha-free 路由在 SSE 流结束时从不发送 finish_reason，
# 而 DSH 内置的 pi-ai (0.82.x) 把这种情况当作协议错误抛出
# "Stream ended without finish_reason"，导致已生成的一大段推理/输出被丢弃并整轮重试。
#
# 本脚本对全局安装的 DSH 做三层修补（全部幂等，可重复执行）：
#   1. 将 @deepseek-ai/dsh-llm-pi-ai 依赖的 pi-ai 从 ^0.82.1 升到 ^0.84.2
#      （pi-ai ≥0.83 新增 OpenAICompletionsCompat.supportsFinishReason）。
#   2. 在 dsh-llm-pi-ai 的编译产物 lib/index.js 中把 supportsFinishReason 加入
#      COMPLETIONS_COMPAT_GATE（offer）与 compatProfile 的 z.object 模式。
#   3. （配置层，不在此脚本内）在 ~/.dsh/settings.yaml 的模型上声明：
#          compat:
#            supportsFinishReason: false
#
# DSH 每次升级/重装后需要重新执行本脚本；settings.yaml 的声明保留即可。
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
if [[ -n "$INSTALLED" ]] && node -e "process.exit(require('semver') ? 0 : 1)" 2>/dev/null; then
  : # semver 未必可用，走下面的简单比较
fi
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
if grep -q 'supportsFinishReason' "$LIB"; then
  echo "✓ lib/index.js 已包含 supportsFinishReason，跳过补丁"
else
  perl -0pi -e 's/(\tsupportsUsageInStreaming: "offer",)(\n\tmaxTokensField: "offer",)/$1\n\tsupportsFinishReason: "offer",$2/' "$LIB"
  perl -0pi -e 's/(\tsupportsUsageInStreaming: z\.boolean\(\),)(\n\tmaxTokensField: z\.union\(MAX_TOKENS_FIELDS\),)/$1\n\tsupportsFinishReason: z.boolean(),$2/' "$LIB"
  if grep -q 'supportsFinishReason' "$LIB"; then
    echo "✓ lib/index.js 补丁完成（gate + schema）"
  else
    echo "✗ 补丁未生效，请检查 $LIB 的 COMPLETIONS_COMPAT_GATE / compatProfile 结构"
    exit 1
  fi
fi

cat <<'EOF'

✅ 全部完成。接下来：
  1. 重启 dsh web 服务（退出 DSH Launcher.app 或 kill 掉 `dsh web` 进程后重新打开），
     使新代码加载。
  2. 确认 ~/.dsh/settings.yaml 的目标模型带有：
         compat:
           supportsFinishReason: false
EOF