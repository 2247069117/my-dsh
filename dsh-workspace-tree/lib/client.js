/**
 * dsh-workspace-tree — browser half (v3)。
 *
 * v3：工作区 = 目录强绑定。树结构完全由文件系统推导（工作区 path 的目录
 * 层级），会话 cwd 即所在目录（环境隔离），不再有自定义逻辑文件夹。
 *
 * 双模式（标题栏切换，localStorage 记忆）：
 *  - 文件夹模式：完整目录树（含非工作区的中间目录）。工作区节点带标记
 *    （会话计数），点击 = 纯导航到工作区模式并定位该工作区。hover 目录
 *    可「新建会话」（自动注册工作区，会话 cwd = 该目录）或「添加为工作区」。
 *  - 工作区模式：只显示工作区节点（隐藏中间目录），按目录相对层级嵌套，
 *    会话挂各自工作区下，便于会话管理。
 *
 * 与官方共存：priority: -1（shadowing 升序、最低渲染）；不声明 children。
 * 数据：useWorkspaces / useSessions 标准 props；host 零持久化。
 */
window.__ModuleLoader__.load({
  id: "dsh-workspace-tree",
  factory: (require) => {
    "use strict";
    var module = { exports: {} };
    var exports = module.exports;

    const React = require("react");
    const h = React.createElement;
    const { useState, useEffect, useRef, useCallback, useMemo } = React;

    /** Cordis 插件名（与 patch 行 id 一致）。 */
    const name = "dsh-workspace-tree";
    /** 依赖的客户端服务。 */
    const inject = ["slots", "sessions", "workspaces"];

    const LS_MODE = "dsh-workspace-tree.mode";
    const LS_DIRS = "dsh-workspace-tree.dirs";
    const LS_GROUPS = "dsh-workspace-tree.groups";
    const LS_CONFIG = "dsh-workspace-tree.config";

    /** 本插件 Host 路由前缀（避开 /plugins/ 的 client bundle 保留空间）。 */
    const API = "/api/dsh-workspace-tree";

    // ══════════════ 配置 store（localStorage 持久化，订阅通知） ══════════════
    const DEFAULT_CONFIG = {
      /** 插件总开关：关闭后回退官方浏览器（注册级，刷新页面生效）。 */
      enabled: true,
      /** 层级缩进 px：8 / 16 / 24。 */
      indent: 16,
      /** 打开侧栏时默认的模式：folder / workspace。 */
      defaultMode: "workspace",
      /** 状态向上透传（目录/组头聚合状态点）。 */
      showAgg: true,
      /** 文件夹模式工作区节点会话计数角标。 */
      showCount: true
    };
    let configState = null;
    const configListeners = new Set();
    function getConfig() {
      if (configState === null) {
        try {
          const raw = localStorage.getItem(LS_CONFIG);
          configState = Object.assign({}, DEFAULT_CONFIG, raw ? JSON.parse(raw) : {});
        } catch { configState = Object.assign({}, DEFAULT_CONFIG); }
      }
      return configState;
    }
    function setConfig(patch) {
      const next = Object.assign({}, getConfig(), patch);
      configState = next;
      try { localStorage.setItem(LS_CONFIG, JSON.stringify(next)); } catch { /* ignore */ }
      for (const l of configListeners) l(next);
    }
    function subscribeConfig(fn) {
      configListeners.add(fn);
      return () => { configListeners.delete(fn); };
    }
    /** 应用初始模式：本地记忆优先，否则用配置默认。 */
    function initialMode() {
      try {
        const m = localStorage.getItem(LS_MODE);
        if (m === "folder" || m === "workspace") return m;
      } catch { /* ignore */ }
      return getConfig().defaultMode === "folder" ? "folder" : "workspace";
    }

    // ══════════════ Host API ══════════════
    async function apiPost(path, body) {
      const res = await fetch(API + path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      return res.json();
    }

    // ══════════════ 展开状态持久化 ══════════════
    function loadSet(key) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
      } catch { return new Set(); }
    }
    function saveSet(key, set) {
      try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* ignore */ }
    }

    // ══════════════ 官方图标（内联 path，复刻 @deepseek-ai/dsh-client-ui-primitives） ══════════════
    const ICONS = {
      folderOpen: {
        vb: "0 0 16 16",
        paths: [
          { d: "M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68434 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z" },
          { d: "M13.6602 7.75525C13.9618 7.7556 14.1815 8.04179 14.1045 8.33337L13.0508 12.3031C12.9304 12.7567 12.5191 13.0725 12.0498 13.0726H2.91701C2.23744 13.0725 1.7417 12.4287 1.91603 11.7719L2.77834 8.52478C2.89898 8.07146 3.31018 7.75532 3.77931 7.75525H13.6602ZM5.1963 2.95154C5.34985 2.95159 5.49377 3.02803 5.57912 3.15564L6.0508 3.86365C6.39205 4.37553 6.96685 4.68385 7.58205 4.68396H12.1699C12.7416 4.68396 13.2049 5.14754 13.2051 5.71912V6.37439H3.77931C3.02267 6.37444 2.33067 6.72671 1.88283 7.29333V3.98669C1.88299 3.4152 2.34649 2.95168 2.91798 2.95154H5.1963Z", opacity: "0.2" }
        ]
      },
      folderClose: {
        vb: "0 0 16 16",
        d: "M5.05582 0.518756L4.50669 0.86654L5.05582 0.518756ZM13 9.4837L13.65 9.4837L13.65 3.53962L13 3.53962L12.35 3.53962L12.35 9.4837L13 9.4837ZM11.3264 1.86603L11.3264 1.21603L6.52313 1.21603L6.52313 1.86603L6.52313 2.51603L11.3264 2.51603L11.3264 1.86603ZM5.58054 1.34727L6.12968 0.999489L5.60495 0.170972L5.05582 0.518756L4.50669 0.86654L5.03141 1.69506L5.58054 1.34727ZM4.11323 1.23058e-13L4.11323 -0.65L1.67359 -0.65L1.67359 5.00699e-14L1.67359 0.65L4.11323 0.65L4.11323 1.23058e-13ZM0 1.67359L-0.65 1.67359L-0.65 9.4837L0 9.4837L0.65 9.4837L0.65 1.67359L0 1.67359ZM11.3264 11.1573L11.3264 10.5073L1.67359 10.5073L1.67359 11.1573L1.67359 11.8073L11.3264 11.8073L11.3264 11.1573ZM0 9.4837L-0.65 9.4837C-0.65 10.767 0.390308 11.8073 1.67359 11.8073L1.67359 11.1573L1.67359 10.5073C1.10828 10.5073 0.65 10.049 0.65 9.4837L0 9.4837ZM1.67359 5.00699e-14L1.67359 -0.65C0.390307 -0.65 -0.65 0.390309 -0.65 1.67359L0 1.67359L0.65 1.67359C0.65 1.10828 1.10828 0.65 1.67359 0.65L1.67359 5.00699e-14ZM5.05582 0.518756L5.60495 0.170972C5.28121 -0.340193 4.71829 -0.65 4.11323 -0.65L4.11323 1.23058e-13L4.11323 0.65C4.27282 0.65 4.4213 0.731715 4.50669 0.86654L5.05582 0.518756ZM6.52313 1.86603L6.52313 1.21603C6.36354 1.21603 6.21507 1.13431 6.12968 0.999489L5.58054 1.34727L5.03141 1.69506C5.35515 2.20622 5.91808 2.51603 6.52313 2.51603L6.52313 1.86603ZM13 3.53962L13.65 3.53962C13.65 2.25634 12.6097 1.21603 11.3264 1.21603L11.3264 1.86603L11.3264 2.51603C11.8917 2.51603 12.35 2.97431 12.35 3.53962L13 3.53962ZM13 9.4837L12.35 9.4837C12.35 10.049 11.8917 10.5073 11.3264 10.5073L11.3264 11.1573L11.3264 11.8073C12.6097 11.8073 13.65 10.767 13.65 9.4837L13 9.4837Z",
        transform: "translate(1.5 2.429)"
      },
      chevron: {
        vb: "0 0 14 14",
        d: "M4.25 2.82782L4.25 11.1722C4.25 11.6622 4.84243 11.9076 5.18891 11.5611L9.36109 7.38891C9.57588 7.17412 9.57588 6.82588 9.36109 6.61109L5.18891 2.43891C4.84243 2.09243 4.25 2.33782 4.25 2.82782Z"
      },
      ellipsis: {
        vb: "0 0 16 16",
        paths: [
          { d: "M4.55146 8.00001C4.55146 8.63513 4.03659 9.15001 3.40146 9.15001C2.76634 9.15001 2.25146 8.63513 2.25146 8.00001C2.25146 7.36488 2.76634 6.85001 3.40146 6.85001C4.03659 6.85001 4.55146 7.36488 4.55146 8.00001Z" },
          { d: "M9.1476 8.00001C9.1476 8.63513 8.63273 9.15001 7.9976 9.15001C7.36248 9.15001 6.8476 8.63513 6.8476 8.00001C6.8476 7.36488 7.36248 6.85001 7.9976 6.85001C8.63273 6.85001 9.1476 7.36488 9.1476 8.00001Z" },
          { d: "M13.7486 8.00001C13.7486 8.63513 13.2338 9.15001 12.5986 9.15001C11.9635 9.15001 11.4486 8.63513 11.4486 8.00001C11.4486 7.36488 11.9635 6.85001 12.5986 6.85001C13.2338 6.85001 13.7486 7.36488 13.7486 8.00001Z" }
        ]
      },
      plus: { vb: "0 0 16 16", d: "M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z" },
      edit: { vb: "0 0 16 16", d: "M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z" },
      trash: { vb: "0 0 16 16", d: "M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z" },
      archive: {
        vb: "0 0 20 20",
        paths: [
          { d: "M15.8659 2.05975C17.2603 2.05995 18.3913 3.19096 18.3914 4.58527V5.4874C18.3914 6.02747 18.2192 6.52672 17.9303 6.93735C17.9336 6.96524 17.9388 6.99318 17.9388 7.02195V12.8884C17.9388 13.6345 17.9395 14.2379 17.8996 14.7254C17.8642 15.1593 17.7936 15.5499 17.6373 15.9141L17.5654 16.0685C17.278 16.6328 16.8405 17.1046 16.3038 17.434L16.0679 17.5661C15.66 17.7739 15.2196 17.8598 14.7237 17.9003C14.2362 17.9401 13.6327 17.9405 12.8867 17.9405H7.11122C6.36511 17.9405 5.76171 17.9401 5.27418 17.9003C4.84051 17.8649 4.44949 17.7952 4.08545 17.6391L3.93104 17.5661C3.36673 17.2785 2.89392 16.8414 2.56465 16.3044L2.43245 16.0685C2.22473 15.6608 2.13878 15.2211 2.09825 14.7254C2.05841 14.2379 2.05912 13.6345 2.05912 12.8884V7.02195C2.05912 6.99284 2.06422 6.96449 2.06758 6.93629C1.77931 6.52592 1.60858 6.02687 1.60858 5.4874V4.58527C1.60876 3.19084 2.73962 2.05975 4.1341 2.05975H15.8659ZM16.4984 7.92936C16.296 7.98169 16.0847 8.01288 15.8659 8.01291H4.1341C3.91478 8.01291 3.70246 7.98194 3.49955 7.92936V12.8884C3.49955 13.6582 3.50053 14.1927 3.53445 14.608C3.56769 15.0146 3.62923 15.244 3.71635 15.415L3.7925 15.5514C3.98339 15.8627 4.25749 16.1165 4.58464 16.2833L4.72529 16.3435C4.88095 16.3993 5.08638 16.4402 5.39158 16.4651C5.80685 16.4991 6.34138 16.5001 7.11122 16.5001H12.8867C13.6564 16.5001 14.1911 16.499 14.6063 16.4651C15.0128 16.432 15.2423 16.3703 15.4133 16.2833L15.5508 16.2061C15.8618 16.0152 16.116 15.7419 16.2827 15.415L16.3429 15.2732C16.3985 15.1177 16.4396 14.9128 16.4645 14.608C16.4985 14.1927 16.4984 13.6583 16.4984 12.8884V7.92936ZM4.1341 3.50019C3.53511 3.50019 3.0492 3.98631 3.04902 4.58527V5.4874C3.04902 6.08649 3.535 6.57248 4.1341 6.57248H15.8659C16.4648 6.57228 16.951 6.08638 16.951 5.4874V4.58527C16.9509 3.98644 16.4647 3.50038 15.8659 3.50019H4.1341Z" },
          { d: "M12.7962 12.5661V11.0832H7.20548V12.5661L12.7962 12.5661Z" }
        ]
      },
      branch: { vb: "0 0 16 16", d: "M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z", fillRule: "evenodd" },
      newChat: { vb: "0 0 16 16", d: "M8.00003 0.3237C3.76075 0.3237 0.32373 3.76072 0.32373 8C0.32373 9.17603 0.589121 10.2922 1.0632 11.2901L1.35291 11.8989L2.5705 11.3205L2.28079 10.7117C1.89079 9.89074 1.67301 8.97167 1.67301 8C1.67301 4.50546 4.50549 1.67298 8.00003 1.67298C11.4946 1.67298 14.3271 4.50546 14.3271 8C14.3271 11.4945 11.4946 14.327 8.00003 14.327C7.28473 14.327 6.76077 14.277 6.29621 14.1487C5.83857 14.0224 5.40441 13.8109 4.88514 13.4488C4.12569 12.919 3.03778 12.7316 2.141 13.2978L2.12682 13.307L2.11264 13.3171L1.34886 13.854L1.79659 15.188L2.86122 14.4384C3.19068 14.2305 3.68325 14.2542 4.11326 14.5539C4.72789 14.9826 5.30042 15.2724 5.93762 15.4484C6.56803 15.6224 7.22776 15.6763 8.00003 15.6763C12.2393 15.6763 15.6763 12.2393 15.6763 8C15.6763 3.76072 12.2393 0.3237 8.00003 0.3237ZM7.32033 4.82535V7.32536H4.82538V8.67464H7.32033V11.1747H8.6696V8.67464H11.1747V7.32536H8.6696V4.82535H7.32033Z" },
      /** 新建文件夹：官方 folder_close + 右下角加号（自绘组合）。 */
      folderPlus: {
        vb: "0 0 16 16",
        paths: [
          { d: "M5.05582 0.518756L4.50669 0.86654L5.05582 0.518756ZM13 9.4837L13.65 9.4837L13.65 3.53962L13 3.53962L12.35 3.53962L12.35 9.4837L13 9.4837ZM11.3264 1.86603L11.3264 1.21603L6.52313 1.21603L6.52313 1.86603L6.52313 2.51603L11.3264 2.51603L11.3264 1.86603ZM5.58054 1.34727L6.12968 0.999489L5.60495 0.170972L5.05582 0.518756L4.50669 0.86654L5.03141 1.69506L5.58054 1.34727ZM4.11323 1.23058e-13L4.11323 -0.65L1.67359 -0.65L1.67359 5.00699e-14L1.67359 0.65L4.11323 0.65L4.11323 1.23058e-13ZM0 1.67359L-0.65 1.67359L-0.65 9.4837L0 9.4837L0.65 9.4837L0.65 1.67359L0 1.67359ZM11.3264 11.1573L11.3264 10.5073L1.67359 10.5073L1.67359 11.1573L1.67359 11.8073L11.3264 11.8073L11.3264 11.1573ZM0 9.4837L-0.65 9.4837C-0.65 10.767 0.390308 11.8073 1.67359 11.8073L1.67359 11.1573L1.67359 10.5073C1.10828 10.5073 0.65 10.049 0.65 9.4837L0 9.4837ZM1.67359 5.00699e-14L1.67359 -0.65C0.390307 -0.65 -0.65 0.390309 -0.65 1.67359L0 1.67359L0.65 1.67359C0.65 1.10828 1.10828 0.65 1.67359 0.65L1.67359 5.00699e-14ZM5.05582 0.518756L5.60495 0.170972C5.28121 -0.340193 4.71829 -0.65 4.11323 -0.65L4.11323 1.23058e-13L4.11323 0.65C4.27282 0.65 4.4213 0.731715 4.50669 0.86654L5.05582 0.518756ZM6.52313 1.86603L6.52313 1.21603C6.36354 1.21603 6.21507 1.13431 6.12968 0.999489L5.58054 1.34727L5.03141 1.69506C5.35515 2.20622 5.91808 2.51603 6.52313 2.51603L6.52313 1.86603ZM13 3.53962L13.65 3.53962C13.65 2.25634 12.6097 1.21603 11.3264 1.21603L11.3264 1.86603L11.3264 2.51603C11.8917 2.51603 12.35 2.97431 12.35 3.53962L13 3.53962ZM13 9.4837L12.35 9.4837C12.35 10.049 11.8917 10.5073 11.3264 10.5073L11.3264 11.1573L11.3264 11.8073C12.6097 11.8073 13.65 10.767 13.65 9.4837L13 9.4837Z", transform: "translate(1.5 2.429)" },
          { d: "M12 10.8v1.2h1.9v1.2H12v1.2h-1.2v-1.2H8.9v-1.2h1.9v-1.2H12z" }
        ]
      }
    };

    function Icon({ name, size, className, title }) {
      const spec = ICONS[name];
      if (!spec) return null;
      const kids = [];
      const pushPath = (p, key) => {
        const props = { key, d: p.d, fill: "currentColor" };
        if (p.opacity !== void 0) props.opacity = p.opacity;
        if (p.transform) props.transform = p.transform;
        if (p.fillRule) props.fillRule = p.fillRule;
        kids.push(h("path", props));
      };
      if (spec.paths) spec.paths.forEach((p, i) => pushPath(p, "p" + i));
      else pushPath(spec, "p0");
      return h("svg", {
        width: size || 16,
        height: size || 16,
        viewBox: spec.vb,
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className,
        ...(title ? { "aria-label": title, role: "img" } : { "aria-hidden": "true" })
      }, kids);
    }

    // ══════════════ 状态点（官方形态） ══════════════
    const MATRIX_CELLS = [[0, 0], [4, 0], [8, 0], [8, 4], [8, 8], [4, 8], [0, 8], [0, 4]];
    function StatusDot({ state, size }) {
      const s = size || 10;
      if (state === "ongoing") {
        return h("svg", {
          width: s, height: s, viewBox: "0 0 10 10", shapeRendering: "crispEdges", className: "dswt-matrix", "aria-hidden": "true"
        }, MATRIX_CELLS.map(([x, y], i) => h("rect", {
          key: i, x, y, width: 2, height: 2, className: "dswt-cell",
          style: { animationDelay: ((i - MATRIX_CELLS.length) * 125) + "ms" }
        })));
      }
      return h("span", {
        className: "dswt-dot",
        "data-state": state,
        style: { width: s, height: s },
        "aria-hidden": "true"
      });
    }

    /** 会话主状态（官方语义）：等待交互→琥珀；运行→矩阵动画；完成未打开→绿色提醒；空闲→灰。 */
    function sessionState(row, current) {
      if (row.pendingInteraction) return "warning";
      if (row.running) return "ongoing";
      if (row.completed && !current) return "done-reminder";
      return "done";
    }

    /** 相对时间（紧凑中文标签）。 */
    function timeLabel(updatedAt, now) {
      const diff = Math.max(0, now - updatedAt);
      const m = Math.floor(diff / 60000);
      if (m < 1) return "刚刚";
      if (m < 60) return m + "分钟";
      const hours = Math.floor(m / 60);
      if (hours < 24) return hours + "小时";
      const days = Math.floor(hours / 24);
      if (days < 30) return days + "天";
      return Math.floor(days / 30) + "月";
    }

    // ══════════════ 树构建 ══════════════
    function normalizePath(p) {
      let s = String(p || "").replace(/\\/g, "/");
      while (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
      return s;
    }
    function baseName(p) {
      const n = normalizePath(p);
      const i = n.lastIndexOf("/");
      return i >= 0 ? n.slice(i + 1) : n;
    }
    function parentPath(p) {
      const n = normalizePath(p);
      const i = n.lastIndexOf("/");
      if (i <= 0) return null;
      return n.slice(0, i);
    }
    /** 目录节点：{ path, name, ws, children: [node] }。含所有工作区 path 的祖先链。 */
    function buildDirTree(items) {
      const nodes = new Map();
      const ensure = (p) => {
        const n = normalizePath(p);
        if (!nodes.has(n)) nodes.set(n, { path: n, name: baseName(n), ws: null, children: [] });
        return nodes.get(n);
      };
      for (const w of items) {
        let cur = normalizePath(w.path);
        const wsNode = ensure(cur);
        wsNode.ws = w;
        let p = parentPath(cur);
        while (p !== null && p !== "") {
          ensure(cur); // 确保自身存在（首轮已建）
          const par = ensure(p);
          const child = nodes.get(cur);
          if (!par.children.includes(child)) par.children.push(child);
          cur = p;
          p = parentPath(cur);
        }
      }
      // 顶层 = 没有父节点指向它的节点（即其 path 不在任何节点 children 里）
      const childSet = new Set();
      for (const node of nodes.values()) for (const c of node.children) childSet.add(c.path);
      const roots = [...nodes.values()].filter((n) => !childSet.has(n.path));
      // 排序：贴近文件系统直觉，按名称
      const sortNodes = (list) => {
        list.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        for (const n of list) sortNodes(n.children);
      };
      sortNodes(roots);
      return roots;
    }
    /** 工作区相对层级（工作区是工作区子目录时嵌套）。 */
    function buildWorkspaceForest(items) {
      const nodes = items.map((w) => ({ w, path: normalizePath(w.path), children: [] }));
      const top = [];
      for (const n of nodes) {
        let parent = null, bestLen = -1;
        for (const m of nodes) {
          if (m === n || m.path === "/" || m.path === "") continue;
          if (n.path.startsWith(m.path + "/") && m.path.length > bestLen) { parent = m; bestLen = m.path.length; }
        }
        if (parent) parent.children.push(n);
        else top.push(n);
      }
      return top;
    }

    /** 可见会话：排除已归档、已硬删与未选中的空白会话。 */
    function visibleSessionIds(ids, sessions, archived, hardDeleted) {
      const byId = sessions.byId || {};
      return ids.filter((sid) => {
        const row = byId[sid];
        if (!row) return false;
        if (archived.has(sid)) return false;
        if (hardDeleted && hardDeleted.has(sid)) return false;
        if (row.blank && sid !== sessions.current) return false;
        return true;
      });
    }

    // ══════════════ 会话状态向上透传（聚合） ══════════════
    /** 聚合优先级：等待交互 > 运行中 > 完成未读。 */
    const AGG_PRIO = { warning: 3, ongoing: 2, "done-reminder": 1 };
    function aggPriority(st) {
      return st === null || st === void 0 ? 0 : (AGG_PRIO[st] || 0);
    }
    /** 一组会话的聚合状态（取最高优先级）。 */
    function aggOfSessionIds(ids, sessions, archived) {
      const byId = sessions.byId || {};
      let best = null;
      for (const sid of ids || []) {
        const row = byId[sid];
        if (!row) continue;
        if (archived.has(sid)) continue;
        if (row.blank && sid !== sessions.current) continue;
        const st = sessionState(row, sid === sessions.current);
        if (aggPriority(st) > aggPriority(best)) best = st;
        if (best === "warning") return best;
      }
      return best;
    }
    /**
     * 自底向上为树节点装饰 aggState：节点状态 = max(自身工作区会话状态,
     * 全部后代节点状态)。支持目录树（dirNode: ws/children）与工作区树（wsNode: w/children）。
     */
    function decorateAgg(node, wsOf, childrenOf, sessions, archived) {
      let best = null;
      const w = wsOf(node);
      if (w) best = aggOfSessionIds(w.sessionIds, sessions, archived);
      for (const c of childrenOf(node)) {
        const cs = decorateAgg(c, wsOf, childrenOf, sessions, archived);
        if (aggPriority(cs) > aggPriority(best)) best = cs;
      }
      node.aggState = best;
      return best;
    }

    // ══════════════ 行内输入 ══════════════
    function InlineInput({ initial, placeholder, onCommit, onCancel }) {
      const [value, setValue] = useState(initial || "");
      const inputRef = useRef(null);
      useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
      const commit = () => {
        const v = value.trim();
        if (v) onCommit(v); else onCancel();
      };
      return h("input", {
        ref: inputRef,
        className: "dswt-inline",
        value,
        placeholder,
        onChange: (e) => setValue(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onCancel();
        },
        onBlur: commit
      });
    }

    // ══════════════ 文件夹模式：目录节点 ══════════════
    function DirNode({ node, depth, indent, showAgg, showCount, expandedDirs, toggleDir, onNavToWorkspace, onNewSessionInDir, onAddWorkspaceDir, onNewDir, onCancelNewDir, newDirAt, onRenameWs, onDeleteWs, sessions, archived }) {
      const isWs = node.ws !== null;
      const open = expandedDirs.has(node.path);
      const hasChildren = node.children.length > 0;
      const wsSessionCount = isWs ? visibleSessionIds(node.ws.sessionIds, sessions, archived).length : 0;
      return h("div", { className: "dswt-dir" }, [
        h("div", {
          key: "rw",
          className: "dswt-projectRow" + (isWs ? " dswt-wsRow" : " dswt-dirRow"),
          style: { paddingLeft: 8 + depth * indent },
          role: "treeitem",
          "aria-expanded": open,
          onClick: () => {
            if (isWs) { onNavToWorkspace(node.ws); return; }
            if (hasChildren) toggleDir(node.path);
          }
        }, [
          h("span", { key: "ic", className: "dswt-slot dswt-folderIcon" }, [
            h(Icon, { name: isWs ? "folderOpen" : "folderClose", size: 16, className: "dswt-folderSvg" }),
            hasChildren && h("span", { className: "dswt-chevronOverlay" + (open ? " dswt-arrowOpen" : ""), onClick: (e) => { e.stopPropagation(); toggleDir(node.path); } }, h(Icon, { name: "chevron", size: 12 }))
          ]),
          h("span", { key: "nm", className: "dswt-title dswt-dirTitle", title: node.path }, node.name),
          showAgg && node.aggState && h("span", { key: "ag", className: "dswt-slot dswt-aggSlot", title: node.aggState === "warning" ? "有待处理交互" : node.aggState === "ongoing" ? "有会话运行中" : "有会话已完成" }, h(StatusDot, { state: node.aggState, size: 8 })),
          isWs && showCount && h("span", { key: "ct", className: "dswt-dirCount", title: node.path }, String(wsSessionCount)),
          h("span", { key: "ac", className: "dswt-rowActions", onClick: (e) => e.stopPropagation() }, [
            h("button", { key: "nd", type: "button", className: "dswt-iconButton", title: "新建文件夹（自动注册为工作区）", onClick: () => onNewDir(node.path) }, h(Icon, { name: "folderPlus", size: 14 })),
            isWs
              ? [
                  h("button", { key: "ns", type: "button", className: "dswt-iconButton", title: "新建会话（cwd=该目录）", onClick: () => onNewSessionInDir(node.ws.workspaceId, node.path) }, h(Icon, { name: "newChat", size: 14 })),
                  h("button", { key: "rn", type: "button", className: "dswt-iconButton", title: "重命名工作区", onClick: () => onRenameWs(node.ws) }, h(Icon, { name: "edit", size: 14 })),
                  h("button", { key: "dl", type: "button", className: "dswt-iconButton dswt-danger", title: "删除工作区", onClick: () => onDeleteWs(node.ws) }, h(Icon, { name: "trash", size: 14 }))
                ]
              : [
                  h("button", { key: "ns", type: "button", className: "dswt-iconButton", title: "新建会话（自动注册工作区，cwd=该目录）", onClick: () => onNewSessionInDir(null, node.path) }, h(Icon, { name: "newChat", size: 14 })),
                  h("button", { key: "aw", type: "button", className: "dswt-iconButton", title: "添加为工作区", onClick: () => onAddWorkspaceDir(node.path) }, h(Icon, { name: "folderOpen", size: 14 }))
                ]
          ])
        ]),
        newDirAt === node.path && h(InlineInput, {
          key: "ndi",
          initial: "",
          placeholder: "子文件夹名",
          onCommit: (v) => onNewDir && onNewDir(node.path, v),
          onCancel: onCancelNewDir
        }),
        open && node.children.map((child) => h(DirNode, {
          key: child.path,
          node: child,
          depth: depth + 1,
          indent,
          showAgg,
          showCount,
          expandedDirs,
          toggleDir,
          onNavToWorkspace,
          onNewSessionInDir,
          onAddWorkspaceDir,
          onNewDir,
          onCancelNewDir,
          newDirAt,
          onRenameWs,
          onDeleteWs,
          sessions,
          archived
        }))
      ]);
    }

    // ══════════════ 工作区模式：会话行 ══════════════
    function SessionRow({ sid, sessions, depth, indent, now, onOpen, onRename, onArchive, onDelete }) {
      const row = sessions.byId[sid];
      if (!row) return null;
      const selected = sid === sessions.current;
      const dotState = sessionState(row, selected);
      return h("div", {
        className: "dswt-session" + (selected ? " dswt-selected" : ""),
        style: { paddingLeft: 8 + depth * indent },
        role: "treeitem",
        "aria-selected": selected,
        onClick: () => onOpen(sid),
        title: row.displayTitle
      }, [
        h("span", { key: "st", className: "dswt-slot" }, h(StatusDot, { state: dotState })),
        h("span", { key: "ti", className: "dswt-title", title: row.displayTitle }, row.displayTitle),
        !row.blank && h("span", { key: "tm", className: "dswt-time" }, timeLabel(row.updatedAt, now)),
        !row.blank && h("span", { key: "ac", className: "dswt-rowActions", onClick: (e) => e.stopPropagation() }, [
          h("button", { key: "rn", type: "button", className: "dswt-iconButton", title: "重命名", onClick: () => onRename(sid, row.displayTitle) }, h(Icon, { name: "edit", size: 14 })),
          h("button", { key: "del", type: "button", className: "dswt-iconButton dswt-danger", title: "删除会话（移至归档）", onClick: () => onDelete(sid, row.displayTitle) }, h(Icon, { name: "trash", size: 14 })),
          h("button", { key: "ar", type: "button", className: "dswt-iconButton", title: "归档", onClick: () => onArchive(sid) }, h(Icon, { name: "archive", size: 14 }))
        ])
      ]);
    }

    // ══════════════ 删除确认弹窗（会话） ══════════════
    function DeleteSessionModal({ open, sessionTitle, busy, onCancel, onConfirm }) {
      const overlayRef = useRef(null);
      useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [open, onCancel]);
      useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
      }, [open]);
      if (!open) return null;
      const handleOverlay = (e) => { if (e.target === overlayRef.current) onCancel(); };
      return h("div", {
        ref: overlayRef,
        className: "dswt-modalOverlay",
        role: "presentation",
        onClick: handleOverlay
      }, [
        h("div", {
          key: "panel",
          className: "dswt-modalPanel",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "dswt-del-title",
          onClick: (e) => e.stopPropagation()
        }, [
          h("div", { key: "t", id: "dswt-del-title", className: "dswt-modalTitle" }, "删除会话"),
          h("div", { key: "b", className: "dswt-modalBody" }, [
            "确定要删除会话 ",
            h("span", { className: "dswt-modalStrong" }, "“" + (sessionTitle || "") + "”"),
            " 吗？\u000a此操作将把会话移至归档（从列表中移除），可在归档中找回。该操作不可撤销时请谨慎。"
          ]),
          h("div", { key: "a", className: "dswt-modalActions" }, [
            h("button", { key: "c", type: "button", className: "dswt-modalBtn", disabled: !!busy, onClick: onCancel }, "取消"),
            h("button", { key: "o", type: "button", className: "dswt-modalBtn dswt-modalBtnDanger", disabled: !!busy, onClick: onConfirm }, busy ? "删除中…" : "确认删除")
          ])
        ])
      ]);
    }

    // ══════════════ 重命名弹窗（会话/工作区 共用） ══════════════
    function RenameModal({ open, kind, initialTitle, draft, busy, onDraftChange, onCancel, onConfirm }) {
      const overlayRef = useRef(null);
      const inputRef = useRef(null);
      useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [open, onCancel]);
      useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
      }, [open]);
      useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => { if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, 20);
        return () => clearTimeout(t);
      }, [open, kind]);
      if (!open) return null;
      const title = kind === "workspace" ? "重命名工作区" : "重命名会话";
      const trimmed = (draft || "").trim();
      const initialTrim = (initialTitle || "").trim();
      const canConfirm = !busy && trimmed.length > 0 && trimmed !== initialTrim;
      const handleOverlay = (e) => { if (e.target === overlayRef.current) onCancel(); };
      const handleKey = (e) => {
        if (e.key === "Enter" && canConfirm) { e.preventDefault(); onConfirm(); }
      };
      return h("div", {
        ref: overlayRef,
        className: "dswt-modalOverlay",
        role: "presentation",
        onClick: handleOverlay
      }, [
        h("div", {
          key: "panel",
          className: "dswt-modalPanel",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "dswt-rename-title",
          onClick: (e) => e.stopPropagation()
        }, [
          h("div", { key: "t", id: "dswt-rename-title", className: "dswt-modalTitle" }, title),
          h("div", { key: "b", className: "dswt-modalBody" }, kind === "workspace" ? "输入新的工作区名称" : "输入新的会话名称"),
          h("input", {
            key: "i",
            ref: inputRef,
            className: "dswt-modalInput",
            value: draft,
            placeholder: kind === "workspace" ? "工作区名称" : "会话名称",
            disabled: !!busy,
            onChange: (e) => onDraftChange(e.target.value),
            onKeyDown: handleKey
          }),
          h("div", { key: "a", className: "dswt-modalActions" }, [
            h("button", { key: "c", type: "button", className: "dswt-modalBtn", disabled: !!busy, onClick: onCancel }, "取消"),
            h("button", { key: "o", type: "button", className: "dswt-modalBtn dswt-modalBtnPrimary", disabled: !canConfirm, onClick: onConfirm }, busy ? "保存中…" : "确认")
          ])
        ])
      ]);
    }

    // ══════════════ 归档视图：会话行 ══════════════
    function ArchiveSessionRow({ sid, sessions, onRestore, onDelete }) {
      const row = sessions.byId[sid];
      if (!row) return null;
      return h("div", {
        className: "dswt-session dswt-archivedRow",
        role: "treeitem",
        title: row.displayTitle,
        onClick: () => {}
      }, [
        h("span", { key: "st", className: "dswt-slot" }, h(StatusDot, { state: sessionState(row, false) })),
        h("span", { key: "ti", className: "dswt-title", title: row.displayTitle }, row.displayTitle),
        h("span", { key: "tm", className: "dswt-time" }, timeLabel(row.updatedAt, Date.now())),
        h("span", { key: "ac", className: "dswt-rowActions", onClick: (e) => e.stopPropagation() }, [
          h("button", { key: "rs", type: "button", className: "dswt-iconButton", title: "恢复", onClick: () => onRestore(sid) }, h(Icon, { name: "newChat", size: 14 })),
          h("button", { key: "del", type: "button", className: "dswt-iconButton dswt-danger", title: "永久删除", onClick: () => onDelete(sid) }, h(Icon, { name: "trash", size: 14 }))
        ])
      ]);
    }

    // ══════════════ 归档确认弹窗（通用） ══════════════
    function ArchiveConfirmModal({ open, title, desc, confirmText, danger, busy, onCancel, onConfirm }) {
      const overlayRef = useRef(null);
      useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [open, onCancel]);
      useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
      }, [open]);
      if (!open) return null;
      const handleOverlay = (e) => { if (e.target === overlayRef.current) onCancel(); };
      return h("div", { ref: overlayRef, className: "dswt-modalOverlay", role: "presentation", onClick: handleOverlay }, [
        h("div", { key: "panel", className: "dswt-modalPanel", role: "dialog", "aria-modal": "true", onClick: (e) => e.stopPropagation() }, [
          h("div", { key: "t", className: "dswt-modalTitle" }, title || "确认"),
          h("div", { key: "b", className: "dswt-modalBody" }, desc || ""),
          h("div", { key: "a", className: "dswt-modalActions" }, [
            h("button", { key: "c", type: "button", className: "dswt-modalBtn", disabled: !!busy, onClick: onCancel }, "取消"),
            h("button", { key: "o", type: "button", className: "dswt-modalBtn " + (danger ? "dswt-modalBtnDanger" : "dswt-modalBtnPrimary"), disabled: !!busy, onClick: onConfirm }, busy ? "处理中…" : (confirmText || "确认"))
          ])
        ])
      ]);
    }

    // ══════════════ 归档视图：按工作区分组 ══════════════
    function ArchiveView({ sessions, workspaces, wsForest, archived, onRestoreOne, onDeleteOne, onRestoreGroup, onDeleteGroup, onRestoreAll, onDeleteAll, busy }) {
      const archivedSet = archived;
      // 按 wsForest 结构过滤出含归档的组
      const byId = sessions.byId || {};
      const isArchivedVisible = (id) => archivedSet.has(id) && !!byId[id] && !byId[id].blank;
      const groups = [];
      const accounted = new Set();
      for (const node of wsForest) {
        const sids = (node.w.sessionIds || []).filter(isArchivedVisible);
        if (sids.length > 0) groups.push({ node, sids });
        for (const sid of (node.w.sessionIds || [])) accounted.add(sid);
      }
      // 递归收集子工作区归档
      const collectChildren = (node, out) => {
        for (const child of node.children || []) {
          const sids = (child.w.sessionIds || []).filter(isArchivedVisible);
          if (sids.length > 0) out.push({ node: child, sids });
          collectChildren(child, out);
        }
      };
      const allGroups = [];
      for (const g of groups) { allGroups.push(g); collectChildren(g.node, allGroups); }
      // 未分组归档（仅已归档且存在）
      const ungrouped = (sessions.ids || []).filter((sid) => isArchivedVisible(sid) && !accounted.has(sid));
      const total = (sessions.ids || []).filter(isArchivedVisible).length;
      const hasAny = total > 0;
      return h("div", { className: "dswt-archiveRoot" }, [
        h("div", { key: "tb", className: "dswt-archiveToolbar" }, [
          h("div", { key: "top", className: "dswt-archiveToolbarTop" }, [
            h("span", { key: "ct", className: "dswt-archiveCount" }, hasAny ? "共 " + total + " 条归档" : "暂无归档会话")
          ]),
          hasAny && h("div", { key: "actions", className: "dswt-archiveToolbarActions" }, [
            h("button", { key: "ra", type: "button", className: "dswt-archiveBtn dswt-archiveBtnSecondary", disabled: !!busy, title: "一键恢复所有", onClick: onRestoreAll }, "一键恢复所有"),
            h("button", { key: "da", type: "button", className: "dswt-archiveBtn dswt-archiveBtnDanger", disabled: !!busy, title: "一键删除所有", onClick: onDeleteAll }, "一键删除所有")
          ])
        ]),
        hasAny ? null : h("div", { key: "empty", className: "dswt-empty" }, "归档为空 — 归档的会话会在此按工作区分组显示"),
        allGroups.map(({ node, sids }) => h("div", { key: node.w.workspaceId, className: "dswt-groupSection" }, [
          h("div", { key: "hd", className: "dswt-projectRow" }, [
            h("span", { key: "ic", className: "dswt-slot dswt-folderIcon" }, h(Icon, { name: "folderOpen", size: 16, className: "dswt-folderSvg" })),
            h("span", { key: "pt", className: "dswt-projectText" }, h("span", { className: "dswt-title" }, (node.w.title || baseName(node.w.path)) + " · " + sids.length + " 条")),
            h("span", { key: "ac", className: "dswt-rowActions", style: { display: "inline-flex" } }, [
              h("button", { key: "rs", type: "button", className: "dswt-iconButton", title: "恢复该工作区全部", disabled: !!busy, onClick: () => onRestoreGroup(node.w.workspaceId) }, h(Icon, { name: "newChat", size: 14 })),
              h("button", { key: "dl", type: "button", className: "dswt-iconButton dswt-danger", title: "永久删除该工作区全部", disabled: !!busy, onClick: () => onDeleteGroup(node.w.workspaceId) }, h(Icon, { name: "trash", size: 14 }))
            ])
          ]),
          h("div", { key: "bd", className: "dswt-groupBody", style: { "--dswt-line-x": "16px" } }, sids.map((sid) => h(ArchiveSessionRow, { key: sid, sid, sessions, onRestore: onRestoreOne, onDelete: onDeleteOne })))
        ])),
        ungrouped.length > 0 && h("div", { key: "ug", className: "dswt-ungrouped" }, [
          h("div", { key: "t", className: "dswt-ungroupedTitle" }, "未分组归档 · " + ungrouped.length + " 条"),
          h("div", { key: "ac", className: "dswt-archiveToolbarActions", style: { margin: "4px 0 6px 8px" } }, [
            h("button", { key: "rs", type: "button", className: "dswt-archiveBtn dswt-archiveBtnSecondary", disabled: !!busy, onClick: () => onRestoreGroup(null) }, "恢复全部"),
            h("button", { key: "dl", type: "button", className: "dswt-archiveBtn dswt-archiveBtnDanger", disabled: !!busy, onClick: () => onDeleteGroup(null) }, "删除全部")
          ]),
          ungrouped.map((sid) => h(ArchiveSessionRow, { key: sid, sid, sessions, onRestore: onRestoreOne, onDelete: onDeleteOne }))
        ])
      ]);
    }

    // ══════════════ 工作区模式：组 ══════════════
    function WorkspaceGroup({ node, depth, indent, showAgg, sessions, archived, hardDeleted, expandedGroups, toggleGroup, onNewSession, onRenameWs, onDeleteWs, onOpen, onRenameSession, onArchiveSession, onDeleteSession, now }) {
      const w = node.w;
      const gkey = w.workspaceId;
      const groupOpen = expandedGroups.has(gkey);
      const sids = visibleSessionIds(w.sessionIds, sessions, archived, hardDeleted);
      const isRenaming = false; // 重命名行内输入在组头下方渲染，简化用 prompt
      return h("div", {
        className: "dswt-groupSection",
        "data-wsid": gkey
      }, [
        h("div", {
          key: "hd",
          className: "dswt-projectRow",
          style: { paddingLeft: 8 + depth * indent },
          role: "treeitem",
          "aria-expanded": groupOpen,
          onClick: () => toggleGroup(gkey)
        }, [
          // 单图标位：文件夹图标与 chevron 叠加同一 slot（hover 时切换，官方风格），
          // 与会话行的状态点 slot 对齐 → 同层 title 严格对齐
          h("span", { key: "ic", className: "dswt-slot dswt-folderIcon" }, [
            h(Icon, { name: groupOpen ? "folderOpen" : "folderClose", size: 16, className: "dswt-folderSvg" }),
            h("span", { className: "dswt-chevronOverlay" + (groupOpen ? " dswt-arrowOpen" : "") }, h(Icon, { name: "chevron", size: 12 }))
          ]),
          h("span", { key: "pt", className: "dswt-projectText" }, h("span", { className: "dswt-title" }, w.title || baseName(w.path))),
          showAgg && node.aggState && h("span", { key: "ag", className: "dswt-slot dswt-aggSlot", title: node.aggState === "warning" ? "有待处理交互" : node.aggState === "ongoing" ? "有会话运行中" : "有会话已完成" }, h(StatusDot, { state: node.aggState, size: 8 })),
          h("span", { key: "ac", className: "dswt-rowActions", onClick: (e) => e.stopPropagation() }, [
            h("button", { key: "ns", type: "button", className: "dswt-iconButton", title: "新建会话", onClick: () => onNewSession(w.workspaceId) }, h(Icon, { name: "newChat", size: 14 })),
            h("button", { key: "rn", type: "button", className: "dswt-iconButton", title: "重命名工作区", onClick: () => onRenameWs(w) }, h(Icon, { name: "edit", size: 14 })),
            h("button", { key: "dl", type: "button", className: "dswt-iconButton dswt-danger", title: "删除工作区", onClick: () => onDeleteWs(w) }, h(Icon, { name: "trash", size: 14 }))
          ])
        ]),
        groupOpen && h("div", { key: "bd", className: "dswt-groupBody", style: { "--dswt-line-x": (16 + depth * indent) + "px" } }, [
          sids.map((sid) => h(SessionRow, {
            key: "s:" + sid, sid, sessions, depth: depth + 1, indent, now, onOpen,
            onRename: onRenameSession, onArchive: onArchiveSession, onDelete: onDeleteSession
          })),
          node.children.map((child) => h(WorkspaceGroup, {
            key: child.w.workspaceId, node: child, depth: depth + 1, indent, showAgg, sessions, archived, hardDeleted,
            expandedGroups, toggleGroup, onNewSession, onRenameWs, onDeleteWs,
            onOpen, onRenameSession, onArchiveSession, onDeleteSession, now
          }))
        ])
      ]);
    }

    // ══════════════ 主组件 ══════════════
    function WorkspaceTreeBrowser(props) {
      const { wide, expandSidebar, useSessions, useWorkspaces, startSession, connectWorkspace, createSession, open, renameSession, forkSession, renameWorkspace, deleteWorkspace, archiveSession, createWorkspace, pickDirectory } = props;
      const sessions = useSessions((s) => s);
      const workspaces = useWorkspaces((s) => s);

      const [mode, setMode] = useState(initialMode);
      const [expandedDirs, setExpandedDirs] = useState(() => loadSet(LS_DIRS));
      const [expandedGroups, setExpandedGroups] = useState(() => loadSet(LS_GROUPS));
      const [navTarget, setNavTarget] = useState(null);
      const [newDirAt, setNewDirAt] = useState(null);
      const [swapFrom, setSwapFrom] = useState(null);
      const [pendingDelete, setPendingDelete] = useState(null);
      const [deleteBusy, setDeleteBusy] = useState(false);
      const [renameTarget, setRenameTarget] = useState(null);
      const [renameDraft, setRenameDraft] = useState("");
      const [renameBusy, setRenameBusy] = useState(false);
      const [archiveConfirm, setArchiveConfirm] = useState(null);
      const [archiveBusy, setArchiveBusy] = useState(false);
      const [hardDeleted, setHardDeleted] = useState(() => new Set());
      const [cfg, setCfg] = useState(getConfig);
      const groupsInited = useRef(false);
      const now = Date.now();

      // 配置订阅：设置页修改后本组件实时刷新
      useEffect(() => subscribeConfig(setCfg), []);

      // 首次进入工作区模式：默认展开所有组（用户可折叠，状态记忆）
      useEffect(() => {
        const items = workspaces.items || [];
        if (!groupsInited.current && items.length > 0) {
          groupsInited.current = true;
          const all = items.map((w) => w.workspaceId);
          setExpandedGroups((prev) => {
            if (prev.size === 0) {
              saveSet(LS_GROUPS, all);
              return new Set(all);
            }
            return prev;
          });
        }
      }, [workspaces.items]);

      // 标题切换动画清理：旧文字滑出动画结束后复位 swapFrom
      useEffect(() => {
        if (swapFrom === null) return;
        const t = setTimeout(() => setSwapFrom(null), 300);
        return () => clearTimeout(t);
      }, [swapFrom]);

      const toggleDir = useCallback((path) => {
        setExpandedDirs((prev) => {
          const next = new Set(prev);
          if (next.has(path)) next.delete(path); else next.add(path);
          saveSet(LS_DIRS, next);
          return next;
        });
      }, []);

      const toggleGroup = useCallback((key) => {
        setExpandedGroups((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key); else next.add(key);
          saveSet(LS_GROUPS, next);
          return next;
        });
      }, []);

      const switchMode = useCallback((m) => {
        setMode(m);
        if (m !== "archive") {
          try { localStorage.setItem(LS_MODE, m); } catch { /* ignore */ }
        }
      }, []);

      const toggleArchive = useCallback(() => {
        if (swapFrom !== null) return;
        if (mode === "archive") {
          let back = "workspace";
          try {
            const m = localStorage.getItem(LS_MODE);
            if (m === "folder" || m === "workspace") back = m;
            else back = getConfig().defaultMode === "folder" ? "folder" : "workspace";
          } catch { /* ignore */ }
          setSwapFrom(mode);
          switchMode(back);
        } else {
          setSwapFrom(mode);
          switchMode("archive");
        }
      }, [mode, swapFrom, switchMode]);

      /** 文件夹模式点击工作区节点 → 纯导航：切工作区模式 + 展开该组 + 滚动定位。 */
      const navToWorkspace = useCallback((ws) => {
        switchMode("workspace");
        setNavTarget(ws.workspaceId);
        setExpandedGroups((prev) => {
          const next = new Set(prev);
          next.add(ws.workspaceId);
          saveSet(LS_GROUPS, next);
          return next;
        });
      }, [switchMode]);

      // 导航定位：等渲染完成后滚动到目标组头
      useEffect(() => {
        if (navTarget === null) return;
        const timer = setTimeout(() => {
          try {
            const el = document.querySelector(".dswt-groupSection[data-wsid=\"" + navTarget + "\"]");
            if (el) el.scrollIntoView({ block: "nearest" });
          } catch { /* ignore */ }
          setNavTarget(null);
        }, 60);
        return () => clearTimeout(timer);
      }, [navTarget, mode]);

      /** 在目录下新建会话（隔离核心）：cwd = 目录。目录未注册工作区时自动注册。 */
      const newSessionInDir = useCallback(async (workspaceIdOrNull, dirPath) => {
        try {
          let sid;
          if (workspaceIdOrNull !== null) {
            sid = await connectWorkspace(workspaceIdOrNull);
          } else {
            sid = await createSession({ cwd: dirPath });
          }
          open(sid);
        } catch (error) {
          window.alert("新建会话失败: " + String((error && error.message) || error));
        }
      }, [connectWorkspace, createSession, open]);

      const addWorkspaceDir = useCallback(async (dirPath) => {
        try {
          await createWorkspace({ path: dirPath });
        } catch (error) {
          window.alert("添加工作区失败: " + String((error && error.message) || error));
        }
      }, [createWorkspace]);

      /** 新建文件夹：真实创建子目录（走本插件 host mkdir，绕开官方 browse 能力）
       *  → 自动注册为工作区（工作区=目录强绑定）→ 展开父目录。 */
      const commitNewDir = useCallback(async (parentPath, name) => {
        try {
          const data = await apiPost("/mkdir", { parent: parentPath, name });
          if (data.ok !== true) throw new Error(data.error || "创建失败");
          await createWorkspace({ path: data.path });
          setExpandedDirs((prev) => {
            const next = new Set(prev);
            next.add(parentPath);
            saveSet(LS_DIRS, next);
            return next;
          });
          setNewDirAt(null);
        } catch (error) {
          window.alert("新建文件夹失败: " + String((error && error.message) || error));
        }
      }, [createWorkspace]);

      const onRequestRenameWs = useCallback((w) => {
        const initial = w.title || baseName(w.path);
        setRenameTarget({ kind: "workspace", id: w.workspaceId, initial, ws: w });
        setRenameDraft(initial);
        setRenameBusy(false);
      }, []);

      const onRequestRenameSession = useCallback((sessionId, currentTitle) => {
        const initial = currentTitle || "";
        setRenameTarget({ kind: "session", id: sessionId, initial });
        setRenameDraft(initial);
        setRenameBusy(false);
      }, []);

      const onCancelRename = useCallback(() => {
        if (renameBusy) return;
        setRenameTarget(null);
      }, [renameBusy]);

      const onConfirmRename = useCallback(async () => {
        if (!renameTarget) return;
        const trimmed = (renameDraft || "").trim();
        const initialTrim = (renameTarget.initial || "").trim();
        if (!trimmed || trimmed === initialTrim) {
          if (trimmed === initialTrim) setRenameTarget(null);
          return;
        }
        setRenameBusy(true);
        try {
          if (renameTarget.kind === "workspace") {
            await renameWorkspace(renameTarget.id, trimmed);
          } else {
            await renameSession(renameTarget.id, trimmed);
          }
          setRenameTarget(null);
        } catch (error) {
          window.alert(String((error && error.message) || error));
        } finally {
          setRenameBusy(false);
        }
      }, [renameTarget, renameDraft, renameWorkspace, renameSession]);

      // 兼容旧命名：供未改造的调用点（若有）仍可用新弹窗
      const onRenameWs = onRequestRenameWs;
      const onRenameSession = onRequestRenameSession;

      const onDeleteWs = useCallback((w) => {
        if (!window.confirm("删除该工作区注册？目录与会话日志不受影响，会话将落入未分组。")) return;
        deleteWorkspace(w.workspaceId).catch((error) => {
          window.alert(String((error && error.message) || error));
        });
      }, [deleteWorkspace]);

      const onArchiveSession = useCallback((sessionId) => {
        archiveSession(sessionId).catch((error) => {
          window.alert(String((error && error.message) || error));
        });
      }, [archiveSession]);

      const onRequestDeleteSession = useCallback((sessionId, title) => {
        setPendingDelete({ id: sessionId, title: title || sessionId });
        setDeleteBusy(false);
      }, []);

      const onCancelDeleteSession = useCallback(() => {
        if (deleteBusy) return;
        setPendingDelete(null);
      }, [deleteBusy]);

      const onConfirmDeleteSession = useCallback(async () => {
        if (!pendingDelete) return;
        setDeleteBusy(true);
        try {
          await archiveSession(pendingDelete.id);
          setPendingDelete(null);
        } catch (error) {
          window.alert("删除会话失败: " + String((error && error.message) || error));
        } finally {
          setDeleteBusy(false);
        }
      }, [pendingDelete, archiveSession]);

      // 归档集合：归档视图与硬删过滤共用（下方回调的依赖数组渲染期即求值，须先于此声明）
      const archived = new Set(workspaces.archivedSessionIds || []);

      // 归档视图操作：单条 / 按组 / 全部 的恢复与删除（删除=硬删）
      const onRestoreOne = useCallback((sid) => {
        const t = (sessions.byId[sid] && sessions.byId[sid].displayTitle) || sid;
        setArchiveConfirm({ kind: "restoreOne", sessionId: sid, title: t });
      }, [sessions]);
      const onDeleteOne = useCallback((sid) => {
        const t = (sessions.byId[sid] && sessions.byId[sid].displayTitle) || sid;
        setArchiveConfirm({ kind: "deleteOne", sessionId: sid, title: t });
      }, [sessions]);
      const onRestoreGroup = useCallback((workspaceId) => {
        if (workspaceId === null) {
          setArchiveConfirm({ kind: "restoreGroup", workspaceId: null, title: "未分组" });
        } else {
          const ws = (workspaces.items || []).find((w) => w.workspaceId === workspaceId);
          const title = ws ? (ws.title || baseName(ws.path)) : workspaceId;
          setArchiveConfirm({ kind: "restoreGroup", workspaceId, title });
        }
      }, [workspaces]);
      const onDeleteGroup = useCallback((workspaceId) => {
        if (workspaceId === null) {
          setArchiveConfirm({ kind: "deleteGroup", workspaceId: null, title: "未分组" });
        } else {
          const ws = (workspaces.items || []).find((w) => w.workspaceId === workspaceId);
          const title = ws ? (ws.title || baseName(ws.path)) : workspaceId;
          setArchiveConfirm({ kind: "deleteGroup", workspaceId, title });
        }
      }, [workspaces]);
      const onRestoreAll = useCallback(() => setArchiveConfirm({ kind: "restoreAll" }), []);
      const onDeleteAll = useCallback(() => setArchiveConfirm({ kind: "deleteAll" }), []);
      const onCancelArchiveConfirm = useCallback(() => { if (archiveBusy) return; setArchiveConfirm(null); }, [archiveBusy]);
      const onConfirmArchiveConfirm = useCallback(async () => {
        if (!archiveConfirm) return;
        setArchiveBusy(true);
        try {
          const k = archiveConfirm.kind;
          let toDelete = [];
          if (k === "deleteOne") toDelete = [archiveConfirm.sessionId];
          else if (k === "deleteGroup") {
            if (archiveConfirm.workspaceId === null) {
              const accounted = new Set();
              for (const w of (workspaces.items || [])) for (const sid of (w.sessionIds || [])) accounted.add(String(sid));
              toDelete = (sessions.ids || []).filter((sid) => archived.has(sid) && !accounted.has(String(sid)));
            } else {
              const ws = (workspaces.items || []).find((w) => w.workspaceId === archiveConfirm.workspaceId);
              toDelete = ((ws && ws.sessionIds) || []).filter((id) => archived.has(id));
            }
          } else if (k === "deleteAll") {
            toDelete = [...archived];
          }
          if (k === "restoreOne") {
            const r = await apiPost("/archive/unarchive", { sessionId: archiveConfirm.sessionId });
            if (!r.ok) throw new Error(r.error || "恢复失败");
          } else if (k === "deleteOne") {
            const r = await apiPost("/archive/delete", { sessionId: archiveConfirm.sessionId });
            if (!r.ok) throw new Error(r.error || "删除失败");
            setHardDeleted((prev) => { const n = new Set(prev); for (const id of toDelete) n.add(String(id)); return n; });
          } else if (k === "restoreGroup") {
            const r = await apiPost("/archive/unarchiveAll", { workspaceId: archiveConfirm.workspaceId });
            if (!r.ok) throw new Error(r.error || "恢复失败");
          } else if (k === "deleteGroup") {
            const r = await apiPost("/archive/deleteAll", { workspaceId: archiveConfirm.workspaceId });
            if (!r.ok) throw new Error(r.error || "删除失败");
            const deleted = Array.isArray(r.deleted) && r.deleted.length ? r.deleted : toDelete;
            setHardDeleted((prev) => { const n = new Set(prev); for (const id of deleted) n.add(String(id)); return n; });
          } else if (k === "restoreAll") {
            const r = await apiPost("/archive/unarchiveAll", {});
            if (!r.ok) throw new Error(r.error || "恢复失败");
          } else if (k === "deleteAll") {
            const r = await apiPost("/archive/deleteAll", {});
            if (!r.ok) throw new Error(r.error || "删除失败");
            const deleted = Array.isArray(r.deleted) && r.deleted.length ? r.deleted : toDelete;
            setHardDeleted((prev) => { const n = new Set(prev); for (const id of deleted) n.add(String(id)); return n; });
          }
          setArchiveConfirm(null);
        } catch (error) {
          window.alert(String((error && error.message) || error));
        } finally {
          setArchiveBusy(false);
        }
      }, [archiveConfirm, archived, workspaces, sessions]);

      const onAddWorkspace = useCallback(async () => {
        try {
          const path = await pickDirectory();
          if (path === null) return;
          await createWorkspace({ path });
        } catch (error) {
          window.alert("添加工作区失败: " + String((error && error.message) || error));
        }
      }, [pickDirectory, createWorkspace]);

      // 数据准备
      const items = workspaces.items || [];
      // 会话状态向上透传：为目录树与工作区树各节点计算聚合状态（sessions 快照变化时重算）
      const aggCtx = useMemo(() => {
        const dirForest = buildDirTree(items);
        const wsForest = buildWorkspaceForest(items);
        for (const n of dirForest) decorateAgg(n, (x) => x.ws, (x) => x.children, sessions, archived);
        for (const n of wsForest) decorateAgg(n, (x) => x.w, (x) => x.children, sessions, archived);
        return { dirForest, wsForest };
      }, [items, sessions, archived]);
      const dirForest = aggCtx.dirForest;
      const wsForest = aggCtx.wsForest;
      const accountIds = new Set();
      for (const w of items) for (const sid of w.sessionIds) accountIds.add(sid);
      const ungroupedIds = visibleSessionIds((sessions.ids || []).filter((sid) => !accountIds.has(sid)), sessions, archived, hardDeleted);

      // rail 模式：窄图标列
      if (!wide) {
        return h("div", { className: "dswt-rail" }, [
          h("button", { key: "ns", type: "button", className: "dswt-rail-btn", title: "新建会话", onClick: () => startSession() }, h(Icon, { name: "newChat", size: 18 })),
          h("button", { key: "ws", type: "button", className: "dswt-rail-btn", title: "添加工作区", onClick: onAddWorkspace }, h(Icon, { name: "folderOpen", size: 18 })),
          h("button", { key: "ex", type: "button", className: "dswt-rail-btn", title: "展开侧栏", onClick: expandSidebar }, h(Icon, { name: "chevron", size: 14 }))
        ]);
      }

      const header = h("div", { key: "h", className: "dswt-sectionHeader" }, [
        h("div", {
          key: "t",
          className: "dswt-modeTitle",
          title: mode === "archive" ? "点击返回工作区" : "点击切换到" + (mode === "folder" ? "工作区" : "文件夹") + "模式",
          onClick: () => {
            if (swapFrom !== null) return;
            if (mode === "archive") { toggleArchive(); return; }
            setSwapFrom(mode);
            switchMode(mode === "folder" ? "workspace" : "folder");
          }
        }, [
          swapFrom !== null && h("span", { key: "out", className: "dswt-titleItem dswt-titleOut" }, swapFrom === "folder" ? "文件夹" : swapFrom === "archive" ? "归档" : "工作区"),
          h("span", { key: "in" + mode, className: "dswt-titleItem dswt-titleIn" }, mode === "archive" ? "归档" : mode === "folder" ? "文件夹" : "工作区")
        ]),
        h("span", { key: "a", className: "dswt-headerActions" }, [
          h("button", { key: "ns", type: "button", className: "dswt-headBtn", title: "新建会话", onClick: () => startSession() }, h(Icon, { name: "newChat", size: 16 })),
          h("button", { key: "ws", type: "button", className: "dswt-headBtn", title: "添加工作区（原生目录选择）", onClick: onAddWorkspace }, h(Icon, { name: "plus", size: 16 })),
          h("button", { key: "ar", type: "button", className: "dswt-headBtn" + (mode === "archive" ? " dswt-headBtnActive" : ""), title: "归档", onClick: toggleArchive }, h(Icon, { name: "archive", size: 16 }))
        ])
      ]);

      let body;
      if (mode === "folder") {
        body = h("div", { key: "l", className: "dswt-list", role: "tree", "aria-label": "文件夹" }, [
          dirForest.map((node) => h(DirNode, {
            key: node.path, node, depth: 0, indent: cfg.indent, showAgg: cfg.showAgg, showCount: cfg.showCount,
            expandedDirs, toggleDir,
            onNavToWorkspace: navToWorkspace, onNewSessionInDir: newSessionInDir,
            onAddWorkspaceDir: addWorkspaceDir,
            onNewDir: (p, name) => {
              if (name === void 0) setNewDirAt(p === newDirAt ? null : p);
              else commitNewDir(p, name);
            },
            onCancelNewDir: () => setNewDirAt(null),
            newDirAt,
            onRenameWs, onDeleteWs, sessions, archived
          })),
          dirForest.length === 0 && h("div", { key: "e", className: "dswt-empty" }, "尚无工作区——点击上方「添加工作区」或先新建会话")
        ]);
      } else if (mode === "archive") {
        body = h("div", { key: "l", className: "dswt-list", role: "tree", "aria-label": "归档" }, [
          h(ArchiveView, {
            key: "av",
            sessions,
            workspaces,
            wsForest,
            archived,
            onRestoreOne,
            onDeleteOne,
            onRestoreGroup,
            onDeleteGroup,
            onRestoreAll,
            onDeleteAll,
            busy: archiveBusy
          })
        ]);
      } else {
        body = h("div", { key: "l", className: "dswt-list", role: "tree", "aria-label": "工作区" }, [
          wsForest.map((node) => h(WorkspaceGroup, {
            key: node.w.workspaceId, node, depth: 0, indent: cfg.indent, showAgg: cfg.showAgg, sessions, archived, hardDeleted,
            expandedGroups, toggleGroup,
            onNewSession: (wid) => newSessionInDir(wid, node.w.path),
            onRenameWs, onDeleteWs,
            onOpen: open, onRenameSession, onArchiveSession, onDeleteSession: onRequestDeleteSession, now
          })),
          ungroupedIds.length > 0 && h("div", { key: "ug", className: "dswt-ungrouped" }, [
            h("div", { key: "t", className: "dswt-ungroupedTitle" }, "未分组会话"),
            ungroupedIds.map((sid) => h(SessionRow, {
              key: "s:" + sid, sid, sessions, depth: 0, indent: cfg.indent, now,
              onOpen: open, onRename: onRenameSession, onArchive: onArchiveSession,
              onDelete: onRequestDeleteSession
            }))
          ])
        ]);
      }

      const archiveModalProps = (() => {
        if (!archiveConfirm) return { open: false, title: "", desc: "", confirmText: "确认", danger: false };
        const k = archiveConfirm.kind;
        if (k === "restoreOne") return { open: true, title: "恢复会话", desc: "确定要恢复会话 “" + (archiveConfirm.title || "") + "” 吗？", confirmText: "恢复", danger: false };
        if (k === "deleteOne") return { open: true, title: "删除会话", desc: "确定要永久删除会话 “" + (archiveConfirm.title || "") + "” 吗？此操作将删除会话文件，无法恢复。", confirmText: "永久删除", danger: true };
        if (k === "restoreGroup") return { open: true, title: "恢复工作区归档", desc: "确定要恢复工作区 “" + (archiveConfirm.title || "") + "” 的全部归档会话吗？", confirmText: "恢复全部", danger: false };
        if (k === "deleteGroup") return { open: true, title: "删除工作区归档", desc: "确定要永久删除工作区 “" + (archiveConfirm.title || "") + "” 的全部归档会话吗？此操作不可恢复。", confirmText: "永久删除", danger: true };
        if (k === "restoreAll") return { open: true, title: "恢复全部归档", desc: "确定要恢复全部 " + (archived.size || 0) + " 条归档会话吗？", confirmText: "恢复全部", danger: false };
        if (k === "deleteAll") return { open: true, title: "删除全部归档", desc: "确定要永久删除全部 " + (archived.size || 0) + " 条归档会话吗？此操作不可恢复。", confirmText: "永久删除", danger: true };
        return { open: false, title: "", desc: "", confirmText: "确认", danger: false };
      })();

      return h("div", { className: "dswt-root" }, [
        header, body,
        h(DeleteSessionModal, {
          key: "delModal",
          open: pendingDelete !== null,
          sessionTitle: pendingDelete ? pendingDelete.title : "",
          busy: deleteBusy,
          onCancel: onCancelDeleteSession,
          onConfirm: onConfirmDeleteSession
        }),
        h(RenameModal, {
          key: "renameModal",
          open: renameTarget !== null,
          kind: renameTarget ? renameTarget.kind : "session",
          initialTitle: renameTarget ? renameTarget.initial : "",
          draft: renameDraft,
          busy: renameBusy,
          onDraftChange: setRenameDraft,
          onCancel: onCancelRename,
          onConfirm: onConfirmRename
        }),
        h(ArchiveConfirmModal, {
          key: "arcConfirm",
          open: archiveModalProps.open,
          title: archiveModalProps.title,
          desc: archiveModalProps.desc,
          confirmText: archiveModalProps.confirmText,
          danger: archiveModalProps.danger,
          busy: archiveBusy,
          onCancel: onCancelArchiveConfirm,
          onConfirm: onConfirmArchiveConfirm
        })
      ]);
    }

    // ══════════════ 设置页（设置 > 插件 > 插件配置） ══════════════
    function ConfigToggle({ checked, onChange, label }) {
      return h("label", { className: "dswt-switch" }, [
        h("input", { type: "checkbox", checked: !!checked, onChange: (e) => onChange(e.target.checked) }),
        h("span", { className: "dswt-switchTrack" }),
        h("span", { className: "dswt-switchText" }, label)
      ]);
    }
    function ConfigRow({ label, hint, children }) {
      return h("div", { className: "dswt-configRow" }, [
        h("div", { className: "dswt-configCol" }, [
          h("div", { className: "dswt-configLabel" }, label),
          hint && h("div", { className: "dswt-configHint" }, hint)
        ]),
        h("div", { className: "dswt-configControl" }, children)
      ]);
    }
    function ConfigPanel() {
      const [cfg, setCfgState] = useState(getConfig);
      useEffect(() => subscribeConfig(setCfgState), []);
      const upd = (patch) => setConfig(patch);
      const select = (value, options, onPick) => h("select", {
        className: "dswt-configSelect",
        value,
        onChange: (e) => onPick(e.target.value)
      }, options.map(([v, l]) => h("option", { key: v, value: v }, l)));
      return h("div", { className: "dswt-config" }, [
        h("div", { className: "dswt-configCard" }, [
          h("div", { className: "dswt-configTitle" }, "工作区树"),
          h("div", { className: "dswt-configDesc" }, "文件系统双模式工作区浏览器：文件夹模式按目录浏览与新建（会话 cwd = 目录，环境隔离），工作区模式管理会话。"),
          h(ConfigRow, { label: "启用插件", hint: "关闭后回退官方工作区浏览器（注册级，刷新页面生效）" },
            h(ConfigToggle, { checked: cfg.enabled, onChange: (v) => upd({ enabled: v }), label: "启用" })),
          h(ConfigRow, { label: "层级缩进", hint: "树中每一级的缩进宽度" },
            select(cfg.indent, [[8, "紧凑（8px）"], [16, "标准（16px）"], [24, "宽松（24px）"]], (v) => upd({ indent: Number(v) }))),
          h(ConfigRow, { label: "默认模式", hint: "打开侧栏时优先显示的模式（手动切换后会记住）" },
            select(cfg.defaultMode, [["folder", "文件夹模式"], ["workspace", "工作区模式"]], (v) => upd({ defaultMode: v }))),
          h(ConfigRow, { label: "状态向上透传", hint: "目录/组头显示子树内会话的聚合状态点（运行/等待/完成）" },
            h(ConfigToggle, { checked: cfg.showAgg, onChange: (v) => upd({ showAgg: v }), label: "显示" })),
          h(ConfigRow, { label: "会话计数角标", hint: "文件夹模式工作区节点旁的会话数" },
            h(ConfigToggle, { checked: cfg.showCount, onChange: (v) => upd({ showCount: v }), label: "显示" })),
          h("div", { className: "dswt-configActions" }, [
            h("button", { type: "button", className: "dswt-configBtn", onClick: () => setConfig(Object.assign({}, DEFAULT_CONFIG)) }, "恢复默认"),
            h("span", { className: "dswt-configSaved" }, "修改即时生效（启用开关除外）")
          ])
        ])
      ]);
    }

    // ══════════════ 错误边界 ══════════════
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }
      static getDerivedStateFromError(error) {
        return { error };
      }
      componentDidCatch(error) {
        try { console.error("[workspace-tree] 渲染错误:", error); } catch { /* ignore */ }
      }
      render() {
        if (this.state.error !== null) {
          const message = (this.state.error && this.state.error.message) ? this.state.error.message : String(this.state.error);
          return h("div", { className: "dswt-error" }, "工作区树渲染错误: " + message);
        }
        return this.props.children;
      }
    }

    // ══════════════ 注册 ══════════════
    function apply(ctx) {
      const styleEl = document.createElement("style");
      styleEl.setAttribute("data-workspace-tree", "true");
      document.head.appendChild(styleEl);
      styleEl.textContent = CSS;
      ctx.effect(() => () => styleEl.remove(), "dsh-workspace-tree: styles");

      // 设置页（设置 > 插件 > 插件配置），始终注册
      ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
        name: "settings.plugins.tab",
        id: "dsh-workspace-tree-config",
        order: 90,
        label: "工作区树"
      }, ConfigPanel));

      // 插件总开关：关闭时回退官方浏览器（注册级，刷新页面生效）
      if (!getConfig().enabled) return;

      ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
        name: "sidebar.workspaces",
        priority: -1,
        inject: () => ({
          startSession: (workspaceId) => ctx.workspaces.startSession(workspaceId),
          connectWorkspace: (workspaceId) => ctx.workspaces.connectWorkspace(workspaceId),
          createSession: (opts) => ctx.sessions.create(opts),
          open: (sessionId) => ctx.sessions.open(sessionId),
          renameSession: async (sessionId, title) => {
            const session = ctx.sessions.binding(sessionId)?.session;
            if (session === void 0) throw new Error("unknown session \"" + sessionId + "\"");
            const result = await session.rename(title);
            if (!result.ok) throw new Error(result.error.message);
          },
          forkSession: (sessionId) => {
            ctx.sessions.fork({ sessionId, increaseTitle: true }).then((childId) => ctx.sessions.open(childId)).catch(() => {});
          },
          renameWorkspace: async (workspaceId, title) => {
            await ctx.workspaces.rename(workspaceId, title);
          },
          deleteWorkspace: async (workspaceId) => {
            await ctx.workspaces.delete(workspaceId);
          },
          archiveSession: async (sessionId) => {
            await ctx.workspaces.archiveSession(sessionId);
          },
          createWorkspace: (input) => ctx.workspaces.create(input),
          pickDirectory: () => ctx.workspaces.pickDirectory()
        })
      }, (props) => h(ErrorBoundary, null, h(WorkspaceTreeBrowser, props))));
    }

    // ══════════════ 私有样式（官方视觉参数） ══════════════
    const CSS = `
      .dswt-root { --dsh-session-list-edge-inset: var(--dsh-sidebar-inline-padding, 8px); box-sizing: border-box; min-height: 0; padding-right: var(--dsh-session-list-edge-inset); flex-direction: column; flex: 1; display: flex; }
      .dswt-sectionHeader { box-sizing: border-box; height: 36px; color: var(--dsw-alias-label-tertiary); border-radius: 12px; flex: none; justify-content: flex-end; align-items: center; gap: 4px; margin-bottom: 4px; padding-left: 4px; display: flex; overflow: hidden; }
      .dswt-modeSwitch { flex: none; display: flex; align-items: center; gap: 2px; margin-right: auto; padding-left: 2px; }
      .dswt-modeBtnActive { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-brand-primary); }
      .dswt-modeTitle { position: relative; flex: none; margin-right: auto; margin-left: 4px; padding: 4px 10px; border-radius: 8px; cursor: pointer; user-select: none; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); overflow: hidden; }
      .dswt-modeTitle:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .dswt-titleItem { display: inline-block; white-space: nowrap; }
      .dswt-titleIn { animation: dswt-title-in .24s var(--ds-ease-in-out, ease); }
      .dswt-titleOut { position: absolute; left: 10px; top: 4px; animation: dswt-title-out .24s var(--ds-ease-in-out, ease) forwards; pointer-events: none; }
      @keyframes dswt-title-in { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes dswt-title-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-16px); opacity: 0; } }
      .dswt-headerActions { flex: none; align-items: center; gap: 4px; display: flex; }
      .dswt-headBtn { cursor: pointer; width: 28px; height: 28px; color: var(--dsw-alias-label-secondary); background: 0 0; border: none; border-radius: 50%; flex: none; justify-content: center; align-items: center; padding: 0; display: inline-flex; }
      .dswt-headBtn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .dswt-headBtnActive { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-brand-primary); }
      .dswt-archiveRoot { display: flex; flex-direction: column; gap: 12px; }
      .dswt-archiveToolbar { display: flex; flex-direction: column; gap: 8px; padding: 10px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; }
      .dswt-archiveToolbarTop { display: flex; align-items: center; justify-content: space-between; }
      .dswt-archiveCount { font-size: 12px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
      .dswt-archiveToolbarActions { display: flex; gap: 8px; }
      .dswt-archiveBtn { flex: 1; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-size: 12px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; }
      .dswt-archiveBtnSecondary { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
      .dswt-archiveBtnSecondary:hover { background: var(--dsw-alias-interactive-bg-hover); }
      .dswt-archiveBtnDanger { background: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); color: #fff; }
      .dswt-archiveBtnDanger:hover { filter: brightness(.96); }
      .dswt-archiveBtn:disabled { opacity: .5; cursor: not-allowed; }
      .dswt-archivedRow { opacity: .96; }
      .dswt-archivedRow:hover { opacity: 1; }
      .dswt-list { min-height: 0; margin-left: -4px; margin-right: var(--dsh-session-list-scrollbar-offset, 2px); padding-left: 4px; padding-right: calc(var(--dsh-session-list-edge-inset) - 8px - 2px); scrollbar-gutter: stable; flex: 1; padding-bottom: 16px; overflow-y: auto; }
      .dswt-groupSection { position: relative; }
      .dswt-groupSection + .dswt-groupSection { margin-top: 4px; }
      .dswt-groupBody { position: relative; }
      .dswt-groupBody::before { content: ""; position: absolute; left: var(--dswt-line-x, 3px); top: 4px; bottom: 4px; width: 1px; background: var(--dsw-alias-border-l1); }
      .dswt-groupBody > * + * { margin-top: 2px; }
      .dswt-projectRow, .dswt-session { cursor: pointer; user-select: none; color: var(--dsw-alias-label-primary); border-radius: 8px; align-items: center; gap: 6px; padding: 0 8px; display: flex; box-sizing: border-box; position: relative; }
      .dswt-projectRow { height: 34px; }
      .dswt-session { height: 32px; animation: dswt-row-in .15s var(--ds-ease-in-out, ease); gap: 0; }
      .dswt-projectRow:hover, .dswt-session:hover, .dswt-session.dswt-selected { background: var(--dsw-alias-interactive-bg-hover); }
      @keyframes dswt-row-in { 0% { opacity: 0; } }
      .dswt-slot { width: 16px; height: 20px; color: var(--dsw-alias-label-tertiary); flex: none; justify-content: center; align-items: center; display: inline-flex; }
      .dswt-aggSlot { width: 12px; }
      .dswt-folderIcon { color: var(--dsw-alias-label-tertiary); position: relative; }
      .dswt-folderIcon .dswt-chevronOverlay { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; color: var(--dsw-alias-label-caption); cursor: pointer; }
      .dswt-projectRow:hover .dswt-chevronOverlay { display: inline-flex; }
      .dswt-projectRow:has(.dswt-chevronOverlay):hover .dswt-folderSvg { display: none; }
      .dswt-chevronOverlay .dswt-arrow { display: inline-flex; transition: transform .15s var(--ds-ease-in-out, ease); }
      .dswt-chevronOverlay.dswt-arrowOpen svg { transform: rotate(90deg); }
      .dswt-wsRow .dswt-folderIcon { color: var(--dsw-alias-state-business-primary); }
      .dswt-arrow { display: inline-flex; transition: transform .15s var(--ds-ease-in-out, ease); color: var(--dsw-alias-label-caption); }
      .dswt-arrowOpen { transform: rotate(90deg); }
      .dswt-projectText { flex-direction: column; flex: 1; gap: 2px; min-width: 0; display: flex; }
      .dswt-title { text-overflow: ellipsis; white-space: nowrap; min-width: 0; font-size: 14px; line-height: 20px; overflow: hidden; }
      .dswt-dirTitle { flex: 1; margin: 0 6px 0 4px; color: var(--dsw-alias-label-secondary); }
      .dswt-dirRow:hover .dswt-dirTitle { color: var(--dsw-alias-label-primary); }
      .dswt-dirCount { flex: none; min-width: 16px; text-align: center; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); background: var(--dsw-alias-bg-layer-2); border-radius: 8px; padding: 0 4px; }
      .dswt-session .dswt-title { flex: 1; margin: 0 6px 0 4px; }
      .dswt-time { color: var(--dsw-alias-label-tertiary); flex: none; font-size: 12px; line-height: 20px; }
      .dswt-rowActions { flex: none; align-items: center; gap: 2px; display: none; }
      .dswt-projectRow:hover .dswt-rowActions, .dswt-session:hover .dswt-rowActions { display: inline-flex; }
      .dswt-session:hover .dswt-time { display: none; }
      .dswt-iconButton { cursor: pointer; width: 20px; height: 20px; color: var(--dsw-alias-label-tertiary); background: 0 0; border: none; border-radius: 4px; flex: none; justify-content: center; align-items: center; padding: 0; display: inline-flex; }
      .dswt-iconButton:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
      .dswt-iconButton.dswt-danger:hover { color: var(--dsw-alias-state-error-primary); }
      .dswt-inline { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-button-elevated-fill); min-width: 0; max-width: calc(100% - 16px); color: var(--dsw-alias-label-primary); border-radius: 4px; outline: none; padding: 3px 6px; font-size: 14px; line-height: 20px; margin: 2px 8px; box-sizing: border-box; }
      .dswt-inline:focus { border-color: var(--dsw-alias-brand-primary); }
      .dswt-empty { color: var(--dsw-alias-label-tertiary); padding: 16px 12px; font-size: 13px; }
      .dswt-ungrouped { margin-top: 8px; }
      .dswt-ungroupedTitle { padding: 4px 8px; font-size: 12px; color: var(--dsw-alias-label-tertiary); }
      .dswt-rail { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; }
      .dswt-rail-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--dsw-alias-label-secondary); border-radius: 8px; cursor: pointer; }
      .dswt-rail-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .dswt-error { color: var(--dsw-alias-state-error-primary); padding: 10px 12px; font-size: 12px; line-height: 18px; white-space: pre-wrap; }
      .dswt-matrix { flex: none; }
      .dswt-cell { fill: var(--dsw-alias-state-success-primary); opacity: 0; animation: dswt-pulse 1s linear infinite; }
      @keyframes dswt-pulse { 0%, 15% { opacity: 0; } 40% { opacity: 1; } 85%, 100% { opacity: 0; } }
      .dswt-dot { flex: none; border-radius: 50%; background: var(--dsw-alias-label-tertiary); opacity: .45; }
      .dswt-dot[data-state="done-reminder"] { background: var(--dsw-alias-state-success-primary); opacity: 1; }
      .dswt-dot[data-state="warning"] { background: var(--dsw-alias-state-warn-primary); opacity: 1; }
      .dswt-dot[data-state="error"] { background: var(--dsw-alias-state-error-primary); opacity: 1; }
      .dswt-config { padding: 4px 20px 28px; max-width: 620px; display: flex; flex-direction: column; gap: 16px; }
      .dswt-configCard { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
      .dswt-configTitle { font-size: 15px; line-height: 22px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
      .dswt-configDesc { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); margin: 0; }
      .dswt-configRow { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
      .dswt-configCol { flex: 1; min-width: 0; }
      .dswt-configLabel { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-primary); }
      .dswt-configHint { font-size: 12px; line-height: 17px; color: var(--dsw-alias-label-tertiary); margin-top: 2px; }
      .dswt-configControl { flex: none; }
      .dswt-configSelect { box-sizing: border-box; height: 32px; padding: 0 10px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; }
      .dswt-configSelect:focus { border-color: var(--dsw-alias-brand-primary); }
      .dswt-switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
      .dswt-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
      .dswt-switchTrack { width: 36px; height: 20px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l2); position: relative; transition: background-color .15s var(--ds-ease-in-out, ease), border-color .15s var(--ds-ease-in-out, ease); flex: none; }
      .dswt-switchTrack::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--dsw-alias-label-tertiary); transition: transform .15s var(--ds-ease-in-out, ease), background-color .15s var(--ds-ease-in-out, ease); }
      .dswt-switch input:checked + .dswt-switchTrack { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
      .dswt-switch input:checked + .dswt-switchTrack::after { transform: translateX(16px); background: #fff; }
      .dswt-switchText { font-size: 13px; color: var(--dsw-alias-label-primary); }
      .dswt-configActions { display: flex; align-items: center; gap: 12px; margin-top: 2px; }
      .dswt-configBtn { box-sizing: border-box; height: 32px; padding: 0 14px; cursor: pointer; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; font-size: 13px; }
      .dswt-configBtn:hover { background: var(--dsw-alias-interactive-bg-hover); }
      .dswt-configSaved { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
      .dswt-modalOverlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.38); backdrop-filter: blur(2px); animation: dswt-modal-in .18s var(--ds-ease-in-out, ease); }
      .dswt-modalPanel { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; min-width: 360px; max-width: 420px; width: calc(100% - 32px); box-shadow: 0 16px 40px rgba(0,0,0,.18); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      .dswt-modalTitle { font-size: 14px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary); }
      .dswt-modalBody { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; word-break: break-all; }
      .dswt-modalStrong { color: var(--dsw-alias-label-primary); font-weight: 600; }
      .dswt-modalActions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
      .dswt-modalBtn { height: 32px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); cursor: pointer; font-size: 13px; }
      .dswt-modalBtn:hover { background: var(--dsw-alias-interactive-bg-hover); }
      .dswt-modalBtnDanger { background: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); color: #fff; }
      .dswt-modalBtnDanger:hover { filter: brightness(.96); }
      .dswt-modalBtn:disabled { opacity: .6; cursor: not-allowed; }
      .dswt-modalInput { box-sizing: border-box; width: 100%; height: 36px; padding: 0 12px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; color: var(--dsw-alias-label-primary); font-size: 14px; outline: none; }
      .dswt-modalInput:focus { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-1); }
      .dswt-modalInput:disabled { opacity: .6; }
      .dswt-modalBtnPrimary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: #fff; }
      .dswt-modalBtnPrimary:hover { filter: brightness(.96); }
      .dswt-modalBtnPrimary:disabled { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l1); color: var(--dsw-alias-label-tertiary); filter: none; }
      @keyframes dswt-modal-in { from { opacity: 0; } to { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) { .dswt-session, .dswt-arrow { transition: none; animation: none; } .dswt-cell { animation: none; opacity: 1; } }
    `;

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
