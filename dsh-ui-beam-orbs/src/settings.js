/* ===================================================================== *
 * src/settings.js — 界面特效设置（initSettings）
 *   玻璃拟态（侧边栏/气泡/代码块等）、Border Beam 光效、Thinking Orbs
 *   （Orbs 为核心交互特性，始终开启）+ 高级：玻璃模糊强度。
 *   即时生效、localStorage 持久化（dsh-bg-glass-settings）。
 *   背景引擎设置（极光/鲸鱼/星座/鼠标）在 dsh-ui-deepseek-bg 插件。
 *   由 scripts/build.mjs 拼接进 lib/client.js 的工厂闭包。
 * ===================================================================== */
function initSettings(shared) {
  var ctx = shared.ctx;

  var SETTINGS_KEY = "dsh-bg-glass-settings";
  var DEFAULTS = { beam: true, glass: true, blur: 12 };

  function loadSettings() {
    var d = { beam: true, glass: true, blur: 12 };
    var parsed = null;
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (e) {}
    if (parsed && typeof parsed === "object") {
      var allowed = { beam:1, glass:1, blur:1 };
      for (var k in parsed) if (Object.prototype.hasOwnProperty.call(parsed, k) && allowed[k]) d[k] = parsed[k];
    }
    d.orbs = true; // Thinking Orbs 核心交互特性，始终保持开启
    return d;
  }
  shared.settings = loadSettings();
  var bgSettings = shared.settings;

  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(bgSettings)); } catch (e) { try { if (e && e.name === "QuotaExceededError") console.warn("[dsh-glass] localStorage quota exceeded", e); } catch(_){} } }
  function estimateGpu() {
    var s = bgSettings, score = 0;
    if (s.beam) score += 8;
    if (s.glass) score += 9 * Math.min(1.6, (s.blur || 8) / 8);
    if (s.orbs) score += 2;
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  function snapshotSettings() {
    return {
      beam: !!bgSettings.beam, glass: !!bgSettings.glass, orbs: true,
      blur: Number(bgSettings.blur) || 8,
      gpu: estimateGpu()
    };
  }
  var settingsListeners = [];
  function notifySettings() { for (var i = 0; i < settingsListeners.length; i++) { try { settingsListeners[i](); } catch (e) {} } }
  function subscribeSettings(fn) {
    settingsListeners.push(fn);
    return function () { var i = settingsListeners.indexOf(fn); if (i >= 0) settingsListeners.splice(i, 1); };
  }
  function updateSetting(key, value) {
    if (key === "orbs") return;
    bgSettings[key] = value;
    saveSettings(); applyBgSettings(); notifySettings();
  }
  function resetSettings() {
    bgSettings.beam = DEFAULTS.beam; bgSettings.glass = DEFAULTS.glass; bgSettings.blur = DEFAULTS.blur;
    saveSettings(); applyBgSettings(); notifySettings();
  }

  /** 把每个子系统立即切换到当前设置 */
  function applyBgSettings() {
    try { document.body.classList.toggle("dsh-bg-no-glass", !bgSettings.glass); } catch (e) {}
    try {
      if (bgSettings.beam) {
        if (shared.refs.watchBeamComposer) shared.refs.watchBeamComposer();
        if (shared.refs.watchBeamTodo) shared.refs.watchBeamTodo();
      } else {
        if (shared.refs.detachComposerBeam) shared.refs.detachComposerBeam();
        if (shared.refs.detachTodoBeam) shared.refs.detachTodoBeam();
      }
    } catch (e) {}
    try { if (shared.refs.shellGlassApply) shared.refs.shellGlassApply(); } catch (e) {} // 玻璃内联样式按开关重跑一次
    try { if (shared.refs.syncThinkingOrb) shared.refs.syncThinkingOrb(); } catch (e) {}
  }

  /* ---- 设置页「界面特效」面板 ---- */
  var SETTINGS_UI_CSS = [
    ".dsh-bg-settings{display:flex;flex-direction:column;gap:14px;max-width:560px;padding-bottom:28px;}",
    ".dsh-bg-card{border:1px solid rgba(128,128,128,.2);border-radius:12px;padding:14px 16px;background:rgba(128,128,128,.05);}",
    ".dsh-bg-sec-title{font-size:13px;font-weight:600;opacity:.9;margin-bottom:10px;letter-spacing:0.2px;}",
    ".dsh-bg-div{border-top:1px solid rgba(128,128,128,.12);margin:14px 0;}",
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
    ".dsh-bg-slider-item{padding:10px 2px;}",
    ".dsh-bg-slider-item+.dsh-bg-slider-item{border-top:1px solid rgba(128,128,128,.08);}",
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
    /* 底部 */
    ".dsh-bg-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:4px;}",
    ".dsh-bg-reset{cursor:pointer;border:1px solid rgba(128,128,128,.25);background:transparent;color:inherit;border-radius:8px;padding:6px 14px;font-size:12px;font-family:inherit;transition:background .15s,border-color .15s;}",
    ".dsh-bg-reset:hover{background:rgba(128,128,128,.1);border-color:rgba(128,128,128,.4);}",
    ".dsh-bg-note{font-size:11px;opacity:.55;line-height:1.5;}",
    "@media (prefers-reduced-motion: reduce){.dsh-bg-meter>div{transition:none;}}"
  ].join("\n");

  function injectSettingsCss() {
    try {
      var tag = document.getElementById("dsh-bg-glass-settings-css");
      if (!tag) {
        tag = document.createElement("style");
        tag.id = "dsh-bg-glass-settings-css";
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
    var rows = [
      { key: "beam", title: "Border Beam 光效", desc: "输入框边界旋转光晕与打字呼吸", level: "mid" },
      { key: "glass", title: "玻璃拟态", desc: "侧边栏/气泡/代码块/计划/任务/审批卡片的 backdrop blur", level: "mid" }
    ];
    var levelText = { high: "高", mid: "中", low: "低" };
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
    function sliderItemBlur() {
      return h("div", { className: "dsh-bg-slider-item" },
        h("div", { className: "dsh-bg-slider-head" },
          h("span", { className: "dsh-bg-item-title" }, "玻璃模糊强度"),
          h("span", { className: "dsh-bg-val-badge" }, snap.blur + " px")),
        h("div", { className: "dsh-bg-item-desc" }, "侧边栏、对话气泡与代码块的背景模糊半径（数值越大磨砂越重、越小越轻透）"),
        h("select", {
          className: "dsh-bg-select dsh-bg-range-select",
          style: { marginTop: "8px" },
          value: snap.blur,
          onChange: function (e) { updateSetting("blur", parseInt(e.target.value, 10)); }
        }, [6, 8, 10, 12].map(function (v) {
          return h("option", { key: v, value: v },
            v + " px" + (v === 6 ? "（轻透磨砂 · 最省）" : v === 8 ? "（标准磨砂）" : v === 10 ? "（柔和毛玻璃）" : "（深度毛玻璃）"));
        })));
    }
    return h("div", { className: "dsh-bg-settings" },
      h("div", { className: "dsh-bg-card" },
        h("div", { className: "dsh-bg-sec-title" }, "估算 GPU 负载"),
        h("div", { className: "dsh-bg-meter-label" },
          h("span", null, "界面特效（UI 层）"),
          h("span", { style: { color: meterColor, fontWeight: 600 } }, gpu + "%")),
        h("div", { className: "dsh-bg-meter" }, h("div", { style: { width: gpu + "%", background: meterColor } })),
        h("div", { className: "dsh-bg-meta" }, "按 模糊半径 × 生效组件数 估算，仅供参考；切换即时生效并自动保存。"),
        h("div", { className: "dsh-bg-div" }),
        h("div", { className: "dsh-bg-sec-title" }, "特效开关"),
        rows.map(rowEl),
        h("div", { className: "dsh-bg-row" },
          h("div", { className: "dsh-bg-row-info" },
            h("div", { className: "dsh-bg-row-title" }, "Thinking Orbs",
              h("span", { className: "dsh-bg-chip", "data-level": "low" }, "低负载")),
            h("div", { className: "dsh-bg-row-desc" }, "状态栏 3D 点阵活动指示器 · 核心交互特性，始终开启"))),
        h("div", { className: "dsh-bg-div" }),
        h("details", { className: "dsh-bg-adv dsh-bg-card" },
          h("summary", null, "渲染质量（高级）"),
          sliderItemBlur())),
      h("div", { className: "dsh-bg-foot" },
        h("button", { type: "button", className: "dsh-bg-reset", onClick: function () { resetSettings(); } }, "恢复默认"),
        h("span", { className: "dsh-bg-note" }, "v__PKG_VERSION__ · 即时生效并自动保存")));
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
          id: "dsh-bg-glass",
          order: 6,
          label: function () { return "界面特效"; }
        }, BgSettingsSection);
      });
    } catch (e) {}
  }

  shared.refs.setupSettingsUi = setupSettingsUi;
}
