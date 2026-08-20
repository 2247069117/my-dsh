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
  shared.dom.container.dataset.version = "__PKG_VERSION__"; // 部署版本标记：由 build.mjs 从 package.json 注入，页面可查 document.getElementById('dsh-ds-bg')?.dataset.version
  // 关键样式内联兜底：全主题统一深色背景
  shared.dom.container.style.cssText = "position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;" +
    "background:#0a0a0a;" +
    "animation:dsh-ds-enter 1.8s ease-out backwards;will-change:opacity,filter;";
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
