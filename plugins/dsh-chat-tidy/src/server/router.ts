import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ConfigManager } from './config.ts';
import type { TranslationDispatcher } from './dispatcher.ts';

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(json);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export function createHttpHandler(
  configManager: ConfigManager,
  dispatcher: TranslationDispatcher
) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      });
      res.end();
      return;
    }

    const url = new URL(req.url || '/', 'http://localhost');
    const pathParts = url.pathname.split('/').filter(Boolean);
    // pathParts will start with ['api', 'dsh-chat-tidy', ...]
    const endpoint = pathParts[2] || '';

    try {
      if (endpoint === 'translate' && req.method === 'POST') {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw || '{}');
        const texts: string[] = Array.isArray(parsed.texts)
          ? parsed.texts
          : typeof parsed.text === 'string'
            ? [parsed.text]
            : [];
        const forceRefresh = !!parsed.forceRefresh;

        if (texts.length === 0) {
          sendJson(res, 200, { ok: true, results: [] });
          return;
        }

        const results = await dispatcher.translateBatch(texts, forceRefresh);
        sendJson(res, 200, { ok: true, results });
        return;
      }

      if (endpoint === 'config') {
        if (req.method === 'GET') {
          sendJson(res, 200, { ok: true, config: configManager.getMaskedConfig() });
          return;
        }
        if (req.method === 'POST') {
          const raw = await readBody(req);
          const updates = JSON.parse(raw || '{}');
          await configManager.updateConfig(updates);
          sendJson(res, 200, { ok: true, config: configManager.getMaskedConfig() });
          return;
        }
      }

      if (endpoint === 'test-channel' && req.method === 'POST') {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw || '{}');
        const channelId = typeof parsed.channel === 'string' ? parsed.channel : '';
        const result = await dispatcher.testChannel(channelId);
        sendJson(res, 200, result);
        return;
      }

      sendJson(res, 404, { ok: false, error: 'Endpoint not found' });
    } catch (err: any) {
      sendJson(res, 500, { ok: false, error: err?.message || String(err) });
    }
  };
}
