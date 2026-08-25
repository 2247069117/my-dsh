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
  translateThinking: false
};
var ConfigManager = class {
  config = { ...DEFAULT_CONFIG };
  configPath;
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
    const retired = /* @__PURE__ */ new Set(["google", "gateway", "builtin", "mymemory", "siliconflow", "zhipu"]);
    const merged = this.config.channels.filter((ch) => !retired.has(ch));
    for (const ch of KNOWN_CHANNELS) {
      if (!merged.includes(ch)) merged.push(ch);
    }
    this.config.channels = merged;
  }
  getConfig() {
    return { ...this.config };
  }
  getMaskedConfig() {
    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      channels: [...this.config.channels],
      translateThinking: this.config.translateThinking === true
    };
  }
  async updateConfig(partial) {
    const next = {
      ...this.config,
      ...partial
    };
    if (typeof next.concurrency === "number") {
      next.concurrency = Math.min(Math.max(Math.round(next.concurrency), 1), MAX_CONCURRENCY);
    }
    if (typeof next.timeoutMs === "number") {
      next.timeoutMs = Math.min(Math.max(Math.round(next.timeoutMs), 500), 1e4);
    }
    this.config = next;
    await this.save();
    return this.getConfig();
  }
  async save() {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), "utf-8");
    } catch (err) {
      console.warn("[dsh-chat-tidy] Failed to save config file:", err);
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
    try {
      const obj = {};
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
      }
      await fs2.mkdir(path2.dirname(this.filePath), { recursive: true });
      await fs2.writeFile(this.filePath, JSON.stringify(obj, null, 2), "utf-8");
    } catch (err) {
      console.warn("[dsh-chat-tidy] Failed to write cache file:", err);
    }
  }
};

// src/server/adapters/bing.ts
var TRANSLATOR_URL = "https://cn.bing.com/translator";
var TRANSLATE_URL = "https://cn.bing.com/ttranslatev3?isVertical=1&&IG={IG}&IID=translator.5025.1";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var IG_RE = /,IG:"(.*?)",/;
var ABUSE_RE = /var\s+params_AbusePreventionHelper\s*=\s*\[\s*(\d+),\s*"([^"]+)"/;
var cachedTokens = null;
var tokensFetchedAt = 0;
var TOKEN_TTL_MS = 15 * 60 * 1e3;
async function fetchTokens(signal) {
  if (cachedTokens && Date.now() - tokensFetchedAt < TOKEN_TTL_MS) {
    return cachedTokens;
  }
  const response = await fetch(TRANSLATOR_URL, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html"
    },
    signal
  });
  if (!response.ok) {
    throw new Error(`Bing translator page responded with status ${response.status}`);
  }
  const html = await response.text();
  const igMatch = IG_RE.exec(html);
  const abuseMatch = ABUSE_RE.exec(html);
  if (!igMatch || !abuseMatch) {
    throw new Error("Bing translator page: IG or abuse-prevention token not found");
  }
  cachedTokens = { ig: igMatch[1], key: abuseMatch[1], token: abuseMatch[2] };
  tokensFetchedAt = Date.now();
  return cachedTokens;
}
var BingWebAdapter = class {
  id = "bing";
  name = "\u5FAE\u8F6F Bing \u7F51\u9875\u7FFB\u8BD1 (\u514DKey\u76F4\u8FDE)";
  isAvailable(_config) {
    return true;
  }
  async translate(text, signal, _config) {
    const { ig, key, token } = await fetchTokens(signal);
    const body = new URLSearchParams({
      fromLang: "auto-detect",
      text,
      to: "zh-Hans",
      key,
      token,
      tryFetchingGenderDebiasedTranslations: "true"
    });
    const response = await fetch(TRANSLATE_URL.replace("{IG}", ig), {
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
      throw new Error(`Bing translate responded with status ${response.status}`);
    }
    const json = await response.json();
    const translated = json?.[0]?.translations?.[0]?.text?.trim();
    if (!translated) {
      cachedTokens = null;
      throw new Error("Bing translate returned an empty result");
    }
    return translated;
  }
};

// src/server/dispatcher.ts
function isMostlyChinese(text, threshold = 0.2) {
  const m = text.match(/[\u4e00-\u9fa5]/g);
  const c = m ? m.length : 0;
  if (c === 0) return false;
  if (text.length < 80) return true;
  return c > 15 || c / text.length > threshold;
}
var TranslationDispatcher = class {
  configManager;
  cache;
  adapters = /* @__PURE__ */ new Map();
  circuitStates = /* @__PURE__ */ new Map();
  inFlightMap = /* @__PURE__ */ new Map();
  activeCount = 0;
  queue = [];
  constructor(configManager, cache) {
    this.configManager = configManager;
    this.cache = cache;
    this.registerAdapter(new BingWebAdapter());
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
    const inFlight = this.inFlightMap.get(cacheKey);
    if (inFlight) {
      return inFlight;
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
          let translatedText = "";
          try {
            translatedText = await adapter.translate(text, abortCtrl.signal, currentConfig);
          } finally {
            clearTimeout(timer);
          }
          const cleaned = translatedText?.trim();
          if (cleaned && cleaned.length > 0) {
            this.recordSuccess(chId);
            this.cache.set(cacheKey, cleaned);
            return {
              original: rawText,
              translated: cleaned,
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
    this.inFlightMap.set(cacheKey, taskPromise);
    try {
      return await taskPromise;
    } finally {
      this.inFlightMap.delete(cacheKey);
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
    const state = this.circuitStates.get(channelId);
    if (!state) return false;
    if (state.openUntil > Date.now()) {
      return true;
    }
    state.openUntil = 0;
    return false;
  }
  recordSuccess(channelId) {
    const state = this.circuitStates.get(channelId);
    if (state) {
      state.failureCount = 0;
      state.openUntil = 0;
    }
  }
  recordFailure(channelId) {
    let state = this.circuitStates.get(channelId);
    if (!state) {
      state = { failureCount: 0, openUntil: 0 };
      this.circuitStates.set(channelId, state);
    }
    state.failureCount++;
    if (state.failureCount >= 3) {
      state.openUntil = Date.now() + 3e4;
    }
  }
};

// src/server/router.ts
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
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
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
        const texts = Array.isArray(parsed.texts) ? parsed.texts : typeof parsed.text === "string" ? [parsed.text] : [];
        const forceRefresh = !!parsed.forceRefresh;
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
      sendJson(res, 500, { ok: false, error: err?.message || String(err) });
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
  Promise.all([configManager.init(), cache.init()]).catch((err) => {
    console.warn("[dsh-chat-tidy] Initialization error:", err);
  });
  const webServer = ctx.webServer || (ctx.get ? ctx.get("webServer") : null);
  if (webServer && typeof webServer.register === "function") {
    const handler = createHttpHandler(configManager, dispatcher);
    ctx.effect(
      () => webServer.register({
        kind: "prefix",
        path: "/api/dsh-chat-tidy",
        handler
      }),
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
