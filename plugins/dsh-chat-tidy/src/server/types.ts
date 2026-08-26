export interface PluginConfig {
  enabled: boolean;
  concurrency: number; // 1-100, default 3
  timeoutMs: number; // default 2000
  channels: string[]; // ['bing']
  translateThinking?: boolean; // translate Think/reasoning blocks (default off)
  targetLang?: string; // target language, default 'zh-Hans'
}

export interface MaskedPluginConfig {
  enabled: boolean;
  concurrency: number;
  timeoutMs: number;
  channels: string[];
  translateThinking: boolean;
  targetLang: string;
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
