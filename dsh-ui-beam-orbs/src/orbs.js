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
      var isDark = shared.refs.getBeamThemeIsDark ? shared.refs.getBeamThemeIsDark() : false;
      if (!isDark) {
        // 浅色主题：不注入状态文字（保留官方原版状态文本），清理已注入的 span
        if (orbTextSpan && statusEl.contains(orbTextSpan)) {
          try { statusEl.removeChild(orbTextSpan); } catch(e){}
          orbTextSpan = null;
        }
        return;
      }
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


