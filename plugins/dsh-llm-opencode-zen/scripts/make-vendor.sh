#!/bin/bash
# make-vendor.sh —— 把 DSH 本地插件部署成「兼容插件市场导出」的可移植形态。
#
# 原理（dshmarket backup.ts 官方语义）：
#   绝对路径 spec（link:/some/where）不可移植——恢复机没有该路径，pnpm install
#   无法满足，恢复失败（unportableDeps 拦截）。
#   相对路径 spec（link:./vendor/<pkg>）随 profile 目录解析；vendor/ 内的插件
#   文件（纯文本源码 + 构建产物）会被备份携带、恢复重建，因此
#   「导出备份 → 导入新环境 → 按清单重装 → 重启」全链路可用。
#
# 用法：
#   bash scripts/make-vendor.sh <插件目录> [profile 目录]
#   例：bash scripts/make-vendor.sh /dsh-llm-opencode-zen
#       bash scripts/make-vendor.sh /root/dsh-routing-suite-updater /root/.dsh/profiles/web
#   默认 profile：/root/.dsh/profiles/web
#
# 效果：
#   1) 构建插件（插件自带 scripts/build.sh 或 package.json build 脚本）
#   2) 把插件（含 lib/ 构建产物，排除 node_modules/.git）同步到 <profile>/vendor/<pkg>
#   3) profile package.json 依赖 spec 改为 link:./vendor/<pkg>
#   4) 重建 profile/node_modules 链接指向 vendor 目录（重启后按新布局装配）
#   5) 校验：本插件不再被 dshmarket 判为不可移植 + vendor 文件随备份携带
#
# 插件更新流程：改代码 → 构建 → 重新执行本脚本 → 重启 DSH
set -euo pipefail

PLUGIN_DIR="$(cd "${1:?用法: make-vendor.sh <插件目录> [profile目录]}" && pwd)"
PROFILE="${2:-/root/.dsh/profiles/web}"
PKG_NAME="$(node -e "console.log(require('$PLUGIN_DIR/package.json').name)")"
VENDOR_NAME="$(node -e "const n=require('$PLUGIN_DIR/package.json').name; console.log(n.startsWith('@') ? n.split('/')[1] : n)")"
VENDOR_DIR="$PROFILE/vendor/$VENDOR_NAME"

echo "=== 插件: $PKG_NAME ($PLUGIN_DIR) → $VENDOR_DIR ==="

echo "=== [1/5] 构建插件 ==="
if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "    SKIP_BUILD=1，使用现有构建产物"
elif [ -f "$PLUGIN_DIR/scripts/build.sh" ]; then
  (cd "$PLUGIN_DIR" && bash scripts/build.sh)
elif [ -f "$PLUGIN_DIR/scripts/build.mjs" ]; then
  (cd "$PLUGIN_DIR" && node scripts/build.mjs)
elif [ -f "$PLUGIN_DIR/package.json" ]; then
  (cd "$PLUGIN_DIR" && npm run build 2>/dev/null || echo "    (无 build 脚本，跳过构建)")
else
  echo "    跳过构建"
fi

echo "=== [2/5] 同步到 vendor 目录 ==="
mkdir -p "$PROFILE/vendor"
rm -rf "$VENDOR_DIR"
cp -r "$PLUGIN_DIR" "$VENDOR_DIR"
rm -rf "$VENDOR_DIR/node_modules" "$VENDOR_DIR/.git" "$VENDOR_DIR"/*.tgz "$VENDOR_DIR"/package-lock.json
echo "    vendor 文件数：$(find "$VENDOR_DIR" -type f | wc -l)"

echo "=== [3/5] profile package.json 依赖 spec → link:./vendor/$VENDOR_NAME ==="
node -e "
const fs = require('fs');
const path = '$PROFILE/package.json';
const m = JSON.parse(fs.readFileSync(path, 'utf8'));
m.dependencies = m.dependencies ?? {};
m.dependencies['$PKG_NAME'] = 'link:./vendor/$VENDOR_NAME';
fs.writeFileSync(path, JSON.stringify(m, null, 2) + '\n');
console.log('    spec 已更新:', JSON.stringify(m.dependencies['$PKG_NAME']));
"

echo "=== [4/5] 重建 node_modules 链接 ==="
LINK="$PROFILE/node_modules/$PKG_NAME"
node -e "
const fs = require('fs');
const link = '$LINK';
fs.rmSync(link, { recursive: true, force: true });
fs.mkdirSync(require('path').dirname(link), { recursive: true });
fs.symlinkSync('$VENDOR_DIR', link, process.platform === 'win32' ? 'junction' : 'dir');
console.log('    linked:', link, '→ $VENDOR_DIR');
"

echo "=== [5/5] 校验可移植性（dshmarket 语义） ==="
node --input-type=module -e "
import { createProfileBackup, unportableDeps } from '${PROFILE}/node_modules/dshmarket/lib/backup.js';
const backup = createProfileBackup('x', '${PROFILE}');
const bytes = Buffer.byteLength(JSON.stringify(backup));
const manifest = backup.files.find((f) => f.path === 'package.json').json;
const bad = unportableDeps(manifest.dependencies ?? {});
const badOurs = bad.filter((d) => d.name === '$PKG_NAME');
const vendorFiles = backup.files.filter((f) => f.path.startsWith('vendor/$VENDOR_NAME/')).length;
console.log('    备份总体积:', bytes, 'bytes (limit 2097152)');
console.log('    本插件 vendor 文件随备份携带:', vendorFiles);
console.log('    本插件 unportableDeps:', JSON.stringify(badOurs));
if (bytes > 2097152) { console.error('    校验失败：备份超 2MB 限制'); process.exit(1); }
if (badOurs.length > 0) { console.error('    校验失败：本插件仍不可移植'); process.exit(1); }
console.log('    OK：$PKG_NAME 已可移植');
"
echo "=== 完成：请重启 DSH 使新布局生效 ==="
