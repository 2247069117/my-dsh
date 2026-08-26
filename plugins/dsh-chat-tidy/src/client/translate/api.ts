export interface TranslateItemResult {
  original: string;
  translated: string;
  channel: string;
  cached: boolean;
}

export interface TranslateBatchOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function requestTranslateBatch(
  texts: string[],
  options: TranslateBatchOptions = {}
): Promise<TranslateItemResult[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  
  // Filter out empty or whitespace-only texts
  const validTexts = texts.map((t) => (typeof t === 'string' ? t : ''));
  if (validTexts.length === 0) return [];

  const controller = new AbortController();
  const timeoutId = options.timeoutMs
    ? setTimeout(() => controller.abort(), options.timeoutMs)
    : null;

  const effectiveSignal = options.signal
    ? (options.signal.aborted ? options.signal : controller.signal)
    : controller.signal;

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch('/api/dsh-chat-tidy/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts: validTexts }),
      signal: effectiveSignal,
    });

    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; results?: TranslateItemResult[]; error?: string };
      if (data.ok && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      } else if (data.error) {
        console.warn(`[dsh-chat-tidy] 翻译接口错误: ${data.error}`);
      }
    } else {
      console.warn(`[dsh-chat-tidy] 翻译请求失败 (HTTP ${res.status})`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // Intentionally aborted
    }
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }

  // Host route unreachable or error — leave the original text untouched
  return validTexts.map((t) => ({
    original: t,
    translated: t,
    channel: 'fallback-client',
    cached: false,
  }));
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