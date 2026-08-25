// src/server/config.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
var KNOWN_CHANNELS = ["siliconflow", "zhipu", "google", "mymemory", "builtin"];
var DEFAULT_CONFIG = {
  enabled: true,
  concurrency: 3,
  timeoutMs: 2e3,
  channels: [...KNOWN_CHANNELS],
  siliconflowKey: "",
  zhipuKey: ""
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
    const merged = [...this.config.channels];
    for (const ch of KNOWN_CHANNELS) {
      if (!merged.includes(ch)) merged.push(ch);
    }
    this.config.channels = merged;
  }
  getConfig() {
    return { ...this.config };
  }
  getMaskedConfig() {
    const maskKey = (k) => {
      if (!k || k.length < 8) return k ? "********" : "";
      return `${k.slice(0, 3)}****${k.slice(-4)}`;
    };
    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      channels: [...this.config.channels],
      siliconflowKeyMasked: maskKey(this.config.siliconflowKey),
      zhipuKeyMasked: maskKey(this.config.zhipuKey),
      hasSiliconflowKey: !!(this.config.siliconflowKey && this.config.siliconflowKey.trim().length > 0),
      hasZhipuKey: !!(this.config.zhipuKey && this.config.zhipuKey.trim().length > 0)
    };
  }
  async updateConfig(partial) {
    const next = {
      ...this.config,
      ...partial
    };
    if (typeof next.concurrency === "number") {
      next.concurrency = Math.min(Math.max(Math.round(next.concurrency), 1), 6);
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
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === "string") {
            this.cache.set(k, v);
          }
        }
      }
    } catch {
    }
  }
  get(key) {
    const val = this.cache.get(key);
    if (val !== void 0) {
      this.cache.delete(key);
      this.cache.set(key, val);
      return val;
    }
    return void 0;
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
    this.cache.set(key, value);
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

// src/server/adapters/siliconflow.ts
var SYSTEM_PROMPT = "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6280\u672F\u5DE5\u5177\u52A8\u4F5C\u7B80\u77ED\u6807\u9898\u7FFB\u8BD1\u5668\u3002\u8BF7\u5C06\u7ED9\u51FA\u7684\u5DE5\u5177\u8C03\u7528\u63CF\u8FF0\u6216\u6807\u9898\u7FFB\u8BD1\u4E3A\u6781\u5176\u7B80\u7EC3\u7684\u4E2D\u6587\u52A8\u5BBE\u77ED\u8BED\uFF08\u4FDD\u7559\u547D\u4EE4\u540D\u3001\u53C2\u6570\u3001\u6587\u4EF6\u8DEF\u5F84\u3001URL\u3001\u6807\u8BC6\u7B26\u539F\u6837\uFF09\u3002\u53EA\u8FD4\u56DE\u7FFB\u8BD1\u540E\u7684\u7EAF\u4E2D\u6587\u77ED\u8BED\uFF0C\u4E0D\u8981\u5305\u542B\u4EFB\u4F55\u89E3\u91CA\u3001\u989D\u5916\u6807\u70B9\u3001\u524D\u7F00\u3001\u5F15\u53F7\u6216 Markdown \u683C\u5F0F\u3002";
var SiliconFlowAdapter = class {
  id = "siliconflow";
  name = "\u7845\u57FA\u6D41\u52A8 (Qwen2.5-7B)";
  isAvailable(config) {
    return !!(config.siliconflowKey && config.siliconflowKey.trim().length > 0);
  }
  async translate(text, signal, config) {
    const key = config.siliconflowKey?.trim();
    if (!key) {
      throw new Error("SiliconFlow API key is not configured");
    }
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text }
        ],
        temperature: 0,
        max_tokens: 60,
        stream: false
      }),
      signal
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`SiliconFlow API responded with ${response.status}: ${errText}`);
    }
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("SiliconFlow returned empty translation");
    }
    return content;
  }
};

// src/server/adapters/zhipu.ts
var SYSTEM_PROMPT2 = "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6280\u672F\u5DE5\u5177\u52A8\u4F5C\u7B80\u77ED\u6807\u9898\u7FFB\u8BD1\u5668\u3002\u8BF7\u5C06\u7ED9\u51FA\u7684\u5DE5\u5177\u8C03\u7528\u63CF\u8FF0\u6216\u6807\u9898\u7FFB\u8BD1\u4E3A\u6781\u5176\u7B80\u7EC3\u7684\u4E2D\u6587\u52A8\u5BBE\u77ED\u8BED\uFF08\u4FDD\u7559\u547D\u4EE4\u540D\u3001\u53C2\u6570\u3001\u6587\u4EF6\u8DEF\u5F84\u3001URL\u3001\u6807\u8BC6\u7B26\u539F\u6837\uFF09\u3002\u53EA\u8FD4\u56DE\u7FFB\u8BD1\u540E\u7684\u7EAF\u4E2D\u6587\u77ED\u8BED\uFF0C\u4E0D\u8981\u5305\u542B\u4EFB\u4F55\u89E3\u91CA\u3001\u989D\u5916\u6807\u70B9\u3001\u524D\u7F00\u3001\u5F15\u53F7\u6216 Markdown \u683C\u5F0F\u3002";
var ZhipuAdapter = class {
  id = "zhipu";
  name = "\u667A\u8C31 AI (glm-4-flash)";
  isAvailable(config) {
    return !!(config.zhipuKey && config.zhipuKey.trim().length > 0);
  }
  async translate(text, signal, config) {
    const key = config.zhipuKey?.trim();
    if (!key) {
      throw new Error("Zhipu API key is not configured");
    }
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT2 },
          { role: "user", content: text }
        ],
        temperature: 0,
        max_tokens: 60,
        stream: false
      }),
      signal
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Zhipu API responded with ${response.status}: ${errText}`);
    }
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Zhipu returned empty translation");
    }
    return content;
  }
};

// src/server/adapters/google.ts
var GoogleTranslateAdapter = class {
  id = "google";
  name = "\u8C37\u6B4C\u7FFB\u8BD1 (\u514D\u8D39\u63A5\u53E3)";
  isAvailable(_config) {
    return true;
  }
  async translate(text, signal, _config) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "dsh-chat-tidy/0.3.0",
        Accept: "application/json"
      },
      signal
    });
    if (!response.ok) {
      throw new Error(`Google Translate responded with status ${response.status}`);
    }
    const json = await response.json();
    const segments = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : null;
    if (!segments) {
      throw new Error("Google Translate returned an unexpected response");
    }
    const translated = segments.filter((seg) => Array.isArray(seg) && typeof seg[0] === "string").map((seg) => seg[0]).join("").trim();
    if (!translated) {
      throw new Error("Google Translate returned an empty translation");
    }
    return translated;
  }
};

// src/server/adapters/mymemory.ts
function unescapeHtml(html) {
  return html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/");
}
var MyMemoryAdapter = class {
  id = "mymemory";
  name = "MyMemory \u514D\u8D39\u673A\u5668\u7FFB\u8BD1";
  isAvailable(_config) {
    return true;
  }
  async translate(text, signal, _config) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "dsh-chat-tidy/0.3.0"
      },
      signal
    });
    if (!response.ok) {
      throw new Error(`MyMemory API responded with status ${response.status}`);
    }
    const json = await response.json();
    const translated = json.responseData?.translatedText?.trim();
    if (!translated || json.responseStatus !== 200) {
      throw new Error("MyMemory translation failed or quota exceeded");
    }
    if (translated.startsWith("MYMEMORY WARNING:")) {
      throw new Error("MyMemory quota exceeded");
    }
    return unescapeHtml(translated);
  }
};

// src/server/adapters/builtin.ts
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
  [/^stage\s+(.+)$/i, (m) => `\u6682\u5B58 ${m[1]}`],
  [/^commit\s+(.+)$/i, (m) => `\u63D0\u4EA4 ${m[1]}`],
  [/^list\s+(.+)$/i, (m) => `\u5217\u51FA ${m[1]}`],
  [/^clean\s+(.+)$/i, (m) => `\u6E05\u7406 ${m[1]}`],
  [/^update\s+(.+)$/i, (m) => `\u66F4\u65B0 ${m[1]}`],
  [/^fetch\s+(.+)$/i, (m) => `\u83B7\u53D6 ${m[1]}`]
];
var BuiltinDictAdapter = class {
  id = "builtin";
  name = "\u79BB\u7EBF\u6280\u672F\u8BCD\u5178";
  isAvailable(_config) {
    return true;
  }
  async translate(text, _signal, _config) {
    const raw = text.trim();
    const lower = raw.toLowerCase();
    if (EXACT_PATTERNS[lower]) {
      return EXACT_PATTERNS[lower];
    }
    for (const [pattern, formatter] of PREFIX_PATTERNS) {
      const match = pattern.exec(raw);
      if (match) {
        return formatter(match);
      }
    }
    return raw;
  }
};

// src/server/dispatcher.ts
var CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5]/;
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
    this.registerAdapter(new SiliconFlowAdapter());
    this.registerAdapter(new ZhipuAdapter());
    this.registerAdapter(new GoogleTranslateAdapter());
    this.registerAdapter(new MyMemoryAdapter());
    this.registerAdapter(new BuiltinDictAdapter());
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
    if (CHINESE_CHAR_REGEX.test(text)) {
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
      const channels = currentConfig.channels || ["siliconflow", "zhipu", "mymemory", "builtin"];
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
        }
      }
      try {
        const builtin = this.adapters.get("builtin");
        if (builtin) {
          const fallback = await builtin.translate(text, new AbortController().signal, currentConfig);
          if (fallback && fallback.trim()) {
            return {
              original: rawText,
              translated: fallback.trim(),
              channel: "builtin",
              cached: false
            };
          }
        }
      } catch {
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
        6
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
      6
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
    "Content-Length": Buffer.byteLength(json),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
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
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      });
      res.end();
      return;
    }
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
