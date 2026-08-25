export interface PluginConfig {
  enabled: boolean;
  concurrency: number; // 1-6, default 3
  timeoutMs: number; // default 2000
  channels: string[]; // ['siliconflow', 'zhipu', 'bing', 'mymemory', 'builtin']
  siliconflowKey?: string;
  zhipuKey?: string;
}

export interface MaskedPluginConfig extends Omit<PluginConfig, 'siliconflowKey' | 'zhipuKey'> {
  siliconflowKeyMasked?: string;
  zhipuKeyMasked?: string;
  hasSiliconflowKey: boolean;
  hasZhipuKey: boolean;
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
