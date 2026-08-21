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
