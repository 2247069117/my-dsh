// src/server/config.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
var KNOWN_CHANNELS = ["bing"];
var MAX_CONCURRENCY = 100;
var DEFAULT_CONFIG = {
  enabled: true,
  concurrency: 3,
  timeoutMs: 2e3,
  channels: [...KNOWN_CHANNELS],
  translateThinking: false,
  targetLang: "zh-Hans"
};
var ConfigManager = class {
  config = { ...DEFAULT_CONFIG };
  configPath;
  listeners = /* @__PURE__ */ new Set();
  constructor() {
    const dshHome = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
    this.configPath = path.join(dshHome, "dsh-chat-tidy-config.json");
  }
  async init() {
    try {
      const data = await fs.readFile(this.configPath, "utf-8");
      const parsed = JSON.parse(data);
      this.config = {
        ...DEFAULT_CONFIG,
        ...parsed
      };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
    if (!Number.isFinite(this.config.concurrency) || this.config.concurrency < 1) {
      this.config.concurrency = DEFAULT_CONFIG.concurrency;
    } else {
      this.config.concurrency = Math.min(Math.max(Math.round(this.config.concurrency), 1), MAX_CONCURRENCY);
    }
    if (!Number.isFinite(this.config.timeoutMs) || this.config.timeoutMs < 500) {
      this.config.timeoutMs = DEFAULT_CONFIG.timeoutMs;
    } else {
      this.config.timeoutMs = Math.min(Math.max(Math.round(this.config.timeoutMs), 500), 1e4);
    }
    if (!this.config.targetLang || typeof this.config.targetLang !== "string") {
      this.config.targetLang = DEFAULT_CONFIG.targetLang;
    }
    const retired = /* @__PURE__ */ new Set(["google", "gateway", "builtin", "mymemory", "siliconflow", "zhipu"]);
    const merged = Array.isArray(this.config.channels) ? this.config.channels.filter((ch) => typeof ch === "string" && !retired.has(ch)) : [];
    for (const ch of KNOWN_CHANNELS) {
      if (!merged.includes(ch)) merged.push(ch);
    }
    this.config.channels = merged;
  }
  getConfig() {
    return { ...this.config, channels: [...this.config.channels] };
  }
  getMaskedConfig() {
    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      channels: [...this.config.channels],
      translateThinking: this.config.translateThinking === true,
      targetLang: this.config.targetLang || "zh-Hans"
    };
  }
  onConfigChange(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  notifyListeners() {
    const snapshot = this.getConfig();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("[dsh-chat-tidy] Config listener error:", err);
      }
    }
  }
  async updateConfig(partial) {
    const next = {
      ...this.config,
      ...partial
    };
    if (typeof partial.concurrency === "number" && Number.isFinite(partial.concurrency)) {
      next.concurrency = Math.min(Math.max(Math.round(partial.concurrency), 1), MAX_CONCURRENCY);
    } else {
      next.concurrency = this.config.concurrency;
    }
    if (typeof partial.timeoutMs === "number" && Number.isFinite(partial.timeoutMs)) {
      next.timeoutMs = Math.min(Math.max(Math.round(partial.timeoutMs), 500), 1e4);
    } else {
      next.timeoutMs = this.config.timeoutMs;
    }
    if (typeof partial.enabled === "boolean") {
      next.enabled = partial.enabled;
    }
    if (typeof partial.translateThinking === "boolean") {
      next.translateThinking = partial.translateThinking;
    }
    if (typeof partial.targetLang === "string" && partial.targetLang.trim()) {
      next.targetLang = partial.targetLang.trim();
    }
    if (Array.isArray(partial.channels)) {
      next.channels = partial.channels.filter((ch) => typeof ch === "string");
    }
    this.config = next;
    await this.save();
    this.notifyListeners();
    return this.getConfig();
  }
  async save() {
    const tmpPath = `${this.configPath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(tmpPath, JSON.stringify(this.config, null, 2), "utf-8");
      await fs.rename(tmpPath, this.configPath);
    } catch (err) {
      console.warn("[dsh-chat-tidy] Failed to save config file atomically:", err);
      try {
        await fs.unlink(tmpPath);
      } catch {
      }
    }
  }
};

// src/server/cache.ts
import * as fs2 from "node:fs/promises";
import * as path2 from "node:path";
import * as os2 from "node:os";
var TTL_MS = 7 * 24 * 60 * 60 * 1e3;
var LruDiskCache = class {
  cache = /* @__PURE__ */ new Map();
  maxEntries;
  filePath;
  saveTimer = null;
  dirty = false;
  constructor(maxEntries = 1e3) {
    this.maxEntries = maxEntries;
    const dshHome = process.env.DSH_HOME || path2.join(os2.homedir(), ".dsh");
    this.filePath = path2.join(dshHome, "dsh-chat-tidy-cache.json");
  }
  async init() {
    try {
      const content = await fs2.readFile(this.filePath, "utf-8");
      const obj = JSON.parse(content);
      if (obj && typeof obj === "object") {
        for (const [k, raw] of Object.entries(obj)) {
          if (typeof raw === "string") {
            this.cache.set(k, { t: 0, v: raw });
          } else if (raw && typeof raw === "object" && typeof raw.v === "string") {
            const entry = raw;
            if (typeof entry.t === "number" && Number.isFinite(entry.t)) {
              this.cache.set(k, entry);
            }
          }
        }
      }
    } catch {
    }
  }
  get(key) {
    const entry = this.cache.get(key);
    if (entry === void 0) return void 0;
    if (entry.t > 0 && Date.now() - entry.t > TTL_MS) {
      this.cache.delete(key);
      return void 0;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.v;
  }
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== void 0) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { t: Date.now(), v: value });
    this.dirty = true;
    this.scheduleSave();
  }
  scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      if (this.dirty) {
        this.dirty = false;
        this.flush().catch((err) => {
          console.warn("[dsh-chat-tidy] Failed to flush cache to disk:", err);
        });
      }
    }, 5e3);
  }
  async flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.dirty = false;
    const tmpPath = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    try {
      const obj = {};
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
      }
      await fs2.mkdir(path2.dirname(this.filePath), { recursive: true });
      await fs2.writeFile(tmpPath, JSON.stringify(obj, null, 2), "utf-8");
      await fs2.rename(tmpPath, this.filePath);
    } catch (err) {
      console.warn("[dsh-chat-tidy] Failed to write cache file atomically:", err);
      try {
        await fs2.unlink(tmpPath);
      } catch {
      }
    }
  }
  async dispose() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.dirty) {
      await this.flush();
    }
  }
};

// src/server/adapters/bing.ts
var TRANSLATOR_URL = "https://cn.bing.com/translator";
var TRANSLATE_URL = "https://cn.bing.com/ttranslatev3?isVertical=1&&IG={IG}&IID=translator.5025.1";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var IG_RES = [
  /_IG="([a-zA-Z0-9]+)"/,
  /,IG:"([a-zA-Z0-9]+)"/,
  /IG:"([a-zA-Z0-9]+)"/,
  /"IG":"([a-zA-Z0-9]+)"/
];
var ABUSE_RES = [
  /params_AbusePreventionHelper\s*=\s*\[\s*(\d+)\s*,\s*"([^"]+)"/,
  /var\s+params_AbusePreventionHelper\s*=\s*\[\s*(\d+)\s*,\s*"([^"]+)"/
];
var cachedTokens = null;
var tokensFetchedAt = 0;
var TOKEN_TTL_MS = 15 * 60 * 1e3;
var inFlightTokenPromise = null;
function parseTokens(html) {
  let ig;
  for (const re of IG_RES) {
    const m = re.exec(html);
    if (m && m[1]) {
      ig = m[1];
      break;
    }
  }
  let key;
  let token;
  for (const re of ABUSE_RES) {
    const m = re.exec(html);
    if (m && m[1] && m[2]) {
      key = m[1];
      token = m[2];
      break;
    }
  }
  if (!ig || !key || !token) {
    throw new Error(`Bing translator page: missing tokens (ig: ${!!ig}, key: ${!!key}, token: ${!!token})`);
  }
  return { ig, key, token };
}
async function fetchTokens(signal, forceRefresh = false) {
  if (!forceRefresh && cachedTokens && Date.now() - tokensFetchedAt < TOKEN_TTL_MS) {
    return cachedTokens;
  }
  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }
  inFlightTokenPromise = (async () => {
    try {
      const response = await fetch(TRANSLATOR_URL, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal
      });
      if (!response.ok) {
        throw new Error(`Bing translator page responded with status ${response.status}`);
      }
      const html = await response.text();
      const tokens = parseTokens(html);
      cachedTokens = tokens;
      tokensFetchedAt = Date.now();
      return tokens;
    } finally {
      inFlightTokenPromise = null;
    }
  })();
  return inFlightTokenPromise;
}
var BingWebAdapter = class {
  id = "bing";
  name = "\u5FAE\u8F6F Bing \u7F51\u9875\u7FFB\u8BD1 (\u514DKey\u76F4\u8FDE)";
  isAvailable(_config) {
    return true;
  }
  async translate(text, signal, config) {
    const targetLang = config.targetLang || "zh-Hans";
    return this.executeTranslate(text, signal, targetLang, false);
  }
  async executeTranslate(text, signal, targetLang, isRetry) {
    const tokens = await fetchTokens(signal, isRetry);
    const body = new URLSearchParams({
      fromLang: "auto-detect",
      text,
      to: targetLang,
      key: tokens.key,
      token: tokens.token,
      tryFetchingGenderDebiasedTranslations: "true"
    });
    const response = await fetch(TRANSLATE_URL.replace("{IG}", tokens.ig), {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Referer: "https://cn.bing.com/translator/",
        Origin: "https://cn.bing.com",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      signal
    });
    if (!response.ok) {
      cachedTokens = null;
      if (!isRetry && (response.status === 400 || response.status === 401 || response.status === 403)) {
        return this.executeTranslate(text, signal, targetLang, true);
      }
      throw new Error(`Bing translate responded with status ${response.status}`);
    }
    const json = await response.json();
    const translated = json?.[0]?.translations?.[0]?.text?.trim();
    if (!translated) {
      cachedTokens = null;
      if (!isRetry) {
        return this.executeTranslate(text, signal, targetLang, true);
      }
      throw new Error("Bing translate returned an empty result");
    }
    return translated;
  }
};

// src/server/pipeline/masking.ts
var ContentMaskingPipeline = class {
  mask(text) {
    if (!text || typeof text !== "string") {
      return {
        maskedText: text,
        unmask: (t) => t
      };
    }
    const masks = [];
    const addMask = (match) => {
      const idx = masks.length;
      masks.push(match);
      return `__DSH_MASK_${idx}__`;
    };
    let processed = text;
    processed = processed.replace(/(?:```|~~~)[\s\S]*?(?:```|~~~)/g, (m) => addMask(m));
    processed = processed.replace(/`[^`\n]+`/g, (m) => addMask(m));
    processed = processed.replace(/https?:\/\/[^\s)\];,;"'<>]+/g, (m) => addMask(m));
    processed = processed.replace(
      /(?:(?:\/|[a-zA-Z]:[\\\/]|\.\.?[\\\/])[\w.\-\\\/]+|\b(?:[\w.\-]+\/)+[\w.\-]+\.[a-zA-Z0-9]+\b|\b[\w.\-]+\.(?:ts|tsx|js|jsx|json|ya?ml|md|py|go|rs|c|cpp|h|hpp|css|scss|html|sh|bash|mjs|cjs|toml|lock|log|env|svg|png|jpe?g|gif|tar|gz|zip|xml|sql)\b)/g,
      (m) => addMask(m)
    );
    processed = processed.replace(
      /(?<=^|[\s(\[{"'])((?:--[a-zA-Z0-9_\-]+(?:=[^\s"'<>]+)?)|(?:-[a-zA-Z0-9]+))(?=[\s)\]}",:;!?]|$)/g,
      (m) => addMask(m)
    );
    const unmask = (translatedText) => {
      if (!translatedText || masks.length === 0) {
        return translatedText;
      }
      return translatedText.replace(
        /__\s*DSH\s*_\s*MASK\s*_\s*(\d+)\s*__/gi,
        (_fullMatch, indexStr) => {
          const idx = parseInt(indexStr, 10);
          if (!Number.isNaN(idx) && idx >= 0 && idx < masks.length) {
            return masks[idx];
          }
          return _fullMatch;
        }
      );
    };
    return {
      maskedText: processed,
      unmask
    };
  }
};

// src/server/dispatcher.ts
function isMostlyChinese(text, threshold = 0.4) {
  const clean = text.replace(/\s+/g, "");
  if (!clean) return false;
  const cjkMatches = clean.match(/[\u4e00-\u9fa5]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  if (cjkCount === 0) return false;
  return cjkCount / clean.length >= threshold;
}
var TranslationDispatcher = class {
  configManager;
  cache;
  masking = new ContentMaskingPipeline();
  adapters = /* @__PURE__ */ new Map();
  circuitStates = /* @__PURE__ */ new Map();
  inFlightMap = /* @__PURE__ */ new Map();
  activeCount = 0;
  queue = [];
  constructor(configManager, cache) {
    this.configManager = configManager;
    this.cache = cache;
    this.registerAdapter(new BingWebAdapter());
    this.configManager.onConfigChange(() => {
      this.processNext();
    });
  }
  registerAdapter(adapter) {
    this.adapters.set(adapter.id, adapter);
  }
  async translateBatch(texts, forceRefresh = false) {
    return Promise.all(texts.map((t) => this.translateOne(t, forceRefresh)));
  }
  async translateOne(rawText, forceRefresh = false) {
    const text = rawText.trim();
    if (!text) {
      return { original: rawText, translated: rawText, channel: "none", cached: true };
    }
    if (isMostlyChinese(text)) {
      return { original: rawText, translated: rawText, channel: "none", cached: true };
    }
    const config = this.configManager.getConfig();
    if (!config.enabled) {
      return { original: rawText, translated: rawText, channel: "disabled", cached: true };
    }
    const cacheKey = text.toLowerCase();
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { original: rawText, translated: cached, channel: "cache", cached: true };
      }
    }
    if (!forceRefresh) {
      const inFlight = this.inFlightMap.get(cacheKey);
      if (inFlight) {
        return inFlight;
      }
    }
    const { maskedText, unmask } = this.masking.mask(text);
    if (isMostlyChinese(maskedText)) {
      return { original: rawText, translated: rawText, channel: "none", cached: true };
    }
    const taskPromise = this.enqueueTask(async () => {
      const currentConfig = this.configManager.getConfig();
      const channels = currentConfig.channels || ["bing"];
      for (const chId of channels) {
        const adapter = this.adapters.get(chId);
        if (!adapter || !adapter.isAvailable(currentConfig) || this.isCircuitOpen(chId)) {
          continue;
        }
        try {
          const timeout = currentConfig.timeoutMs || 2e3;
          const abortCtrl = new AbortController();
          const timer = setTimeout(() => abortCtrl.abort(), timeout);
          let translatedMasked = "";
          try {
            translatedMasked = await adapter.translate(maskedText, abortCtrl.signal, currentConfig);
          } finally {
            clearTimeout(timer);
          }
          const cleaned = translatedMasked?.trim();
          if (cleaned && cleaned.length > 0) {
            const finalTranslated = unmask(cleaned);
            this.recordSuccess(chId);
            this.cache.set(cacheKey, finalTranslated);
            return {
              original: rawText,
              translated: finalTranslated,
              channel: chId,
              cached: false
            };
          }
        } catch (err) {
          this.recordFailure(chId);
          console.warn(
            `[dsh-chat-tidy] channel ${chId} failed: ${err?.message || String(err)} | text: ${text.slice(0, 60)}`
          );
        }
      }
      return { original: rawText, translated: rawText, channel: "fallback", cached: false };
    });
    if (!forceRefresh) {
      this.inFlightMap.set(cacheKey, taskPromise);
    }
    try {
      return await taskPromise;
    } finally {
      if (!forceRefresh) {
        this.inFlightMap.delete(cacheKey);
      }
    }
  }
  async testChannel(channelId) {
    const adapter = this.adapters.get(channelId);
    const config = this.configManager.getConfig();
    if (!adapter) {
      return { ok: false, latencyMs: 0, error: `Channel ${channelId} not found` };
    }
    if (!adapter.isAvailable(config)) {
      return { ok: false, latencyMs: 0, error: `Channel ${channelId} API key is not configured` };
    }
    const testText = "List files in current directory";
    const start = Date.now();
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4e3);
      let res = "";
      try {
        res = await adapter.translate(testText, abortCtrl.signal, config);
      } finally {
        clearTimeout(timer);
      }
      const latencyMs = Date.now() - start;
      if (res && res.trim()) {
        return { ok: true, latencyMs };
      }
      return { ok: false, latencyMs, error: "Empty translation returned" };
    } catch (err) {
      return { ok: false, latencyMs: Date.now() - start, error: err?.message || String(err) };
    }
  }
  enqueueTask(task) {
    return new Promise((resolve, reject) => {
      const exec = async () => {
        this.activeCount++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.activeCount--;
          this.processNext();
        }
      };
      const maxConcurrency = Math.min(
        Math.max(this.configManager.getConfig().concurrency || 3, 1),
        MAX_CONCURRENCY
      );
      if (this.activeCount < maxConcurrency) {
        exec();
      } else {
        this.queue.push(exec);
      }
    });
  }
  processNext() {
    const maxConcurrency = Math.min(
      Math.max(this.configManager.getConfig().concurrency || 3, 1),
      MAX_CONCURRENCY
    );
    while (this.queue.length > 0 && this.activeCount < maxConcurrency) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
  isCircuitOpen(channelId) {
    let state = this.circuitStates.get(channelId);
    if (!state) return false;
    if (state.state === "open") {
      if (Date.now() >= state.openUntil) {
        state.state = "half-open";
        return false;
      }
      return true;
    }
    if (state.state === "half-open") {
      return false;
    }
    return false;
  }
  recordSuccess(channelId) {
    const state = this.circuitStates.get(channelId);
    if (state) {
      state.state = "closed";
      state.failureCount = 0;
      state.openUntil = 0;
    }
  }
  recordFailure(channelId) {
    let state = this.circuitStates.get(channelId);
    if (!state) {
      state = { state: "closed", failureCount: 0, openUntil: 0 };
      this.circuitStates.set(channelId, state);
    }
    if (state.state === "half-open") {
      state.state = "open";
      state.failureCount = 3;
      state.openUntil = Date.now() + 3e4;
      return;
    }
    state.failureCount++;
    if (state.failureCount >= 3) {
      state.state = "open";
      state.openUntil = Date.now() + 3e4;
    }
  }
};

// src/server/router.ts
var MAX_BODY_BYTES = 1024 * 1024;
function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json)
  });
  res.end(json);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    req.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalLength += buf.length;
      if (totalLength > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Request body exceeded maximum allowed size (1MB)"));
        return;
      }
      chunks.push(buf);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
function createHttpHandler(configManager, dispatcher) {
  return async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const endpoint = pathParts[2] || "";
    try {
      if (endpoint === "translate" && req.method === "POST") {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw || "{}");
        const rawTexts = parsed.texts !== void 0 ? parsed.texts : parsed.text;
        let texts = [];
        if (Array.isArray(rawTexts)) {
          texts = rawTexts.filter((t) => typeof t === "string");
        } else if (typeof rawTexts === "string") {
          texts = [rawTexts];
        }
        const forceRefresh = Boolean(parsed.forceRefresh);
        if (texts.length === 0) {
          sendJson(res, 200, { ok: true, results: [] });
          return;
        }
        const results = await dispatcher.translateBatch(texts, forceRefresh);
        sendJson(res, 200, { ok: true, results });
        return;
      }
      if (endpoint === "config") {
        if (req.method === "GET") {
          sendJson(res, 200, { ok: true, config: configManager.getMaskedConfig() });
          return;
        }
        if (req.method === "POST") {
          const raw = await readBody(req);
          const updates = JSON.parse(raw || "{}");
          if (typeof updates !== "object" || updates === null || Array.isArray(updates)) {
            sendJson(res, 400, { ok: false, error: "Invalid config payload" });
            return;
          }
          await configManager.updateConfig(updates);
          sendJson(res, 200, { ok: true, config: configManager.getMaskedConfig() });
          return;
        }
      }
      if (endpoint === "test-channel" && req.method === "POST") {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw || "{}");
        const channelId = typeof parsed.channel === "string" ? parsed.channel : "";
        const result = await dispatcher.testChannel(channelId);
        sendJson(res, 200, result);
        return;
      }
      sendJson(res, 404, { ok: false, error: "Endpoint not found" });
    } catch (err) {
      const status = err?.message?.includes("exceeded maximum allowed size") ? 413 : 500;
      sendJson(res, status, { ok: false, error: err?.message || String(err) });
    }
  };
}

// src/index.ts
var name = "dsh-chat-tidy";
var inject = ["webServer"];
function apply(ctx) {
  const configManager = new ConfigManager();
  const cache = new LruDiskCache(1e3);
  const dispatcher = new TranslationDispatcher(configManager, cache);
  const initPromise = Promise.all([configManager.init(), cache.init()]).catch((err) => {
    console.warn("[dsh-chat-tidy] Initialization error:", err);
  });
  const webServer = ctx.webServer || (ctx.get ? ctx.get("webServer") : null);
  if (webServer && typeof webServer.register === "function") {
    const rawHandler = createHttpHandler(configManager, dispatcher);
    const handler = async (req, res) => {
      await initPromise;
      return rawHandler(req, res);
    };
    ctx.effect(
      () => {
        const unregister = webServer.register({
          kind: "prefix",
          path: "/api/dsh-chat-tidy",
          handler
        });
        return () => {
          if (typeof unregister === "function") {
            unregister();
          }
          cache.dispose().catch((err) => {
            console.warn("[dsh-chat-tidy] Dispose cache error:", err);
          });
        };
      },
      "dsh-chat-tidy: translation API routes"
    );
  }
}
export {
  apply,
  inject,
  name
};
//# sourceMappingURL=index.js.map
