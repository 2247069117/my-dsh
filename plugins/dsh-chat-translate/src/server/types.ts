export interface PluginConfig {
  enabled: boolean;
  concurrency: number; // 1-100, default 3
  timeoutMs: number; // Bing channel timeout, default 2000
  aiTimeoutMs: number; // AI channel timeout, default 30000
  aiEnabled: boolean; // AI (OpenAI-compatible) channel switch
  bingEnabled: boolean; // Bing web translation channel switch
  baseUrl: string; // OpenAI-compatible base URL; empty = AI not configured
  model: string; // model name; empty = AI not configured
  targetLang: string; // target language, default 'zh-Hans'
}

export interface MaskedPluginConfig {
  enabled: boolean;
  concurrency: number;
  timeoutMs: number;
  aiTimeoutMs: number;
  aiEnabled: boolean;
  bingEnabled: boolean;
  baseUrl: string;
  model: string;
  targetLang: string;
  aiConfigured: boolean; // baseUrl + model + TRANSLATE_API_KEY all present
}

export interface TranslateItemResult {
  original: string;
  translated: string;
  channel: string;
  cached: boolean;
}

export interface TranslateResponse {
  ok: boolean;
  results: TranslateItemResult[];
  error?: string;
}

export interface ITranslationAdapter {
  readonly id: string;
  readonly name: string;
  isAvailable(config: PluginConfig): boolean;
  translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string>;
}
