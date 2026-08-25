window.__ModuleLoader__.load({ id: 'dsh-chat-tidy', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
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
  STYLE_MARKER: () => STYLE_MARKER,
  TIDY_CHAT_CSS: () => TIDY_CHAT_CSS,
  adoptStyles: () => adoptStyles,
  apply: () => apply,
  chatTranslateObserver: () => chatTranslateObserver,
  inject: () => inject,
  name: () => name,
  setupSettingsUi: () => setupSettingsUi
});
module.exports = __toCommonJS(index_exports);

// src/client/styles.ts
var STYLE_MARKER = "dsh-chat-tidy";
var TIDY_CHAT_CSS = String.raw`
:root {
  --dsh-ct-font-size: 14px;
  --dsh-ct-line-height: 22px;
  --dsh-ct-block-gap: 11px;
  --dsh-ct-heading-top: 20px;
  --dsh-ct-heading-bottom: 10px;
  --dsh-ct-list-indent: 21px;
  --dsh-ct-user-width: 560px;
}

body [data-chat-flow] {
  gap: 14px;
}

body [data-conversation-scroll] :where(div):has(> [data-chat-flow]) {
  padding-block: 18px 26px;
}

body [data-chat-flow-kind='assistant-step'] > [data-slot='conversation.chat.node'] > div {
  font-size: var(--dsh-ct-font-size);
  line-height: var(--dsh-ct-line-height);
}

body [data-chat-flow-kind='assistant-step'] > [data-slot='conversation.chat.node'] > div > div:first-child {
  gap: var(--dsh-ct-block-gap);
}

body [data-chat-flow-kind='assistant-step'] :where(h1, h2, h3, h4, h5, h6) {
  margin-block: var(--dsh-ct-heading-top) var(--dsh-ct-heading-bottom);
  font-weight: 600;
}

body [data-chat-flow-kind='assistant-step'] h1 {
  font-size: 24px;
  line-height: 30px;
}

body [data-chat-flow-kind='assistant-step'] h2 {
  font-size: 20px;
  line-height: 25px;
}

body [data-chat-flow-kind='assistant-step'] :where(h3, h4) {
  font-size: 17px;
  line-height: 22px;
}

body [data-chat-flow-kind='assistant-step'] :where(h5, h6) {
  font-size: 15px;
  line-height: 20px;
}

body [data-chat-flow-kind='assistant-step'] :where(p, li, blockquote, th, td) {
  font-size: var(--dsh-ct-font-size);
  line-height: var(--dsh-ct-line-height);
}

body [data-chat-flow-kind='assistant-step'] p {
  margin-block: 0 var(--dsh-ct-block-gap);
}

body [data-chat-flow-kind='assistant-step'] :where(ul, ol) {
  margin-block: 0 var(--dsh-ct-heading-bottom);
  padding-inline-start: var(--dsh-ct-list-indent);
}

body [data-chat-flow-kind='assistant-step'] li:not(:first-child) {
  margin-top: 8px;
}

body [data-chat-flow-kind='assistant-step'] li > p {
  margin-block: 0 var(--dsh-ct-block-gap);
}

body [data-chat-flow-kind='assistant-step'] blockquote {
  position: relative;
  margin-block: 0 var(--dsh-ct-block-gap);
  padding-block: 4px;
  padding-inline-start: 18px;
  border-inline-start: 0;
  color: var(--dsw-alias-label-secondary);
}

/* Codex draws the quote rule as a rounded 4px bar, which a border cannot round. */
body [data-chat-flow-kind='assistant-step'] blockquote::before {
  content: '';
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 4px;
  border-radius: 2px;
  background: var(--dsw-alias-border-l3);
}

body [data-chat-flow-kind='assistant-step'] :where(pre, .md-code-block) {
  margin-block: 12px;
}

body [data-chat-flow-kind='assistant-step'] :not(pre) > code {
  padding: 1px 6px;
  box-decoration-break: clone;
}

body [data-chat-flow-kind='assistant-step'] hr {
  margin-block: 28px;
}

body [data-chat-flow-kind='assistant-step'] :where(th, td) {
  padding-block: 8px;
  padding-inline: 12px;
}

body [data-chat-flow] [data-disclosure-row] {
  height: 22px;
}

body [data-chat-flow] [data-disclosure-row] > span {
  font-size: 13px;
  line-height: 22px;
}

body [data-chat-flow-kind='user'] [data-time-hover-root] > div:first-child {
  max-width: min(var(--dsh-ct-user-width), 78%);
}

body [data-chat-flow-kind='user'] [data-time-hover-root] > div:first-child > div:not([data-align]) {
  padding: 9px 14px;
  border-radius: 18px;
  font-size: var(--dsh-ct-font-size);
  line-height: var(--dsh-ct-line-height);
}

body [data-turn-tail] {
  gap: 10px;
}

body [data-composer-card] {
  gap: 10px;
  padding-top: 8px;
  border-radius: 18px;
  font-size: var(--dsh-ct-font-size);
  line-height: var(--dsh-ct-line-height);
}

@media (max-width: 700px) {
  body [data-chat-flow-kind='user'] [data-time-hover-root] > div:first-child {
    max-width: 88%;
  }
}
`;
var records = /* @__PURE__ */ new WeakMap();
function adoptStyles(document2) {
  const current = records.get(document2);
  if (current !== void 0) {
    current.references += 1;
    return () => {
      releaseStyles(document2);
    };
  }
  const element = document2.createElement("style");
  element.dataset.plugin = STYLE_MARKER;
  element.textContent = TIDY_CHAT_CSS;
  document2.head.appendChild(element);
  records.set(document2, { element, references: 1 });
  return () => {
    releaseStyles(document2);
  };
}
function releaseStyles(document2) {
  const record = records.get(document2);
  if (record === void 0) return;
  record.references -= 1;
  if (record.references > 0) return;
  record.element.remove();
  records.delete(document2);
}

// src/client/translate/client-cache.ts
var CACHE_KEY = "dsh-chat-tidy:cache";
var MAX_LOCAL_ENTRIES = 500;
var ClientCache = class {
  memCache = /* @__PURE__ */ new Map();
  dirty = false;
  saveTimer = null;
  constructor() {
    this.load();
  }
  load() {
    if (typeof localStorage === "undefined") return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object") {
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === "string") {
              this.memCache.set(k, v);
            }
          }
        }
      }
    } catch {
    }
  }
  get(text) {
    const key = text.trim().toLowerCase();
    return this.memCache.get(key);
  }
  set(text, translated) {
    const key = text.trim().toLowerCase();
    if (this.memCache.has(key)) {
      this.memCache.delete(key);
    } else if (this.memCache.size >= MAX_LOCAL_ENTRIES) {
      const oldest = this.memCache.keys().next().value;
      if (oldest !== void 0) {
        this.memCache.delete(oldest);
      }
    }
    this.memCache.set(key, translated);
    this.dirty = true;
    this.scheduleSave();
  }
  scheduleSave() {
    if (this.saveTimer !== null || typeof window === "undefined") return;
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      if (this.dirty) {
        this.dirty = false;
        try {
          const obj = {};
          for (const [k, v] of this.memCache.entries()) {
            obj[k] = v;
          }
          localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
        } catch {
        }
      }
    }, 2e3);
  }
};
var clientCache = new ClientCache();

// src/client/translate/api.ts
var EXACT_PATTERNS = {
  "list files in current directory": "\u5217\u51FA\u5F53\u524D\u76EE\u5F55\u6587\u4EF6",
  "show working tree status": "\u67E5\u770B Git \u5DE5\u4F5C\u533A\u72B6\u6001",
  "check git status": "\u67E5\u770B Git \u72B6\u6001",
  "check working tree status": "\u67E5\u770B\u5DE5\u4F5C\u533A\u72B6\u6001",
  "check workspace structure": "\u68C0\u67E5\u5DE5\u4F5C\u533A\u76EE\u5F55\u7ED3\u6784",
  "list plugins": "\u5217\u51FA\u63D2\u4EF6\u5217\u8868",
  "run build": "\u6267\u884C\u9879\u76EE\u6784\u5EFA",
  "run tests": "\u8FD0\u884C\u6D4B\u8BD5",
  "run linter": "\u4EE3\u7801\u98CE\u683C\u68C0\u67E5",
  "typecheck project": "TypeScript \u7C7B\u578B\u68C0\u67E5"
};
var PREFIX_PATTERNS = [
  [/^locate\s+(.+)$/i, (m) => `\u5B9A\u4F4D ${m[1]}`],
  [/^inspect\s+(.+)$/i, (m) => `\u68C0\u67E5 ${m[1]}`],
  [/^explore\s+(.+)$/i, (m) => `\u6D4F\u89C8 ${m[1]}`],
  [/^read\s+file\s*(.*)$/i, (m) => `\u8BFB\u53D6\u6587\u4EF6 ${m[1]}`.trim()],
  [/^read\s+(.+)$/i, (m) => `\u8BFB\u53D6 ${m[1]}`],
  [/^write\s+file\s*(.*)$/i, (m) => `\u5199\u5165\u6587\u4EF6 ${m[1]}`.trim()],
  [/^write\s+(.+)$/i, (m) => `\u5199\u5165 ${m[1]}`],
  [/^edit\s+file\s*(.*)$/i, (m) => `\u7F16\u8F91\u6587\u4EF6 ${m[1]}`.trim()],
  [/^edit\s+(.+)$/i, (m) => `\u7F16\u8F91 ${m[1]}`],
  [/^create\s+file\s*(.*)$/i, (m) => `\u521B\u5EFA\u6587\u4EF6 ${m[1]}`.trim()],
  [/^create\s+(.+)$/i, (m) => `\u521B\u5EFA ${m[1]}`],
  [/^delete\s+file\s*(.*)$/i, (m) => `\u5220\u9664\u6587\u4EF6 ${m[1]}`.trim()],
  [/^delete\s+(.+)$/i, (m) => `\u5220\u9664 ${m[1]}`],
  [/^search\s+files?\s*(.*)$/i, (m) => `\u641C\u7D22\u6587\u4EF6 ${m[1]}`.trim()],
  [/^search\s+(.+)$/i, (m) => `\u641C\u7D22 ${m[1]}`],
  [/^find\s+files?\s*(.*)$/i, (m) => `\u67E5\u627E\u6587\u4EF6 ${m[1]}`.trim()],
  [/^find\s+(.+)$/i, (m) => `\u67E5\u627E ${m[1]}`],
  [/^grep\s+(.+)$/i, (m) => `\u68C0\u7D22\u6587\u672C ${m[1]}`],
  [/^check\s+(.+)$/i, (m) => `\u68C0\u67E5 ${m[1]}`],
  [/^run\s+command:\s*(.+)$/i, (m) => `\u8FD0\u884C\u547D\u4EE4: ${m[1]}`],
  [/^run\s+(.+)$/i, (m) => `\u8FD0\u884C ${m[1]}`],
  [/^execute\s+(.+)$/i, (m) => `\u6267\u884C ${m[1]}`],
  [/^install\s+(.+)$/i, (m) => `\u5B89\u88C5 ${m[1]}`],
  [/^build\s+(.+)$/i, (m) => `\u6784\u5EFA ${m[1]}`],
  [/^verify\s+(.+)$/i, (m) => `\u9A8C\u8BC1 ${m[1]}`],
  [/^test\s+(.+)$/i, (m) => `\u6D4B\u8BD5 ${m[1]}`],
  [/^stage\s+(.+)$/i, (m) => `\u6682\u5B58 ${m[1]}`],
  [/^commit\s+(.+)$/i, (m) => `\u63D0\u4EA4 ${m[1]}`],
  [/^list\s+(.+)$/i, (m) => `\u5217\u51FA ${m[1]}`],
  [/^clean\s+(.+)$/i, (m) => `\u6E05\u7406 ${m[1]}`],
  [/^update\s+(.+)$/i, (m) => `\u66F4\u65B0 ${m[1]}`],
  [/^fetch\s+(.+)$/i, (m) => `\u83B7\u53D6 ${m[1]}`],
  [/^expand\s+(.+)$/i, (m) => `\u5C55\u5F00 ${m[1]}`]
];
function fallbackTranslateLocal(text) {
  const raw = text.trim();
  const lower = raw.toLowerCase();
  if (EXACT_PATTERNS[lower]) return EXACT_PATTERNS[lower];
  for (const [pattern, formatter] of PREFIX_PATTERNS) {
    const match = pattern.exec(raw);
    if (match) return formatter(match);
  }
  return raw;
}
async function fallbackTranslateMyMemory(text) {
  const local = fallbackTranslateLocal(text);
  if (local !== text) return local;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    const trans = json?.responseData?.translatedText?.trim();
    if (trans && !trans.startsWith("MYMEMORY WARNING:")) {
      return trans;
    }
  } catch {
  }
  return text;
}
async function requestTranslateBatch(texts) {
  if (texts.length === 0) return [];
  try {
    const res = await fetch("/api/dsh-chat-tidy/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ texts })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch {
  }
  const results = await Promise.all(
    texts.map(async (t) => {
      const translated = await fallbackTranslateMyMemory(t);
      return {
        original: t,
        translated: translated || t,
        channel: "fallback-client",
        cached: false
      };
    })
  );
  return results;
}
async function fetchServerConfig() {
  try {
    const res = await fetch("/api/dsh-chat-tidy/config");
    if (!res.ok) return null;
    const json = await res.json();
    return json.config;
  } catch {
    return null;
  }
}
async function updateServerConfig(updates) {
  try {
    const res = await fetch("/api/dsh-chat-tidy/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.config;
  } catch {
    return null;
  }
}
async function testServerChannel(channel) {
  try {
    const res = await fetch("/api/dsh-chat-tidy/test-channel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel })
    });
    return await res.json();
  } catch (err) {
    return { ok: false, latencyMs: 0, error: err?.message || String(err) };
  }
}

// src/client/translate/lazy.ts
var LazyTranslationQueue = class {
  batchQueue = [];
  debounceTimer = null;
  observe(element, text) {
    const cached = clientCache.get(text);
    if (cached) {
      this.applyTranslation(element, cached, text);
      return;
    }
    this.enqueueBatch(element, text);
  }
  enqueueBatch(element, text) {
    this.batchQueue.push({ element, text });
    if (this.debounceTimer === null) {
      this.debounceTimer = window.setTimeout(() => {
        this.debounceTimer = null;
        this.flushBatch();
      }, 80);
    }
  }
  async flushBatch() {
    if (this.batchQueue.length === 0) return;
    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];
    const textMap = /* @__PURE__ */ new Map();
    for (const item of currentBatch) {
      if (!item.element.isConnected) continue;
      const cached = clientCache.get(item.text);
      if (cached) {
        this.applyTranslation(item.element, cached, item.text);
        continue;
      }
      const list = textMap.get(item.text) || [];
      list.push(item.element);
      textMap.set(item.text, list);
    }
    const uniqueTexts = Array.from(textMap.keys());
    if (uniqueTexts.length === 0) return;
    const results = await requestTranslateBatch(uniqueTexts);
    for (const res of results) {
      if (res.translated && res.translated.trim()) {
        clientCache.set(res.original, res.translated);
        const elements = textMap.get(res.original) || [];
        for (const el of elements) {
          if (el.isConnected) {
            this.applyTranslation(el, res.translated, res.original);
          }
        }
      }
    }
  }
  applyTranslation(element, translated, original) {
    if (!element.isConnected) return;
    element.dataset.tidyTranslated = "true";
    element.dataset.original = original;
    element.textContent = translated;
  }
  disconnect() {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.batchQueue = [];
  }
};
var lazyQueue = new LazyTranslationQueue();

// src/client/translate/observer.ts
var CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5]/;
var TOOL_TITLE_SELECTOR = [
  '[data-chat-call-id] [class*="summary"]',
  '[data-slot="tool.call.toolview"] [class*="summary"]',
  '[data-sample] [class*="summary"]',
  '[data-variant] [class*="summary"]',
  "[data-tool] [data-disclosure-row] > span:not([aria-hidden])",
  '[data-disclosure-row] [class*="summary"]'
].join(", ");
function isToolSummarySpan(span) {
  if (span.hasAttribute("aria-hidden")) return false;
  if (span.closest('[data-variant="think"], [data-sample="think"], [class*="_reasoning_"], [data-slot="conversation.reasoning"], .QWLzlG_row')) {
    return false;
  }
  if (span.parentElement && span.parentElement.textContent?.includes("Think")) {
    return false;
  }
  if (span.closest('[data-chat-call-id], [data-slot="tool.call.toolview"], [data-sample], [data-variant], [data-tool]')) {
    return true;
  }
  return false;
}
var ChatTranslateObserver = class {
  observer = null;
  rootElement = null;
  isEnabled = true;
  constructor() {
    this.handleMutations = this.handleMutations.bind(this);
  }
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.disconnect();
    } else {
      this.start();
    }
  }
  start(documentRef = document) {
    if (!this.isEnabled || typeof window === "undefined") {
      return () => {
      };
    }
    const findAndObserveRoot = () => {
      const root = documentRef.querySelector("[data-chat-flow]") ?? documentRef.querySelector("[data-conversation-scroll]") ?? documentRef.body;
      if (!root) {
        window.setTimeout(findAndObserveRoot, 200);
        return;
      }
      this.rootElement = root;
      this.scanContainer(root);
      if (!this.observer) {
        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-state", "data-tool", "data-variant", "data-sample", "aria-expanded"]
        });
      }
    };
    findAndObserveRoot();
    return () => {
      this.disconnect();
    };
  }
  handleMutations(mutations) {
    if (!this.isEnabled) return;
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node instanceof HTMLElement) {
            this.scanNode(node);
          }
        }
      } else if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target instanceof HTMLElement) {
          this.scanNode(target);
        }
      }
    }
  }
  scanContainer(container) {
    const spans = container.querySelectorAll(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span)) {
        this.processSpan(span);
      }
    });
  }
  scanNode(node) {
    if (node.tagName === "SPAN" && isToolSummarySpan(node)) {
      this.processSpan(node);
      return;
    }
    const spans = node.querySelectorAll(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span)) {
        this.processSpan(span);
      }
    });
  }
  processSpan(span) {
    const text = span.textContent?.trim() || "";
    if (!text) return;
    if (CHINESE_CHAR_REGEX.test(text)) {
      span.dataset.tidyTranslated = "true";
      return;
    }
    if (span.dataset.tidyTranslated === "true") {
      const original = span.dataset.original;
      if (original) {
        const cached2 = clientCache.get(original);
        if (cached2 && text === cached2) {
          return;
        }
      }
    }
    const cached = clientCache.get(text);
    if (cached) {
      span.dataset.tidyTranslated = "true";
      span.dataset.original = text;
      span.textContent = cached;
      return;
    }
    lazyQueue.observe(span, text);
  }
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    lazyQueue.disconnect();
    this.rootElement = null;
  }
};
var chatTranslateObserver = new ChatTranslateObserver();

// src/client/settings/ui.tsx
var import_react = require("react");

// src/client/settings/store.ts
var LS_PREFIX = "dsh-chat-tidy:";
var LS_ENABLED = `${LS_PREFIX}enabled`;
var LS_CONCURRENCY = `${LS_PREFIX}concurrency`;
var LS_CHANNELS = `${LS_PREFIX}channels`;
var LS_GATEWAY_URL = `${LS_PREFIX}gateway-url`;
var LS_GATEWAY_ENGINE = `${LS_PREFIX}gateway-engine`;
var CHANNEL_NAMES = {
  siliconflow: "\u7845\u57FA\u6D41\u52A8 (Qwen2.5-7B)",
  zhipu: "\u667A\u8C31 AI (glm-4-flash)",
  bing: "\u5FAE\u8F6F Bing \u7F51\u9875\u7FFB\u8BD1 (\u514DKey\u76F4\u8FDE)",
  gateway: "\u672C\u5730\u7FFB\u8BD1\u7F51\u5173 (DeepLX \u517C\u5BB9)",
  mymemory: "MyMemory \u514D\u8D39\u673A\u5668\u7FFB\u8BD1 (\u514DKey)",
  builtin: "\u79BB\u7EBF\u6280\u672F\u8BCD\u5178 (0ms\u515C\u5E95)"
};
var ALL_CHANNELS = ["siliconflow", "zhipu", "bing", "gateway", "mymemory", "builtin"];
var SettingsStore = class {
  state = {
    enabled: true,
    concurrency: 3,
    channels: [...ALL_CHANNELS],
    siliconflowKey: "",
    zhipuKey: "",
    hasSiliconflowKey: false,
    hasZhipuKey: false,
    gatewayUrl: "",
    gatewayEngine: "bing",
    hasGatewayUrl: false
  };
  listeners = /* @__PURE__ */ new Set();
  constructor() {
    this.loadFromLocalStorage();
    this.syncFromServer();
  }
  loadFromLocalStorage() {
    if (typeof localStorage === "undefined") return;
    try {
      const enabledRaw = localStorage.getItem(LS_ENABLED);
      if (enabledRaw !== null) {
        this.state.enabled = enabledRaw === "true";
      }
      const concurrencyRaw = localStorage.getItem(LS_CONCURRENCY);
      if (concurrencyRaw !== null) {
        const c = parseInt(concurrencyRaw, 10);
        if (!isNaN(c) && c >= 1 && c <= 6) {
          this.state.concurrency = c;
        }
      }
      const channelsRaw = localStorage.getItem(LS_CHANNELS);
      if (channelsRaw !== null) {
        const arr = JSON.parse(channelsRaw);
        if (Array.isArray(arr) && arr.length > 0) {
          const migrated = arr.map((x) => x === "google" ? "gateway" : x);
          const filtered = migrated.filter((x) => ALL_CHANNELS.includes(x));
          for (const ch of ALL_CHANNELS) {
            if (!filtered.includes(ch)) filtered.push(ch);
          }
          this.state.channels = filtered;
        }
      }
      const gatewayUrlRaw = localStorage.getItem(LS_GATEWAY_URL);
      if (gatewayUrlRaw !== null) {
        this.state.gatewayUrl = gatewayUrlRaw;
        this.state.hasGatewayUrl = gatewayUrlRaw.trim().length > 0;
      }
      const gatewayEngineRaw = localStorage.getItem(LS_GATEWAY_ENGINE);
      if (gatewayEngineRaw === "google" || gatewayEngineRaw === "bing") {
        this.state.gatewayEngine = gatewayEngineRaw;
      }
    } catch {
    }
  }
  async syncFromServer() {
    const config = await fetchServerConfig();
    if (config) {
      this.state = {
        ...this.state,
        enabled: config.enabled ?? this.state.enabled,
        concurrency: config.concurrency ?? this.state.concurrency,
        channels: config.channels ?? this.state.channels,
        hasSiliconflowKey: !!config.hasSiliconflowKey,
        hasZhipuKey: !!config.hasZhipuKey,
        hasGatewayUrl: !!config.hasGatewayUrl
      };
      if (typeof config.gatewayEngine === "string" && (config.gatewayEngine === "bing" || config.gatewayEngine === "google")) {
        this.state.gatewayEngine = config.gatewayEngine;
      }
      chatTranslateObserver.setEnabled(this.state.enabled);
      this.notify();
    }
  }
  getState() {
    return { ...this.state };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
      }
    });
  }
  async update(partial) {
    this.state = {
      ...this.state,
      ...partial
    };
    if (typeof partial.enabled === "boolean") {
      try {
        localStorage.setItem(LS_ENABLED, String(partial.enabled));
      } catch {
      }
      chatTranslateObserver.setEnabled(partial.enabled);
    }
    if (typeof partial.concurrency === "number") {
      try {
        localStorage.setItem(LS_CONCURRENCY, String(partial.concurrency));
      } catch {
      }
    }
    if (Array.isArray(partial.channels)) {
      try {
        localStorage.setItem(LS_CHANNELS, JSON.stringify(partial.channels));
      } catch {
      }
    }
    if (typeof partial.gatewayUrl === "string") {
      try {
        localStorage.setItem(LS_GATEWAY_URL, partial.gatewayUrl);
      } catch {
      }
      this.state.hasGatewayUrl = partial.gatewayUrl.trim().length > 0;
    }
    if (partial.gatewayEngine === "bing" || partial.gatewayEngine === "google") {
      try {
        localStorage.setItem(LS_GATEWAY_ENGINE, partial.gatewayEngine);
      } catch {
      }
    }
    this.notify();
    const serverPayload = {
      enabled: this.state.enabled,
      concurrency: this.state.concurrency,
      channels: this.state.channels,
      gatewayUrl: this.state.gatewayUrl,
      gatewayEngine: this.state.gatewayEngine
    };
    if (typeof partial.siliconflowKey === "string") {
      serverPayload.siliconflowKey = partial.siliconflowKey;
    }
    if (typeof partial.zhipuKey === "string") {
      serverPayload.zhipuKey = partial.zhipuKey;
    }
    const updated = await updateServerConfig(serverPayload);
    if (updated) {
      this.state.hasSiliconflowKey = !!updated.hasSiliconflowKey;
      this.state.hasZhipuKey = !!updated.hasZhipuKey;
      this.state.hasGatewayUrl = !!updated.hasGatewayUrl;
      this.notify();
    }
  }
  async testChannel(channel) {
    return testServerChannel(channel);
  }
};
var settingsStore = new SettingsStore();

// src/client/settings/styles.ts
var SETTINGS_CSS = String.raw`
.dsh-tidy-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 580px;
  padding-bottom: 32px;
  color: var(--dsw-alias-label-primary, inherit);
  font-family: inherit;
}

.dsh-tidy-card {
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.2));
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--dsw-alias-bg-card, rgba(128, 128, 128, 0.05));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dsh-tidy-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, inherit);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dsh-tidy-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.8));
}

.dsh-tidy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
}

.dsh-tidy-row + .dsh-tidy-row {
  border-top: 1px solid var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.1));
}

.dsh-tidy-row-info {
  flex: 1;
  min-width: 0;
}

.dsh-tidy-row-title {
  font-size: 13px;
  font-weight: 500;
}

.dsh-tidy-row-desc {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.7));
  margin-top: 2px;
  line-height: 1.4;
}

/* Switch */
.dsh-tidy-switch {
  position: relative;
  width: 38px;
  height: 22px;
  flex: none;
  cursor: pointer;
  border-radius: 999px;
  border: none;
  background: rgba(128, 128, 128, 0.3);
  transition: background 0.15s ease;
  padding: 0;
  outline: none;
}

.dsh-tidy-switch[aria-checked="true"] {
  background: #3b82f6;
}

.dsh-tidy-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.dsh-tidy-switch[aria-checked="true"]::after {
  transform: translateX(16px);
}

/* Inputs */
.dsh-tidy-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dsh-tidy-label {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dsh-tidy-input-row {
  display: flex;
  gap: 8px;
}

.dsh-tidy-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.25));
  background: var(--dsw-alias-bg-input, rgba(0, 0, 0, 0.05));
  color: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}

.dsh-tidy-input:focus {
  border-color: #3b82f6;
}

.dsh-tidy-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.dsh-tidy-btn:hover {
  background: rgba(128, 128, 128, 0.1);
  border-color: rgba(128, 128, 128, 0.5);
}

.dsh-tidy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dsh-tidy-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.dsh-tidy-badge-ok {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.dsh-tidy-badge-none {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

/* Priority list */
.dsh-tidy-priority-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dsh-tidy-priority-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.12));
}

.dsh-tidy-priority-name {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-tidy-order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
}

.dsh-tidy-btn-group {
  display: flex;
  gap: 4px;
}

.dsh-tidy-icon-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
}

.dsh-tidy-icon-btn:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.15);
}

.dsh-tidy-icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Slider / Select */
.dsh-tidy-select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  background: var(--dsw-alias-bg-input, rgba(0, 0, 0, 0.05));
  color: inherit;
  font-size: 12px;
  outline: none;
}
`;

// src/client/settings/ui.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var stylesInjected = false;
function ensureSettingsStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.dataset.tidySettings = "true";
  el.textContent = SETTINGS_CSS;
  document.head.appendChild(el);
  stylesInjected = true;
}
function TidySettingsPanel() {
  ensureSettingsStyles();
  const [state, setState] = (0, import_react.useState)(() => settingsStore.getState());
  const [sfKeyInput, setSfKeyInput] = (0, import_react.useState)("");
  const [zpKeyInput, setZpKeyInput] = (0, import_react.useState)("");
  const [testingChannel, setTestingChannel] = (0, import_react.useState)(null);
  const [testResults, setTestResults] = (0, import_react.useState)({});
  (0, import_react.useEffect)(() => {
    return settingsStore.subscribe(() => {
      setState(settingsStore.getState());
    });
  }, []);
  const handleToggleEnabled = () => {
    settingsStore.update({ enabled: !state.enabled });
  };
  const handleSaveSfKey = () => {
    if (sfKeyInput.trim()) {
      settingsStore.update({ siliconflowKey: sfKeyInput.trim() });
      setSfKeyInput("");
    }
  };
  const handleSaveZpKey = () => {
    if (zpKeyInput.trim()) {
      settingsStore.update({ zhipuKey: zpKeyInput.trim() });
      setZpKeyInput("");
    }
  };
  const handleTest = async (channel) => {
    setTestingChannel(channel);
    setTestResults((prev) => ({ ...prev, [channel]: "\u6D4B\u8BD5\u4E2D..." }));
    const res = await settingsStore.testChannel(channel);
    if (res.ok) {
      setTestResults((prev) => ({ ...prev, [channel]: `\u6210\u529F (${res.latencyMs}ms)` }));
    } else {
      setTestResults((prev) => ({ ...prev, [channel]: `\u5931\u8D25: ${res.error || "\u8FDE\u63A5\u8D85\u65F6"}` }));
    }
    setTestingChannel(null);
  };
  const handleMoveChannel = (index, direction) => {
    const newChannels = [...state.channels];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newChannels.length) return;
    const temp = newChannels[index];
    newChannels[index] = newChannels[targetIndex];
    newChannels[targetIndex] = temp;
    settingsStore.update({ channels: newChannels });
  };
  const handleSaveGatewayUrl = () => {
    settingsStore.update({ gatewayUrl: state.gatewayUrl.trim() });
  };
  const handleGatewayEngine = (val) => {
    settingsStore.update({ gatewayEngine: val });
  };
  const handleConcurrencyChange = (val) => {
    settingsStore.update({ concurrency: val });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-settings", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u5DE5\u5177\u8C03\u7528\u6807\u9898\u7FFB\u8BD1" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-tidy-switch",
            role: "switch",
            "aria-checked": state.enabled,
            onClick: handleToggleEnabled,
            "aria-label": "\u542F\u7528\u5DE5\u5177\u8C03\u7528\u6807\u9898\u7FFB\u8BD1"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-desc", children: [
        "\u4EC5\u5728\u6E32\u67D3\u5C42\u5C06\u5DE5\u5177\u8C03\u7528\u52A8\u4F5C\u63CF\u8FF0\uFF08\u5982 ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Locate DSH home directory structure" }),
        "\uFF09\u81EA\u52A8\u7FFB\u8BD1\u8986\u76D6\u4E3A\u7B80\u6D01\u4E2D\u6587\u3002\u4E0D\u89E6\u78B0\u6B63\u6587\u4E0E\u601D\u8003\u5757\uFF0C\u4E0D\u5360\u4E0A\u4E0B\u6587\u7A97\u53E3\u3002"
      ] })
    ] }),
    state.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-title", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u7FFB\u8BD1\u901A\u9053 API \u5BC6\u94A5" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-input-group", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-label", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u7845\u57FA\u6D41\u52A8 (SiliconFlow Qwen2.5-7B)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: state.hasSiliconflowKey ? "dsh-tidy-badge dsh-tidy-badge-ok" : "dsh-tidy-badge dsh-tidy-badge-none", children: state.hasSiliconflowKey ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-input-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "password",
                className: "dsh-tidy-input",
                placeholder: state.hasSiliconflowKey ? "\u8F93\u5165\u65B0\u5BC6\u94A5\u4EE5\u8986\u76D6..." : "sk-... (\u514D\u8D39\u989D\u5EA6\u5145\u8DB3)",
                value: sfKeyInput,
                onChange: (e) => setSfKeyInput(e.target.value),
                onBlur: handleSaveSfKey,
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-tidy-btn",
                disabled: !state.hasSiliconflowKey && !sfKeyInput,
                onClick: () => handleTest("siliconflow"),
                children: testingChannel === "siliconflow" ? "\u6D4B\u8BD5\u4E2D..." : "\u6D4B\u8BD5\u8FDE\u63A5"
              }
            )
          ] }),
          testResults.siliconflow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-desc", style: { color: testResults.siliconflow.startsWith("\u6210\u529F") ? "#22c55e" : "#ef4444" }, children: testResults.siliconflow })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-input-group", style: { marginTop: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-label", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u667A\u8C31\u5F00\u653E\u5E73\u53F0 (Zhipu glm-4-flash)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: state.hasZhipuKey ? "dsh-tidy-badge dsh-tidy-badge-ok" : "dsh-tidy-badge dsh-tidy-badge-none", children: state.hasZhipuKey ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-input-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "password",
                className: "dsh-tidy-input",
                placeholder: state.hasZhipuKey ? "\u8F93\u5165\u65B0\u5BC6\u94A5\u4EE5\u8986\u76D6..." : "API Key (\u4E2A\u4EBA\u514D\u8D39\u8C03\u7528)",
                value: zpKeyInput,
                onChange: (e) => setZpKeyInput(e.target.value),
                onBlur: handleSaveZpKey,
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-tidy-btn",
                disabled: !state.hasZhipuKey && !zpKeyInput,
                onClick: () => handleTest("zhipu"),
                children: testingChannel === "zhipu" ? "\u6D4B\u8BD5\u4E2D..." : "\u6D4B\u8BD5\u8FDE\u63A5"
              }
            )
          ] }),
          testResults.zhipu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-desc", style: { color: testResults.zhipu.startsWith("\u6210\u529F") ? "#22c55e" : "#ef4444" }, children: testResults.zhipu })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-input-group", style: { marginTop: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-label", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u672C\u5730\u7FFB\u8BD1\u7F51\u5173 (DeepLX \u517C\u5BB9 \xB7 \u53EF\u9009)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: state.hasGatewayUrl ? "dsh-tidy-badge dsh-tidy-badge-ok" : "dsh-tidy-badge dsh-tidy-badge-none", children: state.hasGatewayUrl ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-input-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "text",
                className: "dsh-tidy-input",
                placeholder: "http://127.0.0.1:6060/api",
                value: state.gatewayUrl,
                onChange: (e) => settingsStore.update({ gatewayUrl: e.target.value }),
                onBlur: handleSaveGatewayUrl,
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "select",
              {
                className: "dsh-tidy-select",
                value: state.gatewayEngine,
                onChange: (e) => handleGatewayEngine(e.target.value),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "bing", children: "Bing / \u5FAE\u8F6F (\u56FD\u5185\u76F4\u8FDE)" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "google", children: "Google (\u9700\u53CD\u4EE3)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-desc", children: [
            "\u90E8\u7F72 ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Translate_Api_Free" }),
            "\uFF08github.com/17Yuns/Translate_Api_Free\uFF09\u540E\u586B\u5199\u7F51\u5173\u5730\u5740\uFF1BBing \u901A\u9053\u56FD\u5185\u514D Key \u76F4\u8FDE\u3001\u4E0D\u8D70\u7B2C\u4E09\u65B9\u3002\u672A\u914D\u7F6E\u65F6\u81EA\u52A8\u8DF3\u8FC7\u8BE5\u901A\u9053\u3002"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-title", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u901A\u9053\u4F18\u5148\u7EA7\u4E0E\u964D\u7EA7\u987A\u5E8F" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-desc", children: "\u9047\u5230\u901A\u9053\u672A\u914D\u7F6E Key\u3001\u9650\u6D41 (429)\u3001\u6545\u969C\u6216\u8D85\u65F6 (2s) \u65F6\uFF0C\u7CFB\u7EDF\u5C06\u81EA\u52A8\u4F9D\u5E8F\u5411\u540E\u5E73\u6ED1\u964D\u7EA7\u3002" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-priority-list", children: state.channels.map((ch, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-priority-item", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-priority-name", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-tidy-order-badge", children: idx + 1 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: CHANNEL_NAMES[ch] || ch })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-btn-group", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-tidy-icon-btn",
                disabled: idx === 0,
                onClick: () => handleMoveChannel(idx, "up"),
                title: "\u4E0A\u79FB\u4F18\u5148\u7EA7",
                children: "\u25B2"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                type: "button",
                className: "dsh-tidy-icon-btn",
                disabled: idx === state.channels.length - 1,
                onClick: () => handleMoveChannel(idx, "down"),
                title: "\u4E0B\u79FB\u4F18\u5148\u7EA7",
                children: "\u25BC"
              }
            )
          ] })
        ] }, ch)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-row-info", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-row-title", children: "\u6700\u5927\u7FFB\u8BD1\u5E76\u53D1\u6570" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-row-desc", children: "\u63A7\u5236\u5386\u53F2\u4F1A\u8BDD\u6EDA\u52A8\u4E0E\u591A\u5DE5\u5177\u5361\u7247\u65F6\u7684\u6700\u5927\u5E76\u884C\u8BF7\u6C42\u6570\uFF08\u63A8\u8350 3\uFF09\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "select",
          {
            className: "dsh-tidy-select",
            value: state.concurrency,
            onChange: (e) => handleConcurrencyChange(parseInt(e.target.value, 10)),
            children: [1, 2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: n, children: [
              n,
              " \u4E2A\u5E76\u53D1"
            ] }, n))
          }
        )
      ] }) })
    ] })
  ] });
}
function setupSettingsUi(ctx) {
  if (typeof window === "undefined") return;
  try {
    const slots = ctx?.slots || (ctx?.get ? ctx.get("slots") : null);
    if (!slots || typeof slots.inject !== "function") return;
    slots.inject("settings.section", () => {
      return slots.register(
        {
          name: "settings.section",
          id: "dsh-chat-tidy",
          order: 5,
          label: () => "\u804A\u5929\u6392\u7248"
        },
        TidySettingsPanel
      );
    });
  } catch (err) {
    console.warn("[dsh-chat-tidy] Failed to inject settings section:", err);
  }
}

// src/client/index.ts
var name = "dsh-chat-tidy";
var inject = ["slots"];
function apply(ctx) {
  ctx.effect(() => adoptStyles(document), "dsh-chat-tidy: stylesheet");
  ctx.effect(() => chatTranslateObserver.start(document), "dsh-chat-tidy: title translate observer");
  ctx.effect(() => setupSettingsUi(ctx), "dsh-chat-tidy: settings section");
}
return module.exports; } });
//# sourceMappingURL=client.js.map
