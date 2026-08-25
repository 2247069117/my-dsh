export interface TranslateItemResult {
  original: string;
  translated: string;
  channel: string;
  cached: boolean;
}

export async function requestTranslateBatch(
  texts: string[]
): Promise<TranslateItemResult[]> {
  if (texts.length === 0) return [];
  try {
    const res = await fetch('/api/dsh-chat-tidy/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (!res.ok) {
      return texts.map((t) => ({ original: t, translated: t, channel: 'error', cached: false }));
    }

    const data = (await res.json()) as { ok: boolean; results?: TranslateItemResult[] };
    return data.results || texts.map((t) => ({ original: t, translated: t, channel: 'none', cached: false }));
  } catch {
    return texts.map((t) => ({ original: t, translated: t, channel: 'error', cached: false }));
  }
}

export async function fetchServerConfig(): Promise<any> {
  try {
    const res = await fetch('/api/dsh-chat-tidy/config');
    if (!res.ok) return null;
    const json = await res.json();
    return json.config;
  } catch {
    return null;
  }
}

export async function updateServerConfig(updates: any): Promise<any> {
  try {
    const res = await fetch('/api/dsh-chat-tidy/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.config;
  } catch {
    return null;
  }
}

export async function testServerChannel(channel: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  try {
    const res = await fetch('/api/dsh-chat-tidy/test-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, latencyMs: 0, error: err?.message || String(err) };
  }
}
