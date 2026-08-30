window.__ModuleLoader__.load({ id: "@lynn123411/dsh-a6api", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/client/components/A6ApiSettings.tsx
var import_react4 = require("react");

// src/client/store.ts
var A6ApiStore = class {
  state = {
    loading: true,
    config: {
      baseURL: "https://api.a6api.com",
      apiKey: "",
      userId: "",
      activeModels: []
    },
    balance: null,
    models: [],
    dshConfiguredModels: [],
    recentLogs: [],
    probingModelNames: /* @__PURE__ */ new Set(),
    error: null
  };
  listeners = /* @__PURE__ */ new Set();
  autoRefreshTimer = null;
  constructor() {
    this.startAutoRefresh();
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notify() {
    for (const l of this.listeners) {
      try {
        l();
      } catch (err) {
        console.error("[dsh-a6api] listener error:", err);
      }
    }
  }
  getState() {
    return this.state;
  }
  async fetchState() {
    this.state.loading = true;
    this.notify();
    try {
      const res = await fetch("/api/dsh-a6api/state");
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const data = json.data;
          this.state.config = data.config;
          this.state.balance = data.balance;
          this.state.models = data.models;
          this.state.dshConfiguredModels = data.dshConfiguredModels;
          if (data.recentLogs) {
            this.state.recentLogs = data.recentLogs;
          }
          this.state.error = null;
        }
      }
    } catch (err) {
      this.state.error = err?.message || String(err);
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }
  async saveConfig(config) {
    try {
      const res = await fetch("/api/dsh-a6api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        await this.fetchState();
        return true;
      }
    } catch (err) {
      this.state.error = err?.message || String(err);
      this.notify();
    }
    return false;
  }
  async refreshBalance() {
    try {
      const res = await fetch("/api/dsh-a6api/balance");
      if (res.ok) {
        const json = await res.json();
        if (json?.balance) {
          this.state.balance = json.balance;
        }
        if (json?.recentLogs) {
          this.state.recentLogs = json.recentLogs;
        }
        this.notify();
      }
    } catch {
    }
  }
  async probeModel(modelName) {
    this.state.probingModelNames.add(modelName);
    this.state.models = this.state.models.map(
      (m) => m.model_name === modelName ? { ...m, probeStatus: "probing" } : m
    );
    this.notify();
    try {
      const res = await fetch("/api/dsh-a6api/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelName })
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.result?.merchant) {
          this.state.models = this.state.models.map(
            (m) => m.model_name === modelName ? {
              ...m,
              merchant: json.result.merchant,
              probeStatus: "success",
              probeLatencyMs: json.result.durationMs,
              probeError: void 0,
              lastProbedAt: Date.now()
            } : m
          );
        } else if (json?.result?.error) {
          this.state.models = this.state.models.map(
            (m) => m.model_name === modelName ? {
              ...m,
              probeStatus: "error",
              probeError: json.result.error,
              lastProbedAt: Date.now()
            } : m
          );
        } else {
          this.state.models = this.state.models.map(
            (m) => m.model_name === modelName ? {
              ...m,
              probeStatus: json?.result?.success ? "success" : "idle",
              probeLatencyMs: json?.result?.durationMs,
              probeError: json?.result?.success ? "\u63A2\u6D4B\u6210\u529F,\u4F46\u672A\u6355\u83B7\u5546\u6237\u4FE1\u606F(\u9700\u914D\u7F6E\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C)" : void 0,
              lastProbedAt: Date.now()
            } : m
          );
        }
      } else {
        this.state.models = this.state.models.map(
          (m) => m.model_name === modelName ? {
            ...m,
            probeStatus: "error",
            probeError: `HTTP ${res.status}`,
            lastProbedAt: Date.now()
          } : m
        );
      }
    } catch (err) {
      this.state.models = this.state.models.map(
        (m) => m.model_name === modelName ? {
          ...m,
          probeStatus: "error",
          probeError: err?.message || String(err),
          lastProbedAt: Date.now()
        } : m
      );
    } finally {
      this.state.probingModelNames.delete(modelName);
      this.notify();
      this.refreshBalance().catch(() => {
      });
    }
  }
  async probeAll() {
    const allNames = this.state.models.map((m) => m.model_name);
    const CONCURRENCY = 3;
    for (let i = 0; i < allNames.length; i += CONCURRENCY) {
      await Promise.all(allNames.slice(i, i + CONCURRENCY).map((n) => this.probeModel(n)));
    }
  }
  async toggleDshModel(modelName) {
    const currentSet = new Set(this.state.dshConfiguredModels);
    if (currentSet.has(modelName)) {
      currentSet.delete(modelName);
    } else {
      currentSet.add(modelName);
    }
    const newModels = [...currentSet];
    try {
      const res = await fetch("/api/dsh-a6api/sync-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelIds: newModels })
      });
      if (res.ok) {
        const json = await res.json();
        this.state.dshConfiguredModels = json.dshConfiguredModels || newModels;
        const dshSet = new Set(this.state.dshConfiguredModels);
        this.state.models = this.state.models.map((m) => ({
          ...m,
          inDsh: dshSet.has(m.model_name)
        }));
        this.notify();
      }
    } catch (err) {
      this.state.error = err?.message || String(err);
      this.notify();
    }
  }
  startAutoRefresh() {
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
    this.autoRefreshTimer = setInterval(() => {
      this.refreshBalance().catch(() => {
      });
    }, 6e4);
  }
};
var store = new A6ApiStore();

// src/client/components/MerchantCard.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var MerchantCard = ({ model }) => {
  const [expanded, setExpanded] = (0, import_react.useState)(false);
  const isProbing = model.probeStatus === "probing";
  const merchant = model.merchant;
  const handleProbe = (e) => {
    e.stopPropagation();
    store.probeModel(model.model_name);
  };
  const handleToggleDsh = (e) => {
    e.stopPropagation();
    store.toggleDshModel(model.model_name);
  };
  const renderRealtimeDots = () => {
    if (merchant?.success_buckets && merchant.success_buckets.length > 0) {
      return merchant.success_buckets.slice(0, 10).map((b, i) => {
        const rate = b.success_rate;
        let colorClass = "green";
        if (rate < 8e3) colorClass = "red";
        else if (rate < 9500) colorClass = "yellow";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsh-a6-rate-dot ${colorClass}` }, i);
      });
    }
    const count = 10;
    const greenCount = merchant ? Math.round(merchant.recent_success_rate_pct / 100 * count) : 10;
    return Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsh-a6-rate-dot ${i < greenCount ? "green" : "empty"}` }, i));
  };
  const render24hDots = () => {
    if (merchant?.b24 && merchant.b24.length > 0) {
      return merchant.b24.slice(0, 12).map((b, i) => {
        if (!b.s || b.s === 0) {
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-rate-dot empty" }, i);
        }
        let colorClass = "green";
        if (b.r < 8e3) colorClass = "red";
        else if (b.r < 9500) colorClass = "yellow";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsh-a6-rate-dot ${colorClass}` }, i);
      });
    }
    const count = 12;
    const greenCount = merchant ? Math.round(merchant.success_rate_24h_pct / 100 * count) : 12;
    return Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsh-a6-rate-dot ${i < greenCount ? "green" : "empty"}` }, i));
  };
  const render7dDots = () => {
    if (merchant?.b7d && merchant.b7d.length > 0) {
      return merchant.b7d.slice(0, 7).map((b, i) => {
        if (!b.s || b.s === 0) {
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-rate-dot empty" }, i);
        }
        let colorClass = "green";
        if (b.r && b.r < 8e3) colorClass = "red";
        else if (b.r && b.r < 9500) colorClass = "yellow";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsh-a6-rate-dot ${colorClass}` }, i);
      });
    }
    return Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsh-a6-rate-dot ${i >= 4 ? "green" : "empty"}` }, i));
  };
  const getTagClass = (tag) => {
    if (tag.includes("\u4FDD\u771F")) return "tag-guarantee";
    if (tag.includes("\u7A33\u5B9A")) return "tag-stable";
    if (tag.includes("\u4F4E\u4EF7")) return "tag-cheap";
    if (tag.includes("\u9AD8\u901F")) return "tag-fast";
    if (tag.includes("\u9AD8\u8D28")) return "tag-quality";
    return "";
  };
  const ratioText = merchant?.realtime_ratio_formatted || "0.0341";
  const latencySec = merchant ? ((merchant.p50_ttft_ms || merchant.recent_p50_ms || 2340) / 1e3).toFixed(2) + "s" : model.probeLatencyMs ? (model.probeLatencyMs / 1e3).toFixed(2) + "s" : "2.34s";
  const cacheHitPct = merchant ? merchant.cache_hit_rate_pct : 72;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsh-a6-official-card ${model.inDsh ? "in-dsh" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-card-main-bar", onClick: () => setExpanded(!expanded), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-bar-identity", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-title-col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-title-line", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-name-text", children: model.model_name }),
          merchant?.channel_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-dot-sep", children: "\xB7" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-a6-merchant-id-text", children: [
              "\u5546\u6237ID ",
              merchant.channel_id
            ] })
          ] })
        ] }),
        merchant?.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-sub-desc", children: merchant.description })
      ] }) }),
      merchant ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-bar-pricing", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-price-col", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-price-top", title: "\u8F93\u5165\u4EF7 (1M)", children: merchant.input_price_cny }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-price-btm", title: "\u7F13\u5B58\u8BFB (1M)", children: merchant.cache_read_price_cny })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-price-col", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-price-top", title: "\u8F93\u51FA\u4EF7 (1M)", children: merchant.output_price_cny }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-price-btm", title: "\u7F13\u5B58\u5199 (1M)", children: merchant.cache_write_price_cny })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-ratio-pill", title: "\u5B9E\u65F6\u500D\u7387\u6BD4\u5B98\u65B9\u4EF7", children: ratioText })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-bar-pricing unprobed", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: `dsh-a6-unprobed-hint ${model.probeError ? "error" : ""}`,
          "data-tooltip": model.probeError || void 0,
          "data-tooltip-pos": "down",
          children: isProbing ? "\u5546\u5BB6\u63A2\u6D4B\u4E2D..." : model.probeError ? "\u63A2\u6D4B\u5931\u8D25" : "\u5C1A\u672A\u63A2\u6D4B\u5546\u5BB6"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-bar-uptime", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-uptime-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-uptime-label", children: "\u5B9E\u65F6" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-dots-track", children: renderRealtimeDots() }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-uptime-val", children: merchant ? `${merchant.recent_success_rate_pct.toFixed(1)}%` : "100.0%" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-uptime-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-uptime-label", children: "24h" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-dots-track", children: render24hDots() }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-uptime-val", children: merchant ? `${merchant.success_rate_24h_pct.toFixed(1)}%` : "99.3%" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-uptime-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-uptime-label", children: "7d" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-dots-track", children: render7dDots() }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-uptime-val", children: merchant?.sr_7d_state === "no_data" ? "-" : merchant?.success_rate_7d_pct ? `${merchant.success_rate_7d_pct.toFixed(1)}%` : "-" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-bar-perf", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-perf-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-latency-text", children: latencySec }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-a6-cache-hit-text", children: [
          cacheHitPct.toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-hit-track", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            className: "dsh-a6-hit-fill",
            style: { width: `${Math.min(100, Math.max(0, cacheHitPct))}%` }
          }
        ) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-bar-tags", children: (merchant?.labels || ["\u7A33\u5B9A", "\u4F4E\u4EF7", "\u9AD8\u901F", "\u9AD8\u8D28"]).map((lbl, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsh-a6-smart-pill ${getTagClass(lbl)}`, children: lbl }, idx)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-bar-actions", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "span",
          {
            className: "dsh-a6-time-ago",
            "data-tooltip": "\u8BE5\u5546\u6237\u8DEF\u7EBF\u5168\u7F51\u6700\u8FD1\u4E00\u6B21\u6210\u529F\u54CD\u5E94\u65F6\u95F4",
            children: merchant?.last_success_text || "\u521A\u521A"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-a6-btn dsh-a6-btn-secondary dsh-a6-btn-sm",
            onClick: handleProbe,
            disabled: isProbing,
            "data-tooltip": "\u5411\u8BE5\u6A21\u578B\u53D1\u9001\u4E00\u6B21\u8BF7\u6C42\u4EE5\u63A2\u6D4B\u5E76\u6355\u83B7\u5176\u5B9E\u9645\u547D\u4E2D\u7684\u5546\u6237 ID\u3001\u4EF7\u683C\u53CA\u5065\u5EB7\u5EA6\u6307\u6807\uFF08\u6D88\u8017\u5C11\u91CFToken\uFF09",
            children: isProbing ? "\u63A2\u6D4B\u4E2D..." : "\u63A2\u6D4B\u5546\u5BB6"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: `dsh-a6-btn dsh-a6-btn-sm ${model.inDsh ? "dsh-a6-btn-in-dsh" : "dsh-a6-btn-primary"}`,
            onClick: handleToggleDsh,
            "data-tooltip": model.inDsh ? "\u5DF2\u52A0\u5165 DSH \u6A21\u578B\u9009\u62E9\u5668 (\u70B9\u51FB\u79FB\u9664)" : "\u6DFB\u52A0\u81F3 DSH \u6A21\u578B\u9009\u62E9\u5668",
            children: model.inDsh ? "\u5DF2\u5728 DSH" : "\u6DFB\u52A0\u5230 DSH"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: `dsh-a6-expand-toggle-btn ${expanded ? "open" : ""}`,
            onClick: () => setExpanded(!expanded),
            "data-tooltip": expanded ? "\u6536\u8D77\u4EF7\u683C\u8BE6\u60C5" : "\u5C55\u5F00\u5B98\u65B9\u57FA\u51C6\u4EF7\u4E0E\u5546\u6237\u5B9E\u65F6\u4EF7\u5BF9\u6BD4\u8868",
            "data-tooltip-pos": "left",
            children: expanded ? "\u6536\u8D77" : "\u8BE6\u60C5"
          }
        )
      ] })
    ] }),
    expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-detail-container", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-detail-top-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-dt-left", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-dt-label", children: "\u6E20\u9053\u8BF4\u660E" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-dt-desc", children: merchant?.description || "\u9AD8\u5E76\u53D1 \u4E3B\u6253\u4FBF\u5B9C \u7A33\u5B9A" })
        ] }),
        merchant?.channel_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-a6-dt-right", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-a6-dt-label", children: "\u547D\u4E2D\u7EBF\u8DEF" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-a6-dt-channel-name", children: [
            merchant.channel_name,
            " (ID: ",
            merchant.channel_id,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-dt-divider" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-a6-dt-table-col", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "dsh-a6-price-table", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "dsh-a6-th-blank" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "\u8F93\u5165\u4EF7 (1M)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "\u8F93\u51FA\u4EF7 (1M)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "\u7F13\u5B58\u8BFB (1M)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "\u7F13\u5B58\u5199 (1M)" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "dsh-a6-tr-official", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dsh-a6-td-label", children: "\u5B98\u65B9\u4EF7" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: merchant?.official_price?.input_cny || "\xA526.884" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: merchant?.official_price?.output_cny || "\xA5134.418" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: merchant?.official_price?.cache_read_cny || "\xA52.688" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: merchant?.official_price?.cache_write_cny || "\xA533.605" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "dsh-a6-tr-merchant", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dsh-a6-td-label", children: "\u5546\u6237\u4EF7" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dsh-a6-td-bold", children: merchant?.input_price_cny || "\xA50.1364" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dsh-a6-td-bold", children: merchant?.output_price_cny || "\xA50.6822" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dsh-a6-td-bold", children: merchant?.cache_read_price_cny || "\xA50.0136" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "dsh-a6-td-bold", children: merchant?.cache_write_price_cny || "\xA50.1705" })
          ] })
        ] })
      ] }) })
    ] })
  ] });
};

// src/client/components/BalanceCard.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var AccountPanel = ({ balance, config, recentLogs = [], onNavigateToConfig }) => {
  const [refreshing, setRefreshing] = (0, import_react2.useState)(false);
  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await store.refreshBalance();
    setRefreshing(false);
  };
  const hasAuth = balance?.hasAccountAuth ?? false;
  const isLow = balance ? balance.isLow : false;
  const formatLogTime = (ts) => {
    if (!ts) return "\u521A\u521A";
    const d = new Date(ts * 1e3);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-account-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `dsh-a6-balance-banner ${isLow ? "low-balance" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-balance-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-balance-left", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-balance-main-title", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-balance-label", children: "\u8D26\u6237\u771F\u5B9E\u4F59\u989D (\u5B9E\u65F6\u540C\u6B65)" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-balance-num-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `dsh-a6-balance-amount ${!hasAuth ? "unauthed" : ""}`, children: hasAuth ? balance?.accountBalanceFormatted ?? "$0.00" : "\u672A\u8FDE\u63A5" }),
              hasAuth && balance?.accountBalanceCnyFormatted && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-balance-cny", children: balance.accountBalanceCnyFormatted }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `dsh-a6-status-pill ${hasAuth ? "success" : "warn"}`, children: hasAuth ? "\u8D26\u6237\u5DF2\u540C\u6B65" : "\u672A\u8FDE\u63A5\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C" })
            ] })
          ] }),
          isLow && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-low-alert", children: "\u4F59\u989D\u8F83\u4F4E (< $0.50)\uFF0C\u5EFA\u8BAE\u53CA\u65F6\u5145\u503C\u4EE5\u4FDD\u969C\u6B63\u5E38\u8C03\u7528" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-balance-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "dsh-a6-btn dsh-a6-btn-secondary dsh-a6-btn-sm",
              onClick: handleRefreshBalance,
              disabled: refreshing,
              "data-tooltip": "\u4ECE A6API \u63A7\u5236\u53F0\u540C\u6B65\u83B7\u53D6\u6700\u65B0\u8D26\u6237\u771F\u5B9E\u53EF\u7528\u4F59\u989D\u4E0E\u6D88\u8017\u7EDF\u8BA1\uFF08\u4E0D\u6D88\u8017 Token\uFF09",
              "data-tooltip-pos": "down",
              children: refreshing ? "\u5237\u65B0\u4E2D..." : "\u5237\u65B0\u4F59\u989D"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "a",
            {
              href: "https://a6api.com/console",
              target: "_blank",
              rel: "noreferrer",
              className: "dsh-a6-btn dsh-a6-btn-primary dsh-a6-btn-sm",
              style: { textDecoration: "none" },
              "data-tooltip": "\u5728\u65B0\u6807\u7B7E\u9875\u4E2D\u6253\u5F00 A6API \u63A7\u5236\u53F0\u8FDB\u884C\u5728\u7EBF\u5145\u503C\u6216\u7BA1\u7406\u51ED\u636E",
              "data-tooltip-pos": "down-left",
              children: "\u524D\u5F80\u5145\u503C / \u63A7\u5236\u53F0"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-stat-cards-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-kpi-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-label", children: "\u5173\u8054\u8D26\u6237" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-val", children: hasAuth ? `${balance?.username || "\u5DF2\u8BA4\u8BC1\u7528\u6237"} (#${balance?.userId || "\u2014"})` : "\u672A\u7ED1\u5B9A" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-kpi-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-label", children: "\u5386\u53F2\u603B\u6D88\u8017" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-val", children: hasAuth ? `$${balance?.usedUsd?.toFixed(2) ?? "0.00"}` : "\u2014" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-kpi-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-label", children: "\u7D2F\u8BA1\u8BF7\u6C42\u6B21\u6570" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-val", children: hasAuth ? `${balance?.requestCount ?? 0} \u6B21` : "\u2014" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-kpi-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-label", children: "\u5B9E\u65F6\u6C47\u7387\u53C2\u8003" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-kpi-val", children: "1 USD \u2248 6.7209 CNY" })
        ] })
      ] })
    ] }),
    !hasAuth && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-auth-banner-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-auth-banner-content", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-a6-auth-banner-title", children: "\u8FDE\u63A5\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C\u4EE5\u89E3\u9501\u5B8C\u6574\u8D44\u4EA7\u76D1\u63A7" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-auth-banner-desc", children: [
          "\u586B\u5165\u60A8\u7684 ",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "A6API \u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C" }),
          " \u540E\uFF0C\u5373\u53EF\u5728\u6B64\u5B9E\u65F6\u67E5\u770B\u8D26\u6237\u771F\u5B9E\u53EF\u7528\u4F59\u989D\u3001\u5386\u53F2\u6D88\u8017\u3001\u7D2F\u8BA1\u8BF7\u6C42\u4EE5\u53CA\u5546\u6237\u8DEF\u7531\u4EF7\u683C\u6307\u6807\u3002"
        ] })
      ] }),
      onNavigateToConfig && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: "dsh-a6-btn dsh-a6-btn-primary dsh-a6-btn-sm",
          onClick: onNavigateToConfig,
          children: "\u586B\u5199\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-logs-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-a6-logs-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-logs-title", children: "\u6700\u8FD1\u8DEF\u7531\u8C03\u7528\u660E\u7EC6 (\u5B9E\u65F6\u5FEB\u7167)" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-logs-subtitle", children: "\u5C55\u793A\u901A\u8FC7\u5F53\u524D A6API \u63A5\u5165\u7684\u8FD1\u671F\u8BF7\u6C42\u4E0E\u5546\u6237\u8DEF\u7531\u8017\u65F6" })
      ] }),
      recentLogs && recentLogs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-a6-logs-table-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("table", { className: "dsh-a6-logs-table", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u8C03\u7528\u65F6\u95F4" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u72B6\u6001" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u5546\u6237id" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u8BF7\u6C42\u6A21\u578B" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u8F93\u5165/\u8F93\u51FA" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u82B1\u8D39" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("th", { children: "\u8017\u65F6" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("tbody", { children: recentLogs.map((log, idx) => {
          const isErr = log.status === "error" || log.status === "failed" || log.raw && (log.raw.type !== 2 || log.raw.other && (log.raw.other.includes('"request_final_status":"failed"') || log.raw.other.includes('"request_final_status":"error"') || log.raw.other.includes('"request_final_status":"upstream_error"')) || Boolean(log.raw.content && log.raw.content.startsWith("status_code=")));
          const channelNum = Number(log.channel || log.raw?.channel || 0);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("tr", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { className: "dsh-a6-log-time", children: formatLogTime(log.created_at) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `dsh-a6-log-status ${isErr ? "err" : "ok"}`, children: isErr ? "\u5931\u8D25" : "\u6210\u529F" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { className: "dsh-a6-log-channel", children: channelNum > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dsh-a6-log-channel-badge", children: [
              "#",
              channelNum
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-a6-log-channel-empty", children: "\u65E0" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { className: "dsh-a6-log-model", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { children: log.model_name }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("td", { className: "dsh-a6-log-tokens", children: [
              log.prompt_tokens || 0,
              " / ",
              log.completion_tokens || 0
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { className: "dsh-a6-log-cost", children: log.cost_formatted || "$0.00" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("td", { className: "dsh-a6-log-time-use", children: log.use_time ? `${log.use_time}s` : "\u2014" })
          ] }, log.id || idx);
        }) })
      ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-a6-empty-logs", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u6682\u65E0\u8FD1\u671F\u8C03\u7528\u8BB0\u5F55\u3002\u5728 DSH \u4E2D\u53D1\u8D77\u6A21\u578B\u5BF9\u8BDD\u6216\u70B9\u51FB\u300C\u63A2\u6D4B\u5546\u5BB6\u300D\u540E\uFF0C\u8C03\u7528\u660E\u7EC6\u5C06\u5728\u6B64\u5B9E\u65F6\u5C55\u793A\u3002" }) })
    ] })
  ] });
};

// src/client/components/ConfigPanel.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var MASK = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
var ConfigPanel = ({ config, dshConfiguredModels }) => {
  const [apiKey, setApiKey] = (0, import_react3.useState)(config.apiKey || "");
  const [accessToken, setAccessToken] = (0, import_react3.useState)(
    config.accessToken || config.sessionCookie || ""
  );
  const [clearKey, setClearKey] = (0, import_react3.useState)(false);
  const [clearToken, setClearToken] = (0, import_react3.useState)(false);
  const [selectedNode, setSelectedNode] = (0, import_react3.useState)(
    config.baseURL || "https://api.a6api.com"
  );
  const [customNode, setCustomNode] = (0, import_react3.useState)(config.customBaseURL || "");
  const [isCustom, setIsCustom] = (0, import_react3.useState)(
    config.baseURL !== "https://api.a6api.com" && config.baseURL !== "https://a6.a6api.com"
  );
  const [showKey, setShowKey] = (0, import_react3.useState)(false);
  const [showToken, setShowToken] = (0, import_react3.useState)(false);
  const [showHelp, setShowHelp] = (0, import_react3.useState)(false);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  const [saveSuccess, setSaveSuccess] = (0, import_react3.useState)(false);
  const apiKeySet = apiKey === MASK;
  const tokenSet = accessToken === MASK;
  (0, import_react3.useEffect)(() => {
    setApiKey(config.apiKey || "");
    setAccessToken(config.accessToken || config.sessionCookie || "");
    setClearKey(false);
    setClearToken(false);
    setSelectedNode(config.baseURL || "https://api.a6api.com");
    setCustomNode(config.customBaseURL || "");
    setIsCustom(
      config.baseURL !== "https://api.a6api.com" && config.baseURL !== "https://a6.a6api.com"
    );
  }, [config]);
  const handleSave = async () => {
    setSaving(true);
    const finalBaseUrl = isCustom ? customNode.trim() || "https://api.a6api.com" : selectedNode;
    const newApiKey = apiKeySet ? clearKey ? "" : void 0 : apiKey.trim();
    const newToken = tokenSet ? clearToken ? "" : void 0 : accessToken.trim();
    const ok = await store.saveConfig({
      ...newApiKey !== void 0 ? { apiKey: newApiKey } : {},
      ...newToken !== void 0 ? { accessToken: newToken, sessionCookie: newToken } : {},
      baseURL: finalBaseUrl,
      customBaseURL: customNode.trim()
    });
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-config-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-config-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-section-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-heading-title", children: "API \u63A5\u5165\u8282\u70B9 (Base URL)" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-heading-desc", children: "\u9009\u62E9\u79BB\u60A8\u6700\u8FD1\u7684 A6API \u805A\u5408\u7F51\u5173\u63A5\u5165\u70B9\uFF0C\u652F\u6301 CDN \u8282\u70B9\u4E0E\u76F4\u8FDE\u5907\u7528\u8282\u70B9\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-node-picker", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: `dsh-a6-node-pill ${!isCustom && selectedNode === "https://api.a6api.com" ? "active" : ""}`,
            onClick: () => {
              setIsCustom(false);
              setSelectedNode("https://api.a6api.com");
            },
            children: "https://api.a6api.com (CDN \u63A8\u8350)"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: `dsh-a6-node-pill ${!isCustom && selectedNode === "https://a6.a6api.com" ? "active" : ""}`,
            onClick: () => {
              setIsCustom(false);
              setSelectedNode("https://a6.a6api.com");
            },
            children: "https://a6.a6api.com (\u76F4\u8FDE\u5907\u7528)"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: `dsh-a6-node-pill ${isCustom ? "active" : ""}`,
            onClick: () => setIsCustom(true),
            children: "\u81EA\u5B9A\u4E49\u8282\u70B9"
          }
        )
      ] }),
      isCustom && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          type: "text",
          className: "dsh-a6-input",
          placeholder: "https://your-custom-gateway.com",
          value: customNode,
          onChange: (e) => setCustomNode(e.target.value),
          style: { marginTop: "8px" }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-config-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-section-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-heading-title", children: "\u8BBF\u95EE\u9274\u6743\u4E0E\u4EE4\u724C\u51ED\u636E" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-heading-desc", children: "\u914D\u7F6E\u6A21\u578B\u8C03\u7528 API Key \u4EE5\u53CA\u7528\u4E8E\u540C\u6B65\u8D26\u6237\u4F59\u989D\u4E0E\u5546\u6237\u884C\u60C5\u7684\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C\u3002" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-config-fields-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "dsh-a6-label", children: "A6API \u4EE4\u724C (API Key)" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field-header-actions", children: [
              apiKeySet && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  className: "dsh-a6-btn-text",
                  onClick: () => {
                    setClearKey(true);
                    setApiKey("");
                  },
                  children: "\u6E05\u9664"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  className: "dsh-a6-btn-text",
                  onClick: () => setShowKey(!showKey),
                  children: showKey ? "\u9690\u85CF" : "\u663E\u793A"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-a6-input-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "input",
            {
              type: showKey ? "text" : "password",
              className: "dsh-a6-input",
              placeholder: apiKeySet ? "\u5DF2\u4FDD\u5B58 \xB7 \u8F93\u5165\u65B0 Key \u53EF\u66FF\u6362" : "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
              value: apiKeySet ? "" : apiKey,
              onChange: (e) => setApiKey(e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-field-hint", children: apiKeySet ? "\u5DF2\u914D\u7F6E API Key\uFF08\u4EC5\u4FDD\u5B58\u5728\u672C\u673A ~/.dsh/.credentials.yaml\uFF0C\u4E0D\u56DE\u4F20\u754C\u9762\uFF09\u3002" : "\u7528\u4E8E\u5411 A6API \u53D1\u8D77\u6A21\u578B\u5BF9\u8BDD\u8BF7\u6C42\u4E0E\u62C9\u53D6\u767D\u540D\u5355\u6A21\u578B\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "dsh-a6-label", children: "\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C (Access Token)" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field-header-actions", children: [
              tokenSet && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  className: "dsh-a6-btn-text",
                  onClick: () => {
                    setClearToken(true);
                    setAccessToken("");
                  },
                  children: "\u6E05\u9664"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  className: "dsh-a6-btn-text",
                  onClick: () => setShowToken(!showToken),
                  children: showToken ? "\u9690\u85CF" : "\u663E\u793A"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-a6-input-wrapper", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "input",
            {
              type: showToken ? "text" : "password",
              className: "dsh-a6-input",
              placeholder: tokenSet ? "\u5DF2\u4FDD\u5B58 \xB7 \u8F93\u5165\u65B0\u4EE4\u724C\u53EF\u66FF\u6362" : "\u5728\u63A7\u5236\u53F0\u5B89\u5168\u8BBE\u7F6E\u4E2D\u590D\u5236\uFF0C\u4F8B\u5982 eyJhbGciOi...",
              value: tokenSet ? "" : accessToken,
              onChange: (e) => setAccessToken(e.target.value)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-field-footer", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-field-hint", children: tokenSet ? "\u5DF2\u914D\u7F6E\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C\uFF08\u4EC5\u4FDD\u5B58\u5728\u672C\u673A\uFF0C\u4E0D\u56DE\u4F20\u754C\u9762\uFF09\u3002" : "\u7528\u4E8E\u514D\u5931\u6548\u540C\u6B65\u8D26\u6237\u771F\u5B9E\u4F59\u989D\u4E0E\u5546\u6237\u6307\u6807\u3002" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-a6-btn-text",
                onClick: () => setShowHelp(!showHelp),
                style: { fontSize: "11px", whiteSpace: "nowrap" },
                children: showHelp ? "\u6536\u8D77\u6559\u7A0B" : "\u83B7\u53D6\u6559\u7A0B"
              }
            )
          ] })
        ] })
      ] }),
      showHelp && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-help-drawer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-a6-help-title", children: "\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C\u83B7\u53D6\u6B65\u9AA4\uFF08\u6C38\u4E45\u6709\u6548\uFF09\uFF1A" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("ol", { className: "dsh-a6-help-list", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
            "\u5728\u6D4F\u89C8\u5668\u6253\u5F00\u5E76\u767B\u5F55",
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("a", { href: "https://a6api.com/console/personal", target: "_blank", rel: "noreferrer", children: "a6api.com/console/personal" }),
            " ",
            "\uFF08\u4E2A\u4EBA\u8BBE\u7F6E - \u5B89\u5168\u8BBE\u7F6E\uFF09"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
            "\u5728\u300C\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C\u300D\u680F\u76EE\u76F4\u63A5\u70B9\u51FB\u590D\u5236\u4EE4\u724C\u5B57\u7B26\u4E32\uFF08\u4F8B\u5982 ",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: "eyJhbGciOi..." }),
            "\uFF09"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: "\u7C98\u8D34\u5230\u4E0A\u65B9\u7684\u300C\u7CFB\u7EDF\u8BBF\u95EE\u4EE4\u724C\u300D\u8F93\u5165\u6846\u4E2D\u5E76\u70B9\u51FB\u4E0B\u65B9\u300C\u4FDD\u5B58\u914D\u7F6E\u300D\u5373\u53EF\u81EA\u52A8\u540C\u6B65\u4F59\u989D\uFF01" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-config-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-section-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-heading-title", children: "DSH \u539F\u751F LLM \u63D0\u4F9B\u5546\u96C6\u6210\u72B6\u6001" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "dsh-a6-heading-desc", children: [
          "\u63D2\u4EF6\u5DF2\u5C06 A6API \u6CE8\u518C\u4E3A DSH \u539F\u751F\u6A21\u578B\u63D0\u4F9B\u5546 (",
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: "a6api" }),
          ")\u3002\u5728\u300C\u53EF\u7528\u6A21\u578B\u300D\u4E2D\u542F\u7528\u7684\u6A21\u578B\u5C06\u81EA\u52A8\u5199\u5165 DSH \u914D\u7F6E\u6587\u4EF6\u3002"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-integration-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-int-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-int-key", children: "\u63D0\u4F9B\u5546\u6807\u8BC6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "dsh-a6-int-val", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: "a6api" }),
            " (OpenAI-compatible)"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-int-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-int-key", children: "\u5F53\u524D\u5DF2\u542F\u7528\u6A21\u578B" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-a6-int-tags", children: dshConfiguredModels.length > 0 ? dshConfiguredModels.map((m) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-model-chip", children: m }, m)) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-empty-hint", children: "\u6682\u672A\u542F\u7528\u4EFB\u4F55\u6A21\u578B\uFF0C\u8BF7\u524D\u5F80\u300C\u53EF\u7528\u6A21\u578B\u300D\u9875\u9762\u70B9\u51FB\u300C\u6DFB\u52A0\u5230 DSH\u300D" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsh-a6-save-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsh-a6-save-status", children: saveSuccess && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsh-a6-success-msg", children: "\u914D\u7F6E\u5DF2\u6210\u529F\u4FDD\u5B58\u5E76\u540C\u6B65" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "dsh-a6-btn dsh-a6-btn-primary",
          onClick: handleSave,
          disabled: saving,
          style: { minWidth: "100px" },
          children: saving ? "\u6B63\u5728\u4FDD\u5B58..." : "\u4FDD\u5B58\u914D\u7F6E"
        }
      )
    ] })
  ] });
};

// src/client/components/A6ApiSettings.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var A6ApiSettingsPanel = () => {
  const [state, setState] = (0, import_react4.useState)(store.getState());
  const [activeTab, setActiveTab] = (0, import_react4.useState)("models");
  const [filterMode, setFilterMode] = (0, import_react4.useState)("all");
  const [searchQuery, setSearchQuery] = (0, import_react4.useState)("");
  const [probingAll, setProbingAll] = (0, import_react4.useState)(false);
  const [refreshing, setRefreshing] = (0, import_react4.useState)(false);
  const [refreshSuccess, setRefreshSuccess] = (0, import_react4.useState)(false);
  (0, import_react4.useEffect)(() => {
    const unsub = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    store.fetchState();
    return unsub;
  }, []);
  const handleProbeAll = async () => {
    setProbingAll(true);
    await store.probeAll();
    setProbingAll(false);
  };
  const handleRefreshState = async () => {
    setRefreshing(true);
    await store.fetchState();
    setRefreshing(false);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2e3);
  };
  const inDshCount = state.models.filter((m) => m.inDsh).length;
  const probedCount = state.models.filter((m) => Boolean(m.merchant)).length;
  const filteredModels = state.models.filter((m) => {
    if (filterMode === "enabled" && !m.inDsh) return false;
    if (filterMode === "probed" && !m.merchant) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return m.model_name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q) || m.merchant?.supplier_name && m.merchant.supplier_name.toLowerCase().includes(q) || m.merchant?.channel_name && m.merchant.channel_name.toLowerCase().includes(q) || m.merchant?.description && m.merchant.description.toLowerCase().includes(q);
    }
    return true;
  });
  const sortedModels = [...filteredModels].sort((a, b) => {
    if (a.inDsh !== b.inDsh) {
      return a.inDsh ? -1 : 1;
    }
    return a.model_name.localeCompare(b.model_name);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-container", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-main-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-header-text", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "dsh-a6-main-title", children: "A6API \u805A\u5408\u7AD9" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dsh-a6-main-subtitle", children: "\u805A\u5408\u5168\u7403\u4E3B\u6D41\u4E0E\u9AD8\u6027\u4EF7\u6BD4\u6A21\u578B\uFF0C\u5B9E\u65F6\u76D1\u63A7\u5546\u6237\u6307\u6807\u3001\u4EF7\u683C\u500D\u7387\u4E0E\u8D26\u6237\u8D44\u4EA7\u3002" })
      ] }),
      state.balance?.hasAccountAuth && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "div",
        {
          className: "dsh-a6-header-balance-badge",
          onClick: () => setActiveTab("account"),
          title: "\u70B9\u51FB\u5207\u6362\u81F3\u300C\u8D26\u6237\u8D44\u4EA7\u300D\u9875\u9762",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsh-a6-hb-label", children: "\u8D26\u6237\u4F59\u989D:" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsh-a6-hb-amount", children: state.balance.accountBalanceFormatted })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-nav-tabs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "button",
        {
          type: "button",
          className: `dsh-a6-nav-tab ${activeTab === "models" ? "active" : ""}`,
          onClick: () => setActiveTab("models"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u53EF\u7528\u6A21\u578B" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsh-a6-tab-badge", children: state.models.length })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        "button",
        {
          type: "button",
          className: `dsh-a6-nav-tab ${activeTab === "account" ? "active" : ""}`,
          onClick: () => setActiveTab("account"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u8D26\u6237\u8D44\u4EA7" }),
            state.balance?.hasAccountAuth && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsh-a6-tab-badge success", children: state.balance.accountBalanceFormatted })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          className: `dsh-a6-nav-tab ${activeTab === "config" ? "active" : ""}`,
          onClick: () => setActiveTab("config"),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u57FA\u7840\u914D\u7F6E" })
        }
      )
    ] }),
    activeTab === "models" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-tab-page models-page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-section-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-filter-group", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "button",
            {
              type: "button",
              className: `dsh-a6-filter-btn ${filterMode === "all" ? "active" : ""}`,
              onClick: () => setFilterMode("all"),
              children: [
                "\u5168\u90E8 (",
                state.models.length,
                ")"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "button",
            {
              type: "button",
              className: `dsh-a6-filter-btn ${filterMode === "enabled" ? "active" : ""}`,
              onClick: () => setFilterMode("enabled"),
              children: [
                "\u5DF2\u542F\u7528 (",
                inDshCount,
                ")"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "button",
            {
              type: "button",
              className: `dsh-a6-filter-btn ${filterMode === "probed" ? "active" : ""}`,
              onClick: () => setFilterMode("probed"),
              children: [
                "\u5DF2\u63A2\u6D4B (",
                probedCount,
                ")"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-toolbar-right", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-search-wrapper", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "input",
              {
                type: "text",
                className: "dsh-a6-input dsh-a6-search-input",
                placeholder: "\u641C\u7D22\u6A21\u578B / \u4F9B\u5E94\u5546 / \u6E20\u9053...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value)
              }
            ),
            searchQuery && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-a6-clear-btn",
                onClick: () => setSearchQuery(""),
                title: "\u6E05\u7A7A\u641C\u7D22",
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              className: `dsh-a6-btn dsh-a6-btn-secondary dsh-a6-btn-sm ${refreshSuccess ? "dsh-a6-btn-refresh-ok" : ""}`,
              onClick: handleRefreshState,
              disabled: refreshing,
              "data-tooltip": "\u91CD\u65B0\u5411 A6API \u63A5\u53E3\u62C9\u53D6\u5F53\u524D\u4EE4\u724C\u7684\u53EF\u7528\u6A21\u578B\u5217\u8868\u53CA\u5DF2\u7F13\u5B58\u5546\u6237\u6307\u6807\uFF08\u4E0D\u6D88\u8017 Token\uFF09",
              "data-tooltip-pos": "down",
              children: refreshing ? "\u5237\u65B0\u4E2D..." : refreshSuccess ? "\u5DF2\u5237\u65B0 \u2713" : "\u5237\u65B0\u5217\u8868"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              className: "dsh-a6-btn dsh-a6-btn-primary dsh-a6-btn-sm",
              onClick: handleProbeAll,
              disabled: probingAll || state.models.length === 0,
              "data-tooltip": "\u5BF9\u5F53\u524D\u4EE4\u724C\u652F\u6301\u7684\u6240\u6709\u6A21\u578B\u9010\u4E2A\u53D1\u9001\u4E00\u6B21\u8BF7\u6C42\uFF0C\u6279\u91CF\u6355\u83B7\u5546\u6237\u8DEF\u7531\u4E0E\u6700\u65B0\u884C\u60C5\uFF08\u6BCF\u4E2A\u6A21\u578B\u6D88\u8017\u5C11\u91CFToken\uFF09",
              "data-tooltip-pos": "down-left",
              children: probingAll ? "\u5168\u91CF\u63A2\u6D4B\u4E2D..." : "\u4E00\u952E\u5168\u91CF\u63A2\u6D4B"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsh-a6-cards-list", children: state.loading && state.models.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsh-a6-empty-state", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsh-a6-spinner" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u6B63\u5728\u8FDE\u63A5 A6API \u805A\u5408\u7AD9\u5E76\u52A0\u8F7D\u6A21\u578B\u884C\u60C5..." })
      ] }) : sortedModels.length > 0 ? sortedModels.map((m) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MerchantCard, { model: m }, m.model_name)) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsh-a6-empty-state", children: searchQuery ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        "\u672A\u641C\u7D22\u5230\u5339\u914D\u300C",
        searchQuery,
        "\u300D\u7684\u6A21\u578B"
      ] }) : filterMode === "enabled" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u5F53\u524D\u5C1A\u672A\u5728 DSH \u4E2D\u542F\u7528\u4EFB\u4F55 A6API \u6A21\u578B\uFF0C\u70B9\u51FB\u6A21\u578B\u5361\u7247\u53F3\u4FA7\u300C\u6DFB\u52A0\u5230 DSH\u300D\u5373\u53EF\u542F\u7528\u3002" }) : filterMode === "probed" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u5C1A\u672A\u63A2\u6D4B\u4EFB\u4F55\u6A21\u578B\u5546\u6237\u7EBF\u8DEF\uFF0C\u70B9\u51FB\u6A21\u578B\u5361\u7247\u4E0A\u7684\u300C\u63A2\u6D4B\u5546\u5BB6\u300D\u6216\u4E0A\u65B9\u300C\u4E00\u952E\u5168\u91CF\u63A2\u6D4B\u300D\u5373\u53EF\u5F00\u59CB\u3002" }) : !state.config.hasApiKey ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u8BF7\u524D\u5F80\u300C\u57FA\u7840\u914D\u7F6E\u300D\u9875\u9762\u586B\u5165\u60A8\u7684 A6API \u4EE4\u724C (API Key) \u5E76\u4FDD\u5B58\uFF0C\u5373\u53EF\u81EA\u52A8\u52A0\u8F7D\u53EF\u7528\u6A21\u578B\u5217\u8868\u3002" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u5F53\u524D\u4EE4\u724C\u6682\u65E0\u53EF\u7528\u6A21\u578B\uFF0C\u8BF7\u68C0\u67E5 A6API \u63A7\u5236\u53F0\u4E2D\u7684\u4EE4\u724C\u9650\u5236\u8BBE\u7F6E\u3002" }) }) })
    ] }),
    activeTab === "account" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsh-a6-tab-page account-page", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      AccountPanel,
      {
        balance: state.balance,
        config: state.config,
        recentLogs: state.recentLogs,
        onNavigateToConfig: () => setActiveTab("config")
      }
    ) }),
    activeTab === "config" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsh-a6-tab-page config-page", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      ConfigPanel,
      {
        config: state.config,
        dshConfiguredModels: state.dshConfiguredModels
      }
    ) })
  ] });
};

// src/client/styles/main.css
var main_default = `/* A6API Plugin Styles - Clean Professional DSH Native Theme Integration */

.dsh-a6-container {
  display: flex;
  flex-direction: column;
  color: var(--dsw-alias-label-primary, var(--ds-text-primary, #1e293b));
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  padding-bottom: 28px;
}

/* ==========================================================================
   1. Master Header & Navigation Tabs (Image 2 Style)
   ========================================================================== */
.dsh-a6-main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.dsh-a6-header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dsh-a6-main-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #0f172a);
  margin: 0;
  line-height: 1.2;
}

.dsh-a6-main-subtitle {
  font-size: 13px;
  color: var(--dsw-alias-label-secondary, #64748b);
  margin: 0;
  line-height: 1.5;
}

.dsh-a6-header-balance-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, #e2e8f0);
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.15s;
}

.dsh-a6-header-balance-badge:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.04);
}

.dsh-a6-hb-label {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #64748b);
}

.dsh-a6-hb-amount {
  font-size: 13px;
  font-weight: 700;
  color: #10b981;
}

/* Nav Tabs */
.dsh-a6-nav-tabs {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, #e2e8f0);
  margin-bottom: 18px;
  margin-top: 4px;
}

.dsh-a6-nav-tab {
  background: transparent;
  border: none;
  padding: 10px 2px 12px 2px;
  font-size: 14px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #64748b);
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
  margin-bottom: -1px;
}

.dsh-a6-nav-tab:hover {
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-nav-tab.active {
  color: var(--dsw-alias-label-primary, #0f172a);
  font-weight: 600;
  border-bottom: 2px solid var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-tab-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.06));
  color: var(--dsw-alias-label-secondary, #64748b);
}

.dsh-a6-tab-badge.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

/* Tab Page Wrapper */
.dsh-a6-tab-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: dsh-a6-fadein 0.15s ease-out;
}

@keyframes dsh-a6-fadein {
  from {
    opacity: 0.8;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================================================================
   2. Models Tab Toolbar & Filters
   ========================================================================== */
.dsh-a6-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 100;
}

.dsh-a6-filter-group {
  display: flex;
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--dsw-alias-border-l3, #cbd5e1);
  border-radius: 6px;
  padding: 2px;
}

.dsh-a6-filter-btn {
  background: transparent;
  border: none;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  color: var(--dsw-alias-label-secondary, #64748b);
  cursor: pointer;
  transition: all 0.15s;
}

.dsh-a6-filter-btn:hover {
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-filter-btn.active {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--dsw-alias-label-primary, #0f172a);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.dsh-a6-toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.dsh-a6-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.dsh-a6-search-input {
  width: 200px;
  height: 30px;
  padding-right: 22px;
  font-size: 12px;
}

.dsh-a6-clear-btn {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  line-height: 1;
}

/* ==========================================================================
   3. Clean Model Card
   ========================================================================== */
.dsh-a6-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dsh-a6-official-card {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, #e2e8f0);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.dsh-a6-official-card:hover {
  border-color: var(--dsw-alias-border-l1, #cbd5e1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.dsh-a6-official-card.in-dsh {
  border-left: 3px solid #10b981;
}

/* Main Top Bar */
.dsh-a6-card-main-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
  user-select: none;
  flex-wrap: wrap;
}

/* Identity Col (Clean text without Brand Logos) */
.dsh-a6-bar-identity {
  display: flex;
  align-items: center;
  min-width: 180px;
  flex: 1.2;
}

.dsh-a6-title-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dsh-a6-title-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dsh-a6-name-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #0f172a);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
}

.dsh-a6-dot-sep {
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-merchant-id-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #475569);
}

.dsh-a6-sub-desc {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

/* Pricing Col */
.dsh-a6-bar-pricing {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.dsh-a6-bar-pricing.unprobed {
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  font-size: 12px;
}

.dsh-a6-unprobed-hint.error {
  color: #dc2626;
  font-weight: 600;
}

.dsh-a6-price-col {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dsh-a6-price-top {
  font-size: 13px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-price-btm {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-ratio-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
  background: #f0fdfa;
  color: #0d9488;
  border: 1px solid #99f6e4;
  white-space: nowrap;
}

/* Uptime / Health Col (\u5B9E\u65F6 / 24h / 7d) */
.dsh-a6-bar-uptime {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 130px;
}

.dsh-a6-uptime-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
}

.dsh-a6-uptime-label {
  width: 24px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  font-size: 10px;
}

.dsh-a6-dots-track {
  display: flex;
  gap: 2px;
  align-items: center;
}

.dsh-a6-rate-dot {
  width: 4px;
  height: 8px;
  border-radius: 2px;
  background: #10b981;
}

.dsh-a6-rate-dot.green {
  background: #10b981;
}

.dsh-a6-rate-dot.yellow {
  background: #f59e0b;
}

.dsh-a6-rate-dot.red {
  background: #ef4444;
}

.dsh-a6-rate-dot.empty {
  background: var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.1));
}

.dsh-a6-uptime-val {
  font-weight: 600;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary, #475569);
  min-width: 38px;
  text-align: right;
}

/* Performance Col (Speed / Cache Hit Bar) */
.dsh-a6-bar-perf {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dsh-a6-perf-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dsh-a6-latency-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-cache-hit-text {
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
}

.dsh-a6-hit-track {
  width: 38px;
  height: 4px;
  border-radius: 2px;
  background: var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.08));
  overflow: hidden;
}

.dsh-a6-hit-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #f59e0b, #eab308);
}

/* Smart Tags */
.dsh-a6-bar-tags {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
}

.dsh-a6-smart-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.08));
  color: var(--dsw-alias-label-secondary, #475569);
}

.dsh-a6-smart-pill.tag-stable {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
  color: #10b981;
}

.dsh-a6-smart-pill.tag-cheap {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
}

.dsh-a6-smart-pill.tag-fast {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.25);
  color: #ea580c;
}

.dsh-a6-smart-pill.tag-quality {
  background: rgba(234, 179, 8, 0.08);
  border-color: rgba(234, 179, 8, 0.25);
  color: #ca8a04;
}

.dsh-a6-smart-pill.tag-guarantee {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #059669;
}

/* Right Actions Group */
.dsh-a6-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dsh-a6-time-ago {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-btn-in-dsh {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #059669;
}

.dsh-a6-btn-in-dsh:hover {
  background: rgba(16, 185, 129, 0.2);
}

.dsh-a6-expand-toggle-btn {
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l3, #cbd5e1);
  border-radius: 6px;
  color: var(--dsw-alias-label-secondary, #64748b);
  cursor: pointer;
  font-size: 11px;
  padding: 4px 8px;
  height: 28px;
  transition: all 0.15s;
}

.dsh-a6-expand-toggle-btn:hover {
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.04));
  color: var(--dsw-alias-label-primary, #0f172a);
}

/* ==========================================================================
   4. Bottom Detailed Comparison Box
   ========================================================================== */
.dsh-a6-detail-container {
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--dsw-alias-border-l3, rgba(226, 232, 240, 0.8));
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dsh-a6-detail-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.dsh-a6-dt-left,
.dsh-a6-dt-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-a6-dt-label {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-dt-desc {
  font-size: 12px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #1e293b);
}

.dsh-a6-dt-channel-name {
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
}

.dsh-a6-dt-divider {
  height: 1px;
  background: var(--dsw-alias-border-l3, rgba(226, 232, 240, 0.6));
  margin: 1px 0;
}

/* Price Comparison Table */
.dsh-a6-dt-table-col {
  overflow-x: auto;
}

.dsh-a6-price-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.dsh-a6-price-table th {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  border-bottom: 1px solid var(--dsw-alias-border-l3, rgba(226, 232, 240, 0.6));
}

.dsh-a6-th-blank {
  width: 50px;
}

.dsh-a6-price-table td {
  padding: 5px 8px;
}

.dsh-a6-td-label {
  color: var(--dsw-alias-label-secondary, #64748b);
  font-weight: 500;
}

.dsh-a6-tr-official td {
  color: var(--dsw-alias-label-secondary, #64748b);
}

.dsh-a6-tr-merchant td {
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-td-bold {
  font-weight: 700;
}

/* ==========================================================================
   5. Account Tab & Asset Panel Styles
   ========================================================================== */
.dsh-a6-account-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dsh-a6-balance-banner {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(226, 232, 240, 0.8));
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
}

.dsh-a6-balance-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #6366f1 100%);
}

.dsh-a6-balance-banner.low-balance::before {
  background: linear-gradient(90deg, #ef4444 0%, #f59e0b 100%);
}

.dsh-a6-balance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.dsh-a6-balance-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dsh-a6-balance-main-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dsh-a6-balance-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #64748b);
}

.dsh-a6-balance-num-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.dsh-a6-balance-amount {
  font-size: 26px;
  font-weight: 700;
  color: #10b981;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.dsh-a6-balance-amount.unauthed {
  font-size: 22px;
  color: var(--dsw-alias-label-secondary, #64748b);
}

.dsh-a6-balance-banner.low-balance .dsh-a6-balance-amount {
  color: #ef4444;
}

.dsh-a6-balance-cny {
  font-size: 14px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #64748b);
}

.dsh-a6-status-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
}

.dsh-a6-status-pill.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.dsh-a6-status-pill.warn {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.dsh-a6-low-alert {
  display: inline-flex;
  align-items: center;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.dsh-a6-balance-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Stat KPI Cards Grid */
.dsh-a6-stat-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 768px) {
  .dsh-a6-stat-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dsh-a6-kpi-card {
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--dsw-alias-border-l3, rgba(226, 232, 240, 0.6));
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dsh-a6-kpi-label {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-kpi-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f172a);
}

/* Auth Banner Box */
.dsh-a6-auth-banner-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  flex-wrap: wrap;
}

.dsh-a6-auth-banner-title {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 2px;
}

.dsh-a6-auth-banner-desc {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #475569);
  line-height: 1.4;
}

/* Recent Logs Section */
.dsh-a6-logs-section {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, #e2e8f0);
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dsh-a6-logs-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dsh-a6-logs-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-logs-subtitle {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-logs-table-wrapper {
  overflow-x: auto;
}

.dsh-a6-logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.dsh-a6-logs-table th {
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #64748b);
  border-bottom: 1px solid var(--dsw-alias-border-l2, #e2e8f0);
}

.dsh-a6-logs-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--dsw-alias-border-l3, rgba(226, 232, 240, 0.5));
}

.dsh-a6-log-time {
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  font-size: 11px;
}

.dsh-a6-log-channel-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border-radius: 4px;
}

.dsh-a6-log-status {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 10px;
}

.dsh-a6-log-status.ok {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.dsh-a6-log-status.err {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.dsh-a6-log-cost {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #475569);
  font-weight: 500;
}

.dsh-a6-btn-refresh-ok {
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
  background: rgba(16, 185, 129, 0.08) !important;
}

.dsh-a6-empty-logs {
  padding: 20px;
  text-align: center;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  font-size: 12px;
}

/* ==========================================================================
   6. Configuration Tab Styles
   ========================================================================== */
.dsh-a6-config-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dsh-a6-config-section {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, #e2e8f0);
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dsh-a6-section-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dsh-a6-heading-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-heading-desc {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #64748b);
  line-height: 1.4;
}

.dsh-a6-node-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dsh-a6-node-pill {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l3, #cbd5e1);
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s;
}

.dsh-a6-node-pill:hover {
  background: var(--dsw-alias-bg-layer-2, #f8fafc);
  border-color: #94a3b8;
}

.dsh-a6-node-pill.active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
  font-weight: 500;
}

.dsh-a6-config-fields-grid {
  display: flex;
  gap: 14px;
}

@media (max-width: 768px) {
  .dsh-a6-config-fields-grid {
    flex-direction: column;
  }
}

.dsh-a6-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.dsh-a6-field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dsh-a6-field-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-a6-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #475569);
}

.dsh-a6-field-hint {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  line-height: 1.4;
}

.dsh-a6-field-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 1px;
}

.dsh-a6-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.dsh-a6-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l3, #cbd5e1);
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1e293b);
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.dsh-a6-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.dsh-a6-help-drawer {
  background: var(--dsw-alias-bg-layer-1, #f8fafc);
  border: 1px dashed var(--dsw-alias-border-l2, #cbd5e1);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #475569);
}

.dsh-a6-help-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f172a);
  margin-bottom: 4px;
}

.dsh-a6-help-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dsh-a6-help-list code {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}

.dsh-a6-integration-card {
  background: var(--dsw-alias-bg-layer-1, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--dsw-alias-border-l3, rgba(226, 232, 240, 0.6));
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dsh-a6-int-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.dsh-a6-int-key {
  width: 100px;
  color: var(--dsw-alias-label-tertiary, #94a3b8);
}

.dsh-a6-int-val {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f172a);
}

.dsh-a6-int-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.dsh-a6-model-chip {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.dsh-a6-empty-hint {
  color: var(--dsw-alias-label-tertiary, #94a3b8);
  font-size: 12px;
}

.dsh-a6-save-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.dsh-a6-success-msg {
  color: #10b981;
  font-size: 12px;
  font-weight: 500;
}

/* ==========================================================================
   7. Buttons & Common State Styles
   ========================================================================== */
.dsh-a6-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
}

.dsh-a6-btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.dsh-a6-btn-primary:hover {
  background: #2563eb;
}

.dsh-a6-btn-secondary {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border-color: var(--dsw-alias-border-l3, #cbd5e1);
  color: var(--dsw-alias-label-primary, #334155);
}

.dsh-a6-btn-secondary:hover {
  background: var(--dsw-alias-bg-layer-2, #f8fafc);
  border-color: #94a3b8;
}

.dsh-a6-btn-sm {
  height: 28px;
  padding: 0 9px;
  font-size: 12px;
}

.dsh-a6-btn-xs {
  height: 26px;
  padding: 0 8px;
  font-size: 11px;
}

.dsh-a6-btn-text {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  padding: 1px 3px;
}

.dsh-a6-btn-text:hover {
  text-decoration: underline;
}

.dsh-a6-empty-state {
  text-align: center;
  padding: 36px 20px;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px dashed var(--dsw-alias-border-l2, #e2e8f0);
  border-radius: 10px;
  color: var(--dsw-alias-label-secondary, #64748b);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.dsh-a6-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: dsh-a6-spin 0.8s linear infinite;
}

@keyframes dsh-a6-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==========================================================================
   8. Instant Custom Tooltip (Zero-Delay, High Contrast)
   ========================================================================== */
[data-tooltip] {
  position: relative;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 7px);
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 9px;
  background: rgba(15, 23, 42, 0.94);
  color: #f8fafc;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.35;
  white-space: nowrap;
  border-radius: 5px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.04s ease-out, visibility 0.04s ease-out;
  z-index: 99999;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

[data-tooltip]::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px 5px 0 5px;
  border-style: solid;
  border-color: rgba(15, 23, 42, 0.94) transparent transparent transparent;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.04s ease-out, visibility 0.04s ease-out;
  z-index: 99999;
}

[data-tooltip]:hover::after,
[data-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
}

[data-tooltip-pos="left"]::after {
  left: auto;
  right: 0;
  transform: none;
}

[data-tooltip-pos="left"]::before {
  left: auto;
  right: 14px;
  transform: none;
}

[data-tooltip-pos="right"]::after {
  left: 0;
  right: auto;
  transform: none;
}

[data-tooltip-pos="right"]::before {
  left: 14px;
  right: auto;
  transform: none;
}

/* Down positions (for top toolbar and header buttons) */
[data-tooltip-pos="down"]::after {
  top: calc(100% + 7px);
  bottom: auto;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}

[data-tooltip-pos="down"]::before {
  top: calc(100% + 2px);
  bottom: auto;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent rgba(15, 23, 42, 0.94) transparent;
}

[data-tooltip-pos="down-left"]::after {
  top: calc(100% + 7px);
  bottom: auto;
  left: auto;
  right: 0;
  transform: none;
}

[data-tooltip-pos="down-left"]::before {
  top: calc(100% + 2px);
  bottom: auto;
  left: auto;
  right: 14px;
  transform: none;
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent rgba(15, 23, 42, 0.94) transparent;
}

[data-tooltip-pos="down-right"]::after {
  top: calc(100% + 7px);
  bottom: auto;
  left: 0;
  right: auto;
  transform: none;
}

[data-tooltip-pos="down-right"]::before {
  top: calc(100% + 2px);
  bottom: auto;
  left: 14px;
  right: auto;
  transform: none;
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent rgba(15, 23, 42, 0.94) transparent;
}

/* Card actions tooltip default alignment */
.dsh-a6-bar-actions [data-tooltip]:not([data-tooltip-pos])::after {
  left: 0;
  transform: none;
}

.dsh-a6-bar-actions [data-tooltip]:not([data-tooltip-pos])::before {
  left: 16px;
  transform: none;
}
`;

// src/client/index.ts
var name = "@lynn123411/dsh-a6api";
var inject = ["slots"];
function injectStyles() {
  if (typeof document === "undefined") return;
  const styleId = "dsh-a6api-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = main_default;
    document.head.appendChild(style);
  }
}
function apply(ctx) {
  injectStyles();
  if (typeof window === "undefined") return;
  try {
    const slots = ctx?.slots || (ctx?.get ? ctx.get("slots") : null);
    if (!slots || typeof slots.inject !== "function") return;
    slots.inject("settings.section", () => {
      return slots.register(
        {
          name: "settings.section",
          id: "dsh-a6api",
          order: 4,
          label: () => "A6API \u805A\u5408\u7AD9"
        },
        A6ApiSettingsPanel
      );
    });
  } catch (err) {
    console.warn("[dsh-a6api] Failed to inject settings section:", err);
  }
}
return module.exports; } });
//# sourceMappingURL=client.js.map
