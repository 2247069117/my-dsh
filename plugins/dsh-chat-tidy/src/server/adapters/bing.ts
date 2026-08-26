import type { ITranslationAdapter, PluginConfig } from './base.ts';

/**
 * Built-in Bing Web translator channel — no key, no gateway jar, mainland
 * networks reach cn.bing.com directly. This is the same flow DeepLX and
 * Translate_Api_Free use: fetch the translator page for the IG token and the
 * abuse-prevention key/token, then POST to ttranslatev3.
 */

const TRANSLATOR_URL = 'https://cn.bing.com/translator';
const TRANSLATE_URL = 'https://cn.bing.com/ttranslatev3?isVertical=1&&IG={IG}&IID=translator.5025.1';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const IG_RES = [
  /_IG="([a-zA-Z0-9]+)"/,
  /,IG:"([a-zA-Z0-9]+)"/,
  /IG:"([a-zA-Z0-9]+)"/,
  /"IG":"([a-zA-Z0-9]+)"/,
];
const ABUSE_RES = [
  /params_AbusePreventionHelper\s*=\s*\[\s*(\d+)\s*,\s*"([^"]+)"/,
  /var\s+params_AbusePreventionHelper\s*=\s*\[\s*(\d+)\s*,\s*"([^"]+)"/,
];

interface BingTokens {
  ig: string;
  key: string;
  token: string;
}

let cachedTokens: BingTokens | null = null;
let tokensFetchedAt = 0;
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
let inFlightTokenPromise: Promise<BingTokens> | null = null;

function parseTokens(html: string): BingTokens {
  let ig: string | undefined;
  for (const re of IG_RES) {
    const m = re.exec(html);
    if (m && m[1]) {
      ig = m[1];
      break;
    }
  }

  let key: string | undefined;
  let token: string | undefined;
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

export async function fetchTokens(signal: AbortSignal, forceRefresh = false): Promise<BingTokens> {
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
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal,
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

export class BingWebAdapter implements ITranslationAdapter {
  readonly id = 'bing';
  readonly name = '微软 Bing 网页翻译 (免Key直连)';

  isAvailable(_config: PluginConfig): boolean {
    return true; // No key, no gateway URL required
  }

  async translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string> {
    const targetLang = config.targetLang || 'zh-Hans';
    return this.executeTranslate(text, signal, targetLang, false);
  }

  private async executeTranslate(
    text: string,
    signal: AbortSignal,
    targetLang: string,
    isRetry: boolean
  ): Promise<string> {
    const tokens = await fetchTokens(signal, isRetry);

    const body = new URLSearchParams({
      fromLang: 'auto-detect',
      text,
      to: targetLang,
      key: tokens.key,
      token: tokens.token,
      tryFetchingGenderDebiasedTranslations: 'true',
    });

    const response = await fetch(TRANSLATE_URL.replace('{IG}', tokens.ig), {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        Referer: 'https://cn.bing.com/translator/',
        Origin: 'https://cn.bing.com',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal,
    });

    if (!response.ok) {
      cachedTokens = null;
      // Auto retry once with fresh tokens if not already retrying
      if (!isRetry && (response.status === 400 || response.status === 401 || response.status === 403)) {
        return this.executeTranslate(text, signal, targetLang, true);
      }
      throw new Error(`Bing translate responded with status ${response.status}`);
    }

    const json = (await response.json()) as Array<{ translations?: Array<{ text?: string }> }>;
    const translated = json?.[0]?.translations?.[0]?.text?.trim();
    if (!translated) {
      cachedTokens = null;
      if (!isRetry) {
        return this.executeTranslate(text, signal, targetLang, true);
      }
      throw new Error('Bing translate returned an empty result');
    }
    return translated;
  }
}
