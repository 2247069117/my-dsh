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
    // 设置页面板需要 React（平台 seed 模块）；拿不到就跳过设置 UI，不影响背景效果
    var react = null;
    try { react = require("react"); } catch (e) {}
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
  /* GPU 优化：全高侧边栏 blur 跟随设置面板（--dsh-bg-blur，默认 8px） */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px));
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px));
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
  /* GPU 优化：输入卡片背后有滚动文字，模糊最可见；强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
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
  /* GPU 优化：气泡数量多且背后是平滑极光；强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
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
  /* GPU 优化：代码块数量多；强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* ============ 工具调用行统一透明与悬浮交互（彻底消除 Bash 等黑框框） ============ */
body[data-ds-dark-theme] .CY-8Ka_card,
body[data-ds-dark-theme] .o3BgMG_root,
body[data-ds-dark-theme] .ztWv_q_callRow,
body[data-ds-dark-theme] .Md3f7G_callRow {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

body[data-ds-dark-theme] .CY-8Ka_root,
body[data-ds-dark-theme] .o3BgMG_row {
  background: transparent !important;
  border-radius: 6px !important;
  transition: background 0.15s ease !important;
}
body[data-ds-dark-theme] .CY-8Ka_root:hover,
body[data-ds-dark-theme] .o3BgMG_row:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 展开后的终端与输出卡片（保持深邃毛玻璃） */
body[data-ds-dark-theme] .CY-8Ka_terminal,
body[data-ds-dark-theme] .CY-8Ka_ioCard,
body[data-ds-dark-theme] .o3BgMG_ioCard {
  background: rgba(13, 15, 19, 0.65) !important;
  /* GPU 优化：终端/输出卡片，强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.08) !important;
  border-radius: 10px !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.06), 0 4px 16px rgba(0, 0, 0, 0.25) !important;
}

/* ============ Thinking Orbs (orbs.jakubantalik.com 移植) & Deep diving... 状态栏深色适配 ============ */
.dsh-thinking-orb-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex: none;
  vertical-align: middle;
  -webkit-text-fill-color: initial !important;
  transition: filter 0.25s ease;
  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.7));
}
.dsh-thinking-orb-wrap[data-state="searching"] { filter: drop-shadow(0 0 7px rgba(59, 130, 246, 0.85)); }
.dsh-thinking-orb-wrap[data-state="solving"] { filter: drop-shadow(0 0 7px rgba(52, 211, 153, 0.85)); }
.dsh-thinking-orb-wrap[data-state="listening"] { filter: drop-shadow(0 0 7px rgba(56, 189, 248, 0.85)); }
.dsh-thinking-orb-wrap[data-state="connecting"] { filter: drop-shadow(0 0 7px rgba(168, 85, 247, 0.9)); }
.dsh-thinking-orb-wrap[data-state="weaving"] { filter: drop-shadow(0 0 7px rgba(236, 72, 153, 0.9)); }
.dsh-thinking-orb-wrap[data-state="composing"] { filter: drop-shadow(0 0 7px rgba(251, 146, 60, 0.9)); }
.dsh-thinking-orb-wrap[data-state="breathing"] { filter: drop-shadow(0 0 7px rgba(255, 122, 41, 0.9)); }
.dsh-thinking-orb-wrap[data-state="shaping"] { filter: drop-shadow(0 0 7px rgba(96, 165, 250, 0.85)); }
.dsh-thinking-orb-wrap[data-state="working"] { filter: drop-shadow(0 0 7px rgba(59, 130, 246, 0.8)); }

.dsh-thinking-orb-canvas {
  width: 20px;
  height: 20px;
  display: block;
}

body[data-ds-dark-theme] .Md3f7G_turnStatus {
  display: inline-flex !important;
  align-items: center !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 24px !important;
  background: linear-gradient(90deg, #4d8bf5 0%, #60a5fa 35%, #ffffff 50%, #60a5fa 65%, #4d8bf5 100%) !important;
  background-size: 250% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  animation: 1.8s linear infinite Md3f7G_dsh-turn-status-shimmer !important;
  filter: drop-shadow(0 0 10px rgba(77, 139, 245, 0.45)) !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 4px 0 !important;
}

body[data-ds-dark-theme] .dsh-turn-status-text {
  display: inline !important;
  background: inherit !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
}

body[data-ds-dark-theme] .Md3f7G_turnStatusClock {
  font-size: 12px !important;
  font-variant-numeric: tabular-nums !important;
  color: rgba(255, 255, 255, 0.6) !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.6) !important;
  margin-left: 8px !important;
  font-weight: 400 !important;
  filter: none !important;
}

body[data-ds-dark-theme] [data-plan-mode="1"] .Md3f7G_turnStatus,
body[data-ds-dark-theme] .Md3f7G_turnStatus[data-planning] {
  background: linear-gradient(90deg, #ff7a29 0%, #ff9d42 35%, #fff1d6 50%, #ff9d42 65%, #ff7a29 100%) !important;
  background-size: 250% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(0 0 10px rgba(255, 122, 41, 0.5)) !important;
}

/* ============ 计划待审框 (Plan Review Card) ============ */
body[data-ds-dark-theme] .LVzXQa_card,
body[data-ds-dark-theme] [data-slot="plan-review"] > div {
  background: rgba(13, 15, 19, 0.68) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid rgba(255, 150, 40, 0.25) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 150, 40, 0.15) !important;
}
body[data-ds-dark-theme] .LVzXQa_strip {
  background: rgba(255, 140, 40, 0.12) !important;
  color: #ff9d42 !important;
}
body[data-ds-dark-theme] .LVzXQa_dot {
  background: #ff7a29 !important;
  box-shadow: 0 0 8px rgba(255, 122, 41, 0.8) !important;
}

/* ============ 任务清单框 (Todo List Dock & Panel) ============ */
body[data-ds-dark-theme] ._7yHdaG_panel,
body[data-ds-dark-theme] [data-slot="conversation.input.dock"] ._7yHdaG_panel {
  background: rgba(13, 15, 19, 0.65) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.08) !important;
  border-bottom: none !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25) !important;
}
body[data-ds-dark-theme] ._7yHdaG_header:hover {
  background: rgba(255, 255, 255, 0.04) !important;
}
body[data-ds-dark-theme] ._7yHdaG_row:hover {
  background: rgba(255, 255, 255, 0.03) !important;
}

/* ============ 提问框 (Ask User Question Card) ============ */
body[data-ds-dark-theme] .Mbwy4a_card,
body[data-ds-dark-theme] [data-slot="user-questions"] > div {
  background: rgba(13, 15, 19, 0.68) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.1) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* ============ 授权/审批卡片与设置弹窗 ============ */
body[data-ds-dark-theme] .VOzbGW_panel,
body[data-ds-dark-theme] [data-slot="approval"] > div {
  background: rgba(13, 15, 19, 0.75) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.1) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
  border-radius: 16px !important;
}

/* ============ 发送按钮与交互微动效 ============ */
body[data-ds-dark-theme] .uV2eYG_primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35) !important;
  border-radius: 999px !important;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease, box-shadow 0.2s ease !important;
}
body[data-ds-dark-theme] .uV2eYG_primary:hover:not(:disabled) {
  transform: scale(1.05) !important;
  filter: brightness(1.15) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5) !important;
}
body[data-ds-dark-theme] .uV2eYG_primary:active:not(:disabled) {
  transform: scale(0.95) !important;
}
body[data-ds-dark-theme] [data-composer-card="true"][data-planning] .uV2eYG_primary,
body[data-ds-dark-theme] .uV2eYG_card[data-planning] .uV2eYG_primary {
  background: linear-gradient(135deg, #ff5a36, #ff9500) !important;
  box-shadow: 0 2px 12px rgba(255, 90, 54, 0.45) !important;
}

/* ============ 玻璃开关（body.dsh-bg-no-glass）：移除 backdrop blur，垫实底色保可读性 ============ */
body[data-ds-dark-theme].dsh-bg-no-glass .pI_x6G_sidebarCol::before {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: transparent !important;
}
body[data-ds-dark-theme].dsh-bg-no-glass .pI_x6G_sidebarCol {
  background: rgba(13, 15, 19, 0.92) !important;
}
body[data-ds-dark-theme].dsh-bg-no-glass .uV2eYG_card,
body[data-ds-dark-theme].dsh-bg-no-glass [data-composer-card="true"],
body[data-ds-dark-theme].dsh-bg-no-glass .gdEzaW_bubble,
body[data-ds-dark-theme].dsh-bg-no-glass ._block_10eou_7,
body[data-ds-dark-theme].dsh-bg-no-glass ._block_biesw_7,
body[data-ds-dark-theme].dsh-bg-no-glass ._block_srovd_7,
body[data-ds-dark-theme].dsh-bg-no-glass ._block_s66q0_7,
body[data-ds-dark-theme].dsh-bg-no-glass ._block_178r4_4,
body[data-ds-dark-theme].dsh-bg-no-glass ._block_d4nqi_7,
body[data-ds-dark-theme].dsh-bg-no-glass ._body_1ye18_20,
body[data-ds-dark-theme].dsh-bg-no-glass ._copyButton_10eou_142,
body[data-ds-dark-theme].dsh-bg-no-glass ._bannerWrap_178r4_21,
body[data-ds-dark-theme].dsh-bg-no-glass .LVzXQa_card,
body[data-ds-dark-theme].dsh-bg-no-glass .Mbwy4a_card,
body[data-ds-dark-theme].dsh-bg-no-glass ._7yHdaG_panel,
body[data-ds-dark-theme].dsh-bg-no-glass .VOzbGW_panel,
body[data-ds-dark-theme].dsh-bg-no-glass .CY-8Ka_ioCard,
body[data-ds-dark-theme].dsh-bg-no-glass .o3BgMG_ioCard {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: rgba(13, 15, 19, 0.92) !important;
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
function apply(ctx) {
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
   * GPU 特效设置（设置页「背景特效」面板 + 运行时联动）
   *   档位预设 → 独立开关（自动转自定义）→ 高级参数 → 低电量自动节能
   *   全部即时生效、localStorage 持久化（dsh-bg-settings）
   * ===================================================================== */
  var SETTINGS_KEY = "dsh-bg-settings";
  var PRESETS = {
    // 全特效：极光分辨率与玻璃模糊全部拉满（滑杆上限 1.0x / 12px）
    full: { label: "全特效", aurora: true, whale: true, constellation: true, beam: true, glass: true, orbs: true, mouse: true, auroraScale: 1, fps: 30, blur: 12 },
    half: { label: "均衡", aurora: true, whale: false, constellation: true, beam: true, glass: true, orbs: true, mouse: true, auroraScale: 0.55, fps: 24, blur: 8 },
    eco:  { label: "节能", aurora: false, whale: false, constellation: false, beam: false, glass: true, orbs: false, mouse: false, auroraScale: 0.4, fps: 20, blur: 6 }
  };
  var wakeConstellationRef = null;
  var shellGlassApplyRef = null; // 指向 makeShellTransparent 内部的玻璃应用函数（供设置切换即时重跑）
  var batteryState = null;
  var batteryLowApplied = false;
  var lastManualMode = null;

  function loadSettings() {
    var d = { mode: "full", autoBattery: false };
    var parsed = null;
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (e) {}
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.mode === "string") d.mode = parsed.mode;
      if (typeof parsed.autoBattery === "boolean") d.autoBattery = parsed.autoBattery;
    }
    if (PRESETS[d.mode]) {
      // 档位模式：数值全部跟随预设（预设调整后自动生效，无需清理旧缓存）
      var p = PRESETS[d.mode];
      for (var k in p) if (k !== "label") d[k] = p[k];
    } else {
      // 自定义模式：全特效为底，叠加保存过的数值
      d.mode = "custom";
      var base = PRESETS.full;
      for (var k2 in base) if (k2 !== "label") d[k2] = base[k2];
      if (parsed && typeof parsed === "object") {
        for (var k3 in parsed) if (Object.prototype.hasOwnProperty.call(parsed, k3)) d[k3] = parsed[k3];
      }
    }
    return d;
  }
  var bgSettings = loadSettings();

  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(bgSettings)); } catch (e) {} }
  function estimateGpu() {
    var s = bgSettings, score = 0;
    if (s.aurora) score += 52 * Math.min(1.2, (s.auroraScale || 0.75) / 0.75);
    if (s.whale) score += 20;
    if (s.constellation) score += 9;
    if (s.mouse) score += 4; // 极光 flowmap 笔刷 pass + 交互物理
    if (s.beam) score += 8;
    if (s.glass) score += 9 * Math.min(1.6, (s.blur || 8) / 8);
    if (s.orbs) score += 2;
    score *= ((s.fps || 30) / 30);
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  function snapshotSettings() {
    return {
      mode: bgSettings.mode,
      aurora: !!bgSettings.aurora, whale: !!bgSettings.whale, constellation: !!bgSettings.constellation,
      beam: !!bgSettings.beam, glass: !!bgSettings.glass, orbs: !!bgSettings.orbs, mouse: !!bgSettings.mouse,
      auroraScale: bgSettings.auroraScale, fps: bgSettings.fps, blur: bgSettings.blur,
      autoBattery: !!bgSettings.autoBattery,
      gpu: estimateGpu(),
      canvasW: auroraCanvas ? auroraCanvas.width : 0,
      canvasH: auroraCanvas ? auroraCanvas.height : 0
    };
  }
  var settingsListeners = [];
  function notifySettings() { for (var i = 0; i < settingsListeners.length; i++) { try { settingsListeners[i](); } catch (e) {} } }
  function subscribeSettings(fn) {
    settingsListeners.push(fn);
    return function () { var i = settingsListeners.indexOf(fn); if (i >= 0) settingsListeners.splice(i, 1); };
  }
  function applyPreset(mode) {
    var p = PRESETS[mode]; if (!p) return;
    for (var k in p) if (k !== "label") bgSettings[k] = p[k];
    bgSettings.mode = mode;
    commitSettings();
  }
  function updateSetting(key, value) { bgSettings[key] = value; bgSettings.mode = "custom"; commitSettings(); }
  function resetSettings() { applyPreset("full"); bgSettings.autoBattery = false; commitSettings(); }
  function commitSettings() { saveSettings(); applyBgSettings(); notifySettings(); }

  /** 鲸鱼层显隐：深色主题 + 设置开关 双重条件 */
  function updateWhaleDisplay() {
    if (!whaleLayer) return;
    whaleLayer.style.display = (state.dark && bgSettings.whale) ? "flex" : "none";
  }

  /** 把每个子系统立即切换到当前设置 */
  function applyBgSettings() {
    try { document.body.classList.toggle("dsh-bg-no-glass", !bgSettings.glass); } catch (e) {}
    try { updateWhaleDisplay(); } catch (e) {}
    try {
      if (bgSettings.beam) watchBeamComposer();
      else detachComposerBeam();
    } catch (e) {}
    try { if (shellGlassApplyRef) shellGlassApplyRef(); } catch (e) {} // 玻璃内联样式按开关重跑一次（轮询由 makeShellTransparent 持有）
    try { syncThinkingOrb(); } catch (e) {}
    try { if (bgSettings.constellation && wakeConstellationRef) wakeConstellationRef(); } catch (e) {}
    if (bgSettings.autoBattery) { try { initBatteryAuto(); } catch (e) {} }
    else { try { disableBatteryAuto(); } catch (e) {} }
  }

  /* ---- 低电量自动节能（Battery API，不支持则静默跳过） ---- */
  function initBatteryAuto() {
    if (batteryState || !navigator.getBattery) return;
    navigator.getBattery().then(function (b) {
      if (!bgSettings.autoBattery) return;
      var onB = function () {
        var low = !b.charging && b.level <= 0.2;
        if (low && !batteryLowApplied) {
          if (bgSettings.mode !== "eco") lastManualMode = bgSettings.mode;
          batteryLowApplied = true;
          applyPreset("eco");
        } else if (!low && batteryLowApplied) {
          batteryLowApplied = false;
          if (lastManualMode && PRESETS[lastManualMode]) { applyPreset(lastManualMode); lastManualMode = null; }
        }
      };
      batteryState = { b: b, onB: onB };
      try {
        b.addEventListener("levelchange", onB);
        b.addEventListener("chargingchange", onB);
      } catch (e) {}
      onB();
    }).catch(function () {});
  }
  function disableBatteryAuto() {
    if (!batteryState) return;
    try {
      batteryState.b.removeEventListener("levelchange", batteryState.onB);
      batteryState.b.removeEventListener("chargingchange", batteryState.onB);
    } catch (e) {}
    batteryState = null;
  }

  /* ---- 设置页「背景特效」面板 ---- */
  var SETTINGS_UI_CSS = [
    ".dsh-bg-settings{display:flex;flex-direction:column;gap:14px;max-width:560px;padding-bottom:28px;}",
    ".dsh-bg-settings h3{margin:0;font-size:15px;font-weight:600;line-height:22px;}",
    ".dsh-bg-card{border:1px solid rgba(128,128,128,.22);border-radius:12px;padding:12px 14px;background:rgba(128,128,128,.06);}",
    ".dsh-bg-presets{display:flex;gap:8px;}",
    ".dsh-bg-preset{flex:1;cursor:pointer;border:1px solid rgba(128,128,128,.25);background:transparent;color:inherit;border-radius:10px;padding:8px 10px;font-size:13px;font-family:inherit;text-align:left;transition:border-color .15s,background .15s;}",
    ".dsh-bg-preset:hover{background:rgba(128,128,128,.1);}",
    ".dsh-bg-preset[data-active=\"true\"]{border-color:#4d8bf5;color:#6ea8ff;background:rgba(77,139,245,.12);}",
    ".dsh-bg-meter{height:8px;border-radius:4px;background:rgba(128,128,128,.18);overflow:hidden;}",
    ".dsh-bg-meter>div{height:100%;border-radius:4px;transition:width .25s ease,background .25s ease;}",
    ".dsh-bg-meter-label{display:flex;justify-content:space-between;font-size:12px;opacity:.75;margin-bottom:6px;}",
    ".dsh-bg-row{display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid rgba(128,128,128,.12);}",
    ".dsh-bg-row:last-child{border-bottom:none;}",
    ".dsh-bg-row-info{flex:1;min-width:0;}",
    ".dsh-bg-row-title{font-size:13px;font-weight:500;}",
    ".dsh-bg-row-desc{font-size:12px;opacity:.65;margin-top:2px;}",
    ".dsh-bg-chip{font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid rgba(128,128,128,.3);opacity:.85;margin-left:8px;white-space:nowrap;}",
    ".dsh-bg-chip[data-level=\"high\"]{color:#ff9d6b;border-color:rgba(255,140,80,.4);}",
    ".dsh-bg-chip[data-level=\"mid\"]{color:#ffd166;border-color:rgba(255,200,90,.4);}",
    ".dsh-bg-chip[data-level=\"low\"]{color:#7ee2a8;border-color:rgba(110,220,160,.4);}",
    ".dsh-bg-switch{position:relative;width:36px;height:20px;flex:none;cursor:pointer;border-radius:999px;border:none;background:rgba(128,128,128,.3);transition:background .15s;padding:0;}",
    ".dsh-bg-switch[aria-checked=\"true\"]{background:#4d8bf5;}",
    ".dsh-bg-switch::after{content:\"\";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s ease;}",
    ".dsh-bg-switch[aria-checked=\"true\"]::after{transform:translateX(16px);}",
    ".dsh-bg-slider{width:100%;accent-color:#4d8bf5;}",
    ".dsh-bg-select{background:transparent;color:inherit;border:1px solid rgba(128,128,128,.3);border-radius:8px;padding:4px 8px;font-size:12px;font-family:inherit;}",
    ".dsh-bg-adv summary{cursor:pointer;font-size:13px;opacity:.8;user-select:none;}",
    ".dsh-bg-adv-row{display:flex;align-items:center;gap:12px;padding:8px 0;font-size:13px;}",
    ".dsh-bg-adv-row>span{flex:1;}",
    ".dsh-bg-reset{cursor:pointer;border:1px solid rgba(128,128,128,.3);background:transparent;color:inherit;border-radius:10px;padding:7px 16px;font-size:13px;font-family:inherit;}",
    ".dsh-bg-reset:hover{background:rgba(128,128,128,.1);}",
    ".dsh-bg-note{font-size:11px;opacity:.55;line-height:1.5;}",
    "@media (prefers-reduced-motion: reduce){.dsh-bg-meter>div{transition:none;}}"
  ].join("\n");

  function injectSettingsCss() {
    try {
      if (document.getElementById("dsh-bg-settings-css")) return;
      var tag = document.createElement("style");
      tag.id = "dsh-bg-settings-css";
      tag.textContent = SETTINGS_UI_CSS;
      document.head.appendChild(tag);
    } catch (e) {}
  }

  function BgSettingsSection() {
    var h = react.createElement;
    var snapState = react.useState(snapshotSettings());
    var snap = snapState[0];
    var setSnap = snapState[1];
    react.useEffect(function () {
      return subscribeSettings(function () { setSnap(snapshotSettings()); });
    }, []);
    var gpu = snap.gpu;
    var meterColor = gpu < 35 ? "#4ade80" : (gpu < 60 ? "#facc15" : "#fb7185");
    var presetIds = ["full", "half", "eco"];
    var presetNames = { full: "全特效", half: "均衡", eco: "节能" };
    var presetDescs = {
      full: "全部特效，观感最佳",
      half: "保留极光/星座/玻璃，关闭鲸鱼与 Orbs",
      eco: "仅保留玻璃与静态深色背景"
    };
    var rows = [
      { key: "aurora", title: "极光背景", desc: "WebGL2 流体渐变，本插件最大 GPU 开销", level: "high" },
      { key: "whale", title: "粒子鲸鱼", desc: "全屏 WebGL2 点阵粒子，光线跟随鼠标", level: "mid" },
      { key: "constellation", title: "星座网格", desc: "2D 网格，鼠标斥力弹簧物理", level: "low" },
      { key: "mouse", title: "鼠标跟随交互", desc: "极光笔刷流场 / 鲸鱼光线与粒子扭曲 / 星座斥力", level: "low" },
      { key: "beam", title: "Border Beam 光效", desc: "输入框边界旋转光晕与打字呼吸", level: "mid" },
      { key: "glass", title: "玻璃拟态", desc: "侧边栏/气泡/代码块的 backdrop blur", level: "mid" },
      { key: "orbs", title: "Thinking Orbs", desc: "状态栏 3D 点阵活动指示器", level: "low" }
    ];
    var levelText = { high: "高", mid: "中", low: "低" };
    function presetButtons() {
      return presetIds.map(function (id) {
        return h("button", {
          key: id,
          type: "button",
          className: "dsh-bg-preset",
          "data-active": snap.mode === id,
          onClick: function () { applyPreset(id); }
        },
          h("div", { style: { fontWeight: 600, fontSize: 13 } }, presetNames[id]),
          h("div", { style: { fontSize: 11, opacity: 0.65, marginTop: 3 } }, presetDescs[id]));
      });
    }
    function switchBtn(key) {
      return h("button", {
        type: "button",
        className: "dsh-bg-switch",
        role: "switch",
        "aria-checked": snap[key] ? "true" : "false",
        "aria-label": "开关",
        onClick: function () { updateSetting(key, !snap[key]); }
      });
    }
    function rowEl(row) {
      return h("div", { key: row.key, className: "dsh-bg-row" },
        h("div", { className: "dsh-bg-row-info" },
          h("div", { className: "dsh-bg-row-title" }, row.title,
            h("span", { className: "dsh-bg-chip", "data-level": row.level }, levelText[row.level] + "负载")),
          h("div", { className: "dsh-bg-row-desc" }, row.desc)),
        switchBtn(row.key));
    }
    return h("div", { className: "dsh-bg-settings" },
      h("h3", null, "DeepSeek 背景特效"),
      h("div", { className: "dsh-bg-card" },
        h("div", { style: { fontSize: 13, fontWeight: 500, marginBottom: 8 } }, "性能档位"),
        h("div", { className: "dsh-bg-presets" }, presetButtons()),
        h("div", { className: "dsh-bg-meter-label", style: { marginTop: 12 } },
          h("span", null, "估算 GPU 负载"),
          h("span", null, gpu + "%")),
        h("div", { className: "dsh-bg-meter" }, h("div", { style: { width: gpu + "%", background: meterColor } })),
        h("div", { className: "dsh-bg-note", style: { marginTop: 6 } },
          "按分辨率 × 帧率 × 模糊半径估算，仅供参考；切换即时生效并自动保存。")),
      h("div", { className: "dsh-bg-card" },
        h("div", { style: { fontSize: 13, fontWeight: 500, marginBottom: 4 } }, "特效开关（手动调整后自动转为「自定义」档位）"),
        rows.map(rowEl)),
      h("details", { className: "dsh-bg-adv dsh-bg-card" },
        h("summary", null, "渲染质量（高级）"),
        h("div", { className: "dsh-bg-adv-row" },
          h("span", null, "极光分辨率"),
          h("input", { type: "range", className: "dsh-bg-slider", min: 0.4, max: 1, step: 0.05, value: snap.auroraScale,
            onChange: function (e) { updateSetting("auroraScale", parseFloat(e.target.value)); } }),
          h("span", { style: { width: 52, textAlign: "right", fontSize: 12, opacity: 0.75 } }, "×" + snap.auroraScale.toFixed(2))),
        h("div", { className: "dsh-bg-adv-row" },
          h("span", null, "动画帧率上限"),
          h("select", { className: "dsh-bg-select", value: snap.fps,
            onChange: function (e) { updateSetting("fps", parseInt(e.target.value, 10)); } },
            h("option", { value: 20 }, "20 fps（最省）"),
            h("option", { value: 24 }, "24 fps"),
            h("option", { value: 30 }, "30 fps（流畅）"))),
        h("div", { className: "dsh-bg-adv-row" },
          h("span", null, "玻璃模糊强度"),
          h("select", { className: "dsh-bg-select", value: snap.blur,
            onChange: function (e) { updateSetting("blur", parseInt(e.target.value, 10)); } },
            h("option", { value: 6 }, "6 px（最省）"),
            h("option", { value: 8 }, "8 px"),
            h("option", { value: 10 }, "10 px"),
            h("option", { value: 12 }, "12 px（最通透）"))),
        h("div", { className: "dsh-bg-adv-row" },
          h("div", { style: { flex: 1 } },
            h("div", { style: { fontSize: 13 } }, "低电量自动节能"),
            h("div", { style: { fontSize: 11, opacity: 0.6 } }, "电量 ≤20% 且未充电时切到节能档，恢复后还原")),
          switchBtn("autoBattery")),
        h("div", { className: "dsh-bg-adv-row" },
          h("span", null, "当前极光画布"),
          h("span", { style: { width: 140, textAlign: "right", fontSize: 12, opacity: 0.75 } },
            snap.canvasW + "×" + snap.canvasH + " (" + snap.auroraScale.toFixed(2) + "x)"))),
      h("div", { className: "dsh-bg-adv-row", style: { justifyContent: "space-between" } },
        h("button", { type: "button", className: "dsh-bg-reset", onClick: function () { resetSettings(); } }, "恢复默认"),
        h("span", { className: "dsh-bg-note" }, "v1.7.0 · 即时生效")));
  }

  /** 注册设置页条目（需要 slots 服务；缺 ctx/slots 时静默跳过） */
  function setupSettingsUi(ctx) {
    if (!react) return;
    try {
      var slots = ctx && ctx.get ? ctx.get("slots") : null;
      if (!slots) return;
      injectSettingsCss();
      slots.inject("settings.section", function () {
        return slots.register({
          name: "settings.section",
          id: "dsh-bg-effects",
          order: 5,
          label: function () { return "背景特效"; }
        }, BgSettingsSection);
      });
    } catch (e) {}
  }


/* ===================================================================== *
 * Border Beam (beam.jakubantalik.com) — ported for DSH composer
 * Copyright (c) Jakub Antalik, MIT — https://github.com/Jakubantalik/Libraries
 * Variant: md conic-gradient / colorful, mono, sunset, duration 2.45s, 0.8x
 * ===================================================================== */
  var BEAM_ID = "dsh-composer";
  var BEAM_DURATION = 2.45; // 0.8x md full border
  var BEAM_HUE_RANGE = 30;
  var BEAM_BRIGHTNESS = 1.3;
  var BEAM_CFG_DARK = { stroke: 0.26, inner: 0.42, bloom: 0.24, innerShadow: "rgba(255, 255, 255, 0.27)" };
  var BEAM_CFG_LIGHT = { stroke: 0.12, inner: 0.26, bloom: 0.34, innerShadow: "rgba(0, 0, 0, 0.14)" };

  var colorPalettes = {
    colorful: {
      border: [
        { color: "rgb(255, 50, 100)", pos: "33% -7.4%", size: "70px 40px" },
        { color: "rgb(40, 140, 255)", pos: "12% -5%", size: "60px 35px" },
        { color: "rgb(50, 200, 80)", pos: "2.1% 68.3%", size: "40px 70px" },
        { color: "rgb(30, 185, 170)", pos: "2.1% 68.3%", size: "20px 35px" },
        { color: "rgb(100, 70, 255)", pos: "74.4% 100%", size: "180px 32px" },
        { color: "rgb(40, 140, 255)", pos: "55% 100%", size: "85px 26px" },
        { color: "rgb(255, 120, 40)", pos: "93.9% 0%", size: "74px 32px" },
        { color: "rgb(240, 50, 180)", pos: "100% 27.1%", size: "26px 42px" },
        { color: "rgb(180, 40, 240)", pos: "100% 27.1%", size: "52px 48px" }
      ]
    },
    mono: {
      border: [
        { color: "rgb(180, 180, 180)", pos: "33% -7.4%", size: "70px 40px" },
        { color: "rgb(140, 140, 140)", pos: "12% -5%", size: "60px 35px" },
        { color: "rgb(160, 160, 160)", pos: "2.1% 68.3%", size: "40px 70px" },
        { color: "rgb(130, 130, 130)", pos: "2.1% 68.3%", size: "20px 35px" },
        { color: "rgb(170, 170, 170)", pos: "74.4% 100%", size: "180px 32px" },
        { color: "rgb(150, 150, 150)", pos: "55% 100%", size: "85px 26px" },
        { color: "rgb(190, 190, 190)", pos: "93.9% 0%", size: "74px 32px" },
        { color: "rgb(145, 145, 145)", pos: "100% 27.1%", size: "26px 42px" },
        { color: "rgb(165, 165, 165)", pos: "100% 27.1%", size: "52px 48px" }
      ]
    },
    sunset: {
      border: [
        { color: "rgb(255, 80, 50)", pos: "33% -7.4%", size: "70px 40px" },
        { color: "rgb(255, 160, 40)", pos: "12% -5%", size: "60px 35px" },
        { color: "rgb(255, 120, 60)", pos: "2.1% 68.3%", size: "40px 70px" },
        { color: "rgb(255, 200, 50)", pos: "2.1% 68.3%", size: "20px 35px" },
        { color: "rgb(255, 100, 80)", pos: "74.4% 100%", size: "180px 32px" },
        { color: "rgb(255, 180, 60)", pos: "55% 100%", size: "85px 26px" },
        { color: "rgb(255, 60, 60)", pos: "93.9% 0%", size: "74px 32px" },
        { color: "rgb(255, 140, 50)", pos: "100% 27.1%", size: "26px 42px" },
        { color: "rgb(255, 90, 70)", pos: "100% 27.1%", size: "52px 48px" }
      ]
    }
  };

  function getColorGradients(variant, isDark, id) {
    var _v = variant || "colorful";
    var pal = (colorPalettes[_v] || colorPalettes.colorful).border;
    return pal.map(function(c) {
      return "radial-gradient(ellipse " + c.size + " at " + c.pos + ", " + c.color + ", transparent)";
    }).join(",\n    ");
  }

  function getInnerGradients(variant, isDark, id) {
    var _v = variant || "colorful";
    var pal = (colorPalettes[_v] || colorPalettes.colorful).border;
    var baseOpacity = _v === "mono" ? 0.225 : 0.45;
    return pal.map(function(c) {
      var rgba = c.color.replace("rgb(", "rgba(").replace(")", ", " + baseOpacity + ")");
      var sz = c.size.split(" ").map(function(s) { return Math.round(parseInt(s) * 0.9) + "px"; }).join(" ");
      return "radial-gradient(ellipse " + sz + " at " + c.pos + ", " + rgba + ", transparent)";
    }).join(",\n    ");
  }

  function buildBeamCSS(id, borderRadius, isDark, variant) {
    variant = variant || "colorful";
    var cfg = isDark ? BEAM_CFG_DARK : BEAM_CFG_LIGHT;
    var sat = isDark ? 1.2 : 1.5;
    var innerRadius = Math.max(0, borderRadius - 1);
    var hueAnim = "animation: beam-hue-shift-" + id + " 12s ease-in-out infinite;";
    var hueKeyframes = "@keyframes beam-hue-shift-" + id + " {\n" +
      "  0% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) - " + BEAM_HUE_RANGE + "deg)) brightness(" + BEAM_BRIGHTNESS.toFixed(2) + ") saturate(" + sat.toFixed(2) + "); }\n" +
      "  50% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) + " + BEAM_HUE_RANGE + "deg)) brightness(" + BEAM_BRIGHTNESS.toFixed(2) + ") saturate(" + sat.toFixed(2) + "); }\n" +
      "  100% { filter: hue-rotate(calc(var(--beam-hue-base, 0deg) - " + BEAM_HUE_RANGE + "deg)) brightness(" + BEAM_BRIGHTNESS.toFixed(2) + ") saturate(" + sat.toFixed(2) + "); }\n" +
      "}";

    var whiteGrad = isDark
      ? "conic-gradient(\n" +
        "  from var(--beam-angle-" + id + "),\n" +
        "  transparent 0%, transparent 54%,\n" +
        "  rgba(255, 255, 255, 0.1) 57%,\n" +
        "  rgba(255, 255, 255, 0.3) 60%,\n" +
        "  rgba(255, 255, 255, 0.6) 63%,\n" +
        "  rgba(255, 255, 255, 0.75) 66%,\n" +
        "  rgba(255, 255, 255, 0.6) 69%,\n" +
        "  rgba(255, 255, 255, 0.3) 72%,\n" +
        "  rgba(255, 255, 255, 0.1) 75%,\n" +
        "  transparent 78%, transparent 100%\n" +
        ")"
      : "conic-gradient(\n" +
        "  from var(--beam-angle-" + id + "),\n" +
        "  transparent 0%, transparent 54%,\n" +
        "  rgba(0, 0, 0, 0.08) 57%,\n" +
        "  rgba(0, 0, 0, 0.2) 60%,\n" +
        "  rgba(0, 0, 0, 0.4) 63%,\n" +
        "  rgba(0, 0, 0, 0.55) 66%,\n" +
        "  rgba(0, 0, 0, 0.4) 69%,\n" +
        "  rgba(0, 0, 0, 0.2) 72%,\n" +
        "  rgba(0, 0, 0, 0.08) 75%,\n" +
        "  transparent 78%, transparent 100%\n" +
        ")";

    var colorGrads, innerGrads;
    if (variant === "sunset") {
      colorGrads = "conic-gradient(from var(--beam-angle-" + id + "), transparent 0%, transparent 45%, rgb(255, 60, 20) 50%, rgb(255, 90, 0) 55%, rgb(220, 40, 0) 60%, transparent 65%, transparent 100%)";
      innerGrads = "conic-gradient(from var(--beam-angle-" + id + "), transparent 0%, transparent 45%, rgba(255, 60, 20, 0.6) 50%, rgba(255, 90, 0, 0.5) 55%, transparent 65%)";
    } else {
      colorGrads = getColorGradients(variant, isDark, id);
      innerGrads = getInnerGradients(variant, isDark, id);
    }

    var bloomGrad = isDark
      ? "conic-gradient(\n" +
        "  from var(--beam-angle-" + id + "),\n" +
        "  transparent 0%, transparent 58%,\n" +
        "  rgba(255, 255, 255, 0.03) 62%,\n" +
        "  rgba(255, 255, 255, 0.08) 65%,\n" +
        "  rgba(255, 255, 255, 0.2) 67%,\n" +
        "  rgba(255, 255, 255, 0.45) 69%,\n" +
        "  rgba(255, 255, 255, 0.85) 70%,\n" +
        "  rgba(255, 255, 255, 0.85) 70.5%,\n" +
        "  rgba(255, 255, 255, 0.45) 71.5%,\n" +
        "  rgba(255, 255, 255, 0.2) 73%,\n" +
        "  rgba(255, 255, 255, 0.08) 75%,\n" +
        "  rgba(255, 255, 255, 0.03) 78%,\n" +
        "  transparent 82%\n" +
        ")"
      : "conic-gradient(\n" +
        "  from var(--beam-angle-" + id + "),\n" +
        "  transparent 0%, transparent 58%,\n" +
        "  rgba(0, 0, 0, 0.02) 62%,\n" +
        "  rgba(0, 0, 0, 0.08) 65%,\n" +
        "  rgba(0, 0, 0, 0.2) 67%,\n" +
        "  rgba(0, 0, 0, 0.4) 69%,\n" +
        "  rgba(0, 0, 0, 0.6) 70%,\n" +
        "  rgba(0, 0, 0, 0.6) 70.5%,\n" +
        "  rgba(0, 0, 0, 0.4) 71.5%,\n" +
        "  rgba(0, 0, 0, 0.2) 73%,\n" +
        "  rgba(0, 0, 0, 0.08) 75%,\n" +
        "  rgba(0, 0, 0, 0.02) 78%,\n" +
        "  transparent 82%\n" +
        ")";

    return "@property --beam-angle-" + id + " {\n" +
      "  syntax: \"<angle>\";\n" +
      "  initial-value: 0deg;\n" +
      "  inherits: true;\n" +
      "}\n" +
      "@property --beam-opacity-" + id + " {\n" +
      "  syntax: \"<number>\";\n" +
      "  initial-value: 0;\n" +
      "  inherits: true;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"] {\n" +
      "  position: relative;\n" +
      "  border-radius: " + borderRadius + "px;\n" +
      "  overflow: visible;\n" +
      "  isolation: isolate;\n" +
      "  transition: --beam-strength 0.35s cubic-bezier(0.16, 1, 0.3, 1);\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"]:not([data-active]):not([data-pulse]):hover {\n" +
      "  --beam-strength: 0.22;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-active] {\n" +
      "  animation:\n" +
      "    beam-spin-" + id + " " + BEAM_DURATION + "s linear infinite,\n" +
      "    beam-fade-in-" + id + " 0.6s ease forwards;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-fading] {\n" +
      "  animation:\n" +
      "    beam-spin-" + id + " " + BEAM_DURATION + "s linear infinite,\n" +
      "    beam-fade-out-" + id + " 0.5s ease forwards;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-active]::after,\n" +
      "[data-beam=\"" + id + "\"][data-fading]::after,\n" +
      "[data-beam=\"" + id + "\"][data-typing]::after,\n" +
      "[data-beam=\"" + id + "\"][data-pulse]::after {\n" +
      "  content: \"\";\n" +
      "  position: absolute;\n" +
      "  inset: 0;\n" +
      "  border-radius: " + innerRadius + "px;\n" +
      "  padding: 1px;\n" +
      "  clip-path: inset(0 round " + borderRadius + "px);\n" +
      "  background: " + whiteGrad + ",\n" +
      "    " + colorGrads + ";\n" +
      "  -webkit-mask:\n" +
      "    conic-gradient(\n" +
      "      from var(--beam-angle-" + id + "),\n" +
      "      transparent 0%, transparent 30%,\n" +
      "      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n" +
      "      white 52%, white 80%,\n" +
      "      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n" +
      "      transparent 95%, transparent 100%\n" +
      "    ),\n" +
      "    linear-gradient(#fff 0 0) content-box,\n" +
      "    linear-gradient(#fff 0 0);\n" +
      "  -webkit-mask-composite: source-in, xor;\n" +
      "  mask:\n" +
      "    conic-gradient(\n" +
      "      from var(--beam-angle-" + id + "),\n" +
      "      transparent 0%, transparent 30%,\n" +
      "      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n" +
      "      white 52%, white 80%,\n" +
      "      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n" +
      "      transparent 95%, transparent 100%\n" +
      "    ),\n" +
      "    linear-gradient(#fff 0 0) content-box,\n" +
      "    linear-gradient(#fff 0 0);\n" +
      "  mask-composite: intersect, exclude;\n" +
      "  pointer-events: none;\n" +
      "  z-index: 2;\n" +
      "  opacity: calc(var(--beam-opacity-" + id + ") * " + cfg.stroke.toFixed(2) + " * var(--beam-stroke-opacity, 1) * var(--beam-strength, 1));\n" +
      "  " + hueAnim + "\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-active]::before,\n" +
      "[data-beam=\"" + id + "\"][data-fading]::before,\n" +
      "[data-beam=\"" + id + "\"][data-typing]::before,\n" +
      "[data-beam=\"" + id + "\"][data-pulse]::before {\n" +
      "  content: \"\";\n" +
      "  position: absolute;\n" +
      "  inset: 0;\n" +
      "  border-radius: " + borderRadius + "px;\n" +
      "  background: " + innerGrads + ";\n" +
      "  box-shadow: inset 0 0 9px 1px " + cfg.innerShadow + ";\n" +
      "  -webkit-mask-image:\n" +
      "    conic-gradient(\n" +
      "      from var(--beam-angle-" + id + "),\n" +
      "      transparent 0%, transparent 30%,\n" +
      "      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n" +
      "      white 52%, white 80%,\n" +
      "      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n" +
      "      transparent 95%, transparent 100%\n" +
      "    ),\n" +
      "    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),\n" +
      "    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);\n" +
      "  -webkit-mask-composite: source-in, source-over;\n" +
      "  mask-image:\n" +
      "    conic-gradient(\n" +
      "      from var(--beam-angle-" + id + "),\n" +
      "      transparent 0%, transparent 30%,\n" +
      "      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,\n" +
      "      white 52%, white 80%,\n" +
      "      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,\n" +
      "      transparent 95%, transparent 100%\n" +
      "    ),\n" +
      "    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),\n" +
      "    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);\n" +
      "  mask-composite: intersect, add;\n" +
      "  pointer-events: none;\n" +
      "  z-index: 1;\n" +
      "  opacity: calc(var(--beam-opacity-" + id + ") * " + cfg.inner.toFixed(2) + " * var(--beam-inner-opacity, 1) * var(--beam-strength, 1));\n" +
      "  clip-path: inset(0 round " + borderRadius + "px);\n" +
      "  " + hueAnim + "\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"] [data-beam-bloom] {\n" +
      "  display: none;\n" +
      "  position: absolute;\n" +
      "  inset: 0;\n" +
      "  border-radius: " + innerRadius + "px;\n" +
      "  clip-path: inset(0 round " + borderRadius + "px);\n" +
      "  background: " + bloomGrad + ";\n" +
      "  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n" +
      "  -webkit-mask-composite: xor;\n" +
      "  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);\n" +
      "  mask-composite: exclude;\n" +
      "  padding: 1px;\n" +
      "  filter: blur(8px) brightness(" + BEAM_BRIGHTNESS.toFixed(2) + ") saturate(" + sat.toFixed(2) + ");\n" +
      "  pointer-events: none;\n" +
      "  z-index: 3;\n" +
      "  opacity: 0;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-active] [data-beam-bloom],\n" +
      "[data-beam=\"" + id + "\"][data-fading] [data-beam-bloom],\n" +
      "[data-beam=\"" + id + "\"][data-typing] [data-beam-bloom],\n" +
      "[data-beam=\"" + id + "\"][data-pulse] [data-beam-bloom] {\n" +
      "  display: block;\n" +
      "  opacity: calc(var(--beam-opacity-" + id + ") * " + cfg.bloom.toFixed(2) + " * var(--beam-bloom-opacity, 1) * var(--beam-strength, 1));\n" +
      "}\n" +
      "@keyframes beam-spin-" + id + " {\n" +
      "  to { --beam-angle-" + id + ": 360deg; }\n" +
      "}\n" +
      "@keyframes beam-fade-in-" + id + " {\n" +
      "  to { --beam-opacity-" + id + ": 1; }\n" +
      "}\n" +
      "@keyframes beam-fade-out-" + id + " {\n" +
      "  from { --beam-opacity-" + id + ": 1; }\n" +
      "  to { --beam-opacity-" + id + ": 0; }\n" +
      "}\n" +
      hueKeyframes + "\n" +
      "/* Typing edge breathing override (stationary mono beam, no spin/rainbow) */\n" +
      "[data-beam=\"" + id + "\"][data-typing] {\n" +
      "  --beam-opacity-" + id + ": 1;\n" +
      "  animation: none !important;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-typing]::after {\n" +
      "  animation: beam-typing-stroke-breathe 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-typing]::before {\n" +
      "  animation: beam-typing-inner-breathe 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;\n" +
      "}\n" +
      "[data-beam=\"" + id + "\"][data-typing] [data-beam-bloom] {\n" +
      "  animation: beam-typing-bloom-breathe 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;\n" +
      "}\n" +
      "@keyframes beam-typing-stroke-breathe {\n" +
      "  0% {\n" +
      "    opacity: 0.35;\n" +
      "    filter: brightness(1);\n" +
      "  }\n" +
      "  30% {\n" +
      "    opacity: 1;\n" +
      "    filter: brightness(1.55);\n" +
      "  }\n" +
      "  100% {\n" +
      "    opacity: 0.55;\n" +
      "    filter: brightness(1.1);\n" +
      "  }\n" +
      "}\n" +
      "@keyframes beam-typing-inner-breathe {\n" +
      "  0% {\n" +
      "    opacity: 0.25;\n" +
      "    filter: brightness(1);\n" +
      "  }\n" +
      "  30% {\n" +
      "    opacity: 0.85;\n" +
      "    filter: brightness(1.4);\n" +
      "  }\n" +
      "  100% {\n" +
      "    opacity: 0.4;\n" +
      "    filter: brightness(1.05);\n" +
      "  }\n" +
      "}\n" +
      "@keyframes beam-typing-bloom-breathe {\n" +
      "  0% {\n" +
      "    opacity: 0.2;\n" +
      "    filter: blur(6px) brightness(1);\n" +
      "  }\n" +
      "  30% {\n" +
      "    opacity: 0.95;\n" +
      "    filter: blur(10px) brightness(1.6);\n" +
      "  }\n" +
      "  100% {\n" +
      "    opacity: 0.35;\n" +
      "    filter: blur(7px) brightness(1.15);\n" +
      "  }\n" +
      "}\n" +
      "/* Completion pulse flash */\n" +
      "[data-beam=\"" + id + "\"][data-pulse]::after,\n" +
      "[data-beam=\"" + id + "\"][data-pulse]::before,\n" +
      "[data-beam=\"" + id + "\"][data-pulse] [data-beam-bloom] {\n" +
      "  animation: beam-pulse-flash 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;\n" +
      "}\n" +
      "@keyframes beam-pulse-flash {\n" +
      "  0% {\n" +
      "    opacity: 1;\n" +
      "    filter: brightness(1.6) saturate(1.4);\n" +
      "    transform: scale(1);\n" +
      "  }\n" +
      "  30% {\n" +
      "    opacity: 1;\n" +
      "    filter: brightness(1.8) saturate(1.6);\n" +
      "    transform: scale(1.015);\n" +
      "  }\n" +
      "  100% {\n" +
      "    opacity: 0;\n" +
      "    filter: brightness(1) saturate(1);\n" +
      "    transform: scale(1);\n" +
      "  }\n" +
      "}\n" +
      "/* Paused rule */\n" +
      "[data-beam=\"" + id + "\"][data-paused],\n" +
      "[data-beam=\"" + id + "\"][data-paused]::after,\n" +
      "[data-beam=\"" + id + "\"][data-paused]::before,\n" +
      "[data-beam=\"" + id + "\"][data-paused] [data-beam-bloom] {\n" +
      "  animation-play-state: paused !important;\n" +
      "}\n" +
      "@media (prefers-reduced-motion: reduce) {\n" +
      "  [data-beam=\"" + id + "\"][data-active],\n" +
      "  [data-beam=\"" + id + "\"][data-fading],\n" +
      "  [data-beam=\"" + id + "\"][data-active]::after,\n" +
      "  [data-beam=\"" + id + "\"][data-fading]::after,\n" +
      "  [data-beam=\"" + id + "\"][data-active]::before,\n" +
      "  [data-beam=\"" + id + "\"][data-fading]::before,\n" +
      "  [data-beam=\"" + id + "\"][data-active] [data-beam-bloom],\n" +
      "  [data-beam=\"" + id + "\"][data-fading] [data-beam-bloom] {\n" +
      "    animation: none !important;\n" +
      "  }\n" +
      "}";
  }

  
/* ------------------------------------------------------------------ *
   * DOM 骨架
   * ------------------------------------------------------------------ */
  var container = document.createElement("div");
  container.id = "dsh-ds-bg";
  container.dataset.version = "26"; // 部署版本标记：页面控制台可查 document.getElementById('dsh-ds-bg')?.dataset.version
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
    updateWhaleDisplay(); // 深色主题 + 特效设置开关 共同决定鲸鱼显隐
    // 玻璃开关：body 类名由 CSS 接管（关闭时移除 backdrop blur、垫实底色）
    try { document.body.classList.toggle("dsh-bg-no-glass", !bgSettings.glass); } catch (e) {}
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
    function applyShellGlass() {
      // 玻璃开关关闭：走与浅色主题相同的清理路径（CSS 侧由 body.dsh-bg-no-glass 接管）
      if (!state.dark || !bgSettings.glass) {
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
        var glassEls0 = document.querySelectorAll(".gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, .LVzXQa_card, .Mbwy4a_card, ._7yHdaG_panel, .VOzbGW_panel, .CY-8Ka_ioCard, .o3BgMG_ioCard, [class$=\"_bubble\"], [class*=\"_block_\"], [class$=\"_bannerWrap\"], [class$=\"_copyButton\"]");
        for (var g0 = 0; g0 < glassEls0.length; g0++) clearInline(glassEls0[g0]);
        return;
      }
      // 玻璃模糊强度由设置面板实时控制（CSS 全部走 blur(var(--dsh-bg-blur))）
      try { document.body.style.setProperty("--dsh-bg-blur", (bgSettings.blur || 8) + "px"); } catch (e) {}
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
        card.style.setProperty("backdrop-filter", "blur(" + (bgSettings.blur || 8) + "px)", "important");
        card.style.setProperty("-webkit-backdrop-filter", "blur(" + (bgSettings.blur || 8) + "px)", "important");
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
      var glassEls = document.querySelectorAll(".gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, .LVzXQa_card, .Mbwy4a_card, ._7yHdaG_panel, .VOzbGW_panel, .CY-8Ka_ioCard, .o3BgMG_ioCard, [class$=\"_bubble\"], [class*=\"_block_\"], [class$=\"_bannerWrap\"], [class$=\"_copyButton\"]");
      for (var gi = 0; gi < glassEls.length; gi++) {
        var ge = glassEls[gi];
        if (ge && ge.style) {
          ge.style.setProperty("background", glassBg, "important");
          ge.style.setProperty("backdrop-filter", "blur(" + (bgSettings.blur || 8) + "px)", "important");
          ge.style.setProperty("-webkit-backdrop-filter", "blur(" + (bgSettings.blur || 8) + "px)", "important");
          ge.style.setProperty("box-shadow", glassRing, "important");
        }
      }
    }
    applyShellGlass();
    shellGlassApplyRef = applyShellGlass; // 暴露给设置开关：切换玻璃时立即重跑
    var tries = 0;
    var timer = setInterval(function () {
      applyShellGlass();
      if (++tries > 75) clearInterval(timer); // 最多约 60s
    }, 800);
    if (window.MutationObserver) {
      var mo = new MutationObserver(applyShellGlass);
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
  var pendingExecuting = false;
  var pendingTimer = null;
  var beamPollTimer = null;
  var beamTypingHandler = null;
  var beamKeydownHandler = null;
  var typingActive = false;
  var typingTimer = null;
  var currentBeamMode = "hairline";
  var pulseTimer = null;
  var beamState = { mode: "hairline", idleStrength: 0.65, focusStrength: 1.0, disabled: false };

  function isBeamDisabled() {
    // 设置面板的 Beam 开关优先；URL/localStorage 逃生舱保留
    if (bgSettings && bgSettings.beam === false) return true;
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

  function ensureBeamStyles(borderRadius, variant) {
    var isDark = getBeamThemeIsDark();
    var r = typeof borderRadius === "number" ? borderRadius : 16;
    var v = variant || "colorful";
    var css = buildBeamCSS(BEAM_ID, r, isDark, v);
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

  function triggerTypingBreathe() {
    var card = beamAttachedCard || document.querySelector('[data-composer-card="true"], .uV2eYG_card');
    if (!card || isExecuting()) return;
    typingActive = true;
    if (currentBeamMode !== "typing" && !isExecuting()) {
      applyBeamMode("typing");
    }
    // Refresh breathing animation by toggling data-typing
    card.removeAttribute("data-typing");
    void card.offsetWidth;
    card.setAttribute("data-typing", "");

    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(function() {
      typingActive = false;
      if (!isExecuting()) {
        updateBeamState();
      }
    }, 700);
  }

  function isPlanMode() {
    try {
      if (document.querySelector('[aria-label*="plan mode 已开启"], [aria-label*="Plan mode on"], [aria-label*="plan mode is on"], [aria-label*="Plan Mode on"]')) return true;
      if (document.querySelector('[data-slot="plan"]')) return true;
      if (document.documentElement.dataset && document.documentElement.dataset.planMode === "1") return true;
    } catch(e) {}
    return false;
  }

  function isRealExecuting() {
    try {
      var stopBtn = document.querySelector('button[aria-label*="停止生成"], button[aria-label*="Stop generating"], button[aria-label*="Stop generating message"], [data-composer-card] button[aria-label*="停止"], [data-composer-card] button[aria-label*="Stop"]');
      if (stopBtn && !stopBtn.disabled) return true;
      var statusEl = document.querySelector('[data-state="running"], .Md3f7G_turnStatus');
      if (statusEl && statusEl.offsetParent !== null) return true;
    } catch(e) {}
    return false;
  }

  function isExecuting() {
    try {
      if (pendingExecuting) return true;
      return isRealExecuting();
    } catch(e) { return false; }
  }

  function applyBeamMode(mode) {
    var card = beamAttachedCard;
    if (!card) return;

    currentBeamMode = mode;

    if (pulseTimer) {
      clearTimeout(pulseTimer);
      pulseTimer = null;
    }
    if (mode === "pulse") {
      pendingExecuting = false;
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
    }

    var isDark = getBeamThemeIsDark();
    var r = resolveBorderRadius(card);
    var variant = mode === "typing" ? "mono" : (mode === "planning" ? "sunset" : "colorful");
    ensureBeamStyles(r, variant);

    // Clean state attributes and inline style overrides
    card.removeAttribute("data-active");
    card.removeAttribute("data-fading");
    card.removeAttribute("data-typing");
    card.removeAttribute("data-planning");
    card.removeAttribute("data-pulse");
    card.removeAttribute("data-paused");
    card.style.removeProperty("filter");
    card.style.removeProperty("--beam-hue-base");

    if (mode === "hairline") {
      card.setAttribute("data-beam", BEAM_ID);
      card.style.removeProperty("--beam-strength");
      card.style.setProperty("--beam-strength", "0.08");
      return;
    }

    if (mode === "typing") {
      card.setAttribute("data-beam", BEAM_ID);
      card.setAttribute("data-typing", "");
      card.removeAttribute("data-active");
      card.style.setProperty("--beam-strength", "0.85");
      card.style.setProperty("--beam-hue-base", "0deg");
      return;
    }

    if (mode === "planning") {
      card.setAttribute("data-beam", BEAM_ID);
      card.setAttribute("data-planning", "");
      card.setAttribute("data-active", "");
      card.style.setProperty("--beam-strength", "1");
      card.style.setProperty("--beam-hue-base", "15deg");
      return;
    }

    if (mode === "executing") {
      card.setAttribute("data-beam", BEAM_ID);
      card.setAttribute("data-active", "");
      card.style.setProperty("--beam-strength", "1");
      return;
    }

    if (mode === "pulse") {
      card.setAttribute("data-beam", BEAM_ID);
      card.setAttribute("data-pulse", "");
      card.style.setProperty("--beam-strength", "1");
      pulseTimer = setTimeout(function() {
        if (currentBeamMode === "pulse") {
          applyBeamMode("hairline");
        }
      }, 800);
      return;
    }
  }

  function resolveBeamMode() {
    if (isBeamDisabled()) return "hairline";
    if (pendingExecuting || isExecuting()) {
      if (isPlanMode()) return "planning";
      return "executing";
    }
    if (currentBeamMode === "pulse") return "pulse";
    if (typingActive) return "typing";
    return "hairline";
  }

  function updateBeamState() {
    if (!beamAttachedCard || !document.contains(beamAttachedCard) || !beamAttachedCard.isConnected) {
      var freshCard = document.querySelector('[data-composer-card="true"], .uV2eYG_card');
      if (freshCard && freshCard !== beamAttachedCard) {
        try { if (beamAttachedCard && beamAttachedCard._dshBeamCleanup) beamAttachedCard._dshBeamCleanup(); } catch(e) {}
        beamAttachedCard = null;
        attachComposerBeam();
        return;
      }
    }

    if (beamAttachedCard) {
      var freshInput = findComposerInput(beamAttachedCard);
      var boundInput = beamAttachedCard._dshBeamInput;
      if (freshInput && freshInput !== boundInput) {
        if (boundInput) {
          try {
            if (beamTypingHandler) {
              boundInput.removeEventListener("input", beamTypingHandler);
              boundInput.removeEventListener("change", beamTypingHandler);
            }
            if (beamKeydownHandler) {
              boundInput.removeEventListener("keydown", beamKeydownHandler);
            }
          } catch(e) {}
        }
        if (beamTypingHandler && beamKeydownHandler) {
          try {
            freshInput.addEventListener("input", beamTypingHandler);
            freshInput.addEventListener("change", beamTypingHandler);
            freshInput.addEventListener("keydown", beamKeydownHandler);
            freshInput.addEventListener("compositionstart", function() { triggerTypingBreathe(); });
            freshInput.addEventListener("compositionupdate", function() { triggerTypingBreathe(); });
            freshInput.addEventListener("compositionend", function() { triggerTypingBreathe(); });
            beamAttachedCard._dshBeamInput = freshInput;
          } catch(e) {}
        }
      }
    }

    if (pendingExecuting && isRealExecuting()) {
      pendingExecuting = false;
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
    }

    var next = resolveBeamMode();

    if ((currentBeamMode === "executing" || currentBeamMode === "planning") &&
        next !== "executing" && next !== "planning" && next !== "pulse") {
      applyBeamMode("pulse");
      try { syncThinkingOrb(); } catch(e) {}
      return;
    }

    if (currentBeamMode === "pulse" && next === "pulse") {
      try { syncThinkingOrb(); } catch(e) {}
      return;
    }

    if (currentBeamMode !== next) {
      applyBeamMode(next);
    }
    try { syncThinkingOrb(); } catch(e) {}
  }

  /* ------------------------------------------------------------------ *
   * Thinking Orbs (orbs.jakubantalik.com) — agent activity indicator
   * Copyright (c) Jakub Antalik, MIT
   * Dotted thought-orb loading indicators for AI & agent UIs
   * 9 hand-tuned mathematical state models:
   *   working (orbits), searching (globe), solving (rubik), listening (wave),
   *   connecting (web), weaving (braid), composing (ribbon), breathing (ring),
   *   shaping (morph).
   * ------------------------------------------------------------------ */
  function Jl(e, t, n) { return e + (t - e) * n; }
  function pc(e) { return e - Math.floor(e); }
  function ze(e, t) {
    var n = Math.sin(e * 12.9898 + t * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
  function ql(e, t) {
    var n = Math.floor(e), r = Math.floor(t);
    var l = e - n, o = t - r;
    l = l * l * (3 - 2 * l);
    o = o * o * (3 - 2 * o);
    var u = ze(n, r), i = ze(n + 1, r), s = ze(n, r + 1), f = ze(n + 1, r + 1);
    return u + (i - u) * l + (s - u) * o + (u - i - s + f) * l * o;
  }
  function Wu(e, t) {
    var n = Math.PI * (3 - Math.sqrt(5));
    var r = 1 - 2 * (e + 0.5) / t;
    var l = Math.sqrt(Math.max(0, 1 - r * r));
    var o = e * n;
    return [l * Math.cos(o), r, l * Math.sin(o)];
  }
  function Qd(e, t) {
    return Math.atan2(Math.sin(e - t), Math.cos(e - t));
  }
  function $t(e, t, n, r, l) {
    var o = Math.sin(t), u = Math.cos(t);
    var i = Math.sin(e), s = Math.cos(e);
    return function(f, v, h) {
      var p = f * s + h * i;
      var y = -f * i + h * s;
      var g = v * u - y * o;
      var w = v * o + y * u;
      return [n + p * l, r - g * l, w];
    };
  }
  function Ct(e, t, n) {
    if (n === undefined) n = 0.3;
    var r = [];
    for (var i = 0; i < e.length; i++) {
      var l = e[i];
      if ((l.a !== undefined ? l.a : 1) >= 0.02) {
        l.r = Math.max(n, l.r);
        r.push(l);
      }
    }
    r.sort(function(a, b) { return a.z - b.z; });
    var lines = [];
    for (var j = 0; j < t.length; j++) {
      if ((t[j].a !== undefined ? t[j].a : 1) >= 0.02) lines.push(t[j]);
    }
    return { dots: r, lines: lines };
  }
  function Vt(e, t) {
    return Math.pow(e / 300, t);
  }
  function Kd(ctx, dots, isDark) {
    for (var i = 0; i < dots.length; i++) {
      var l = dots[i];
      var o = l.a !== undefined ? l.a : 1;
      var u = Math.min(1, Math.max(0, l.white !== undefined ? l.white : 0.5));
      var val = Math.round((isDark ? 1 - u : u) * 255);
      ctx.fillStyle = "rgba(" + val + "," + val + "," + val + "," + o.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function Yd(ctx, lines, isDark) {
    for (var i = 0; i < lines.length; i++) {
      var r = lines[i];
      var l = r.a !== undefined ? r.a : 1;
      var o = Math.min(1, Math.max(0, r.white !== undefined ? r.white : 0.5));
      var u = Math.round((isDark ? 1 - o : o) * 255);
      ctx.strokeStyle = "rgba(" + u + "," + u + "," + u + "," + l.toFixed(3) + ")";
      ctx.lineWidth = r.w || 1;
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
      ctx.stroke();
    }
  }
  function Xd(ctx, data, isDark) {
    if (data.lines && data.lines.length > 0) Yd(ctx, data.lines, isDark);
    if (data.dots && data.dots.length > 0) Kd(ctx, data.dots, isDark);
  }

  var Gd = function(e, t, n) {
    var r = e / 2, l = e / 2, o = e / 2 * 0.76;
    var u = $t(t * 0.4, 0.3, r, l, 1);
    var i = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var s = [];
    var f = n.ghostN !== undefined ? n.ghostN : 150;
    for (var p = 0; p < f; p++) {
      var y = Wu(p, f);
      var pt = u(y[0] * o, y[1] * o, y[2] * o);
      var c = (pt[2] / o + 1) / 2;
      s.push({ x: pt[0], y: pt[1], z: pt[2], r: 0.8 * i, white: 0.78, a: 0.1 + 0.22 * c });
    }
    var v = n.strandN !== undefined ? n.strandN : 52, h = n.turns !== undefined ? n.turns : 3;
    for (var p2 = 0; p2 < 3; p2++) {
      var y2 = p2 / 3 * 2 * Math.PI;
      for (var g = 0; g < v; g++) {
        var w = (pc(g / v + t * 0.045) * 2 - 1) * 0.96;
        var C = Math.sqrt(Math.max(0, 1 - w * w));
        var c2 = Math.min(1, (1 - Math.abs(w)) / 0.1);
        var a = w * Math.PI * h + y2;
        var d = 1 + 0.075 * Math.sin(w * Math.PI * h * 2 + y2 * 2 + t * 0.8);
        var m = C * o * d;
        var pt2 = u(Math.cos(a) * m, w * o * d, Math.sin(a) * m);
        var E = (pt2[2] / o + 1) / 2;
        s.push({
          x: pt2[0],
          y: pt2[1],
          z: pt2[2],
          r: ((n.rBase !== undefined ? n.rBase : 1.2) + (n.rDepth !== undefined ? n.rDepth : 1.8) * E) * i,
          white: 0.55 - 0.45 * E,
          a: c2 * (0.45 + 0.55 * E)
        });
      }
    }
    return Ct(s, [], n.rMin);
  };

  function Zd(e, t, n, r) {
    var l = 2 * t * n + r;
    var o = e % l;
    var u = new Array(t).fill(0);
    var i = -1;
    if (o < 2 * t * n) {
      var s = Math.floor(o / n);
      var f = (o - s * n) / n;
      var h = 1 - Math.pow(1 - Math.min(1, f / 0.7), 3);
      if (s < t) {
        for (var p = 0; p < s; p++) u[p] = 1;
        u[s] = h;
        i = s;
      } else {
        var p2 = 2 * t - 1 - s;
        for (var y = 0; y < p2; y++) u[y] = 1;
        u[p2] = 1 - h;
        i = p2;
      }
    }
    return { amount: u, active: i };
  }

  function Jd(e, t, n) {
    var r = e[0], l = e[1], o = e[2];
    var u = false;
    for (var i = 0; i < t.length; i++) {
      if (n.amount[i] <= 0) continue;
      var s = t[i];
      var f = s.axis === 0 ? r : s.axis === 1 ? l : o;
      if (f < s.lo || f >= s.hi) continue;
      if (i === n.active) u = true;
      var v = s.ang * n.amount[i];
      var h = Math.cos(v), p = Math.sin(v);
      if (s.axis === 0) {
        var y = l * h - o * p;
        o = l * p + o * h;
        l = y;
      } else if (s.axis === 1) {
        var y2 = r * h + o * p;
        o = -r * p + o * h;
        r = y2;
      } else {
        var y3 = r * h - l * p;
        l = r * p + l * h;
        r = y3;
      }
    }
    return [r, l, o, u];
  }

  function qd(e) {
    var t = [];
    for (var n = 0; n < e; n++) {
      var r = Math.min(2, Math.floor(ze(n, 2.3) * 3));
      var l = -1 + 0.5 * Math.min(3, Math.floor(ze(n, 5.9) * 4));
      var o = ze(n, 7.7) < 0.5 ? 1 : -1;
      t.push({ axis: r, lo: l, hi: l + 0.5, ang: o * Math.PI / 2 });
    }
    return t;
  }

  var bd = function(e, t, n) {
    var l = e / 2, o = e / 2, u = e / 2 * 0.82;
    var i = 0.4 + 0.06 * Math.sin(t * 0.35);
    var s = $t(t * 0.5, i, l, o, u);
    var f = t * (0.5 + (1.7 - 0.5) * (n.scanMul !== undefined ? n.scanMul : 1));
    var v = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var h = n.dimBase !== undefined ? n.dimBase : 1;
    var p = [];
    var y = n.latRings !== undefined ? n.latRings : 17, g = n.lonDensity !== undefined ? n.lonDensity : 44;
    for (var w = 0; w <= y; w++) {
      var C = -Math.PI / 2 + w / y * Math.PI;
      var c = Math.cos(C), a = Math.sin(C);
      var d = Math.max(1, Math.round(Math.abs(c) * g));
      for (var m = 0; m < d; m++) {
        var k = m / d * 2 * Math.PI;
        var pt = s(c * Math.cos(k), a, c * Math.sin(k));
        var L = (pt[2] + 1) / 2;
        var N = Qd(k + t * 0.5, f);
        var D = Math.exp(-(N * N) / 0.18) * Math.max(0, pt[2]);
        p.push({
          x: pt[0],
          y: pt[1],
          z: pt[2],
          r: ((n.rBase !== undefined ? n.rBase : 0.6) + (n.rDepth !== undefined ? n.rDepth : 1.7) * L + (n.rBoost !== undefined ? n.rBoost : 1) * D) * v,
          white: (n.inkFar !== undefined ? n.inkFar : 0.62) - (n.inkSpan !== undefined ? n.inkSpan : 0.54) * L,
          a: h + (1 - h) * Math.min(1, D)
        });
      }
    }
    return Ct(p, [], n.rMin);
  };

  var ep = function(e, t, n) {
    var r = e / 2, l = e / 2, o = e / 2 * 0.82;
    var u = $t(t * 0.55, 0.35 + 0.1 * Math.sin(t * 0.9), r, l, o);
    var i = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var s = n.moveCount !== undefined ? n.moveCount : 14;
    var f = qd(s);
    var v = Zd(t, s, 0.42, 1.2);
    var h = [];
    var p = n.latRings !== undefined ? n.latRings : 15, y = n.lonDensity !== undefined ? n.lonDensity : 40;
    for (var g = 0; g <= p; g++) {
      var w = -Math.PI / 2 + g / p * Math.PI;
      var C = Math.cos(w), c = Math.sin(w);
      var a = Math.max(1, Math.round(Math.abs(C) * y));
      for (var d = 0; d < a; d++) {
        var m = d / a * 2 * Math.PI;
        var rot = Jd([C * Math.cos(m), c, C * Math.sin(m)], f, v);
        var pt = u(rot[0], rot[1], rot[2]);
        var I = (pt[2] + 1) / 2;
        h.push({
          x: pt[0],
          y: pt[1],
          z: pt[2],
          r: ((n.rBase !== undefined ? n.rBase : 0.6) + (n.rDepth !== undefined ? n.rDepth : 1.7) * I + (rot[3] ? (n.rActive !== undefined ? n.rActive : 0.3) : 0)) * i,
          white: (n.inkFar !== undefined ? n.inkFar : 0.62) - (n.inkSpan !== undefined ? n.inkSpan : 0.54) * I - (rot[3] ? 0.14 : 0)
        });
      }
    }
    return Ct(h, [], n.rMin);
  };

  var tp = function(e, t, n) {
    var r = e / 2, l = e / 2, o = e / 2 * 0.874;
    var u = $t(t * 0.18, 0.38, r, l, 1);
    var i = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var s = [];
    var f = n.rings !== undefined ? n.rings : 15, v = n.lonDensity !== undefined ? n.lonDensity : 40;
    for (var h = 0; h <= f; h++) {
      var p = -Math.PI / 2 + h / f * Math.PI;
      var y = Math.cos(p), g = Math.sin(p);
      var w = 0.62 * Math.sin(t * 2.1 - h * 0.52) + 0.38 * Math.sin(t * 1.27 + h * 0.83);
      var C = o * (0.88 + 0.105 * w);
      var c = Math.max(1, Math.round(Math.abs(y) * v));
      for (var a = 0; a < c; a++) {
        var d = a / c * 2 * Math.PI;
        var pt = u(y * Math.cos(d) * C, g * C, y * Math.sin(d) * C);
        var x = (pt[2] / o + 1) / 2;
        var E = Math.max(0, w);
        s.push({
          x: pt[0],
          y: pt[1],
          z: pt[2],
          r: ((n.rBase !== undefined ? n.rBase : 0.6) + (n.rDepth !== undefined ? n.rDepth : 1.7) * x) * (1 + 0.4 * E) * i,
          white: 0.66 - 0.56 * x - 0.1 * E
        });
      }
    }
    return Ct(s, [], n.rMin);
  };

  function np(e) { return e * e * (3 - 2 * e); }
  function hc(e) {
    var t = e.length, n = [];
    var r = 0;
    for (var l = 0; l < t; l++) {
      var o = e[l], u = e[(l + 1) % t], i = Math.hypot(u[0] - o[0], u[1] - o[1]);
      n.push(i);
      r += i;
    }
    return function(l2) {
      var o2 = l2 * r, u2 = 0;
      for (; o2 > n[u2] && u2 < t - 1;) {
        o2 -= n[u2];
        u2++;
      }
      var i2 = e[u2], s = e[(u2 + 1) % t], f = n[u2] ? Math.min(1, o2 / n[u2]) : 0;
      return [i2[0] + (s[0] - i2[0]) * f, i2[1] + (s[1] - i2[1]) * f];
    };
  }
  var rp = function(e) {
    var t = -Math.PI / 2 + e * 2 * Math.PI;
    return [Math.cos(t) * 0.24, Math.sin(t) * 0.24];
  };
  var lp = hc([[0, -0.26], [0.24, 0.16], [-0.24, 0.16]]);
  var op = hc([[0, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2], [-0.2, -0.2]]);
  var bl = [rp, lp, op];
  function up(e) { return Math.max(6, Math.round(34 * e)); }
  var Xo = 1.4, mc = 0.9, eo = Xo + mc;
  var ip = function(e, t, n) {
    var r = bl.length, l = t % (eo * r), o = Math.floor(l / eo), u = l - o * eo;
    var i = u > Xo ? np((u - Xo) / mc) : 0;
    var s = n.spread !== undefined ? n.spread : 1;
    var f = bl[o], v = bl[(o + 1) % r];
    var h = 160, p = [];
    for (var S = 0; S < h; S++) {
      var x = S / h, E = f(x), L = v(x);
      p.push([(E[0] + (L[0] - E[0]) * i) * s, (E[1] + (L[1] - E[1]) * i) * s]);
    }
    var y = [];
    var g = 0;
    for (var S2 = 0; S2 < h; S2++) {
      var x2 = p[S2], E2 = p[(S2 + 1) % h], L2 = Math.hypot(E2[0] - x2[0], E2[1] - x2[1]);
      y.push(L2);
      g += L2;
    }
    var w = up(n.iconD !== undefined ? n.iconD : 1);
    var C = (n.rDot !== undefined ? n.rDot : 0.021) * 1.35 * s;
    var c = 1 + 0.02 * Math.sin(u * 3.1);
    var a = [], d = e / 2;
    var m = 0, k = 0;
    for (var S3 = 0; S3 < w; S3++) {
      var x3 = S3 / w * g;
      for (; k + y[m] < x3 && m < h - 1;) {
        k += y[m];
        m++;
      }
      var E3 = p[m], L3 = p[(m + 1) % h], N = y[m] ? Math.min(1, (x3 - k) / y[m]) : 0;
      var D = (E3[0] + (L3[0] - E3[0]) * N) * c, I = (E3[1] + (L3[1] - E3[1]) * N) * c;
      a.push({ x: d + D * e, y: d + I * e, z: 0, r: Math.max(0.35, C * e), white: 0.1 });
    }
    return Ct(a, [], n.rMin);
  };

  var sp = function(e, t, n) {
    var r = e / 2, l = e / 2, o = e / 2 * 0.82;
    var u = $t(t * 0.12, 0.3, r, l, 1);
    var i = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var s = [];
    var f = n.orbitN !== undefined ? n.orbitN : 12, v = n.ghostN !== undefined ? n.ghostN : 40, h = n.particles !== undefined ? n.particles : 3;
    for (var p = 0; p < f; p++) {
      var y = ze(p, 1.7), g = ze(p, 5.2), w = ze(p, 8.9);
      var C = o * (0.45 + 0.52 * y);
      var c = y * 2 * Math.PI;
      var a = Math.acos(2 * g - 1);
      var d = Math.sin(a) * Math.cos(c), m = Math.cos(a), k = Math.sin(a) * Math.sin(c);
      var S = -m, x = d;
      var E = 0, L = Math.max(1e-6, Math.sqrt(S * S + x * x));
      S /= L; x /= L;
      var N = m * E - k * x, D = k * S - d * E, I = d * x - m * S;
      var pe = (0.25 + 0.55 * w) * (w > 0.5 ? 1 : -1);
      for (var se = 0; se < v; se++) {
        var Y = se / v * 2 * Math.PI;
        var pt = u((S * Math.cos(Y) + N * Math.sin(Y)) * C, (x * Math.cos(Y) + D * Math.sin(Y)) * C, (E * Math.cos(Y) + I * Math.sin(Y)) * C);
        var z = (pt[2] / C + 1) / 2;
        s.push({
          x: pt[0],
          y: pt[1],
          z: pt[2],
          r: (n.ghostR !== undefined ? n.ghostR : 0.9) * i,
          white: 0.72,
          a: (n.ghostA !== undefined ? n.ghostA : 0.5) * (0.4 + 0.6 * z)
        });
      }
      for (var se2 = 0; se2 < h; se2++) {
        var Y2 = t * pe + se2 / h * 2 * Math.PI + g * 6;
        var pt2 = u((S * Math.cos(Y2) + N * Math.sin(Y2)) * C, (x * Math.cos(Y2) + D * Math.sin(Y2)) * C, (E * Math.cos(Y2) + I * Math.sin(Y2)) * C);
        var z2 = (pt2[2] / C + 1) / 2;
        s.push({
          x: pt2[0],
          y: pt2[1],
          z: pt2[2],
          r: ((n.partR !== undefined ? n.partR : 1.2) + (n.partRDepth !== undefined ? n.partRDepth : 1.6) * z2) * i,
          white: 0.3 - 0.22 * z2
        });
      }
    }
    return Ct(s, [], n.rMin);
  };

  var bi = function(e, t, n) {
    var r = e / 2, l = e / 2, o = e / 2 * 0.78;
    var u = n.spin !== undefined ? n.spin : 1;
    var i = 0.3;
    var s = $t(t * 0.1 * u, i, r, l, 1);
    var f = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var v = [];
    var h = n.ghostN !== undefined ? n.ghostN : 150;
    for (var I = 0; I < h; I++) {
      var pe = Wu(I, h);
      var pt = s(pe[0] * o, pe[1] * o, pe[2] * o);
      var Ce = (pt[2] / o + 1) / 2;
      v.push({ x: pt[0], y: pt[1], z: pt[2], r: 0.8 * f, white: 0.78, a: 0.1 + 0.22 * Ce });
    }
    var p = t * 0.24 * u;
    var y = n.faceOn ? -i : 0.55 + 0.3 * Math.sin(t * 0.18) * u;
    var g = Math.cos(p), w = 0, C = Math.sin(p);
    var c = -C * Math.sin(y), a = Math.cos(y), d = g * Math.sin(y);
    var m = w * d - C * a, k = C * c - g * d, S = g * a - w * c;
    var x = 0.23 * (n.wobMul !== undefined ? n.wobMul : 1);
    var E = n.faceOn ? o / (1 + 0.85 * x) : o;
    var L = n.lanes !== undefined ? n.lanes : 5, N = n.segs !== undefined ? n.segs : 88;
    var D = Math.max(1, Math.round(L * (n.bandMul !== undefined ? n.bandMul : 1)));
    for (var I2 = 0; I2 < D; I2++) {
      var pe2 = (I2 - (D - 1) / 2) * 0.075;
      var se = Math.abs(I2 - (D - 1) / 2) / Math.max(1, (D - 1) / 2);
      for (var Y = 0; Y < N; Y++) {
        var Z = Y / N * 2 * Math.PI;
        var Ce2 = (0.16 * Math.sin(Z * 3 - t * 1.7 + I2 * 0.22) + 0.07 * Math.sin(Z * 5 + t * 1.1)) * (n.wobMul !== undefined ? n.wobMul : 1);
        var _ = n.faceOn ? 1 + Ce2 : 1;
        var z = n.faceOn ? pe2 : pe2 + Ce2;
        var T = g * Math.cos(Z) + c * Math.sin(Z) + m * z;
        var U = w * Math.cos(Z) + a * Math.sin(Z) + k * z;
        var Q = C * Math.cos(Z) + d * Math.sin(Z) + S * z;
        var rt = Math.sqrt(T * T + U * U + Q * Q);
        var De = E * _;
        var pt2 = s(T / rt * De, U / rt * De, Q / rt * De);
        var Ml = (pt2[2] / o + 1) / 2;
        v.push({
          x: pt2[0],
          y: pt2[1],
          z: pt2[2],
          r: ((n.rBase !== undefined ? n.rBase : 1.1) + (n.rDepth !== undefined ? n.rDepth : 1.7) * Ml) * (1 - 0.25 * se) * f,
          white: 0.52 - 0.44 * Ml + 0.18 * se,
          a: 0.4 + 0.6 * Ml
        });
      }
    }
    return Ct(v, [], n.rMin);
  };

  var ap = function(e, t, n) {
    var r = e / 2, l = e / 2, o = e / 2 * 0.8 * (n.spread !== undefined ? n.spread : 1);
    var u = $t(t * 0.12, 0.32, r, l, o);
    var i = Vt(e, n.rsPow !== undefined ? n.rsPow : 0.6);
    var s = n.nodeN !== undefined ? n.nodeN : 30, f = n.thr !== undefined ? n.thr : 0.72;
    var v = n.nodeR !== undefined ? n.nodeR : 1.4, h = n.nodeRDepth !== undefined ? n.nodeRDepth : 1.8;
    var p = [];
    for (var C = 0; C < s; C++) {
      var c = Wu(C, s);
      var a = c[0] + 0.3 * (ql(C * 0.31 + 9, t * 0.24) - 0.5) * 2;
      var d = c[1] + 0.3 * (ql(C * 0.53 + 27, t * 0.21) - 0.5) * 2;
      var m = c[2] + 0.3 * (ql(C * 0.77 + 55, t * 0.27) - 0.5) * 2;
      var k = Math.sqrt(a * a + d * d + m * m);
      p.push([a / k, d / k, m / k]);
    }
    var y = [], g = [];
    for (var C2 = 0; C2 < s; C2++) {
      for (var c2 = C2 + 1; c2 < s; c2++) {
        var a2 = p[C2][0] - p[c2][0];
        var d2 = p[C2][1] - p[c2][1];
        var m2 = p[C2][2] - p[c2][2];
        var k2 = Math.sqrt(a2 * a2 + d2 * d2 + m2 * m2);
        if (k2 >= f) continue;
        var ptA = u(p[C2][0], p[C2][1], p[C2][2]);
        var ptB = u(p[c2][0], p[c2][1], p[c2][2]);
        var I = ((ptA[2] + ptB[2]) / 2 + 1) / 2;
        y.push({
          x1: ptA[0],
          y1: ptA[1],
          x2: ptB[0],
          y2: ptB[1],
          white: 0.42,
          a: (1 - k2 / f) * (0.3 + 0.55 * I),
          w: Math.max(0.6, (n.lineW !== undefined ? n.lineW : 0.8) * i)
        });
      }
    }
    for (var C3 = 0; C3 < s; C3++) {
      var pt3 = u(p[C3][0], p[C3][1], p[C3][2]);
      var m3 = (pt3[2] + 1) / 2;
      var k3 = 1 + 0.25 * Math.sin(t * 1.4 + C3 * 2.7);
      g.push({
        x: pt3[0],
        y: pt3[1],
        z: pt3[2],
        r: (v + h * m3) * k3 * i,
        white: 0.55 - 0.45 * m3
      });
    }
    var w = n.signals !== undefined ? n.signals : 5;
    for (var C4 = 0; C4 < w; C4++) {
      var c4 = Math.floor(t * 0.55 + C4 * 7.31);
      var a4 = Math.floor(ze(c4, C4 * 3.1 + 1.7) * s);
      var d4 = Math.floor(ze(c4, C4 * 5.7 + 4.2) * s);
      if (a4 === d4) continue;
      var m4 = pc(t * 0.55 + C4 * 7.31);
      var k4 = Jl(p[a4][0], p[d4][0], m4);
      var S4 = Jl(p[a4][1], p[d4][1], m4);
      var x4 = Jl(p[a4][2], p[d4][2], m4);
      var E4 = Math.max(1e-6, Math.sqrt(k4 * k4 + S4 * S4 + x4 * x4));
      var pt4 = u(k4 / E4, S4 / E4, x4 / E4);
      var I4 = (pt4[2] + 1) / 2;
      g.push({
        x: pt4[0],
        y: pt4[1],
        z: pt4[2],
        r: (v * 1.5 + h * I4) * i,
        white: 0.05,
        a: 0.5 + 0.5 * I4
      });
    }
    return Ct(g, y, n.rMin);
  };

  var cp = {
    orbits: sp,
    globe: bd,
    rubik: ep,
    wave: tp,
    web: ap,
    braid: Gd,
    ribbon: bi,
    ring: bi,
    morph: ip
  };

  var dp = [["latRings", "lonDensity"], ["rings", "lonDensity"], ["lanes", "segs"]];
  var pp = ["orbitN", "ghostN", "nodeN", "strandN", "signals"];
  var hp = ["iconD"];
  var mp = ["rBase", "rDepth", "rActive", "rDot", "ghostR", "partR", "partRDepth", "nodeR", "nodeRDepth"];

  function vp(e, t) {
    var n = Object.assign({}, e), r = new Set(), l = Math.sqrt(t);
    for (var i = 0; i < dp.length; i++) {
      var pair = dp[i];
      var o = pair[0], u = pair[1];
      if (n[o] != null && n[u] != null && !r.has(o) && !r.has(u)) {
        n[o] = Math.max(2, Math.round(n[o] * l));
        n[u] = Math.max(2, Math.round(n[u] * l));
        r.add(o); r.add(u);
      }
    }
    for (var j = 0; j < pp.length; j++) {
      var o2 = pp[j];
      if (n[o2] != null && n[o2] !== 0 && !r.has(o2)) {
        n[o2] = Math.max(1, Math.round(n[o2] * t));
      }
    }
    for (var k = 0; k < hp.length; k++) {
      var o3 = hp[k];
      if (n[o3] != null) {
        n[o3] = Math.max(0.02, n[o3] * t);
      }
    }
    return n;
  }

  function yp(e, t) {
    var n = Object.assign({}, e);
    for (var i = 0; i < mp.length; i++) {
      var r = mp[i];
      if (n[r] != null) {
        n[r] = n[r] * t;
      }
    }
    n.rSizeMul = (n.rSizeMul != null ? n.rSizeMul : 1) * t;
    return n;
  }

  var gp = {
    globe: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, rBoost: 1, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
    orbits: { orbitN: 12, ghostN: 40, ghostR: 0.9, ghostA: 0.5, particles: 3, partR: 1.2, partRDepth: 1.6, rsPow: 0.6, rMin: 0.3 },
    rubik: { latRings: 15, lonDensity: 40, moveCount: 14, rBase: 0.6, rDepth: 1.7, rActive: 0.3, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
    wave: { rings: 15, lonDensity: 40, rBase: 0.6, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
    web: { nodeN: 30, thr: 0.72, signals: 5, nodeR: 1.4, nodeRDepth: 1.8, lineW: 0.8, rsPow: 0.6, rMin: 0.3 },
    braid: { strandN: 52, turns: 3, ghostN: 150, rBase: 1.2, rDepth: 1.8, rsPow: 0.6, rMin: 0.3 },
    ribbon: { lanes: 5, segs: 88, ghostN: 150, rBase: 1.1, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
    ring: { lanes: 5, segs: 88, ghostN: 0, faceOn: 1, rBase: 1.1, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
    morph: { rDot: 0.021, iconD: 1, rMin: 0.25 }
  };

  var wp = {
    working: "orbits",
    searching: "globe",
    solving: "rubik",
    listening: "wave",
    connecting: "web",
    weaving: "braid",
    composing: "ribbon",
    breathing: "ring",
    shaping: "morph"
  };

  var kp = {
    orbits: { 64: { speed: 1.885, count: 1, size: 1 }, 20: { speed: 3.9, count: 0.238, size: 2.4 } },
    globe: { 64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } }, 20: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } } },
    rubik: { 64: { speed: 1.82, count: 0.35, size: 1.05 }, 20: { speed: 1.95, count: 0.088, size: 1.9 } },
    wave: { 64: { speed: 4.388, count: 0.341, size: 1 }, 20: { speed: 3.998, count: 0.105, size: 1.6 } },
    web: { 64: { speed: 3.315, count: 1.35, size: 0.95 }, 20: { speed: 6.63, count: 0.25, size: 1.52 } },
    braid: { 64: { speed: 1.625, count: 0.5, size: 1 }, 20: { speed: 2.75, count: 0.1125, size: 1.36 } },
    ribbon: { 64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } }, 20: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } } },
    ring: { 64: { speed: 3.24, count: 0.25, size: 0.956, extra: { spin: 0, bandMul: 3.627, wobMul: 0.368 } }, 20: { speed: 3.78, count: 0.028, size: 1.622, extra: { spin: 0, bandMul: 3.968, wobMul: 0.565 } } },
    morph: { 64: { speed: 2.405, count: 0.702, size: 0.395, extra: { spread: 1.45 } }, 20: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } } }
  };

  var orbPresetsCache = new Map();
  function getOrbPreset(stateKey, size) {
    var key = stateKey + "-" + size;
    var cached = orbPresetsCache.get(key);
    if (cached) return cached;
    var mode = wp[stateKey] || "orbits";
    var preset = (kp[mode] && kp[mode][size]) ? kp[mode][size] : kp.orbits[20];
    var opts = Object.assign({}, gp[mode]);
    if (preset.count !== 1) opts = vp(opts, preset.count);
    if (preset.size !== 1) opts = yp(opts, preset.size);
    if (preset.extra) opts = Object.assign(opts, preset.extra);
    var res = { mode: mode, speed: preset.speed, opts: opts };
    orbPresetsCache.set(key, res);
    return res;
  }

  /* ------------------------------------------------------------------ *
   * 工具调用状态映射 (Tool Call → Thinking Orb Style & Status Text)
   * 兜底: Working… (orbits)
   * ------------------------------------------------------------------ */
  var TOOL_STATE_MAP = {
    // 1. Searching (globe)
    "grep": { state: "searching", text: "Searching files…" },
    "glob": { state: "searching", text: "Finding files…" },
    "web_search": { state: "searching", text: "Searching web…" },
    "find_dsh_plugin": { state: "searching", text: "Searching plugins…" },

    // 2. Listening / Reading (wave)
    "read": { state: "listening", text: "Reading file…" },
    "read_image": { state: "listening", text: "Inspecting image…" },
    "skill": { state: "listening", text: "Loading skill…" },
    "get_goal": { state: "listening", text: "Reading goal…" },

    // 3. Composing / Writing (ribbon)
    "write": { state: "composing", text: "Writing file…" },
    "edit": { state: "composing", text: "Editing file…" },

    // 4. Solving / Commands (rubik)
    "bash": { state: "solving", text: "Running command…" },

    // 5. Connecting / Subagents (web)
    "subagent": { state: "connecting", text: "Connecting subagent…" },
    "subagent_fork": { state: "connecting", text: "Delegating task…" },
    "workflow": { state: "connecting", text: "Running workflow…" },
    "ralph": { state: "connecting", text: "Running Ralph…" },
    "send_message": { state: "connecting", text: "Sending message…" },
    "interrupt_agent": { state: "connecting", text: "Interrupting agent…" },
    "list_agents": { state: "connecting", text: "Listing agents…" },
    "job_output": { state: "connecting", text: "Checking job output…" },
    "job_list": { state: "connecting", text: "Listing jobs…" },
    "job_kill": { state: "connecting", text: "Stopping job…" },

    // 6. Shaping / Tasks & Goals (morph)
    "todo_write": { state: "shaping", text: "Updating tasks…" },
    "create_goal": { state: "shaping", text: "Creating goal…" },
    "update_goal": { state: "shaping", text: "Updating goal…" },
    "exit_plan_mode": { state: "shaping", text: "Finalizing plan…" },

    // 7. Weaving / Cordis plugins (braid)
    "cordis_define": { state: "weaving", text: "Weaving plugin…" },
    "cordis_run": { state: "weaving", text: "Activating plugin…" },
    "cordis_stop": { state: "weaving", text: "Stopping plugin…" },
    "cordis_undefine": { state: "weaving", text: "Removing plugin…" },
    "cordis_inspect_list": { state: "weaving", text: "Inspecting runtime…" },
    "cordis_inspect_query": { state: "weaving", text: "Querying runtime…" },
    "cordis_inspect_self": { state: "weaving", text: "Inspecting plugin…" },

    // 8. Breathing / Interactive questions (ring)
    "ask_user_question": { state: "breathing", text: "Asking question…" }
  };

  function extractSummaryDetail(el, toolName) {
    try {
      if (!el) return null;
      var fileBtn = el.querySelector(".o3BgMG_fileLink");
      if (fileBtn && fileBtn.textContent) {
        var fn = fileBtn.textContent.trim().split("/").pop();
        if (fn && fn.length <= 25) {
          if (toolName === "read") return "Reading " + fn + "…";
          if (toolName === "write") return "Writing " + fn + "…";
          if (toolName === "edit") return "Editing " + fn + "…";
        }
      }
      var sumEl = el.querySelector(".o3BgMG_summary, .CY-8Ka_summary");
      if (sumEl && sumEl.textContent) {
        var txt = sumEl.textContent.trim();
        if (txt && txt.length > 0 && txt.length <= 25) {
          if (toolName === "grep") return "Searching: " + txt + "…";
          if (toolName === "bash") return "Running: " + txt + "…";
          if (toolName === "skill") return "Skill: " + txt + "…";
        }
      }
    } catch(e) {}
    return null;
  }

  function resolveActiveToolState() {
    try {
      // 1. 优先检测当前处于 running 状态的工具调用行（从后向前取最新活跃调用）
      var runningRows = document.querySelectorAll('[data-state="running"], [data-tool][data-state="running"], .CY-8Ka_root[data-state="running"], .o3BgMG_root[data-state="running"]');
      if (runningRows && runningRows.length > 0) {
        for (var i = runningRows.length - 1; i >= 0; i--) {
          var row = runningRows[i];
          var tool = row.getAttribute("data-tool");
          if (!tool && (row.classList.contains("CY-8Ka_root") || row.closest(".CY-8Ka_card"))) {
            tool = "bash";
          }
          if (!tool) {
            var parent = row.closest("[data-tool]");
            if (parent) tool = parent.getAttribute("data-tool");
          }
          if (tool) {
            var mapped = TOOL_STATE_MAP[tool];
            if (mapped) {
              var customDetail = extractSummaryDetail(row, tool);
              return {
                state: mapped.state,
                text: customDetail || mapped.text,
                tool: tool
              };
            }
            if (tool.indexOf("cordis_") === 0) {
              return { state: "weaving", text: "Weaving plugin…", tool: tool };
            }
            if (tool.indexOf("subagent") === 0) {
              return { state: "connecting", text: "Connecting subagent…", tool: tool };
            }
            if (tool.indexOf("read") === 0) {
              return { state: "listening", text: "Reading…", tool: tool };
            }
            return { state: "working", text: "Working…", tool: tool };
          }
        }
      }

      // 2. 检测用户提问卡片
      var questionEl = document.querySelector('[data-slot="user-questions"], .Mbwy4a_card');
      if (questionEl && questionEl.offsetParent !== null) {
        return { state: "breathing", text: "Asking question…", tool: "ask_user_question" };
      }

      // 3. 检测计划待审卡片
      var planReviewEl = document.querySelector('[data-slot="plan-review"], .LVzXQa_card');
      if (planReviewEl && planReviewEl.offsetParent !== null) {
        return { state: "shaping", text: "Reviewing plan…", tool: "exit_plan_mode" };
      }

      // 4. Plan mode 模式（无特定工具活跃）
      if (isPlanMode()) {
        return { state: "breathing", text: "Planning…", tool: "plan" };
      }

      // 5. 兜底默认状态: Working…
      return { state: "working", text: "Working…", tool: "fallback" };
    } catch(e) {
      return { state: "working", text: "Working…", tool: "fallback" };
    }
  }

  var orbCanvas = null;
  var orbCtx = null;
  var orbRaf = 0;
  var orbMountedStatusEl = null;
  var orbActive = false;
  var orbCurrentState = "working";
  var orbStartTime = 0;
  var orbTextSpan = null;

  function syncTurnStatusText(statusEl, text) {
    if (!statusEl || !document.contains(statusEl)) return;
    try {
      if (!orbTextSpan || !statusEl.contains(orbTextSpan)) {
        var existing = statusEl.querySelector(".dsh-turn-status-text");
        if (existing) {
          orbTextSpan = existing;
        } else {
          orbTextSpan = document.createElement("span");
          orbTextSpan.className = "dsh-turn-status-text";
          var clockEl = statusEl.querySelector(".Md3f7G_turnStatusClock");
          if (clockEl) {
            statusEl.insertBefore(orbTextSpan, clockEl);
          } else {
            statusEl.appendChild(orbTextSpan);
          }
        }
      }
      if (orbTextSpan && orbTextSpan.textContent !== text) {
        orbTextSpan.textContent = text;
      }
      // 保持 React reconciler 正常运行的同时清理裸露文本节点（如原版的 "Deep diving..."）
      var childNodes = statusEl.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        var node = childNodes[i];
        if (node.nodeType === 3 /* Node.TEXT_NODE */) {
          if (node.nodeValue && node.nodeValue.trim().length > 0) {
            node.nodeValue = "";
          }
        }
      }
    } catch(e) {}
  }

  function createThinkingOrbCanvas() {
    var wrap = document.createElement("span");
    wrap.className = "dsh-thinking-orb-wrap";
    wrap.setAttribute("aria-hidden", "true");
    var cvs = document.createElement("canvas");
    cvs.className = "dsh-thinking-orb-canvas";
    var size = 20;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = size * dpr;
    cvs.height = size * dpr;
    cvs.style.width = size + "px";
    cvs.style.height = size + "px";
    wrap.appendChild(cvs);
    return { wrap: wrap, canvas: cvs };
  }

  function startThinkingOrb(targetEl) {
    if (!targetEl || !document.contains(targetEl)) return;
    if (orbMountedStatusEl === targetEl && orbCanvas && targetEl.contains(orbCanvas.parentNode)) {
      return;
    }
    stopThinkingOrb();

    var orb = createThinkingOrbCanvas();
    orbCanvas = orb.canvas;
    orbCtx = orbCanvas.getContext("2d");
    orbMountedStatusEl = targetEl;
    targetEl.insertBefore(orb.wrap, targetEl.firstChild);
    orbActive = true;
    orbStartTime = performance.now();
    // GPU/CPU 优化：resolveActiveToolState 每帧做多次全 DOM querySelectorAll，
    // 改为每 300ms 一次（Orb 形态切换延迟最多 300ms，观感无差）
    var orbLastScan = 0;
    var orbLastInfo = null;

    function renderOrb(now) {
      if (!orbActive || !orbCtx || !orbMountedStatusEl || !document.contains(orbMountedStatusEl)) {
        stopThinkingOrb();
        return;
      }
      orbRaf = requestAnimationFrame(renderOrb);

      if (document.visibilityState === "hidden") return;

      if (now - orbLastScan >= 300 || !orbLastInfo) {
        orbLastScan = now;
        orbLastInfo = resolveActiveToolState();
      }
      var activeInfo = orbLastInfo;
      orbCurrentState = activeInfo.state;

      if (orb.wrap && orb.wrap.getAttribute("data-state") !== activeInfo.state) {
        orb.wrap.setAttribute("data-state", activeInfo.state);
      }

      syncTurnStatusText(orbMountedStatusEl, activeInfo.text);

      var size = 20;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var preset = getOrbPreset(activeInfo.state, 20);
      var renderFn = cp[preset.mode] || cp.orbits;

      var elapsed = (now - orbStartTime) * 0.001 * preset.speed;
      var res = renderFn(size, elapsed, preset.opts);

      var isDark = getBeamThemeIsDark();
      orbCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      orbCtx.clearRect(0, 0, size, size);
      Xd(orbCtx, res, isDark);
    }

    orbRaf = requestAnimationFrame(renderOrb);
  }

  function stopThinkingOrb() {
    orbActive = false;
    if (orbRaf) {
      cancelAnimationFrame(orbRaf);
      orbRaf = 0;
    }
    if (orbCanvas && orbCanvas.parentNode) {
      try { orbCanvas.parentNode.remove(); } catch(e) {}
    }
    orbCanvas = null;
    orbCtx = null;
    orbMountedStatusEl = null;
    orbTextSpan = null;
  }

  function syncThinkingOrb() {
    if (!bgSettings || bgSettings.orbs === false) {
      if (orbActive) stopThinkingOrb();
      return;
    }
    var statusEl = document.querySelector(".Md3f7G_turnStatus, [role=\"status\"][aria-live=\"polite\"]");
    if (statusEl && isExecuting()) {
      startThinkingOrb(statusEl);
    } else {
      if (orbActive) stopThinkingOrb();
    }
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
    ensureBeamStyles(radius, "colorful");
    card.style.setProperty("overflow", "visible");
    card.style.setProperty("isolation", "isolate");
    if (window.getComputedStyle(card).position === "static") card.style.position = "relative";
    beamAttachedCard = card;
    currentBeamMode = "hairline";
    updateBeamState();

    var input = findComposerInput(card);
    if (input) {
      beamTypingHandler = function() {
        triggerTypingBreathe();
      };
      beamKeydownHandler = function(e) {
        if (e.isComposing || e.keyCode === 229) {
          triggerTypingBreathe();
          return;
        }
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
          var val = input.value !== undefined ? input.value : input.textContent;
          if (val && String(val).trim().length > 0) {
            typingActive = false;
            if (typingTimer) clearTimeout(typingTimer);
            pendingExecuting = true;
            if (pendingTimer) clearTimeout(pendingTimer);
            pendingTimer = setTimeout(function() { pendingExecuting = false; updateBeamState(); }, 5000);
            updateBeamState();
            return;
          }
        }
        if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key && (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete")) {
          triggerTypingBreathe();
        }
      };

      input.addEventListener("input", beamTypingHandler);
      input.addEventListener("change", beamTypingHandler);
      input.addEventListener("keydown", beamKeydownHandler);
      input.addEventListener("compositionstart", function() { triggerTypingBreathe(); });
      input.addEventListener("compositionupdate", function() { triggerTypingBreathe(); });
      input.addEventListener("compositionend", function() { triggerTypingBreathe(); });
      card._dshBeamInput = input;
    }

    var sendBtn = card.querySelector('button[aria-label="Send message"], button[aria-label="发送消息"], button[aria-label*="Send"], button[aria-label*="发送"], .uV2eYG_primary');
    if (sendBtn) {
      var sendHandler = function() {
        typingActive = false;
        if (typingTimer) clearTimeout(typingTimer);
        pendingExecuting = true;
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(function() { pendingExecuting = false; updateBeamState(); }, 5000);
        updateBeamState();
      };
      sendBtn.addEventListener("click", sendHandler);
      card._dshBeamSendBtn = sendBtn;
      card._dshBeamSendHandler = sendHandler;
    }

    if (window.ResizeObserver) {
      if (beamResizeObs) try { beamResizeObs.disconnect(); } catch(e) {}
      beamResizeObs = new ResizeObserver(function() {
        if (!beamAttachedCard) return;
        var nr = resolveBorderRadius(beamAttachedCard);
        ensureBeamStyles(nr, currentBeamMode === "typing" ? "mono" : (currentBeamMode === "planning" ? "sunset" : "colorful"));
      });
      try { beamResizeObs.observe(card); } catch(e) {}
    }

    if (beamPollTimer) clearInterval(beamPollTimer);
    beamPollTimer = setInterval(updateBeamState, 200);

    if (!beamMutObs && window.MutationObserver) {
      beamMutObs = new MutationObserver(function() { updateBeamState(); });
      var rootEl = document.querySelector("#root") || document.documentElement;
      try { beamMutObs.observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label", "class", "data-plan-mode", "data-state"] }); } catch(e) {}
    }

    card._dshBeamCleanup = function() {
      if (input) {
        try {
          if (beamTypingHandler) {
            input.removeEventListener("input", beamTypingHandler);
            input.removeEventListener("change", beamTypingHandler);
          }
          if (beamKeydownHandler) {
            input.removeEventListener("keydown", beamKeydownHandler);
          }
        } catch(e) {}
      }
      if (card._dshBeamSendBtn && card._dshBeamSendHandler) {
        try { card._dshBeamSendBtn.removeEventListener("click", card._dshBeamSendHandler); } catch(e) {}
      }
      if (beamPollTimer) { clearInterval(beamPollTimer); beamPollTimer = null; }
      if (beamMutObs) { try { beamMutObs.disconnect(); beamMutObs = null; } catch(e) {} }
      if (beamResizeObs) { try { beamResizeObs.disconnect(); beamResizeObs = null; } catch(e) {} }
      if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
      if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
      try { stopThinkingOrb(); } catch(e) {}
    };
  }

  function detachComposerBeam() {
    var card = beamAttachedCard;
    if (!card) return;
    try { if (card._dshBeamCleanup) card._dshBeamCleanup(); } catch(e) {}
    try { stopThinkingOrb(); } catch(e) {}
    card.removeAttribute("data-beam");
    card.removeAttribute("data-active");
    card.removeAttribute("data-fading");
    card.removeAttribute("data-typing");
    card.removeAttribute("data-planning");
    card.removeAttribute("data-pulse");
    card.removeAttribute("data-paused");
    card.style.removeProperty("--beam-strength");
    card.style.removeProperty("--beam-hue-base");
    card.style.removeProperty("filter");
    card.style.removeProperty("isolation");
    var bloom = card.querySelector("[data-beam-bloom]");
    if (bloom) try { bloom.remove(); } catch(e) {}
    if (beamResizeObs) try { beamResizeObs.disconnect(); beamResizeObs = null; } catch(e) {}
    beamAttachedCard = null;
    currentBeamMode = "hairline";
  }

  function refreshBeamTheme() {
    if (!beamAttachedCard) return;
    var r = resolveBorderRadius(beamAttachedCard);
    var v = currentBeamMode === "typing" ? "mono" : (currentBeamMode === "planning" ? "sunset" : "colorful");
    ensureBeamStyles(r, v);
    updateBeamState();
  }

  function watchBeamComposer() {
    if (isBeamDisabled()) { detachComposerBeam(); return; }
    attachComposerBeam();
    if (!beamMutObs && window.MutationObserver) {
      beamMutObs = new MutationObserver(function() {
        if (!beamAttachedCard) attachComposerBeam();
        else updateBeamState();
      });
      var rootEl = document.querySelector("#root") || document.documentElement;
      try { beamMutObs.observe(rootEl, { childList: true, subtree: true }); } catch(e) {}
    }
  }

  try {
    if (typeof window.__dshDeepSeekBg !== "object" || window.__dshDeepSeekBg === null) window.__dshDeepSeekBg = {};
    window.__dshDeepSeekBg.beam = {
      attach: attachComposerBeam,
      detach: detachComposerBeam,
      setStrength: function(v) { setBeamStrength(v, { persist: false }); },
      setIdleStrength: function(v) { beamState.idleStrength = Math.max(0, Math.min(1, v)); refreshBeamTheme(); },
      setFocusStrength: function(v) { beamState.focusStrength = Math.max(0, Math.min(1, v)); refreshBeamTheme(); },
      disable: function() { try { localStorage.setItem("dsh-beam-disabled", "1"); } catch(e) {} detachComposerBeam(); },
      enable: function() { try { localStorage.removeItem("dsh-beam-disabled"); } catch(e) {} watchBeamComposer(); },
      refresh: refreshBeamTheme,
      get state() { return currentBeamMode; },
      get isExecuting() { return isExecuting(); },
      get isTyping() { return isTyping(); },
      update: updateBeamState,
      get id() { return BEAM_ID; },
      get card() { return beamAttachedCard; }
    };
    window.__dshDeepSeekBg.orbs = {
      start: startThinkingOrb,
      stop: stopThinkingOrb,
      sync: syncThinkingOrb,
      get active() { return orbActive; },
      get canvas() { return orbCanvas; },
      get state() { return orbCurrentState; },
      resolveState: resolveActiveToolState,
      getPreset: getOrbPreset
    };
  } catch(e) {}

  
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
    // GPU 优化：极光是柔和渐变背景，内部分辨率按 DPR 上限 1.5 再乘 0.75 渲染，
    // 由 CSS 放大到全屏。像素量约为原 1.5x 的 1/4（1x 屏幕）~ 56%（retina），
    // 对流动渐变背景肉眼几乎无差，fragment 负载（本插件最大 GPU 开销）大幅下降。
    var AURORA_SCALE = 0.75;
    // 分辨率由设置面板的「极光分辨率」滑杆实时控制（0.4–1.0）
    function auroraScale() { return Math.min(window.devicePixelRatio || 1, 1.5) * (bgSettings.auroraScale || AURORA_SCALE); }
    var k = auroraScale();
    function resizeAll() {
      k = auroraScale(); // DPR 变化时保持 resize 判定与渲染一致，避免每帧重建纹理
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
    // 鼠标笔刷/光线跟随：由设置面板「鼠标跟随交互」开关实时控制（每帧判定）
    function auroraMouseEnabled() { return !reducedMotion && !coarse && !isWindows && bgSettings.mouse; }
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
    }
    // 监听常驻（一个 passive listener 成本可忽略），是否生效由 auroraMouseEnabled 逐帧决定
    window.addEventListener("mousemove", onMove, { passive: true });

    var start = performance.now();
    var raf = 0;
    var running = true;
    var last = 0;
    var auroraBlanked = false;
    var FRAME = 1000 / 30;

    function hex2rgb(hex) {
      var h = hex.replace("#", "");
      return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!running || !state.dark) return;
      var frameMs = 1000 / (bgSettings.fps || 30); // 帧率上限跟随设置
      if (!bgSettings.aurora) {
        // 关闭：清空画布一次（透明）后跳过渲染，rAF 空转成本可忽略
        if (!auroraBlanked) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); auroraBlanked = true; }
        return;
      }
      if (now - last < frameMs) return;
      last = now - (now - last) % frameMs;
      auroraBlanked = false;
      var cfg = currentAuroraConfig();

      var kk = auroraScale();
      var w = Math.round(canvas.clientWidth * kk);
      var h = Math.round(canvas.clientHeight * kk);
      if (w !== W || h !== H) resizeAll();

      mouse.smoothX += (mouse.x - mouse.smoothX) * cfg.mouseSmoothing;
      mouse.smoothY += (mouse.y - mouse.smoothY) * cfg.mouseSmoothing;
      mouse.svx += ((mouse.x - mouse.smoothX) * 0.5 - mouse.svx) * cfg.mouseVelocity;
      mouse.svy += ((mouse.y - mouse.smoothY) * 0.5 - mouse.svy) * cfg.mouseVelocity;

      // --- flowmap pass（鼠标笔刷 → 低分辨率流场，双缓冲乒乓） ---
      // GPU 优化：无鼠标笔刷（Windows/触屏/reduced-motion）时流场恒为初始中性态
      // （r=0, gb=0.5，没有笔刷输入其内容永不改变），整帧跳过该 pass，画面逐像素一致。
      var src = flip ? targetA : targetB;
      var dst = flip ? targetB : targetA;
      if (auroraMouseEnabled()) {
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
      gl.uniform1f(uFlow.brushStrength, auroraMouseEnabled() ? cfg.mouseStrength : 0);
      gl.uniform1f(uFlow.decay, cfg.decay);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      }

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
        var lf = auroraMouseEnabled() && cfg.lightFollow != null ? cfg.lightFollow : 0;
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
    // GPU 优化：点精灵粒子不需要 MSAA，antialias:false 省掉全屏 MSAA resolve；
    // low-power 提示驱动选择低功耗 GPU。渲染效果与原来一致（GL_POINTS 本来就不走多边形 AA）。
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
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
      if (!bgSettings.mouse) return; // 设置面板「鼠标跟随交互」关闭时忽略
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

    // GPU 优化：鲸鱼是柔光粒子层，1.25x 物理分辨率渲染（原 1.5x 上限），
    // 像素量减少约 30%，屏幕混合的柔光粒子放大后无感知差异
    var WHALE_DPR = 1.25;
    function resize() {
      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      var dpr = WHALE_DPR;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (whaleLayer.style.display === "none") return;
      var frameMs = 1000 / (bgSettings.fps || 30);
      if (now - last < frameMs) return;
      var dt = Math.min(0.5, (now - last) / 1000);
      last = now - (now - last) % frameMs;

      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      if (Math.round(w * WHALE_DPR) !== canvas.width) resize();

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
      // 鼠标强度：官方以 (1-0.05^dt) 插值；设置面板关闭时恒为 0
      var target = (mouse.active && bgSettings.mouse) ? MOUSE_DEFAULTS.strength : 0;
      strength += (target - strength) * (1 - Math.pow(0.05, dt));
      gl.uniform1f(u.uMouseStrength, strength);
      // 光线：官方 lightParams.followX —— light.x 跟随鼠标世界坐标（关闭时固定）
      var halfW = HALF_H * aspect;
      gl.uniform3f(u.uLightPos, LIGHT_DEFAULTS.x + (bgSettings.mouse ? mouse.x : 0) * halfW * LIGHT_DEFAULTS.followX, LIGHT_DEFAULTS.y, LIGHT_DEFAULTS.z);
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

    // GPU 优化：细线星座网格的 2D canvas 上限 1.5x（原 2x），
    // 填充像素量约减 44%；0.5px 线条在 1.5x 下仍为 0.75 物理像素，观感不变
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
      if (!bgSettings.mouse) return; // 设置面板「鼠标跟随交互」关闭时忽略（网格保持静止）
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
    wakeConstellationRef = wake; // 设置面板重新开启星座时唤醒（idle 停止后 rAF 已停）

    var constBlanked = false;
    function loop(now) {
      if (!state.dark || !bgSettings.constellation) {
        // 关闭：清空画布一次后空转（与浅色主题同一模式，代价可忽略）
        if (!bgSettings.constellation && !constBlanked) {
          ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
          constBlanked = true;
        }
        raf = requestAnimationFrame(loop);
        return;
      }
      constBlanked = false;
      var frameMs = 1000 / (bgSettings.fps || 30);
      if (now - last < frameMs) { raf = requestAnimationFrame(loop); return; }
      last = now - (now - last) % frameMs;

      // 布局未就绪时补一次尺寸同步
      if (Math.round(canvas.clientWidth * dpr) !== canvas.width ||
          Math.round(canvas.clientHeight * dpr) !== canvas.height) {
        resize();
      }

      var mx = bgSettings.mouse ? mouse.x : NaN, my = bgSettings.mouse ? mouse.y : NaN;
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

  setupSettingsUi(ctx); // 注册设置页「背景特效」条目（slots 未就绪时由 inject 等待）
  boot();
}

    exports.apply = apply;
    // 设置面板依赖 slots 服务（由 dsh-client-ui-slots 提供）；未就绪时等待其出现
    exports.inject = ["slots"];
    return module.exports;
  }
});
