import type { A6ApiModelMeta } from '../types.js';

export const A6API_CATALOG: Record<string, A6ApiModelMeta> = {
  // --- OpenAI Series ---
  'gpt-5.6-sol': {
    id: 'gpt-5.6-sol',
    name: 'GPT-5.6 Sol',
    brand: 'OpenAI',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 4000000, output: 20000000, cacheRead: 400000, cacheWrite: 5000000 },
  },
  'gpt-5.6-terra': {
    id: 'gpt-5.6-terra',
    name: 'GPT-5.6 Terra',
    brand: 'OpenAI',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 4000000, output: 20000000, cacheRead: 400000, cacheWrite: 5000000 },
  },
  'gpt-5.6-luna': {
    id: 'gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    brand: 'OpenAI',
    contextWindow: 524288,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 2000000, output: 10000000, cacheRead: 200000, cacheWrite: 2500000 },
  },
  'gpt-5.6': {
    id: 'gpt-5.6',
    name: 'GPT-5.6',
    brand: 'OpenAI',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 4000000, output: 20000000, cacheRead: 400000, cacheWrite: 5000000 },
  },
  'gpt-5.5': {
    id: 'gpt-5.5',
    name: 'GPT-5.5',
    brand: 'OpenAI',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 3000000, output: 15000000, cacheRead: 300000, cacheWrite: 3750000 },
  },
  'gpt-5.4': {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    brand: 'OpenAI',
    contextWindow: 524288,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 2500000, output: 10000000, cacheRead: 250000, cacheWrite: 3000000 },
  },
  'gpt-5.4-mini': {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    brand: 'OpenAI',
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 150000, output: 600000, cacheRead: 75000, cacheWrite: 150000 },
  },
  'gpt-5.3-codex': {
    id: 'gpt-5.3-codex',
    name: 'GPT-5.3 Codex',
    brand: 'OpenAI',
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ['text'],
    officialPriceMicros: { input: 2000000, output: 8000000, cacheRead: 200000, cacheWrite: 2000000 },
  },
  'gpt-5.3-codex-spark': {
    id: 'gpt-5.3-codex-spark',
    name: 'GPT-5.3 Codex Spark',
    brand: 'OpenAI',
    contextWindow: 262144,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 1000000, output: 4000000, cacheRead: 100000, cacheWrite: 1000000 },
  },
  'gpt-5.2': {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    brand: 'OpenAI',
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 2000000, output: 8000000, cacheRead: 200000, cacheWrite: 2000000 },
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    brand: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 2500000, output: 10000000, cacheRead: 1250000, cacheWrite: 2500000 },
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    brand: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 150000, output: 600000, cacheRead: 75000, cacheWrite: 150000 },
  },

  // --- Anthropic Claude Series ---
  'claude-opus-5': {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    thinkingFormat: 'anthropic',
    officialPriceMicros: { input: 15000000, output: 75000000, cacheRead: 1500000, cacheWrite: 18750000 },
  },
  'claude-sonnet-5': {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    thinkingFormat: 'anthropic',
    officialPriceMicros: { input: 3000000, output: 15000000, cacheRead: 300000, cacheWrite: 3750000 },
  },
  'claude-fable-5': {
    id: 'claude-fable-5',
    name: 'Claude Fable 5',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 3000000, output: 15000000, cacheRead: 300000, cacheWrite: 3750000 },
  },
  'claude-opus-4-8': {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 15000000, output: 75000000, cacheRead: 1500000, cacheWrite: 18750000 },
  },
  'claude-opus-4-7': {
    id: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 15000000, output: 75000000, cacheRead: 1500000, cacheWrite: 18750000 },
  },
  'claude-opus-4-6': {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 15000000, output: 75000000, cacheRead: 1500000, cacheWrite: 18750000 },
  },
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 3000000, output: 15000000, cacheRead: 300000, cacheWrite: 3750000 },
  },
  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    brand: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 8192,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 250000, output: 1250000, cacheRead: 25000, cacheWrite: 312500 },
  },

  // --- DeepSeek Series ---
  'deepseek-v4-pro': {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    brand: 'DeepSeek',
    contextWindow: 131072,
    maxTokens: 32768,
    modalities: ['text'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 550000, output: 2190000, cacheRead: 140000, cacheWrite: 550000 },
  },
  'deepseek-v4-flash': {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    brand: 'DeepSeek',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 140000, output: 280000, cacheRead: 14000, cacheWrite: 140000 },
  },
  'DeepSeek-V4-Flash-0731': {
    id: 'DeepSeek-V4-Flash-0731',
    name: 'DeepSeek V4 Flash (0731)',
    brand: 'DeepSeek',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 140000, output: 280000, cacheRead: 14000, cacheWrite: 140000 },
  },
  'deepseek-v4-pro-0813': {
    id: 'deepseek-v4-pro-0813',
    name: 'DeepSeek V4 Pro (0813)',
    brand: 'DeepSeek',
    contextWindow: 131072,
    maxTokens: 32768,
    modalities: ['text'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 550000, output: 2190000, cacheRead: 140000, cacheWrite: 550000 },
  },
  'deepseek-v4-flash-vision-exp': {
    id: 'deepseek-v4-flash-vision-exp',
    name: 'DeepSeek V4 Flash Vision Exp',
    brand: 'DeepSeek',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 140000, output: 280000, cacheRead: 14000, cacheWrite: 140000 },
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    brand: 'DeepSeek',
    contextWindow: 65536,
    maxTokens: 8192,
    modalities: ['text'],
    officialPriceMicros: { input: 140000, output: 280000, cacheRead: 14000, cacheWrite: 140000 },
  },
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    brand: 'DeepSeek',
    contextWindow: 65536,
    maxTokens: 16384,
    modalities: ['text'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 550000, output: 2190000, cacheRead: 140000, cacheWrite: 550000 },
  },

  // --- Google Gemini Series ---
  'gemini-3.7-flash': {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    brand: 'Google',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', low: 'low', medium: 'medium', high: 'high' },
    officialPriceMicros: { input: 100000, output: 400000, cacheRead: 25000, cacheWrite: 100000 },
  },
  'gemini-3.6-flash': {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    brand: 'Google',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 100000, output: 400000, cacheRead: 25000, cacheWrite: 100000 },
  },
  'gemini-3.5-flash': {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    brand: 'Google',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 75000, output: 300000, cacheRead: 18750, cacheWrite: 75000 },
  },
  'gemini-3.5-flash-high': {
    id: 'gemini-3.5-flash-high',
    name: 'Gemini 3.5 Flash High',
    brand: 'Google',
    contextWindow: 1048576,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    reasoningEfforts: { high: 'high' },
    officialPriceMicros: { input: 75000, output: 300000, cacheRead: 18750, cacheWrite: 75000 },
  },
  'gemini-3.1-pro-preview': {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    brand: 'Google',
    contextWindow: 2097152,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 1250000, output: 5000000, cacheRead: 312500, cacheWrite: 1250000 },
  },
  'gemini-3.1-flash-lite-preview': {
    id: 'gemini-3.1-flash-lite-preview',
    name: 'Gemini 3.1 Flash Lite Preview',
    brand: 'Google',
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 75000, output: 300000, cacheRead: 18750, cacheWrite: 75000 },
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    brand: 'Google',
    contextWindow: 2097152,
    maxTokens: 65536,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 1250000, output: 5000000, cacheRead: 312500, cacheWrite: 1250000 },
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    brand: 'Google',
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 75000, output: 300000, cacheRead: 18750, cacheWrite: 75000 },
  },

  // --- xAI Grok Series ---
  'grok-4.6': {
    id: 'grok-4.6',
    name: 'Grok 4.6',
    brand: 'xAI',
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    reasoningEfforts: { off: '', high: 'high' },
    officialPriceMicros: { input: 2000000, output: 10000000, cacheRead: 200000, cacheWrite: 2500000 },
  },
  'grok-4.5': {
    id: 'grok-4.5',
    name: 'Grok 4.5',
    brand: 'xAI',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text', 'image'],
    officialPriceMicros: { input: 2000000, output: 10000000, cacheRead: 200000, cacheWrite: 2500000 },
  },
  'grok-4.3': {
    id: 'grok-4.3',
    name: 'Grok 4.3',
    brand: 'xAI',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 2000000, output: 10000000, cacheRead: 200000, cacheWrite: 2500000 },
  },

  // --- Zhipu GLM Series ---
  'glm-5.3': {
    id: 'glm-5.3',
    name: 'GLM 5.3',
    brand: 'Zhipu',
    contextWindow: 131072,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 1000000, output: 4000000, cacheRead: 200000, cacheWrite: 1000000 },
  },
  'glm-5.3-flash': {
    id: 'glm-5.3-flash',
    name: 'GLM 5.3 Flash',
    brand: 'Zhipu',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 100000, output: 200000, cacheRead: 10000, cacheWrite: 100000 },
  },
  'glm-5.2': {
    id: 'glm-5.2',
    name: 'GLM 5.2',
    brand: 'Zhipu',
    contextWindow: 131072,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 1000000, output: 4000000, cacheRead: 200000, cacheWrite: 1000000 },
  },

  // --- Moonshot Kimi Series ---
  'kimi-k3': {
    id: 'kimi-k3',
    name: 'Kimi K3',
    brand: 'Moonshot',
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 1500000, output: 6000000, cacheRead: 300000, cacheWrite: 1500000 },
  },
  'kimi-k2.7-code': {
    id: 'kimi-k2.7-code',
    name: 'Kimi K2.7 Code',
    brand: 'Moonshot',
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: ['text'],
    officialPriceMicros: { input: 1000000, output: 4000000, cacheRead: 200000, cacheWrite: 1000000 },
  },

  // --- Alibaba Qwen Series ---
  'qwen3.8-max': {
    id: 'qwen3.8-max',
    name: 'Qwen 3.8 Max',
    brand: 'Alibaba',
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 2000000, output: 8000000, cacheRead: 400000, cacheWrite: 2000000 },
  },
  'qwen3.8-flash': {
    id: 'qwen3.8-flash',
    name: 'Qwen 3.8 Flash',
    brand: 'Alibaba',
    contextWindow: 1048576,
    maxTokens: 16384,
    modalities: ['text'],
    officialPriceMicros: { input: 100000, output: 300000, cacheRead: 20000, cacheWrite: 100000 },
  },
  'qwen3.7-max': {
    id: 'qwen3.7-max',
    name: 'Qwen 3.7 Max',
    brand: 'Alibaba',
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ['text', 'image'],
    thinkingFormat: 'deepseek',
    officialPriceMicros: { input: 2000000, output: 8000000, cacheRead: 400000, cacheWrite: 2000000 },
  },

  // --- MiniMax Series ---
  'minimax-m3': {
    id: 'minimax-m3',
    name: 'MiniMax M3',
    brand: 'MiniMax',
    contextWindow: 1048576,
    maxTokens: 32768,
    modalities: ['text'],
    officialPriceMicros: { input: 1000000, output: 4000000, cacheRead: 200000, cacheWrite: 1000000 },
  },
};

/** Infer Brand from model name if not in catalog. */
export function inferBrand(modelId: string): string {
  const m = modelId.toLowerCase();
  if (m.startsWith('gpt') || m.startsWith('o1') || m.startsWith('o3') || m.startsWith('chatgpt')) return 'OpenAI';
  if (m.startsWith('claude')) return 'Anthropic';
  if (m.startsWith('gemini') || m.startsWith('google') || m.startsWith('imagen')) return 'Google';
  if (m.startsWith('deepseek')) return 'DeepSeek';
  if (m.startsWith('grok')) return 'xAI';
  if (m.startsWith('glm') || m.startsWith('zhipu') || m.startsWith('cog')) return 'Zhipu';
  if (m.startsWith('kimi') || m.startsWith('moonshot')) return 'Moonshot';
  if (m.startsWith('qwen')) return 'Alibaba';
  if (m.startsWith('minimax')) return 'MiniMax';
  if (m.startsWith('mimo') || m.startsWith('xiaomi')) return 'Xiaomi';
  if (m.startsWith('hunyuan') || m.startsWith('tencent') || m.startsWith('hy')) return 'Tencent';
  return 'Other';
}

/** Resolve metadata for any model ID, falling back to safe defaults. */
export function resolveModelMeta(modelId: string): A6ApiModelMeta {
  if (A6API_CATALOG[modelId]) {
    return A6API_CATALOG[modelId];
  }
  // Case-insensitive lookup
  const lowerId = modelId.toLowerCase();
  for (const [k, v] of Object.entries(A6API_CATALOG)) {
    if (k.toLowerCase() === lowerId) {
      return v;
    }
  }
  const brand = inferBrand(modelId);
  const isVision = lowerId.includes('vision') || lowerId.includes('vl') || lowerId.includes('image');
  const hasReasoning = lowerId.includes('think') || lowerId.includes('reason') || lowerId.includes('pro') || lowerId.includes('sol');

  return {
    id: modelId,
    name: modelId,
    brand,
    contextWindow: 262144,
    maxTokens: 32768,
    modalities: isVision ? ['text', 'image'] : ['text'],
    ...(hasReasoning ? { thinkingFormat: 'deepseek' } : {}),
  };
}
