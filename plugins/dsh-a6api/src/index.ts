import { fetchBalance, fetchTokenModels, fetchRecentLogs, fetchPriceFluctuation, formatRelativeTime } from './server/a6api-client.js';
import { getKnownMerchantsFromLogs, probeSingleModel } from './server/probe.js';
import { resolveModelMeta } from './server/catalog.js';
import {
  getDshConfiguredModels,
  readPluginConfig,
  savePluginConfig,
  syncToDshSettings,
} from './server/sync.js';
import type { A6ApiConfig, A6ApiStateResponse, MerchantChannelInfo, ModelCardData } from './types.js';

export const name = '@lynn123411/dsh-a6api';
export const inject = ['webServer'];

export {
  fetchBalance,
  fetchTokenModels,
  fetchRecentLogs,
  fetchChannelDetails,
} from './server/a6api-client.js';
export { probeSingleModel, getKnownMerchantsFromLogs } from './server/probe.js';
export { resolveModelMeta, A6API_CATALOG } from './server/catalog.js';
export { readPluginConfig, savePluginConfig, syncToDshSettings } from './server/sync.js';

const PREFIX = '/api/dsh-a6api';

/** 客户端脱敏占位符：服务端绝不回传真实密钥 */
const MASK = '••••••••';

/** 脱敏配置：API Key / 系统访问令牌 / userId 仅以占位符形式下发，真实值只存在于服务端 */
function maskConfig(c: A6ApiConfig): A6ApiConfig {
  return {
    ...c,
    apiKey: c.apiKey ? MASK : '',
    accessToken: c.accessToken || c.sessionCookie ? MASK : '',
    sessionCookie: '',
    userId: c.userId ? MASK : '',
    hasApiKey: Boolean(c.apiKey),
    hasToken: Boolean(c.accessToken || c.sessionCookie),
  };
}

function sendJson(res: any, status: number, body: any) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-cache',
    // 不设 access-control-allow-origin：仅允许同源调用，阻断跨站读取与 CSRF 预检
  });
  res.end(JSON.stringify(body));
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => resolve(data.trim()));
    req.on('error', reject);
  });
}

async function parseJsonBody(req: any): Promise<any> {
  const text = await readBody(req);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

// In-memory cache for merchant cards to avoid duplicate log calls
const merchantCardCache = new Map<string, { card: MerchantChannelInfo; at: number }>();
/** 卡片缓存有效期:过期后 /state 从最新日志重新推导,避免永远展示陈旧商户 */
const MERCHANT_CARD_TTL_MS = 15 * 60 * 1000;

export function apply(ctx: any): void {
  // Register Web API routes
  const webServer = ctx.webServer || (ctx.get ? ctx.get('webServer') : null);
  if (webServer && typeof webServer.register === 'function') {
    ctx.effect(() => {
      const unregister = webServer.register({
        kind: 'prefix',
        path: PREFIX,
        handler: async (req: any, res: any) => {
          const url = new URL(req.url || '/', 'http://localhost');
          const pathname = url.pathname.replace(PREFIX, '') || '/';

          // CORS preflight：同源策略下无需放行跨源（移除 ACAO 后跨源预检天然失败）
          if (req.method === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
          }

          try {
            // GET /state
            if (pathname === '/state' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || '';
              const balance = await fetchBalance(config.baseURL, config.apiKey, config.userId, token);
              
              // Auto-persist discovered userId
              if (balance?.userId && String(balance.userId) !== config.userId) {
                config.userId = String(balance.userId);
                await savePluginConfig(config);
              }

              const dshConfiguredModels = await getDshConfiguredModels();

              // Fetch allowed model IDs for this token
              let modelIds: string[] = [];
              if (config.apiKey) {
                modelIds = await fetchTokenModels(config.baseURL, config.apiKey);
              }

              // Fallback to active/configured models if token query returned empty
              if (modelIds.length === 0) {
                modelIds = [
                  ...new Set([
                    ...config.activeModels,
                    ...dshConfiguredModels,
                    'gpt-5.6-sol',
                    'gpt-5.6-terra',
                    'gpt-5.6-luna',
                    'claude-fable-5',
                    'claude-opus-5',
                    'grok-4.6',
                  ]),
                ];
              }

              // 一次拉取日志(接口实测上限 100 条),同一份数据用于: ①商户卡片预填充 ②路由快照时效映射 ③Account 页最近明细
              const allLogs = await fetchRecentLogs(config.userId, token, 100);
              // 防御性排序：依赖“最新在前”，若网关排序变更仍能正确取首条
              allLogs.sort((a, b) => (Number(b.created_at) || 0) - (Number(a.created_at) || 0));

              // Match known merchant cards from recent logs if not yet in cache (with 10s total timeout to avoid /state hang)
              if (config.userId || token) {
                const missing = modelIds.filter((m) => {
                  const entry = merchantCardCache.get(m.toLowerCase());
                  return !entry || Date.now() - entry.at >= MERCHANT_CARD_TTL_MS;
                });
                if (missing.length > 0) {
                  let found: Record<string, MerchantChannelInfo> = {};
                  try {
                    found = await Promise.race([
                      getKnownMerchantsFromLogs(config.userId, token, missing, allLogs),
                      new Promise<Record<string, MerchantChannelInfo>>((resolve) => setTimeout(() => resolve({}), 10000)),
                    ]);
                  } catch {
                    found = {};
                  }
                  for (const [mName, card] of Object.entries(found)) {
                    merchantCardCache.set(mName.toLowerCase(), { card, at: Date.now() });
                  }
                }
              }

              // 路由快照时效: 每个模型最新一条「带 channel 的调用日志」时间 —— 与预填充卡片商户数据同一条规则(取最新命中商户路由的请求)
              const lastRoutedMap = new Map<string, number>();
              for (const log of allLogs) {
                const mName = log.model_name;
                const chId = Number(log.channel);
                const ts = Number(log.created_at) || 0;
                if (mName && chId > 0 && ts > 0 && !lastRoutedMap.has(mName.toLowerCase())) {
                  lastRoutedMap.set(mName.toLowerCase(), ts);
                }
              }

              const dshSet = new Set(dshConfiguredModels);
              const models: ModelCardData[] = modelIds.map((mId) => {
                const meta = resolveModelMeta(mId);
                const cacheEntry = merchantCardCache.get(mId.toLowerCase());
                const cachedCard =
                  cacheEntry && Date.now() - cacheEntry.at < MERCHANT_CARD_TTL_MS
                    ? cacheEntry.card
                    : undefined;
                const routedAt = lastRoutedMap.get(mId.toLowerCase());
                return {
                  model_name: mId,
                  brand: meta.brand,
                  contextWindow: meta.contextWindow,
                  maxTokens: meta.maxTokens,
                  modalities: meta.modalities,
                  hasReasoning: Boolean(meta.reasoningEfforts || meta.thinkingFormat),
                  inDsh: dshSet.has(mId),
                  merchant: cachedCard,
                  probeStatus: cachedCard ? 'success' : 'idle',
                  lastRoutedAt: routedAt,
                  lastRoutedText: routedAt ? formatRelativeTime(routedAt) : undefined,
                };
              });

              // Account 页明细保持原有窗口 (20 条)
              const recentLogs = allLogs.slice(0, 20);

              const response: A6ApiStateResponse = {
                config: maskConfig(config),
                balance,
                models,
                dshConfiguredModels,
                recentLogs,
              };
              return sendJson(res, 200, { ok: true, data: response });
            }

            // POST /config
            if (pathname === '/config' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const current = await readPluginConfig();
              const rawToken =
                body.accessToken !== undefined && body.accessToken !== MASK
                  ? body.accessToken
                  : body.sessionCookie !== undefined && body.sessionCookie !== MASK
                    ? body.sessionCookie
                    : (current.accessToken || current.sessionCookie || '');
              const newApiKey =
                body.apiKey !== undefined && body.apiKey !== MASK ? body.apiKey : current.apiKey;

              const updated: A6ApiConfig = {
                baseURL: body.baseURL !== undefined ? body.baseURL : current.baseURL,
                apiKey: newApiKey,
                accessToken: rawToken,
                sessionCookie: rawToken,
                userId: body.userId !== undefined ? body.userId : current.userId,
                activeModels: Array.isArray(body.activeModels) ? body.activeModels : current.activeModels,
                customBaseURL: body.customBaseURL !== undefined ? body.customBaseURL : current.customBaseURL,
              };

              // Validate access token and auto-fetch balance & userId
              const balance = await fetchBalance(updated.baseURL, updated.apiKey, updated.userId, updated.accessToken);
              if (balance?.userId) {
                updated.userId = String(balance.userId);
              }

              await savePluginConfig(updated);

              // If active models exist, sync to DSH settings as well
              if (updated.activeModels.length > 0) {
                await syncToDshSettings(updated.baseURL, updated.activeModels);
              }
              return sendJson(res, 200, { ok: true, config: maskConfig(updated), balance });
            }

            // GET /balance
            if (pathname === '/balance' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || '';
              const balance = await fetchBalance(config.baseURL, config.apiKey, config.userId, token);
              const recentLogs = await fetchRecentLogs(config.userId, token, 20);
              return sendJson(res, 200, { ok: true, balance, recentLogs });
            }

            // GET /logs
            if (pathname === '/logs' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || '';
              const recentLogs = await fetchRecentLogs(config.userId, token, 30);
              return sendJson(res, 200, { ok: true, logs: recentLogs });
            }

            // POST /probe
            if (pathname === '/probe' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || '';
              const modelName = body.modelName;

              if (modelName && modelName !== 'all') {
                const result = await probeSingleModel(config.baseURL, config.apiKey, config.userId, token, modelName);
                if (result.merchant) {
                  merchantCardCache.set(modelName.toLowerCase(), { card: result.merchant, at: Date.now() });
                }
                return sendJson(res, 200, { ok: true, result });
              }

              // Probe all models in token
              let modelIds: string[] = body.modelNames;
              if (!Array.isArray(modelIds) || modelIds.length === 0) {
                modelIds = await fetchTokenModels(config.baseURL, config.apiKey);
              }
              if (modelIds.length === 0) {
                modelIds = config.activeModels;
              }

              const results = [];
              for (const m of modelIds) {
                const r = await probeSingleModel(config.baseURL, config.apiKey, config.userId, token, m);
                if (r.merchant) {
                  merchantCardCache.set(m.toLowerCase(), { card: r.merchant, at: Date.now() });
                }
                results.push(r);
              }

              return sendJson(res, 200, { ok: true, results });
            }

            // POST /sync-models
            if (pathname === '/sync-models' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await readPluginConfig();
              const modelIds = Array.isArray(body.modelIds) ? body.modelIds : [];
              const baseURL = body.baseURL || config.baseURL;

              config.activeModels = modelIds;
              config.baseURL = baseURL;
              await savePluginConfig(config);
              await syncToDshSettings(baseURL, modelIds);

              const dshConfiguredModels = await getDshConfiguredModels();
              return sendJson(res, 200, { ok: true, dshConfiguredModels });
            }

            // GET /price-fluctuation — 轻量价格波动条数（待处理 n），仅回传计数
            if (pathname === '/price-fluctuation' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await readPluginConfig();
              const token = config.accessToken || config.sessionCookie || '';
              if (!token || !config.userId) {
                return sendJson(res, 200, { ok: true, data: { pendingCount: 0, unseenCount: 0, totalCount: 0, hasAuth: false, authError: false, updatedAt: Date.now() } });
              }
              const result = await fetchPriceFluctuation(config.userId, token, token);
              const { notices, ...counts } = result as any;
              // 401/403 时 authError=true，客户端可区分“未配置”与“失效”
              const hasAuth = !counts.authError;
              return sendJson(res, 200, { ok: true, data: { pendingCount: counts.pendingCount, unseenCount: counts.unseenCount, totalCount: counts.totalCount, hasAuth, authError: Boolean(counts.authError), updatedAt: Date.now() } });
            }

            return sendJson(res, 404, { ok: false, error: 'Not found' });
          } catch (err: any) {
            console.error('[dsh-a6api] API error:', err);
            return sendJson(res, 500, { ok: false, error: err?.message || String(err) });
          }
        },
      });

      return () => {
        if (typeof unregister === 'function') unregister();
      };
    }, 'dsh-a6api: web API router');
  }
}
