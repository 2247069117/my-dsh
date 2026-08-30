// src/server/catalog.ts
var A6API_CATALOG = {
  // --- OpenAI Series ---
  "gpt-5.6-sol": {
    id: "gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    brand: "OpenAI",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 4e6, output: 2e7, cacheRead: 4e5, cacheWrite: 5e6 }
  },
  "gpt-5.6-terra": {
    id: "gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    brand: "OpenAI",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 4e6, output: 2e7, cacheRead: 4e5, cacheWrite: 5e6 }
  },
  "gpt-5.6-luna": {
    id: "gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    brand: "OpenAI",
    contextWindow: 524288,
    maxTokens: 32768,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 2e6, output: 1e7, cacheRead: 2e5, cacheWrite: 25e5 }
  },
  "gpt-5.6": {
    id: "gpt-5.6",
    name: "GPT-5.6",
    brand: "OpenAI",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 4e6, output: 2e7, cacheRead: 4e5, cacheWrite: 5e6 }
  },
  "gpt-5.5": {
    id: "gpt-5.5",
    name: "GPT-5.5",
    brand: "OpenAI",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 3e6, output: 15e6, cacheRead: 3e5, cacheWrite: 375e4 }
  },
  "gpt-5.4": {
    id: "gpt-5.4",
    name: "GPT-5.4",
    brand: "OpenAI",
    contextWindow: 524288,
    maxTokens: 32768,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 25e5, output: 1e7, cacheRead: 25e4, cacheWrite: 3e6 }
  },
  "gpt-5.4-mini": {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    brand: "OpenAI",
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 15e4, output: 6e5, cacheRead: 75e3, cacheWrite: 15e4 }
  },
  "gpt-5.3-codex": {
    id: "gpt-5.3-codex",
    name: "GPT-5.3 Codex",
    brand: "OpenAI",
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ["text"],
    officialPriceMicros: { input: 2e6, output: 8e6, cacheRead: 2e5, cacheWrite: 2e6 }
  },
  "gpt-5.3-codex-spark": {
    id: "gpt-5.3-codex-spark",
    name: "GPT-5.3 Codex Spark",
    brand: "OpenAI",
    contextWindow: 262144,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 1e6, output: 4e6, cacheRead: 1e5, cacheWrite: 1e6 }
  },
  "gpt-5.2": {
    id: "gpt-5.2",
    name: "GPT-5.2",
    brand: "OpenAI",
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 2e6, output: 8e6, cacheRead: 2e5, cacheWrite: 2e6 }
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    brand: "OpenAI",
    contextWindow: 128e3,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 25e5, output: 1e7, cacheRead: 125e4, cacheWrite: 25e5 }
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    brand: "OpenAI",
    contextWindow: 128e3,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 15e4, output: 6e5, cacheRead: 75e3, cacheWrite: 15e4 }
  },
  // --- Anthropic Claude Series ---
  "claude-opus-5": {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 32768,
    modalities: ["text", "image"],
    thinkingFormat: "anthropic",
    officialPriceMicros: { input: 15e6, output: 75e6, cacheRead: 15e5, cacheWrite: 1875e4 }
  },
  "claude-sonnet-5": {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 32768,
    modalities: ["text", "image"],
    thinkingFormat: "anthropic",
    officialPriceMicros: { input: 3e6, output: 15e6, cacheRead: 3e5, cacheWrite: 375e4 }
  },
  "claude-fable-5": {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 32768,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 3e6, output: 15e6, cacheRead: 3e5, cacheWrite: 375e4 }
  },
  "claude-opus-4-8": {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 15e6, output: 75e6, cacheRead: 15e5, cacheWrite: 1875e4 }
  },
  "claude-opus-4-7": {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 15e6, output: 75e6, cacheRead: 15e5, cacheWrite: 1875e4 }
  },
  "claude-opus-4-6": {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 15e6, output: 75e6, cacheRead: 15e5, cacheWrite: 1875e4 }
  },
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 3e6, output: 15e6, cacheRead: 3e5, cacheWrite: 375e4 }
  },
  "claude-haiku-4-5": {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    brand: "Anthropic",
    contextWindow: 2e5,
    maxTokens: 8192,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 25e4, output: 125e4, cacheRead: 25e3, cacheWrite: 312500 }
  },
  // --- DeepSeek Series ---
  "deepseek-v4-pro": {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    brand: "DeepSeek",
    contextWindow: 131072,
    maxTokens: 32768,
    modalities: ["text"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 55e4, output: 219e4, cacheRead: 14e4, cacheWrite: 55e4 }
  },
  "deepseek-v4-flash": {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    brand: "DeepSeek",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 14e4, output: 28e4, cacheRead: 14e3, cacheWrite: 14e4 }
  },
  "DeepSeek-V4-Flash-0731": {
    id: "DeepSeek-V4-Flash-0731",
    name: "DeepSeek V4 Flash (0731)",
    brand: "DeepSeek",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 14e4, output: 28e4, cacheRead: 14e3, cacheWrite: 14e4 }
  },
  "deepseek-v4-pro-0813": {
    id: "deepseek-v4-pro-0813",
    name: "DeepSeek V4 Pro (0813)",
    brand: "DeepSeek",
    contextWindow: 131072,
    maxTokens: 32768,
    modalities: ["text"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 55e4, output: 219e4, cacheRead: 14e4, cacheWrite: 55e4 }
  },
  "deepseek-v4-flash-vision-exp": {
    id: "deepseek-v4-flash-vision-exp",
    name: "DeepSeek V4 Flash Vision Exp",
    brand: "DeepSeek",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 14e4, output: 28e4, cacheRead: 14e3, cacheWrite: 14e4 }
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    brand: "DeepSeek",
    contextWindow: 65536,
    maxTokens: 8192,
    modalities: ["text"],
    officialPriceMicros: { input: 14e4, output: 28e4, cacheRead: 14e3, cacheWrite: 14e4 }
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    brand: "DeepSeek",
    contextWindow: 65536,
    maxTokens: 16384,
    modalities: ["text"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 55e4, output: 219e4, cacheRead: 14e4, cacheWrite: 55e4 }
  },
  // --- Google Gemini Series ---
  "gemini-3.7-flash": {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    brand: "Google",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", low: "low", medium: "medium", high: "high" },
    officialPriceMicros: { input: 1e5, output: 4e5, cacheRead: 25e3, cacheWrite: 1e5 }
  },
  "gemini-3.6-flash": {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    brand: "Google",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 1e5, output: 4e5, cacheRead: 25e3, cacheWrite: 1e5 }
  },
  "gemini-3.5-flash": {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    brand: "Google",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 75e3, output: 3e5, cacheRead: 18750, cacheWrite: 75e3 }
  },
  "gemini-3.5-flash-high": {
    id: "gemini-3.5-flash-high",
    name: "Gemini 3.5 Flash High",
    brand: "Google",
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ["text", "image"],
    reasoningEfforts: { high: "high" },
    officialPriceMicros: { input: 75e3, output: 3e5, cacheRead: 18750, cacheWrite: 75e3 }
  },
  "gemini-3.1-pro-preview": {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    brand: "Google",
    contextWindow: 2097152,
    maxTokens: 65536,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 125e4, output: 5e6, cacheRead: 312500, cacheWrite: 125e4 }
  },
  "gemini-3.1-flash-lite-preview": {
    id: "gemini-3.1-flash-lite-preview",
    name: "Gemini 3.1 Flash Lite Preview",
    brand: "Google",
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 75e3, output: 3e5, cacheRead: 18750, cacheWrite: 75e3 }
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    brand: "Google",
    contextWindow: 2097152,
    maxTokens: 65536,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 125e4, output: 5e6, cacheRead: 312500, cacheWrite: 125e4 }
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    brand: "Google",
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 75e3, output: 3e5, cacheRead: 18750, cacheWrite: 75e3 }
  },
  // --- xAI Grok Series ---
  "grok-4.6": {
    id: "grok-4.6",
    name: "Grok 4.6",
    brand: "xAI",
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ["text", "image"],
    reasoningEfforts: { off: "", high: "high" },
    officialPriceMicros: { input: 2e6, output: 1e7, cacheRead: 2e5, cacheWrite: 25e5 }
  },
  "grok-4.5": {
    id: "grok-4.5",
    name: "Grok 4.5",
    brand: "xAI",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text", "image"],
    officialPriceMicros: { input: 2e6, output: 1e7, cacheRead: 2e5, cacheWrite: 25e5 }
  },
  "grok-4.3": {
    id: "grok-4.3",
    name: "Grok 4.3",
    brand: "xAI",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 2e6, output: 1e7, cacheRead: 2e5, cacheWrite: 25e5 }
  },
  // --- Zhipu GLM Series ---
  "glm-5.3": {
    id: "glm-5.3",
    name: "GLM 5.3",
    brand: "Zhipu",
    contextWindow: 131072,
    maxTokens: 32768,
    modalities: ["text", "image"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 1e6, output: 4e6, cacheRead: 2e5, cacheWrite: 1e6 }
  },
  "glm-5.3-flash": {
    id: "glm-5.3-flash",
    name: "GLM 5.3 Flash",
    brand: "Zhipu",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 1e5, output: 2e5, cacheRead: 1e4, cacheWrite: 1e5 }
  },
  "glm-5.2": {
    id: "glm-5.2",
    name: "GLM 5.2",
    brand: "Zhipu",
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 1e6, output: 4e6, cacheRead: 2e5, cacheWrite: 1e6 }
  },
  // --- Moonshot Kimi Series ---
  "kimi-k3": {
    id: "kimi-k3",
    name: "Kimi K3",
    brand: "Moonshot",
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ["text", "image"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 15e5, output: 6e6, cacheRead: 3e5, cacheWrite: 15e5 }
  },
  "kimi-k2.7-code": {
    id: "kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    brand: "Moonshot",
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ["text"],
    officialPriceMicros: { input: 1e6, output: 4e6, cacheRead: 2e5, cacheWrite: 1e6 }
  },
  // --- Alibaba Qwen Series ---
  "qwen3.8-max": {
    id: "qwen3.8-max",
    name: "Qwen 3.8 Max",
    brand: "Alibaba",
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ["text", "image"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 2e6, output: 8e6, cacheRead: 4e5, cacheWrite: 2e6 }
  },
  "qwen3.8-flash": {
    id: "qwen3.8-flash",
    name: "Qwen 3.8 Flash",
    brand: "Alibaba",
    contextWindow: 1048576,
    maxTokens: 16384,
    modalities: ["text"],
    officialPriceMicros: { input: 1e5, output: 3e5, cacheRead: 2e4, cacheWrite: 1e5 }
  },
  "qwen3.7-max": {
    id: "qwen3.7-max",
    name: "Qwen 3.7 Max",
    brand: "Alibaba",
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ["text", "image"],
    thinkingFormat: "deepseek",
    officialPriceMicros: { input: 2e6, output: 8e6, cacheRead: 4e5, cacheWrite: 2e6 }
  },
  // --- MiniMax Series ---
  "minimax-m3": {
    id: "minimax-m3",
    name: "MiniMax M3",
    brand: "MiniMax",
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ["text"],
    officialPriceMicros: { input: 1e6, output: 4e6, cacheRead: 2e5, cacheWrite: 1e6 }
  }
};
function inferBrand(modelId) {
  const m = modelId.toLowerCase();
  if (m.startsWith("gpt") || m.startsWith("o1") || m.startsWith("o3") || m.startsWith("chatgpt")) return "OpenAI";
  if (m.startsWith("claude")) return "Anthropic";
  if (m.startsWith("gemini") || m.startsWith("google") || m.startsWith("imagen")) return "Google";
  if (m.startsWith("deepseek")) return "DeepSeek";
  if (m.startsWith("grok")) return "xAI";
  if (m.startsWith("glm") || m.startsWith("zhipu") || m.startsWith("cog")) return "Zhipu";
  if (m.startsWith("kimi") || m.startsWith("moonshot")) return "Moonshot";
  if (m.startsWith("qwen")) return "Alibaba";
  if (m.startsWith("minimax")) return "MiniMax";
  if (m.startsWith("mimo") || m.startsWith("xiaomi")) return "Xiaomi";
  if (m.startsWith("hunyuan") || m.startsWith("tencent") || m.startsWith("hy")) return "Tencent";
  return "Other";
}
function resolveModelMeta(modelId) {
  if (A6API_CATALOG[modelId]) {
    return A6API_CATALOG[modelId];
  }
  const lowerId = modelId.toLowerCase();
  for (const [k, v] of Object.entries(A6API_CATALOG)) {
    if (k.toLowerCase() === lowerId) {
      return v;
    }
  }
  const brand = inferBrand(modelId);
  const isVision = lowerId.includes("vision") || lowerId.includes("vl") || lowerId.includes("image");
  const hasReasoning = lowerId.includes("think") || lowerId.includes("reason") || lowerId.includes("pro") || lowerId.includes("sol");
  return {
    id: modelId,
    name: modelId,
    brand,
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: isVision ? ["text", "image"] : ["text"],
    ...hasReasoning ? { thinkingFormat: "deepseek" } : {}
  };
}

// src/server/a6api-client.ts
function cleanBaseUrl(url) {
  if (!url) return "https://api.a6api.com";
  return url.trim().replace(/\/+$/, "");
}
function formatRelativeTime(timestampSec) {
  if (!timestampSec || timestampSec <= 0) return "\u521A\u521A";
  const now = Math.floor(Date.now() / 1e3);
  const diff = now - timestampSec;
  if (diff < 0) return "\u521A\u521A";
  if (diff < 60) return "\u521A\u521A";
  if (diff < 3600) return `${Math.floor(diff / 60)} \u5206\u949F\u524D`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} \u5C0F\u65F6\u524D`;
  return `${Math.floor(diff / 86400)} \u5929\u524D`;
}
function formatCnyPrice(micros, exchangeRate = 6.7209) {
  if (micros === void 0 || micros === null) return "\u2014";
  if (micros === 0) return "\xA50";
  const usd = micros / 1e6;
  const cny = usd * exchangeRate;
  if (cny < 1e-4) return `\xA5${cny.toFixed(6)}`;
  if (cny < 0.01) return `\xA5${cny.toFixed(4)}`;
  if (cny < 1) return `\xA5${cny.toFixed(4)}`;
  return `\xA5${cny.toFixed(3)}`;
}
function buildWebHeaders(userId, sessionCookie) {
  const headers = {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  };
  const uid = userId ? String(userId).trim() : "";
  if (uid) {
    headers["New-Api-User"] = uid;
  }
  if (sessionCookie && sessionCookie.trim()) {
    const raw = sessionCookie.trim();
    if (raw.startsWith("session=")) {
      headers["Cookie"] = raw;
    } else if (raw.includes(";")) {
      headers["Cookie"] = raw;
    } else {
      headers["Authorization"] = raw;
      headers["Cookie"] = `session=${raw}`;
    }
  }
  return headers;
}
async function fetchBalance(baseURL, apiKey, userId, sessionCookie) {
  const cleanUrl = cleanBaseUrl(baseURL);
  let hasAccountAuth = false;
  let accountBalanceUsd = 0;
  let accountBalanceFormatted = "\u672A\u8FDE\u63A5";
  let accountBalanceCnyFormatted = "";
  let username;
  let responseUserId = userId;
  let usedUsd = 0;
  let requestCount = 0;
  if (userId || sessionCookie) {
    const candidates = ["https://a6api.com/api/user/self", `${cleanUrl}/api/user/self`];
    const uniqueCandidates = [...new Set(candidates)];
    for (const url of uniqueCandidates) {
      try {
        const res = await fetch(url, {
          headers: buildWebHeaders(userId, sessionCookie),
          signal: AbortSignal.timeout(6e3)
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && json.data.quota !== void 0) {
            const quota = Number(json.data.quota || 0);
            const rawUsed = Number(json.data.used_quota || 0);
            const usd = Number((quota / 5e5).toFixed(4));
            const cny = Number((usd * 6.7209).toFixed(2));
            const used = Number((rawUsed / 5e5).toFixed(4));
            hasAccountAuth = true;
            accountBalanceUsd = usd;
            accountBalanceFormatted = `$${usd.toFixed(2)}`;
            accountBalanceCnyFormatted = `\u2248 \xA5${cny.toFixed(2)}`;
            usedUsd = used;
            requestCount = Number(json.data.request_count || 0);
            username = json.data.username || json.data.display_name || void 0;
            if (json.data.id) responseUserId = json.data.id;
            break;
          }
        }
      } catch {
      }
    }
  }
  if (!hasAccountAuth && apiKey && apiKey.trim()) {
    try {
      const usageRes = await fetch(`${cleanUrl}/v1/dashboard/billing/usage?start_date=2024-01-01&end_date=2030-12-31`, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(6e3)
      }).catch(() => null);
      if (usageRes && usageRes.ok) {
        const usageJson = await usageRes.json();
        usedUsd = Number(usageJson?.total_usage || 0);
      }
    } catch {
    }
  }
  if (!hasAccountAuth && (!apiKey || !apiKey.trim()) && (!userId || !userId.trim())) {
    return null;
  }
  return {
    hasAccountAuth,
    accountBalanceUsd,
    accountBalanceFormatted,
    accountBalanceCnyFormatted,
    usedUsd,
    usedFormatted: `$${usedUsd.toFixed(2)}`,
    requestCount,
    username,
    userId: responseUserId,
    isLow: hasAccountAuth ? accountBalanceUsd < 0.5 : false,
    updatedAt: Date.now()
  };
}
async function fetchTokenModels(baseURL, apiKey) {
  const cleanUrl = cleanBaseUrl(baseURL);
  if (!apiKey || !apiKey.trim()) return [];
  const endpoints = [`${cleanUrl}/v1/models`, `${cleanUrl}/models`];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(8e3)
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          return json.data.map((m) => String(m.id || m.name)).filter(Boolean);
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) {
    console.warn("[dsh-a6api] fetchTokenModels failed:", lastErr);
  }
  return [];
}
async function fetchRecentLogs(userId, sessionCookie, limit = 30) {
  if (!userId && !sessionCookie) return [];
  try {
    const res = await fetch(`https://a6api.com/api/log/self?p=1&page_size=${limit}&type=0`, {
      headers: buildWebHeaders(userId, sessionCookie),
      signal: AbortSignal.timeout(8e3)
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.items)) {
        return json.data.items.map((it) => {
          const rawQuota = Number(it.quota || 0);
          const costUsd = rawQuota / 5e5;
          let costFormatted = "$0.00";
          if (costUsd > 0) {
            if (costUsd < 1e-4) costFormatted = `$${costUsd.toFixed(6)}`;
            else if (costUsd < 0.01) costFormatted = `$${costUsd.toFixed(4)}`;
            else costFormatted = `$${costUsd.toFixed(4)}`;
          }
          const rawChannel = Number(it.channel || 0);
          let channelId = rawChannel > 0 ? rawChannel : void 0;
          if (!channelId && it.other) {
            try {
              const otherObj = JSON.parse(it.other);
              if (otherObj.actual_channel_id && Number(otherObj.actual_channel_id) > 0) {
                channelId = Number(otherObj.actual_channel_id);
              } else if (otherObj.billed_channel_id && Number(otherObj.billed_channel_id) > 0) {
                channelId = Number(otherObj.billed_channel_id);
              }
            } catch {
            }
          }
          const isError = it.type !== 2 || it.other && (it.other.includes('"request_final_status":"failed"') || it.other.includes('"request_final_status":"error"') || it.other.includes('"request_final_status":"upstream_error"')) || Boolean(it.content && it.content.startsWith("status_code="));
          return {
            id: it.id || it.request_id || String(Math.random()),
            created_at: Number(it.created_at || Date.now() / 1e3),
            model_name: it.model_name || it.marketplace_model_name || "",
            channel: channelId,
            channel_name: it.channel_name || (channelId ? `\u5546\u6237 #${channelId}` : void 0),
            prompt_tokens: Number(it.prompt_tokens || 0),
            completion_tokens: Number(it.completion_tokens || 0),
            use_time: Number(it.use_time || 0),
            quota: rawQuota,
            cost_usd: costUsd,
            cost_formatted: costFormatted,
            token_name: it.token_name || "API",
            status: isError ? "error" : "success",
            other: it.other,
            raw: it
          };
        });
      }
    }
  } catch (err) {
    console.warn("[dsh-a6api] fetchRecentLogs error:", err);
  }
  return [];
}
async function fetchChannelDetails(channelId, userId, sessionCookie, targetModelName, logSnapshot) {
  if (!channelId) return null;
  const targetName = targetModelName || "";
  const meta = resolveModelMeta(targetName);
  try {
    const res = await fetch(
      `https://a6api.com/api/marketplace/channels/search?channel_id=${channelId}&view=list&page=1&page_size=20`,
      {
        headers: buildWebHeaders(userId, sessionCookie),
        signal: AbortSignal.timeout(8e3)
      }
    );
    if (res.ok) {
      const json = await res.json();
      const items = json?.data?.items || [];
      if (items.length > 0) {
        const item = (targetName ? items.find((it) => it.model_name?.toLowerCase() === targetName.toLowerCase()) : null) || items[0];
        const rate = Number(item.realtime_ratio_exchange_rate || 6.7209);
        const inMicros = Number(item.input_price_micros || 0);
        const outMicros = Number(item.output_price_micros || 0);
        const cacheReadMicros = Number(item.cache_read_price_micros || 0);
        const cacheWriteMicros = Number(item.cache_write_price_micros || 0);
        const labels = [];
        if (item.authenticity_guaranteed) {
          const badge = item.authenticity_guarantee_badge_key;
          if (badge === "gold") labels.push("\u4FDD\u771F \xB7 \u91D1\u6807");
          else if (badge === "silver") labels.push("\u4FDD\u771F \xB7 \u94F6\u6807");
          else if (badge === "bronze") labels.push("\u4FDD\u771F \xB7 \u94DC\u6807");
          else labels.push("\u4FDD\u771F");
        }
        if (Array.isArray(item.smart_routing_labels)) {
          for (const l of item.smart_routing_labels) {
            if (l === "stable" && !labels.includes("\u7A33\u5B9A")) labels.push("\u7A33\u5B9A");
            if (l === "cheap" && !labels.includes("\u4F4E\u4EF7")) labels.push("\u4F4E\u4EF7");
            if (l === "fast" && !labels.includes("\u9AD8\u901F")) labels.push("\u9AD8\u901F");
            if (l === "quality" && !labels.includes("\u9AD8\u8D28")) labels.push("\u9AD8\u8D28");
          }
        }
        if (labels.length === 0) {
          labels.push("\u7A33\u5B9A", "\u4F4E\u4EF7", "\u9AD8\u901F", "\u9AD8\u8D28");
        }
        let official_price;
        if (item.official_price && item.official_price.input_price_micros !== void 0) {
          const offIn = Number(item.official_price.input_price_micros || 0);
          const offOut = Number(item.official_price.output_price_micros || 0);
          const offCR = Number(item.official_price.cache_read_price_micros || 0);
          const offCW = Number(item.official_price.cache_write_price_micros || 0);
          official_price = {
            input_price_micros: offIn,
            output_price_micros: offOut,
            cache_read_price_micros: offCR,
            cache_write_price_micros: offCW,
            input_cny: formatCnyPrice(offIn, rate),
            output_cny: formatCnyPrice(offOut, rate),
            cache_read_cny: formatCnyPrice(offCR, rate),
            cache_write_cny: formatCnyPrice(offCW, rate)
          };
        } else if (meta.officialPriceMicros) {
          const offIn = meta.officialPriceMicros.input;
          const offOut = meta.officialPriceMicros.output;
          const offCR = meta.officialPriceMicros.cacheRead;
          const offCW = meta.officialPriceMicros.cacheWrite;
          official_price = {
            input_price_micros: offIn,
            output_price_micros: offOut,
            cache_read_price_micros: offCR,
            cache_write_price_micros: offCW,
            input_cny: formatCnyPrice(offIn, rate),
            output_cny: formatCnyPrice(offOut, rate),
            cache_read_cny: formatCnyPrice(offCR, rate),
            cache_write_cny: formatCnyPrice(offCW, rate)
          };
        }
        const successRate24h = item.success_rate_24h !== void 0 ? Number(item.success_rate_24h) / 100 : 99.3;
        const recentSuccessRate = item.recent_success_rate !== void 0 ? Number(item.recent_success_rate) / 100 : 100;
        const cacheHitRate = item.cache_hit_rate_24h !== void 0 ? Number(item.cache_hit_rate_24h) / 100 : 72;
        const lastSuccessAt = Number(item.last_success_at || item.last_test_time || 0);
        const ratioCny = Number(item.realtime_ratio_cny || inMicros / 1e6 * rate || 0.0341);
        const ratioFormatted = ratioCny.toFixed(4);
        return {
          listing_id: item.listing_id,
          channel_id: item.channel_id,
          channel_name: item.channel_name || `\u5546\u6237 #${channelId}`,
          supplier_name: item.supplier_name || item.supplier_nickname || "GPT\u4F4E\u4EF7",
          supplier_id: item.supplier_id || 290,
          model_name: item.model_name || targetName,
          brand: item.brand || meta.brand || "OpenAI",
          description: item.description || "\u9AD8\u5E76\u53D1 \u4E3B\u6253\u4FBF\u5B9C \u7A33\u5B9A",
          charge_type: item.charge_type || "per_token",
          charge_type_text: item.charge_type === "per_token" ? "\u6309\u91CF" : "\u6309\u91CF",
          sample_count: Number(item.sample_count || 100),
          sample_count_text: `\u8FD1 ${item.sample_count || 100} \u6B21\u6837\u672C`,
          input_price_micros: inMicros,
          output_price_micros: outMicros,
          cache_read_price_micros: cacheReadMicros,
          cache_write_price_micros: cacheWriteMicros,
          input_price_cny: formatCnyPrice(inMicros, rate),
          output_price_cny: formatCnyPrice(outMicros, rate),
          cache_read_price_cny: formatCnyPrice(cacheReadMicros, rate),
          cache_write_price_cny: formatCnyPrice(cacheWriteMicros, rate),
          official_price,
          realtime_ratio_cny: ratioCny,
          realtime_ratio_formatted: ratioFormatted,
          recent_success_rate_pct: recentSuccessRate,
          success_rate_24h_pct: successRate24h,
          success_rate_7d_pct: item.success_rate_7d !== void 0 ? Number(item.success_rate_7d) / 100 : void 0,
          success_buckets: Array.isArray(item.success_buckets) ? item.success_buckets : void 0,
          b24: Array.isArray(item.b24) ? item.b24 : void 0,
          b7d: Array.isArray(item.b7d) ? item.b7d : void 0,
          sr_24h_state: item.sr_24h_state || "rate",
          sr_7d_state: item.sr_7d_state || "no_data",
          p50_ttft_ms: Number(item.p50_ttft_ms || 2273),
          recent_p50_ms: Number(item.recent_p50_ms || item.last_test_response_ms || 2340),
          cache_hit_rate_pct: cacheHitRate,
          labels,
          last_success_at: lastSuccessAt,
          last_success_text: formatRelativeTime(lastSuccessAt),
          authenticity_guaranteed: Boolean(item.authenticity_guaranteed),
          authenticity_badge: item.authenticity_guarantee_badge_key,
          is_pinned: Boolean(item.pin_status === "pinned" || item.is_pinned),
          user_channel_disabled: Boolean(item.user_channel_disabled),
          supplier_channel_disabled: Boolean(item.supplier_channel_disabled),
          raw: item
        };
      }
    }
  } catch (err) {
    console.warn("[dsh-a6api] fetchChannelDetails error:", err);
  }
  if (logSnapshot) {
    const rate = 6.7209;
    const inMicros = Number(logSnapshot.marketplace_price_input_micros || 20300);
    const outMicros = Number(logSnapshot.marketplace_price_output_micros || 101502);
    const cacheReadMicros = Number(logSnapshot.marketplace_price_cache_read_micros || 2030);
    const cacheWriteMicros = Number(logSnapshot.marketplace_price_cache_write_micros || 25375);
    let official_price;
    if (meta.officialPriceMicros) {
      const offIn = meta.officialPriceMicros.input;
      const offOut = meta.officialPriceMicros.output;
      const offCR = meta.officialPriceMicros.cacheRead;
      const offCW = meta.officialPriceMicros.cacheWrite;
      official_price = {
        input_price_micros: offIn,
        output_price_micros: offOut,
        cache_read_price_micros: offCR,
        cache_write_price_micros: offCW,
        input_cny: formatCnyPrice(offIn, rate),
        output_cny: formatCnyPrice(offOut, rate),
        cache_read_cny: formatCnyPrice(offCR, rate),
        cache_write_cny: formatCnyPrice(offCW, rate)
      };
    }
    const ratioCny = Number(inMicros / 1e6 * rate || 0.0341);
    return {
      listing_id: logSnapshot.marketplace_listing_id,
      channel_id: channelId,
      channel_name: logSnapshot.channel_name || `\u5546\u6237 #${channelId}`,
      supplier_name: logSnapshot.supplier_nickname || logSnapshot.channel_name || "GPT\u4F4E\u4EF7",
      supplier_id: 290,
      model_name: targetName || logSnapshot.model_name || "",
      brand: meta.brand || "OpenAI",
      description: "\u9AD8\u5E76\u53D1 \u4E3B\u6253\u4FBF\u5B9C \u7A33\u5B9A",
      charge_type: "per_token",
      charge_type_text: "\u6309\u91CF",
      sample_count: 100,
      sample_count_text: "\u8FD1 100 \u6B21\u6837\u672C",
      input_price_micros: inMicros,
      output_price_micros: outMicros,
      cache_read_price_micros: cacheReadMicros,
      cache_write_price_micros: cacheWriteMicros,
      input_price_cny: formatCnyPrice(inMicros, rate),
      output_price_cny: formatCnyPrice(outMicros, rate),
      cache_read_price_cny: formatCnyPrice(cacheReadMicros, rate),
      cache_write_price_cny: formatCnyPrice(cacheWriteMicros, rate),
      official_price,
      realtime_ratio_cny: ratioCny,
      realtime_ratio_formatted: ratioCny.toFixed(4),
      recent_success_rate_pct: 100,
      success_rate_24h_pct: 99.3,
      recent_p50_ms: Number(logSnapshot.use_time ? logSnapshot.use_time * 1e3 : 2340),
      p50_ttft_ms: 2273,
      cache_hit_rate_pct: 72,
      labels: ["\u7A33\u5B9A", "\u4F4E\u4EF7", "\u9AD8\u901F", "\u9AD8\u8D28"],
      last_success_at: Math.floor(Date.now() / 1e3),
      last_success_text: "\u521A\u521A",
      authenticity_guaranteed: false,
      is_pinned: false,
      user_channel_disabled: false
    };
  }
  return null;
}
async function fetchPriceFluctuation(userId, sessionCookie, accessToken) {
  const token = (accessToken || sessionCookie || "").trim();
  const uid = (userId || "").trim();
  if (!uid && !token) {
    return { pendingCount: 0, unseenCount: 0, totalCount: 0, authError: false };
  }
  const headers = buildWebHeaders(uid || void 0, token || void 0);
  const url = "https://a6api.com/api/marketplace/price-notices";
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8e3) });
    if (res.status === 401 || res.status === 403) {
      console.warn("[dsh-a6api] fetchPriceFluctuation auth failed", res.status);
      return { pendingCount: 0, unseenCount: 0, totalCount: 0, authError: true };
    }
    if (!res.ok) {
      console.warn("[dsh-a6api] fetchPriceFluctuation HTTP", res.status);
      return { pendingCount: 0, unseenCount: 0, totalCount: 0 };
    }
    const json = await res.json().catch(() => null);
    if (!json) return { pendingCount: 0, unseenCount: 0, totalCount: 0 };
    if (json.success === false) return { pendingCount: 0, unseenCount: 0, totalCount: 0 };
    let arr = [];
    if (Array.isArray(json)) arr = json;
    else if (Array.isArray(json.data)) arr = json.data;
    else if (Array.isArray(json.data?.notices)) arr = json.data.notices;
    else if (Array.isArray(json.data?.items)) arr = json.data.items;
    else if (Array.isArray(json.notices)) arr = json.notices;
    else if (Array.isArray(json.items)) arr = json.items;
    const pickWithPresent = (keys) => {
      for (const k of keys) {
        const v = json?.data?.[k] ?? json?.[k];
        if (v !== void 0 && v !== null) {
          const n = Number(v);
          if (!Number.isNaN(n)) return { value: n, present: true };
        }
      }
      return { value: 0, present: false };
    };
    const pendingPick = pickWithPresent(["pendingCount", "pending_count", "pending", "openCount"]);
    const unseenPick = pickWithPresent(["unseenCount", "unseen_count", "unseen", "has_unseen_count"]);
    let pending = pendingPick.value;
    let unseen = unseenPick.value;
    const total = arr.length;
    if (!pendingPick.present && arr.length > 0) {
      const counted = arr.filter((n) => {
        const s = String(n.state || n.status || "").toLowerCase();
        return s === "open" || s === "pending" || n.pending === true;
      }).length;
      const hasState = arr.some((n) => n.state !== void 0 || n.status !== void 0);
      if (hasState) pending = counted;
    }
    if (!unseenPick.present && arr.length > 0) {
      unseen = arr.filter((n) => n.has_unseen === true || n.hasUnseen === true || n.unseen === true || n.is_unread === true).length;
    }
    return { pendingCount: pending, unseenCount: unseen, totalCount: total, notices: arr };
  } catch (err) {
    console.warn("[dsh-a6api] fetchPriceFluctuation error", err);
    return { pendingCount: 0, unseenCount: 0, totalCount: 0 };
  }
}

// src/server/probe.ts
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function probeSingleModel(baseURL, apiKey, userId, accessToken, modelName) {
  const targetModel = modelName || "";
  const cleanUrl = cleanBaseUrl(baseURL);
  if (!apiKey) {
    return { modelName: targetModel, success: false, error: "\u672A\u914D\u7F6E API Key" };
  }
  const startTime = Date.now();
  let requestOk = false;
  let requestError = "";
  try {
    const res = await fetch(`${cleanUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: "1" }],
        max_tokens: 1
      }),
      // 推理模型(如 grok-4.6)实测单次响应可达 40-90s+,阈值过短会被频繁掐断导致探测失败
      signal: AbortSignal.timeout(18e4)
    });
    if (res.ok) {
      requestOk = true;
    } else {
      const errText = await res.text();
      requestError = `HTTP ${res.status}: ${errText.slice(0, 150)}`;
    }
  } catch (err) {
    const raw = err?.message || String(err);
    if (raw.includes("aborted due to timeout") || err?.name === "TimeoutError") {
      requestError = "\u63A2\u6D4B\u8D85\u65F6(\u9608\u503C180\u79D2) \u2014 \u63A8\u7406\u6A21\u578B\u54CD\u5E94\u8F83\u6162,\u5DF2\u4FDD\u7559\u4E0A\u6B21\u5546\u6237\u6570\u636E,\u8BF7\u7A0D\u540E\u91CD\u8BD5";
    } else {
      requestError = raw;
    }
  }
  const durationMs = Date.now() - startTime;
  if (requestOk && (userId || accessToken)) {
    await sleep(1200);
    try {
      const logs = await fetchRecentLogs(userId, accessToken, 15);
      const minTimestamp = Math.floor(startTime / 1e3) - 10;
      const log = logs.find(
        (it) => it.model_name?.toLowerCase() === targetModel.toLowerCase() && Number(it.created_at || 0) >= minTimestamp
      ) || logs.find((it) => it.model_name?.toLowerCase() === targetModel.toLowerCase());
      if (log && log.channel) {
        const channelId = Number(log.channel);
        let logSnapshot = null;
        if (log.other) {
          try {
            logSnapshot = { ...JSON.parse(log.other), channel_name: log.channel_name, model_name: log.model_name };
          } catch {
          }
        }
        const merchant = await fetchChannelDetails(channelId, userId, accessToken, targetModel, logSnapshot);
        return {
          modelName: targetModel,
          success: true,
          channelId,
          channelName: log.channel_name,
          merchant,
          durationMs
        };
      }
    } catch (err) {
      console.warn(`[dsh-a6api] Log lookup error for ${targetModel}:`, err);
    }
  }
  return {
    modelName: targetModel,
    success: requestOk,
    durationMs,
    error: requestOk ? void 0 : requestError
  };
}
async function getKnownMerchantsFromLogs(userId, accessToken, modelNames = [], logs) {
  if (!userId && !accessToken || modelNames.length === 0) return {};
  const result = {};
  try {
    const items = logs !== void 0 ? logs : await fetchRecentLogs(userId, accessToken, 50);
    const sorted = items.slice().sort((a, b) => (Number(b.created_at) || 0) - (Number(a.created_at) || 0));
    const modelToLog = /* @__PURE__ */ new Map();
    for (const log of sorted) {
      const mName = log.model_name;
      const chId = Number(log.channel);
      if (mName && chId && !modelToLog.has(mName.toLowerCase())) {
        modelToLog.set(mName.toLowerCase(), log);
      }
    }
    const matchedEntries = [];
    for (const name2 of modelNames) {
      const log = modelToLog.get(name2.toLowerCase());
      if (log) {
        matchedEntries.push({ modelName: name2, log });
      }
    }
    for (let i = 0; i < matchedEntries.length; i += 4) {
      const batch = matchedEntries.slice(i, i + 4);
      await Promise.all(
        batch.map(async ({ modelName, log }) => {
          try {
            const channelId = Number(log.channel);
            let logSnapshot = null;
            if (log.other) {
              try {
                logSnapshot = { ...JSON.parse(log.other), channel_name: log.channel_name, model_name: log.model_name };
              } catch {
              }
            }
            const card = await fetchChannelDetails(channelId, userId, accessToken, modelName, logSnapshot);
            if (card) {
              result[modelName] = card;
            }
          } catch {
          }
        })
      );
    }
  } catch (err) {
    console.warn("[dsh-a6api] getKnownMerchantsFromLogs error:", err);
  }
  return result;
}

// src/server/sync.ts
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
var A6API_CRED_REF = "A6API_API_KEY";
async function atomicWriteFile(filePath, content, mode = 384) {
  const dir = path.dirname(filePath);
  await fsp.mkdir(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  await fsp.writeFile(tmpPath, content, { mode });
  await fsp.rename(tmpPath, filePath);
}
function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
}
function configFile() {
  return path.join(dshHome(), "dsh-a6api-config.json");
}
function credentialsFile() {
  return path.join(dshHome(), ".credentials.yaml");
}
function settingsFile() {
  return path.join(dshHome(), "settings.yaml");
}
async function readPluginConfig() {
  const filePath = configFile();
  let raw = "";
  try {
    raw = await fsp.readFile(filePath, "utf8");
  } catch {
    const apiKey = await readCredentialKey(A6API_CRED_REF) || "";
    return {
      baseURL: "https://api.a6api.com",
      apiKey,
      userId: "",
      activeModels: []
    };
  }
  try {
    const parsed = JSON.parse(raw);
    const apiKey = parsed.apiKey || await readCredentialKey(A6API_CRED_REF) || "";
    const accessToken = parsed.accessToken || parsed.systemAccessToken || parsed.sessionCookie || "";
    return {
      baseURL: parsed.baseURL || "https://api.a6api.com",
      apiKey,
      accessToken,
      userId: parsed.userId || "",
      sessionCookie: accessToken,
      activeModels: Array.isArray(parsed.activeModels) ? parsed.activeModels : [],
      customBaseURL: parsed.customBaseURL
    };
  } catch {
    return {
      baseURL: "https://api.a6api.com",
      apiKey: "",
      accessToken: "",
      userId: "",
      activeModels: []
    };
  }
}
async function savePluginConfig(config) {
  const filePath = configFile();
  const { apiKey: _apiKey, ...safeConfig } = config;
  await atomicWriteFile(filePath, JSON.stringify(safeConfig, null, 2));
  if (config.apiKey && config.apiKey.trim()) {
    await writeCredentialKey(A6API_CRED_REF, config.apiKey.trim());
  }
}
async function readCredentialKey(refKey) {
  try {
    const yaml = await fsp.readFile(credentialsFile(), "utf8");
    let inRefs = false;
    for (const line of yaml.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      if (indent === 0) {
        inRefs = trimmed.startsWith("refs:");
        continue;
      }
      if (!inRefs) continue;
      const m = /^([A-Za-z0-9_.\-]+):\s*(.*)$/.exec(trimmed);
      if (m && m[1] === refKey) {
        let val = m[2].trim();
        if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        return val;
      }
    }
  } catch {
  }
  return null;
}
async function writeCredentialKey(refKey, value) {
  const cFile = credentialsFile();
  let yaml = "";
  try {
    yaml = await fsp.readFile(cFile, "utf8");
  } catch {
    yaml = "version: 1\nrefs:\n";
  }
  const lines = yaml.split(/\r?\n/);
  let inRefs = false;
  let refsLineIdx = -1;
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent === 0) {
      if (trimmed.startsWith("refs:")) {
        inRefs = true;
        refsLineIdx = i;
      } else {
        inRefs = false;
      }
      continue;
    }
    if (inRefs) {
      const m = /^([A-Za-z0-9_.\-]+):/.exec(trimmed);
      if (m && m[1] === refKey) {
        lines[i] = `  ${refKey}: ${JSON.stringify(value)}`;
        found = true;
        break;
      }
    }
  }
  if (!found) {
    if (refsLineIdx >= 0) {
      lines.splice(refsLineIdx + 1, 0, `  ${refKey}: ${JSON.stringify(value)}`);
    } else {
      lines.push("refs:", `  ${refKey}: ${JSON.stringify(value)}`);
    }
  }
  await atomicWriteFile(cFile, lines.join("\n"), 384);
}
async function syncToDshSettings(baseURL, modelIds) {
  const sFile = settingsFile();
  let yaml = "";
  try {
    yaml = await fsp.readFile(sFile, "utf8");
  } catch {
    yaml = "llm-pi-ai:\n  providers:\n";
  }
  const modelEntries = modelIds.map((id) => {
    const meta = resolveModelMeta(id);
    const lines2 = [
      `        - id: ${meta.id}`,
      `          name: ${meta.name}`,
      `          contextWindow: ${meta.contextWindow}`,
      `          maxTokens: ${meta.maxTokens}`,
      `          input:`,
      ...meta.modalities.map((m) => `            - ${m}`)
    ];
    if (meta.reasoningEfforts) {
      lines2.push(`          reasoningEfforts:`);
      for (const [k, v] of Object.entries(meta.reasoningEfforts)) {
        if (v) lines2.push(`            ${k}: ${v}`);
      }
    }
    return lines2.join("\n");
  });
  const dshBaseUrl = baseURL.endsWith("/v1") ? baseURL : `${baseURL.replace(/\/+$/, "")}/v1`;
  const a6apiBlockLines = [
    `    a6api:`,
    `      displayName: A6API`,
    `      apiKeyEnv: ${A6API_CRED_REF}`,
    `      api: openai-completions`,
    `      baseURL: ${dshBaseUrl}`,
    `      models:`,
    ...modelEntries.length > 0 ? modelEntries : [`        []`]
  ];
  const lines = yaml.split(/\r?\n/);
  let inLlm = false;
  let inProviders = false;
  let inA6 = false;
  let a6Start = -1;
  let a6End = -1;
  let providersLineIdx = -1;
  let llmLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent === 0) {
      inLlm = trimmed.startsWith("llm-pi-ai:");
      if (inLlm) llmLineIdx = i;
      inProviders = false;
      inA6 = false;
      continue;
    }
    if (inLlm && indent === 2 && trimmed.startsWith("providers:")) {
      inProviders = true;
      providersLineIdx = i;
      inA6 = false;
      continue;
    }
    if (inProviders && indent === 4) {
      if (trimmed.startsWith("a6api:")) {
        inA6 = true;
        a6Start = i;
        a6End = i + 1;
      } else {
        if (inA6) {
          a6End = i;
          inA6 = false;
        }
      }
      continue;
    }
    if (inA6 && indent > 4) {
      a6End = i + 1;
    } else if (inA6 && indent <= 4) {
      a6End = i;
      inA6 = false;
    }
  }
  if (a6Start >= 0) {
    lines.splice(a6Start, a6End - a6Start, ...a6apiBlockLines);
  } else if (providersLineIdx >= 0) {
    lines.splice(providersLineIdx + 1, 0, ...a6apiBlockLines);
  } else if (llmLineIdx >= 0) {
    lines.splice(llmLineIdx + 1, 0, `  providers:`, ...a6apiBlockLines);
  } else {
    lines.push(`llm-pi-ai:`, `  providers:`, ...a6apiBlockLines);
  }
  await atomicWriteFile(sFile, lines.join("\n"), 420);
}
async function getDshConfiguredModels() {
  try {
    const yaml = await fsp.readFile(settingsFile(), "utf8");
    const lines = yaml.split(/\r?\n/);
    let inA6 = false;
    let inModels = false;
    const modelIds = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      if (indent === 4 && trimmed.startsWith("a6api:")) {
        inA6 = true;
        inModels = false;
        continue;
      }
      if (inA6 && indent <= 4 && !trimmed.startsWith("a6api:")) {
        inA6 = false;
        inModels = false;
      }
      if (inA6 && indent === 6 && trimmed.startsWith("models:")) {
        inModels = true;
        continue;
      }
      if (inModels && indent === 8 && trimmed.startsWith("- id:")) {
        const id = trimmed.replace(/^- id:\s*/, "").trim();
        if (id) modelIds.push(id);
      }
    }
    return modelIds;
  } catch {
    return [];
  }
}

// src/index.ts
var name = "@lynn123411/dsh-a6api";
var inject = ["webServer"];
var PREFIX = "/api/dsh-a6api";
var MASK = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
function maskConfig(c) {
  return {
    ...c,
    apiKey: c.apiKey ? MASK : "",
    accessToken: c.accessToken || c.sessionCookie ? MASK : "",
    sessionCookie: "",
    userId: c.userId ? MASK : "",
    hasApiKey: Boolean(c.apiKey),
    hasToken: Boolean(c.accessToken || c.sessionCookie)
  };
}
function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-cache"
    // 不设 access-control-allow-origin：仅允许同源调用，阻断跨站读取与 CSRF 预检
  });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => resolve(data.trim()));
    req.on("error", reject);
  });
}
async function parseJsonBody(req) {
  const text = await readBody(req);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON body");
  }
}
var merchantCardCache = /* @__PURE__ */ new Map();
var MERCHANT_CARD_TTL_MS = 15 * 60 * 1e3;
function apply(ctx) {
  const webServer = ctx.webServer || (ctx.get ? ctx.get("webServer") : null);
  if (webServer && typeof webServer.register === "function") {
    ctx.effect(() => {
      const unregister = webServer.register({
        kind: "prefix",
        path: PREFIX,
        handler: async (req, res) => {
          const url = new URL(req.url || "/", "http://localhost");
          const pathname = url.pathname.replace(PREFIX, "") || "/";
          if (req.method === "OPTIONS") {
            res.writeHead(204);
            return res.end();
          }
          try {
            if (pathname === "/state" && (req.method === "GET" || req.method === "HEAD")) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || "";
              const balance = await fetchBalance(config.baseURL, config.apiKey, config.userId, token);
              if (balance?.userId && String(balance.userId) !== config.userId) {
                config.userId = String(balance.userId);
                await savePluginConfig(config);
              }
              const dshConfiguredModels = await getDshConfiguredModels();
              let modelIds = [];
              if (config.apiKey) {
                modelIds = await fetchTokenModels(config.baseURL, config.apiKey);
              }
              if (modelIds.length === 0) {
                modelIds = [
                  .../* @__PURE__ */ new Set([
                    ...config.activeModels,
                    ...dshConfiguredModels,
                    "gpt-5.6-sol",
                    "gpt-5.6-terra",
                    "gpt-5.6-luna",
                    "claude-fable-5",
                    "claude-opus-5",
                    "grok-4.6"
                  ])
                ];
              }
              const allLogs = await fetchRecentLogs(config.userId, token, 100);
              allLogs.sort((a, b) => (Number(b.created_at) || 0) - (Number(a.created_at) || 0));
              if (config.userId || token) {
                const missing = modelIds.filter((m) => {
                  const entry = merchantCardCache.get(m.toLowerCase());
                  return !entry || Date.now() - entry.at >= MERCHANT_CARD_TTL_MS;
                });
                if (missing.length > 0) {
                  let found = {};
                  try {
                    found = await Promise.race([
                      getKnownMerchantsFromLogs(config.userId, token, missing, allLogs),
                      new Promise((resolve) => setTimeout(() => resolve({}), 1e4))
                    ]);
                  } catch {
                    found = {};
                  }
                  for (const [mName, card] of Object.entries(found)) {
                    merchantCardCache.set(mName.toLowerCase(), { card, at: Date.now() });
                  }
                }
              }
              const lastRoutedMap = /* @__PURE__ */ new Map();
              for (const log of allLogs) {
                const mName = log.model_name;
                const chId = Number(log.channel);
                const ts = Number(log.created_at) || 0;
                if (mName && chId > 0 && ts > 0 && !lastRoutedMap.has(mName.toLowerCase())) {
                  lastRoutedMap.set(mName.toLowerCase(), ts);
                }
              }
              const dshSet = new Set(dshConfiguredModels);
              const models = modelIds.map((mId) => {
                const meta = resolveModelMeta(mId);
                const cacheEntry = merchantCardCache.get(mId.toLowerCase());
                const cachedCard = cacheEntry && Date.now() - cacheEntry.at < MERCHANT_CARD_TTL_MS ? cacheEntry.card : void 0;
                const routedAt = lastRoutedMap.get(mId.toLowerCase());
                return {
                  model_name: mId,
                  brand: meta.brand,
                  contextWindow: meta.contextWindow,
                  maxTokens: meta.maxTokens,
                  modalities: meta.modalities,
                  hasReasoning: Boolean(meta.reasoningEfforts || meta.thinkingFormat),
                  inDsh: dshSet.has(mId),
                  merchant: cachedCard,
                  probeStatus: cachedCard ? "success" : "idle",
                  lastRoutedAt: routedAt,
                  lastRoutedText: routedAt ? formatRelativeTime(routedAt) : void 0
                };
              });
              const recentLogs = allLogs.slice(0, 20);
              const response = {
                config: maskConfig(config),
                balance,
                models,
                dshConfiguredModels,
                recentLogs
              };
              return sendJson(res, 200, { ok: true, data: response });
            }
            if (pathname === "/config" && req.method === "POST") {
              const body = await parseJsonBody(req);
              const current = await readPluginConfig();
              const rawToken = body.accessToken !== void 0 && body.accessToken !== MASK ? body.accessToken : body.sessionCookie !== void 0 && body.sessionCookie !== MASK ? body.sessionCookie : current.accessToken || current.sessionCookie || "";
              const newApiKey = body.apiKey !== void 0 && body.apiKey !== MASK ? body.apiKey : current.apiKey;
              const updated = {
                baseURL: body.baseURL !== void 0 ? body.baseURL : current.baseURL,
                apiKey: newApiKey,
                accessToken: rawToken,
                sessionCookie: rawToken,
                userId: body.userId !== void 0 ? body.userId : current.userId,
                activeModels: Array.isArray(body.activeModels) ? body.activeModels : current.activeModels,
                customBaseURL: body.customBaseURL !== void 0 ? body.customBaseURL : current.customBaseURL
              };
              const balance = await fetchBalance(updated.baseURL, updated.apiKey, updated.userId, updated.accessToken);
              if (balance?.userId) {
                updated.userId = String(balance.userId);
              }
              await savePluginConfig(updated);
              if (updated.activeModels.length > 0) {
                await syncToDshSettings(updated.baseURL, updated.activeModels);
              }
              return sendJson(res, 200, { ok: true, config: maskConfig(updated), balance });
            }
            if (pathname === "/balance" && (req.method === "GET" || req.method === "HEAD")) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || "";
              const balance = await fetchBalance(config.baseURL, config.apiKey, config.userId, token);
              const recentLogs = await fetchRecentLogs(config.userId, token, 20);
              return sendJson(res, 200, { ok: true, balance, recentLogs });
            }
            if (pathname === "/logs" && (req.method === "GET" || req.method === "HEAD")) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || "";
              const recentLogs = await fetchRecentLogs(config.userId, token, 30);
              return sendJson(res, 200, { ok: true, logs: recentLogs });
            }
            if (pathname === "/probe" && req.method === "POST") {
              const body = await parseJsonBody(req);
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || "";
              const modelName = body.modelName;
              if (modelName && modelName !== "all") {
                const result = await probeSingleModel(config.baseURL, config.apiKey, config.userId, token, modelName);
                if (result.merchant) {
                  merchantCardCache.set(modelName.toLowerCase(), { card: result.merchant, at: Date.now() });
                }
                return sendJson(res, 200, { ok: true, result });
              }
              let modelIds = body.modelNames;
              if (!Array.isArray(modelIds) || modelIds.length === 0) {
                modelIds = await fetchTokenModels(config.baseURL, config.apiKey);
              }
              if (modelIds.length === 0) {
                modelIds = config.activeModels;
              }
              const results = [];
              for (const m of modelIds) {
                const r = await probeSingleModel(config.baseURL, config.apiKey, config.userId, token, m);
                if (r.merchant) {
                  merchantCardCache.set(m.toLowerCase(), { card: r.merchant, at: Date.now() });
                }
                results.push(r);
              }
              return sendJson(res, 200, { ok: true, results });
            }
            if (pathname === "/sync-models" && req.method === "POST") {
              const body = await parseJsonBody(req);
              const config = await readPluginConfig();
              const modelIds = Array.isArray(body.modelIds) ? body.modelIds : [];
              const baseURL = body.baseURL || config.baseURL;
              config.activeModels = modelIds;
              config.baseURL = baseURL;
              await savePluginConfig(config);
              await syncToDshSettings(baseURL, modelIds);
              const dshConfiguredModels = await getDshConfiguredModels();
              return sendJson(res, 200, { ok: true, dshConfiguredModels });
            }
            if (pathname === "/price-fluctuation" && (req.method === "GET" || req.method === "HEAD")) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || "";
              if (!token || !config.userId) {
                return sendJson(res, 200, { ok: true, data: { pendingCount: 0, unseenCount: 0, totalCount: 0, hasAuth: false, authError: false, updatedAt: Date.now() } });
              }
              const result = await fetchPriceFluctuation(config.userId, token, token);
              const { notices, ...counts } = result;
              const hasAuth = !counts.authError;
              return sendJson(res, 200, { ok: true, data: { pendingCount: counts.pendingCount, unseenCount: counts.unseenCount, totalCount: counts.totalCount, hasAuth, authError: Boolean(counts.authError), updatedAt: Date.now() } });
            }
            return sendJson(res, 404, { ok: false, error: "Not found" });
          } catch (err) {
            console.error("[dsh-a6api] API error:", err);
            return sendJson(res, 500, { ok: false, error: err?.message || String(err) });
          }
        }
      });
      return () => {
        if (typeof unregister === "function") unregister();
      };
    }, "dsh-a6api: web API router");
  }
}
export {
  A6API_CATALOG,
  apply,
  fetchBalance,
  fetchChannelDetails,
  fetchRecentLogs,
  fetchTokenModels,
  getKnownMerchantsFromLogs,
  inject,
  name,
  probeSingleModel,
  readPluginConfig,
  resolveModelMeta,
  savePluginConfig,
  syncToDshSettings
};
//# sourceMappingURL=index.js.map
