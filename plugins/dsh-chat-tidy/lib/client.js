window.__ModuleLoader__.load({ id: "@lynn123411/dsh-chat-tidy", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
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
var TTL_MS = 7 * 24 * 60 * 60 * 1e3;
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
          for (const [k, entry] of Object.entries(obj)) {
            if (typeof entry === "string") {
              this.memCache.set(k, { t: 0, v: entry });
            } else if (entry && typeof entry === "object" && typeof entry.v === "string") {
              this.memCache.set(k, entry);
            }
          }
        }
      }
    } catch {
    }
  }
  get(text) {
    const key = text.trim().toLowerCase();
    const entry = this.memCache.get(key);
    if (entry === void 0) return void 0;
    if (entry.t > 0 && Date.now() - entry.t > TTL_MS) {
      this.memCache.delete(key);
      return void 0;
    }
    return entry.v;
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
    this.memCache.set(key, { t: Date.now(), v: translated });
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
  return texts.map((t) => ({
    original: t,
    translated: t,
    channel: "fallback-client",
    cached: false
  }));
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
  enabled = true;
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.batchQueue = [];
    }
  }
  observe(element, text) {
    if (!this.enabled) return;
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
    if (this.batchQueue.length === 0 || !this.enabled) return;
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
    if (!element.isConnected || !this.enabled) return;
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
function isMostlyChinese(text, threshold = 0.2) {
  const m = text.match(/[\u4e00-\u9fa5]/g);
  const count = m ? m.length : 0;
  if (count === 0) return false;
  if (text.length < 80) return true;
  return count > 15 || count / text.length > threshold;
}
var TOOL_TITLE_SELECTOR = [
  '[data-chat-call-id] [class*="summary"]',
  '[data-slot="tool.call.toolview"] [class*="summary"]',
  '[data-sample] [class*="summary"]',
  '[data-variant] [class*="summary"]',
  "[data-tool] [data-disclosure-row] > span:not([aria-hidden])",
  '[data-disclosure-row] [class*="summary"]',
  '[class*="thinkBody"]',
  '[data-variant="think"] [class*="markdown"]'
].join(", ");
var TOOL_ERROR_OUT_SELECTOR = [
  '[data-variant][data-state="error"] [class*="ioText"]',
  '[data-variant][data-state="aborted"] [class*="ioText"]',
  '[class*="ioText"][data-error]',
  '[class*="terminalBody"], [class*="terminalBodyWrap"]'
].join(", ");
var ERROR_LINE_RE = /error|fail(?:ed|ure)?|cannot|unable|no such|not found|denied|fatal|command not found|exit code|exited with|aborted|timed? ?out|exception|permission|killed|enoent|eacces|unreachable|refused/i;
function isErrorLine(t) {
  if (CHINESE_CHAR_REGEX.test(t)) return false;
  if (t.trim().length < 4) return false;
  if (t.length > 40 && !/\s/.test(t.trim())) return false;
  return ERROR_LINE_RE.test(t);
}
function isThinkSpan(el) {
  if (/thinkBody/i.test(el.className || "")) return true;
  return !!el.closest(
    '[data-variant="think"], [data-sample="think"], [class*="_reasoning_"], [data-slot="conversation.reasoning"], .QWLzlG_row'
  );
}
function isToolSummarySpan(span, translateThinking) {
  if (span.hasAttribute("aria-hidden")) return false;
  const cls = span.className || "";
  if (/title|leading|icon|badge|chevron/i.test(cls)) return false;
  const rawToggle = (span.textContent || "").trim();
  if (rawToggle.length <= 12 && /^(展开|收起|展开全部|收起全部|Expand|Collapse|Show more|Show less|Think|思考)$/i.test(rawToggle)) return false;
  if (rawToggle === "Think" || rawToggle === "\u601D\u8003") return false;
  if (span.closest('button, [role="button"]') && rawToggle.length <= 12 && /展开|收起|Expand|Collapse|Think|思考/i.test(rawToggle)) return false;
  if (!translateThinking) {
    if (isThinkSpan(span)) return false;
    if (span.parentElement && span.parentElement.textContent?.includes("Think")) {
      return false;
    }
  }
  if (span.closest('[data-chat-call-id], [data-slot="tool.call.toolview"], [data-sample], [data-variant], [data-tool]')) {
    return true;
  }
  return false;
}
function isErrorOutNode(span) {
  if (span.hasAttribute("aria-hidden")) return false;
  if (span.closest('pre, code, [class*="ioCard"] [class*="markdown"], [class*="_file_"]')) return false;
  const cls = span.className || "";
  if (/terminalBody/i.test(cls)) return true;
  if (/ioText/i.test(cls)) {
    return span.hasAttribute("data-error") || !!span.closest('[data-variant][data-state="error"], [data-variant][data-state="aborted"]');
  }
  return false;
}
function isTranslateableErrorText(t) {
  if (CHINESE_CHAR_REGEX.test(t)) return false;
  if (t.trim().length < 4) return false;
  if (t.length > 40 && !/\s/.test(t.trim())) return false;
  if (/^[\s./\\\-_0-9a-zA-Z:'"$@#<>*~=,;()\[\]{}]+$/.test(t) && !/\s/.test(t.trim())) return false;
  return true;
}
function chunkText(text, max) {
  const out = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(" ", max);
    if (cut <= 0) cut = max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trimStart();
  }
  if (rest.trim()) out.push(rest.trim());
  return out;
}
var translatingErrorOuts = /* @__PURE__ */ new WeakSet();
var errorOutEnabled = true;
async function translateErrorOut(span) {
  if (translatingErrorOuts.has(span)) return;
  if (span.dataset.tidyTranslated === "true") return;
  const raw = span.textContent ?? "";
  const lines = raw.split("\n");
  const targets = [];
  lines.forEach((ln, i) => {
    const t = ln.trim();
    if (isErrorLine(t) && isTranslateableErrorText(t)) {
      targets.push({ idx: i, text: t });
    }
  });
  if (targets.length === 0) {
    if (CHINESE_CHAR_REGEX.test(raw)) span.dataset.tidyTranslated = "true";
    return;
  }
  const uniqueLines = Array.from(new Set(targets.map((x) => x.text)));
  const results = await requestTranslateBatch(uniqueLines.slice(0, 80));
  const byText = /* @__PURE__ */ new Map();
  results.forEach((r) => {
    if (r && r.translated && r.translated !== r.original) byText.set(r.original, r.translated);
  });
  translatingErrorOuts.add(span);
  try {
    let changed = false;
    for (const t of targets) {
      const translated = byText.get(t.text);
      if (translated) {
        lines[t.idx] = translated;
        changed = true;
      }
    }
    const merged = lines.join("\n");
    if (errorOutEnabled && changed && merged !== raw) {
      span.dataset.tidyTranslated = "true";
      span.dataset.original = raw;
      span.textContent = merged;
      span.querySelectorAll("*").forEach((el) => {
        el.dataset.tidyTranslated = "true";
      });
    }
  } catch {
  } finally {
    translatingErrorOuts.delete(span);
  }
}
var ChatTranslateObserver = class {
  observer = null;
  rootElement = null;
  isEnabled = true;
  translateThinking = false;
  thinkChain = Promise.resolve();
  /**
   * Toggle Think/reasoning translation. Turning it on scans immediately;
   * turning it off restores already-translated think nodes right away.
   */
  setTranslateThinking(enabled) {
    this.translateThinking = enabled;
    if (enabled) {
      if (this.rootElement) this.scanContainer(this.rootElement);
    } else {
      this.restoreThinkOriginals();
    }
  }
  /**
   * Think translation runs on its own serial chain (one request in flight at
   * a time) so long reasoning blocks can never fan out into a burst that
   * hammers Bing. Short think lines still use the debounced shared queue.
   */
  enqueueThink(span, text) {
    this.thinkChain = this.thinkChain.then(() => this.translateThink(span, text)).catch(() => {
    });
  }
  async translateThink(span, text) {
    if (!this.translateThinking || !this.isEnabled || !span.isConnected) return;
    if (span.dataset.tidyTranslated === "true") {
      const original = span.dataset.original;
      const cur = span.textContent?.trim() || "";
      if (original && cur === original) {
        delete span.dataset.tidyTranslated;
        delete span.dataset.original;
        delete span.dataset.tidyThink;
      } else if (original) {
        const cached = clientCache.get(original);
        if (cached && cur === cached) return;
        if (cur && !isMostlyChinese(cur) && cur !== cached) {
          delete span.dataset.tidyTranslated;
          delete span.dataset.original;
          delete span.dataset.tidyThink;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    const raw = span.textContent?.trim() || text;
    if (!raw || isMostlyChinese(raw)) return;
    const chunks = chunkText(raw, 600).slice(0, 60);
    if (chunks.length === 1) {
      const res = await requestTranslateBatch(chunks);
      const merged = res[0]?.translated?.trim();
      if (merged && merged !== chunks[0]) {
        span.dataset.original = raw;
        span.dataset.tidyTranslated = "true";
        span.dataset.tidyThink = "true";
        span.textContent = merged;
      }
      return;
    }
    const results = new Array(chunks.length).fill(null);
    let cursor = 0;
    let inFlight = 0;
    let prefixDone = 0;
    const paint = () => {
      if (!this.translateThinking || !this.isEnabled || !span.isConnected) return;
      const parts = chunks.map((c, i) => i < prefixDone && results[i] ? results[i] : c);
      span.textContent = parts.join("\n");
    };
    await new Promise((resolve) => {
      const pump = () => {
        if (!this.translateThinking || !this.isEnabled || !span.isConnected) {
          resolve();
          return;
        }
        while (inFlight < 3 && cursor < chunks.length) {
          const k = cursor++;
          inFlight++;
          (async () => {
            try {
              const r = await requestTranslateBatch([chunks[k]]);
              const t = r[0]?.translated?.trim();
              if (t && t !== chunks[k]) results[k] = t;
            } catch {
            } finally {
              inFlight--;
              while (prefixDone < chunks.length && results[prefixDone] !== null) prefixDone++;
              paint();
              pump();
            }
          })();
        }
        if (cursor >= chunks.length && inFlight === 0) resolve();
      };
      pump();
    });
    if (prefixDone === chunks.length) {
      span.dataset.original = raw;
      span.dataset.tidyTranslated = "true";
      span.dataset.tidyThink = "true";
    }
  }
  constructor() {
    this.handleMutations = this.handleMutations.bind(this);
  }
  setEnabled(enabled) {
    this.isEnabled = enabled;
    errorOutEnabled = enabled;
    if (enabled) {
      lazyQueue.setEnabled(true);
      this.start();
    } else {
      this.restoreOriginals();
      this.disconnect();
      lazyQueue.setEnabled(false);
    }
  }
  /**
   * Restore every translated node back to its English original so toggling
   * the switch off takes effect immediately (no browser refresh needed).
   */
  restoreOriginals() {
    const scope = this.rootElement ?? document;
    const spans = scope.querySelectorAll('[data-tidy-translated="true"]');
    for (const span of spans) {
      const original = span.dataset.original;
      if (original && original !== span.textContent) {
        span.textContent = original;
      }
      delete span.dataset.tidyTranslated;
      delete span.dataset.original;
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
          characterData: true,
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
      } else if (mutation.type === "characterData") {
        const parent = mutation.target.parentElement;
        if (parent instanceof HTMLElement) {
          this.scanNode(parent);
        }
      }
    }
  }
  scanContainer(container) {
    const spans = container.querySelectorAll(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span, this.translateThinking)) {
        this.processSpan(span);
      }
    });
    const errorOuts = container.querySelectorAll(TOOL_ERROR_OUT_SELECTOR);
    errorOuts.forEach((span) => {
      if (isErrorOutNode(span)) {
        translateErrorOut(span);
      }
    });
  }
  scanNode(node) {
    if (node.matches?.(TOOL_TITLE_SELECTOR) && isToolSummarySpan(node, this.translateThinking)) {
      this.processSpan(node);
    } else if (isToolSummarySpan(node, this.translateThinking) && isThinkSpan(node)) {
      this.processSpan(node);
    }
    if (node.matches?.(TOOL_ERROR_OUT_SELECTOR) && isErrorOutNode(node)) {
      translateErrorOut(node);
    }
    const spans = node.querySelectorAll(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span, this.translateThinking)) {
        this.processSpan(span);
      }
    });
    const errorOuts = node.querySelectorAll(TOOL_ERROR_OUT_SELECTOR);
    errorOuts.forEach((span) => {
      if (isErrorOutNode(span)) {
        translateErrorOut(span);
      }
    });
  }
  processSpan(span) {
    const text = span.textContent?.trim() || "";
    if (!text) return;
    const isThink = this.translateThinking && isThinkSpan(span);
    if (isThink) {
      span.dataset.tidyThink = "true";
    }
    if (isThink) {
      if (isMostlyChinese(text)) {
        span.dataset.tidyTranslated = "true";
        return;
      }
    } else if (CHINESE_CHAR_REGEX.test(text)) {
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
    if (isThink && text.length > 120) {
      this.enqueueThink(span, text);
      return;
    }
    lazyQueue.observe(span, text);
  }
  /** Serial chain must be drained before dispose to avoid stray writes. */
  drainThinkChain() {
    this.thinkChain = this.thinkChain.then(() => {
    }).catch(() => {
    });
  }
  /** Restore think-translated nodes (used when the thinking toggle goes off). */
  restoreThinkOriginals() {
    const scope = this.rootElement ?? document;
    const spans = scope.querySelectorAll('[data-tidy-think="true"]');
    for (const span of spans) {
      const original = span.dataset.original;
      if (original && original !== span.textContent) {
        span.textContent = original;
      }
      delete span.dataset.original;
      delete span.dataset.tidyTranslated;
      delete span.dataset.tidyThink;
    }
  }
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    lazyQueue.disconnect();
    this.drainThinkChain();
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
var LS_TRANSLATE_THINKING = `${LS_PREFIX}translate-thinking`;
var SettingsStore = class {
  state = {
    enabled: true,
    concurrency: 3,
    translateThinking: false
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
        if (!isNaN(c) && c >= 1 && c <= 100) {
          this.state.concurrency = c;
        }
      }
      const thinkRaw = localStorage.getItem(LS_TRANSLATE_THINKING);
      if (thinkRaw !== null) {
        this.state.translateThinking = thinkRaw === "true";
      }
    } catch {
    }
    try {
      chatTranslateObserver.setEnabled(this.state.enabled);
      chatTranslateObserver.setTranslateThinking(this.state.translateThinking);
    } catch {
    }
  }
  async syncFromServer() {
    try {
      const config = await fetchServerConfig();
      if (config) {
        this.state = {
          ...this.state,
          enabled: config.enabled ?? this.state.enabled,
          concurrency: config.concurrency ?? this.state.concurrency,
          translateThinking: config.translateThinking ?? this.state.translateThinking
        };
        chatTranslateObserver.setEnabled(this.state.enabled);
        chatTranslateObserver.setTranslateThinking(this.state.translateThinking);
        this.notify();
      }
    } catch {
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
    if (typeof partial.translateThinking === "boolean") {
      try {
        localStorage.setItem(LS_TRANSLATE_THINKING, String(partial.translateThinking));
      } catch {
      }
      chatTranslateObserver.setTranslateThinking(partial.translateThinking);
    }
    this.notify();
    const updated = await updateServerConfig({
      enabled: this.state.enabled,
      concurrency: this.state.concurrency,
      translateThinking: this.state.translateThinking
    });
    if (updated) {
      this.state.enabled = updated.enabled ?? this.state.enabled;
      this.state.concurrency = updated.concurrency ?? this.state.concurrency;
      this.state.translateThinking = updated.translateThinking ?? this.state.translateThinking;
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
  (0, import_react.useEffect)(() => {
    return settingsStore.subscribe(() => {
      setState(settingsStore.getState());
    });
  }, []);
  const handleToggleEnabled = () => {
    settingsStore.update({ enabled: !state.enabled });
  };
  const handleToggleThinking = () => {
    settingsStore.update({ translateThinking: !state.translateThinking });
  };
  const handleConcurrencyChange = (val) => {
    if (Number.isNaN(val)) return;
    settingsStore.update({ concurrency: Math.min(Math.max(val, 1), 100) });
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-row-info", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-row-title", children: "\u7FFB\u8BD1\u601D\u7EF4\u94FE\uFF08Think \u5757\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-row-desc", children: "\u5F00\u542F\u540E\u5C06\u601D\u8003\u5757\u5185\u5BB9\uFF08reasoning\uFF09\u4E5F\u7FFB\u8BD1\u4E3A\u4E2D\u6587\uFF1B\u9ED8\u8BA4\u5173\u95ED\uFF0C\u4FDD\u6301\u601D\u8003\u539F\u6587\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-tidy-switch",
            role: "switch",
            "aria-checked": state.translateThinking,
            onClick: handleToggleThinking,
            "aria-label": "\u7FFB\u8BD1\u601D\u7EF4\u94FE"
          }
        )
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tidy-row-info", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-row-title", children: "\u6700\u5927\u7FFB\u8BD1\u5E76\u53D1\u6570" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-tidy-row-desc", children: "\u63A7\u5236\u5386\u53F2\u4F1A\u8BDD\u6EDA\u52A8\u4E0E\u591A\u5DE5\u5177\u5361\u7247\u65F6\u7684\u6700\u5927\u5E76\u884C\u8BF7\u6C42\u6570\uFF08\u63A8\u8350 3\uFF09\u3002" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "number",
            className: "dsh-tidy-input",
            min: 1,
            max: 100,
            step: 1,
            value: state.concurrency,
            onChange: (e) => handleConcurrencyChange(parseInt(e.target.value, 10)),
            style: { width: "88px" },
            "aria-label": "\u6700\u5927\u7FFB\u8BD1\u5E76\u53D1\u6570"
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

// src/client/settings/toggle.ts
var TOGGLE_ID = "dsh-chat-tidy-toggle";
var TOGGLE_CSS_ID = "dsh-tidy-toggle-css";
var TOGGLE_CSS = String.raw`
.dsh-tidy-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  background: transparent;
  color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.8));
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  flex: none;
  padding: 0;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.dsh-tidy-toggle:hover {
  border-color: rgba(59, 130, 246, 0.6);
}

.dsh-tidy-toggle[aria-pressed="true"] {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.45);
}

.dsh-tidy-toggle[aria-pressed="false"] span {
  text-decoration: line-through;
  opacity: 0.45;
}
`;
function findHeader() {
  return document.querySelector(
    '[data-slot="conversation.session.header"] header, [data-slot="conversation.session.header"]'
  );
}
function createButton() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = TOGGLE_ID;
  btn.className = "dsh-tidy-toggle";
  const on = settingsStore.getState().enabled;
  btn.setAttribute("aria-pressed", String(on));
  btn.title = on ? "\u6807\u9898\u7FFB\u8BD1\uFF1A\u5DF2\u5F00\u542F\uFF08\u70B9\u51FB\u5173\u95ED\uFF09" : "\u6807\u9898\u7FFB\u8BD1\uFF1A\u5DF2\u5173\u95ED\uFF08\u70B9\u51FB\u5F00\u542F\uFF09";
  btn.setAttribute("aria-label", "\u6807\u9898\u7FFB\u8BD1\u5F00\u5173");
  const mark = document.createElement("span");
  mark.textContent = "\u8BD1";
  btn.appendChild(mark);
  btn.addEventListener("click", () => {
    settingsStore.update({ enabled: !settingsStore.getState().enabled });
  });
  return btn;
}
function syncButtonState() {
  const btn = document.getElementById(TOGGLE_ID);
  if (!btn) return;
  const on = settingsStore.getState().enabled;
  btn.setAttribute("aria-pressed", String(on));
  btn.title = on ? "\u6807\u9898\u7FFB\u8BD1\uFF1A\u5DF2\u5F00\u542F\uFF08\u70B9\u51FB\u5173\u95ED\uFF09" : "\u6807\u9898\u7FFB\u8BD1\uFF1A\u5DF2\u5173\u95ED\uFF08\u70B9\u51FB\u5F00\u542F\uFF09";
}
function installQuickToggle() {
  if (typeof document === "undefined") return () => {
  };
  if (!document.getElementById(TOGGLE_CSS_ID)) {
    const style = document.createElement("style");
    style.id = TOGGLE_CSS_ID;
    style.textContent = TOGGLE_CSS;
    document.head.appendChild(style);
  }
  const ensure = () => {
    const header = findHeader();
    if (!header) return;
    if (!document.getElementById(TOGGLE_ID)) {
      const btn = createButton();
      header.appendChild(btn);
      btn.style.marginLeft = "8px";
      const cluster = btn.closest('[class*="utilities"], [class*="header"] > div:last-child');
      if (cluster && cluster !== header) {
        header.insertBefore(btn, cluster.nextSibling);
      }
    }
  };
  ensure();
  const keepAlive = new MutationObserver(() => ensure());
  keepAlive.observe(document.body, { childList: true, subtree: true });
  const unsubscribe = settingsStore.subscribe(syncButtonState);
  return () => {
    keepAlive.disconnect();
    unsubscribe();
    document.getElementById(TOGGLE_ID)?.remove();
  };
}

// src/client/index.ts
var name = "dsh-chat-tidy";
var inject = ["slots"];
function apply(ctx) {
  ctx.effect(() => adoptStyles(document), "dsh-chat-tidy: stylesheet");
  ctx.effect(() => chatTranslateObserver.start(document), "dsh-chat-tidy: title translate observer");
  ctx.effect(() => setupSettingsUi(ctx), "dsh-chat-tidy: settings section");
  ctx.effect(() => installQuickToggle(), "dsh-chat-tidy: quick toggle");
}
return module.exports; } });
//# sourceMappingURL=client.js.map
