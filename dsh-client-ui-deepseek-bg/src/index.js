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
