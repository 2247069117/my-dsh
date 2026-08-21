/*!
 * dsh-client-ui-deepseek-bg 客户端入口（自动生成）
 * 由 scripts/build.mjs 从 src/ 拼接生成——请勿直接修改本文件；
 * 修改源码（src/ 下的模块与 CSS）后运行：node scripts/build.mjs
 */
window.__ModuleLoader__.load({
  id: "dsh-client-ui-deepseek-bg",
  factory: (require) => {
    "use strict";
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
 * 全主题统一深色：浅色/深色均使用 harness 深色主题（#0a0a0a + 玻璃/极光/鲸鱼）。
 */

/* ---------- 背景层：全主题统一深色 ---------- */
#dsh-ds-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: #0a0a0a;
  animation: dsh-ds-enter 1.8s ease-out backwards;
  /* GPU 优化：不常驻 will-change（入场动画由合成器自动提升层），避免全屏容器
     永久占用一层合成显存与带宽 */
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

/* 鲸鱼层：screen 混合，全主题显示 */
.dsh-ds-whale {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 2;
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
 * 外壳透明化：全主题统一深色背景透出
 * ===================================================================== */

/* 背景透出：body 与外壳层透明化 */
body {
  background: transparent !important;
}

body [data-slot="root"] > div {
  background: transparent !important;
}

/* 当前构建的布局 frame 类名（精确覆盖，防中间包裹层） */
body [data-slot="root"] .pI_x6G_frame {
  background: transparent !important;
}

/* 插件加载前的启动屏 */
body #root ._boot_9gj4p_6 {
  background: transparent !important;
}

/* 视图根容器透明化：会话视图（bg-base）与详情列内容（轨迹视图 bg-layer-1）
   都是全高不透明容器，会盖住 DeepSeek 背景层 */
body [data-slot="conversation"] > div {
  background: transparent !important;
}

body .pI_x6G_detailsCol > div {
  background: transparent !important;
}

/* ============ 官方玻璃拟态（ds-glass 令牌，取自缓存 6f322bb0cffe2c36.css） ============ */

/* 侧边对话栏：半透明 + 玻璃模糊
   注意：backdrop-filter 会让元素成为 fixed 后代的包含块（设置弹窗会被
   强制压成侧边栏宽度）——所以模糊放在 ::before 伪元素上，列本身只设背景 */
body .pI_x6G_sidebarCol {
  position: relative;
  background: rgba(13, 15, 19, 0.55) !important;
  border-right-color: hsla(0, 0%, 100%, 0.08) !important;
}

body .pI_x6G_sidebarCol::before {
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
body .hHd-Xa_root,
body [data-slot="sidebar"] > div {
  background: transparent !important;
}

/* 底部输入框卡片：官方玻璃卡片样式（ds-glass-card/dropdown 同款令牌）
   [data-composer-card="true"] 为跨构建通用属性选择器 */
body .uV2eYG_card,
body [data-composer-card="true"] {
  background: rgba(13, 15, 19, 0.55) !important;
  /* GPU 优化：输入卡片背后有滚动文字，模糊最可见；强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border-color: hsla(0, 0%, 100%, 0.08) !important;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 4px 0 rgba(0, 0, 0, 0.02), 0 12px 32px 0 rgba(0, 0, 0, 0.08) !important;
}

/* 输入框座位：去掉向不透明底色的渐隐，让极光从玻璃下透出
   [data-composer-seat] 为跨构建通用属性选择器 */
body .wSkVaW_composerSeat,
body [data-composer-seat] {
  background: transparent !important;
}

/* 会话列表底部渐隐条（qDHVXG_fade）：原来用不透明侧边栏填充色渐变，
   在玻璃侧边栏下会露出浅色白条——透明化 */
body .qDHVXG_fade {
  background: transparent !important;
}

/* ============ 消息气泡与代码块玻璃化（与侧边栏/输入框同款材质） ============ */

/* 用户消息气泡 */
body .gdEzaW_bubble {
  background: rgba(13, 15, 19, 0.55) !important;
  /* GPU 优化：气泡数量多且背后是平滑极光；强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* 代码块容器（终端/阅读/差异/搜索等 DSL 块）+ 复制按钮 + banner */
body ._block_10eou_7,
body ._block_biesw_7,
body ._block_srovd_7,
body ._block_s66q0_7,
body ._block_178r4_4,
body ._block_d4nqi_7,
body ._body_1ye18_20,
body ._copyButton_10eou_142,
body ._bannerWrap_178r4_21 {
  background: rgba(13, 15, 19, 0.55) !important;
  /* GPU 优化：代码块数量多；强度跟随设置面板 */
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* ============ 工具调用行统一透明与悬浮交互（彻底消除 Bash 等黑框框） ============ */
body .CY-8Ka_card,
body .o3BgMG_root,
body .ztWv_q_callRow,
body .Md3f7G_callRow {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

body .CY-8Ka_root,
body .o3BgMG_row {
  background: transparent !important;
  border-radius: 6px !important;
  transition: background 0.15s ease !important;
}
body .CY-8Ka_root:hover,
body .o3BgMG_row:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 展开后的终端与输出卡片（保持深邃毛玻璃） */
body .CY-8Ka_terminal,
body .CY-8Ka_ioCard,
body .o3BgMG_ioCard {
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
  font-size: 14px;
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
.dsh-thinking-orb-wrap[data-waiting] { filter: drop-shadow(0 0 6px rgba(148, 163, 184, 0.65)) !important; opacity: 0.92; }
.dsh-thinking-orb-wrap[data-planning],
[data-plan-mode="1"] .dsh-thinking-orb-wrap {
  filter: drop-shadow(0 0 8px rgba(255, 122, 41, 0.95)) !important;
}

.dsh-thinking-orb-canvas {
  width: 20px;
  height: 20px;
  display: block;
}

/* 隐藏原生直接裸文本，防止 React Virtual DOM 冲突 */
.Md3f7G_turnStatus,
[role="status"][aria-live="polite"].Md3f7G_turnStatus {
  font-size: 0 !important;
}

.dsh-turn-status-text {
  font-size: 14px !important;
  line-height: 24px !important;
  font-weight: 500 !important;
  display: inline-block !important;
  vertical-align: middle !important;
  color: var(--dsw-static-deepseek-500, #1d6bf3);
  -webkit-text-fill-color: var(--dsw-static-deepseek-500, #1d6bf3);
}

body .Md3f7G_turnStatus {
  display: inline-flex !important;
  align-items: center !important;
  font-weight: 500 !important;
  font-size: 0 !important;
  line-height: 24px !important;
  filter: drop-shadow(0 0 10px rgba(77, 139, 245, 0.45)) !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 4px 0 !important;
}

body .dsh-turn-status-text {
  display: inline-block !important;
  background: linear-gradient(90deg, #4d8bf5 0%, #60a5fa 35%, #ffffff 50%, #60a5fa 65%, #4d8bf5 100%) !important;
  background-size: 250% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  animation: 1.8s linear infinite Md3f7G_dsh-turn-status-shimmer !important;
}

.Md3f7G_turnStatusClock,
[class*="turnStatusClock"] {
  font-size: 12px !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

body .Md3f7G_turnStatusClock {
  font-size: 12px !important;
  font-variant-numeric: tabular-nums !important;
  color: rgba(255, 255, 255, 0.6) !important;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.6) !important;
  margin-left: 8px !important;
  font-weight: 400 !important;
  filter: none !important;
}

body [data-plan-mode="1"] .Md3f7G_turnStatus,
body .Md3f7G_turnStatus[data-planning] {
  filter: drop-shadow(0 0 10px rgba(255, 122, 41, 0.5)) !important;
}

body [data-plan-mode="1"] .dsh-turn-status-text,
body .Md3f7G_turnStatus[data-planning] .dsh-turn-status-text {
  background: linear-gradient(90deg, #ff7a29 0%, #ff9d42 35%, #fff1d6 50%, #ff9d42 65%, #ff7a29 100%) !important;
  background-size: 250% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
}

[data-plan-mode="1"] .dsh-turn-status-text,
.Md3f7G_turnStatus[data-planning] .dsh-turn-status-text {
  color: #ff7a29 !important;
  -webkit-text-fill-color: #ff7a29 !important;
}

/* ============ 计划待审框 (Plan Review Card) ============ */
body .LVzXQa_card,
body [data-slot="plan-review"] > div {
  background: rgba(13, 15, 19, 0.68) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid rgba(255, 150, 40, 0.25) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 150, 40, 0.15) !important;
}
body .LVzXQa_strip {
  background: rgba(255, 140, 40, 0.12) !important;
  color: #ff9d42 !important;
}
body .LVzXQa_dot {
  background: #ff7a29 !important;
  box-shadow: 0 0 8px rgba(255, 122, 41, 0.8) !important;
}

/* ============ 任务清单框 (Todo List Dock & Panel) — Pulse 官方风格 ============ */

/* 1. 容器卡片材质（Card Container） */
body [data-testid="todo-panel"],
body [data-slot="conversation.input.dock"] section,
body .lXshSW_root,
body ._7yHdaG_panel,
body [data-slot="conversation.input.dock"] ._7yHdaG_panel,
body [data-slot="conversation.input.dock"] > div > section {
  position: relative !important;
  background: rgba(29, 29, 29, 0.78) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: none !important;
  border-radius: 16px !important;
  box-shadow: inset 0 0 0 1px rgba(44, 47, 54, 0.52), inset 0 0 50px 0 rgba(255, 255, 255, 0.02), 0 8px 32px rgba(0, 0, 0, 0.35) !important;
  margin-bottom: 8px !important;
  overflow: visible !important;
  isolation: isolate !important;
  box-sizing: border-box !important;
  transition: box-shadow 0.3s ease, background 0.3s ease !important;
}

body [data-slot="conversation.input.dock"] {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}

body ._7yHdaG_panel:after {
  display: none !important;
  border: none !important;
}

body .lXshSW_body {
  position: relative !important;
  z-index: 4 !important;
  padding: 14px 18px !important;
  gap: 12px !important;
  box-sizing: border-box !important;
}

body .lXshSW_header {
  padding: 0 !important;
  gap: 10px !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}

body ._7yHdaG_header {
  padding: 10px 14px !important;
  gap: 10px !important;
  border-radius: 12px !important;
}

body ._7yHdaG_header:hover,
body .lXshSW_header:hover {
  background: transparent !important;
}

body .lXshSW_lead,
body ._7yHdaG_lead {
  color: #858585 !important;
  transition: color 0.15s ease !important;
}

body .lXshSW_header:hover .lXshSW_lead,
body ._7yHdaG_header:hover ._7yHdaG_lead {
  color: #ededed !important;
}

body .lXshSW_chevron,
body ._7yHdaG_chevron {
  color: #858585 !important;
  transition: color 0.15s ease, transform 0.2s ease !important;
}

body .lXshSW_header:hover .lXshSW_chevron,
body ._7yHdaG_header:hover ._7yHdaG_chevron {
  color: #ededed !important;
}

/* 2. 标题与状态文字流光（Text Shimmer） */
body .lXshSW_title {
  font-size: 13px !important;
  font-weight: 600 !important;
  line-height: 20px !important;
  background: linear-gradient(90deg, transparent 0%, transparent 40%, #ffffff 50%, transparent 60%, transparent 100%), #ededed !important;
  background-size: 400% 100%, 100% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  animation: dsh-pulse-shimmer 2.4s linear infinite !important;
  display: inline-block !important;
}

body .lXshSW_progress,
body ._7yHdaG_count,
body [data-testid="todo-panel"] [class*="progress"],
body [data-testid="todo-panel"] [class*="title"] {
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 20px !important;
  background: linear-gradient(90deg, transparent 0%, transparent 40%, #ededed 50%, transparent 60%, transparent 100%), #858585 !important;
  background-size: 400% 100%, 100% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  animation: dsh-pulse-shimmer 2.4s linear infinite !important;
  display: inline-block !important;
}

@keyframes dsh-pulse-shimmer {
  0% {
    background-position: 100% 0px, 0 0;
  }
  100% {
    background-position: 0% 0px, 0 0;
  }
}

/* 3. 任务条目与状态指示器（Task Items & Status Glyphs） */
body .lXshSW_list,
body ._7yHdaG_list {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  max-height: 200px !important;
  margin: 0 !important;
  padding: 4px 0 0 0 !important;
  list-style: none !important;
  overflow-y: auto !important;
}

body .lXshSW_item,
body ._7yHdaG_row,
body [data-testid="todo-panel"] li {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  font-size: 13px !important;
  line-height: 16px !important;
  padding: 4px 6px !important;
  border-radius: 8px !important;
  transition: background 0.15s ease !important;
  background: transparent !important;
  box-sizing: border-box !important;
}

body .lXshSW_item:hover,
body ._7yHdaG_row:hover,
body [data-testid="todo-panel"] li:hover {
  background: rgba(255, 255, 255, 0.04) !important;
}

body .lXshSW_content {
  min-width: 0 !important;
  flex: auto !important;
  transition: color 0.2s ease !important;
}

body .lXshSW_glyph {
  flex: none !important;
  place-items: center !important;
  width: 16px !important;
  height: 16px !important;
  display: grid !important;
  transition: filter 0.25s ease, color 0.25s ease !important;
}

/* 进行中状态（in_progress） */
body [data-status="in_progress"] .lXshSW_content,
body .lXshSW_item[data-status="in_progress"] .lXshSW_content,
body [data-testid="todo-panel"] [data-status="in_progress"] [class*="content"] {
  color: #f5f5f5 !important;
  -webkit-text-fill-color: #f5f5f5 !important;
  font-weight: 500 !important;
}

body [data-status="in_progress"] .lXshSW_glyph,
body .lXshSW_glyphProgress,
body [data-testid="todo-panel"] [data-status="in_progress"] [class*="glyph"] {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.65)) !important;
  animation: dsh-task-spin 2s linear infinite !important;
  transform-origin: center center !important;
}

body [data-status="in_progress"] svg circle,
body .lXshSW_glyphProgress circle {
  stroke-dasharray: 3 3 !important;
  stroke: #38bdf8 !important;
}

@keyframes dsh-task-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 已完成状态（completed） */
body [data-status="completed"] .lXshSW_content,
body .lXshSW_item[data-status="completed"] .lXshSW_content,
body [data-testid="todo-panel"] [data-status="completed"] [class*="content"] {
  color: #686868 !important;
  -webkit-text-fill-color: #686868 !important;
  font-weight: 400 !important;
}

body [data-status="completed"] .lXshSW_glyph,
body .lXshSW_glyphCompleted,
body [data-testid="todo-panel"] [data-status="completed"] [class*="glyph"] {
  color: #34d399 !important;
  filter: drop-shadow(0 0 4px rgba(52, 211, 153, 0.35)) !important;
  animation: none !important;
}

body [data-status="completed"] svg circle,
body [data-status="completed"] svg path,
body .lXshSW_glyphCompleted circle,
body .lXshSW_glyphCompleted path {
  color: #34d399 !important;
  stroke: #34d399 !important;
}

/* 待处理状态（pending） */
body [data-status="pending"] .lXshSW_content,
body .lXshSW_item[data-status="pending"] .lXshSW_content,
body [data-testid="todo-panel"] [data-status="pending"] [class*="content"] {
  color: #858585 !important;
  -webkit-text-fill-color: #858585 !important;
  font-weight: 400 !important;
}

body [data-status="pending"] .lXshSW_glyph,
body .lXshSW_glyphPending,
body [data-testid="todo-panel"] [data-status="pending"] [class*="glyph"] {
  color: #686868 !important;
  filter: none !important;
  opacity: 0.7 !important;
  animation: none !important;
}

body [data-status="pending"] svg circle,
body .lXshSW_glyphPending circle {
  stroke-dasharray: 2.4 2.4 !important;
  stroke: #686868 !important;
}

/* 4. Border Beam Pulse 边缘脉冲光束集成 */
[data-beam="dsh-todo"] {
  position: relative !important;
  border-radius: 16px !important;
  overflow: visible !important;
  isolation: isolate !important;
}

[data-beam="dsh-todo"]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 15px;
  padding: 1px;
  clip-path: inset(0 round 16px);
  background:
    radial-gradient(ellipse 70px 40px at 33% -7.4%, rgb(255, 50, 100), transparent),
    radial-gradient(ellipse 60px 35px at 12% -5%, rgb(40, 140, 255), transparent),
    radial-gradient(ellipse 40px 70px at 2.1% 68.3%, rgb(50, 200, 80), transparent),
    radial-gradient(ellipse 20px 35px at 2.1% 68.3%, rgb(30, 185, 170), transparent),
    radial-gradient(ellipse 180px 32px at 74.4% 100%, rgb(100, 70, 255), transparent),
    radial-gradient(ellipse 85px 26px at 55% 100%, rgb(40, 140, 255), transparent),
    radial-gradient(ellipse 74px 32px at 93.9% 0%, rgb(255, 120, 40), transparent),
    radial-gradient(ellipse 26px 42px at 100% 27.1%, rgb(240, 50, 180), transparent),
    radial-gradient(ellipse 52px 48px at 100% 27.1%, rgb(180, 40, 240), transparent);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
  z-index: 2;
  opacity: 0.35;
  transition: opacity 0.4s ease;
  animation: none;
}

[data-beam="dsh-todo"]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background:
    radial-gradient(ellipse 63px 36px at 33% -7.4%, rgba(255, 50, 100, 0.4), transparent),
    radial-gradient(ellipse 54px 32px at 12% -5%, rgba(40, 140, 255, 0.4), transparent),
    radial-gradient(ellipse 36px 63px at 2.1% 68.3%, rgba(50, 200, 80, 0.4), transparent),
    radial-gradient(ellipse 18px 32px at 2.1% 68.3%, rgba(30, 185, 170, 0.4), transparent),
    radial-gradient(ellipse 162px 29px at 74.4% 100%, rgba(100, 70, 255, 0.4), transparent),
    radial-gradient(ellipse 77px 23px at 55% 100%, rgba(40, 140, 255, 0.4), transparent),
    radial-gradient(ellipse 67px 29px at 93.9% 0%, rgba(255, 120, 40, 0.4), transparent),
    radial-gradient(ellipse 23px 38px at 100% 27.1%, rgba(240, 50, 180, 0.4), transparent),
    radial-gradient(ellipse 47px 43px at 100% 27.1%, rgba(180, 40, 240, 0.4), transparent);
  box-shadow: inset 0 0 10px 1px rgba(255, 255, 255, 0.18);
  -webkit-mask-image:
    linear-gradient(white, transparent 24px, transparent calc(100% - 24px), white),
    linear-gradient(to right, white, transparent 24px, transparent calc(100% - 24px), white);
  -webkit-mask-composite: source-over;
  mask-image:
    linear-gradient(white, transparent 24px, transparent calc(100% - 24px), white),
    linear-gradient(to right, white, transparent 24px, transparent calc(100% - 24px), white);
  mask-composite: add;
  pointer-events: none;
  z-index: 1;
  opacity: 0.28;
  clip-path: inset(0 round 16px);
  transition: opacity 0.4s ease;
  animation: none;
}

[data-beam="dsh-todo"] [data-beam-bloom] {
  display: block;
  position: absolute;
  inset: -1px;
  border-radius: 16px;
  clip-path: inset(0 round 16px);
  background:
    radial-gradient(ellipse 70px 40px at 33% -7.4%, rgb(255, 50, 100), transparent),
    radial-gradient(ellipse 60px 35px at 12% -5%, rgb(40, 140, 255), transparent),
    radial-gradient(ellipse 40px 70px at 2.1% 68.3%, rgb(50, 200, 80), transparent),
    radial-gradient(ellipse 20px 35px at 2.1% 68.3%, rgb(30, 185, 170), transparent),
    radial-gradient(ellipse 180px 32px at 74.4% 100%, rgb(100, 70, 255), transparent),
    radial-gradient(ellipse 85px 26px at 55% 100%, rgb(40, 140, 255), transparent),
    radial-gradient(ellipse 74px 32px at 93.9% 0%, rgb(255, 120, 40), transparent),
    radial-gradient(ellipse 26px 42px at 100% 27.1%, rgb(240, 50, 180), transparent),
    radial-gradient(ellipse 52px 48px at 100% 27.1%, rgb(180, 40, 240), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
  filter: blur(8px) brightness(1.2) saturate(1.2);
  pointer-events: none;
  z-index: 3;
  opacity: 0.15;
  transition: opacity 0.4s ease;
  animation: none;
}

/* Active Pulse State: 存在进行中任务或运行状态时的灵动脉冲呼吸 */
[data-beam="dsh-todo"][data-active]::after,
[data-beam="dsh-todo"][data-pulse-active]::after {
  opacity: 0.85;
  animation: beam-pulse-hue-shift 12s ease-in-out infinite, dsh-pulse-breathe 2.8s ease-in-out infinite;
}

[data-beam="dsh-todo"][data-active]::before,
[data-beam="dsh-todo"][data-pulse-active]::before {
  opacity: 0.7;
  animation: beam-pulse-hue-shift 12s ease-in-out infinite, dsh-pulse-inner-breathe 2.8s ease-in-out infinite;
}

[data-beam="dsh-todo"][data-active] [data-beam-bloom],
[data-beam="dsh-todo"][data-pulse-active] [data-beam-bloom] {
  opacity: 0.55;
  animation: beam-pulse-hue-shift 12s ease-in-out infinite, dsh-pulse-bloom-breathe 2.8s ease-in-out infinite;
}

@keyframes beam-pulse-hue-shift {
  0% {
    filter: hue-rotate(-30deg) brightness(1.2) saturate(1.2);
  }
  50% {
    filter: hue-rotate(30deg) brightness(1.2) saturate(1.2);
  }
  100% {
    filter: hue-rotate(-30deg) brightness(1.2) saturate(1.2);
  }
}

@keyframes dsh-pulse-breathe {
  0%, 100% {
    opacity: 0.45;
    filter: hue-rotate(-30deg) brightness(1.15) saturate(1.2);
  }
  50% {
    opacity: 0.95;
    filter: hue-rotate(15deg) brightness(1.45) saturate(1.4);
  }
}

@keyframes dsh-pulse-inner-breathe {
  0%, 100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.85;
  }
}

@keyframes dsh-pulse-bloom-breathe {
  0%, 100% {
    opacity: 0.25;
    filter: blur(6px) brightness(1.1);
  }
  50% {
    opacity: 0.65;
    filter: blur(10px) brightness(1.4);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-beam="dsh-todo"]::after,
  [data-beam="dsh-todo"]::before,
  [data-beam="dsh-todo"] [data-beam-bloom],
  body .lXshSW_title,
  body .lXshSW_progress,
  body ._7yHdaG_count,
  body [data-status="in_progress"] .lXshSW_glyph,
  body .lXshSW_glyphProgress {
    animation: none !important;
  }
}

/* ============ 提问框 (Ask User Question Card) ============ */
body .Mbwy4a_card,
body [data-slot="user-questions"] > div {
  background: rgba(13, 15, 19, 0.68) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.1) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
}

/* ============ 授权/审批卡片与设置弹窗 ============ */
body .VOzbGW_panel,
body [data-slot="approval"] > div {
  background: rgba(13, 15, 19, 0.75) !important;
  backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  -webkit-backdrop-filter: blur(var(--dsh-bg-blur, 8px)) !important;
  border: 1px solid hsla(0, 0%, 100%, 0.1) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), inset 0 0 0 1px hsla(0, 0%, 100%, 0.08) !important;
  border-radius: 16px !important;
}

/* ============ 发送按钮与交互微动效 ============ */
body .uV2eYG_primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35) !important;
  border-radius: 999px !important;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease, box-shadow 0.2s ease !important;
}
body .uV2eYG_primary:hover:not(:disabled) {
  transform: scale(1.05) !important;
  filter: brightness(1.15) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5) !important;
}
body .uV2eYG_primary:active:not(:disabled) {
  transform: scale(0.95) !important;
}
body [data-composer-card="true"][data-planning] .uV2eYG_primary,
body .uV2eYG_card[data-planning] .uV2eYG_primary {
  background: linear-gradient(135deg, #ff5a36, #ff9500) !important;
  box-shadow: 0 2px 12px rgba(255, 90, 54, 0.45) !important;
}

/* ============ 玻璃开关（body.dsh-bg-no-glass）：移除 backdrop blur，垫实底色保可读性 ============ */
body.dsh-bg-no-glass .pI_x6G_sidebarCol::before {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: transparent !important;
}
body.dsh-bg-no-glass .pI_x6G_sidebarCol {
  background: rgba(13, 15, 19, 0.92) !important;
}
body.dsh-bg-no-glass .uV2eYG_card,
body.dsh-bg-no-glass [data-composer-card="true"],
body.dsh-bg-no-glass .gdEzaW_bubble,
body.dsh-bg-no-glass ._block_10eou_7,
body.dsh-bg-no-glass ._block_biesw_7,
body.dsh-bg-no-glass ._block_srovd_7,
body.dsh-bg-no-glass ._block_s66q0_7,
body.dsh-bg-no-glass ._block_178r4_4,
body.dsh-bg-no-glass ._block_d4nqi_7,
body.dsh-bg-no-glass ._body_1ye18_20,
body.dsh-bg-no-glass ._copyButton_10eou_142,
body.dsh-bg-no-glass ._bannerWrap_178r4_21,
body.dsh-bg-no-glass .LVzXQa_card,
body.dsh-bg-no-glass .Mbwy4a_card,
body.dsh-bg-no-glass .VOzbGW_panel,
body.dsh-bg-no-glass .CY-8Ka_ioCard,
body.dsh-bg-no-glass .o3BgMG_ioCard {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: rgba(13, 15, 19, 0.92) !important;
}

body.dsh-bg-no-glass [data-testid="todo-panel"],
body.dsh-bg-no-glass [data-slot="conversation.input.dock"] section,
body.dsh-bg-no-glass .lXshSW_root,
body.dsh-bg-no-glass ._7yHdaG_panel {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: #1d1d1d !important;
}

`;
      document.head.appendChild(styleTag);
    }

/* ===================== beam-css.js ===================== */
/* ===================================================================== *
 * src/beam-css.js — 工厂级片段（无副作用：纯常量与纯函数）
 *   Border Beam 调色板 / BEAM_* 参数 / CSS 生成函数（buildBeamCSS 等），
 *   被 src/beam.js（initBeam）直接调用。拼接时置于工厂闭包顶层。
 * ===================================================================== */
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

  


/* ===================== orbs-math.js ===================== */
/* ===================================================================== *
 * src/orbs-math.js — 工厂级片段（无副作用：纯函数）
 *   Thinking Orbs 几何数学（orbs.jakubantalik.com 移植）：Jl..up、
 *   drawOrb 系列与 getOrbPreset，被 src/orbs.js（initOrbs）直接调用。
 * ===================================================================== */
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
   * 9 种几何动效: searching / listening / composing / solving /
   *               connecting / shaping / weaving / breathing / working
   * ------------------------------------------------------------------ */


/* ===================== aurora-shaders.js ===================== */
/* ===================================================================== *
 * src/aurora-shaders.js — 工厂级片段（无副作用：字符串常量）
 *   极光引擎 GLSL 着色器（与 DeepSeek 打包产物逐字一致），
 *   被 src/aurora.js（initAurora）直接引用。
 * ===================================================================== */
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


/* ===================== whale-shaders.js ===================== */
/* ===================================================================== *
 * src/whale-shaders.js — 工厂级片段（无副作用：常量/工具函数）
 *   鲸鱼 SVG 纹理 / 默认参数 / GLSL 着色器 / 4x4 矩阵工具 / 像素采样，
 *   被 src/whale.js（initWhale）直接调用。
 * ===================================================================== */
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
  // 官方参数（chunk 776 源码常量，fish 变体，提升基础亮度与光照对比度）
  var LIGHT_DEFAULTS = { x: 4.5, y: 5.5, z: 3, range: 14, shadeMin: 0.42, shadeMax: 1.35, followX: 1.05 };
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
    "  float glow = smoothstep(8.0, 0.0, dist) * 0.35 * vAssembly;\n" +
    "  float baseAlpha = mix(0.65, 0.95, vAssembly);\n" +
    "  float alpha = vOpacity * (baseAlpha + glow);\n" +
    "  float shimmer = sin(uTime * 1.5 + vWorldPos.x * 5.0 + vWorldPos.y * 3.0) * 0.08 + 0.92;\n" +
    "  alpha *= shimmer * clamp(vLight * 0.85 + 0.25, 0.3, 1.0);\n" +
    "  vec3 color = (uColor + glow * vec3(0.15, 0.25, 0.45)) * vLight;\n" +
    "  color = mix(color, vec3(1.0), clamp(vLight - 0.85, 0.0, 1.0) * 0.45);\n" +
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
  function m4Inverse(m, out) {
    // GPU 优化：支持传入复用缓冲（out），帧循环调用零分配
    var m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
    var m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
    var m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
    var m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

    var b00 = m00 * m11 - m01 * m10;
    var b01 = m00 * m12 - m02 * m10;
    var b02 = m00 * m13 - m03 * m10;
    var b03 = m01 * m12 - m02 * m11;
    var b04 = m01 * m13 - m03 * m11;
    var b05 = m02 * m13 - m03 * m12;
    var b06 = m20 * m31 - m21 * m30;
    var b07 = m20 * m32 - m22 * m30;
    var b08 = m20 * m33 - m23 * m30;
    var b09 = m21 * m32 - m22 * m31;
    var b10 = m21 * m33 - m23 * m31;
    var b11 = m22 * m33 - m23 * m32;

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return m4Identity();
    var invDet = 1.0 / det;

    // 复用调用方传入的缓冲（帧循环零分配）；未传时保持原有行为分配新数组
    out = out || new Float32Array(16);
    out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * invDet;
    out[1] = (-m01 * b11 + m02 * b10 - m03 * b09) * invDet;
    out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * invDet;
    out[3] = (-m21 * b05 + m22 * b04 - m23 * b03) * invDet;
    out[4] = (-m10 * b11 + m12 * b08 - m13 * b07) * invDet;
    out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * invDet;
    out[6] = (-m30 * b05 + m32 * b02 - m33 * b01) * invDet;
    out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * invDet;
    out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * invDet;
    out[9] = (-m00 * b10 + m01 * b08 - m03 * b06) * invDet;
    out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * invDet;
    out[11] = (-m20 * b04 + m21 * b02 - m23 * b00) * invDet;
    out[12] = (-m10 * b09 + m11 * b07 - m12 * b06) * invDet;
    out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * invDet;
    out[14] = (-m30 * b03 + m31 * b01 - m32 * b00) * invDet;
    out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * invDet;

    return out;
  }


/* ===================== theme.js ===================== */
/* ------------------------------------------------------------------ *
 * src/theme.js — 主题检测与官方参数配置（initTheme）
 *   全主题统一深色：state.dark 恒为 true，浅色/深色均使用 harness 深色配置。
 *   保留 LIGHT_* 仅作参考，不再参与运行时分支。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initTheme(shared) {
  var state = shared.state;

  function detectDark() {
    return true; // 全主题统一深色，不再区分浅色
  }

  /* ------------------------------------------------------------------ *
   * 官方参数配置
   *   浅色：www.deepseek.com 首页 hero（particle 渲染）— 保留仅作参考
   *   深色：www.deepseek.com/harness hero（fluid 渲染）— 全主题统一使用
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

  function currentAuroraConfig() { return DARK_AURORA; }
  function currentConstellation() { return DARK_CONSTELLATION; }

  state.dark = true;

  shared.refs.detectDark = detectDark;
  shared.refs.currentAuroraConfig = currentAuroraConfig;
  shared.refs.currentConstellation = currentConstellation;
}


/* ===================== settings.js ===================== */
/* ===================================================================== *
 * src/settings.js — GPU 特效设置（initSettings）
 *   档位/开关/高级参数 + 设置页「背景特效」面板（React）。
 *   创建 shared.settings（loadSettings 结果，各模块经 shared.settings 只读）；
 *   跨模块回调一律走 shared.refs.*（beam watch/detach、orbs sync、shell 玻璃、星座唤醒、鲸鱼显隐）。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ===================================================================== */
function initSettings(shared) {
  var ctx = shared.ctx;

  /* ===================================================================== *
   * GPU 特效设置（设置页「背景特效」面板 + 运行时联动）
   *   档位预设 → 独立开关（自动转自定义）→ 高级参数
   *   全部即时生效、localStorage 持久化（dsh-bg-settings）
   *   默认档位：全特效（下载后即开即用，无需手动切换）
   * ===================================================================== */
  var SETTINGS_KEY = "dsh-bg-settings";
  var PRESETS = {
    // 全特效：极光分辨率与玻璃模糊全部拉满（滑杆上限 1.0x / 12px）——下载后默认即为此档
    full: { label: "全特效", aurora: true, whale: true, constellation: true, beam: true, glass: true, orbs: true, mouse: true, auroraScale: 1, fps: 60, blur: 12, followMs: 120, lightFollow: 1 },
    half: { label: "均衡", aurora: false, whale: true, constellation: true, beam: true, glass: true, orbs: true, mouse: true, auroraScale: 0.55, fps: 60, blur: 8, followMs: 20, lightFollow: 1 },
    eco:  { label: "节能", aurora: false, whale: false, constellation: false, beam: true, glass: true, orbs: true, mouse: false, auroraScale: 0.4, fps: 20, blur: 6, followMs: 20, lightFollow: 1 }
  };

  function loadSettings() {
    var d = { mode: "full" };
    var parsed = null;
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (e) {}
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.mode === "string") d.mode = parsed.mode;
    }
    if (PRESETS[d.mode]) {
      // 档位模式：数值全部跟随预设（预设调整后自动生效，无需清理旧缓存）
      var p = PRESETS[d.mode];
      for (var k in p) if (k !== "label") d[k] = p[k];
    } else {
      // 自定义模式：全特效为底，白名单叠加已存数值（防原型污染）
      d.mode = "custom";
      var base = PRESETS.full;
      for (var k2 in base) if (k2 !== "label") d[k2] = base[k2];
      if (parsed && typeof parsed === "object") {
        var allowed = { aurora:1, whale:1, constellation:1, beam:1, glass:1, mouse:1, auroraScale:1, fps:1, blur:1, followMs:1, lightFollow:1 };
        for (var k3 in parsed) if (Object.prototype.hasOwnProperty.call(parsed, k3) && allowed[k3]) d[k3] = parsed[k3];
      }
      d.mode = "custom"; // 非法/过期 mode 值不得覆盖自定义档位
    }
    d.orbs = true; // Thinking Orbs 核心交互特性，始终保持开启
    return d;
  }
  shared.settings = loadSettings();
  var bgSettings = shared.settings;

  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(bgSettings)); } catch (e) { try { if (e && e.name === "QuotaExceededError") console.warn("[dsh-bg] localStorage quota exceeded", e); } catch(_){} } }
  function estimateGpu() {
    var s = bgSettings, score = 0;
    if (s.aurora) score += 52 * Math.min(1.2, (s.auroraScale || 0.75) / 0.75);
    if (s.whale) score += 20;
    if (s.constellation) score += 9;
    if (s.mouse) score += 1; // 光标交互物理（极光漫游笔刷始终在跑，成本几乎无差）
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
      beam: !!bgSettings.beam, glass: !!bgSettings.glass, orbs: true, mouse: !!bgSettings.mouse,
      auroraScale: Number(bgSettings.auroraScale) || 1, fps: Number(bgSettings.fps) || 30, blur: Number(bgSettings.blur) || 8,
      followMs: bgSettings.followMs != null ? Number(bgSettings.followMs) : 20,
      lightFollow: bgSettings.lightFollow != null ? Number(bgSettings.lightFollow) : 1,
      gpu: estimateGpu(),
      canvasW: (shared.dom && shared.dom.auroraCanvas) ? shared.dom.auroraCanvas.width : 0,
      canvasH: (shared.dom && shared.dom.auroraCanvas) ? shared.dom.auroraCanvas.height : 0
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
    bgSettings.orbs = true;
    bgSettings.mode = mode;
    commitSettings();
  }
  function updateSetting(key, value) {
    if (key === "orbs") return;
    bgSettings[key] = value;
    bgSettings.mode = "custom";
    commitSettings();
  }
  function resetSettings() { applyPreset("full"); commitSettings(); }
  function commitSettings() { saveSettings(); applyBgSettings(); notifySettings(); }


  /** 把每个子系统立即切换到当前设置 */
  function applyBgSettings() {
    try { document.body.classList.toggle("dsh-bg-no-glass", !bgSettings.glass); } catch (e) {}
    try { if (shared.refs.updateWhaleDisplay) shared.refs.updateWhaleDisplay(); } catch (e) {}
    try {
      if (bgSettings.beam) {
        if (shared.refs.watchBeamComposer) shared.refs.watchBeamComposer();
        if (shared.refs.watchBeamTodo) shared.refs.watchBeamTodo();
      } else {
        if (shared.refs.detachComposerBeam) shared.refs.detachComposerBeam();
        if (shared.refs.detachTodoBeam) shared.refs.detachTodoBeam();
      }
    } catch (e) {}
    try { if (shared.refs.shellGlassApply) shared.refs.shellGlassApply(); } catch (e) {} // 玻璃内联样式按开关重跑一次（轮询由 makeShellTransparent 持有）
    try { if (shared.refs.syncThinkingOrb) shared.refs.syncThinkingOrb(); } catch (e) {}
    try { if (bgSettings.constellation && shared.refs.wakeConstellation) shared.refs.wakeConstellation(); } catch (e) {}
  }

  /* ---- 设置页「背景特效」面板 ---- */
  var SETTINGS_UI_CSS = [
    ".dsh-bg-settings{display:flex;flex-direction:column;gap:14px;max-width:560px;padding-bottom:28px;}",
    ".dsh-bg-card{border:1px solid rgba(128,128,128,.2);border-radius:12px;padding:14px 16px;background:rgba(128,128,128,.05);}",
    ".dsh-bg-sec-title{font-size:13px;font-weight:600;opacity:.9;margin-bottom:10px;letter-spacing:0.2px;}",
    ".dsh-bg-div{border-top:1px solid rgba(128,128,128,.12);margin:14px 0;}",
    /* 档位：一行三键分段控件 */
    ".dsh-bg-presets{display:flex;gap:6px;}",
    ".dsh-bg-preset{flex:1;cursor:pointer;border:1px solid rgba(128,128,128,.2);background:rgba(128,128,128,.04);color:inherit;border-radius:8px;padding:7px 6px;font-size:13px;font-weight:500;font-family:inherit;text-align:center;transition:all .15s ease;}",
    ".dsh-bg-preset:hover{background:rgba(128,128,128,.1);border-color:rgba(128,128,128,.35);}",
    ".dsh-bg-preset[data-active=\"true\"]{border-color:#4d8bf5;color:#6ea8ff;background:rgba(77,139,245,.14);font-weight:600;}",
    ".dsh-bg-preset-caption{font-size:11px;opacity:.65;margin-top:8px;line-height:1.5;}",
    /* GPU 仪表 */
    ".dsh-bg-meter-label{display:flex;justify-content:space-between;align-items:center;font-size:12px;opacity:.85;margin-bottom:6px;}",
    ".dsh-bg-meter{height:8px;border-radius:999px;background:rgba(128,128,128,.16);overflow:hidden;}",
    ".dsh-bg-meter>div{height:100%;border-radius:999px;transition:width .25s ease,background .25s ease;}",
    ".dsh-bg-meta{font-size:11px;opacity:.55;line-height:1.6;margin-top:8px;}",
    /* 开关行：细分隔线 + 紧凑内边距 */
    ".dsh-bg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 2px;}",
    ".dsh-bg-row+.dsh-bg-row{border-top:1px solid rgba(128,128,128,.08);}",
    ".dsh-bg-row-info{flex:1;min-width:0;}",
    ".dsh-bg-row-title{font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;}",
    ".dsh-bg-row-desc{font-size:11px;opacity:.6;margin-top:2px;line-height:1.4;}",
    ".dsh-bg-chip{font-size:10px;line-height:16px;padding:0 6px;border-radius:999px;border:1px solid rgba(128,128,128,.3);opacity:.85;white-space:nowrap;flex:none;}",
    ".dsh-bg-chip[data-level=\"high\"]{color:#ff9d6b;border-color:rgba(255,140,80,.4);}",
    ".dsh-bg-chip[data-level=\"mid\"]{color:#ffd166;border-color:rgba(255,200,90,.4);}",
    ".dsh-bg-chip[data-level=\"low\"]{color:#7ee2a8;border-color:rgba(110,220,160,.4);}",
    ".dsh-bg-switch{position:relative;width:36px;height:20px;flex:none;cursor:pointer;border-radius:999px;border:none;background:rgba(128,128,128,.3);transition:background .15s;padding:0;}",
    ".dsh-bg-switch[aria-checked=\"true\"]{background:#4d8bf5;}",
    ".dsh-bg-switch::after{content:\"\";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s ease;box-shadow:0 1px 2px rgba(0,0,0,.2);}",
    ".dsh-bg-switch[aria-checked=\"true\"]::after{transform:translateX(16px);}",
    /* 高级折叠面板 */
    ".dsh-bg-adv summary{cursor:pointer;font-size:13px;font-weight:600;opacity:.9;user-select:none;padding:2px 0;outline:none;display:flex;align-items:center;gap:6px;}",
    ".dsh-bg-adv summary::-webkit-details-marker{display:none;}",
    ".dsh-bg-adv summary::before{content:\"▶\";font-size:9px;display:inline-block;transition:transform .2s ease;opacity:.7;}",
    ".dsh-bg-adv[open] summary::before{transform:rotate(90deg);}",
    ".dsh-bg-adv[open] summary{margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(128,128,128,.12);}",
    ".dsh-bg-adv summary:hover{opacity:1;}",
    /* 高级区条目 */
    ".dsh-bg-slider-item,.dsh-bg-adv-row{padding:10px 2px;}",
    ".dsh-bg-slider-item+.dsh-bg-slider-item,.dsh-bg-slider-item+.dsh-bg-adv-row,.dsh-bg-adv-row+.dsh-bg-slider-item,.dsh-bg-adv-row+.dsh-bg-adv-row{border-top:1px solid rgba(128,128,128,.08);}",
    ".dsh-bg-item-title{font-size:13px;font-weight:500;}",
    ".dsh-bg-item-desc{font-size:11px;opacity:.6;line-height:1.45;margin-top:2px;}",
    ".dsh-bg-slider-head{display:flex;align-items:center;justify-content:space-between;gap:8px;}",
    ".dsh-bg-val-badge{font-size:11px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-variant-numeric:tabular-nums;color:#6ea8ff;background:rgba(77,139,245,.12);border:1px solid rgba(77,139,245,.25);border-radius:6px;padding:1px 7px;line-height:16px;flex:none;}",
    ".dsh-bg-range{display:block;width:100%;height:6px;border-radius:3px;background:rgba(128,128,128,.2);outline:none;margin:10px 0 4px;cursor:pointer;-webkit-appearance:none;appearance:none;transition:background .15s;}",
    ".dsh-bg-range:hover{background:rgba(128,128,128,.28);}",
    ".dsh-bg-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:#4d8bf5;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:transform .12s ease;}",
    ".dsh-bg-range::-webkit-slider-thumb:hover{transform:scale(1.15);}",
    ".dsh-bg-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#4d8bf5;cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);}",
    ".dsh-bg-range-labels{display:flex;justify-content:space-between;font-size:10px;opacity:.45;user-select:none;margin-top:2px;}",
    ".dsh-bg-adv-row{display:flex;align-items:center;justify-content:space-between;gap:16px;}",
    ".dsh-bg-adv-info{flex:1;min-width:0;}",
    ".dsh-bg-select{background:rgba(128,128,128,.1);color:inherit;border:1px solid rgba(128,128,128,.28);border-radius:8px;padding:5px 10px;font-size:12px;font-family:inherit;flex:none;cursor:pointer;outline:none;transition:border-color .15s,background .15s;}",
    ".dsh-bg-select:hover{background:rgba(128,128,128,.16);border-color:rgba(128,128,128,.4);}",
    ".dsh-bg-select:focus{border-color:#4d8bf5;}",
    ".dsh-bg-select option{background:#1c1d22;color:#e5e5e5;}",
    /* 底部 */
    ".dsh-bg-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:4px;}",
    ".dsh-bg-reset{cursor:pointer;border:1px solid rgba(128,128,128,.25);background:transparent;color:inherit;border-radius:8px;padding:6px 14px;font-size:12px;font-family:inherit;transition:background .15s,border-color .15s;}",
    ".dsh-bg-reset:hover{background:rgba(128,128,128,.1);border-color:rgba(128,128,128,.4);}",
    ".dsh-bg-note{font-size:11px;opacity:.55;line-height:1.5;}",
    "@media (prefers-reduced-motion: reduce){.dsh-bg-meter>div{transition:none;}}"
  ].join("\n");

  function injectSettingsCss() {
    try {
      var tag = document.getElementById("dsh-bg-settings-css");
      if (!tag) {
        tag = document.createElement("style");
        tag.id = "dsh-bg-settings-css";
        document.head.appendChild(tag);
      }
      tag.textContent = SETTINGS_UI_CSS;
    } catch (e) {}
  }

  function BgSettingsSection() {
    var h = react.createElement;
    var snapState = react.useState(function () { return snapshotSettings(); });
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
      full: "所有特效拉满：极光 1.0x、玻璃 12px、60fps、跟手 120ms",
      half: "保留粒子鲸鱼/星座/玻璃与鼠标跟随，关闭高开销极光流体（60fps / blur 8px）",
      eco: "仅保留玻璃拟态与 Border Beam 及静态深色背景（20fps / blur 6px）"
    };
    var modeName = presetNames[snap.mode] || "自定义";
    var modeCaption = presetDescs[snap.mode] || "手动调整的特效组合，可随时切回预设档位";
    var rows = [
      { key: "aurora", title: "极光背景", desc: "WebGL2 流体渐变，本插件最大 GPU 开销", level: "high" },
      { key: "whale", title: "粒子鲸鱼", desc: "全屏 WebGL2 点阵粒子，光线跟随鼠标", level: "mid" },
      { key: "constellation", title: "星座网格", desc: "2D 网格，鼠标斥力弹簧物理", level: "low" },
      { key: "mouse", title: "鼠标跟随交互", desc: "极光/鲸鱼/星座跟随光标互动；关闭后极光改为自主缓慢漂移，画面保持流动", level: "low" },
      { key: "beam", title: "Border Beam 光效", desc: "输入框边界旋转光晕与打字呼吸", level: "mid" },
      { key: "glass", title: "玻璃拟态", desc: "侧边栏/气泡/代码块的 backdrop blur", level: "mid" }
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
        }, presetNames[id]);
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
    function sliderItem(title, desc, valText, min, max, step, val, minLabel, maxLabel, onValChange) {
      return h("div", { className: "dsh-bg-slider-item" },
        h("div", { className: "dsh-bg-slider-head" },
          h("span", { className: "dsh-bg-item-title" }, title),
          h("span", { className: "dsh-bg-val-badge" }, valText)),
        desc ? h("div", { className: "dsh-bg-item-desc" }, desc) : null,
        h("input", {
          type: "range",
          className: "dsh-bg-range",
          min: min,
          max: max,
          step: step,
          value: val,
          onChange: function (e) { onValChange(e.target.value); }
        }),
        (minLabel || maxLabel) ? h("div", { className: "dsh-bg-range-labels" },
          h("span", null, minLabel || ""),
          h("span", null, maxLabel || "")) : null
      );
    }
    function selectItem(title, desc, value, options, onValChange) {
      return h("div", { className: "dsh-bg-adv-row" },
        h("div", { className: "dsh-bg-adv-info" },
          h("div", { className: "dsh-bg-item-title" }, title),
          desc ? h("div", { className: "dsh-bg-item-desc" }, desc) : null),
        h("select", {
          className: "dsh-bg-select",
          value: value,
          onChange: function (e) { onValChange(e.target.value); }
        }, options.map(function (opt) {
          return h("option", { key: opt.value, value: opt.value }, opt.label);
        }))
      );
    }
    function switchRow(title, desc, key) {
      return h("div", { className: "dsh-bg-adv-row" },
        h("div", { className: "dsh-bg-adv-info" },
          h("div", { className: "dsh-bg-item-title" }, title),
          desc ? h("div", { className: "dsh-bg-item-desc" }, desc) : null),
        switchBtn(key)
      );
    }
    return h("div", { className: "dsh-bg-settings" },
      h("div", { className: "dsh-bg-card" },
        h("div", { className: "dsh-bg-sec-title" }, "性能档位"),
        h("div", { className: "dsh-bg-presets" }, presetButtons()),
        h("div", { className: "dsh-bg-preset-caption" }, modeName + " · " + modeCaption),
        h("div", { className: "dsh-bg-div" }),
        h("div", { className: "dsh-bg-meter-label" },
          h("span", null, "估算 GPU 负载"),
          h("span", { style: { color: meterColor, fontWeight: 600 } }, gpu + "%")),
        h("div", { className: "dsh-bg-meter" }, h("div", { style: { width: gpu + "%", background: meterColor } })),
        h("div", { className: "dsh-bg-meta" },
          "按 分辨率 × 帧率 × 模糊半径 估算，仅供参考；切换即时生效并自动保存。" +
          (snap.canvasW ? " 当前极光画布 " + snap.canvasW + "×" + snap.canvasH + "（×" + snap.auroraScale.toFixed(2) + "）" : "")),
        h("div", { className: "dsh-bg-div" }),
        h("div", { className: "dsh-bg-sec-title" }, "特效开关"),
        rows.map(rowEl)),
      h("details", { className: "dsh-bg-adv dsh-bg-card" },
        h("summary", null, "渲染质量（高级）"),
        sliderItem("极光分辨率", "降低画布内部分辨率可显著减轻 GPU 渲染与显存开销", "×" + snap.auroraScale.toFixed(2), 0.4, 1, 0.05, snap.auroraScale, "0.40× (节能)", "1.00× (高清)", function (v) { updateSetting("auroraScale", parseFloat(v)); }),
        selectItem("动画帧率上限", "鼠标交互期间自动提升至 60fps 保证操作跟手，停止 200ms 后回落", snap.fps, [
          { value: 20, label: "20 fps（最省）" },
          { value: 24, label: "24 fps（均衡）" },
          { value: 30, label: "30 fps（流畅）" },
          { value: 60, label: "60 fps（极致流畅）" }
        ], function (v) { updateSetting("fps", parseInt(v, 10)); }),
        selectItem("玻璃模糊强度", "侧边栏、对话气泡与代码块的背景模糊半径（数值越大磨砂越重、越小越轻透）", snap.blur, [
          { value: 6, label: "6 px（轻透磨砂 · 最省）" },
          { value: 8, label: "8 px（标准磨砂）" },
          { value: 10, label: "10 px（柔和毛玻璃）" },
          { value: 12, label: "12 px（深度毛玻璃）" }
        ], function (v) { updateSetting("blur", parseInt(v, 10)); }),
        sliderItem("跟手灵敏度", "鼠标跟随平滑时间常数（越小越贴手响应越快，越大越绵柔滞后）", snap.followMs + " ms", 5, 120, 5, snap.followMs, "5 ms (极速贴手)", "120 ms (绵柔)", function (v) { updateSetting("followMs", parseInt(v, 10)); }),
        sliderItem("光线跟随强度", "粒子鲸鱼与高光聚焦点随光标移动的响应幅度", Math.round(snap.lightFollow * 100) + "%", 0, 100, 5, Math.round(snap.lightFollow * 100), "0% (固定不动)", "100% (完全跟随)", function (v) { updateSetting("lightFollow", parseInt(v, 10) / 100); })),
      h("div", { className: "dsh-bg-foot" },
        h("button", { type: "button", className: "dsh-bg-reset", onClick: function () { resetSettings(); } }, "恢复默认"),
        h("span", { className: "dsh-bg-note" }, "v1.11.4 · 即时生效并自动保存")));
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

  shared.refs.setupSettingsUi = setupSettingsUi;
}


/* ===================== dom.js ===================== */
/* ------------------------------------------------------------------ *
 * src/dom.js — DOM 骨架（initDom）
 *   创建背景容器 / 极光画布 / 星座画布 / 鲸鱼层 / 诊断对象，填入 shared.dom；
 *   定义 applyThemeClass（全主题统一深色）。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initDom(shared) {
  var state = shared.state;
  var bgSettings = shared.settings;

/* ------------------------------------------------------------------ *
   * DOM 骨架
   * ------------------------------------------------------------------ */
  shared.dom.container = document.createElement("div");
  shared.dom.container.id = "dsh-ds-bg";
  shared.dom.container.dataset.version = "1.11.4"; // 部署版本标记：由 build.mjs 从 package.json 注入，页面可查 document.getElementById('dsh-ds-bg')?.dataset.version
  // 关键样式内联兜底：全主题统一深色背景
  // GPU 优化：不再常驻 will-change:opacity,filter——它会在入场动画结束后仍强制
  // 全屏容器保持独立合成层；合成器对运行中的动画本就会自动提升，观感不变
  shared.dom.container.style.cssText = "position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;" +
    "background:#0a0a0a;" +
    "animation:dsh-ds-enter 1.8s ease-out backwards;";
  var MASK = "linear-gradient(#000000fc 0%,#000000e8 8.98%,transparent 100%)";
  shared.dom.auroraCanvas = document.createElement("canvas");
  shared.dom.auroraCanvas.id = "dsh-ds-aurora";
  shared.dom.auroraCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;" +
    "mask:" + MASK + ";-webkit-mask:" + MASK + ";";
  shared.dom.constellationCanvas = document.createElement("canvas");
  shared.dom.constellationCanvas.id = "dsh-ds-constellation";
  shared.dom.constellationCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;background:transparent;" +
    "mask:" + MASK + ";-webkit-mask:" + MASK + ";";
  shared.dom.container.appendChild(shared.dom.auroraCanvas);
  // 鲸鱼层：全主题显示（原仅深色，现有需求浅色亦用深色主题）
  shared.dom.whaleLayer = document.createElement("div");
  shared.dom.whaleLayer.className = "dsh-ds-whale";
  shared.dom.whaleLayer.setAttribute("aria-hidden", "true");
  shared.dom.whaleLayer.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
    "pointer-events:none;mix-blend-mode:screen;z-index:2;";
  shared.dom.whaleCanvas = document.createElement("canvas");
  shared.dom.whaleCanvas.className = "dsh-ds-whale-canvas";
  shared.dom.whaleCanvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block;";
  shared.dom.whaleLayer.appendChild(shared.dom.whaleCanvas);
  shared.dom.container.appendChild(shared.dom.whaleLayer);
  shared.dom.container.appendChild(shared.dom.constellationCanvas);

  /* 诊断信息（?dshtest=1 时输出到页面面板） */
  shared.dom.diag = { theme: "?", bodyBg: "?", htmlBg: "?", containerPos: "?", containerZ: "?", containerBg: "?", frameFound: false, frameBg: "?", auroraGL: false, auroraProgs: "", whaleGL: false, whaleProgs: "", constellation: false, canvasW: 0, canvasH: 0 };

  function setDarkThemeMarkers() {
    // 幂等：仅在目标态未满足时才改写。监听方（themeObserver）观察的正是这些属性，
    // 无条件回写会形成「观察 → 改写 → 再观察」的无限变异死循环。
    try {
      if (!document.body.hasAttribute("data-ds-dark-theme")) document.body.setAttribute("data-ds-dark-theme", "");
      if (document.body.hasAttribute("data-ds-light-theme")) document.body.removeAttribute("data-ds-light-theme");
    } catch(e){}
    try {
      if (!document.documentElement.hasAttribute("data-ds-dark-theme")) document.documentElement.setAttribute("data-ds-dark-theme", "");
      if (document.documentElement.hasAttribute("data-ds-light-theme")) document.documentElement.removeAttribute("data-ds-light-theme");
    } catch(e){}
  }

  function applyThemeClass() {
    shared.dom.container.classList.add("dsh-ds-dark");
    shared.dom.container.style.setProperty("background", "#0a0a0a", "important");
    if (shared.refs.updateWhaleDisplay) shared.refs.updateWhaleDisplay();
    try { document.body.classList.toggle("dsh-bg-no-glass", !bgSettings.glass); } catch (e) {}
    if (document.body) {
      document.body.style.setProperty("background", "transparent", "important");
    }
    // 全主题统一深色，强制 body 保持深色语义（便于第三方样式以 dark 为准）
    setDarkThemeMarkers();
  }

  shared.refs.applyThemeClass = applyThemeClass;
  shared.refs.setDarkThemeMarkers = setDarkThemeMarkers;
}


/* ===================== coalesce.js ===================== */
/* ------------------------------------------------------------------ *
 * src/coalesce.js — 合批 MutationObserver（initCoalesce）
 *   单例 + rAF 合批，将 #root 全树突变分发给 shell/beam/orbs/todo；
 *   与主题观察器（observer.js）职责分离。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initCoalesce(shared) {
  var cbs = [];
  var scheduled = false;
  var mo = null;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    var raf = window.requestAnimationFrame || function(fn){ return setTimeout(fn, 16); };
    raf(function(){
      scheduled = false;
      var list = cbs.slice();
      for (var i=0;i<list.length;i++) { try{ list[i].fn(); }catch(e){} }
    });
  }
  function ensure() {
    if (mo) return;
    if (!window.MutationObserver) return;
    mo = new MutationObserver(function(){ schedule(); });
    var rootEl = document.querySelector("#root") || document.documentElement;
    try {
      mo.observe(rootEl, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-ds-dark-theme","data-ds-light-theme","data-theme","class","data-state","data-tool","data-status","aria-label","aria-expanded","data-testid","role","data-plan-mode","data-beam","data-active","data-pulse-active"]
      });
    } catch(e){}
    // 暴露给 diag/调试
    try{ shared.refs.coalescedObserver = mo; }catch(_){}
  }
  function subscribe(fn) {
    cbs.push({fn: fn});
    ensure();
    return function unsubscribe(){
      for (var i=0;i<cbs.length;i++) if (cbs[i].fn===fn) { cbs.splice(i,1); break; }
      if (cbs.length===0 && mo) { try{ mo.disconnect(); }catch(_){} mo=null; }
    };
  }
  shared.refs.subscribeCoalesced = subscribe;
  shared.refs.ensureCoalesced = ensure;
  shared.refs.scheduleCoalesced = schedule;
}


/* ===================== beam.js ===================== */
/* ------------------------------------------------------------------ *
 * src/beam.js — Border Beam 状态机与 composer/todo 集成（initBeam）
 *   含全部 beam 状态变量、attach/detach/watch 与调试句柄对象；
 *   CSS 生成（buildBeamCSS 等）在 src/beam-css.js（工厂级片段）。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initBeam(shared) {
  var state = shared.state;
  var bgSettings = shared.settings;

  /* ------------------------------------------------------------------ *
   * Border Beam — composer integration (D S H)
   * ------------------------------------------------------------------ */
  var beamStyleTag = null;
  var beamAttachedCard = null;
  var beamResizeObs = null;
  var beamMutObs = null;
  var beamCoalesceUnsub = null;
  var pendingExecuting = false;
  var pendingTimer = null;
  var beamPollTimer = null;
  var beamTypingHandler = null;
  var beamKeydownHandler = null;
  var typingActive = false;
  var typingTimer = null;
  var currentBeamMode = "hairline";
  // IME 组合输入锁：Enter 选词确认时 isComposing 可能已为 false，靠组合事件锁避免误判为发送
  var beamIsComposing = false;
  var beamComposingLockTimer = null;
  var pulseTimer = null;
  var beamState = { mode: "hairline", idleStrength: 0.65, focusStrength: 1.0, disabled: false };
  // 命名 handler 供 attach/update 共用，cleanup 可成对移除，避免匿名监听泄漏；解锁窗口 150ms（原 350ms 会吞选词后快速真实 Enter）
  var BEAM_COMPOSE_LOCK_MS = 150;
  var beamCompStart = function() {
    beamIsComposing = true;
    if (beamComposingLockTimer) { clearTimeout(beamComposingLockTimer); beamComposingLockTimer = null; }
    triggerTypingBreathe();
  };
  var beamCompUpdate = function() {
    beamIsComposing = true;
    triggerTypingBreathe();
  };
  var beamCompEnd = function() {
    triggerTypingBreathe();
    if (beamComposingLockTimer) clearTimeout(beamComposingLockTimer);
    beamComposingLockTimer = setTimeout(function(){ beamIsComposing = false; beamComposingLockTimer = null; }, BEAM_COMPOSE_LOCK_MS);
  };
  var beamCompKeyUp = function(e){
    if (e.keyCode === 229) {
      beamIsComposing = true;
      if (beamComposingLockTimer) clearTimeout(beamComposingLockTimer);
      beamComposingLockTimer = setTimeout(function(){ beamIsComposing = false; beamComposingLockTimer = null; }, BEAM_COMPOSE_LOCK_MS);
    }
  };

  function isBeamDisabled() {
    // 设置面板的 Beam 开关优先；URL/localStorage 逃生舱保留
    if (bgSettings && bgSettings.beam === false) return true;
    try {
      if (typeof location !== "undefined" && (location.search.indexOf("beam=0") !== -1 || location.search.indexOf("nobeam") !== -1 || location.search.indexOf("beam=false") !== -1)) return true;
      if (typeof localStorage !== "undefined" && localStorage.getItem("dsh-beam-disabled") === "1") return true;
    } catch(e) {}
    return false;
  }
  function getBeamThemeIsDark() { return true; } // 全主题统一深色
  function getBeamIdleStrength() { if (beamState && typeof beamState.idleStrength === "number") return beamState.idleStrength; return getBeamThemeIsDark() ? 0.65 : 0.5; }
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
      if (stopBtn && !stopBtn.disabled && stopBtn.offsetParent !== null) return true;
      var runningEl = document.querySelector('[data-state="running"]');
      if (runningEl && runningEl.offsetParent !== null) {
        if (runningEl.classList && (runningEl.classList.contains("dsh-thinking-orb-wrap") || runningEl.classList.contains("dsh-turn-status-text") || runningEl.classList.contains("dsh-thinking-orb-canvas"))) {
        } else {
          return true;
        }
      }
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
            boundInput.removeEventListener("compositionstart", beamCompStart);
            boundInput.removeEventListener("compositionupdate", beamCompUpdate);
            boundInput.removeEventListener("compositionend", beamCompEnd);
            boundInput.removeEventListener("keyup", beamCompKeyUp);
          } catch(e) {}
        }
        if (beamTypingHandler && beamKeydownHandler) {
          try {
            freshInput.addEventListener("input", beamTypingHandler);
            freshInput.addEventListener("change", beamTypingHandler);
            freshInput.addEventListener("keydown", beamKeydownHandler);
            freshInput.addEventListener("compositionstart", beamCompStart);
            freshInput.addEventListener("compositionupdate", beamCompUpdate);
            freshInput.addEventListener("compositionend", beamCompEnd);
            freshInput.addEventListener("keyup", beamCompKeyUp);
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
      try { if (shared.refs.syncThinkingOrb) shared.refs.syncThinkingOrb(); } catch(e) {}
      return;
    }

    if (currentBeamMode === "pulse" && next === "pulse") {
      try { if (shared.refs.syncThinkingOrb) shared.refs.syncThinkingOrb(); } catch(e) {}
      return;
    }

    if (currentBeamMode !== next) {
      applyBeamMode(next);
    }
    try { if (shared.refs.syncThinkingOrb) shared.refs.syncThinkingOrb(); } catch(e) {}
  }

  function ensureBeamMutObs() {
    if (beamMutObs || beamCoalesceUnsub) return;
    if (shared.refs.subscribeCoalesced) {
      try {
        beamCoalesceUnsub = shared.refs.subscribeCoalesced(function() {
          if (!beamAttachedCard || !document.contains(beamAttachedCard)) {
            try { attachComposerBeam(); } catch(e) {}
          } else {
            try { updateBeamState(); } catch(e) {}
          }
        });
        return;
      } catch(e){}
    }
    if (!window.MutationObserver) return;
    beamMutObs = new MutationObserver(function() {
      if (!beamAttachedCard || !document.contains(beamAttachedCard)) {
        try { attachComposerBeam(); } catch(e) {}
      } else {
        try { updateBeamState(); } catch(e) {}
      }
    });
    var rootEl = document.querySelector("#root") || document.documentElement;
    try { beamMutObs.observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label", "class", "data-plan-mode", "data-state", "data-status"] }); } catch(e) {}
  }
  function detachBeamMutObs() {
    if (beamCoalesceUnsub) { try { beamCoalesceUnsub(); } catch(e) {} beamCoalesceUnsub = null; return; }
    if (beamMutObs) { try { beamMutObs.disconnect(); } catch(e) {} beamMutObs = null; }
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
        // 输入法组合中：优先以浏览器原生 isComposing / keyCode 229 为准，beamIsComposing 仅兜底非 Enter 按键，避免 150ms 锁吞选词后真实 Enter
        if (e.isComposing || e.keyCode === 229) {
          triggerTypingBreathe();
          return;
        }
        if (beamIsComposing) {
          if (e.key !== "Enter") {
            triggerTypingBreathe();
            return;
          }
          // Enter 且处于锁窗口但浏览器已判定非 composing：视为真实发送，透传至下方发送逻辑
        }
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
          // @/slash 联想菜单打开时：回车是选中候选（文件/命令/技能），不应进入彩色执行态，只触发白色呼吸
          var _menuOpen = false;
          try {
            var _lb = document.querySelector('[role="listbox"]');
            if (_lb && _lb.offsetParent !== null) _menuOpen = true;
            if (!_menuOpen) {
              var _m = document.querySelector('._3e4SsG_menu');
              if (_m && _m.offsetParent !== null) _menuOpen = true;
            }
            if (!_menuOpen) {
              var _ad = document.querySelector('[aria-activedescendant]');
              if (_ad) {
                var _aid = _ad.getAttribute('aria-activedescendant');
                if (_aid && document.getElementById(_aid) && document.getElementById(_aid).offsetParent !== null) _menuOpen = true;
              }
            }
          } catch (_e) {}
          if (_menuOpen) {
            triggerTypingBreathe();
            return;
          }
          var val = input.value !== undefined ? input.value : input.textContent;
          if (val && String(val).trim().length > 0) {
            // 回车发送：设置短时 pending（1.4s），桥接 DOM 尚未挂载 running 状态的空档，
            // 让 Thinking Orbs 与 Border Beam 立即进入执行态，避免工具间隙误判为空闲
            pendingExecuting = true;
            if (pendingTimer) clearTimeout(pendingTimer);
            pendingTimer = setTimeout(function(){ pendingExecuting = false; try{ updateBeamState(); }catch(e){} }, 1400);
            try { if (shared.refs.syncThinkingOrb) shared.refs.syncThinkingOrb(); } catch(e) {}
            setTimeout(function(){ try{ updateBeamState(); }catch(e){} }, 60);
            setTimeout(function(){ try{ updateBeamState(); }catch(e){} }, 180);
            if (!typingActive) triggerTypingBreathe();
            return;
          } else {
            triggerTypingBreathe();
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
      input.addEventListener("compositionstart", beamCompStart);
      input.addEventListener("compositionupdate", beamCompUpdate);
      input.addEventListener("compositionend", beamCompEnd);
      input.addEventListener("keyup", beamCompKeyUp);
      card._dshBeamInput = input;
    }

    var sendBtn = card.querySelector('button[aria-label="Send message"], button[aria-label="发送消息"], button[aria-label*="Send"], button[aria-label*="发送"], .uV2eYG_primary');
    if (sendBtn) {
      var sendHandler = function() {
        typingActive = false;
        if (typingTimer) clearTimeout(typingTimer);
        pendingExecuting = true;
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(function() { pendingExecuting = false; updateBeamState(); }, 2000);
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
    beamPollTimer = setInterval(updateBeamState, 450);

    ensureBeamMutObs();

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
          input.removeEventListener("compositionstart", beamCompStart);
          input.removeEventListener("compositionupdate", beamCompUpdate);
          input.removeEventListener("compositionend", beamCompEnd);
          input.removeEventListener("keyup", beamCompKeyUp);
        } catch(e) {}
      }
      if (card._dshBeamSendBtn && card._dshBeamSendHandler) {
        try { card._dshBeamSendBtn.removeEventListener("click", card._dshBeamSendHandler); } catch(e) {}
      }
      if (beamPollTimer) { clearInterval(beamPollTimer); beamPollTimer = null; }
      try { detachBeamMutObs(); } catch(e) {}
      if (beamResizeObs) { try { beamResizeObs.disconnect(); beamResizeObs = null; } catch(e) {} }
      if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
      if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
      if (beamComposingLockTimer) { clearTimeout(beamComposingLockTimer); beamComposingLockTimer = null; }
      beamIsComposing = false;
      try { if (shared.refs.stopThinkingOrb) shared.refs.stopThinkingOrb(); } catch(e) {}
    };
  }

  function detachComposerBeam() {
    var card = beamAttachedCard;
    if (!card) return;
    try { if (card._dshBeamCleanup) card._dshBeamCleanup(); } catch(e) {}
    try { if (shared.refs.stopThinkingOrb) shared.refs.stopThinkingOrb(); } catch(e) {}
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
    // 清理挂在 DOM 节点上的自定义属性，防止 React 节点复用池携带旧闭包
    try { delete card._dshBeamCleanup; } catch(e) {}
    try { delete card._dshBeamInput; } catch(e) {}
    try { delete card._dshBeamSendBtn; } catch(e) {}
    try { delete card._dshBeamSendHandler; } catch(e) {}
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
    ensureBeamMutObs();
  }

  /* ------------------------------------------------------------------ *
   * Border Beam — Todo List Panel integration
   * ------------------------------------------------------------------ */
  var todoAttachedPanel = null;
  var todoPollTimer = null;
  var todoMutObs = null;
  var todoCoalesceUnsub = null;

  function findTodoPanel() {
    var panel = document.querySelector('[data-testid="todo-panel"], .lXshSW_root, [data-slot="conversation.input.dock"] [data-testid="todo-panel"], [data-slot="conversation.input.dock"] .lXshSW_root');
    if (panel) return panel;
    var dockSections = document.querySelectorAll('[data-slot="conversation.input.dock"] section, [data-slot="conversation.input.dock"] > div > section');
    for (var i = 0; i < dockSections.length; i++) {
      var s = dockSections[i];
      if (s.querySelector('.lXshSW_body, .lXshSW_header, [data-testid="todo-panel"], [aria-label*="待办"], [aria-label*="Todo"], [aria-label*="todo"]')) {
        return s;
      }
    }
    return null;
  }

  function isTodoActive(panel) {
    if (!panel) return false;
    if (panel.querySelector('[data-status="in_progress"]')) return true;
    if (panel.querySelector('.lXshSW_glyphProgress, [class*="glyphProgress"]')) return true;
    var progressEl = panel.querySelector('.lXshSW_progress, [class*="progress"]');
    if (progressEl && progressEl.textContent) {
      var ptxt = progressEl.textContent.toLowerCase();
      if (ptxt.indexOf('进行中') !== -1 || ptxt.indexOf('in progress') !== -1 || ptxt.indexOf('active') !== -1) {
        return true;
      }
    }
    if (isExecuting()) return true;
    return false;
  }

  function cleanupTodoPanelDom(panel) {
    if (!panel) return;
    try {
      panel.removeAttribute("data-beam");
      panel.removeAttribute("data-active");
      panel.removeAttribute("data-pulse-active");
      var bloom = panel.querySelector("[data-beam-bloom]");
      if (bloom) bloom.remove();
    } catch(e) {}
  }

  function updateTodoBeamState() {
    if (isBeamDisabled() || !bgSettings.beam) {
      if (todoAttachedPanel) {
        cleanupTodoPanelDom(todoAttachedPanel);
        todoAttachedPanel = null;
      }
      return;
    }
    var panel = findTodoPanel();
    if (!panel || !document.contains(panel)) {
      if (todoAttachedPanel) {
        cleanupTodoPanelDom(todoAttachedPanel);
        todoAttachedPanel = null;
      }
      return;
    }
    if (panel !== todoAttachedPanel || panel.getAttribute("data-beam") !== "dsh-todo" || !panel.querySelector("[data-beam-bloom]")) {
      attachTodoBeam(panel);
      return;
    }
    var hasActiveTask = isTodoActive(panel);
    if (hasActiveTask) {
      if (!panel.hasAttribute("data-pulse-active")) panel.setAttribute("data-pulse-active", "");
      if (!panel.hasAttribute("data-active")) panel.setAttribute("data-active", "");
    } else {
      if (panel.hasAttribute("data-pulse-active")) panel.removeAttribute("data-pulse-active");
      if (panel.hasAttribute("data-active")) panel.removeAttribute("data-active");
    }
  }

  function attachTodoBeam(panel) {
    if (!panel) panel = findTodoPanel();
    if (!panel) return;
    if (isBeamDisabled() || !bgSettings.beam) return;
    if (todoAttachedPanel && todoAttachedPanel !== panel) {
      cleanupTodoPanelDom(todoAttachedPanel);
    }
    todoAttachedPanel = panel;
    if (panel.getAttribute("data-beam") !== "dsh-todo") {
      panel.setAttribute("data-beam", "dsh-todo");
    }
    if (!panel.querySelector("[data-beam-bloom]")) {
      var bloom = document.createElement("div");
      bloom.setAttribute("data-beam-bloom", "");
      bloom.setAttribute("aria-hidden", "true");
      panel.appendChild(bloom);
    }
    var hasActiveTask = isTodoActive(panel);
    if (hasActiveTask) {
      panel.setAttribute("data-pulse-active", "");
      panel.setAttribute("data-active", "");
    } else {
      panel.removeAttribute("data-pulse-active");
      panel.removeAttribute("data-active");
    }
  }

  function ensureTodoMutObs() {
    if (todoMutObs || todoCoalesceUnsub) return;
    if (shared.refs.subscribeCoalesced) {
      try {
        todoCoalesceUnsub = shared.refs.subscribeCoalesced(function() {
          try {
            var panel = findTodoPanel();
            if (!todoAttachedPanel || !document.contains(todoAttachedPanel) || (panel && panel !== todoAttachedPanel) || (panel && panel.getAttribute("data-beam") !== "dsh-todo")) {
              if (panel) attachTodoBeam(panel);
              else updateTodoBeamState();
            } else {
              updateTodoBeamState();
            }
          } catch(e) {}
        });
        return;
      } catch(e) {}
    }
    if (!window.MutationObserver) return;
    todoMutObs = new MutationObserver(function() {
      try {
        var panel = findTodoPanel();
        if (!todoAttachedPanel || !document.contains(todoAttachedPanel) || (panel && panel !== todoAttachedPanel) || (panel && panel.getAttribute("data-beam") !== "dsh-todo")) {
          if (panel) attachTodoBeam(panel);
          else updateTodoBeamState();
        } else {
          updateTodoBeamState();
        }
      } catch(e) {}
    });
    var rootEl = document.querySelector("#root") || document.documentElement;
    try {
      todoMutObs.observe(rootEl, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-status", "class", "aria-expanded", "data-state", "data-testid", "aria-label", "data-beam"]
      });
    } catch(e) {}
  }

  function detachTodoMutObs() {
    if (todoCoalesceUnsub) { try { todoCoalesceUnsub(); } catch(e) {} todoCoalesceUnsub = null; return; }
    if (todoMutObs) { try { todoMutObs.disconnect(); } catch(e) {} todoMutObs = null; }
  }

  function detachTodoBeam() {
    var panel = todoAttachedPanel || findTodoPanel();
    if (panel) cleanupTodoPanelDom(panel);
    if (todoPollTimer) { clearInterval(todoPollTimer); todoPollTimer = null; }
    detachTodoMutObs();
    todoAttachedPanel = null;
  }

  function watchBeamTodo() {
    if (isBeamDisabled() || !bgSettings.beam) { detachTodoBeam(); return; }
    attachTodoBeam();
    ensureTodoMutObs();
    if (!todoPollTimer) {
      todoPollTimer = setInterval(updateTodoBeamState, 450);
    }
  }

  shared.refs.isExecuting = isExecuting;
  shared.refs.isPlanMode = isPlanMode;
  shared.refs.getBeamThemeIsDark = getBeamThemeIsDark;
  shared.refs.watchBeamComposer = watchBeamComposer;
  shared.refs.watchBeamTodo = watchBeamTodo;
  shared.refs.detachComposerBeam = detachComposerBeam;
  shared.refs.detachTodoBeam = detachTodoBeam;
  shared.refs.refreshBeamTheme = refreshBeamTheme;
  shared.refs.getBeamAttachedCard = function () { return beamAttachedCard; };
  shared.refs.beamHandle = {
    attach: attachComposerBeam,
    detach: detachComposerBeam,
    attachTodo: attachTodoBeam,
    detachTodo: detachTodoBeam,
    updateTodo: updateTodoBeamState,
    get todoPanel() { return todoAttachedPanel; },
    setStrength: function(v) { setBeamStrength(v, { persist: false }); },
    setIdleStrength: function(v) { beamState.idleStrength = Math.max(0, Math.min(1, v)); if (beamAttachedCard) beamAttachedCard.style.setProperty("--beam-strength", String(beamState.idleStrength)); refreshBeamTheme(); },
    setFocusStrength: function(v) { beamState.focusStrength = Math.max(0, Math.min(1, v)); if (beamAttachedCard) beamAttachedCard.style.setProperty("--beam-strength", String(beamState.focusStrength)); refreshBeamTheme(); },
    disable: function() { try { localStorage.setItem("dsh-beam-disabled", "1"); } catch(e) {} detachComposerBeam(); detachTodoBeam(); },
    enable: function() { try { localStorage.removeItem("dsh-beam-disabled"); } catch(e) {} watchBeamComposer(); watchBeamTodo(); },
    refresh: function() { refreshBeamTheme(); updateTodoBeamState(); },
    get state() { return currentBeamMode; },
    get isExecuting() { return isExecuting(); },
    get isTyping() { return isTyping(); },
    update: updateBeamState,
    get id() { return BEAM_ID; },
    get card() { return beamAttachedCard; }
  };
}


/* ===================== orbs.js ===================== */
/* ------------------------------------------------------------------ *
 * src/orbs.js — Thinking Orbs 运行时（initOrbs）
 *   工具调用状态映射、DOM 扫描、Orb 画布启动/停止与状态栏文字联动；
 *   几何数学（getOrbPreset 等）在 src/orbs-math.js（工厂级片段）。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initOrbs(shared) {
  var bgSettings = shared.settings;

  var TOOL_STATE_MAP = {
    // 1. Searching (globe 经纬扫描网格球)
    "grep": { state: "searching", text: "Searching files…" },
    "glob": { state: "searching", text: "Finding files…" },
    "web_search": { state: "searching", text: "Searching web…" },
    "find_dsh_plugin": { state: "searching", text: "Searching plugins…" },
    "lsp_symbols": { state: "searching", text: "Finding symbols…" },

    // 2. Listening / Inspecting (wave 声波起伏球)
    "read": { state: "listening", text: "Reading file…" },
    "read_image": { state: "listening", text: "Inspecting image…" },
    "skill": { state: "listening", text: "Loading skill…" },
    "get_goal": { state: "listening", text: "Reading goal…" },
    "web_fetch": { state: "listening", text: "Fetching web page…" },
    "lsp_diagnostics": { state: "listening", text: "Diagnosing code…" },
    "lsp_completion": { state: "listening", text: "Getting completions…" },
    "lsp_signature": { state: "listening", text: "Inspecting signature…" },
    "lsp_inlay_hints": { state: "listening", text: "Reading inlay hints…" },

    // 3. Composing / Writing (ribbon 扭转流光缎带)
    "write": { state: "composing", text: "Writing file…" },
    "edit": { state: "composing", text: "Editing file…" },
    "lsp_format": { state: "composing", text: "Formatting file…" },
    "lsp_rename": { state: "composing", text: "Renaming symbol…" },
    "lsp_code_action": { state: "composing", text: "Applying code action…" },

    // 4. Solving / Commands (rubik 旋转魔方立方矩阵)
    "bash": { state: "solving", text: "Running command…" },
    "run_code": { state: "solving", text: "Running code…" },

    // 5. Connecting / Subagents (web 动态网络拓扑 / 神经节点)
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

    // 6. Shaping / Tasks & Goals (morph 几何变形多面体)
    "todo_write": { state: "shaping", text: "Updating tasks…" },
    "create_goal": { state: "shaping", text: "Creating goal…" },
    "update_goal": { state: "shaping", text: "Updating goal…" },
    "exit_plan_mode": { state: "shaping", text: "Finalizing plan…" },

    // 7. Weaving / Cordis plugins (braid 编织双螺旋)
    "cordis_define": { state: "weaving", text: "Weaving plugin…" },
    "cordis_run": { state: "weaving", text: "Activating plugin…" },
    "cordis_stop": { state: "weaving", text: "Stopping plugin…" },
    "cordis_undefine": { state: "weaving", text: "Removing plugin…" },
    "cordis_inspect_list": { state: "weaving", text: "Inspecting runtime…" },
    "cordis_inspect_query": { state: "weaving", text: "Querying runtime…" },
    "cordis_inspect_self": { state: "weaving", text: "Inspecting plugin…" },

    // 8. Breathing / Interactive questions (ring 光晕呼吸环)
    "ask_user_question": { state: "breathing", text: "Asking question…" }
  };

  function truncateStr(str, maxLen) {
    if (!str || typeof str !== "string") return "";
    str = str.trim();
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1) + "…";
  }

  function extractSummaryDetail(el, toolName) {
    try {
      if (!el) return null;
      // 1. 文件链接类（read, write, edit, lsp_*）
      var fileBtn = el.querySelector('button[class*="fileLink"], .o3BgMG_fileLink, [data-file-link]');
      if (fileBtn && fileBtn.textContent) {
        var rawPath = fileBtn.textContent.trim();
        var fn = rawPath.split(/[/\\]/).pop() || rawPath;
        if (fn) {
          var shortFn = truncateStr(fn, 26);
          if (toolName === "read") return "Reading " + shortFn;
          if (toolName === "write") return "Writing " + shortFn;
          if (toolName === "edit") return "Editing " + shortFn;
          if (toolName.indexOf("lsp_") === 0) return "LSP: " + shortFn;
          return toolName + ": " + shortFn;
        }
      }

      // 2. 通用摘要类（grep, glob, bash, skill, web_search, subagent, etc.）
      var sumEl = el.querySelector('[class*="summary"]:not([class*="error"]), .o3BgMG_summary, .CY-8Ka_summary, .iWrAna_summary, ._Xvjua_summary, [class*="title"]');
      if (sumEl && sumEl.textContent) {
        var txt = sumEl.textContent.trim();
        if (txt.length > 0) {
          if (toolName === "grep") return "Searching: " + truncateStr(txt, 26);
          if (toolName === "glob") return "Finding: " + truncateStr(txt, 26);
          if (toolName === "bash") {
            var cmd = txt.replace(/^bash\s*(-c\s*)?/i, "").replace(/^["']|["']$/g, "");
            return "Running: " + truncateStr(cmd, 26);
          }
          if (toolName === "run_code") return "Running: " + truncateStr(txt, 26);
          if (toolName === "skill") return "Skill: " + truncateStr(txt, 26);
          if (toolName === "web_search") return "Web: " + truncateStr(txt, 26);
          if (toolName === "web_fetch") return "Fetching: " + truncateStr(txt, 26);
          if (toolName === "find_dsh_plugin") return "Plugin: " + truncateStr(txt, 26);
          if (toolName === "subagent" || toolName === "subagent_fork") return "Subagent: " + truncateStr(txt, 24);
          if (toolName === "workflow") return "Workflow: " + truncateStr(txt, 24);
          if (toolName === "ralph") return "Ralph: " + truncateStr(txt, 24);
          if (toolName === "todo_write") return "Tasks: " + truncateStr(txt, 24);
          if (toolName.indexOf("cordis_") === 0) return "Plugin: " + truncateStr(txt, 24);
          if (toolName.indexOf("lsp_") === 0) return "LSP: " + truncateStr(txt, 24);
          if (toolName.indexOf("browser_") === 0) return "Browser: " + truncateStr(txt, 24);
          return truncateStr(txt, 28);
        }
      }
    } catch(e) {}
    return null;
  }

  // —— 新调度：最小可视时长 + 等待态 + 队列，避免快工具被跳过 —— //
  var lastActiveToolRecord = {
    state: null,
    text: null,
    tool: null,
    timestamp: 0
  };
  var MIN_TOOL_DWELL_MS = 600;
  var WAITING_GRACE_MS = 300;
  var WAITING_TEXT = "Waiting…";
  var displayInfo = null;
  var displaySince = 0;
  var toolQueue = [];

  function rawDetect() {
    try {
      // Tier 1: 优先检测当前处于 running 状态的工具调用行 / 命令 / 子分派
      var runningRows = document.querySelectorAll('[data-tool][data-state="running"], [data-sample="bash"][data-state="running"], [data-subcalls] [data-tool][data-state="running"], .CY-8Ka_root[data-state="running"], .o3BgMG_root[data-state="running"], .iWrAna_card[data-state="running"], ._Xvjua_root[data-state="running"], .ztWv_q_subCalls [data-tool][data-state="running"]');
      if (runningRows && runningRows.length > 0) {
        for (var i = runningRows.length - 1; i >= 0; i--) {
          var row = runningRows[i];
          if (row.classList && (row.classList.contains("Md3f7G_turnStatus") || row.classList.contains("dsh-turn-status-text"))) continue;
          var tool = row.getAttribute("data-tool");
          if (!tool && (row.classList.contains("CY-8Ka_root") || row.closest(".CY-8Ka_card") || row.getAttribute("data-sample") === "bash")) {
            tool = "bash";
          }
          if (!tool && (row.classList.contains("iWrAna_card") || row.closest(".iWrAna_card"))) {
            tool = "skill";
          }
          if (!tool) {
            var parent = row.closest("[data-tool]");
            if (parent) tool = parent.getAttribute("data-tool");
          }
          if (tool === "run_code") {
            var subCallRunning = row.querySelector('[data-subcalls] [data-tool][data-state="running"], .ztWv_q_subCalls [data-tool][data-state="running"]');
            if (subCallRunning) {
              var subTool = subCallRunning.getAttribute("data-tool");
              if (subTool) {
                row = subCallRunning;
                tool = subTool;
              }
            }
          }
          if (tool) {
            var mapped = TOOL_STATE_MAP[tool];
            var stateKey = mapped ? mapped.state : (
              tool.indexOf("cordis_") === 0 ? "weaving" :
              tool.indexOf("subagent") === 0 ? "connecting" :
              tool.indexOf("lsp_") === 0 ? "listening" :
              tool.indexOf("browser_") === 0 ? "solving" :
              tool.indexOf("read") === 0 ? "listening" : "composing"
            );
            var defaultTxt = mapped ? mapped.text : (tool + "…");
            var customDetail = extractSummaryDetail(row, tool);
            var resolvedText = customDetail || defaultTxt;
            return {
              state: stateKey,
              text: resolvedText,
              tool: tool
            };
          }
        }
      }

      // Tier 2: 活跃的思考/推理流 (Reasoning Stream) — 纯 Thinking，不拼接具体摘要
      var reasoningEl = document.querySelector('[data-variant="think"][data-state="running"], .QWLzlG_root[data-state="running"]');
      if (reasoningEl && reasoningEl.offsetParent !== null) {
        var thinkText = "Thinking…";
        return { state: "composing", text: thinkText, tool: "reasoning" };
      }

      // Tier 3: 用户提问与计划待审交互卡片
      var questionEl = document.querySelector('[data-slot="user-questions"], .Mbwy4a_card, [class*="QuestionComposer"]');
      if (questionEl && questionEl.offsetParent !== null) {
        return { state: "breathing", text: "Asking question…", tool: "ask_user_question" };
      }
      var planReviewEl = document.querySelector('[data-slot="plan-review"], .LVzXQa_card, [class*="PlanReviewPanel"]');
      if (planReviewEl && planReviewEl.offsetParent !== null) {
        return { state: "shaping", text: "Reviewing plan…", tool: "exit_plan_mode" };
      }

      // Tier 5: 活跃 Todo 项追踪（仅 executing 时）
      var executing = shared.refs.isExecuting ? shared.refs.isExecuting() : false;
      if (executing) {
        var activeTodoEl = document.querySelector('[data-testid="todo-panel"] [data-status="in_progress"], [data-slot="conversation.input.dock"] [data-status="in_progress"], [data-slot="plan"] [data-status="in_progress"], [class*="todo"] [data-status="in_progress"]');
        if (activeTodoEl && activeTodoEl.textContent) {
          var todoContent = activeTodoEl.textContent.trim();
          if (todoContent.length > 0) {
            return { state: "shaping", text: "Task: " + truncateStr(todoContent, 24), tool: "todo_write" };
          }
        }
      }
    } catch(e) {}
    return null;
  }

  function resolveActiveToolState() {
    try {
      var executing = shared.refs.isExecuting ? shared.refs.isExecuting() : false;
      var now = Date.now();
      var candidate = rawDetect();

      if (candidate) {
        lastActiveToolRecord.state = candidate.state;
        lastActiveToolRecord.text = candidate.text;
        lastActiveToolRecord.tool = candidate.tool;
        lastActiveToolRecord.timestamp = now;

        if (!displayInfo) {
          displayInfo = candidate;
          displaySince = now;
          return candidate;
        }
        if (displayInfo.tool === candidate.tool && displayInfo.text === candidate.text && displayInfo.state === candidate.state) {
          displayInfo = candidate;
          return candidate;
        }
        if (now - displaySince < MIN_TOOL_DWELL_MS) {
          var alreadyQueued = false;
          for (var qi = 0; qi < toolQueue.length; qi++) {
            if (toolQueue[qi].tool === candidate.tool && toolQueue[qi].text === candidate.text) { alreadyQueued = true; break; }
          }
          if (!alreadyQueued) {
            if (toolQueue.length < 8) toolQueue.push(candidate);
            else toolQueue[toolQueue.length - 1] = candidate;
          } else {
            for (var qj = 0; qj < toolQueue.length; qj++) if (toolQueue[qj].tool === candidate.tool) toolQueue[qj] = candidate;
          }
          return displayInfo;
        } else {
          displayInfo = candidate;
          displaySince = now;
          return candidate;
        }
      }

      // 无候选：优先消化队列（保证快工具至少露面一次）
      if (toolQueue.length > 0) {
        if (!displayInfo || now - displaySince >= MIN_TOOL_DWELL_MS) {
          var next = toolQueue.shift();
          displayInfo = next;
          displaySince = now;
          lastActiveToolRecord.state = next.state;
          lastActiveToolRecord.text = next.text;
          lastActiveToolRecord.tool = next.tool;
          lastActiveToolRecord.timestamp = now;
          return next;
        } else {
          return displayInfo;
        }
      }

      // 若当前展示仍在最小可视期内，保持
      if (displayInfo && now - displaySince < MIN_TOOL_DWELL_MS) {
        if (!executing && displayInfo.tool === "waiting") {
          // 等待态在空闲时应更快消失
        } else {
          return displayInfo;
        }
      }

      if (!executing) {
        if (displayInfo && now - displaySince < MIN_TOOL_DWELL_MS) {
          return displayInfo;
        }
        // 非执行态：清空队列与展示，返回 idle 兜底（syncThinkingOrb 会隐藏小球，此返回值不会长期可见）
        if (displayInfo) {
          // 保留最后一次的 dwell 后再清空
          if (now - displaySince >= MIN_TOOL_DWELL_MS) {
            displayInfo = null;
            displaySince = 0;
            toolQueue = [];
          } else {
            return displayInfo;
          }
        }
        if (shared.refs.isPlanMode && shared.refs.isPlanMode()) {
          var planIdle = { state: "composing", text: "Planning…", tool: "plan" };
          displayInfo = planIdle;
          displaySince = now;
          return planIdle;
        }
        // 空闲态不再误显示 Thinking，返回 idle 标记（由 syncThinkingOrb 隐藏）
        var idleInfo = { state: "composing", text: "Thinking…", tool: "idle" };
        return idleInfo;
      }

      // executing === true 但无候选：工具间隙或 LLM 思考间隙
      // 区分：刚执行完工具后的短暂空隙应显示 Waiting，而非 Thinking，避免“不在思考却显示思考”
      var age = lastActiveToolRecord.timestamp ? (now - lastActiveToolRecord.timestamp) : 99999;
      var isRecentTool = lastActiveToolRecord.tool && lastActiveToolRecord.tool !== "reasoning" && lastActiveToolRecord.tool !== "ask_user_question" && lastActiveToolRecord.tool !== "plan" && lastActiveToolRecord.tool !== "idle" && lastActiveToolRecord.tool !== "waiting" && lastActiveToolRecord.tool !== "thinking";

      if (isRecentTool && age > WAITING_GRACE_MS && age < 1200) {
        var waitingInfo = { state: "working", text: WAITING_TEXT, tool: "waiting" };
        if (!displayInfo || displayInfo.tool !== "waiting") {
          if (displayInfo && now - displaySince < MIN_TOOL_DWELL_MS) return displayInfo;
          displayInfo = waitingInfo;
          displaySince = now;
        }
        return waitingInfo;
      }

      // 真正的 LLM 思考或 Plan 模式
      if (shared.refs.isPlanMode && shared.refs.isPlanMode()) {
        var planInfo2 = { state: "composing", text: "Planning…", tool: "plan" };
        if (!displayInfo || displayInfo.tool !== "plan") {
          if (displayInfo && now - displaySince < MIN_TOOL_DWELL_MS) return displayInfo;
          displayInfo = planInfo2;
          displaySince = now;
        }
        return planInfo2;
      }
      var thinkInfo = { state: "composing", text: "Thinking…", tool: "thinking" };
      if (!displayInfo || displayInfo.tool !== "thinking") {
        if (displayInfo && now - displaySince < MIN_TOOL_DWELL_MS) return displayInfo;
        displayInfo = thinkInfo;
        displaySince = now;
      }
      return thinkInfo;
    } catch(e) {
      return { state: "composing", text: "Thinking…", tool: "fallback" };
    }
  }

  var orbCanvas = null;
  var orbCtx = null;
  var orbRaf = 0;
  var orbMountedStatusEl = null;
  var orbActive = false;
  var orbCurrentState = "composing";
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
          var clockEl = statusEl.querySelector(".Md3f7G_turnStatusClock, [class*='turnStatusClock']");
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
    var orbLastScan = 0;
    var orbLastInfo = null;

    function renderOrb(now) {
      if (!orbActive || !orbCtx || !orbMountedStatusEl || !document.contains(orbMountedStatusEl)) {
        stopThinkingOrb();
        return;
      }
      orbRaf = requestAnimationFrame(renderOrb);

      if (document.visibilityState === "hidden") return;

      if (now - orbLastScan >= 50 || !orbLastInfo) {
        orbLastScan = now;
        orbLastInfo = resolveActiveToolState();
      }
      var activeInfo = orbLastInfo;
      orbCurrentState = activeInfo.state;

      var isPlan = (shared.refs.isPlanMode && shared.refs.isPlanMode()) || activeInfo.tool === "plan" || (activeInfo.state === "breathing" && shared.refs.isPlanMode && shared.refs.isPlanMode());
      if (orb.wrap) {
        if (orb.wrap.getAttribute("data-state") !== activeInfo.state) {
          orb.wrap.setAttribute("data-state", activeInfo.state);
        }
        if (isPlan) {
          orb.wrap.setAttribute("data-planning", "true");
        } else {
          orb.wrap.removeAttribute("data-planning");
        }
        if (activeInfo.tool === "waiting") {
          orb.wrap.setAttribute("data-waiting", "true");
        } else {
          orb.wrap.removeAttribute("data-waiting");
        }
      }

      syncTurnStatusText(orbMountedStatusEl, activeInfo.text);

      var size = 20;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var preset = getOrbPreset(activeInfo.state, 20);
      var renderFn = cp[preset.mode] || cp.orbits;

      var elapsed = (now - orbStartTime) * 0.001 * preset.speed;
      if (activeInfo.tool === "waiting") elapsed *= 0.62;
      var res = renderFn(size, elapsed, preset.opts);

      var isDark = shared.refs.getBeamThemeIsDark ? shared.refs.getBeamThemeIsDark() : false;
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
      if (orbMutObs || orbPollTimer) { try { detachThinkingOrbs(); } catch(e) {} }
      return;
    }
    var statusEl = document.querySelector(".Md3f7G_turnStatus, [role=\"status\"][aria-live=\"polite\"]");
    var executing = shared.refs.isExecuting ? shared.refs.isExecuting() : false;
    if (statusEl && executing) {
      startThinkingOrb(statusEl);
    } else {
      if (orbActive) stopThinkingOrb();
      if (!executing) {
        // 空闲时清空队列与展示，避免下次执行时残留旧状态
        toolQueue = [];
        if (displayInfo && displayInfo.tool === "waiting") {
          displayInfo = null;
          displaySince = 0;
        }
      }
    }
  }

  var orbMutObs = null;
  var orbCoalesceUnsub = null;
  var orbPollTimer = null;
  function detachThinkingOrbs() {
    if (orbPollTimer) { try { clearInterval(orbPollTimer); } catch(e) {} orbPollTimer = null; }
    if (orbCoalesceUnsub) { try { orbCoalesceUnsub(); } catch(e) {} orbCoalesceUnsub = null; }
    if (orbMutObs) { try { orbMutObs.disconnect(); } catch(e) {} orbMutObs = null; }
    if (orbActive) try { stopThinkingOrb(); } catch(e) {}
  }
  function watchThinkingOrbs() {
    if (!bgSettings || bgSettings.orbs === false) { detachThinkingOrbs(); return; }
    if (orbPollTimer) clearInterval(orbPollTimer);
    orbPollTimer = setInterval(function() {
      try { syncThinkingOrb(); } catch(e) {}
    }, 400);

    if (orbCoalesceUnsub || orbMutObs) return;
    if (shared.refs.subscribeCoalesced) {
      try { orbCoalesceUnsub = shared.refs.subscribeCoalesced(function(){ try{ syncThinkingOrb(); }catch(e){} }); return; } catch(e){}
    }
    if (window.MutationObserver) {
      orbMutObs = new MutationObserver(function() {
        try { syncThinkingOrb(); } catch(e) {}
      });
      var rootEl = document.querySelector("#root") || document.documentElement;
      try {
        orbMutObs.observe(rootEl, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-state", "data-tool", "aria-label", "class", "data-plan-mode", "role"]
        });
      } catch(e) {}
    }
  }

  shared.refs.syncThinkingOrb = syncThinkingOrb;
  shared.refs.stopThinkingOrb = stopThinkingOrb;
  shared.refs.watchThinkingOrbs = watchThinkingOrbs;
  shared.refs.orbsHandle = {
    start: startThinkingOrb,
    stop: stopThinkingOrb,
    sync: syncThinkingOrb,
    watch: watchThinkingOrbs,
    detach: detachThinkingOrbs,
    get active() { return orbActive; },
    get canvas() { return orbCanvas; },
    get state() { return orbCurrentState; },
    get lastRecord() { return lastActiveToolRecord; },
    get queue() { return toolQueue.slice(); },
    get display() { return displayInfo; },
    resolveState: resolveActiveToolState,
    rawDetect: rawDetect,
    getPreset: getOrbPreset
  };
}


/* ===================== aurora.js ===================== */
/* ------------------------------------------------------------------ *
 * src/aurora.js — 极光引擎（initAurora，WebGL2 流体/粒子）
 *   shader 源码常量（VERT/FLOWMAP_FS/PARTICLE_FS/FLUID_FS）在 src/aurora-shaders.js（工厂级片段）。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initAurora(shared) {
  var state = shared.state;
  var bgSettings = shared.settings;
  var media = shared.media;
  var diag = shared.dom.diag;

  /* ------------------------------------------------------------------ *
   * 极光引擎（WebGL2）
   * ------------------------------------------------------------------ */
  function startAurora() {
    var canvas = shared.dom.auroraCanvas;
    // GPU 优化：单张全屏三角形/条带没有任何几何边缘，MSAA 对片元着色结果零影响，
    // antialias:false 直接省掉 MSAA tile 显存与每帧 resolve 带宽（鲸鱼层同款处理）。
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, powerPreference: "low-power", antialias: false });
    if (!gl) { canvas.dataset.state = "no-webgl2"; return; }
    diag.auroraGL = true;
    // 上下文丢失防护：GPU 内存回收后可重建
    try {
      canvas.addEventListener("webglcontextlost", function(e){ try{ e.preventDefault(); }catch(_){} running=false; if(raf){ try{ cancelAnimationFrame(raf);}catch(_){} raf=0; } canvas.dataset.state="context-lost"; });
      canvas.addEventListener("webglcontextrestored", function(){ try{ canvas.dataset.state="restoring"; startAurora(); }catch(_){} });
    } catch(_){}

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        var log = ""; try{ log = gl.getShaderInfoLog(s) || "compile failed"; }catch(_){}
        try{ console.error("[dsh-bg] aurora shader compile failed:", log.slice(0,400)); }catch(_){}
        try{ canvas.dataset.state = "shader-compile-fail:" + log.slice(0,200); diag.auroraProgs = "compile-fail"; }catch(_){}
        try{ gl.deleteShader(s); }catch(_){}
        return null;
      }
      return s;
    }
    function link(vs, fs) {
      var p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        var log2=""; try{ log2 = gl.getProgramInfoLog(p) || "link failed"; }catch(_){}
        try{ console.error("[dsh-bg] aurora program link failed:", log2.slice(0,400)); }catch(_){}
        try{ canvas.dataset.state = "shader-link-fail:" + log2.slice(0,200); diag.auroraProgs = "link-fail"; }catch(_){}
        try{ gl.deleteProgram(p); }catch(_){}
        return null;
      }
      return p;
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
    var _locFlow = gl.getAttribLocation(progFlow, "a_position");
    var _locPart = gl.getAttribLocation(progPart, "a_position");
    var _locFluid = gl.getAttribLocation(progFluid, "a_position");
    function bindAttrib(prog) {
      var loc = prog === progFlow ? _locFlow : (prog === progPart ? _locPart : (prog === progFluid ? _locFluid : gl.getAttribLocation(prog, "a_position")));
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
      // 释放旧渲染目标（纹理+FBO），避免窗口/DPR 变化时 GPU 内存堆积
      if (targetA) { try { gl.deleteTexture(targetA.tex); gl.deleteFramebuffer(targetA.fbo); } catch (e) {} }
      if (targetB) { try { gl.deleteTexture(targetB.tex); gl.deleteFramebuffer(targetB.fbo); } catch (e) {} }
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

    var mouse = { x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5, vx: 0, vy: 0, svx: 0, svy: 0, rawVX: 0, rawVY: 0, lastT: 0, lastMove: 0 };
    // 鼠标笔刷/光线跟随：由设置面板「鼠标跟随交互」开关实时控制（每帧判定）
    function auroraMouseEnabled() { return !media.reducedMotion && !media.coarse && !media.isWindows && bgSettings.mouse; }
    function onMove(e) {
      // 画布为 position:fixed inset:0 铺满视口，直接用视口尺寸换算，
      // 避免 mousemove 高频事件里 getBoundingClientRect() 的强制布局
      var w = window.innerWidth || canvas.clientWidth || 1;
      var h = window.innerHeight || canvas.clientHeight || 1;
      var nx = e.clientX / w;
      var ny = 1 - e.clientY / h;
      var t = performance.now();
      var dt = Math.max(1, t - (mouse.lastT || t));
      // 用事件时间戳求真实速度（归一化坐标/秒），驱动流场拖尾方向；限幅防异常事件
      var vx = (nx - mouse.x) / (dt / 1000);
      var vy = (ny - mouse.y) / (dt / 1000);
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 6) { vx = vx / sp * 6; vy = vy / sp * 6; }
      mouse.rawVX = vx; mouse.rawVY = vy;
      mouse.x = nx; mouse.y = ny;
      mouse.lastT = t; mouse.lastMove = t;
    }
    // 监听常驻（一个 passive listener 成本可忽略），是否生效由 auroraMouseEnabled 逐帧决定
    window.addEventListener("mousemove", onMove, { passive: true });

    var start = performance.now();
    var raf = 0;
    var running = true;
    // flowmap 与渲染解耦为两个独立节奏：交互活跃期均 60Hz，静止回落低频
    var lastFlow = 0, lastRender = 0;
    var latestTex = null;
    var auroraBlanked = false;

    var _hexCache = {};
    function hex2rgb(hex) {
      if (_hexCache[hex]) return _hexCache[hex];
      var h = hex.replace("#", "");
      var rgb = [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
      _hexCache[hex] = rgb;
      return rgb;
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      if (!bgSettings.aurora) {
        // 关闭：清空画布一次（透明）后跳过渲染，rAF 空转成本可忽略
        if (!auroraBlanked) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); auroraBlanked = true; }
        return;
      }
      var cfg = shared.refs.currentAuroraConfig();

      var kk = auroraScale();
      var w = Math.round(canvas.clientWidth * kk);
      var h = Math.round(canvas.clientHeight * kk);
      if (w !== W || h !== H) resizeAll();

      var useM = auroraMouseEnabled();
      // 交互活跃期（最近 200ms 内有鼠标移动）：flowmap 与渲染同步提到 60fps，
      // 笔刷轨迹/光线跟手无感；静止后自动回落设置帧率，不白烧 GPU
      var active = useM && (now - (mouse.lastMove || 0) < 200);
      var flowHz = active ? 60 : 30;
      var renderHz = active ? Math.max(60, bgSettings.fps || 30) : (bgSettings.fps || 30);

      // 漫游笔刷目标（鼠标跟随关闭时）：Lissajous 轨迹 + 解析速度
      var driftX = 0.5, driftY = 0.5, driftVX = 0, driftVY = 0;
      if (!useM) {
        var driftT = (now - start) * 0.001;
        var a1 = driftT * 0.09, b1 = driftT * 0.13;
        driftX = 0.5 + 0.38 * Math.sin(a1);
        driftY = 0.5 + 0.3 * Math.cos(b1);
        var e1 = 0.1;
        driftVX = (0.38 * (Math.sin(a1 + e1) - Math.sin(a1))) / e1;
        driftVY = (0.3 * (Math.cos(b1 + e1) - Math.cos(b1))) / e1;
      }

      // ---- flowmap 更新（独立节奏：交互期 60Hz，静止 30Hz；与渲染解耦保证笔刷实时性） ----
      if (now - lastFlow >= 1000 / flowHz) {
        var fdt = Math.min(0.25, (now - lastFlow) / 1000);
        lastFlow = now - (now - lastFlow) % (1000 / flowHz);
        // 帧率无关临界阻尼平滑：时间常数由「跟手灵敏度」控制（默认 20ms）
        // —— 越小越贴手、滤掉事件抖动，越大越绵柔
        var followTau = (bgSettings.followMs != null ? bgSettings.followMs : 20) / 1000;
        var kp = 1 - Math.exp(-fdt / followTau);
        mouse.smoothX += ((useM ? mouse.x : driftX) - mouse.smoothX) * kp;
        mouse.smoothY += ((useM ? mouse.y : driftY) - mouse.smoothY) * kp;
        // 速度平滑：时间常数为跟手灵敏度的 4 倍（默认 80ms），拖尾方向稳定不抖
        var kv = 1 - Math.exp(-fdt / (followTau * 4));
        mouse.svx += (mouse.rawVX - mouse.svx) * kv;
        mouse.svy += (mouse.rawVY - mouse.svy) * kv;

        var brushX = mouse.smoothX, brushY = mouse.smoothY;
        var brushVX = useM ? mouse.svx : driftVX;
        var brushVY = useM ? mouse.svy : driftVY;
        var brushStrength = useM ? cfg.mouseStrength : cfg.mouseStrength * 0.28;

        // --- flowmap pass（低分辨率流场，双缓冲乒乓；鼠标或漫游笔刷持续喂入） ---
        var src = flip ? targetA : targetB;
        var dst = flip ? targetB : targetA;
        flip = !flip;
        latestTex = dst.tex;
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
        gl.viewport(0, 0, wQ, hQ);
        gl.useProgram(progFlow);
        bindAttrib(progFlow);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src.tex);
        gl.uniform1i(uFlow.prev, 0);
        gl.uniform2f(uFlow.mouse, brushX, brushY);
        gl.uniform2f(uFlow.velocity, brushVX, brushVY);
        gl.uniform1f(uFlow.brushRadius, cfg.mouseRadius);
        gl.uniform1f(uFlow.brushStrength, brushStrength);
        // 衰减按实际帧间隔归一化（基准 30fps）：任何更新频率下拖尾淡出速度一致
        gl.uniform1f(uFlow.decay, Math.pow(cfg.decay, fdt * 30));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, W, H);
      }

      // ---- 渲染（帧率跟随设置；交互活跃期提到 60fps） ----
      if (now - lastRender < 1000 / renderHz) return;
      lastRender = now - (now - lastRender) % (1000 / renderHz);
      auroraBlanked = false;

      // --- 渲染 ---
      var t = (performance.now() - start) * 0.001 * (cfg.speed / 100);
      if (cfg.type === "fluid") {
        gl.useProgram(progFluid);
        bindAttrib(progFluid);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, latestTex);
        gl.uniform1i(uFluid.flowmap, 0);
        gl.uniform1f(uFluid.time, t);
        gl.uniform2f(uFluid.resolution, W, H);
        gl.uniform1f(uFluid.scale, cfg.scale);
        gl.uniform2f(uFluid.offset, cfg.offsetX / 100, cfg.offsetY / 100);
        gl.uniform1f(uFluid.grain, cfg.grain);
        gl.uniform1f(uFluid.distortBoost, cfg.distortBoost);
        gl.uniform1f(uFluid.swirlBoost, cfg.swirlBoost);
        var lx = cfg.lightX != null ? cfg.lightX : 0.89;
        // 光线跟随：官方 lightFollow × 设置面板强度，关闭鼠标跟随时完全静止（用 useM 守卫而非 0.85 衰减）
        var lf = cfg.lightFollow != null ? cfg.lightFollow * (bgSettings.lightFollow != null ? bgSettings.lightFollow : 1) * (useM ? 1 : 0) : 0;
        gl.uniform2f(uFluid.lightPos, lx + (mouse.smoothX - lx) * lf, cfg.lightY != null ? cfg.lightY : 0.46);
        gl.uniform1f(uFluid.lightCore, media.coarse ? 0 : (cfg.lightCore != null ? cfg.lightCore : 0.14));
        gl.uniform1f(uFluid.lightHalo, media.coarse ? 0 : (cfg.lightHalo != null ? cfg.lightHalo : 0.2));
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
        gl.bindTexture(gl.TEXTURE_2D, latestTex);
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

    if (media.reducedMotion) {
      // 单帧静态（原代码误用未声明的 last，严格模式下抛 ReferenceError）
      lastFlow = 0;
      lastRender = 0;
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
        if (!raf && running) raf = requestAnimationFrame(frame);
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

  shared.refs.startAurora = startAurora;
}


/* ===================== whale.js ===================== */
/* ------------------------------------------------------------------ *
 * src/whale.js — 粒子化鲸鱼引擎（initWhale）+ 鲸鱼层显隐
 *   shader/纹理常量与矩阵工具在 src/whale-shaders.js（工厂级片段）。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initWhale(shared) {
  var state = shared.state;
  var bgSettings = shared.settings;
  var media = shared.media;
  var diag = shared.dom.diag;

  /** 鲸鱼层显隐：全主题统一，仅受设置开关控制 */
  function updateWhaleDisplay() {
    if (!shared.dom.whaleLayer) return;
    shared.dom.whaleLayer.style.display = bgSettings.whale ? "flex" : "none";
  }
  function startWhale() {
    var canvas = shared.dom.whaleCanvas;
    // GPU 优化：点精灵粒子不需要 MSAA，antialias:false 省掉全屏 MSAA resolve；
    // low-power 提示驱动选择低功耗 GPU。渲染效果与原来一致（GL_POINTS 本来就不走多边形 AA）。
    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) { canvas.dataset.state = "no-webgl2"; return; }
    diag.whaleGL = true;
    try {
      canvas.addEventListener("webglcontextlost", function(e){ try{ e.preventDefault(); }catch(_){} canvas.dataset.state="context-lost"; });
      canvas.addEventListener("webglcontextrestored", function(){ try{ canvas.dataset.state="restoring"; startWhale(); }catch(_){} });
    } catch(_){}
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
        var log=""; try{ log=gl.getShaderInfoLog(s)||"compile failed"; }catch(_){}
        try{ console.error("[dsh-bg] whale shader compile failed:", log.slice(0,400)); }catch(_){}
        try{ canvas.dataset.state="whale-compile-fail:"+log.slice(0,200); diag.whaleProgs="compile-fail"; }catch(_){}
        try{ gl.deleteShader(s); }catch(_){}
        return null;
      }
      return s;
    }
    var prog = gl.createProgram();
    var vsS = compile(gl.VERTEX_SHADER, WHALE_VS);
    var fsS = compile(gl.FRAGMENT_SHADER, WHALE_FS);
    if (!vsS || !fsS) { try{ canvas.dataset.state="whale-shader-null"; diag.whaleProgs="compile-fail"; }catch(_){} return; }
    gl.attachShader(prog, vsS);
    gl.attachShader(prog, fsS);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      var log2=""; try{ log2=gl.getProgramInfoLog(prog)||"link failed"; }catch(_){}
      try{ console.error("[dsh-bg] whale program link failed:", log2.slice(0,400)); }catch(_){}
      try{ canvas.dataset.state = "link-fail:"+log2.slice(0,200); diag.whaleProgs = "link-fail"; }catch(_){}
      try{ gl.deleteProgram(prog); }catch(_){}
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
    if (!media.reducedMotion) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      document.addEventListener("visibilitychange", onVis);
    }

    var start = performance.now();
    var raf = 0;
    var last = 0;
    var strength = 0;
    var b = { x: 0, y: 0 };
    // 光线跟随的平滑状态（屏幕归一化坐标，帧率无关指数平滑，时间常数 ~40ms）
    var wSX = 0, wSY = 0;
    var FOV = 50 * Math.PI / 180;
    // 相机距离：官方 18 → 15（18/15 = 1.2），鲸鱼整体等比放大 1.2 倍
    var CAM_DIST = 15;
    var HALF_H = Math.tan(FOV / 2) * CAM_DIST; // viewport（z=0 平面）半高
    var view = m4Translation(0, 0, -15);
    // GPU 优化：恒定不变的 uniform 只在初始化时上传一次（该 program 在此上下文常驻绑定），
    // 每帧省去约 10 次冗余 uniform 调用；动态值仍逐帧上传
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniform1f(u.uWaveSpeed, WAVE_DEFAULTS.speed);
    gl.uniform1f(u.uWaveAmount, WAVE_DEFAULTS.amount);
    gl.uniform1f(u.uMouseRadius, MOUSE_DEFAULTS.radius);
    gl.uniform1f(u.uMouseDistort, MOUSE_DEFAULTS.distort);
    gl.uniform1f(u.uLoose, 1);
    gl.uniform1f(u.uScatter, 0);
    gl.uniform1f(u.uLightRange, LIGHT_DEFAULTS.range);
    gl.uniform1f(u.uShadeMin, LIGHT_DEFAULTS.shadeMin);
    gl.uniform1f(u.uShadeMax, LIGHT_DEFAULTS.shadeMax);
    // 复用矩阵缓冲，避免每帧分配 6 个 Float32Array(16)
    var _mTmpA = new Float32Array(16), _mTmpB = new Float32Array(16), _mTmpC = new Float32Array(16), _mTmpD = new Float32Array(16), _mTmpE = new Float32Array(16), _mTmpF = new Float32Array(16);
    var _modelBuf = new Float32Array(16), _projBuf = new Float32Array(16);
    var _invBuf = new Float32Array(16);

    // GPU 优化：鲸鱼是柔光粒子层，1.25x 物理分辨率渲染（原 1.5x 上限），
    // 像素量减少约 30%，屏幕混合的柔光粒子放大后无感知差异
    var WHALE_DPR = 1.25;

    // out 参数版矩阵工具（复用缓冲，零分配）
    function m4TranslationOut(tx, ty, tz, out) { out[0]=1;out[1]=0;out[2]=0;out[3]=0; out[4]=0;out[5]=1;out[6]=0;out[7]=0; out[8]=0;out[9]=0;out[10]=1;out[11]=0; out[12]=tx;out[13]=ty;out[14]=tz;out[15]=1; return out; }
    function m4ScaleOut(s, out) { out[0]=s;out[1]=0;out[2]=0;out[3]=0; out[4]=0;out[5]=s;out[6]=0;out[7]=0; out[8]=0;out[9]=0;out[10]=s;out[11]=0; out[12]=0;out[13]=0;out[14]=0;out[15]=1; return out; }
    function m4RotationXOut(a, out){ var c=Math.cos(a),s=Math.sin(a); out[0]=1;out[1]=0;out[2]=0;out[3]=0; out[4]=0;out[5]=c;out[6]=s;out[7]=0; out[8]=0;out[9]=-s;out[10]=c;out[11]=0; out[12]=0;out[13]=0;out[14]=0;out[15]=1; return out; }
    function m4RotationYOut(a, out){ var c=Math.cos(a),s=Math.sin(a); out[0]=c;out[1]=0;out[2]=-s;out[3]=0; out[4]=0;out[5]=1;out[6]=0;out[7]=0; out[8]=s;out[9]=0;out[10]=c;out[11]=0; out[12]=0;out[13]=0;out[14]=0;out[15]=1; return out; }
    function m4RotationZOut(a, out){ var c=Math.cos(a),s=Math.sin(a); out[0]=c;out[1]=s;out[2]=0;out[3]=0; out[4]=-s;out[5]=c;out[6]=0;out[7]=0; out[8]=0;out[9]=0;out[10]=1;out[11]=0; out[12]=0;out[13]=0;out[14]=0;out[15]=1; return out; }
    function m4MulOut(a,b,out){ for(var c=0;c<4;c++) for(var r=0;r<4;r++) out[c*4+r]=a[0*4+r]*b[c*4+0]+a[1*4+r]*b[c*4+1]+a[2*4+r]*b[c*4+2]+a[3*4+r]*b[c*4+3]; return out; }
    function m4PerspectiveOut(fovY, aspect, near, far, out){ var f=1/Math.tan(fovY/2), nf=1/(near-far); out[0]=f/aspect;out[1]=0;out[2]=0;out[3]=0; out[4]=0;out[5]=f;out[6]=0;out[7]=0; out[8]=0;out[9]=0;out[10]=(far+near)*nf;out[11]=-1; out[12]=0;out[13]=0;out[14]=2*far*near*nf;out[15]=0; return out; }

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
      if (shared.dom.whaleLayer.style.display === "none") return;
      // 鼠标跟随开启时鲸鱼提到 60fps（点精灵渲染开销小），光线/扭曲跟手更顺滑
      var frameMs = 1000 / (bgSettings.mouse ? 60 : (bgSettings.fps || 30));
      if (now - last < frameMs) return;
      var dt = Math.min(0.5, (now - last) / 1000);
      last = now - (now - last) % frameMs;

      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      if (Math.round(w * WHALE_DPR) !== canvas.width || Math.round(h * WHALE_DPR) !== canvas.height) resize();

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
      var aspect = canvas.width / canvas.height;
      var halfW = HALF_H * aspect;
      // 靠右布局：将鲸鱼中心进一步向右侧偏移（占据右侧开阔区域，文字区彻底清爽）
      var posX = halfW * 0.52;
      // 使用复用缓冲的 out 版矩阵，避免每帧新建 6 个 Float32Array
      m4RotationXOut(rotX, _mTmpA);
      m4RotationYOut(rotY, _mTmpB);
      m4MulOut(_mTmpB, _mTmpA, _mTmpC);
      m4RotationZOut(rotZ, _mTmpD);
      m4MulOut(_mTmpD, _mTmpC, _mTmpE);
      m4TranslationOut(posX, posY, 0, _mTmpA);
      m4MulOut(_mTmpA, _mTmpE, _mTmpB);
      m4ScaleOut(scale, _mTmpC);
      m4MulOut(_mTmpB, _mTmpC, _modelBuf);
      var model = _modelBuf;
      m4PerspectiveOut(FOV, aspect, 0.1, 100, _projBuf);
      var proj = _projBuf;
      gl.uniformMatrix4fv(u.uModel, false, model);
      gl.uniformMatrix4fv(u.uProj, false, proj);
      gl.uniform1f(u.uTime, elapsed);
      gl.uniform1f(u.uAssembly, D);
      // 鼠标强度：官方以 (1-0.05^dt) 插值；设置面板关闭时恒为 0
      var target = (mouse.active && bgSettings.mouse) ? MOUSE_DEFAULTS.strength : 0;
      strength += (target - strength) * (1 - Math.pow(0.05, dt));
      gl.uniform1f(u.uMouseStrength, strength);
      // 光线：跟随鲸鱼右移基准 + 光标移动响应
      var wk = 1 - Math.exp(-dt / ((bgSettings.followMs != null ? bgSettings.followMs : 20) * 2 / 1000));
      wSX += ((bgSettings.mouse ? mouse.x : 0) - wSX) * wk;
      wSY += ((bgSettings.mouse ? mouse.y : 0) - wSY) * wk;
      gl.uniform3f(u.uLightPos, posX + 2.5 + wSX * halfW * LIGHT_DEFAULTS.followX * (bgSettings.mouse ? (bgSettings.lightFollow != null ? bgSettings.lightFollow : 1) : 0), LIGHT_DEFAULTS.y, LIGHT_DEFAULTS.z);
      // uMouse：屏幕鼠标 → 世界(z=0) → 组局部空间（官方 matrixWorld 逆变换）
      if (mouse.hasMoved) {
        var wx = mouse.x * halfW, wy = mouse.y * HALF_H;
        if (strength < 0.01) { b.x = wx; b.y = wy; }
        // 帧率无关：官方 decay 是每 30fps 帧的插值系数，按实际 dt 归一化，60fps 下手感一致
        else { b.x += (wx - b.x) * (1 - Math.pow(1 - MOUSE_DEFAULTS.decay, dt * 30)); b.y += (wy - b.y) * (1 - Math.pow(1 - MOUSE_DEFAULTS.decay, dt * 30)); }
      }
      var inv = m4Inverse(model, _invBuf); // 复用缓冲，帧循环零分配
      var ux = inv[0]*b.x + inv[4]*b.y + inv[12];
      var uy = inv[1]*b.x + inv[5]*b.y + inv[13];
      gl.uniform2f(u.uMouse, ux, uy);
      // 颜色：晶透亮白粒子（带极微量冰蓝高光）
      gl.uniform3f(u.uColor, 0.95 * D, 0.97 * D, 1.0 * D);
      // 点尺寸：官方 BoxGeometry 0.065 单位 × 实例缩放 × 组缩放（提升粒子点阵清晰度）
      gl.uniform1f(u.uPointScale, 0.065 * scale * (canvas.height / (2 * HALF_H)));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, data.count);
    }

    if (media.reducedMotion) {
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
        if (!raf && !media.reducedMotion) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
  }

  shared.refs.startWhale = startWhale;
  shared.refs.updateWhaleDisplay = updateWhaleDisplay;
}


/* ===================== constellation.js ===================== */
/* ------------------------------------------------------------------ *
 * src/constellation.js — 星座网格引擎（initConstellation，2D canvas）
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initConstellation(shared) {
  var state = shared.state;
  var bgSettings = shared.settings;
  var media = shared.media;
  var diag = shared.dom.diag;

  /* ------------------------------------------------------------------ *
   * 星座网格引擎（2D canvas）
   * ------------------------------------------------------------------ */
  function startConstellation() {
    var canvas = shared.dom.constellationCanvas;
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
      // 画布为 position:fixed inset:0 铺满视口，直接用视口尺寸换算，
      // 避免 mousemove 高频事件里 getBoundingClientRect() 的强制布局
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      wake();
    }
    if (!media.reducedMotion) window.addEventListener("mousemove", onMove, { passive: true });

    function draw(mx, my, active) {
      var opts = shared.refs.currentConstellation();
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // GPU/CPU 优化：线段互不重叠，逐段 beginPath/stroke 与「单路径收集 + 一次 stroke」
      // 的栅格化结果完全一致，但绘制调用从 O(n) 次降为 1 次（全屏网格每帧省下数百次 stroke）
      ctx.strokeStyle = opts.lineColor + " " + opts.lineOpacity + ")";
      ctx.lineWidth = 0.5;
      var i, j, a, b, dx, dy, dist, ux, uy;
      ctx.beginPath();
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols - 1; i++) {
          a = dots[j * cols + i]; b = dots[j * cols + i + 1];
          dx = b.x - a.x; dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) continue;
          ux = dx / dist; uy = dy / dist;
          ctx.moveTo(a.x + 10 * ux, a.y + 10 * uy);
          ctx.lineTo(b.x - 10 * ux, b.y - 10 * uy);
        }
      }
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows - 1; j++) {
          a = dots[j * cols + i]; b = dots[(j + 1) * cols + i];
          dx = b.x - a.x; dy = b.y - a.y;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) continue;
          ux = dx / dist; uy = dy / dist;
          ctx.moveTo(a.x + 10 * ux, a.y + 10 * uy);
          ctx.lineTo(b.x - 10 * ux, b.y - 10 * uy);
        }
      }
      ctx.stroke();

      // 点批量合并：远离光标的点尺寸与透明度完全相同（n=1.8 / dotOpacity），
      // 合并进单一 path 一次填充；仅光标邻近点保留逐个绘制（亮度/尺寸渐变不变）
      ctx.fillStyle = opts.dotColor + " " + opts.dotOpacity + ")";
      var hasMouse = !isNaN(mx) && !isNaN(my);
      var nearIdx = [];
      ctx.globalAlpha = opts.dotOpacity;
      ctx.beginPath();
      for (i = 0; i < dots.length; i++) {
        var p = dots[i];
        if (hasMouse) {
          dx = p.x - mx; dy = p.y - my;
          dist = Math.sqrt(dx * dx + dy * dy);
          var l = Math.max(0, 1 - dist / 140);
          if (l > 0) { nearIdx.push(i); continue; }
        }
        if (opts.round) {
          ctx.moveTo(p.x + 1.8, p.y);
          ctx.arc(p.x, p.y, 1.8, 0, 2 * Math.PI);
        } else {
          ctx.rect(p.x - 1.8, p.y - 1.8, 3.6, 3.6);
        }
      }
      ctx.fill();
      for (j = 0; j < nearIdx.length; j++) {
        p = dots[nearIdx[j]];
        dx = p.x - mx; dy = p.y - my;
        dist = Math.sqrt(dx * dx + dy * dy);
        var ln = Math.max(0, 1 - dist / 140);
        var n = 1.8 + 2 * ln;
        ctx.globalAlpha = opts.dotOpacity + 0.4 * ln;
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
    shared.refs.wakeConstellation = wake; // 设置面板重新开启星座时唤醒（idle 停止后 rAF 已停）

    var constBlanked = false;
    function loop(now) {
      if (!bgSettings.constellation) {
        // 关闭：清空画布一次后空转（与浅色主题同一模式，代价可忽略）
        if (!bgSettings.constellation && !constBlanked) {
          ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
          constBlanked = true;
        }
        raf = requestAnimationFrame(loop);
        return;
      }
      constBlanked = false;
      // 鼠标跟随开启时活跃期 60fps（2D 画布开销小），斥力响应更顺滑；静止仍按设置帧率
      var frameMs = 1000 / (bgSettings.mouse ? 60 : (bgSettings.fps || 30));
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

    if (media.reducedMotion) {
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

  shared.refs.startConstellation = startConstellation;
}


/* ===================== shell.js ===================== */
/* ------------------------------------------------------------------ *
 * src/shell.js — 外壳透明化与诊断面板（initShell）
 *   玻璃内联样式按设置开关重跑（shared.refs.shellGlassApply）；
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initShell(shared) {
  var state = shared.state;
  var bgSettings = shared.settings;
  var diag = shared.dom.diag;
  var shellMutObs = null;
  var shellUnsub = null;
  var shellTimer = null;
  var shellTries = 0;
  var shellRaf = 0;

  function startDiagPanel() {
    function collect() {
      var cs = function (el) { try { return window.getComputedStyle(el); } catch (e) { return null; } };
      var bcs = cs(document.body);
      var hcs = cs(document.documentElement);
      var ccs = cs(shared.dom.container);
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
      diag.canvasW = shared.dom.auroraCanvas.width;
      diag.canvasH = shared.dom.auroraCanvas.height;
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
  function makeShellTransparent() {
    // 深色主题要设置/撤销的内联样式属性集合
    var GLASS_PROPS = ["background", "background-color", "backdrop-filter", "-webkit-backdrop-filter",
      "box-shadow", "border-right-color", "border-color", "--dsh-bg-blur"];
    var processedGlass = (typeof WeakSet !== "undefined") ? new WeakSet() : null;
    // 幂等写入：值与优先级均一致时跳过。流式输出期间本函数随每次 DOM 突变合批触发，
    // 无条件 setProperty 会造成大量冗余样式失效/重绘；跳过未变化项可显著降低主线程
    // 与合成器压力（GPU 优化，最终样式结果与原实现完全一致）
    function setProp(el, prop, val, prio) {
      if (!el || !el.style) return;
      var p = prio || "";
      if (el.style.getPropertyValue(prop) === val && el.style.getPropertyPriority(prop) === p) return;
      el.style.setProperty(prop, val, p);
    }
    function clearInline(el) {
      if (!el || !el.style) return;
      for (var i = 0; i < GLASS_PROPS.length; i++) {
        if (el.style.getPropertyValue(GLASS_PROPS[i]) !== "") el.style.removeProperty(GLASS_PROPS[i]);
      }
    }
    function ensureShellObserver() {
      if (shellUnsub || shellMutObs) return;
      if (!bgSettings.glass) return;
      // 优先使用合批 observer（rAF 合批，单例在 #root），回退到独立 observer
      if (shared.refs.subscribeCoalesced) {
        try {
          shellUnsub = shared.refs.subscribeCoalesced(function(){ try { scheduleShellGlass(); } catch(e) {} });
          return;
        } catch(e){}
      }
      if (!window.MutationObserver) return;
      shellMutObs = new MutationObserver(function(){ try { scheduleShellGlass(); } catch(e) {} });
      var rootEl = document.querySelector("#root") || document.documentElement;
      try { shellMutObs.observe(rootEl, { childList: true, subtree: true }); } catch(e) {}
    }
    function detachShellObserver() {
      if (shellUnsub) { try { shellUnsub(); } catch(e) {} shellUnsub = null; return; }
      if (shellMutObs) { try { shellMutObs.disconnect(); } catch(e) {} shellMutObs = null; }
      if (shellRaf) { try { cancelAnimationFrame(shellRaf); } catch(_){} shellRaf = 0; }
    }
    function scheduleShellGlass(){
      if (shellRaf) return;
      var raf = window.requestAnimationFrame || function(fn){ return setTimeout(fn,16); };
      shellRaf = raf(function(){ shellRaf=0; try{ applyShellGlass(); }catch(e){} });
    }
    function applyShellGlass() {
      // 玻璃开关关闭：清理覆盖并断开观察器/轮询（全主题统一深色，不再判断 state.dark）
      if (!bgSettings.glass) {
        try { detachShellObserver(); } catch(e) {}
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
        var glassEls0 = document.querySelectorAll(".gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, .LVzXQa_card, .Mbwy4a_card, .VOzbGW_panel, .CY-8Ka_ioCard, .o3BgMG_ioCard, [class$=\"_bubble\"], [class*=\"_block_\"], [class$=\"_bannerWrap\"], [class$=\"_copyButton\"]");
        for (var g0 = 0; g0 < glassEls0.length; g0++) clearInline(glassEls0[g0]);
        return;
      }
      // 玻璃开启且深色：确保观察器存活
      try { ensureShellObserver(); } catch(e) {}
      // 玻璃模糊强度由设置面板实时控制（CSS 全部走 blur(var(--dsh-bg-blur))）
      try { setProp(document.body, "--dsh-bg-blur", (bgSettings.blur || 8) + "px"); } catch (e) {}
      var frame = document.querySelector('[data-slot="root"] .pI_x6G_frame') ||
        document.querySelector('[data-slot="root"] > div');
      if (frame && frame.style) {
        diag.frameFound = true;
        diag.frameBg = window.getComputedStyle ? window.getComputedStyle(frame).backgroundColor : "?";
        setProp(frame, "background", "transparent", "important");
      }
      var bootEl = document.querySelector("#root ._boot_9gj4p_6");
      if (bootEl && bootEl.style) {
        setProp(bootEl, "background", "transparent", "important");
      }
      // 视图根容器（会话视图等全高不透明层）同样透明化
      var views = document.querySelectorAll('[data-slot="conversation"] > div, .pI_x6G_detailsCol > div');
      for (var i = 0; i < views.length; i++) {
        var v = views[i];
        if (v && v.style) setProp(v, "background", "transparent", "important");
      }
      // 官方玻璃拟态（ds-glass 令牌：blur 12px + 深色半透明表面色 + 官方边框/阴影）
      var glassBg = "rgba(13,15,19,.55)";
      var glassBorder = "hsla(0,0%,100%,.08)";
      var glassShadow = "0 0 1px 0 rgba(0,0,0,.2), 0 0 4px 0 rgba(0,0,0,.02), 0 12px 32px 0 rgba(0,0,0,.08)";
      var side = document.querySelector(".pI_x6G_sidebarCol");
      if (side && side.style) {
        // 注意：backdrop-filter 会让侧边栏成为 fixed 后代的包含块（设置弹窗错乱），
        // 所以列本身不设 backdrop-filter，模糊由 CSS 的 ::before 伪元素承担
        setProp(side, "background", glassBg, "important");
        setProp(side, "border-right-color", glassBorder, "important");
      }
      var sideRoot = document.querySelector(".hHd-Xa_root, [data-slot=\"sidebar\"] > div");
      if (sideRoot && sideRoot.style) {
        // 注意：不能给侧边栏内容根加 z-index/堆叠上下文——设置弹窗（fixed z-1000）
        // 挂载在侧边栏内部，被困在侧边栏堆叠上下文里会被输入框（z-7）盖住；
        // 模糊由 CSS 的 ::before z-index:-1 承担，内容自然在模糊层之上
        setProp(sideRoot, "background", "transparent", "important");
      }
      var card = document.querySelector(".uV2eYG_card, [data-composer-card=\"true\"]");
      if (card && card.style) {
        setProp(card, "background", glassBg, "important");
        setProp(card, "backdrop-filter", "blur(" + (bgSettings.blur || 8) + "px)", "important");
        setProp(card, "-webkit-backdrop-filter", "blur(" + (bgSettings.blur || 8) + "px)", "important");
        setProp(card, "border-color", glassBorder, "important");
        setProp(card, "box-shadow", glassShadow, "important");
      }
      var seat = document.querySelector(".wSkVaW_composerSeat, [data-composer-seat]");
      if (seat && seat.style) setProp(seat, "background", "transparent", "important");
      // 会话列表底部渐隐条（qDHVXG_fade）：玻璃侧边栏下会露出浅色白条，透明化
      var fade = document.querySelector(".qDHVXG_fade");
      if (fade && fade.style) setProp(fade, "background", "transparent", "important");
      // 消息气泡与代码块玻璃化（与侧边栏/输入框同款材质）—— WeakSet 缓存避免每突变全量重写
      var glassRing = "inset 0 0 0 1px hsla(0,0%,100%,.08)";
      var blurPx = (bgSettings.blur || 8) + "px";
      var glassEls = document.querySelectorAll(".gdEzaW_bubble, ._block_10eou_7, ._block_biesw_7, ._block_srovd_7, ._block_s66q0_7, ._block_178r4_4, ._block_d4nqi_7, ._body_1ye18_20, ._copyButton_10eou_142, ._bannerWrap_178r4_21, .LVzXQa_card, .Mbwy4a_card, .VOzbGW_panel, .CY-8Ka_ioCard, .o3BgMG_ioCard, [class$=\"_bubble\"], [class*=\"_block_\"], [class$=\"_bannerWrap\"], [class$=\"_copyButton\"]");
      for (var gi = 0; gi < glassEls.length; gi++) {
        var ge = glassEls[gi];
        if (!ge || !ge.style) continue;
        if (processedGlass) {
          var cached = ge._dshBlur;
          if (processedGlass.has(ge) && cached === blurPx) continue;
          processedGlass.add(ge); ge._dshBlur = blurPx;
        }
        setProp(ge, "background", glassBg, "important");
        setProp(ge, "backdrop-filter", "blur(" + blurPx + ")", "important");
        setProp(ge, "-webkit-backdrop-filter", "blur(" + blurPx + ")", "important");
        setProp(ge, "box-shadow", glassRing, "important");
      }
    }
    applyShellGlass();
    shared.refs.shellGlassApply = applyShellGlass; // 暴露给设置开关：切换玻璃时立即重跑
    shared.refs.shellMutObs = function(){ return shellMutObs; };
    shared.refs.shellTimer = function(){ return shellTimer; };
    // 暴露 detach 供外部/主题切换调用
    shared.refs.detachShellObserver = detachShellObserver;
    shared.refs.ensureShellObserver = ensureShellObserver;
    // 轮询兜底：合批 observer 为主，仅保留轻量 2s 间隔作为保险（最多 30 次，60s 后自停）
    if (!shellTimer) {
      shellTimer = setInterval(function () {
        if (!bgSettings.glass) { try { detachShellObserver(); } catch(e) {} if (shellTimer){ clearInterval(shellTimer); shellTimer=null; } return; }
        try { scheduleShellGlass(); } catch(e) {}
        if (++shellTries > 30) { clearInterval(shellTimer); shellTimer = null; }
      }, 2000);
    }
    ensureShellObserver();
  }

  shared.refs.makeShellTransparent = makeShellTransparent;
  shared.refs.startDiagPanel = startDiagPanel;
}


/* ===================== observer.js ===================== */
/* ------------------------------------------------------------------ *
 * src/observer.js — 主题联动（initObserver，MutationObserver + matchMedia）
 *   全主题统一深色：监听到主题属性变化时强制回写 dark，确保浅色亦显示深色主题。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initObserver(shared) {
  var state = shared.state;

  function observeTheme() {
    var apply = function () {
      // 全主题统一深色：属性回写由 applyThemeClass 幂等处理
      // （已满足则不动 DOM，避免「观察 → 改写 → 再观察」死循环）。
      state.dark = true;
      try { shared.refs.applyThemeClass(); } catch(e){}
      try{ if (shared.refs.refreshBeamTheme) shared.refs.refreshBeamTheme(); }catch(e){}
      try{ if (shared.refs.shellGlassApply) shared.refs.shellGlassApply(); }catch(e){}
    };
    if (window.MutationObserver) {
      if (!shared.refs.themeObserver) {
        var mo = new MutationObserver(apply);
        shared.refs.themeObserver = mo;
        // 观察主题信号属性。apply 不再回写这些属性（回写由幂等的
        // applyThemeClass 承担），因此不会形成自触发死循环。
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme", "data-theme"] });
        if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme", "data-ds-light-theme", "data-theme"] });
      }
    }
    if (shared.media.darkQuery && shared.media.darkQuery.addEventListener) {
      shared.media.darkQuery.addEventListener("change", apply);
    } else if (shared.media.darkQuery && shared.media.darkQuery.addListener) {
      shared.media.darkQuery.addListener(apply); // 旧版 Safari/WebView 回退
    }
  }

  shared.refs.observeTheme = observeTheme;
}


/* ===================== boot.js ===================== */
/* ------------------------------------------------------------------ *
 * src/boot.js — 启动编排（initBoot）
 *   在全部 initX 之后由 apply 调用；跨模块启动函数一律经 shared.refs.*。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ------------------------------------------------------------------ */
function initBoot(shared) {
  var media = shared.media;

  function boot() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", boot, { once: true }); return; }
    // body 背景透明化由 applyThemeClass 按主题管理（浅色主题保持官方原版）
    shared.refs.applyThemeClass();
    document.body.appendChild(shared.dom.container);
    shared.refs.startAurora();
    if (typeof location === "undefined" || location.search.indexOf("nowhale") === -1) shared.refs.startWhale();
    if (!media.coarse || media.reducedMotion) shared.refs.startConstellation();
    shared.refs.observeTheme();
    shared.refs.makeShellTransparent();
    try{ shared.refs.watchBeamComposer(); }catch(e){}
    try{ shared.refs.watchBeamTodo(); }catch(e){}
    try{ shared.refs.watchThinkingOrbs(); }catch(e){}
    if (typeof location !== "undefined" && (location.search.indexOf("dshtest") !== -1)) shared.refs.startDiagPanel();
    // 调试钩子：显式开启（localStorage dsh-bg-debug=1 或 ?dshdbg=1）才执行 opencv/opendbg，避免生产 URL 误触
    var dbgEnabled = false; try { dbgEnabled = localStorage.getItem("dsh-bg-debug") === "1" || (typeof location !== "undefined" && location.search.indexOf("dshdbg") !== -1); } catch(e){}
    // 调试钩子：?opencv=1 时展开侧边栏并打开第一个会话（检查真实消息 DOM 的代码块类名）
    if (dbgEnabled && typeof location !== "undefined" && location.search.indexOf("opencv") !== -1) {
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
    if (dbgEnabled && typeof location !== "undefined" && location.search.indexOf("opendbg") !== -1) {
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

  shared.refs.boot = boot;
}


/* ===================== index.js ===================== */
/* ===================================================================== *
 * src/index.js — 客户端入口 apply(ctx)（由 scripts/build.mjs 拼接进工厂闭包）
 *   创建 shared（media / state / settings / dom / refs），按依赖顺序调用各
 *   子系统的 initX，装配 window.__dshDeepSeekBg 调试句柄，最后按原执行顺序
 *   执行 applyThemeClass → setupSettingsUi(ctx) → boot。
 *   工厂级 seed `react`（构建模板注入）仅由 src/settings.js 的设置页 UI 使用。
 * ===================================================================== */
function apply(ctx) {
  "use strict";
  if (window.__dshDeepSeekBg && window.__dshDeepSeekBg._inited) return;
  if (typeof document === "undefined") return;

  if (typeof window.__dshDeepSeekBg !== 'object' || window.__dshDeepSeekBg === null) window.__dshDeepSeekBg = {};
  window.__dshDeepSeekBg._inited = true;

  /* 跨模块共享状态：预建全部容器对象，各 initX 捕获引用后后续填充依然有效 */
  var shared = {
    media: {
      darkQuery: window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null,
      reducedMotion: !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      coarse: !!(window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches),
      isWindows: (navigator.userAgentData && navigator.userAgentData.platform === "Windows") ||
        navigator.userAgent.indexOf("Windows") !== -1
    },
    state: { dark: false },
    settings: {},
    dom: {},
    refs: {},
    ctx: ctx
  };

  // 依赖顺序：theme → settings → dom → coalesce → beam → orbs → 渲染引擎 → shell → observer → boot
  initTheme(shared);         // 主题检测 / 官方参数配置 / state.dark 初值
  initSettings(shared);      // bgSettings（shared.settings）+ 设置页 UI（默认全特效）
  initDom(shared);           // 背景容器 / 极光 / 星座 canvas / 鲸鱼层 / diag
  initCoalesce(shared);      // 合批 MutationObserver（供 beam/orbs/shell 订阅）
  initBeam(shared);          // Border Beam 状态机 + composer/todo 集成（CSS 在 beam-css.js）
  initOrbs(shared);          // Thinking Orbs 运行时（几何数学在 orbs-math.js）
  initAurora(shared);        // 极光引擎（shader 在 aurora-shaders.js）
  initWhale(shared);         // 粒子鲸鱼（shader/矩阵在 whale-shaders.js）
  initConstellation(shared); // 星座网格
  initShell(shared);         // 外壳透明化 + 诊断面板
  initObserver(shared);      // 主题联动（MutationObserver + matchMedia）
  initBoot(shared);          // 启动编排（原 boot()）

  // 调试句柄（原 apply 内 try 块）：beam/orbs 句柄对象由各自模块构造后注册
  try {
    if (typeof window.__dshDeepSeekBg !== "object" || window.__dshDeepSeekBg === null) window.__dshDeepSeekBg = {};
    window.__dshDeepSeekBg.beam = shared.refs.beamHandle;
    window.__dshDeepSeekBg.orbs = shared.refs.orbsHandle;
  } catch (e) {}

  // 与原执行顺序一致：applyThemeClass（原 1833）→ setupSettingsUi(ctx)（原 5014）→ boot()（原 5015）
  if (shared.refs.applyThemeClass) shared.refs.applyThemeClass();
  if (shared.refs.setupSettingsUi) shared.refs.setupSettingsUi(ctx);
  if (shared.refs.boot) shared.refs.boot();
}


    exports.apply = apply;
    // 设置面板依赖 slots 服务（由 dsh-client-ui-slots 提供）；未就绪时等待其出现
    exports.inject = ["slots"];
    return module.exports;
  }
});
