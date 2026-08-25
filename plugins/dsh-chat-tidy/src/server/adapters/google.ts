import type { ITranslationAdapter, PluginConfig } from './base.ts';

/**
 * Unofficial Google Translate "GTX" endpoint — free, key-less, and the same
 * translation engine users see on translate.google.com. It is not a documented
 * public API, so this channel is deliberately positioned as a fallback that
 * sits behind the configured LLM channels: any failure (blocked network,
 * changed response shape, rate limit) falls through the dispatcher's chain.
 */
export class GoogleTranslateAdapter implements ITranslationAdapter {
  readonly id = 'google';
  readonly name = '谷歌翻译 (免费接口)';

  isAvailable(_config: PluginConfig): boolean {
    return true; // No key required
  }

  async translate(text: string, signal: AbortSignal, _config: PluginConfig): Promise<string> {
    const url =
      'https://translate.googleapis.com/translate_a/single' +
      `?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'dsh-chat-tidy/0.3.0',
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Google Translate responded with status ${response.status}`);
    }

    // GTX shape: [[[translated, original, null, null, ...], ...], null, "en", ...]
    const json = (await response.json()) as unknown;
    const segments = Array.isArray(json) && Array.isArray(json[0]) ? (json[0] as unknown[]) : null;
    if (!segments) {
      throw new Error('Google Translate returned an unexpected response');
    }

    const translated = segments
      .filter((seg): seg is unknown[] => Array.isArray(seg) && typeof seg[0] === 'string')
      .map((seg) => seg[0] as string)
      .join('')
      .trim();

    if (!translated) {
      throw new Error('Google Translate returned an empty translation');
    }

    return translated;
  }
}