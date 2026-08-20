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
