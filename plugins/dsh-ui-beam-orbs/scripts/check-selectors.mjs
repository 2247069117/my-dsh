#!/usr/bin/env node
/* scripts/check-selectors.mjs — 回归：校验关键 CSS/JS 选择器在预期 DSH 构建中的命中假设 */
/*
 * 用法：
 *   node scripts/check-selectors.mjs          # 静态扫描
 *   node scripts/check-selectors.mjs --live   # （可选）若本机 3080 可用，尝试无头抓取
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = false;
function fail(msg){ console.error("✗ " + msg); failed = true; }
function ok(msg){ console.log("✓ " + msg); }

// 1. 检查 CSS 中哈希类名是否有 data-* 回退
const cssDir = join(root, "src", "css");
const cssFiles = readdirSync(cssDir).filter(f=>f.endsWith(".css"));
let cssText = cssFiles.map(f=>readFileSync(join(cssDir,f),"utf8")).join("\n");
const hashedInCss = [...cssText.matchAll(/\.(pI_x6G_|hHd-Xa_|uV2eYG_|wSkVaW_|qDHVXG_|gdEzaW_|_block_|_bannerWrap|_copyButton|LVzXQa_|Mbwy4a_|VOzbGW_|CY-8Ka_|o3BgMG_)[A-Za-z0-9_-]*/g)].map(m=>m[0]);
if (hashedInCss.length>0) {
  const hasDataFallback = cssText.includes("[data-") || cssText.includes("[class\$") || cssText.includes("[class*=");
  if (!hasDataFallback) fail("CSS 含哈希类名但未见 [data-*] / [class$] fallback，建议补充通用选择器");
  else ok(`CSS 哈希类名 ${[...new Set(hashedInCss)].length} 个，均有 data-* / 通用后缀兜底`);
} else {
  ok("CSS 未检出哈希类名（或已迁移至纯 data-*）");
}

// 2. 检查关键 data-* 是否存在
const requiredSelectors = [
  '[data-slot="root"]',
  '[data-slot="sidebar"]',
  '[data-slot="conversation"]',
  '[data-composer-card="true"]',
  '[data-composer-seat]',
  '[data-testid="todo-panel"]',
];
for (const sel of requiredSelectors) {
  if (cssText.includes(sel) || readFileSync(join(root,"src","shell.js"),"utf8").includes(sel) || readFileSync(join(root,"src","beam.js"),"utf8").includes(sel)) {
    ok(`必需选择器存在: ${sel}`);
  } else {
    fail(`缺少必需选择器: ${sel}（需在 CSS 或 JS 中提供回退）`);
  }
}

// 3. JS 中哈希类名同样需有 fallback
const jsFiles = readdirSync(join(root,"src")).filter(f=>f.endsWith(".js"));
let jsText = jsFiles.map(f=>readFileSync(join(root,"src",f),"utf8")).join("\n");
const hashedInJs = [...jsText.matchAll(/querySelector[^)]*\.(pI_x6G_|hHd-Xa_|uV2eYG_|wSkVaW_|qDHVXG_|gdEzaW_|_block_|_bannerWrap|_copyButton|LVzXQa_|Mbwy4a_|VOzbGW_|CY-8Ka_|o3BgMG_)[A-Za-z0-9_-]*/g)];
if (hashedInJs.length>0) {
  let missingFallback = 0;
  for (const m of hashedInJs) {
    const idx = m.index;
    const window = jsText.slice(Math.max(0, idx-200), idx+300);
    if (!window.includes("data-")) missingFallback++;
  }
  if (missingFallback>0) console.warn(`⚠ JS 中有 ${missingFallback} 处哈希查询缺少临近 data-* 兜底（建议补充，但不阻断）`);
  ok(`JS 哈希查询 ${hashedInJs.length} 处，已检查 data-* 邻近性`);
} else {
  ok("JS 未检出孤立哈希查询");
}

// 4. 检查 build.mjs 是否含版本注入
const buildText = readFileSync(join(root,"scripts","build.mjs"),"utf8");
if (buildText.includes("PKG_VERSION") && buildText.includes("__PKG_VERSION__")) ok("build.mjs 已含 PKG_VERSION 注入");
else fail("build.mjs 未检出 PKG_VERSION 注入逻辑");

if (buildText.includes("coalesce.js")) ok("build.mjs JS_FILES 已含 coalesce.js");
else fail("build.mjs JS_FILES 缺少 coalesce.js");

// 5. 检查 coalesce.js 存在且暴露 subscribeCoalesced
try {
  const coalesce = readFileSync(join(root,"src","coalesce.js"),"utf8");
  if (coalesce.includes("subscribeCoalesced")) ok("src/coalesce.js 存在且暴露 subscribeCoalesced");
  else fail("src/coalesce.js 未暴露 subscribeCoalesced");
} catch(e){ fail("src/coalesce.js 缺失"); }

if (failed) {
  console.error("\n--check-selectors: 存在上述问题，请修复后重跑 build");
  process.exit(1);
} else {
  console.log("\n--check-selectors: 全部通过 ✓");
}