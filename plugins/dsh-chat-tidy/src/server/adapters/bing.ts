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

const IG_RE = /,IG:"(.*?)",/;
const ABUSE_RE = /var\s+params_AbusePreventionHelper\s*=\s*\[\s*(\d+),\s*"([^"]+)"/;

interface BingTokens {
  ig: string;
  key: string;
  token: string;
}

let cachedTokens: BingTokens | null = null;
let tokensFetchedAt = 0;
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function fetchTokens(signal: AbortSignal): Promise<BingTokens> {
  if (cachedTokens && Date.now() - tokensFetchedAt < TOKEN_TTL_MS) {
    return cachedTokens;
  }

  const response = await fetch(TRANSLATOR_URL, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Bing translator page responded with status ${response.status}`);
  }
  const html = await response.text();

  const igMatch = IG_RE.exec(html);
  const abuseMatch = ABUSE_RE.exec(html);
  if (!igMatch || !abuseMatch) {
    throw new Error('Bing translator page: IG or abuse-prevention token not found');
  }

  cachedTokens = { ig: igMatch[1], key: abuseMatch[1], token: abuseMatch[2] };
  tokensFetchedAt = Date.now();
  return cachedTokens;
}

export class BingWebAdapter implements ITranslationAdapter {
  readonly id = 'bing';
  readonly name = '微软 Bing 网页翻译 (免Key直连)';

  isAvailable(_config: PluginConfig): boolean {
    return true; // No key, no gateway URL required
  }

  async translate(text: string, signal: AbortSignal, _config: PluginConfig): Promise<string> {
    const { ig, key, token } = await fetchTokens(signal);

    const body = new URLSearchParams({
      fromLang: 'auto-detect',
      text,
      to: 'zh-Hans',
      key,
      token,
      tryFetchingGenderDebiasedTranslations: 'true',
    });

    const response = await fetch(TRANSLATE_URL.replace('{IG}', ig), {
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
      // Token may have expired — next attempt will re-fetch.
      cachedTokens = null;
      throw new Error(`Bing translate responded with status ${response.status}`);
    }

    const json = (await response.json()) as Array<{ translations?: Array<{ text?: string }> }>;
    const translated = json?.[0]?.translations?.[0]?.text?.trim();
    if (!translated) {
      // Empty result usually means a stale token or an API change — treat as
      // failure (triggers circuit breaker) and force a token re-fetch.
      cachedTokens = null;
      throw new Error('Bing translate returned an empty result');
    }
    return translated;
  }
}