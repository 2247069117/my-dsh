export interface PluginConfig {
  enabled: boolean;
  concurrency: number; // 1-6, default 3
  timeoutMs: number; // default 2000
  channels: string[]; // ['siliconflow', 'zhipu', 'gateway', 'mymemory', 'builtin']
  siliconflowKey?: string;
  zhipuKey?: string;
  gatewayUrl?: string; // DeepLX-compatible local gateway base, e.g. http://127.0.0.1:6060/api
  gatewayEngine?: 'bing' | 'google';
}

export interface MaskedPluginConfig extends Omit<PluginConfig, 'siliconflowKey' | 'zhipuKey' | 'gatewayUrl'> {
  siliconflowKeyMasked?: string;
  zhipuKeyMasked?: string;
  hasSiliconflowKey: boolean;
  hasZhipuKey: boolean;
  hasGatewayUrl: boolean;
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
