/*!
 * dsh-client-ui-deepseek-bg 客户端入口（自动生成）
 * 注入 DeepSeek 官网风格背景与玻璃拟态；仅深色主题生效。
 */
window.__ModuleLoader__.load({
  id: "dsh-client-ui-deepseek-bg",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    if (document.getElementById("dsh-deepseek-bg-css") === null) {
      var styleTag = document.createElement("style");
      styleTag.id = "dsh-deepseek-bg-css";
      styleTag.textContent = `
/*!
 * dsh-deepseek-bg.css
 * DeepSeek 官网首页背景复刻 —— DSH Web GUI 全屏固定背景层 + 外壳透明化。
 *
 * 颜色与蒙版均取自 DeepSeek 官方站点：
 *  - 浅色 hero 渐变:  linear-gradient(180deg, #9cc1e7 0%, rgba(250,250,250,0) 100%)
 *  - 深色 harness 页: 页面底色 #0a0a0a
 *  - canvas 蒙版:      linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%)
 *  - 入场动画:        opacity 0→1 + blur(20px)→0，1.8s ease-out（harness hero 同款）
 *
 * 重要：全部效果仅作用于深色主题（body[data-ds-dark-theme]）。
 *       浅色主题保持 DSH 官方原版外观，不做任何覆盖。
 */

/* ---------- 背景层：仅深色主题显示 ---------- */
#dsh-ds-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, #9cc1e7 0%, rgba(250, 250, 250, 0) 100%), #f9f8f8;
  animation: dsh-ds-enter 1.8s ease-out backwards;
  will-change: opacity, filter;
}

#dsh-ds-bg:not(.dsh-ds-dark) {
  display: none;
}

#dsh-ds-bg.dsh-ds-dark {
  background: #0a0a0a;
}

#dsh-ds-aurora,
#dsh-ds-constellation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  /* 官方 hero 蒙版（与 deepseek.com 原站一致） */
  mask: linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%);
  -webkit-mask: linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%);
}

#dsh-ds-constellation {
  background: transparent;
}

/* 官方深色 hero 的鲸鱼层：screen 混合，仅暗色主题显示 */
.dsh-ds-whale {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 2;
}

#dsh-ds-bg.dsh-ds-dark .dsh-ds-whale {
  display: flex;
}

@keyframes dsh-ds-enter {
  0% {
    opacity: 0;
    filter: blur(20px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  #dsh-ds-bg {
    animation: none;
  }
}

/* ===================================================================== *
 * 以下全部为深色主题专属覆盖（body[data-ds-dark-theme]）；
 * 浅色主题不匹配任何规则，保持官方原版。
 * ===================================================================== */

/* 背景透出：body 与外壳层透明化 */
body[data-ds-dark-theme] {
  background: transparent !important;
}

body[data-ds-dark-theme] [data-slot="root"] > div {
  background: transparent !important;
}

/* 当前构建的布局 frame 类名（精确覆盖，防中间包裹层） */
body[data-ds-dark-theme] [data-slot="root"] .pI_x6G_frame {
  background: transparent !important;
}

/* 插件加载前的启动屏 */
body[data-ds-dark-theme] #root ._boot_9gj4p_6 {
  background: transparent !important;
}

/* 视图根容器透明化：会话视图（bg-base）与详情列内容（轨迹视图 bg-layer-1）
   都是全高不透明容器，会盖住 DeepSeek 背景层 */
body[data-ds-dark-theme] [data-slot="conversation"] > div {
  background: transparent !important;
}

body[data-ds-dark-theme] .pI_x6G_detailsCol > div {
  background: transparent !important;
}

/* ============ 官方玻璃拟态（ds-glass 令牌，取自缓存 6f322bb0cffe2c36.css） ============ */

/* 侧边对话栏：半透明 + 玻璃模糊
   注意：backdrop-filter 会让元素成为 fixed 后代的包含块（设置弹窗会被
   强制压成侧边栏宽度）——所以模糊放在 ::before 伪元素上，列本身只设背景 */
body[data-ds-dark-theme] .pI_x6G_sidebarCol {
  position: relative;
  background: rgba(13, 15, 19, 0.55) !important;
  border-right-color: hsla(0, 0%, 100%, 0.08) !important;
}

body[data-ds-dark-theme] .pI_x6G_sidebarCol::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 侧边栏内容根：不再叠不透明底色。
   注意：不能给这里加 z-index/堆叠上下文——设置弹窗（fixed z-1000）挂载在
   侧边栏内部，一旦被困在侧边栏的堆叠上下文里就会被输入框（z-7）盖住；
   模糊伪元素用 z-index:-1 自然绘制在内容之下，内容无需提升层级
   [data-slot="sidebar"] > div 为跨构建通用选择器 */
body[data-ds-dark-theme] .hHd-Xa_root,
body[data-ds-dark-theme] [data-slot="sidebar"] > div {
  background: transparent !important;
}

/* 底部输入框卡片：官方玻璃卡片样式（ds-glass-card/dropdown 同款令牌）
   [data-composer-card="true"] 为跨构建通用属性选择器 */
body[data-ds-dark-theme] .uV2eYG_card,
body[data-ds-dark-theme] [data-composer-card="true"] {
  background: rgba(13, 15, 19, 0.55) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-color: hsla(0, 0%, 100%, 0.08) !important;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08) !important;
}

/* 输入框座位：去掉向不透明底色的渐隐，让极光从玻璃下透出
   [data-composer-seat] 为跨构建通用属性选择器 */
body[data-ds-dark-theme] .wSkVaW_composerSeat,
body[data-ds-dark-theme] [data-composer-seat] {
  background: transparent !important;
}

/* 会话列表底部渐隐条（qDHVXG_fade）：原来用不透明侧边栏填充色渐变，
   在玻璃侧边栏下会露出浅色白条——透明化 */
body[data-ds-dark-theme] .qDHVXG_fade {
  background: transparent !important;
}

/* ============ 消息气泡与代码块玻璃化（与侧边栏/输入框同款材质） ============ */

/* 用户消息气泡 */
body[data-ds-dark-theme] .gdEzaW_bubble {
  background: rgba(13, 15, 19, 0.55) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* 代码块容器（终端/阅读/差异/搜索等 DSL 块）+ 复制按钮 + banner */
body[data-ds-dark-theme] ._block_10eou_7,
body[data-ds-dark-theme] ._block_biesw_7,
body[data-ds-dark-theme] ._block_srovd_7,
body[data-ds-dark-theme] ._block_s66q0_7,
body[data-ds-dark-theme] ._block_178r4_4,
body[data-ds-dark-theme] ._block_d4nqi_7,
body[data-ds-dark-theme] ._body_1ye18_20,
body[data-ds-dark-theme] ._copyButton_10eou_142,
body[data-ds-dark-theme] ._bannerWrap_178r4_21 {
  background: rgba(13, 15, 19, 0.55) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}


`;
      document.head.appendChild(styleTag);
    }
/*!
 * dsh-deepseek-bg.js
 * DeepSeek 官网首页背景完整复刻（背景颜色 + 动画效果），作为 DSH Web GUI 的全屏固定背景。
 *
 * 移植自 www.deepseek.com 首页 hero（浅色：粒子极光 + 蓝色星座网格）与
 * www.deepseek.com/harness 落地页 hero（深色：3D 流体极光 + 白色星座网格）。
 * 两套 WebGL shader（flowmap / particle / fluid）、渲染循环、参数配置均从
 * DeepSeek 官方打包产物中原样提取。
 *
 * 行为与官方一致：
 *  - WebGL2 粒子/流体极光（30fps 节流、DPR 上限 1.5、IntersectionObserver 暂停）
 *  - 2D 星座网格（90px 间距、鼠标斥力弹簧物理、140px 交互半径）
 *  - 主题自适应：跟随 body[data-ds-dark-theme]（含 fallback 到 prefers-color-scheme）
 *  - 触屏设备跳过星座网格；prefers-reduced-motion 时渲染单帧静态
 *  - Windows 平台不做鼠标流体笔刷（与官方一致）
 */
function apply() {
  "use strict";
  if (window.__dshDeepSeekBg && window.__dshDeepSeekBg._inited) return;
  if (typeof window.__dshDeepSeekBg !== 'object' || window.__dshDeepSeekBg === null) window.__dshDeepSeekBg = {};
  window.__dshDeepSeekBg._inited = true;

  if (typeof document === "undefined") return;

  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var isWindows = (navigator.userAgentData && navigator.userAgentData.platform === "Windows") ||
    navigator.userAgent.indexOf("Windows") !== -1;

  /* ------------------------------------------------------------------ *
   * 主题检测
   * ------------------------------------------------------------------ */
  function detectDark() {
    var b = document.body;
    var d = document.documentElement;
    if (b && b.hasAttribute("data-ds-dark-theme")) return true;
    if (d && d.hasAttribute("data-ds-dark-theme")) return true;
    if (b && b.hasAttribute("data-ds-light-theme")) return false;
    if (d && d.hasAttribute("data-ds-light-theme")) return false;
    if (d && d.dataset) {
      if (d.dataset.theme === "dark") return true;
      if (d.dataset.theme === "light") return false;
    }
    return !!(darkQuery && darkQuery.matches);
  }

  /* ------------------------------------------------------------------ *
   * 官方参数配置
   *   浅色：www.deepseek.com 首页 hero（particle 渲染）
   *   深色：www.deepseek.com/harness hero（fluid 渲染）
   * ------------------------------------------------------------------ */
  var LIGHT_AURORA = {
    type: "particle",
    mouseRadius: 0.22, mouseStrength: 1.1, mouseSmoothing: 0.12, mouseVelocity: 0.15,
    decay: 0.96, distortBoost: 1.35, noiseBoost: 0, swirlBoost: 0.45,
    glowIntensity: 0, glowColors: ["#ffffff", "#ffffff", "#ffffff"],
    speed: 14, distortion: 20, swirl: 12, swirlIterations: 8,
    scale: 0.5, rotation: -5, proportion: 50, softness: 100, shapeScale: 10,
    offsetX: 0, offsetY: 65,
    colors: ["#8AA3D6", "#FFFFFF", "#FFFFFF"],
    lightX: 0.89, lightY: 0.46, lightCore: 0, lightHalo: 0, vignette: 0, lightFollow: 0,
    bloomThreshold: 0.61, bloomRange: 0.18, bloomStrength: 0, grain: 0
  };

  /* 官方深色 hero（www.deepseek.com/harness）参数，逐项取自缓存
     page-07f506a1408ad0e8.js 中的 k 配置（fluid 渲染） */
  var DARK_AURORA = {
    type: "fluid",
    mouseRadius: 0.09, mouseStrength: 1.8, mouseSmoothing: 0.1, mouseVelocity: 0.2,
    decay: 0.925, distortBoost: 2.2, noiseBoost: 0.3, swirlBoost: 0.8,
    glowIntensity: 0.13, glowColors: ["#fff7d1", "#538dca", "#2d448b"],
    speed: 28, distortion: 18, swirl: 20, swirlIterations: 12,
    scale: 1.77, rotation: 15, proportion: 60, softness: 80, shapeScale: 0,
    offsetX: -124, offsetY: -48,
    colors: ["#000000", "#1A3870", "#204a7e", "#eed8aa", "#000000"],
    lightX: 0.89, lightY: 0.46, lightCore: 0.14, lightHalo: 0.2, vignette: 0.38, lightFollow: 0.63,
    bloomThreshold: 0.61, bloomRange: 0.18, bloomStrength: 0.4, grain: 0.005
  };

  var LIGHT_CONSTELLATION = { lineColor: "rgba(60, 100, 160,", dotColor: "rgba(60, 100, 160,", lineOpacity: 0.1, dotOpacity: 0.2, round: true };
  var DARK_CONSTELLATION = { lineColor: "rgba(255, 255, 255,", dotColor: "rgba(255, 255, 255,", lineOpacity: 0.08, dotOpacity: 0.16, round: false };

  var state = { dark: detectDark() };
  function currentAuroraConfig() { return state.dark ? DARK_AURORA : LIGHT_AURORA; }
  function currentConstellation() { return state.dark ? DARK_CONSTELLATION : LIGHT_CONSTELLATION; }


/* ===================================================================== *
 * Border Beam (beam.jakubantalik.com) — ported for DSH composer
 * Copyright (c) Jakub Antalik, MIT — https://github.com/Jakubantalik/Libraries
 * Variant: line / colorful, duration 3.1s, hueRange 13, brightness 1.3
 * ===================================================================== */
  // -- palette data (colorful only, line) — taken from packages/border-beam/src/styles.ts
  var BEAM_ID = "dsh-composer";
  var BEAM_DURATION = 3.875; // 0.8x line (unused)
  var BEAM_HUE_RANGE = 13;
  var BEAM_BRIGHTNESS = 1.3;
  var BEAM_SAT_DARK = 1.2;
  var BEAM_SAT_LIGHT = 1.95;
  // stroke/inner/bloom opacities tuned per Q9: dark 1.14/0.7/0.55, light 0.16/0.32/0.35
  var BEAM_CFG_DARK = { stroke: 1.14, inner: 0.7, bloom: 0.55, innerShadow: "rgba(255, 255, 255, 0.1)" };
  var BEAM_CFG_LIGHT = { stroke: 0.16, inner: 0.32, bloom: 0.35, innerShadow: "rgba(0, 0, 0, 0.14)" };

  var lineColorPalettes = {
    colorful: {
      dark: [
        { color: 'rgb(255, 50, 100)', sizeW: 36, sizeH: 36, offsetX: 0, offsetY: 2 },
        { color: 'rgb(40, 180, 220)', sizeW: 30, sizeH: 32, offsetX: 39, offsetY: 0 },
        { color: 'rgb(50, 200, 80)', sizeW: 33, sizeH: 28, offsetX: -36, offsetY: 2 },
        { color: 'rgb(180, 40, 240)', sizeW: 29, sizeH: 34, offsetX: -54, offsetY: 0 },
        { color: 'rgb(255, 160, 30)', sizeW: 27, sizeH: 30, offsetX: 51, offsetY: -1 },
        { color: 'rgb(100, 70, 255)', sizeW: 36, sizeH: 24, offsetX: 21, offsetY: 1 },
        { color: 'rgb(40, 140, 255)', sizeW: 30, sizeH: 22, offsetX: -21, offsetY: 0 },
        { color: 'rgb(240, 50, 180)', sizeW: 25, sizeH: 28, offsetX: 66, offsetY: 1 },
        { color: 'rgb(30, 185, 170)', sizeW: 23, sizeH: 30, offsetX: -66, offsetY: -1 }
      ],
      light: [
        { color: 'rgb(255, 50, 100)', sizeW: 45, sizeH: 36, offsetX: 0, offsetY: 2 },
        { color: 'rgb(40, 140, 255)', sizeW: 35, sizeH: 32, offsetX: 65, offsetY: 0 },
        { color: 'rgb(50, 200, 80)', sizeW: 40, sizeH: 28, offsetX: -60, offsetY: 2 },
        { color: 'rgb(180, 40, 240)', sizeW: 35, sizeH: 34, offsetX: -90, offsetY: 0 },
        { color: 'rgb(30, 185, 170)', sizeW: 38, sizeH: 30, offsetX: 85, offsetY: -1 },
        { color: 'rgb(100, 70, 255)', sizeW: 50, sizeH: 24, offsetX: 35, offsetY: 1 },
        { color: 'rgb(40, 140, 255)', sizeW: 40, sizeH: 22, offsetX: -35, offsetY: 0 },
        { color: 'rgb(255, 120, 40)', sizeW: 35, sizeH: 28, offsetX: 110, offsetY: 1 },
        { color: 'rgb(240, 50, 180)', sizeW: 30, sizeH: 30, offsetX: -110, offsetY: -1 }
      ]
    }
  };
  var lineInnerGradientData = {
    colorful: [
      { color: 'rgba(255, 50, 100, 0.48)', sizeW: 33, sizeH: 30, offsetX: 0, offsetY: 0 },
      { color: 'rgba(40, 180, 220, 0.42)', sizeW: 24, sizeH: 26, offsetX: 39, offsetY: -3 },
      { color: 'rgba(50, 200, 80, 0.48)', sizeW: 27, sizeH: 24, offsetX: -36, offsetY: 0 },
      { color: 'rgba(180, 40, 240, 0.42)', sizeW: 23, sizeH: 28, offsetX: -54, offsetY: -2 },
      { color: 'rgba(255, 160, 30, 0.50)', sizeW: 24, sizeH: 24, offsetX: 51, offsetY: -1 },
      { color: 'rgba(100, 70, 255, 0.45)', sizeW: 30, sizeH: 20, offsetX: 21, offsetY: 0 },
      { color: 'rgba(40, 140, 255, 0.40)', sizeW: 25, sizeH: 18, offsetX: -21, offsetY: -2 },
      { color: 'rgba(240, 50, 180, 0.45)', sizeW: 21, sizeH: 24, offsetX: 66, offsetY: 0 },
      { color: 'rgba(30, 185, 170, 0.52)', sizeW: 18, sizeH: 26, offsetX: -66, offsetY: -1 }
    ]
  };

  function getLineColorGradients(isDark, id) {
    var pal = lineColorPalettes.colorful[isDark ? 'dark' : 'light'];
    return pal.map(function(c){
      var ox = c.offsetX===0?'':(c.offsetX>0?' + '+c.offsetX+'px':' - '+Math.abs(c.offsetX)+'px');
      var oy = c.offsetY===0?'':(c.offsetY>0?' + '+c.offsetY+'px':' - '+Math.abs(c.offsetY)+'px');
      return 'radial-gradient(ellipse calc('+c.sizeW+'px * var(--beam-w-'+id+')) calc('+c.sizeH+'px * var(--beam-h-'+id+')) at calc(var(--beam-x-'+id+') * 100%'+ox+') calc(100%'+oy+'), '+c.color+', transparent)';
    }).join(',\n       ');
  }
  function getLineInnerGradients(id) {
    var data = lineInnerGradientData.colorful;
    return data.map(function(c){
      var ox = c.offsetX===0?'':(c.offsetX>0?' + '+c.offsetX+'px':' - '+Math.abs(c.offsetX)+'px');
      var oy = c.offsetY===0?'': ' - '+Math.abs(c.offsetY)+'px';
      return 'radial-gradient(ellipse calc('+c.sizeW+'px * var(--beam-w-'+id+')) calc('+c.sizeH+'px * var(--beam-h-'+id+')) at calc(var(--beam-x-'+id+') * 100%'+ox+') calc(100%'+oy+'), '+c.color+', transparent)';
    }).join(',\n    ');
  }
  function getLineBloomGradients(isDark, id) {
    // Simplified bloom: reuse color gradients with blur, matches beam's bloom intent
    // For colorful we reuse the same palette but with bloom opacities handled via outer opacity variable
    var pal = lineColorPalettes.colorful[isDark ? 'dark' : 'light'];
    // Use spike-like thin blooms + central glow - simplified to two radial blooms for performance
    var bloomCore = isDark
      ? 'radial-gradient(ellipse calc(84px * var(--beam-w-'+id+')) calc(110px * var(--beam-h-'+id+')) at calc(var(--beam-x-'+id+') * 100%) 100%, white 0%, rgba(255, 255, 255, 0.5) 35%, transparent 100%)'
      : 'radial-gradient(ellipse calc(84px * var(--beam-w-'+id+')) calc(110px * var(--beam-h-'+id+')) at calc(var(--beam-x-'+id+') * 100%) 100%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 35%, transparent 100%)';
    // We also include the multi-spike color blooms as second layer
    var colorBloom = pal.slice(0,5).map(function(c){
      var ox = c.offsetX===0?'':(c.offsetX>0?' + '+c.offsetX+'px':' - '+Math.abs(c.offsetX)+'px');
      var oy = c.offsetY===0?'':(c.offsetY>0?' + '+c.offsetY+'px':' - '+Math.abs(c.offsetY)+'px');
      return 'radial-gradient(ellipse calc('+Math.round(c.sizeW*0.9)+'px * var(--beam-w-'+id+')) calc('+Math.round(c.sizeH*0.9)+'px * var(--beam-h-'+id+')) at calc(var(--beam-x-'+id+') * 100%'+ox+') calc(100%'+oy+'), '+c.color.replace('rgb','rgba').replace(')', ', 0.35)')+', transparent)';
    }).join(',\n       ');
    // Return simplified but still colorful
    return colorBloom;
  }
  function pausedBeamRule(id){
    return "\n[data-beam=\""+id+"\"][data-paused],\n[data-beam=\""+id+"\"][data-paused]::after,\n[data-beam=\""+id+"\"][data-paused]::before,\n[data-beam=\""+id+"\"][data-paused] [data-beam-bloom] {\n  animation-play-state: paused !important;\n}";
  }
  function buildBeamCSS(id, borderRadius, isDark){
    var cfg = isDark ? BEAM_CFG_DARK : BEAM_CFG_LIGHT;
    var sat = isDark ? BEAM_SAT_DARK : BEAM_SAT_LIGHT;
    var innerRadius = Math.max(0, borderRadius - 1);
    var colorGradients = getLineColorGradients(isDark, id);
    var innerGradients = getLineInnerGradients(id);
    var bloomGradients = getLineBloomGradients(isDark, id);
    var hueAnim = "animation: beam-hue-shift-"+id+" 12s ease-in-out infinite;";
    var hueBloomAnim = "animation: beam-hue-shift-bloom-"+id+" 8s ease-in-out infinite;";
    var __hr = _hueRange;
    var hueKeyframes = "@keyframes beam-hue-shift-"+id+" {\n  0% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) - "+__hr+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n  50% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) + "+__hr+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n  100% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) - "+__hr+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n}\n@keyframes beam-hue-shift-bloom-"+id+" {\n  0% { filter: blur(8px) hue-rotate(calc(var(--beam-hue-base, 0deg) - "+(BEAM_HUE_RANGE+10)+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n  50% { filter: blur(8px) hue-rotate(calc(var(--beam-hue-base, 0deg) + "+(BEAM_HUE_RANGE+10)+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n  100% { filter: blur(8px) hue-rotate(calc(var(--beam-hue-base, 0deg) - "+(BEAM_HUE_RANGE+10)+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n}";

  var BEAM_DURATION = 2.45; // 0.8x (1.96/0.8) // md full border
  var BEAM_HUE_RANGE = 30;
  var BEAM_CFG_DARK = { stroke: 0.26, inner: 0.42, bloom: 0.24, innerShadow: "rgba(255, 255, 255, 0.27)" };
  var BEAM_CFG_LIGHT = { stroke: 0.12, inner: 0.26, bloom: 0.34, innerShadow: "rgba(0, 0, 0, 0.14)" };
  // md palettes
  var colorPalettes = {
    colorful: {
      border: [
        { color: 'rgb(255, 50, 100)', pos: '33% -7.4%', size: '70px 40px' },
        { color: 'rgb(40, 140, 255)', pos: '12% -5%', size: '60px 35px' },
        { color: 'rgb(50, 200, 80)', pos: '2.1% 68.3%', size: '40px 70px' },
        { color: 'rgb(30, 185, 170)', pos: '2.1% 68.3%', size: '20px 35px' },
        { color: 'rgb(100, 70, 255)', pos: '74.4% 100%', size: '180px 32px' },
        { color: 'rgb(40, 140, 255)', pos: '55% 100%', size: '85px 26px' },
        { color: 'rgb(255, 120, 40)', pos: '93.9% 0%', size: '74px 32px' },
        { color: 'rgb(240, 50, 180)', pos: '100% 27.1%', size: '26px 42px' },
        { color: 'rgb(180, 40, 240)', pos: '100% 27.1%', size: '52px 48px' }
      ]
    }
  };
  function getColorGradients(variant, isDark, id){ var _v=variant||'colorful'; var pal=(colorPalettes[_v]||colorPalettes.colorful).border; return pal.map(function(c){ return 'radial-gradient(ellipse '+c.size+' at '+c.pos+', '+c.color+', transparent)'; }).join(',\n    '); }
  function getInnerGradients(variant, isDark, id){ var _v=variant||'colorful';
    var pal=(colorPalettes[_v]||colorPalettes.colorful).border; var baseOpacity = _v==='mono'?0.225:0.45;
    return pal.map(function(c){
      var rgba=c.color.replace('rgb(','rgba(').replace(')',', '+baseOpacity+')');
      var sz=c.size.split(' ').map(function(s){ return Math.round(parseInt(s)*0.9)+'px'; }).join(' ');
      return 'radial-gradient(ellipse '+sz+' at '+c.pos+', '+rgba+', transparent)';
    }).join(',\n    ');
  }
  function getBloomGradients(isDark, id){ return getColorGradients(isDark,id); }
  var _origBuildBeamCSS = buildBeamCSS;
  buildBeamCSS = function(id, borderRadius, isDark, variant){ variant = variant || 'colorful'; var _hueRange = variant==='sunset'?8:(variant==='mono'?0:30);
    var cfg = isDark ? BEAM_CFG_DARK : BEAM_CFG_LIGHT;
    var sat = isDark ? 1.2 : 1.5;
    var innerRadius = Math.max(0, borderRadius - 1);
    var hueAnim = "animation: beam-hue-shift-"+id+" 12s ease-in-out infinite;";
    var hueKeyframes = "@keyframes beam-hue-shift-"+id+" {\n  0% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) - "+BEAM_HUE_RANGE+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n  50% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) + "+BEAM_HUE_RANGE+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n  100% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) - "+BEAM_HUE_RANGE+"deg)) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+"); }\n}";
    var isDarkStr = isDark;
    var whiteGrad = isDark
      ? "conic-gradient(\n        from var(--beam-angle-"+id+"),\n        transparent 0%, transparent 54%,\n        rgba(255, 255, 255, 0.1) 57%,\n        rgba(255, 255, 255, 0.3) 60%,\n        rgba(255, 255, 255, 0.6) 63%,\n        rgba(255, 255, 255, 0.75) 66%,\n        rgba(255, 255, 255, 0.6) 69%,\n        rgba(255, 255, 255, 0.3) 72%,\n        rgba(255, 255, 255, 0.1) 75%,\n        transparent 78%, transparent 100%\n      )"
      : "conic-gradient(\n        from var(--beam-angle-"+id+"),\n        transparent 0%, transparent 54%,\n        rgba(0, 0, 0, 0.08) 57%,\n        rgba(0, 0, 0, 0.2) 60%,\n        rgba(0, 0, 0, 0.4) 63%,\n        rgba(0, 0, 0, 0.55) 66%,\n        rgba(0, 0, 0, 0.4) 69%,\n        rgba(0, 0, 0, 0.2) 72%,\n        rgba(0, 0, 0, 0.08) 75%,\n        transparent 78%, transparent 100%\n      )";
    var colorGrads = getColorGradients(variant, isDark, id);
    var innerGrads = getInnerGradients(variant, isDark, id);
    var bloomGrad = isDark
      ? "conic-gradient(\n        from var(--beam-angle-"+id+"),\n        transparent 0%, transparent 58%,\n        rgba(255, 255, 255, 0.03) 62%,\n        rgba(255, 255, 255, 0.08) 65%,\n        rgba(255, 255, 255, 0.2) 67%,\n        rgba(255, 255, 255, 0.45) 69%,\n        rgba(255, 255, 255, 0.85) 70%,\n        rgba(255, 255, 255, 0.85) 70.5%,\n        rgba(255, 255, 255, 0.45) 71.5%,\n        rgba(255, 255, 255, 0.2) 73%,\n        rgba(255, 255, 255, 0.08) 75%,\n        rgba(255, 255, 255, 0.03) 78%,\n        transparent 82%\n      )"
      : "conic-gradient(\n        from var(--beam-angle-"+id+"),\n        transparent 0%, transparent 58%,\n        rgba(0, 0, 0, 0.02) 62%,\n        rgba(0, 0, 0, 0.08) 65%,\n        rgba(0, 0, 0, 0.2) 67%,\n        rgba(0, 0, 0, 0.4) 69%,\n        rgba(0, 0, 0, 0.6) 70%,\n        rgba(0, 0, 0, 0.6) 70.5%,\n        rgba(0, 0, 0, 0.4) 71.5%,\n        rgba(0, 0, 0, 0.2) 73%,\n        rgba(0, 0, 0, 0.08) 75%,\n        rgba(0, 0, 0, 0.02) 78%,\n        transparent 82%\n      )";
    // For md, BEAM_DURATION is 1.96, and uses --beam-angle
    return "@property --beam-angle-"+id+" {\n  syntax: \"<angle>\";\n  initial-value: 0deg;\n  inherits: true;\n}\n@property --beam-opacity-"+id+" {\n  syntax: \"<number>\";\n  initial-value: 0;\n  inherits: true;\n}\n[data-beam=\""+id+"\"] {\n  position: relative;\n  border-radius: "+borderRadius+"px;\n  overflow: visible;\n  isolation: isolate;\n}\n[data-beam=\""+id+"\"][data-active] {\n  animation:\n    beam-spin-"+id+" "+BEAM_DURATION+"s linear infinite,\n    beam-fade-in-"+id+" 0.6s ease forwards;\n}\n[data-beam=\""+id+"\"][data-fading] {\n  animation:\n    beam-spin-"+id+" "+BEAM_DURATION+"s linear infinite,\n    beam-fade-out-"+id+" 0.5s ease forwards;\n}\n[data-beam=\""+id+"\"][data-active]::after,\n[data-beam=\""+id+"\"][data-fading]::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: "+innerRadius+"px;\n  padding: 1px;\n  clip-path: inset(0 round "+borderRadius+"px);\n  background: "+whiteGrad+",\n    "+colorGrads+";\n  -webkit-mask:\n    conic-gradient(\n      from var(--beam-angle-"+id+"),\n      transparent 0%, transparent 30%,\n      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n      white 52%, white 80%,\n      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n      transparent 95%, transparent 100%\n    ),\n    linear-gradient(#fff 0 0) content-box,\n    linear-gradient(#fff 0 0);\n  -webkit-mask-composite: source-in, xor;\n  mask:\n    conic-gradient(\n      from var(--beam-angle-"+id+"),\n      transparent 0%, transparent 30%,\n      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n      white 52%, white 80%,\n      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n      transparent 95%, transparent 100%\n    ),\n    linear-gradient(#fff 0 0) content-box,\n    linear-gradient(#fff 0 0);\n  mask-composite: intersect, exclude;\n  pointer-events: none;\n  z-index: 2;\n  opacity: calc(var(--beam-opacity-"+id+") * "+cfg.stroke.toFixed(2)+" * var(--beam-stroke-opacity, 1) * var(--beam-strength, 1));\n  "+hueAnim+"\n}\n[data-beam=\""+id+"\"][data-active]::before,\n[data-beam=\""+id+"\"][data-fading]::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: "+borderRadius+"px;\n  background: "+innerGrads+";\n  box-shadow: inset 0 0 9px 1px "+cfg.innerShadow+";\n  -webkit-mask-image:\n    conic-gradient(\n      from var(--beam-angle-"+id+"),\n      transparent 0%, transparent 30%,\n      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n      white 52%, white 80%,\n      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n      transparent 95%, transparent 100%\n    ),\n    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),\n    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);\n  -webkit-mask-composite: source-in, source-over;\n  mask-image:\n    conic-gradient(\n      from var(--beam-angle-"+id+"),\n      transparent 0%, transparent 30%,\n      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n      white 52%, white 80%,\n      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n      transparent 95%, transparent 100%\n    ),\n    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),\n    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);\n  mask-composite: intersect, add;\n  pointer-events: none;\n  z-index: 1;\n  opacity: calc(var(--beam-opacity-"+id+") * "+cfg.inner.toFixed(2)+" * var(--beam-inner-opacity, 1) * var(--beam-strength, 1));\n  clip-path: inset(0 round "+borderRadius+"px);\n  "+hueAnim+"\n}\n[data-beam=\""+id+"\"] [data-beam-bloom] {\n  display: none;\n  position: absolute;\n  inset: 0;\n  border-radius: "+innerRadius+"px;\n  clip-path: inset(0 round "+borderRadius+"px);\n  background: "+bloomGrad+";\n  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n  -webkit-mask-composite: xor;\n  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n  mask-composite: exclude;\n  padding: 1px;\n  filter: blur(8px) brightness("+BEAM_BRIGHTNESS.toFixed(2)+") saturate("+sat.toFixed(2)+");\n  pointer-events: none;\n  z-index: 3;\n  opacity: 0;\n}\n[data-beam=\""+id+"\"][data-active] [data-beam-bloom],\n[data-beam=\""+id+"\"][data-fading] [data-beam-bloom] {\n  display: block;\n  opacity: calc(var(--beam-opacity-"+id+") * "+cfg.bloom.toFixed(2)+" * var(--beam-bloom-opacity, 1) * var(--beam-strength, 1));\n}\n@keyframes beam-spin-"+id+" {\n  to { --beam-angle-"+id+": 360deg; }\n}\n@keyframes beam-fade-in-"+id+" {\n  to { --beam-opacity-"+id+": 1; }\n}\n@keyframes beam-fade-out-"+id+" {\n  from { --beam-opacity-"+id+": 1; }\n  to { --beam-opacity-"+id+": 0; }\n}\n"+hueKeyframes+"\n@media (prefers-reduced-motion: reduce) {\n  [data-beam=\""+id+"\"][data-active],\n  [data-beam=\""+id+"\"][data-fading],\n  [data-beam=\""+id+"\"][data-active]::after,\n  [data-beam=\""+id+"\"][data-fading]::after,\n  [data-beam=\""+id+"\"][data-active]::before,\n  [data-beam=\""+id+"\"][data-fading]::before,\n  [data-beam=\""+id+"\"][data-active] [data-beam-bloom],\n  [data-beam=\""+id+"\"][data-fading] [data-beam-bloom] {\n    animation: none !important;\n  }\n}";
  };
    var whiteHighlight = isDark
      ? "radial-gradient(\n        ellipse calc(24px * var(--beam-w-"+id+")) calc(28px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) calc(100% + 2px),\n        rgba(255, 255, 255, 0.38) 0%,\n        rgba(255, 255, 255, 0.12) 30%,\n        transparent 65%\n      )"
      : "radial-gradient(\n        ellipse calc(35px * var(--beam-w-"+id+")) calc(28px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) calc(100% + 2px),\n        rgba(0, 0, 0, 0.6) 0%,\n        rgba(0, 0, 0, 0.25) 35%,\n        transparent 70%\n      )";
    return "@property --beam-x-"+id+" {\n  syntax: \"<number>\";\n  initial-value: 0;\n  inherits: true;\n}\n@property --beam-w-"+id+" { syntax: \"<number>\"; initial-value: 1; inherits: true;}\n@property --beam-h-"+id+" { syntax: \"<number>\"; initial-value: 1; inherits: true;}\n@property --beam-spike-"+id+" { syntax: \"<number>\"; initial-value: 1; inherits: true;}\n@property --beam-spike2-"+id+" { syntax: \"<number>\"; initial-value: 1; inherits: true;}\n@property --beam-edge-"+id+" { syntax: \"<number>\"; initial-value: 1; inherits: true;}\n@property --beam-opacity-"+id+" { syntax: \"<number>\"; initial-value: 0; inherits: true;}\n[data-beam=\""+id+"\"] {\n  position: relative;\n  border-radius: "+borderRadius+"px;\n  overflow: visible;\n  isolation: isolate;\n}\n[data-beam=\""+id+"\"][data-active] {\n  animation:\n    beam-travel-"+id+" "+BEAM_DURATION+"s linear infinite,\n    beam-edge-fade-"+id+" "+BEAM_DURATION+"s linear infinite,\n    beam-breathe-"+id+" "+(BEAM_DURATION*1.3).toFixed(1)+"s ease-in-out infinite,\n    beam-spike-"+id+" "+(BEAM_DURATION*1.33).toFixed(1)+"s ease-in-out infinite,\n    beam-spike2-"+id+" "+(BEAM_DURATION*1.7).toFixed(1)+"s ease-in-out infinite,\n    beam-fade-in-"+id+" 0.6s ease forwards;\n}\n[data-beam=\""+id+"\"][data-fading] {\n  animation:\n    beam-travel-"+id+" "+BEAM_DURATION+"s linear infinite,\n    beam-edge-fade-"+id+" "+BEAM_DURATION+"s linear infinite,\n    beam-breathe-"+id+" "+(BEAM_DURATION*1.3).toFixed(1)+"s ease-in-out infinite,\n    beam-spike-"+id+" "+(BEAM_DURATION*1.33).toFixed(1)+"s ease-in-out infinite,\n    beam-spike2-"+id+" "+(BEAM_DURATION*1.7).toFixed(1)+"s ease-in-out infinite,\n    beam-fade-out-"+id+" 0.5s ease forwards;\n}\n[data-beam=\""+id+"\"][data-active]::after,\n[data-beam=\""+id+"\"][data-fading]::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: "+innerRadius+"px;\n  padding: 1px;\n  clip-path: inset(0 round "+borderRadius+"px);\n  background: "+whiteHighlight+", "+colorGradients+";\n  -webkit-mask:\n    radial-gradient(\n      ellipse calc(78px * var(--beam-w-"+id+")) calc(60px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) 100%,\n      white 0%, rgba(255, 255, 255, 0.5) 45%, transparent 100%\n    ),\n    linear-gradient(#fff 0 0) content-box,\n    linear-gradient(#fff 0 0);\n  -webkit-mask-composite: source-in, xor;\n  mask:\n    radial-gradient(\n      ellipse calc(78px * var(--beam-w-"+id+")) calc(60px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) 100%,\n      white 0%, rgba(255, 255, 255, 0.5) 45%, transparent 100%\n    ),\n    linear-gradient(#fff 0 0) content-box,\n    linear-gradient(#fff 0 0);\n  mask-composite: intersect, exclude;\n  pointer-events: none;\n  z-index: 2;\n  opacity: calc(var(--beam-opacity-"+id+") * var(--beam-edge-"+id+") * "+cfg.stroke.toFixed(2)+" * var(--beam-stroke-opacity, 1) * var(--beam-strength, 1));\n  "+hueAnim+"\n}\n[data-beam=\""+id+"\"][data-active]::before,\n[data-beam=\""+id+"\"][data-fading]::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: "+borderRadius+"px;\n  background: "+innerGradients+";\n  box-shadow: inset 0 0 9px 1px "+cfg.innerShadow+";\n  -webkit-mask-image:\n    radial-gradient(\n      ellipse calc(78px * var(--beam-w-"+id+")) calc(60px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) 100%,\n      white 0%, rgba(255, 255, 255, 0.5) 45%, transparent 100%\n    ),\n    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),\n    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);\n  -webkit-mask-composite: source-in, source-over;\n  mask-image:\n    radial-gradient(\n      ellipse calc(78px * var(--beam-w-"+id+")) calc(60px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) 100%,\n      white 0%, rgba(255, 255, 255, 0.5) 45%, transparent 100%\n    ),\n    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),\n    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);\n  mask-composite: intersect, add;\n  pointer-events: none;\n  z-index: 1;\n  opacity: calc(var(--beam-opacity-"+id+") * var(--beam-edge-"+id+") * "+cfg.inner.toFixed(2)+" * var(--beam-inner-opacity, 1) * var(--beam-strength, 1));\n  clip-path: inset(0 round "+borderRadius+"px);\n  "+hueAnim+"\n}\n[data-beam=\""+id+"\"] [data-beam-bloom] {\n  display: none;\n  position: absolute;\n  inset: 0;\n  border-radius: "+innerRadius+"px;\n  clip-path: inset(0 round "+borderRadius+"px);\n  padding: 0;\n  -webkit-mask: radial-gradient(\n    ellipse calc(84px * var(--beam-w-"+id+")) calc(110px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) 100%,\n    white 0%, rgba(255, 255, 255, 0.5) 35%, transparent 100%\n  );\n  -webkit-mask-composite: source-over;\n  mask: radial-gradient(\n    ellipse calc(84px * var(--beam-w-"+id+")) calc(110px * var(--beam-h-"+id+")) at calc(var(--beam-x-"+id+") * 100%) 100%,\n    white 0%, rgba(255, 255, 255, 0.5) 35%, transparent 100%\n  );\n  mask-composite: add;\n  background: "+bloomGradients+";\n  pointer-events: none;\n  z-index: 3;\n  opacity: 0;\n}\n[data-beam=\""+id+"\"][data-active] [data-beam-bloom],\n[data-beam=\""+id+"\"][data-fading] [data-beam-bloom] {\n  display: block;\n  opacity: calc(var(--beam-opacity-"+id+") * var(--beam-edge-"+id+") * "+cfg.bloom.toFixed(2)+" * var(--beam-bloom-opacity, 1) * var(--beam-strength, 1));\n  "+hueBloomAnim+"\n}\n@keyframes beam-travel-"+id+" {\n  0%   { --beam-x-"+id+": 0.06;  --beam-w-"+id+": 0.5; }\n  10%  { --beam-x-"+id+": 0.15;  --beam-w-"+id+": 0.8; }\n  20%  { --beam-x-"+id+": 0.25;  --beam-w-"+id+": 1.1; }\n  30%  { --beam-x-"+id+": 0.35;  --beam-w-"+id+": 1.3; }\n  40%  { --beam-x-"+id+": 0.44;  --beam-w-"+id+": 1.45; }\n  50%  { --beam-x-"+id+": 0.5;   --beam-w-"+id+": 1.5; }\n  60%  { --beam-x-"+id+": 0.56;  --beam-w-"+id+": 1.45; }\n  70%  { --beam-x-"+id+": 0.65;  --beam-w-"+id+": 1.3; }\n  80%  { --beam-x-"+id+": 0.75;  --beam-w-"+id+": 1.1; }\n  90%  { --beam-x-"+id+": 0.85;  --beam-w-"+id+": 0.8; }\n  100% { --beam-x-"+id+": 0.94;  --beam-w-"+id+": 0.5; }\n}\n@keyframes beam-edge-fade-"+id+" {\n  0%    { --beam-edge-"+id+": 0; }\n  12.5% { --beam-edge-"+id+": 0; }\n  32.5% { --beam-edge-"+id+": 1; }\n  67.5% { --beam-edge-"+id+": 1; }\n  87.5% { --beam-edge-"+id+": 0; }\n  100%  { --beam-edge-"+id+": 0; }\n}\n@keyframes beam-breathe-"+id+" {\n  0%, 100% { --beam-h-"+id+": 0.8; }\n  25%      { --beam-h-"+id+": 1.25; }\n  55%      { --beam-h-"+id+": 0.85; }\n  80%      { --beam-h-"+id+": 1.3; }\n}\n@keyframes beam-spike-"+id+" {\n  0%   { --beam-spike-"+id+": 0.8; }\n  25%  { --beam-spike-"+id+": 1.3; }\n  50%  { --beam-spike-"+id+": 0.9; }\n  75%  { --beam-spike-"+id+": 1.4; }\n  100% { --beam-spike-"+id+": 0.8; }\n}\n@keyframes beam-spike2-"+id+" {\n  0%   { --beam-spike2-"+id+": 1.2; }\n  25%  { --beam-spike2-"+id+": 0.7; }\n  50%  { --beam-spike2-"+id+": 1.4; }\n  75%  { --beam-spike2-"+id+": 0.8; }\n  100% { --beam-spike2-"+id+": 1.2; }\n}\n@keyframes beam-fade-in-"+id+" {\n  to { --beam-opacity-"+id+": 1; }\n}\n@keyframes beam-fade-out-"+id+" {\n  from { --beam-opacity-"+id+": 1; }\n  to { --beam-opacity-"+id+": 0; }\n}\n"+hueKeyframes+"\n"+pausedBeamRule(id)+"\n@media (prefers-reduced-motion: reduce) {\n  [data-beam=\""+id+"\"][data-active],\n  [data-beam=\""+id+"\"][data-fading],\n  [data-beam=\""+id+"\"][data-active]::after,\n  [data-beam=\""+id+"\"][data-fading]::after,\n  [data-beam=\""+id+"\"][data-active]::before,\n  [data-beam=\""+id+"\"][data-fading]::before,\n  [data-beam=\""+id+"\"][data-active] [data-beam-bloom],\n  [data-beam=\""+id+"\"][data-fading] [data-beam-bloom] {\n    animation: none !important;\n  }\n}";
  }


  /* ------------------------------------------------------------------ *
   * DOM 骨架
   * ------------------------------------------------------------------ */
  var container = document.createElement("div");
  container.id = "dsh-ds-bg";
  container.dataset.version = "24"; // 部署版本标记：页面控制台可查 document.getElementById('dsh-ds-bg')?.dataset.version
  // 关键样式内联兜底：即使外部 CSS 未加载，背景层也保持 fixed + 底层
  container.style.cssText = "position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;" +
    "background:linear-gradient(180deg,#9cc1e7 0%,rgba(250,250,250,0) 100%),#f9f8f8;" +
    "animation:dsh-ds-enter 1.8s ease-out backwards;will-change:opacity,filter;";
  var MASK = "linear-gradient(#000000fc 0%,#000000e8 8.98%,transparent 100%)";
  var auroraCanvas = document.createElement("canvas");
  auroraCanvas.id = "dsh-ds-aurora";
  auroraCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;" +
    "mask:" + MASK + ";-webkit-mask:" + MASK + ";";
  var constellationCanvas = document.createElement("canvas");
  constellationCanvas.id = "dsh-ds-constellation";
  constellationCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;background:transparent;" +
    "mask:" + MASK + ";-webkit-mask:" + MASK + ";";
  container.appendChild(auroraCanvas);
  // 官方 hero 鲸鱼层（仅暗色主题显示）：粒子化鲸鱼，光线跟随鼠标互动
  // （官网用 R3F DigitileR3F 懒加载实现，未被缓存抓取；此处用官方鲸鱼路径
  //   重建粒子引擎，交互原理一致：lightParams 的 followX/range/shadeMin/shadeMax）
  var whaleLayer = document.createElement("div");
  whaleLayer.className = "dsh-ds-whale";
  whaleLayer.setAttribute("aria-hidden", "true");
  whaleLayer.style.cssText = "position:absolute;inset:0;display:none;align-items:center;justify-content:center;" +
    "pointer-events:none;mix-blend-mode:screen;z-index:2;";
  var whaleCanvas = document.createElement("canvas");
  whaleCanvas.className = "dsh-ds-whale-canvas";
  whaleCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
  whaleLayer.appendChild(whaleCanvas);
  container.appendChild(whaleLayer);
  container.appendChild(constellationCanvas);

  /* 诊断信息（?dshtest=1 时输出到页面面板） */
  var diag = { theme: "?", bodyBg: "?", htmlBg: "?", containerPos: "?", containerZ: "?", containerBg: "?", frameFound: false, frameBg: "?", auroraGL: false, auroraProgs: "", constellation: false, canvasW: 0, canvasH: 0 };

  function applyThemeClass() {
    container.classList.toggle("dsh-ds-dark", state.dark);
    // 内联兜底：暗色时容器底色也一并切换；鲸鱼仅暗色显示（官网深色 hero 元素）
    container.style.setProperty("background", state.dark ? "#0a0a0a" :
      "linear-gradient(180deg,#9cc1e7 0%,rgba(250,250,250,0) 100%),#f9f8f8", "important");
    whaleLayer.style.display = state.dark ? "flex" : "none";
    // 深色主题：body 透明让背景透出；浅色主题：移除覆盖，恢复官方原版
    if (document.body) {
      if (state.dark) document.body.style.setProperty("background", "transparent", "important");
      else document.body.style.removeProperty("background");
    }
  }
  applyThemeClass();

  function boot() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", boot); return; }
    // body 背景透明化由 applyThemeClass 按主题管理（浅色主题保持官方原版）
    applyThemeClass();
    document.body.appendChild(container);
    startAurora();
    if (typeof location === "undefined" || location.search.indexOf("nowhale") === -1) startWhale();
    if (!coarse || reducedMotion) startConstellation();
    observeTheme();
    makeShellTransparent();
    try{ watchBeamComposer(); }catch(e){}
    if (typeof location !== "undefined" && (location.search.indexOf("dshtest") !== -1)) startDiagPanel();
    // 调试钩子：?opencv=1 时展开侧边栏并打开第一个会话（检查真实消息 DOM 的代码块类名）
    if (typeof location !== "undefined" && location.search.indexOf("opencv") !== -1) {
      setTimeout(function () {
        var toggle = document.querySelector(".hHd-Xa_toggle, [aria-label*=\"sidebar\"], [aria-label*=\"侧边栏\"]");
        if (toggle) toggle.click();
        setTimeout(function () {
          var first = document.querySelector('.qDHVXG_listArea [role="button"], .qDHVXG_listArea button, [data-slot="sidebar.workspaces"] [role="button"]');
          if (first) first.click();
          setTimeout(function () {
            var codes = document.querySelectorAll("pre, [class*=\"_block_\"], [class*=\"_banner\"], [class*=\"_body\"], code");
            var dump = document.createElement("div");
            dump.id = "dsh-dbg-codes";
            dump.style.display = "none";
            var cls = [];
            for (var i = 0; i < codes.length; i++) {
              var c = codes[i].className;
              if (typeof c === "string" && c) cls.push(c.split(" ")[0]);
            }
            dump.setAttribute("data-classes", cls.join(","));
            document.body.appendChild(dump);
          }, 3000);
        }, 2500);
      }, 3500);
    }
    // 调试钩子：?opendbg=1 时自动打开设置页（用于无头浏览器检查设置页布局）
    if (typeof location !== "undefined" && location.search.indexOf("opendbg") !== -1) {
      setTimeout(function () {
        var triggers = document.querySelectorAll('button, [role="button"]');
        for (var i = 0; i < triggers.length; i++) {
          var t = triggers[i];
          var label = (t.getAttribute("aria-label") || t.textContent || "").toLowerCase();
          if (label.indexOf("settings") !== -1 || label.indexOf("设置") !== -1) { t.click(); break; }
        }
        setTimeout(function () {
          var panel = document.querySelector(".VOzbGW_panel");
          var dump = document.createElement("div");
          dump.id = "dsh-dbg-settings";
          dump.style.display = "none";
          dump.setAttribute("data-opened", panel ? "yes" : "no");
          if (panel) dump.setAttribute("data-html", panel.outerHTML.slice(0, 20000));
          document.body.appendChild(dump);
        }, 2500);
      }, 4000);
    }
  }

  /* ------------------------------------------------------------------ *
   * 诊断面板（?dshtest=1）：把计算样式与引擎状态渲染到页面
   * ------------------------------------------------------------------ */
  function startDiagPanel() {
    function collect() {
      var cs = function (el) { try { return window.getComputedStyle(el); } catch (e) { return null; } };
      var bcs = cs(document.body);
      var hcs = cs(document.documentElement);
      var ccs = cs(container);
      var frame = document.querySelector('[data-slot="root"] .pI_x6G_frame') ||
        document.querySelector('[data-slot="root"] > div');
      var fcs = frame ? cs(frame) : null;
      diag.theme = state.dark ? "dark" : "light";
      diag.bodyBg = bcs ? bcs.backgroundColor : "?";
      diag.htmlBg = hcs ? hcs.backgroundColor : "?";
      diag.containerPos = ccs ? ccs.position : "?";
      diag.containerZ = ccs ? ccs.zIndex : "?";
      diag.containerBg = ccs ? (ccs.backgroundImage + " / " + ccs.backgroundColor) : "?";
      diag.frameFound = !!frame;
      diag.frameBg = fcs ? fcs.backgroundColor : "?";
      diag.canvasW = auroraCanvas.width;
      diag.canvasH = auroraCanvas.height;
    }
    collect();
    var panel = document.createElement("pre");
    panel.id = "dsh-ds-diag";
    panel.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483000;background:#fff;color:#000;" +
      "font:11px/1.5 monospace;padding:10px 12px;border:2px solid #f00;max-width:520px;white-space:pre-wrap;";
    document.body.appendChild(panel);
    function render() {
      collect();
      panel.textContent = [
        "dsh-deepseek-bg v3 diagnostics",
        "theme: " + diag.theme,
        "body bg: " + diag.bodyBg,
        "html bg: " + diag.htmlBg,
        "container: pos=" + diag.containerPos + " z=" + diag.containerZ + " bg=" + diag.containerBg,
        "frame found: " + diag.frameFound + " bg=" + diag.frameBg,
        "aurora: gl=" + diag.auroraGL + " progs=[" + diag.auroraProgs + "]",
        "constellation: " + diag.constellation,
        "canvas: " + diag.canvasW + "x" + diag.canvasH
      ].join("\n");
    }
    render();
    setInterval(render, 1000);
  }

  /* ------------------------------------------------------------------ *
   * 外壳透明化（内联样式，最强优先级；轮询等待应用外壳挂载）
   * ------------------------------------------------------------------ */
  function makeShellTransparent() {
    // 深色主题要设置/撤销的内联样式属性集合
    var GLASS_PROPS = ["background", "background-color", "backdrop-filter", "-webkit-backdrop-filter",
      "box-shadow", "border-right-color", "border-color"];
    function clearInline(el) {
      if (!el || !el.style) return;
      for (var i = 0; i < GLASS_PROPS.length; i++) el.style.removeProperty(GLASS_PROPS[i]);
    }
    function apply() {
      if (!state.dark) {
        // 浅色主题：撤销所有覆盖，恢复官方原版
        var frame0 = document.querySelector('[data-slot="root"] .pI_x6G_frame') ||
          document.querySelector('[data-slot="root"] > div');
        clearInline(frame0);
        clearInline(document.querySelector("#root ._boot_9gj4p_6"));
        var views0 = document.querySelectorAll('[data-slot="conversation"] > div, .pI_x6G_detailsCol > div');
        for (var i0 = 0; i0 < views0.length; i0++) clearInline(views0[i0]);
        clearInline(document.querySelector(".pI_x6G_sidebarCol"));
        clearInline(document.querySelector(".hHd-Xa_root, [data-slot=\"sidebar\"] > div"));
        clearInline(document.querySelector(".uV2eYG_card, [data-composer-card=\"true\"]"));
        clearInline(document.querySelector(".wSkVaW_composerSeat, [data-composer-seat]"));
        clearInline(document.querySelector(".qDHVXG_fade"));
        var glassEls0 = document.querySelectorAll(".gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, [class$=\"_bubble\"], [class*=\"_block_\"], [class$=\"_bannerWrap\"], [class$=\"_copyButton\"]");
        for (var g0 = 0; g0 < glassEls0.length; g0++) clearInline(glassEls0[g0]);
        return;
      }
      var frame = document.querySelector('[data-slot="root"] .pI_x6G_frame') ||
        document.querySelector('[data-slot="root"] > div');
      if (frame && frame.style) {
        diag.frameFound = true;
        diag.frameBg = window.getComputedStyle ? window.getComputedStyle(frame).backgroundColor : "?";
        frame.style.setProperty("background", "transparent", "important");
      }
      var bootEl = document.querySelector("#root ._boot_9gj4p_6");
      if (bootEl && bootEl.style) {
        bootEl.style.setProperty("background", "transparent", "important");
      }
      // 视图根容器（会话视图等全高不透明层）同样透明化
      var views = document.querySelectorAll('[data-slot="conversation"] > div, .pI_x6G_detailsCol > div');
      for (var i = 0; i < views.length; i++) {
        var v = views[i];
        if (v && v.style) v.style.setProperty("background", "transparent", "important");
      }
      // 官方玻璃拟态（ds-glass 令牌：blur 12px + 深色半透明表面色 + 官方边框/阴影）
      var glassBg = "rgba(13,15,19,.55)";
      var glassBorder = "hsla(0,0%,100%,.08)";
      var glassShadow = "0 0 1px 0 rgba(0,0,0,.2), 0 0 4px 0 rgba(0,0,0,.02), 0 12px 32px 0 rgba(0,0,0,.08)";
      var side = document.querySelector(".pI_x6G_sidebarCol");
      if (side && side.style) {
        // 注意：backdrop-filter 会让侧边栏成为 fixed 后代的包含块（设置弹窗错乱），
        // 所以列本身不设 backdrop-filter，模糊由 CSS 的 ::before 伪元素承担
        side.style.setProperty("background", glassBg, "important");
        side.style.setProperty("border-right-color", glassBorder, "important");
      }
      var sideRoot = document.querySelector(".hHd-Xa_root, [data-slot=\"sidebar\"] > div");
      if (sideRoot && sideRoot.style) {
        // 注意：不能给侧边栏内容根加 z-index/堆叠上下文——设置弹窗（fixed z-1000）
        // 挂载在侧边栏内部，被困在侧边栏堆叠上下文里会被输入框（z-7）盖住；
        // 模糊由 CSS 的 ::before z-index:-1 承担，内容自然在模糊层之上
        sideRoot.style.setProperty("background", "transparent", "important");
      }
      var card = document.querySelector(".uV2eYG_card, [data-composer-card=\"true\"]");
      if (card && card.style) {
        card.style.setProperty("background", glassBg, "important");
        card.style.setProperty("backdrop-filter", "blur(12px)", "important");
        card.style.setProperty("-webkit-backdrop-filter", "blur(12px)", "important");
        card.style.setProperty("border-color", glassBorder, "important");
        card.style.setProperty("box-shadow", glassShadow, "important");
      }
      var seat = document.querySelector(".wSkVaW_composerSeat, [data-composer-seat]");
      if (seat && seat.style) seat.style.setProperty("background", "transparent", "important");
      // 会话列表底部渐隐条（qDHVXG_fade）：玻璃侧边栏下会露出浅色白条，透明化
      var fade = document.querySelector(".qDHVXG_fade");
      if (fade && fade.style) fade.style.setProperty("background", "transparent", "important");
      // 消息气泡与代码块玻璃化（与侧边栏/输入框同款材质）
      var glassRing = "inset 0 0 0 1px hsla(0,0%,100%,.08)";
      var glassEls = document.querySelectorAll(".gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, [class$=\"_bubble\"], [class*=\"_block_\"], [class$=\"_bannerWrap\"], [class$=\"_copyButton\"]");
      for (var gi = 0; gi < glassEls.length; gi++) {
        var ge = glassEls[gi];
        if (ge && ge.style) {
          ge.style.setProperty("background", glassBg, "important");
          ge.style.setProperty("backdrop-filter", "blur(12px)", "important");
          ge.style.setProperty("-webkit-backdrop-filter", "blur(12px)", "important");
          ge.style.setProperty("box-shadow", glassRing, "important");
        }
      }
    }
    apply();
    var tries = 0;
    var timer = setInterval(function () {
      apply();
      if (++tries > 75) clearInterval(timer); // 最多约 60s
    }, 800);
    if (window.MutationObserver) {
      var mo = new MutationObserver(apply);
      var rootEl = document.querySelector("#root") || document.documentElement;
      mo.observe(rootEl, { childList: true, subtree: true });
    }
  }


  /* ------------------------------------------------------------------ *
   * Border Beam — composer integration (D S H)
   * ------------------------------------------------------------------ */
  var beamStyleTag = null;
  var beamAttachedCard = null;
  var beamResizeObs = null;
  var beamMutObs = null;
  var beamPulseTimer = null;
  var pendingExecuting = false;
  var pendingTimer = null;
  var beamPollTimer = null;
  var beamTypingHandler = null;
  var typingActive = false;
  var typingTimer = null;
  var beamState = { mode: 'hairline', idleStrength: 0.65, focusStrength: 1.0, disabled: false };
  // Ensure proper palettes for mono/sunset (use original warm/grey palettes, not random)
  if (typeof colorPalettes !== 'undefined' && !colorPalettes.mono) {
    // Proper palettes from border-beam styles.ts
    colorPalettes.mono = { border: [
      { color: 'rgb(180, 180, 180)', pos: '33% -7.4%', size: '70px 40px' },
      { color: 'rgb(140, 140, 140)', pos: '12% -5%', size: '60px 35px' },
      { color: 'rgb(160, 160, 160)', pos: '2.1% 68.3%', size: '40px 70px' },
      { color: 'rgb(130, 130, 130)', pos: '2.1% 68.3%', size: '20px 35px' },
      { color: 'rgb(170, 170, 170)', pos: '74.4% 100%', size: '180px 32px' },
      { color: 'rgb(150, 150, 150)', pos: '55% 100%', size: '85px 26px' },
      { color: 'rgb(190, 190, 190)', pos: '93.9% 0%', size: '74px 32px' },
      { color: 'rgb(145, 145, 145)', pos: '100% 27.1%', size: '26px 42px' },
      { color: 'rgb(165, 165, 165)', pos: '100% 27.1%', size: '52px 48px' }
    ] };
    colorPalettes.sunset = { border: [
      { color: 'rgb(255, 80, 50)', pos: '33% -7.4%', size: '70px 40px' },
      { color: 'rgb(255, 160, 40)', pos: '12% -5%', size: '60px 35px' },
      { color: 'rgb(255, 120, 60)', pos: '2.1% 68.3%', size: '40px 70px' },
      { color: 'rgb(255, 200, 50)', pos: '2.1% 68.3%', size: '20px 35px' },
      { color: 'rgb(255, 100, 80)', pos: '74.4% 100%', size: '180px 32px' },
      { color: 'rgb(255, 180, 60)', pos: '55% 100%', size: '85px 26px' },
      { color: 'rgb(255, 60, 60)', pos: '93.9% 0%', size: '74px 32px' },
      { color: 'rgb(255, 140, 50)', pos: '100% 27.1%', size: '26px 42px' },
      { color: 'rgb(255, 90, 70)', pos: '100% 27.1%', size: '52px 48px' }
    ] };
    // Keep old fallback for ocean if needed
  }
  if (false) {
    // fallback minimal mono/sunset for md if not present (use greys / warm)

  }

  function isBeamDisabled() {
    try {
      if (typeof location !== "undefined" && (location.search.indexOf("beam=0") !== -1 || location.search.indexOf("nobeam") !== -1 || location.search.indexOf("beam=false") !== -1)) return true;
      if (typeof localStorage !== "undefined" && localStorage.getItem("dsh-beam-disabled") === "1") return true;
    } catch(e) {}
    return false;
  }
  function getBeamThemeIsDark() { return state.dark; }
  function getBeamIdleStrength() { return getBeamThemeIsDark() ? 0.65 : 0.5; }
  function resolveBorderRadius(el) {
    try {
      var cs = window.getComputedStyle(el);
      var v = parseFloat(cs.borderTopLeftRadius);
      if (!isNaN(v) && v > 0) return Math.round(v);
    } catch(e) {}
    return 16;
  }
  var typingExtraCSS = `\n  /* Typing inward shrink vibration */\n  [data-beam="dsh-composer"][data-typing][data-active]::after,\n  [data-beam="dsh-composer"][data-typing][data-active]::before,\n  [data-beam="dsh-composer"][data-typing][data-active] [data-beam-bloom] {\n    animation: beam-typing-shrink 1.1s ease-in-out infinite, beam-spin-dsh-composer 2.45s linear infinite, beam-hue-shift-dsh-composer 12s ease-in-out infinite !important;\n  }\n  @keyframes beam-typing-shrink {\n    0%, 100% { transform: scale(1); }\n    50% { transform: scale(0.985); }\n  }\n  [data-beam="dsh-composer"][data-typing][data-active] {\n    animation: beam-typing-shrink 1.1s ease-in-out infinite !important;\n  }\n`;
  function ensureBeamStyles(borderRadius, variant) {
    var isDark = getBeamThemeIsDark();
    var r = typeof borderRadius === 'number' ? borderRadius : 16;
    var v = variant || 'colorful';
    var css = buildBeamCSS(BEAM_ID, r, isDark, v) + typingExtraCSS;
    if (!beamStyleTag) {
      beamStyleTag = document.getElementById("dsh-beam-css");
      if (!beamStyleTag) {
        beamStyleTag = document.createElement("style");
        beamStyleTag.id = "dsh-beam-css";
        document.head.appendChild(beamStyleTag);
      }
    }
    if (beamStyleTag.textContent !== css) beamStyleTag.textContent = css;
  }
  function setBeamStrength(v, opts) {
    var card = beamAttachedCard;
    if (!card) return;
    var strength = Math.max(0, Math.min(1, v));
    card.style.setProperty("--beam-strength", strength);
    if (opts && opts.persist) { try { localStorage.setItem("dsh-beam-strength", String(strength)); } catch(e) {} }
  }
  function findComposerInput(card) {
    if (!card) return null;
    return card.querySelector('textarea, [contenteditable="true"], [data-composer-input], .uV2eYG_input');
  }
  function isTyping() {
    return typingActive;
  }
  function setTypingActive(v) {
    if (typingActive === v) return;
    typingActive = v;
    updateBeamState();
  }
  function isPlanMode() {
    try {
      // DSH plan chip has aria-label containing plan mode
      if (document.querySelector('[aria-label*="plan mode 已开启"], [aria-label*="Plan mode on"]')) return true;
      if (document.querySelector('[data-slot="plan"]')) return true;
      // fallback: check body dataset (future)
      if (document.documentElement.dataset.planMode === '1') return true;
    } catch(e){}
    return false;
  }
  function isRealExecuting() {
    try {
      var stopBtn = document.querySelector('button[aria-label*="停止生成"], button[aria-label*="Stop generating"], [data-composer-card] button[aria-label*="停止"], [data-composer-card] button[aria-label*="Stop"]');
      if (stopBtn && !stopBtn.disabled) return true;
      if (document.querySelector('[data-state="running"], .Md3f7G_turnStatus')) {
        var el = document.querySelector('.Md3f7G_turnStatus');
        if (el && el.offsetParent !== null) return true;
      }
    } catch(e){}
    return false;
  }
  function isExecuting() {
    try {
      if (pendingExecuting) return true;
      return isRealExecuting();
    } catch(e){ return false; }
  }
  var currentBeamMode = 'hairline';
  var pulseTimer = null;
  function applyBeamMode(mode) {
    var card = beamAttachedCard;
    if (!card) return;
    // Force re-apply even if mode same, to handle card recreation (React)
    // if (currentBeamMode === mode && card.hasAttribute('data-'+mode)) return;
    currentBeamMode = mode;
    // Clear pulse timer if leaving pulse
    if (mode !== 'pulse' && pulseTimer) { clearTimeout(pulseTimer); pulseTimer=null; }
    if (mode === 'pulse') { pendingExecuting = false; if(pendingTimer){ clearTimeout(pendingTimer); pendingTimer=null; } }
    var isDark = getBeamThemeIsDark();
    var r = resolveBorderRadius(card);
    // Ensure styles exist
    ensureBeamStyles(r, mode==='typing'?'mono':(mode==='planning'?'sunset':'colorful'));
    // Remove all beam state attrs first
    card.removeAttribute('data-active');
    card.removeAttribute('data-fading');
    card.removeAttribute('data-typing');
    card.removeAttribute('data-planning');
    card.removeAttribute('data-pulse');
    // Apply per mode
    if (mode === 'hairline') {
      // No beam, just hairline (default glass border)
      card.style.removeProperty('--beam-strength');
      card.style.setProperty('--beam-strength', '0.08');
      // Ensure no active
      return;
    }
    if (mode === 'typing') {
      // Inward shrinking vibration - more prominent mono
      card.setAttribute('data-beam', BEAM_ID);
      card.setAttribute('data-typing', '');
      card.setAttribute('data-active', '');
      card.removeAttribute('data-paused');
      card.style.setProperty('--beam-strength', '0.55');
      // Use mono with shrinking animation (handled via extra CSS below)
      card.style.setProperty('--beam-hue-base', '0deg');
      return;
    }
    if (mode === 'planning') {
      // Orange-yellow prominent, not colorful - use sunset static warm
      card.setAttribute('data-beam', BEAM_ID);
      card.setAttribute('data-planning', '');
      card.setAttribute('data-active','');
      card.removeAttribute('data-paused');
      card.style.setProperty('--beam-strength','1');
      card.style.setProperty('--beam-hue-base','15deg');
      card.style.setProperty('filter','saturate(1.4) brightness(1.2)'); // warm orange
      return;
    }
    if (mode === 'executing') {
      card.setAttribute('data-beam', BEAM_ID);
      card.setAttribute('data-active','');
      card.removeAttribute('data-paused');
      card.style.setProperty('--beam-strength','1');
      card.style.removeProperty('--beam-hue-base');
      return;
    }
    if (mode === 'pulse') {
      card.setAttribute('data-beam', BEAM_ID);
      card.setAttribute('data-active','');
      card.style.setProperty('--beam-strength','1');
      // pulse bloom will be handled via same md but with scale, we just keep active and let bloom show
      // After 0.8s, transition to hairline
      pulseTimer = setTimeout(function(){
        if (currentBeamMode==='pulse') applyBeamMode('hairline');
      }, 800);
      return;
    }
  }
  function resolveBeamMode() {
    if (isBeamDisabled()) return 'hairline';
    if (pendingExecuting || isExecuting()) {
      if (isPlanMode()) return 'planning';
      return 'executing';
    }
    if (currentBeamMode === 'pulse') return 'pulse';
    if (isTyping()) return 'typing';
    return 'hairline';
  }
  function updateBeamState() {
    // Fix stale card: if attached card is detached (React re-render), re-attach to new card
    if (!beamAttachedCard || !document.contains(beamAttachedCard) || !beamAttachedCard.isConnected) {
      var freshCard = document.querySelector('[data-composer-card="true"], .uV2eYG_card');
      if (freshCard && freshCard !== beamAttachedCard) {
        try{ if(beamAttachedCard && beamAttachedCard._dshBeamCleanup) beamAttachedCard._dshBeamCleanup(); }catch(e){}
        beamAttachedCard = null;
        attachComposerBeam();
        return;
      }
    }
    // Also re-bind input if it was recreated (React may replace textarea)
    if (beamAttachedCard) {
      var freshInput = findComposerInput(beamAttachedCard);
      var boundInput = beamAttachedCard._dshBeamInput;
      if (freshInput && freshInput !== boundInput) {
        // clean old
        if (boundInput && beamTypingHandler) {
          try{ boundInput.removeEventListener('input', beamTypingHandler); boundInput.removeEventListener('change', beamTypingHandler); }catch(e){}
        }
        // bind new
        if (beamTypingHandler) {
          try{
            // Re-bind with keyboard detection
            freshInput.addEventListener('keydown', beamTypingHandler);
            freshInput.addEventListener('input', beamTypingHandler);
            var onSendKey = function(e){ if(e.key==='Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey){ var v=freshInput.value!==undefined?freshInput.value:freshInput.textContent; if(v && String(v).trim().length>0){ pendingExecuting=true; if(pendingTimer) clearTimeout(pendingTimer); pendingTimer=setTimeout(function(){ pendingExecuting=false; updateBeamState(); },5000); updateBeamState(); } } };
            freshInput.addEventListener('keydown', onSendKey);
            freshInput._dshBeamOnSend = onSendKey;
            freshInput._dshBeamHasListener = true;
            beamAttachedCard._dshBeamInput = freshInput;
          }catch(e){}
        }
      }
    }
    // If pending and real executing is now true, pending is no longer needed
    if (pendingExecuting && isRealExecuting()) { pendingExecuting = false; if(pendingTimer){ clearTimeout(pendingTimer); pendingTimer=null; } }
    if (pendingExecuting && isExecuting()) {
      // keep pending for now, it will be cleared when executing ends
    }
    var next = resolveBeamMode();
    // If we transition to executing, keep pending until real executing is confirmed, then it will be cleared above
    // Handle transition: executing -> pulse
    if (currentBeamMode === 'executing' && next !== 'executing' && next !== 'pulse') {
      // Just finished execution, go to pulse
      applyBeamMode('pulse');
      return;
    }
    applyBeamMode(next);
  }
  function attachComposerBeam() {
    if (isBeamDisabled()) return;
    if (beamAttachedCard && document.contains(beamAttachedCard)) return;
    var card = document.querySelector('[data-composer-card="true"], .uV2eYG_card');
    if (!card) return;
    card.setAttribute("data-beam", BEAM_ID);
    if (!card.querySelector("[data-beam-bloom]")) {
      var bloom = document.createElement("div");
      bloom.setAttribute("data-beam-bloom", "");
      card.appendChild(bloom);
    }
    var radius = resolveBorderRadius(card);
    ensureBeamStyles(radius);
    // Ensure card styling for beam
    card.style.setProperty("overflow", "visible");
    card.style.setProperty("isolation", "isolate");
    if (window.getComputedStyle(card).position === "static") card.style.position = "relative";
    beamAttachedCard = card;
    currentBeamMode = 'hairline';
    // Initial state
    updateBeamState();
    // Typing listener
    var input = findComposerInput(card);
    if (input) {
      beamTypingHandler = function(){ updateBeamState(); };
      input.addEventListener('input', beamTypingHandler);
      input.addEventListener('change', beamTypingHandler);
      input._dshBeamHasListener = true;
      // Send detection: Enter or send button click -> immediate executing
      var onSend = function(){
        var val = input.value !== undefined ? input.value : input.textContent;
        if (val && String(val).trim().length>0) {
          pendingExecuting = true;
          if (pendingTimer) clearTimeout(pendingTimer);
          // fallback clear after 5s if stop button never appears (e.g., blocked)
          pendingTimer = setTimeout(function(){ pendingExecuting=false; updateBeamState(); }, 5000);
          updateBeamState();
        }
      };
      input.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey){ onSend(); }});
      // Store for cleanup
      input._dshBeamOnSend = onSend;
    }
    // Send button click
    var sendBtn = card.querySelector('button[aria-label="Send message"], button[aria-label="发送消息"], button[aria-label*="Send"], button[aria-label*="发送"], .uV2eYG_primary');
    if (sendBtn) {
      var sendHandler = function(){ pendingExecuting = true; if(pendingTimer) clearTimeout(pendingTimer); pendingTimer=setTimeout(function(){ pendingExecuting=false; updateBeamState(); },5000); updateBeamState(); };
      sendBtn.addEventListener('click', sendHandler);
      card._dshBeamSendBtn = sendBtn;
      card._dshBeamSendHandler = sendHandler;
    }
    // ResizeObserver for borderRadius
    if (window.ResizeObserver) {
      if (beamResizeObs) try{ beamResizeObs.disconnect(); }catch(e){}
      beamResizeObs = new ResizeObserver(function(){
        if (!beamAttachedCard) return;
        var nr = resolveBorderRadius(beamAttachedCard);
        ensureBeamStyles(nr);
      });
      try{ beamResizeObs.observe(card); }catch(e){}
    }
    // Poll for executing/plan changes (200ms)
    if (beamPollTimer) clearInterval(beamPollTimer);
    beamPollTimer = setInterval(updateBeamState, 200);
    // Also observe DOM for plan chip / stop button
    if (!beamMutObs && window.MutationObserver) {
      beamMutObs = new MutationObserver(function(){ updateBeamState(); });
      var rootEl = document.querySelector("#root") || document.documentElement;
      try{ beamMutObs.observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-label','class','data-plan-mode'] }); }catch(e){}
    }
    card._dshBeamCleanup = function(){
      if (input && beamTypingHandler) { try{ input.removeEventListener('input', beamTypingHandler); input.removeEventListener('change', beamTypingHandler); if(input._dshBeamOnSend) input.removeEventListener('keydown', input._dshBeamOnSend); }catch(e){} }
      if (card._dshBeamSendBtn && card._dshBeamSendHandler) { try{ card._dshBeamSendBtn.removeEventListener('click', card._dshBeamSendHandler); }catch(e){} }
      if (beamPollTimer) { clearInterval(beamPollTimer); beamPollTimer=null; }
      if (beamMutObs) { try{ beamMutObs.disconnect(); beamMutObs=null; }catch(e){} }
      if (beamResizeObs) { try{ beamResizeObs.disconnect(); beamResizeObs=null; }catch(e){} }
      if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer=null; }
      if (beamPulseTimer) { clearTimeout(beamPulseTimer); beamPulseTimer=null; }
    };
  }
  function detachComposerBeam() {
    var card = beamAttachedCard;
    if (!card) return;
    try{ if (card._dshBeamCleanup) card._dshBeamCleanup(); }catch(e){}
    card.removeAttribute("data-beam");
    card.removeAttribute("data-active");
    card.removeAttribute("data-fading");
    card.removeAttribute("data-typing");
    card.removeAttribute("data-planning");
    card.removeAttribute("data-pulse");
    card.removeAttribute("data-paused");
    card.style.removeProperty("--beam-strength");
    card.style.removeProperty("--beam-hue-base");
    card.style.removeProperty("isolation");
    var bloom = card.querySelector("[data-beam-bloom]");
    if (bloom) try{ bloom.remove(); }catch(e){}
    if (beamResizeObs) try{ beamResizeObs.disconnect(); beamResizeObs=null; }catch(e){}
    beamAttachedCard = null;
    currentBeamMode='hairline';
  }
  function refreshBeamTheme() {
    if (!beamAttachedCard) return;
    var r = resolveBorderRadius(beamAttachedCard);
    ensureBeamStyles(r);
    updateBeamState();
  }
  function watchBeamComposer() {
    if (isBeamDisabled()) { detachComposerBeam(); return; }
    attachComposerBeam();
    if (!beamMutObs && window.MutationObserver) {
      beamMutObs = new MutationObserver(function(){
        if (!beamAttachedCard) attachComposerBeam();
        else updateBeamState();
      });
      var rootEl = document.querySelector("#root") || document.documentElement;
      try{ beamMutObs.observe(rootEl, { childList: true, subtree: true }); }catch(e){}
    }
  }
  try{
    if (typeof window.__dshDeepSeekBg !== 'object' || window.__dshDeepSeekBg === null) window.__dshDeepSeekBg = {};
    window.__dshDeepSeekBg.beam = {
      attach: attachComposerBeam,
      detach: detachComposerBeam,
      setStrength: function(v){ setBeamStrength(v, {persist:false}); },
      setIdleStrength: function(v){ beamState.idleStrength = Math.max(0,Math.min(1,v)); refreshBeamTheme(); },
      setFocusStrength: function(v){ beamState.focusStrength = Math.max(0,Math.min(1,v)); refreshBeamTheme(); },
      disable: function(){ try{ localStorage.setItem("dsh-beam-disabled","1"); }catch(e){} detachComposerBeam(); },
      enable: function(){ try{ localStorage.removeItem("dsh-beam-disabled"); }catch(e){} watchBeamComposer(); },
      refresh: refreshBeamTheme,
      get state(){ return currentBeamMode; },
      get isExecuting(){ return isExecuting(); },
      get isTyping(){ return isTyping(); },
      update: updateBeamState,
      get id(){ return BEAM_ID; },
      get card(){ return beamAttachedCard; }
    };
  }catch(e){}

  /* ------------------------------------------------------------------ *
   * 着色器（与 DeepSeek 打包产物逐字一致）
   * ------------------------------------------------------------------ */
  var VERT = "#version 300 es\nin vec4 a_position;\nout vec2 vUv;\nvoid main() {\n  vUv = a_position.xy * 0.5 + 0.5;\n  gl_Position = a_position;\n}\n";

  var FLOWMAP_FS = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 vUv;\n" +
    "uniform sampler2D u_prev;\n" +
    "uniform vec2 u_mouse;\n" +
    "uniform vec2 u_velocity;\n" +
    "uniform float u_brushRadius;\n" +
    "uniform float u_brushStrength;\n" +
    "uniform float u_decay;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "void main() {\n" +
    "  vec4 prev = texture(u_prev, vUv);\n" +
    "\n" +
    "  prev.r *= u_decay;\n" +
    "  prev.gb = mix(vec2(0.5), prev.gb, u_decay);\n" +
    "\n" +
    "  float dist = distance(vUv, u_mouse);\n" +
    "\n" +
    "  float influence = exp(-dist * dist / (u_brushRadius * u_brushRadius * 0.5));\n" +
    "  influence = max(0.0, influence - 0.01);\n" +
    "\n" +
    "  float speed = length(u_velocity);\n" +
    "  float presenceStrength = u_brushStrength * 0.3;\n" +
    "  float velBonus = min(speed * 3.0, 0.7) * u_brushStrength;\n" +
    "  float totalStrength = presenceStrength + velBonus;\n" +
    "\n" +
    "  prev.r = max(prev.r, influence * totalStrength);\n" +
    "  float blendAmt = influence * min(totalStrength, 0.4) * 0.3;\n" +
    "  prev.g = mix(prev.g, clamp(u_velocity.x * 2.0 + 0.5, 0.0, 1.0), blendAmt);\n" +
    "  prev.b = mix(prev.b, clamp(u_velocity.y * 2.0 + 0.5, 0.0, 1.0), blendAmt);\n" +
    "\n" +
    "  fragColor = prev;\n" +
    "}\n";

  var PARTICLE_FS = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 vUv;\n" +
    "uniform float u_time;\n" +
    "uniform float u_pixelRatio;\n" +
    "uniform vec2 u_resolution;\n" +
    "uniform float u_scale;\n" +
    "uniform float u_rotation;\n" +
    "uniform vec4 u_color1, u_color2, u_color3, u_color4, u_color5;\n" +
    "uniform float u_colorCount;\n" +
    "uniform float u_proportion;\n" +
    "uniform float u_softness;\n" +
    "uniform float u_shape;\n" +
    "uniform float u_shapeScale;\n" +
    "uniform float u_distortion;\n" +
    "uniform float u_swirl;\n" +
    "uniform float u_swirlIterations;\n" +
    "uniform vec2 u_offset;\n" +
    "uniform sampler2D u_flowmap;\n" +
    "uniform float u_distortBoost;\n" +
    "uniform float u_noiseBoost;\n" +
    "uniform float u_swirlBoost;\n" +
    "uniform float u_glowIntensity;\n" +
    "uniform vec3 u_glowColor1;\n" +
    "uniform vec3 u_glowColor2;\n" +
    "uniform vec3 u_glowColor3;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "#define TWO_PI 6.28318530718\n" +
    "#define PI 3.14159265358979323846\n" +
    "\n" +
    "vec2 rotate(vec2 uv, float th) { return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv; }\n" +
    "float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }\n" +
    "float noise(vec2 st) {\n" +
    "  vec2 i = floor(st); vec2 f = fract(st);\n" +
    "  float a = random(i), b = random(i + vec2(1,0)), c = random(i + vec2(0,1)), d = random(i + vec2(1,1));\n" +
    "  vec2 u = f*f*(3.0-2.0*f);\n" +
    "  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);\n" +
    "}\n" +
    "\n" +
    "vec3 blend_multi(float mixer, float softness) {\n" +
    "  float edge = 1.0 - softness;\n" +
    "  float n = u_colorCount;\n" +
    "  vec3 col = u_color1.rgb;\n" +
    "  if (n > 1.5) { col = mix(col, u_color2.rgb, smoothstep(0.0 + 0.2*edge, 1.0/(n-0.5) - 0.2*edge, mixer)); }\n" +
    "  if (n > 2.5) { col = mix(col, u_color3.rgb, smoothstep(1.0/(n-0.5) + 0.1*edge, 2.0/(n-0.5) - 0.1*edge, mixer)); }\n" +
    "  if (n > 3.5) { col = mix(col, u_color4.rgb, smoothstep(2.0/(n-0.5) + 0.1*edge, 3.0/(n-0.5) - 0.1*edge, mixer)); }\n" +
    "  if (n > 4.5) { col = mix(col, u_color5.rgb, smoothstep(3.0/(n-0.5) + 0.1*edge, 4.0/(n-0.5) - 0.1*edge, mixer)); }\n" +
    "  return col;\n" +
    "}\n" +
    "\n" +
    "void main() {\n" +
    "  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n" +
    "  float t = .5 * u_time;\n" +
    "  float ns = .0005 + .006 * u_scale;\n" +
    "  uv -= .5; uv *= (ns * u_resolution); uv = rotate(uv, u_rotation * .5 * PI);\n" +
    "  uv /= u_pixelRatio; uv += .5; uv += u_offset;\n" +
    "\n" +
    "  vec2 fragUV = gl_FragCoord.xy / u_resolution.xy;\n" +
    "  vec4 flow = texture(u_flowmap, fragUV);\n" +
    "  float influence = flow.r;\n" +
    "  vec2 flowDir = (flow.gb - 0.5) * 2.0;\n" +
    "\n" +
    "  float n1 = noise(uv + t), n2 = noise(uv*2. - t);\n" +
    "  float angle = n1 * TWO_PI;\n" +
    "\n" +
    "  float totalDistortion = u_distortion + influence * u_distortBoost;\n" +
    "  uv.x += 4. * totalDistortion * n2 * cos(angle);\n" +
    "  uv.y += 4. * totalDistortion * n2 * sin(angle);\n" +
    "\n" +
    "  uv += flowDir * influence * 0.15;\n" +
    "\n" +
    "  if (influence > 0.001) {\n" +
    "    float localNoise = noise(uv * 2.0 + t * 1.5);\n" +
    "    uv += influence * u_noiseBoost * vec2(cos(localNoise * TWO_PI), sin(localNoise * TWO_PI));\n" +
    "  }\n" +
    "\n" +
    "  float iters = ceil(clamp(u_swirlIterations, 1., 30.));\n" +
    "  float swirlAmt = clamp(u_swirl, 0., 2.) + influence * u_swirlBoost;\n" +
    "  for (float i = 1.; i <= 30.0; i++) {\n" +
    "    if (i > iters) break;\n" +
    "    uv.x += swirlAmt / i * cos(t + i*1.5*uv.y);\n" +
    "    uv.y += swirlAmt / i * cos(t + i*1.*uv.x);\n" +
    "  }\n" +
    "\n" +
    "  float proportion = clamp(u_proportion, 0., 1.);\n" +
    "  vec2 cuv = uv * (.5 + 3.5 * u_shapeScale);\n" +
    "  float shape = .5 + .5 * sin(cuv.x) * cos(cuv.y);\n" +
    "  float mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);\n" +
    "  vec3 col = blend_multi(mixer, clamp(u_softness, 0., 1.));\n" +
    "\n" +
    "  // Mouse proximity color shift: 3-color glow\n" +
    "  float glow = smoothstep(0.0, 0.8, influence);\n" +
    "  float glowNoise = noise(uv * 3.0 + u_time * 0.1) ;\n" +
    "  float glowDist = smoothstep(0.0, 1.0, influence);\n" +
    "  vec3 glowMix = mix(u_glowColor3, u_glowColor2, glowDist);\n" +
    "  glowMix = mix(glowMix, u_glowColor1, glowDist * glowNoise);\n" +
    "  col = mix(col, glowMix, glow * u_glowIntensity);\n" +
    "\n" +
    "  fragColor = vec4(col, 1.0);\n" +
    "}\n";

  var FLUID_FS = "#version 300 es\n" +
    "precision mediump float;\n" +
    "in vec2 vUv;\n" +
    "uniform float u_time;\n" +
    "uniform vec2 u_resolution;\n" +
    "uniform vec3 u_c1, u_c2, u_c3, u_c4, u_c5;\n" +
    "uniform float u_scale;\n" +
    "uniform vec2 u_offset;\n" +
    "uniform float u_grain;\n" +
    "uniform float u_speed;\n" +
    "uniform sampler2D u_flowmap;\n" +
    "uniform float u_distortBoost;\n" +
    "uniform float u_swirlBoost;\n" +
    "uniform float u_glowIntensity;\n" +
    "uniform vec3 u_glowColor1;\n" +
    "uniform vec3 u_glowColor2;\n" +
    "uniform vec3 u_glowColor3;\n" +
    "uniform vec2 u_lightPos;\n" +
    "uniform float u_lightCore;\n" +
    "uniform float u_lightHalo;\n" +
    "uniform float u_vignette;\n" +
    "uniform float u_bloomThreshold;\n" +
    "uniform float u_bloomRange;\n" +
    "uniform float u_bloomStrength;\n" +
    "out vec4 fragColor;\n" +
    "\n" +
    "vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}\n" +
    "vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}\n" +
    "vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}\n" +
    "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}\n" +
    "\n" +
    "float snoise(vec3 v){\n" +
    "  const vec2 C=vec2(1./6.,1./3.);\n" +
    "  const vec4 D=vec4(0.,.5,1.,2.);\n" +
    "  vec3 i=floor(v+dot(v,C.yyy));\n" +
    "  vec3 x0=v-i+dot(i,C.xxx);\n" +
    "  vec3 g=step(x0.yzx,x0.xyz);\n" +
    "  vec3 l=1.-g;\n" +
    "  vec3 i1=min(g.xyz,l.zxy);\n" +
    "  vec3 i2=max(g.xyz,l.zxy);\n" +
    "  vec3 x1=x0-i1+C.xxx;\n" +
    "  vec3 x2=x0-i2+C.yyy;\n" +
    "  vec3 x3=x0-D.yyy;\n" +
    "  i=mod289v3(i);\n" +
    "  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));\n" +
    "  float n_=.142857142857;\n" +
    "  vec3 ns=n_*D.wyz-D.xzx;\n" +
    "  vec4 j=p-49.*floor(p*ns.z*ns.z);\n" +
    "  vec4 x_=floor(j*ns.z);\n" +
    "  vec4 y_=floor(j-7.*x_);\n" +
    "  vec4 x=x_*ns.x+ns.yyyy;\n" +
    "  vec4 y=y_*ns.x+ns.yyyy;\n" +
    "  vec4 h=1.-abs(x)-abs(y);\n" +
    "  vec4 b0=vec4(x.xy,y.xy);\n" +
    "  vec4 b1=vec4(x.zw,y.zw);\n" +
    "  vec4 s0=floor(b0)*2.+1.;\n" +
    "  vec4 s1=floor(b1)*2.+1.;\n" +
    "  vec4 sh=-step(h,vec4(0.));\n" +
    "  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;\n" +
    "  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;\n" +
    "  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);\n" +
    "  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);\n" +
    "  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));\n" +
    "  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;\n" +
    "  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);\n" +
    "  m=m*m;\n" +
    "  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));\n" +
    "}\n" +
    "\n" +
    "float hash(vec2 p){\n" +
    "  vec3 p3=fract(vec3(p.xyx)*.1031);\n" +
    "  p3+=dot(p3,p3.yzx+33.33);\n" +
    "  return fract((p3.x+p3.y)*p3.z);\n" +
    "}\n" +
    "\n" +
    "float fbm(vec3 p){\n" +
    "  float v=0.,amp=.6;vec3 shift=vec3(100.);\n" +
    "  for(int i=0;i<1;i++){v+=amp*snoise(p);p=p*2.+shift;amp*=.4;}\n" +
    "  return v;\n" +
    "}\n" +
    "\n" +
    "float fluidNoise(vec2 uv,float t){\n" +
    "  float n1=fbm(vec3(uv*.6,t*.06));\n" +
    "  float n2=fbm(vec3(uv*.6+5.2,t*.06+1.3));\n" +
    "  vec2 w1=vec2(n1,n2)*.6;\n" +
    "  float n3=fbm(vec3((uv+w1)*.7+1.7,t*.05+3.1));\n" +
    "  float n4=fbm(vec3((uv+w1)*.7+9.2,t*.05+5.7));\n" +
    "  vec2 w2=vec2(n3,n4)*.5;\n" +
    "  return fbm(vec3((uv+w1+w2)*.5,t*.04));\n" +
    "}\n" +
    "\n" +
    "vec2 curlish(vec2 uv,float t){\n" +
    "  float eps=.02;\n" +
    "  float n=snoise(vec3(uv*.8,t));\n" +
    "  float nx=snoise(vec3((uv+vec2(eps,0.))*.8,t));\n" +
    "  float ny=snoise(vec3((uv+vec2(0.,eps))*.8,t));\n" +
    "  return vec2(-(ny-n)/eps,(nx-n)/eps)*.003;\n" +
    "}\n" +
    "\n" +
    "void main(){\n" +
    "  float aspect=u_resolution.x/u_resolution.y;\n" +
    "  vec2 uv=gl_FragCoord.xy/u_resolution;\n" +
    "  vec2 suv=vec2(uv.x*aspect, uv.y) * u_scale + u_offset;\n" +
    "  float t=u_time;\n" +
    "\n" +
    "  // Mouse interaction via flowmap\n" +
    "  vec4 flow = texture(u_flowmap, uv);\n" +
    "  float influence = flow.r;\n" +
    "  vec2 flowDir = (flow.gb - 0.5) * 2.0;\n" +
    "\n" +
    "  // Apply mouse distortion to UV\n" +
    "  suv += flowDir * influence * u_distortBoost * 0.8;\n" +
    "  // Apply mouse swirl\n" +
    "  float swirlAngle = influence * u_swirlBoost * 2.5;\n" +
    "  float cs = cos(swirlAngle), sn = sin(swirlAngle);\n" +
    "  vec2 delta = suv - vec2(uv.x * aspect, uv.y) * u_scale;\n" +
    "  suv += (mat2(cs, sn, -sn, cs) * delta - delta) * influence;\n" +
    "\n" +
    "  vec2 curl=curlish(suv,t*.04);\n" +
    "  vec2 uvD=suv+curl*12.;\n" +
    "  float f=fluidNoise(uvD,t);\n" +
    "  float swirl=snoise(vec3(uvD*.8+f*1.5,t*.035))*.5+.5;\n" +
    "  float n=f*.5+.5;\n" +
    "  vec3 col=mix(u_c1,u_c2,smoothstep(.2,.5,n));\n" +
    "  col=mix(col,u_c3,smoothstep(.35,.65,n+swirl*.25));\n" +
    "  col=mix(col,u_c4,smoothstep(.6,.85,swirl)*.55);\n" +
    "  col=mix(col,u_c5,smoothstep(.5,.8,n*swirl)*.35);\n" +
    "\n" +
    "  // Mouse proximity color shift: 3-color glow blended by distance + noise\n" +
    "  float glow = smoothstep(0.0, 0.8, influence);\n" +
    "  float glowNoise = snoise(vec3(uvD * 1.5, t * 0.08)) * 0.5 + 0.5;\n" +
    "  float glowDist = smoothstep(0.0, 1.0, influence);\n" +
    "  vec3 glowMix = mix(u_glowColor3, u_glowColor2, glowDist);\n" +
    "  glowMix = mix(glowMix, u_glowColor1, glowDist * glowNoise);\n" +
    "  col = mix(col, glowMix, glow * u_glowIntensity);\n" +
    "\n" +
    "  if(u_grain>0.0){\n" +
    "    vec2 flowOffset = (uvD - suv) * u_resolution.y;\n" +
    "    vec2 gp = floor((gl_FragCoord.xy + flowOffset) / 5.0);\n" +
    "    float gr=hash(gp)*2.-1.;\n" +
    "    col+=gr*u_grain;\n" +
    "  }\n" +
    "\n" +
    "  // Self-luminance bloom: bright fluid regions become their own light spots,\n" +
    "  // so glow follows the flow and mouse disturbance instead of a fixed point\n" +
    "  float luma=dot(col,vec3(.299,.587,.114));\n" +
    "  float bloom=smoothstep(u_bloomThreshold-u_bloomRange,u_bloomThreshold+u_bloomRange,luma);\n" +
    "  col+=(col*.85+vec3(.15,.145,.13))*bloom*u_bloomStrength;\n" +
    "\n" +
    "  // Virtual light source: soft warm core (same side as helm lighting)\n" +
    "  float ld=length((uv-u_lightPos)*vec2(aspect,1.));\n" +
    "  float core=exp(-ld*ld*4.5);\n" +
    "  float halo=exp(-ld*1.8);\n" +
    "  col+=vec3(1.,.97,.9)*core*u_lightCore+vec3(.72,.8,1.)*halo*u_lightHalo;\n" +
    "\n" +
    "  float vig=1.-smoothstep(.35,.75,length(uv-.5));\n" +
    "  col=mix(col*(1.-u_vignette),col,vig);\n" +
    "  fragColor=vec4(col,1.);\n" +
    "}\n";

  /* ------------------------------------------------------------------ *
   * 极光引擎（WebGL2）
   * ------------------------------------------------------------------ */
  function startAurora() {
    var canvas = auroraCanvas;
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    diag.auroraGL = true;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    function link(vs, fs) {
      var p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var progFlow = link(vs, compile(gl.FRAGMENT_SHADER, FLOWMAP_FS));
    var progPart = link(vs, compile(gl.FRAGMENT_SHADER, PARTICLE_FS));
    var progFluid = link(vs, compile(gl.FRAGMENT_SHADER, FLUID_FS));
    diag.auroraProgs = [progFlow ? "flow" : "", progPart ? "particle" : "", progFluid ? "fluid" : ""].filter(Boolean).join(",");
    if (!progFlow || !progPart || !progFluid) return;

    var uFlow = {
      prev: gl.getUniformLocation(progFlow, "u_prev"),
      mouse: gl.getUniformLocation(progFlow, "u_mouse"),
      velocity: gl.getUniformLocation(progFlow, "u_velocity"),
      brushRadius: gl.getUniformLocation(progFlow, "u_brushRadius"),
      brushStrength: gl.getUniformLocation(progFlow, "u_brushStrength"),
      decay: gl.getUniformLocation(progFlow, "u_decay")
    };
    var uPart = {
      time: gl.getUniformLocation(progPart, "u_time"),
      pixelRatio: gl.getUniformLocation(progPart, "u_pixelRatio"),
      resolution: gl.getUniformLocation(progPart, "u_resolution"),
      scale: gl.getUniformLocation(progPart, "u_scale"),
      rotation: gl.getUniformLocation(progPart, "u_rotation"),
      offset: gl.getUniformLocation(progPart, "u_offset"),
      color1: gl.getUniformLocation(progPart, "u_color1"),
      color2: gl.getUniformLocation(progPart, "u_color2"),
      color3: gl.getUniformLocation(progPart, "u_color3"),
      color4: gl.getUniformLocation(progPart, "u_color4"),
      color5: gl.getUniformLocation(progPart, "u_color5"),
      colorCount: gl.getUniformLocation(progPart, "u_colorCount"),
      proportion: gl.getUniformLocation(progPart, "u_proportion"),
      softness: gl.getUniformLocation(progPart, "u_softness"),
      shape: gl.getUniformLocation(progPart, "u_shape"),
      shapeScale: gl.getUniformLocation(progPart, "u_shapeScale"),
      distortion: gl.getUniformLocation(progPart, "u_distortion"),
      swirl: gl.getUniformLocation(progPart, "u_swirl"),
      swirlIterations: gl.getUniformLocation(progPart, "u_swirlIterations"),
      flowmap: gl.getUniformLocation(progPart, "u_flowmap"),
      distortBoost: gl.getUniformLocation(progPart, "u_distortBoost"),
      noiseBoost: gl.getUniformLocation(progPart, "u_noiseBoost"),
      swirlBoost: gl.getUniformLocation(progPart, "u_swirlBoost"),
      glowIntensity: gl.getUniformLocation(progPart, "u_glowIntensity"),
      glowColor1: gl.getUniformLocation(progPart, "u_glowColor1"),
      glowColor2: gl.getUniformLocation(progPart, "u_glowColor2"),
      glowColor3: gl.getUniformLocation(progPart, "u_glowColor3")
    };
    var uFluid = {
      time: gl.getUniformLocation(progFluid, "u_time"),
      resolution: gl.getUniformLocation(progFluid, "u_resolution"),
      scale: gl.getUniformLocation(progFluid, "u_scale"),
      offset: gl.getUniformLocation(progFluid, "u_offset"),
      grain: gl.getUniformLocation(progFluid, "u_grain"),
      speed: gl.getUniformLocation(progFluid, "u_speed"),
      flowmap: gl.getUniformLocation(progFluid, "u_flowmap"),
      distortBoost: gl.getUniformLocation(progFluid, "u_distortBoost"),
      swirlBoost: gl.getUniformLocation(progFluid, "u_swirlBoost"),
      glowIntensity: gl.getUniformLocation(progFluid, "u_glowIntensity"),
      glowColor1: gl.getUniformLocation(progFluid, "u_glowColor1"),
      glowColor2: gl.getUniformLocation(progFluid, "u_glowColor2"),
      glowColor3: gl.getUniformLocation(progFluid, "u_glowColor3"),
      c1: gl.getUniformLocation(progFluid, "u_c1"),
      c2: gl.getUniformLocation(progFluid, "u_c2"),
      c3: gl.getUniformLocation(progFluid, "u_c3"),
      c4: gl.getUniformLocation(progFluid, "u_c4"),
      c5: gl.getUniformLocation(progFluid, "u_c5"),
      lightPos: gl.getUniformLocation(progFluid, "u_lightPos"),
      lightCore: gl.getUniformLocation(progFluid, "u_lightCore"),
      lightHalo: gl.getUniformLocation(progFluid, "u_lightHalo"),
      vignette: gl.getUniformLocation(progFluid, "u_vignette"),
      bloomThreshold: gl.getUniformLocation(progFluid, "u_bloomThreshold"),
      bloomRange: gl.getUniformLocation(progFluid, "u_bloomRange"),
      bloomStrength: gl.getUniformLocation(progFluid, "u_bloomStrength")
    };

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    function bindAttrib(prog) {
      var loc = gl.getAttribLocation(prog, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }
    function makeTarget(w, h, data) {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { fbo: fbo, tex: tex };
    }

    var W = 0, H = 0, wQ = 0, hQ = 0;
    var flip = false;
    var k = Math.min(window.devicePixelRatio || 1, 1.5);
    function resizeAll() {
      W = Math.round(canvas.clientWidth * k);
      H = Math.round(canvas.clientHeight * k);
      canvas.width = W; canvas.height = H;
      wQ = Math.round(W / 4); hQ = Math.round(H / 4);
      var init = new Uint8Array(wQ * hQ * 4);
      for (var i = 0; i < wQ * hQ; i++) { init[4 * i] = 0; init[4 * i + 1] = 128; init[4 * i + 2] = 128; init[4 * i + 3] = 255; }
      targetA = makeTarget(wQ, hQ, init);
      targetB = makeTarget(wQ, hQ, init);
    }
    var targetA = null, targetB = null;
    resizeAll();

    var mouse = { x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5, vx: 0, vy: 0, svx: 0, svy: 0 };
    var useMouse = !reducedMotion && !coarse && !isWindows;
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
    }
    if (useMouse) window.addEventListener("mousemove", onMove, { passive: true });

    var start = performance.now();
    var raf = 0;
    var running = true;
    var last = 0;
    var FRAME = 1000 / 30;

    function hex2rgb(hex) {
      var h = hex.replace("#", "");
      return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!running || !state.dark || now - last < FRAME) return;
      last = now - (now - last) % FRAME;
      var cfg = currentAuroraConfig();

      var kk = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = Math.round(canvas.clientWidth * kk);
      var h = Math.round(canvas.clientHeight * kk);
      if (w !== W || h !== H) resizeAll();

      mouse.smoothX += (mouse.x - mouse.smoothX) * cfg.mouseSmoothing;
      mouse.smoothY += (mouse.y - mouse.smoothY) * cfg.mouseSmoothing;
      mouse.svx += ((mouse.x - mouse.smoothX) * 0.5 - mouse.svx) * cfg.mouseVelocity;
      mouse.svy += ((mouse.y - mouse.smoothY) * 0.5 - mouse.svy) * cfg.mouseVelocity;

      // --- flowmap pass（鼠标笔刷 → 低分辨率流场，双缓冲乒乓） ---
      var src = flip ? targetA : targetB;
      var dst = flip ? targetB : targetA;
      flip = !flip;
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
      gl.viewport(0, 0, wQ, hQ);
      gl.useProgram(progFlow);
      bindAttrib(progFlow);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(uFlow.prev, 0);
      gl.uniform2f(uFlow.mouse, mouse.smoothX, mouse.smoothY);
      gl.uniform2f(uFlow.velocity, mouse.svx, mouse.svy);
      gl.uniform1f(uFlow.brushRadius, cfg.mouseRadius);
      gl.uniform1f(uFlow.brushStrength, useMouse ? cfg.mouseStrength : 0);
      gl.uniform1f(uFlow.decay, cfg.decay);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);

      // --- 渲染 ---
      var t = (performance.now() - start) * 0.001 * (cfg.speed / 100);
      if (cfg.type === "fluid") {
        gl.useProgram(progFluid);
        bindAttrib(progFluid);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, dst.tex);
        gl.uniform1i(uFluid.flowmap, 0);
        gl.uniform1f(uFluid.time, t);
        gl.uniform2f(uFluid.resolution, W, H);
        gl.uniform1f(uFluid.scale, cfg.scale);
        gl.uniform2f(uFluid.offset, cfg.offsetX / 100, cfg.offsetY / 100);
        gl.uniform1f(uFluid.grain, cfg.grain);
        gl.uniform1f(uFluid.distortBoost, cfg.distortBoost);
        gl.uniform1f(uFluid.swirlBoost, cfg.swirlBoost);
        var lx = cfg.lightX != null ? cfg.lightX : 0.89;
        var lf = useMouse && cfg.lightFollow != null ? cfg.lightFollow : 0;
        gl.uniform2f(uFluid.lightPos, lx + (mouse.smoothX - lx) * lf, cfg.lightY != null ? cfg.lightY : 0.46);
        gl.uniform1f(uFluid.lightCore, coarse ? 0 : (cfg.lightCore != null ? cfg.lightCore : 0.14));
        gl.uniform1f(uFluid.lightHalo, coarse ? 0 : (cfg.lightHalo != null ? cfg.lightHalo : 0.2));
        gl.uniform1f(uFluid.vignette, cfg.vignette != null ? cfg.vignette : 0.38);
        gl.uniform1f(uFluid.bloomThreshold, cfg.bloomThreshold != null ? cfg.bloomThreshold : 0.61);
        gl.uniform1f(uFluid.bloomRange, cfg.bloomRange != null ? cfg.bloomRange : 0.18);
        gl.uniform1f(uFluid.bloomStrength, cfg.bloomStrength != null ? cfg.bloomStrength : 0.4);
        gl.uniform1f(uFluid.glowIntensity, cfg.glowIntensity);
        var gc1 = hex2rgb(cfg.glowColors[0] || "#ffffff");
        var gc2 = hex2rgb(cfg.glowColors[1] || cfg.glowColors[0] || "#ffffff");
        var gc3 = hex2rgb(cfg.glowColors[2] || cfg.glowColors[0] || "#ffffff");
        gl.uniform3f(uFluid.glowColor1, gc1[0], gc1[1], gc1[2]);
        gl.uniform3f(uFluid.glowColor2, gc2[0], gc2[1], gc2[2]);
        gl.uniform3f(uFluid.glowColor3, gc3[0], gc3[1], gc3[2]);
        var cs = cfg.colors || [];
        for (var ci = 0; ci < 5; ci++) {
          var c = hex2rgb(cs[ci] || cs[cs.length - 1] || "#000000");
          gl.uniform3f([uFluid.c1, uFluid.c2, uFluid.c3, uFluid.c4, uFluid.c5][ci], c[0], c[1], c[2]);
        }
      } else {
        gl.useProgram(progPart);
        bindAttrib(progPart);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, dst.tex);
        gl.uniform1i(uPart.flowmap, 0);
        gl.uniform1f(uPart.time, t);
        gl.uniform1f(uPart.pixelRatio, window.devicePixelRatio || 1);
        gl.uniform2f(uPart.resolution, W, H);
        gl.uniform1f(uPart.scale, cfg.scale);
        gl.uniform1f(uPart.rotation, cfg.rotation / 90);
        gl.uniform2f(uPart.offset, cfg.offsetX / 100, cfg.offsetY / 100);
        var cols = cfg.colors || ["#2E58A4", "#D2E2EE", "#FFFFFF"];
        for (var pi = 0; pi < 5; pi++) {
          var pc = hex2rgb(cols[pi] || cols[cols.length - 1] || "#000000");
          gl.uniform4f([uPart.color1, uPart.color2, uPart.color3, uPart.color4, uPart.color5][pi], pc[0], pc[1], pc[2], 1);
        }
        gl.uniform1f(uPart.colorCount, cols.length);
        gl.uniform1f(uPart.proportion, cfg.proportion / 100);
        gl.uniform1f(uPart.softness, cfg.softness / 100);
        gl.uniform1f(uPart.shape, 0);
        gl.uniform1f(uPart.shapeScale, cfg.shapeScale / 100);
        gl.uniform1f(uPart.distortion, cfg.distortion / 100);
        gl.uniform1f(uPart.swirl, cfg.swirl / 50);
        gl.uniform1f(uPart.swirlIterations, cfg.swirlIterations);
        gl.uniform1f(uPart.distortBoost, cfg.distortBoost);
        gl.uniform1f(uPart.noiseBoost, cfg.noiseBoost);
        gl.uniform1f(uPart.swirlBoost, cfg.swirlBoost);
        gl.uniform1f(uPart.glowIntensity, cfg.glowIntensity);
        var pc1 = hex2rgb(cfg.glowColors[0] || "#ffffff");
        var pc2 = hex2rgb(cfg.glowColors[1] || cfg.glowColors[0] || "#ffffff");
        var pc3 = hex2rgb(cfg.glowColors[2] || cfg.glowColors[0] || "#ffffff");
        gl.uniform3f(uPart.glowColor1, pc1[0], pc1[1], pc1[2]);
        gl.uniform3f(uPart.glowColor2, pc2[0], pc2[1], pc2[2]);
        gl.uniform3f(uPart.glowColor3, pc3[0], pc3[1], pc3[2]);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    if (reducedMotion) {
      // 单帧静态
      last = 0;
      running = true;
      frame(performance.now());
      cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    } else {
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    window.addEventListener("resize", function () { resizeAll(); }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 粒子化鲸鱼引擎（官方移植：HeroDigitileR3F → 原生 WebGL2）
   * 源码取自官网 harness 页懒加载 chunk 776（未进缓存，已从官网抓取）：
   *   - 粒子位置：官方算法从 hero-whale.svg 像素亮度采样（60x60，边缘保留）
   *   - 顶点/片元 shader：官方 GLSL 逐字移植（three.js 矩阵替换为原生 uniform）
   *   - 交互：鼠标扭曲粒子（radius/strength/decay/distort）、光线跟随鼠标
   *     （lightParams.followX）、入场组装动画、松散漂移、游泳波动
   *   - 参数：DIGITILE_LIGHT_DEFAULTS / DIGITILE_MOUSE_DEFAULTS 与官方一致
   * ------------------------------------------------------------------ */
  // 官方鲸鱼纹理（hero-whale.svg，抓自 https://www.deepseek.com/harness/images/hero-whale.svg）
  var WHALE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18" fill="none"><path d="M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746V14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z" fill="#FFFFFF"/></svg>';
  var WHALE_SRC = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(WHALE_SVG);
  // 官方参数（chunk 776 源码常量，fish 变体：shadeMin .2 / shadeMax .4*2.79）——原值，未调参
  var LIGHT_DEFAULTS = { x: 4.5, y: 5.5, z: 3, range: 14, shadeMin: 0.2, shadeMax: 1.116, followX: 1.05 };
  var MOUSE_DEFAULTS = { radius: 4.9, strength: 0.8, decay: 0.2, distort: 5 };
  var WAVE_DEFAULTS = { speed: 1.5, amount: 0.06 };

  function sampleWhalePixels(img) {
    var T = 60;
    var c = document.createElement("canvas");
    c.width = T; c.height = T;
    var a = c.getContext("2d");
    a.fillStyle = "#000"; a.fillRect(0, 0, T, T);
    var r = Math.min(T / img.width, T / img.height);
    var o = img.width * r, s = img.height * r;
    a.drawImage(img, (T - o) / 2, (T - s) / 2, o, s);
    var d = a.getImageData(0, 0, T, T);
    var lum = new Float32Array(T * T);
    for (var i = 0; i < T * T; i++) lum[i] = (0.299 * d.data[4*i] + 0.587 * d.data[4*i+1] + 0.114 * d.data[4*i+2]) / 255;
    var positions = [], scattered = [], opacities = [], edges = [];
    var half = T / 2;
    function isEdge(x, y) {
      for (var yy = -2; yy <= 2; yy++) for (var xx = -2; xx <= 2; xx++) {
        if (xx === 0 && yy === 0) continue;
        var nx = x + xx, ny = y + yy;
        if (nx < 0 || ny < 0 || nx >= T || ny >= T) continue;
        if (lum[ny * T + nx] > 0.2) return false;
      }
      return true;
    }
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) {
      var l = lum[y * T + x];
      if (l > 0.2 && !isEdge(x, y)) {
        positions.push((x - half) * 0.18, (half - y) * 0.18, 0);
        opacities.push(l);
        var ec = 0;
        for (var yy = -1; yy <= 1; yy++) for (var xx = -1; xx <= 1; xx++) {
          if (xx === 0 && yy === 0) continue;
          var nx = x + xx, ny = y + yy;
          if (nx < 0 || ny < 0 || nx >= T || ny >= T || lum[ny * T + nx] <= 0.2) ec++;
        }
        edges.push(ec / 8);
        var phi = Math.random() * Math.PI * 2;
        var th = Math.acos(2 * Math.random() - 1);
        var rad = 3 * (0.4 + 0.6 * Math.random());
        scattered.push(Math.sin(th) * Math.cos(phi) * rad, Math.sin(th) * Math.sin(phi) * rad, Math.cos(th) * rad * 0.5);
      }
    }
    return {
      positions: new Float32Array(positions),
      scatteredPositions: new Float32Array(scattered),
      opacities: new Float32Array(opacities),
      edges: new Float32Array(edges),
      count: positions.length / 3
    };
  }

  // ---- 官方 shader（GLSL 逐字移植，three.js 内建矩阵换为原生 uniform） ----
  var WHALE_VS = "#version 300 es\n" +
    "precision highp float;\n" +
    "in vec3 position;\n" +
    "in float aOpacity;\n" +
    "in float aIndex;\n" +
    "in float aEdge;\n" +
    "in vec3 aScattered;\n" +
    "in vec3 aCenter;\n" +
    "in float aScale;\n" +
    "uniform float uTime;\n" +
    "uniform float uWaveSpeed;\n" +
    "uniform float uWaveAmount;\n" +
    "uniform vec2 uMouse;\n" +
    "uniform float uMouseRadius;\n" +
    "uniform float uMouseStrength;\n" +
    "uniform float uMouseDistort;\n" +
    "uniform float uAssembly;\n" +
    "uniform float uLoose;\n" +
    "uniform float uScatter;\n" +
    "uniform vec3 uLightPos;\n" +
    "uniform float uLightRange;\n" +
    "uniform float uShadeMin;\n" +
    "uniform float uShadeMax;\n" +
    "uniform mat4 uModel;\n" +
    "uniform mat4 uView;\n" +
    "uniform mat4 uProj;\n" +
    "uniform float uPointScale;\n" +
    "out float vOpacity;\n" +
    "out vec3 vWorldPos;\n" +
    "out float vAssembly;\n" +
    "out float vLight;\n" +
    "void main() {\n" +
    "  vOpacity = aOpacity;\n" +
    "  vAssembly = uAssembly;\n" +
    "  vec3 targetCenter = aCenter;\n" +
    "  vec3 localOffset = position * aScale;\n" +
    "  vec3 scatteredCenter = aScattered;\n" +
    "  float assembly = smoothstep(0.0, 1.0, uAssembly);\n" +
    "  vec3 center = mix(scatteredCenter, targetCenter, assembly);\n" +
    "  vec3 pos = center + localOffset;\n" +
    "  vWorldPos = center;\n" +
    "  float loose = uLoose * mix(0.25, 1.0, aEdge) * assembly;\n" +
    "  if (loose > 0.001) {\n" +
    "    vec3 jitter = vec3(\n" +
    "      fract(sin(aIndex * 12.9898) * 43758.5453) - 0.5,\n" +
    "      fract(sin(aIndex * 78.2330) * 12543.1230) - 0.5,\n" +
    "      fract(sin(aIndex * 39.4250) * 26711.7700) - 0.5\n" +
    "    );\n" +
    "    pos += jitter * 0.05 * loose;\n" +
    "    pos.x += sin(uTime * 0.50 + aIndex * 0.53) * 0.06 * loose;\n" +
    "    pos.y += cos(uTime * 0.42 + aIndex * 0.71) * 0.06 * loose;\n" +
    "    pos.z += sin(uTime * 0.36 + aIndex * 0.91) * 0.08 * loose;\n" +
    "    float tail = smoothstep(0.5, 4.5, targetCenter.x) * uLoose * assembly;\n" +
    "    pos.y += sin(uTime * 1.1 - targetCenter.x * 0.7) * 0.1 * tail;\n" +
    "    pos.z += cos(uTime * 0.9 - targetCenter.x * 0.55) * 0.06 * tail;\n" +
    "  }\n" +
    "  if (uScatter > 0.001) {\n" +
    "    float disperse = uScatter * mix(0.5, 1.0, aEdge);\n" +
    "    pos += (scatteredCenter - center) * disperse;\n" +
    "    pos.z += sin(uTime * 0.6 + aIndex * 0.3) * disperse * 0.6;\n" +
    "  }\n" +
    "  if (assembly > 0.95) {\n" +
    "    float effectStrength = (assembly - 0.95) * 20.0;\n" +
    "    float dist = length(center.xy);\n" +
    "    float waveFade = smoothstep(0.0, 3.0, dist);\n" +
    "    float wave = sin(dist * 3.0 - uTime * uWaveSpeed) * uWaveAmount * effectStrength * waveFade;\n" +
    "    pos.z += wave;\n" +
    "  }\n" +
    "  if (assembly > 0.8) {\n" +
    "    float mouseEffect = (assembly - 0.8) * 5.0;\n" +
    "    vec2 toMouse = center.xy - uMouse;\n" +
    "    float mouseDist = length(toMouse);\n" +
    "    if (mouseDist < uMouseRadius && mouseDist > 0.001) {\n" +
    "      float t = 1.0 - mouseDist / uMouseRadius;\n" +
    "      float force = t * t * t * mouseEffect * uMouseStrength;\n" +
    "      vec2 radialDir = toMouse / mouseDist;\n" +
    "      float noiseAngle = sin(aIndex * 0.37 + uTime * 0.5) * uMouseDistort;\n" +
    "      float ca = cos(noiseAngle);\n" +
    "      float sa = sin(noiseAngle);\n" +
    "      vec2 pushDir = vec2(radialDir.x * ca - radialDir.y * sa, radialDir.x * sa + radialDir.y * ca);\n" +
    "      pos.xy += pushDir * force * 2.0;\n" +
    "      pos.z += sin(aIndex * 1.7 + uTime) * force * 0.8;\n" +
    "    }\n" +
    "  }\n" +
    "  if (assembly < 0.9) {\n" +
    "    float scatter = smoothstep(0.9, 0.0, assembly);\n" +
    "    pos.x += sin(uTime * 0.5 + aIndex * 0.1) * 0.2 * scatter;\n" +
    "    pos.y += cos(uTime * 0.4 + aIndex * 0.07) * 0.2 * scatter;\n" +
    "    pos.z += sin(uTime * 0.3 + aIndex * 0.13) * 0.15 * scatter;\n" +
    "  }\n" +
    "  vec4 worldPos = uModel * vec4(pos, 1.0);\n" +
    "  float lightDist = distance(worldPos.xyz, uLightPos);\n" +
    "  float lit = clamp(1.0 - lightDist / uLightRange, 0.0, 1.0);\n" +
    "  vLight = mix(uShadeMin, uShadeMax, lit * lit);\n" +
    "  vec4 mvPosition = uView * uModel * vec4(pos, 1.0);\n" +
    "  gl_PointSize = max(1.0, uPointScale * aScale);\n" +
    "  gl_Position = uProj * mvPosition;\n" +
    "}\n";

  var WHALE_FS = "#version 300 es\n" +
    "precision highp float;\n" +
    "in float vOpacity;\n" +
    "in vec3 vWorldPos;\n" +
    "in float vAssembly;\n" +
    "in float vLight;\n" +
    "uniform float uTime;\n" +
    "uniform vec3 uColor;\n" +
    "out vec4 fragColor;\n" +
    "void main() {\n" +
    "  float dist = length(vWorldPos.xy);\n" +
    "  float glow = smoothstep(8.0, 0.0, dist) * 0.3 * vAssembly;\n" +
    "  float baseAlpha = mix(0.45, 0.75, vAssembly);\n" +
    "  float alpha = vOpacity * (baseAlpha + glow);\n" +
    "  float shimmer = sin(uTime * 1.5 + vWorldPos.x * 5.0 + vWorldPos.y * 3.0) * 0.1 + 0.9;\n" +
    "  alpha *= shimmer * min(vLight, 1.0);\n" +
    "  vec3 color = (uColor + glow * vec3(0.2, 0.3, 0.5)) * vLight;\n" +
    "  color = mix(color, color * vec3(1.07, 1.02, 0.94), clamp(vLight - 1.0, 0.0, 1.0));\n" +
    "  fragColor = vec4(color, alpha);\n" +
    "}\n";

  // ---- 4x4 矩阵工具（列主序，与 WebGL uniform 一致） ----
  function m4Identity() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function m4Mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c*4+r] = a[0*4+r]*b[c*4+0] + a[1*4+r]*b[c*4+1] + a[2*4+r]*b[c*4+2] + a[3*4+r]*b[c*4+3];
    }
    return o;
  }
  function m4Translation(tx, ty, tz) {
    var m = m4Identity(); m[12] = tx; m[13] = ty; m[14] = tz; return m;
  }
  function m4RotationX(a) { var c = Math.cos(a), s = Math.sin(a); var m = m4Identity(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function m4RotationY(a) { var c = Math.cos(a), s = Math.sin(a); var m = m4Identity(); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function m4RotationZ(a) { var c = Math.cos(a), s = Math.sin(a); var m = m4Identity(); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
  function m4Scale(s) { var m = m4Identity(); m[0] = s; m[5] = s; m[10] = s; return m; }
  function m4Perspective(fovY, aspect, near, far) {
    var f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
    return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
  }
  function m4Inverse(m) {
    var o = new Float32Array(16);
    var i = new Float32Array([m[0],m[4],m[8],m[12], m[1],m[5],m[9],m[13], m[2],m[6],m[10],m[14], m[3],m[7],m[11],m[15]]);
    var d = 1 / (i[0]*i[5]*i[10]*i[15] - i[0]*i[5]*i[11]*i[14] - i[0]*i[9]*i[6]*i[15] + i[0]*i[9]*i[7]*i[14] +
                i[0]*i[13]*i[6]*i[11] - i[0]*i[13]*i[7]*i[10] - i[4]*i[1]*i[10]*i[15] + i[4]*i[1]*i[11]*i[14] +
                i[4]*i[9]*i[2]*i[15] - i[4]*i[9]*i[3]*i[14] - i[4]*i[13]*i[2]*i[11] + i[4]*i[13]*i[3]*i[10] +
                i[8]*i[1]*i[6]*i[15] - i[8]*i[1]*i[7]*i[14] - i[8]*i[5]*i[2]*i[15] + i[8]*i[5]*i[3]*i[14] +
                i[8]*i[13]*i[2]*i[7] - i[8]*i[13]*i[3]*i[6] - i[12]*i[1]*i[6]*i[11] + i[12]*i[1]*i[7]*i[10] +
                i[12]*i[5]*i[2]*i[11] - i[12]*i[5]*i[3]*i[10] - i[12]*i[9]*i[2]*i[7] + i[12]*i[9]*i[3]*i[6]);
    o[0] = (i[5]*i[10]*i[15] - i[5]*i[11]*i[14] - i[9]*i[6]*i[15] + i[9]*i[7]*i[14] + i[13]*i[6]*i[11] - i[13]*i[7]*i[10]) * d;
    o[4] = (-i[4]*i[10]*i[15] + i[4]*i[11]*i[14] + i[8]*i[6]*i[15] - i[8]*i[7]*i[14] - i[12]*i[6]*i[11] + i[12]*i[7]*i[10]) * d;
    o[8] = (i[4]*i[9]*i[15] - i[4]*i[11]*i[13] - i[8]*i[5]*i[15] + i[8]*i[7]*i[13] + i[12]*i[5]*i[11] - i[12]*i[9]*i[7]) * d;
    o[12] = (-i[4]*i[9]*i[14] + i[4]*i[10]*i[13] + i[8]*i[5]*i[14] - i[8]*i[6]*i[13] - i[12]*i[5]*i[10] + i[12]*i[9]*i[6]) * d;
    o[1] = (-i[1]*i[10]*i[15] + i[1]*i[11]*i[14] + i[9]*i[2]*i[15] - i[9]*i[3]*i[14] - i[13]*i[2]*i[11] + i[13]*i[3]*i[10]) * d;
    o[5] = (i[0]*i[10]*i[15] - i[0]*i[11]*i[14] - i[8]*i[2]*i[15] + i[8]*i[3]*i[14] + i[12]*i[2]*i[11] - i[12]*i[3]*i[10]) * d;
    o[9] = (-i[0]*i[9]*i[15] + i[0]*i[11]*i[13] + i[8]*i[1]*i[15] - i[8]*i[3]*i[13] - i[12]*i[1]*i[11] + i[12]*i[9]*i[3]) * d;
    o[13] = (i[0]*i[9]*i[14] - i[0]*i[10]*i[13] - i[8]*i[1]*i[14] + i[8]*i[2]*i[13] + i[12]*i[1]*i[10] - i[12]*i[9]*i[2]) * d;
    o[2] = (i[1]*i[6]*i[15] - i[1]*i[7]*i[14] - i[5]*i[2]*i[15] + i[5]*i[3]*i[14] + i[13]*i[2]*i[7] - i[13]*i[3]*i[6]) * d;
    o[6] = (-i[0]*i[6]*i[15] + i[0]*i[7]*i[14] + i[4]*i[2]*i[15] - i[4]*i[3]*i[14] - i[12]*i[2]*i[7] + i[12]*i[3]*i[6]) * d;
    o[10] = (i[0]*i[5]*i[15] - i[0]*i[7]*i[13] - i[4]*i[1]*i[15] + i[4]*i[3]*i[13] + i[12]*i[1]*i[7] - i[12]*i[5]*i[3]) * d;
    o[14] = (-i[0]*i[5]*i[14] + i[0]*i[6]*i[13] + i[4]*i[1]*i[14] - i[4]*i[2]*i[13] - i[12]*i[1]*i[6] + i[12]*i[5]*i[2]) * d;
    o[3] = (-i[1]*i[6]*i[11] + i[1]*i[7]*i[10] + i[5]*i[2]*i[11] - i[5]*i[3]*i[10] - i[9]*i[2]*i[7] + i[9]*i[3]*i[6]) * d;
    o[7] = (i[0]*i[6]*i[11] - i[0]*i[7]*i[10] - i[4]*i[2]*i[11] + i[4]*i[3]*i[10] + i[8]*i[2]*i[7] - i[8]*i[3]*i[6]) * d;
    o[11] = (-i[0]*i[5]*i[11] + i[0]*i[7]*i[9] + i[4]*i[1]*i[11] - i[4]*i[3]*i[9] - i[8]*i[1]*i[7] + i[8]*i[5]*i[3]) * d;
    o[15] = (i[0]*i[5]*i[10] - i[0]*i[6]*i[9] - i[4]*i[1]*i[10] + i[4]*i[2]*i[9] + i[8]*i[1]*i[6] - i[8]*i[5]*i[2]) * d;
    return o;
  }

  function startWhale() {
    var canvas = whaleCanvas;
    // premultipliedAlpha:true —— three.js WebGLRenderer 官方默认值，
    // 与官网 R3F 渲染管线一致（gl: {alpha:true, antialias:true}）
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) { canvas.dataset.state = "no-webgl2"; return; }
    diag.whaleGL = true;
    var img = new Image();
    img.onload = function () {
      var data;
      try { data = sampleWhalePixels(img); } catch (e) { canvas.dataset.state = "sample-fail"; return; }
      if (!data || data.count === 0) { canvas.dataset.state = "sample-empty"; return; }
      canvas.dataset.count = data.count;
      initWhaleGL(gl, canvas, data);
    };
    img.onerror = function () { canvas.dataset.state = "img-fail"; };
    img.src = WHALE_SRC;
  }

  function initWhaleGL(gl, canvas, data) {
    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        if (typeof console !== "undefined") console.error("whale shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, WHALE_VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, WHALE_FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.state = "link-fail";
      diag.whaleProgs = "link-fail";
      return;
    }
    canvas.dataset.state = "shader-ok";
    diag.whaleProgs = "ok";
    gl.useProgram(prog);

    function buf(attr, arr, size) {
      var loc = gl.getAttribLocation(prog, attr);
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
    buf("aCenter", data.positions, 3);
    buf("aScattered", data.scatteredPositions, 3);
    buf("aOpacity", data.opacities, 1);
    buf("aEdge", data.edges, 1);
    var idx = new Float32Array(data.count);
    for (var i = 0; i < data.count; i++) idx[i] = i;
    buf("aIndex", idx, 1);
    // 官方实例缩放：s = .5 + 1*Math.random()（0.5–1.5）——粒子大小有变化，
    // 大粒子呈现小方块，是官方鲸鱼层次感的关键（chunk 776 源码原逻辑）
    var scaleArr = new Float32Array(data.count);
    for (var i2 = 0; i2 < data.count; i2++) scaleArr[i2] = 0.5 + 1 * Math.random();
    buf("aScale", scaleArr, 1);
    // position 属性默认 (0,0,0,1) —— 官方 BoxGeometry 的局部偏移对点精灵为 0

    var u = {};
    ["uTime","uWaveSpeed","uWaveAmount","uMouse","uMouseRadius","uMouseStrength","uMouseDistort",
     "uAssembly","uLoose","uScatter","uLightPos","uLightRange","uShadeMin","uShadeMax",
     "uModel","uView","uProj","uPointScale","uColor"].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // three.js AdditiveBlending
    gl.disable(gl.DEPTH_TEST);

    // 鼠标状态机（官方：mouseActive / mouseHasMoved）
    var mouse = { x: 0, y: 0, active: false, hasMoved: false };
    function onMove(e) {
      mouse.active = true;
      mouse.hasMoved = true;
      var w = window.innerWidth || 1, h = window.innerHeight || 1;
      mouse.x = (e.clientX / w) * 2 - 1;
      mouse.y = -((e.clientY / h) * 2 - 1);
    }
    function onLeave() { mouse.active = false; }
    function onVis() { if (document.hidden) mouse.active = false; }
    if (!reducedMotion) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      document.addEventListener("visibilitychange", onVis);
    }

    var start = performance.now();
    var raf = 0;
    var last = 0;
    var FRAME = 1000 / 30;
    var strength = 0;
    var b = { x: 0, y: 0 };
    var FOV = 50 * Math.PI / 180;
    // 相机距离：官方 18 → 15（18/15 = 1.2），鲸鱼整体等比放大 1.2 倍
    var CAM_DIST = 15;
    var HALF_H = Math.tan(FOV / 2) * CAM_DIST; // viewport（z=0 平面）半高
    var view = m4Translation(0, 0, -15);

    function resize() {
      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (whaleLayer.style.display === "none") return;
      if (now - last < FRAME) return;
      var dt = Math.min(0.5, (now - last) / 1000);
      last = now - (now - last) % FRAME;

      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      if (Math.round(w * Math.min(window.devicePixelRatio || 1, 1.5)) !== canvas.width) resize();

      var elapsed = (now - start) / 1000;
      var L = Math.max(0, Math.min(1, (elapsed - 0.3) / 2.5));
      var D = 1 - Math.pow(1 - L, 3); // 官方 easeOutCubic 组装
      var E = 0; // 固定背景无滚动分散

      // 官方 group 变换（fish：spin=false）
      var rotZ = elapsed * ((1 - D) * 0.3) + 0.04 * Math.sin(0.25 * elapsed);
      var rotX = 0.05 * Math.sin(0.08 * elapsed * 0.7);
      var rotY = 0.1 * Math.sin(0.08 * elapsed);
      var posY = 0.15 * Math.sin(0.4 * elapsed);
      var scale = 0.75 + 0.25 * D;
      var model = m4Mul(m4Mul(m4Translation(0, posY, 0),
        m4Mul(m4RotationZ(rotZ), m4Mul(m4RotationY(rotY), m4RotationX(rotX)))), m4Scale(scale));

      var aspect = canvas.width / canvas.height;
      var proj = m4Perspective(FOV, aspect, 0.1, 100);
      gl.uniformMatrix4fv(u.uModel, false, model);
      gl.uniformMatrix4fv(u.uView, false, view);
      gl.uniformMatrix4fv(u.uProj, false, proj);
      gl.uniform1f(u.uTime, elapsed);
      gl.uniform1f(u.uWaveSpeed, WAVE_DEFAULTS.speed);
      gl.uniform1f(u.uWaveAmount, WAVE_DEFAULTS.amount);
      gl.uniform1f(u.uAssembly, D);
      gl.uniform1f(u.uLoose, 1);
      gl.uniform1f(u.uScatter, 0);
      gl.uniform1f(u.uMouseRadius, MOUSE_DEFAULTS.radius);
      gl.uniform1f(u.uMouseDistort, MOUSE_DEFAULTS.distort);
      // 鼠标强度：官方以 (1-0.05^dt) 插值
      var target = mouse.active ? MOUSE_DEFAULTS.strength : 0;
      strength += (target - strength) * (1 - Math.pow(0.05, dt));
      gl.uniform1f(u.uMouseStrength, strength);
      // 光线：官方 lightParams.followX —— light.x 跟随鼠标世界坐标
      var halfW = HALF_H * aspect;
      gl.uniform3f(u.uLightPos, LIGHT_DEFAULTS.x + mouse.x * halfW * LIGHT_DEFAULTS.followX, LIGHT_DEFAULTS.y, LIGHT_DEFAULTS.z);
      gl.uniform1f(u.uLightRange, LIGHT_DEFAULTS.range);
      gl.uniform1f(u.uShadeMin, LIGHT_DEFAULTS.shadeMin);
      gl.uniform1f(u.uShadeMax, LIGHT_DEFAULTS.shadeMax);
      // uMouse：屏幕鼠标 → 世界(z=0) → 组局部空间（官方 matrixWorld 逆变换）
      if (mouse.hasMoved) {
        var wx = mouse.x * halfW, wy = mouse.y * HALF_H;
        if (strength < 0.01) { b.x = wx; b.y = wy; }
        else { b.x += (wx - b.x) * MOUSE_DEFAULTS.decay; b.y += (wy - b.y) * MOUSE_DEFAULTS.decay; }
      }
      var inv = m4Inverse(model);
      var ux = inv[0]*b.x + inv[4]*b.y + inv[12];
      var uy = inv[1]*b.x + inv[5]*b.y + inv[13];
      gl.uniform2f(u.uMouse, ux, uy);
      // 颜色：官方 uColor = (.75P, .8P, .9P)，P = D*max(0,1-1.5E)
      gl.uniform3f(u.uColor, 0.75 * D, 0.8 * D, 0.9 * D);
      // 点尺寸：官方 BoxGeometry 0.06 单位 × 实例缩放 × 组缩放
      gl.uniform1f(u.uPointScale, 0.06 * scale * (canvas.height / (2 * HALF_H)));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, data.count);
    }

    if (reducedMotion) {
      start = performance.now() - 30000; // 组装动画已完成的状态下绘制单帧
      last = 0;
      frame(performance.now());
      cancelAnimationFrame(raf);
      raf = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 星座网格引擎（2D canvas）
   * ------------------------------------------------------------------ */
  function startConstellation() {
    var canvas = constellationCanvas;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    diag.constellation = true;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dots = [], cols = 0, rows = 0;
    var mouse = { x: NaN, y: NaN };
    var raf = 0;
    var idle = false;
    var last = 0;
    var FRAME = 1000 / 30;
    var resizeTimer = null;

    function buildGrid() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      cols = Math.ceil(w / 90) + 1;
      rows = Math.ceil(h / 90) + 1;
      var ox = (w - (cols - 1) * 90) / 2;
      var oy = (h - (rows - 1) * 90) / 2;
      dots = [];
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var rx = ox + 90 * x, ry = oy + 90 * y;
          dots.push({ restX: rx, restY: ry, x: rx, y: ry, vx: 0, vy: 0 });
        }
      }
    }
    function resize() {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }
    resize();

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      wake();
    }
    if (!reducedMotion) window.addEventListener("mousemove", onMove, { passive: true });

    function draw(mx, my, active) {
      var opts = currentConstellation();
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = opts.lineColor + " " + opts.lineOpacity + ")";
      ctx.lineWidth = 0.5;
      var i, j, a, b, dx, dy, dist, ux, uy;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols - 1; i++) {
          a = dots[j * cols + i]; b = dots[j * cols + i + 1];
          dx = b.x - a.x; dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) continue;
          ux = dx / dist; uy = dy / dist;
          ctx.beginPath();
          ctx.moveTo(a.x + 10 * ux, a.y + 10 * uy);
          ctx.lineTo(b.x - 10 * ux, b.y - 10 * uy);
          ctx.stroke();
        }
      }
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows - 1; j++) {
          a = dots[j * cols + i]; b = dots[(j + 1) * cols + i];
          dx = b.x - a.x; dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) continue;
          ux = dx / dist; uy = dy / dist;
          ctx.beginPath();
          ctx.moveTo(a.x + 10 * ux, a.y + 10 * uy);
          ctx.lineTo(b.x - 10 * ux, b.y - 10 * uy);
          ctx.stroke();
        }
      }

      ctx.fillStyle = opts.dotColor + " " + opts.dotOpacity + ")";
      for (i = 0; i < dots.length; i++) {
        var p = dots[i];
        var n = 1.8, alpha = opts.dotOpacity;
        if (!isNaN(mx) && !isNaN(my)) {
          dx = p.x - mx; dy = p.y - my;
          dist = Math.sqrt(dx * dx + dy * dy);
          var l = Math.max(0, 1 - dist / 140);
          n = 1.8 + 2 * l;
          alpha = opts.dotOpacity + 0.4 * l;
        }
        ctx.globalAlpha = alpha;
        if (opts.round) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, n, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(p.x - n, p.y - n, 2 * n, 2 * n);
        }
      }
      ctx.globalAlpha = 1;
    }

    function wake() {
      if (idle) {
        idle = false;
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    }

    function loop(now) {
      if (!state.dark) { raf = requestAnimationFrame(loop); return; }
      if (now - last < FRAME) { raf = requestAnimationFrame(loop); return; }
      last = now - (now - last) % FRAME;

      // 布局未就绪时补一次尺寸同步
      if (Math.round(canvas.clientWidth * dpr) !== canvas.width ||
          Math.round(canvas.clientHeight * dpr) !== canvas.height) {
        resize();
      }

      var mx = mouse.x, my = mouse.y;
      var maxSpeed = 0;
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        if (!isNaN(mx) && !isNaN(my)) {
          var dx = p.x - mx, dy = p.y - my;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140 && d > 0.1) {
            var e = (1 - d / 140) * 30;
            var ux = dx / d, uy = dy / d;
            p.vx += ux * e * 0.1;
            p.vy += uy * e * 0.1;
          }
        }
        p.vx += 0.05 * (p.restX - p.x);
        p.vy += 0.05 * (p.restY - p.y);
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
        var sp = Math.abs(p.vx) + Math.abs(p.vy);
        if (sp > maxSpeed) maxSpeed = sp;
      }
      draw(mx, my, true);
      if (maxSpeed < 0.01) {
        idle = true;
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    if (reducedMotion) {
      draw(NaN, NaN, false); // 静态单帧
    } else {
      idle = false;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        wake();
      }, 150);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 主题联动
   * ------------------------------------------------------------------ */
  function observeTheme() {
    var apply = function () {
      var d = detectDark();
      if (d !== state.dark) {
        state.dark = d;
        applyThemeClass();
        try{ refreshBeamTheme(); }catch(e){}
      } else {
        // even if dark didn't change, beam light/dark still follows state.dark, but ensure styles exist for initial light case
        try{ if (beamAttachedCard) refreshBeamTheme(); }catch(e){}
      }
    };
    if (window.MutationObserver) {
      var mo = new MutationObserver(apply);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme", "class"] });
      if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme"] });
      else document.addEventListener("DOMContentLoaded", function () { mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme"] }); });
    }
    if (darkQuery && darkQuery.addEventListener) {
      darkQuery.addEventListener("change", apply);
    }
  }

  boot();
}

    exports.apply = apply;
    return module.exports;
  }
});
