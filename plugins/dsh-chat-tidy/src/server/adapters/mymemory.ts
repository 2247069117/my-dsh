import type { ITranslationAdapter, PluginConfig } from './base.ts';

function unescapeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

export class MyMemoryAdapter implements ITranslationAdapter {
  readonly id = 'mymemory';
  readonly name = 'MyMemory 免费机器翻译';

  isAvailable(_config: PluginConfig): boolean {
    return true; // Always available anonymously
  }

  async translate(text: string, signal: AbortSignal, _config: PluginConfig): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'dsh-chat-tidy/0.3.0',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`MyMemory API responded with status ${response.status}`);
    }

    const json = (await response.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };

    const translated = json.responseData?.translatedText?.trim();
    if (!translated || json.responseStatus !== 200) {
      throw new Error('MyMemory translation failed or quota exceeded');
    }

    // Filter out common MyMemory warning strings
    if (translated.startsWith('MYMEMORY WARNING:')) {
      throw new Error('MyMemory quota exceeded');
    }

    return unescapeHtml(translated);
  }
}
