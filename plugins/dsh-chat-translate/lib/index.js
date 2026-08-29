// src/server/config.ts
import * as fs2 from "node:fs/promises";
import * as path2 from "node:path";
import * as os2 from "node:os";

// src/server/credentials.ts
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
var TRANSLATE_API_KEY_REF = "TRANSLATE_API_KEY";
function parseRefs(yaml) {
  const refs = {};
  let inRefs = false;
  for (const line of yaml.split(/\r?\n/)) {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (indent === 0) {
      inRefs = trimmed === "refs:" || trimmed.startsWith("refs:");
      continue;
    }
    if (!inRefs) continue;
    const m = /^([A-Za-z0-9_.\-]+):\s*(.*)$/.exec(trimmed);
    if (!m) continue;
    let value = m[2].trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      const q = value[0];
      let close = -1;
      for (let i = 1; i < value.length; i++) {
        if (q === '"' && value[i] === "\\") {
          i++;
          continue;
        }
        if (value[i] === q) {
          close = i;
          break;
        }
      }
      if (close > 0) {
        let inner = value.slice(1, close);
        if (q === '"') inner = inner.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        value = inner;
      } else {
        value = value.slice(1);
      }
    } else {
      const hashIdx = value.indexOf(" #");
      if (hashIdx >= 0) value = value.slice(0, hashIdx).trim();
    }
    if (value) refs[m[1]] = value;
  }
  return refs;
}
var KEY_CACHE_TTL_MS = 1e3;
var CredentialsReader = class {
  filePath;
  cachedKey = "";
  cachedAt = 0;
  constructor() {
    const dshHome = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
    this.filePath = path.join(dshHome, ".credentials.yaml");
  }
  /** Read the file fresh on every call so a key added at runtime takes effect immediately. */
  readRefs() {
    try {
      const content = fs.readFileSync(this.filePath, "utf-8");
      return parseRefs(content);
    } catch {
      return {};
    }
  }
  getApiKey() {
    const now = Date.now();
    if (now - this.cachedAt < KEY_CACHE_TTL_MS) {
      return this.cachedKey;
    }
    this.cachedKey = (this.readRefs()[TRANSLATE_API_KEY_REF] || "").trim();
    this.cachedAt = now;
    return this.cachedKey;
  }
  /**
   * Write (or clear) the TRANSLATE_API_KEY ref, preserving every other line of
   * the file (other refs, records section, comments). The file stays the single
   * source of truth for credentials and keeps 0600 permissions. An empty key
   * removes the ref entirely.
   */
  async setApiKey(apiKey) {
    const normalized = apiKey.trim();
    let lines;
    try {
      lines = fs.readFileSync(this.filePath, "utf-8").split(/\r?\n/);
    } catch {
      lines = ["version: 1", "refs:", "records: {}"];
    }
    const refsStart = lines.findIndex((l) => l.trim() === "refs:" || l.trim().startsWith("refs:"));
    let replaced = false;
    if (refsStart >= 0) {
      for (let i = refsStart + 1; i < lines.length; i++) {
        const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
        if (indent === 0) break;
        if (/^TRANSLATE_API_KEY\s*:/.test(lines[i].trim())) {
          if (normalized) {
            lines[i] = `  TRANSLATE_API_KEY: "${escapeYaml(normalized)}"`;
          } else {
            lines.splice(i, 1);
          }
          replaced = true;
          break;
        }
      }
    }
    if (!replaced && normalized) {
      if (refsStart >= 0) {
        let insertAt = lines.length;
        for (let i = refsStart + 1; i < lines.length; i++) {
          const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
          if (indent === 0 && lines[i].trim()) {
            insertAt = i;
            break;
          }
        }
        lines.splice(insertAt, 0, `  TRANSLATE_API_KEY: "${escapeYaml(normalized)}"`);
      } else {
        lines.splice(1, 0, "refs:", `  TRANSLATE_API_KEY: "${escapeYaml(normalized)}"`);
      }
    }
    await fsp.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    await fsp.writeFile(tmpPath, lines.join("\n"), "utf-8");
    await fsp.chmod(tmpPath, 384);
    await fsp.rename(tmpPath, this.filePath);
    this.cachedKey = "";
    this.cachedAt = 0;
  }
};
function escapeYaml(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// src/server/config.ts
var MAX_CONCURRENCY = 100;
var AI_TIMEOUT_MIN = 500;
var AI_TIMEOUT_MAX = 12e4;
var DEFAULT_CONFIG = {
  enabled: true,
  concurrency: 3,
  timeoutMs: 2e3,
  aiTimeoutMs: 3e4,
  aiEnabled: true,
  bingEnabled: true,
  baseUrl: "",
  model: "",
  targetLang: "zh-Hans"
};
var ConfigManager = class {
  config = { ...DEFAULT_CONFIG };
  configPath;
  credentials;
  listeners = /* @__PURE__ */ new Set();
  constructor(credentials) {
    this.credentials = credentials ?? new CredentialsReader();
    const dshHome = process.env.DSH_HOME || path2.join(os2.homedir(), ".dsh");
    this.configPath = path2.join(dshHome, "dsh-chat-translate-config.json");
  }
  async init() {
    try {
      const data = await fs2.readFile(this.configPath, "utf-8");
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
    if (!Number.isFinite(this.config.aiTimeoutMs) || this.config.aiTimeoutMs < AI_TIMEOUT_MIN) {
      this.config.aiTimeoutMs = DEFAULT_CONFIG.aiTimeoutMs;
    } else {
      this.config.aiTimeoutMs = Math.min(
        Math.max(Math.round(this.config.aiTimeoutMs), AI_TIMEOUT_MIN),
        AI_TIMEOUT_MAX
      );
    }
    if (typeof this.config.enabled !== "boolean") this.config.enabled = DEFAULT_CONFIG.enabled;
    if (typeof this.config.aiEnabled !== "boolean") this.config.aiEnabled = DEFAULT_CONFIG.aiEnabled;
    if (typeof this.config.bingEnabled !== "boolean") this.config.bingEnabled = DEFAULT_CONFIG.bingEnabled;
    if (typeof this.config.baseUrl !== "string") this.config.baseUrl = DEFAULT_CONFIG.baseUrl;
    if (typeof this.config.model !== "string") this.config.model = DEFAULT_CONFIG.model;
    if (!this.config.targetLang || typeof this.config.targetLang !== "string") {
      this.config.targetLang = DEFAULT_CONFIG.targetLang;
    }
    delete this.config.channels;
  }
  getConfig() {
    return { ...this.config };
  }
  /** Whether the AI channel has every required piece: baseUrl, model and key. */
  isAiConfigured() {
    return Boolean(
      this.config.baseUrl.trim() && this.config.model.trim() && this.credentials.getApiKey()
    );
  }
  getMaskedConfig() {
    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      aiTimeoutMs: this.config.aiTimeoutMs,
      aiEnabled: this.config.aiEnabled,
      bingEnabled: this.config.bingEnabled,
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      targetLang: this.config.targetLang || "zh-Hans",
      aiConfigured: this.isAiConfigured()
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
        console.warn("[dsh-chat-translate] Config listener error:", err);
      }
    }
  }
  async updateConfig(partial) {
    const next = {
      ...this.config,
      ...partial
    };
    delete next.channels;
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
    if (typeof partial.aiTimeoutMs === "number" && Number.isFinite(partial.aiTimeoutMs)) {
      next.aiTimeoutMs = Math.min(
        Math.max(Math.round(partial.aiTimeoutMs), AI_TIMEOUT_MIN),
        AI_TIMEOUT_MAX
      );
    } else {
      next.aiTimeoutMs = this.config.aiTimeoutMs;
    }
    if (typeof partial.enabled === "boolean") next.enabled = partial.enabled;
    if (typeof partial.aiEnabled === "boolean") next.aiEnabled = partial.aiEnabled;
    if (typeof partial.bingEnabled === "boolean") next.bingEnabled = partial.bingEnabled;
    if (typeof partial.baseUrl === "string") next.baseUrl = partial.baseUrl.trim();
    if (typeof partial.model === "string") next.model = partial.model.trim();
    if (typeof partial.targetLang === "string" && partial.targetLang.trim()) {
      next.targetLang = partial.targetLang.trim();
    }
    this.config = next;
    await this.save();
    this.notifyListeners();
    return this.getConfig();
  }
  async save() {
    const tmpPath = `${this.configPath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    try {
      await fs2.mkdir(path2.dirname(this.configPath), { recursive: true });
      await fs2.writeFile(tmpPath, JSON.stringify(this.config, null, 2), "utf-8");
      await fs2.rename(tmpPath, this.configPath);
    } catch (err) {
      console.warn("[dsh-chat-translate] Failed to save config file atomically:", err);
      try {
        await fs2.unlink(tmpPath);
      } catch {
      }
    }
  }
};

// src/server/cache.ts
import * as fs3 from "node:fs/promises";
import * as path3 from "node:path";
import * as os3 from "node:os";
var TTL_MS = 7 * 24 * 60 * 60 * 1e3;
var LruDiskCache = class {
  cache = /* @__PURE__ */ new Map();
  maxEntries;
  filePath;
  saveTimer = null;
  dirty = false;
  constructor(maxEntries = 1e3) {
    this.maxEntries = maxEntries;
    const dshHome = process.env.DSH_HOME || path3.join(os3.homedir(), ".dsh");
    this.filePath = path3.join(dshHome, "dsh-chat-translate-cache.json");
  }
  async init() {
    try {
      const content = await fs3.readFile(this.filePath, "utf-8");
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
          console.warn("[dsh-chat-translate] Failed to flush cache to disk:", err);
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
      await fs3.mkdir(path3.dirname(this.filePath), { recursive: true });
      await fs3.writeFile(tmpPath, JSON.stringify(obj, null, 2), "utf-8");
      await fs3.rename(tmpPath, this.filePath);
    } catch (err) {
      console.warn("[dsh-chat-translate] Failed to write cache file atomically:", err);
      try {
        await fs3.unlink(tmpPath);
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

// src/server/adapters/openai.ts
var LANG_HINTS = {
  "zh-hans": "Simplified Chinese",
  "zh-cn": "Simplified Chinese",
  "zh": "Simplified Chinese",
  "zh-tw": "Traditional Chinese",
  "zh-hant": "Traditional Chinese",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  es: "Spanish",
  ru: "Russian",
  pt: "Portuguese",
  it: "Italian"
};
var OpenAiCompatibleAdapter = class {
  id = "openai";
  name = "OpenAI \u517C\u5BB9 (Chat Completions)";
  credentials;
  constructor(credentials) {
    this.credentials = credentials;
  }
  isAvailable(config) {
    return Boolean(
      config.aiEnabled && config.baseUrl?.trim() && config.model?.trim() && this.credentials.getApiKey()
    );
  }
  async translate(text, signal, config) {
    const apiKey = this.credentials.getApiKey();
    if (!apiKey) {
      throw new Error(`TRANSLATE_API_KEY is not configured in ~/.dsh/.credentials.yaml`);
    }
    const baseUrl = (config.baseUrl || "").trim().replace(/\/+$/, "");
    const model = (config.model || "").trim();
    if (!baseUrl || !model) {
      throw new Error("OpenAI channel: baseUrl or model is not configured");
    }
    const langName = LANG_HINTS[(config.targetLang || "zh-Hans").toLowerCase()] || config.targetLang || "Simplified Chinese";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the user's message into ${langName}. Output ONLY the translated text \u2014 no explanations, no quotation marks, no extra words. Preserve every placeholder like __DSH_MASK_0__ exactly as-is.`
          },
          { role: "user", content: text }
        ]
      }),
      signal
    });
    if (!response.ok) {
      let detail = "";
      try {
        const errBody = await response.json();
        detail = errBody?.error?.message || errBody?.message || "";
      } catch {
      }
      throw new Error(`OpenAI-compatible API responded with ${response.status}${detail ? `: ${detail}` : ""}`);
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const translated = typeof content === "string" ? content.trim() : "";
    if (!translated) {
      throw new Error("OpenAI-compatible API returned empty content");
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
var TranslationDispatcher = class {
  configManager;
  cache;
  credentials;
  masking = new ContentMaskingPipeline();
  adapters = /* @__PURE__ */ new Map();
  circuitStates = /* @__PURE__ */ new Map();
  inFlightMap = /* @__PURE__ */ new Map();
  activeCount = 0;
  queue = [];
  constructor(configManager, cache, credentials) {
    this.configManager = configManager;
    this.cache = cache;
    this.credentials = credentials ?? configManager.credentials ?? { getApiKey: () => "" };
    this.registerAdapter(new OpenAiCompatibleAdapter(this.credentials));
    this.registerAdapter(new BingWebAdapter());
    this.configManager.onConfigChange(() => {
      this.processNext();
    });
  }
  registerAdapter(adapter) {
    this.adapters.set(adapter.id, adapter);
  }
  /**
   * Decide which channels are active for the current config, in priority order.
   *
   * Truth table (user contract):
   *  - AI on + configured + Bing on        -> [openai, bing]  (AI first, Bing fallback)
   *  - AI on + NOT configured + Bing on    -> [bing]
   *  - AI on + NOT configured + Bing off   -> []              (no translation)
   *  - AI off + Bing on                    -> [bing]
   *  - AI off + Bing off                   -> []              (no translation)
   */
  computeChannels(config) {
    const channels = [];
    for (const [id, adapter] of this.adapters) {
      if (id === "openai") {
        if (config.aiEnabled && config.baseUrl?.trim() && config.model?.trim() && this.credentials.getApiKey()) {
          channels.push(id);
        }
        continue;
      }
      if (id === "bing") {
        if (config.bingEnabled) channels.push(id);
        continue;
      }
      if (adapter.isAvailable(config)) channels.push(id);
    }
    return channels;
  }
  async translateBatch(texts, forceRefresh = false) {
    return Promise.all(texts.map((t) => this.translateOne(t, forceRefresh)));
  }
  async translateOne(rawText, forceRefresh = false) {
    const text = rawText.trim();
    if (!text) {
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
    const taskPromise = this.enqueueTask(async () => {
      const currentConfig = this.configManager.getConfig();
      const channels = this.computeChannels(currentConfig);
      for (const chId of channels) {
        const adapter = this.adapters.get(chId);
        if (!adapter || !adapter.isAvailable(currentConfig) || this.isCircuitOpen(chId)) {
          continue;
        }
        try {
          const timeout = chId === "openai" ? currentConfig.aiTimeoutMs || 3e4 : currentConfig.timeoutMs || 2e3;
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
          this.recordFailure(chId);
          console.warn(
            `[dsh-chat-translate] channel ${chId} returned an empty translation | text: ${text.slice(0, 60)}`
          );
        } catch (err) {
          this.recordFailure(chId);
          console.warn(
            `[dsh-chat-translate] channel ${chId} failed: ${err?.message || String(err)} | text: ${text.slice(0, 60)}`
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
      return { ok: false, latencyMs: 0, error: `Channel ${channelId} is not configured or disabled` };
    }
    const testText = "List files in current directory";
    const start = Date.now();
    try {
      const timeout = channelId === "openai" ? Math.min(config.aiTimeoutMs || 3e4, 3e4) : 4e3;
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), timeout);
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
        state.probeInFlight = true;
        return false;
      }
      return true;
    }
    if (state.state === "half-open") {
      if (state.probeInFlight) return true;
      state.probeInFlight = true;
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
      state.probeInFlight = false;
    }
  }
  recordFailure(channelId) {
    let state = this.circuitStates.get(channelId);
    if (!state) {
      state = { state: "closed", failureCount: 0, openUntil: 0, probeInFlight: false };
      this.circuitStates.set(channelId, state);
    }
    if (state.state === "half-open") {
      state.state = "open";
      state.failureCount = 3;
      state.openUntil = Date.now() + 3e4;
      state.probeInFlight = false;
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
        if (typeof req.destroy === "function") {
          req.destroy();
        }
        reject(new Error("Request body exceeded maximum allowed size (1MB)"));
        return;
      }
      chunks.push(buf);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
function createHttpHandler(configManager, dispatcher, credentials) {
  return async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const endpoint = pathParts[2] || "";
    try {
      if (endpoint === "translate" && req.method === "POST") {
        const raw = await readBody(req);
        let parsed;
        try {
          parsed = JSON.parse(raw || "{}");
        } catch {
          sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
          return;
        }
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
          let updates;
          try {
            updates = JSON.parse(raw || "{}");
          } catch {
            sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
            return;
          }
          if (typeof updates !== "object" || updates === null || Array.isArray(updates)) {
            sendJson(res, 400, { ok: false, error: "Invalid config payload" });
            return;
          }
          await configManager.updateConfig(updates);
          sendJson(res, 200, { ok: true, config: configManager.getMaskedConfig() });
          return;
        }
      }
      if (endpoint === "credentials" && req.method === "POST") {
        if (!credentials) {
          sendJson(res, 500, { ok: false, error: "Credentials reader unavailable" });
          return;
        }
        const raw = await readBody(req);
        let parsed;
        try {
          parsed = JSON.parse(raw || "{}");
        } catch {
          sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
          return;
        }
        const apiKey = typeof parsed.apiKey === "string" ? parsed.apiKey : "";
        try {
          await credentials.setApiKey(apiKey);
          sendJson(res, 200, { ok: true, configured: Boolean(credentials.getApiKey()) });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err?.message || String(err) });
        }
        return;
      }
      if (endpoint === "test-channel" && req.method === "POST") {
        const raw = await readBody(req);
        let parsed;
        try {
          parsed = JSON.parse(raw || "{}");
        } catch {
          sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
          return;
        }
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
var name = "dsh-chat-translate";
var inject = ["webServer"];
function apply(ctx) {
  const credentials = new CredentialsReader();
  const configManager = new ConfigManager(credentials);
  const cache = new LruDiskCache(1e3);
  const dispatcher = new TranslationDispatcher(configManager, cache, credentials);
  const initPromise = Promise.all([configManager.init(), cache.init()]).catch((err) => {
    console.warn("[dsh-chat-translate] Initialization error:", err);
  });
  const webServer = ctx.webServer || (ctx.get ? ctx.get("webServer") : null);
  if (webServer && typeof webServer.register === "function") {
    const rawHandler = createHttpHandler(configManager, dispatcher, credentials);
    const handler = async (req, res) => {
      await initPromise;
      return rawHandler(req, res);
    };
    ctx.effect(
      () => {
        const unregister = webServer.register({
          kind: "prefix",
          path: "/api/dsh-chat-translate",
          handler
        });
        return () => {
          if (typeof unregister === "function") {
            unregister();
          }
          cache.dispose().catch((err) => {
            console.warn("[dsh-chat-translate] Dispose cache error:", err);
          });
        };
      },
      "dsh-chat-translate: translation API routes"
    );
  }
}
export {
  apply,
  inject,
  name
};
//# sourceMappingURL=index.js.map
