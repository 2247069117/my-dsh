#!/bin/bash
# dsh-llm-opencode-zen 构建脚本（安装布局版，无源码 checkout 环境用）：
# 1) 编译期依赖 junction 到 DSH 全局安装（DSH_ROOT 可覆盖，默认 /usr/local/lib/node_modules/@deepseek-ai/dsh）
# 2) 用插件本地 tsc 编译 src/ → lib/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DSH_ROOT="${DSH_ROOT:-/usr/local/lib/node_modules/@deepseek-ai/dsh}"
if [ ! -d "$DSH_ROOT/node_modules/@deepseek-ai/dsh-llm" ]; then
  echo "build: cannot locate the dsh install (set DSH_ROOT)" >&2
  exit 1
fi

link_pkg() {
  local target="$DSH_ROOT/$2"
  if [ ! -e "$target" ]; then
    echo "build: dependency target missing: $target" >&2
    exit 1
  fi
  node -e "
    const fs = require('fs');
    const path = require('path');
    const link = path.resolve(process.argv[1]);
    const target = path.resolve(process.argv[2]);
    fs.rmSync(link, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
  " "$1" "$target"
}

echo "=== Linking build dependencies (dsh: $DSH_ROOT) ==="
mkdir -p node_modules/@deepseek-ai
link_pkg node_modules/cordis node_modules/@deepseek-ai/cordis
link_pkg node_modules/schemastery node_modules/@deepseek-ai/schemastery
link_pkg node_modules/@deepseek-ai/dsh-llm node_modules/@deepseek-ai/dsh-llm
link_pkg node_modules/@deepseek-ai/dsh-settings node_modules/@deepseek-ai/dsh-settings
link_pkg node_modules/@deepseek-ai/dsh-tools node_modules/@deepseek-ai/dsh-tools
link_pkg node_modules/@types/node node_modules/@types/node

echo "=== Compiling src → lib ==="
./node_modules/.bin/tsc -p tsconfig.json

echo "=== Copying browser half (client.js) → lib ==="
cp client/client.js lib/client.js
echo "=== Build complete ==="
