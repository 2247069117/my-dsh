import type { ITranslationAdapter, PluginConfig } from './base.ts';

/**
 * DeepLX-compatible self-hosted translation gateway adapter. Point it at any
 * local/self-hosted gateway that exposes the DeepLX-ish contract, e.g.
 * https://github.com/17Yuns/Translate_Api_Free (POST {base}/Google/translate
 * and {base}/Bing/translate, returning { code, data }).
 *
 * Bing's web endpoint works from mainland networks without a key and does not
 * depend on a third-party relay; Google's endpoint requires a relay or your own
 * reverse proxy. The engine is selectable in the settings panel.
 */
export class GatewayAdapter implements ITranslationAdapter {
  readonly id = 'gateway';
  readonly name = '本地翻译网关 (DeepLX 兼容)';

  isAvailable(config: PluginConfig): boolean {
    return !!(config.gatewayUrl && config.gatewayUrl.trim().length > 0);
  }

  async translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string> {
    const base = (config.gatewayUrl ?? '').trim().replace(/\/+$/, '');
    if (!base) {
      throw new Error('Local translation gateway URL is not configured');
    }

    const engine = config.gatewayEngine === 'google' ? 'Google' : 'Bing';

    const response = await fetch(`${base}/${engine}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_lang: 'en',
        target_lang: 'zh',
        text,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Local gateway (${engine}) responded with status ${response.status}`);
    }

    const json = (await response.json()) as { code?: number; data?: unknown; message?: string };
    if (json.code !== 200 || typeof json.data !== 'string' || !json.data.trim()) {
      throw new Error(`Local gateway (${engine}) returned: ${json.message ?? 'no data'}`);
    }

    return json.data.trim();
  }
}