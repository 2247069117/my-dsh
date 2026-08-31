import { fetchBalance, fetchTokenModels, fetchRecentLogs, fetchPriceFluctuation, formatRelativeTime, fetchMarketplacePins, fetchTokens, fetchChannelDetails, marketplacePin, marketplaceUnpin, marketplaceDisableChannel, marketplaceRestoreChannel } from './server/a6api-client.js';
import { getKnownMerchantsFromLogs, probeSingleModel } from './server/probe.js';
import { resolveModelMeta, getCatalog, upsertCatalogEntries, clearCatalog, queryOpenRouter, fetchMarketplaceModels, updateCatalogEntry } from './server/catalog.js';
import { createConfigAccess, deriveUserIdFromAccessToken } from './server/sync.js';
import type { A6ApiConfig, A6ApiStateResponse, MarketplacePin, MerchantChannelInfo, ModelCardData } from './types.js';
import { validateReasoningEfforts } from './types.js';

export const name = '@lynn123411/dsh-a6api';
export const inject = ['webServer'];

export {
  fetchBalance,
  fetchTokenModels,
  fetchRecentLogs,
  fetchChannelDetails,
  fetchMarketplacePins,
} from './server/a6api-client.js';
export { probeSingleModel, getKnownMerchantsFromLogs } from './server/probe.js';
export {
  resolveModelMeta,
  inferBrand,
  getCatalog,
  getCatalogEntry,
  clearCatalog,
  queryOpenRouter,
  fetchMarketplaceModels,
  updateCatalogEntry,
} from './server/catalog.js';
export { createConfigAccess, deriveUserIdFromAccessToken, A6API_CRED_REF, A6API_TOKEN_REF, A6API_USER_REF } from './server/sync.js';

const PREFIX = '/api/dsh-a6api';

/** 客户端脱敏占位符：服务端绝不回传真实密钥 */
const MASK = '••••••••';

/** 脱敏配置：API Key / 系统访问令牌 / userId 仅以占位符形式下发，真实值只存在于服务端 */
function maskConfig(c: A6ApiConfig): A6ApiConfig {
  return {
    ...c,
    apiKey: c.apiKey ? MASK : '',
    accessToken: c.accessToken ? MASK : '',
    userId: c.userId ? MASK : '',
    hasApiKey: Boolean(c.apiKey),
    hasToken: Boolean(c.accessToken),
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

/** 令牌解析结果缓存（避免 /state 每次重复调令牌列表） */
let tokenResolveCache: { tokenId: number; at: number } | null = null;
const TOKEN_RESOLVE_TTL_MS = 10 * 60 * 1000;

/**
 * 把配置的 API Key 解析为平台 token_id（固定/取消固定/禁用按令牌绑定）。
 * 解析链：内存缓存（TTL）→ 令牌列表按 key 精确匹配 → 唯一令牌兜底。
 * 返回 null 表示无法解析（调用方可再用「探测日志 token_id」兜底）。
 * 说明：tokenId 是派生数据，不再持久化；每次进程冷启动后首次固定/取消固定多一次令牌列表请求。
 */
async function resolveTokenId(config: A6ApiConfig): Promise<number | null> {
  if (tokenResolveCache && Date.now() - tokenResolveCache.at < TOKEN_RESOLVE_TTL_MS) {
    return tokenResolveCache.tokenId;
  }
  const token = config.accessToken || '';
  if (!config.userId || !token) return null;
  try {
    const tokens = await fetchTokens(config.userId, token);
    let tokenId: number | null = null;
    const key = (config.apiKey || '').trim();
    if (key) {
      const hit = tokens.find((t) => t.key && t.key === key);
      if (hit) tokenId = hit.id;
    }
    if (!tokenId && tokens.length === 1) tokenId = tokens[0].id;
    if (tokenId && tokenId > 0) {
      tokenResolveCache = { tokenId, at: Date.now() };
      return tokenId;
    }
  } catch (err) {
    console.warn('[dsh-a6api] resolveTokenId error:', err);
  }
  return null;
}

/** 取当前 Web 会话凭据（固定族接口鉴权，与市场价格波动同源） */
function webAuthOf(config: A6ApiConfig): { userId?: string; token?: string } {
  return { userId: config.userId || undefined, token: config.accessToken || undefined };
}

/** 从缓存取模型商家卡片（TTL 内有效） */
function cachedMerchantOf(modelName: string): MerchantChannelInfo | undefined {
  const entry = merchantCardCache.get(modelName.toLowerCase());
  return entry && Date.now() - entry.at < MERCHANT_CARD_TTL_MS ? entry.card : undefined;
}

/** 把固定记录叠加到模型卡片上（pin_here / pin_elsewhere / 禁用等展示字段） */
function overlayPinsOnModels(models: ModelCardData[], pins: MarketplacePin[], tokenId?: number | null): ModelCardData[] {
  const byModel = new Map<string, MarketplacePin[]>();
  for (const p of pins) {
    const key = (p.model_name || '').toLowerCase();
    if (!key) continue;
    const list = byModel.get(key);
    if (list) list.push(p);
    else byModel.set(key, [p]);
  }
  return models.map((m) => {
    const list = byModel.get(m.model_name.toLowerCase());
    if (!list || list.length === 0) return m;
    // 优先取当前令牌的固定记录；解析不出令牌时退而取任意一条（标注未匹配）
    const pick =
      (tokenId ? list.find((p) => Number(p.token_id) === tokenId) : undefined) || list[0];
    const cardChannel = m.merchant?.channel_id;
    const pinChannel = pick.channel_id;
    return {
      ...m,
      // Number() 归一化：官方接口可能返回字符串渠道 ID，严格相等会误判
      pinStatus: pinChannel
        ? cardChannel && Number(cardChannel) === Number(pinChannel)
          ? 'pin_here'
          : 'pin_elsewhere'
        : undefined,
      pinnedChannelId: pinChannel,
      pinnedSupplierName: pick.supplier_nickname || pick.supplier_name,
      pinnedFallback: pick.fallback_to_smart_routing,
      pinTokenMatched: Boolean(tokenId && Number(pick.token_id) === tokenId),
    };
  });
}

export function apply(ctx: any): void {
  // DSH 原生配置访问器：启动即触发旧配置文件自动迁移（幂等，首次读取会等待其完成）
  const configAccess = createConfigAccess(ctx);
  void configAccess.ensureMigrated();

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

          // CSRF 面：同源 POST 一律要求 JSON Content-Type（跨站表单无法伪造该头）；
          // 客户端全部 POST 已带 application/json（含无 body 的 fetch-models/clear）
          if (req.method === 'POST' && !String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
            return sendJson(res, 415, { ok: false, error: 'Content-Type must be application/json' });
          }

          try {
            // GET /state
            if (pathname === '/state' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await configAccess.readConfig();
              const token = config.accessToken || '';
              // 并行拉取互相独立的上游数据：余额 / 本地配置模型 / 令牌模型列表 / 最近日志 / 平台固定记录。
              // 原串行 5 次上游 RTT → 1 次，冷路径 3~10s → 约 1~2s（启动预热 + 60s 轮询依赖此提速）。
              // 错误语义与原先一致：余额/模型列表/日志失败则整体 500，固定记录失败降级为空。
              const [balance, dshConfiguredModels, modelIdsRaw, allLogs, pins] = await Promise.all([
                fetchBalance(config.baseURL, config.apiKey, config.userId, token),
                configAccess.getDshConfiguredModels(),
                config.apiKey ? fetchTokenModels(config.baseURL, config.apiKey) : Promise.resolve([] as string[]),
                fetchRecentLogs(config.userId, token, 100),
                config.userId && token
                  ? fetchMarketplacePins(config.userId, token).catch(() => [] as MarketplacePin[])
                  : Promise.resolve([] as MarketplacePin[]),
              ]);

              // Auto-persist discovered userId
              if (balance?.userId && String(balance.userId) !== config.userId) {
                // 账号变化：旧 tokenId 不再对应当前账号，作废并重置解析缓存
                tokenResolveCache = null;
                config.userId = String(balance.userId);
                const r = await configAccess.writeConfig({ userId: config.userId });
                if (r.failures.length > 0) console.warn('[dsh-a6api] userId 自动持久化失败:', r.failures);
              }

              // Fallback to DSH-configured / default models if token query returned empty
              let modelIds = modelIdsRaw;
              if (modelIds.length === 0) {
                modelIds = [
                  ...new Set([
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
              let models: ModelCardData[] = modelIds.map((mId) => {
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

              // 固定状态叠加：pins 已在并行批次拉取（失败降级为空数组），让卡片状态跟随官网
              // （官网侧解除固定/涨价自动解除都会反映过来）
              const resolvedTokenId = pins.length > 0 ? await resolveTokenId(config) : null;
              models = overlayPinsOnModels(models, pins, resolvedTokenId);

              // 固定商家自动接管卡片：模型已固定到「非当前卡片」的商家时（当前令牌的固定），
              // 拉取该固定商家的渠道详情替换卡片，而不是提示「已固定到其他商家」。
              // 拉取失败/固定属于其他令牌时保持原卡片并回退到提示徽标。
              const rePointTargets = models
                .filter(
                  (m) =>
                    m.pinStatus === 'pin_elsewhere' &&
                    m.pinTokenMatched === true &&
                    m.pinnedChannelId &&
                    m.pinnedChannelId > 0,
                )
                .map((m) => ({ modelName: m.model_name, channelId: m.pinnedChannelId as number }));
              if (rePointTargets.length > 0 && config.userId && token) {
                try {
                  await Promise.race([
                    (async () => {
                      for (let i = 0; i < rePointTargets.length; i += 4) {
                        const batch = rePointTargets.slice(i, i + 4);
                        await Promise.all(
                          batch.map(async ({ modelName, channelId }) => {
                            try {
                              const pinnedCard = await fetchChannelDetails(
                                channelId,
                                config.userId,
                                token,
                                modelName,
                              );
                              // 校验返回卡片确实属于目标固定渠道，避免官方搜索返回其他条目污染缓存
                              if (pinnedCard && Number(pinnedCard.channel_id) === Number(channelId)) {
                                merchantCardCache.set(modelName.toLowerCase(), { card: pinnedCard, at: Date.now() });
                              }
                            } catch {}
                          }),
                        );
                      }
                    })(),
                    new Promise<void>((resolve) => setTimeout(() => resolve(), 10000)),
                  ]);
                } catch {}
                // 用回填后的缓存重建卡片（固定商家即卡片商家 → 状态升级为 pin_here）
                models = models.map((m) => {
                  if (m.pinStatus !== 'pin_elsewhere' || m.pinTokenMatched !== true) return m;
                  const entry = merchantCardCache.get(m.model_name.toLowerCase());
                  const card = entry && Date.now() - entry.at < MERCHANT_CARD_TTL_MS ? entry.card : undefined;
                  if (card && Number(card.channel_id) === Number(m.pinnedChannelId)) {
                    // 路由快照口径对齐：取「该商家的该模型」最近一次请求（卡片已切换到固定商家，时间不能再按任意商家取）
                    const pinnedLog = allLogs.find(
                      (l) =>
                        l.model_name?.toLowerCase() === m.model_name.toLowerCase() &&
                        Number(l.channel) === m.pinnedChannelId,
                    );
                    const pinnedAt = pinnedLog ? Number(pinnedLog.created_at) || 0 : undefined;
                    return {
                      ...m,
                      merchant: card,
                      pinStatus: 'pin_here' as const,
                      probeStatus: 'success' as const,
                      lastRoutedAt: pinnedAt,
                      lastRoutedText: pinnedAt ? formatRelativeTime(pinnedAt) : undefined,
                    };
                  }
                  return m;
                });
              }

              // Account 页明细保持原有窗口 (20 条)
              const recentLogs = allLogs.slice(0, 20);

              const response: A6ApiStateResponse = {
                config: maskConfig(config),
                balance,
                models,
                dshConfiguredModels,
                recentLogs,
                pins,
              };
              return sendJson(res, 200, { ok: true, data: response });
            }

            // POST /config
            if (pathname === '/config' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const current = await configAccess.readConfig();
              // 兼容旧客户端 bundle 仍会发送 sessionCookie：同一凭据，取任一非占位值
              const rawToken =
                body.accessToken !== undefined && body.accessToken !== MASK
                  ? body.accessToken
                  : body.sessionCookie !== undefined && body.sessionCookie !== MASK
                    ? body.sessionCookie
                    : current.accessToken;
              const newApiKey =
                body.apiKey !== undefined && body.apiKey !== MASK ? body.apiKey : current.apiKey;
              // 系统访问令牌变更时，持久化的 userId 属于旧令牌账号：从新令牌 JWT 重新派生
              // （New-Api-User 鉴权头必须与令牌账号匹配，携带旧 userId 会 401）；
              // 非 JWT 令牌派生不出则清空，交由 /api/user/self 自动发现回填
              const tokenChanged = rawToken !== (current.accessToken || '');
              let nextUserId =
                body.userId !== undefined && body.userId !== MASK ? body.userId : current.userId;
              if (tokenChanged && (body.userId === undefined || body.userId === MASK)) {
                nextUserId = deriveUserIdFromAccessToken(rawToken) || '';
              }
              // API Key / 系统访问令牌（账号）/ userId 任一变更后，旧 tokenId 不再对应当前账号的令牌，
              // 清除并重置解析缓存，下次固定/取消固定时重新解析
              const credChanged =
                newApiKey !== current.apiKey ||
                tokenChanged ||
                (body.userId !== undefined && body.userId !== MASK && body.userId !== current.userId) ||
                (nextUserId || '') !== (current.userId || '');
              if (credChanged) {
                tokenResolveCache = null;
              }

              const updated: A6ApiConfig = {
                baseURL: body.baseURL !== undefined ? body.baseURL : current.baseURL,
                apiKey: newApiKey,
                accessToken: rawToken,
                userId: nextUserId,
                activeModels: Array.isArray(body.activeModels) ? body.activeModels : current.activeModels,
              };

              // Validate access token and auto-fetch balance & userId
              const balance = await fetchBalance(updated.baseURL, updated.apiKey, updated.userId, updated.accessToken);
              if (balance?.userId) {
                updated.userId = String(balance.userId);
              }

              // 凭据写入原生存储（credentials refs；空串 = 清除）；仅写有变化的字段
              const credWrites: Partial<Pick<A6ApiConfig, 'apiKey' | 'accessToken' | 'userId'>> = {};
              if (updated.apiKey !== current.apiKey) credWrites.apiKey = updated.apiKey;
              if ((updated.accessToken || '') !== (current.accessToken || '')) credWrites.accessToken = updated.accessToken;
              if ((updated.userId || '') !== (current.userId || '')) credWrites.userId = updated.userId;
              if (Object.keys(credWrites).length > 0) {
                const writeResult = await configAccess.writeConfig(credWrites);
                // 凭据落盘失败必须让用户看见：此前静默吞掉后 UI 显示「保存成功」，
                // 令牌实际丢失，账户页永远「未连接」
                if (writeResult.failures.length > 0) {
                  const detail = writeResult.failures
                    .map((f) => `${f.ref}：${f.reason}`)
                    .join('；');
                  console.error('[dsh-a6api] 凭据保存失败:', writeResult.failures);
                  return sendJson(res, 500, {
                    ok: false,
                    error: `凭据保存失败（${detail}）。已尝试自动修复权限并降级文件写入仍失败，请检查 ~/.dsh/.credentials.yaml 的权限（应为 0600）与磁盘状态后重试。`,
                  });
                }
              }

              // 同步 DSH settings（与旧行为一致：仅当有活动模型时）。
              // 注：零模型时无法持久化 baseURL——llm-pi-ai 对手写路由无合法的零模型表示
              // （models: [] 会被 assertServiceable 拒绝并毒化下次启动），a6api 块此时不存在，
              // 节点设置属惰性状态，待用户启用模型时随块一并落盘。
              if (updated.activeModels.length > 0) {
                await configAccess.syncModels(updated.baseURL, updated.activeModels);
              }
              return sendJson(res, 200, { ok: true, config: maskConfig(updated), balance });
            }

            // GET /balance
            if (pathname === '/balance' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await configAccess.readConfig();
              const token = config.accessToken || '';
              const balance = await fetchBalance(config.baseURL, config.apiKey, config.userId, token);
              const recentLogs = await fetchRecentLogs(config.userId, token, 20);
              return sendJson(res, 200, { ok: true, balance, recentLogs });
            }

            // GET /logs
            if (pathname === '/logs' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await configAccess.readConfig();
              const token = config.accessToken || '';
              const recentLogs = await fetchRecentLogs(config.userId, token, 30);
              return sendJson(res, 200, { ok: true, logs: recentLogs });
            }

            // POST /probe
            if (pathname === '/probe' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await configAccess.readConfig();
              const token = config.accessToken || '';
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
                modelIds = await configAccess.getDshConfiguredModels();
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
              await configAccess.ensureMigrated();
              const config = await configAccess.readConfig();
              const modelIds = Array.isArray(body.modelIds) ? body.modelIds : [];
              const baseURL = body.baseURL || config.baseURL;

              // 模型列表唯一真相源 = DSH settings.yaml 的 llm-pi-ai.providers.a6api.models
              await configAccess.syncModels(baseURL, modelIds);

              const dshConfiguredModels = await configAccess.getDshConfiguredModels();
              return sendJson(res, 200, { ok: true, dshConfiguredModels });
            }

            // POST /pin — 把卡片当前商家固定为该模型的服务渠道（平台侧，按 API Key 令牌绑定）
            if (pathname === '/pin' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await configAccess.readConfig();
              const modelName = String(body.modelName || '').trim();
              if (!modelName) return sendJson(res, 400, { ok: false, error: '缺少模型名称' });
              const { userId, token } = webAuthOf(config);
              if (!userId || !token) {
                return sendJson(res, 400, { ok: false, error: '需在「基础配置」填写系统访问令牌/会话后才能固定商家' });
              }
              // 固定的是卡片当前展示的商家（无商家选择器）
              let card = cachedMerchantOf(modelName);
              // token_id 解析链：配置缓存 → 令牌列表 → 探测日志（1-token）
              let tokenId = await resolveTokenId(config);
              // 卡片缺失或令牌未解析时，用一次探测同时回填两者（探测请求本身会写路由日志）
              if ((!card || !tokenId) && config.apiKey) {
                try {
                  const probe = await probeSingleModel(config.baseURL, config.apiKey, userId, token, modelName);
                  if (!tokenId && probe.tokenId && Number(probe.tokenId) > 0) tokenId = Number(probe.tokenId);
                  if (!card && probe.merchant) {
                    card = probe.merchant;
                    merchantCardCache.set(modelName.toLowerCase(), { card, at: Date.now() });
                  }
                } catch {}
              }
              if (!card) {
                return sendJson(res, 400, { ok: false, error: '该模型暂无商家数据，请先「探测商家」' });
              }
              if (!tokenId) {
                return sendJson(res, 400, { ok: false, error: '无法自动解析 API Key 对应的令牌 ID，请检查系统访问令牌是否有效，或到官网「令牌」页手动固定' });
              }
              if (!card.channel_id) {
                return sendJson(res, 400, { ok: false, error: '商家卡片缺少渠道 ID，请重新探测' });
              }
              const pinResult = await marketplacePin(userId, token, {
                token_id: tokenId,
                channel_id: card.channel_id,
                model_name: modelName,
                // 平台默认兜底：渠道异常时自动切换智能优选（不暴露 UI 开关）
                fallback_to_smart_routing: true,
              });
              if (!pinResult.ok) {
                return sendJson(res, 400, { ok: false, error: pinResult.message || '固定失败' });
              }
              // 更新内存令牌解析缓存（tokenId 为派生数据，不持久化）
              tokenResolveCache = { tokenId, at: Date.now() };
              merchantCardCache.set(modelName.toLowerCase(), {
                card: { ...card, is_pinned: true, pin_status: 'pin_here' },
                at: Date.now(),
              });
              const pinList = await fetchMarketplacePins(userId, token);
              return sendJson(res, 200, { ok: true, message: `已固定 ${modelName} 至商户 #${card.channel_id}`, pins: pinList, tokenId });
            }

            // POST /unpin — 取消该模型的固定（取消后重新探测即可路由到新商家）
            if (pathname === '/unpin' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await configAccess.readConfig();
              const modelName = String(body.modelName || '').trim();
              if (!modelName) return sendJson(res, 400, { ok: false, error: '缺少模型名称' });
              const { userId, token } = webAuthOf(config);
              if (!userId || !token) {
                return sendJson(res, 400, { ok: false, error: '需在「基础配置」填写系统访问令牌/会话后才能取消固定' });
              }
              const tokenId = await resolveTokenId(config);
              if (!tokenId) {
                return sendJson(res, 400, { ok: false, error: '无法解析 API Key 对应的令牌 ID，请检查系统访问令牌是否有效' });
              }
              const unpinResult = await marketplaceUnpin(userId, token, { token_id: tokenId, model_name: modelName });
              if (!unpinResult.ok) {
                return sendJson(res, 400, { ok: false, error: unpinResult.message || '取消固定失败' });
              }
              const card = cachedMerchantOf(modelName);
              if (card) {
                merchantCardCache.set(modelName.toLowerCase(), {
                  card: { ...card, is_pinned: false, pin_status: undefined },
                  at: Date.now(),
                });
              }
              const pinList = await fetchMarketplacePins(userId, token);
              return sendJson(res, 200, { ok: true, message: `已取消固定 ${modelName}`, pins: pinList, tokenId });
            }

            // POST /disable — 禁用卡片当前商家对该模型的服务（平台侧，按 渠道×模型）
            if (pathname === '/disable' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await configAccess.readConfig();
              const modelName = String(body.modelName || '').trim();
              if (!modelName) return sendJson(res, 400, { ok: false, error: '缺少模型名称' });
              let card = cachedMerchantOf(modelName);
              // 卡片缓存过期时用一次探测回填（与 /pin 一致，避免「按钮可用但接口 400」）
              if (!card && config.apiKey) {
                try {
                  const probe = await probeSingleModel(config.baseURL, config.apiKey, config.userId, config.accessToken || '', modelName);
                  if (probe.merchant) {
                    card = probe.merchant;
                    merchantCardCache.set(modelName.toLowerCase(), { card, at: Date.now() });
                  }
                } catch {}
              }
              if (!card || !card.channel_id) {
                return sendJson(res, 400, { ok: false, error: '该模型暂无商家数据，请先「探测商家」' });
              }
              const { userId, token } = webAuthOf(config);
              if (!userId || !token) {
                return sendJson(res, 400, { ok: false, error: '需在「基础配置」填写系统访问令牌/会话后才能禁用商家' });
              }
              const disableResult = await marketplaceDisableChannel(userId, token, card.channel_id, modelName);
              if (!disableResult.ok) {
                return sendJson(res, 400, { ok: false, error: disableResult.message || '禁用失败' });
              }
              merchantCardCache.set(modelName.toLowerCase(), {
                card: { ...card, user_channel_disabled: true },
                at: Date.now(),
              });
              return sendJson(res, 200, { ok: true, message: `已禁用商户 #${card.channel_id} 对该模型的服务` });
            }

            // POST /restore — 恢复被禁用的商家
            if (pathname === '/restore' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const config = await configAccess.readConfig();
              const modelName = String(body.modelName || '').trim();
              if (!modelName) return sendJson(res, 400, { ok: false, error: '缺少模型名称' });
              let card = cachedMerchantOf(modelName);
              if (!card && config.apiKey) {
                try {
                  const probe = await probeSingleModel(config.baseURL, config.apiKey, config.userId, config.accessToken || '', modelName);
                  if (probe.merchant) {
                    card = probe.merchant;
                    merchantCardCache.set(modelName.toLowerCase(), { card, at: Date.now() });
                  }
                } catch {}
              }
              if (!card || !card.channel_id) {
                return sendJson(res, 400, { ok: false, error: '该模型暂无商家数据，请先「探测商家」' });
              }
              const { userId, token } = webAuthOf(config);
              if (!userId || !token) {
                return sendJson(res, 400, { ok: false, error: '需在「基础配置」填写系统访问令牌/会话后才能恢复商家' });
              }
              const restoreResult = await marketplaceRestoreChannel(userId, token, card.channel_id, modelName);
              if (!restoreResult.ok) {
                return sendJson(res, 400, { ok: false, error: restoreResult.message || '恢复失败' });
              }
              merchantCardCache.set(modelName.toLowerCase(), {
                card: { ...card, user_channel_disabled: false },
                at: Date.now(),
              });
              return sendJson(res, 200, { ok: true, message: `已恢复商户 #${card.channel_id} 对该模型的服务` });
            }

            // GET /price-fluctuation — 轻量价格波动条数（待处理 n），仅回传计数
            if (pathname === '/price-fluctuation' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await configAccess.readConfig();
              const token = config.accessToken || '';
              if (!token || !config.userId) {
                return sendJson(res, 200, { ok: true, data: { pendingCount: 0, unseenCount: 0, totalCount: 0, hasAuth: false, authError: false, updatedAt: Date.now() } });
              }
              const result = await fetchPriceFluctuation(config.userId, token);
              const { notices, ...counts } = result as any;
              // 401/403 时 authError=true，客户端可区分“未配置”与“失效”
              const hasAuth = !counts.authError;
              return sendJson(res, 200, { ok: true, data: { pendingCount: counts.pendingCount, unseenCount: counts.unseenCount, totalCount: counts.totalCount, hasAuth, authError: Boolean(counts.authError), updatedAt: Date.now() } });
            }

            // GET /pins — 轻量固定记录（客户端 60s 轮询，让卡片状态跟随官网侧解除/新增固定）
            if (pathname === '/pins' && (req.method === 'GET' || req.method === 'HEAD')) {
              const config = await configAccess.readConfig();
              const { userId, token } = webAuthOf(config);
              if (!userId || !token) {
                return sendJson(res, 200, { ok: true, pins: [] });
              }
              try {
                const pins = await fetchMarketplacePins(userId, token);
                return sendJson(res, 200, { ok: true, pins });
              } catch (err: any) {
                console.warn('[dsh-a6api] GET /pins error:', err);
                return sendJson(res, 200, { ok: true, pins: [] });
              }
            }

            // GET /catalog — 模型目录全量（运行时 JSON，字段 = settings.yaml 原生模型字段 + brand）
            if (pathname === '/catalog' && (req.method === 'GET' || req.method === 'HEAD')) {
              return sendJson(res, 200, { ok: true, catalog: getCatalog() });
            }

            // POST /catalog/clear — 清空模型目录（重新拉取/填充前使用；settings.yaml 已启用条目不受影响）
            if (pathname === '/catalog/clear' && req.method === 'POST') {
              await clearCatalog();
              return sendJson(res, 200, { ok: true });
            }

            // POST /catalog/fetch-models — 从 A6API 市场翻页拉取全部模型 ID（含品牌），合并入目录。
            // 仅新增缺失条目/补品牌/补默认推理档位，不覆盖任何已存在条目的参数。
            if (pathname === '/catalog/fetch-models' && req.method === 'POST') {
              const config = await configAccess.readConfig();
              const { userId, token } = webAuthOf(config);
              let result;
              try {
                result = await fetchMarketplaceModels(userId, token);
              } catch (err: any) {
                // 未配置系统访问令牌等鉴权类错误 → 400 + 引导文案（与 /pin 风格一致）
                return sendJson(res, 400, { ok: false, error: err?.message || '获取市场模型失败' });
              }
              const models = result.models;
              const before = new Set(getCatalog().map((e) => e.id.toLowerCase()));
              let added = 0;
              for (const m of models) {
                if (!before.has(m.id.toLowerCase())) added++;
              }
              // reasoningEfforts 默认 = DSH 全部思考档位（upsert 只补缺失字段，已有自定义不受影响）
              await upsertCatalogEntries(
                models.map((m) => ({ id: m.id, brand: m.brand, reasoningEfforts: m.reasoningEfforts })),
              );
              return sendJson(res, 200, {
                ok: true,
                total: models.length,
                added,
                failedPages: result.failedPages,
              });
            }

            // POST /catalog/query-openrouter — 对全部（或指定）目录模型查 OpenRouter 并填充参数。
            // 能查到的填充 contextWindow/maxTokens/input/name；查不到的保持原字段不变。
            if (pathname === '/catalog/query-openrouter' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const catalog = getCatalog();
              const modelIds =
                Array.isArray(body.modelIds) && body.modelIds.length > 0
                  ? body.modelIds.map((s: any) => String(s))
                  : catalog.map((e) => e.id);
              if (modelIds.length === 0) {
                return sendJson(res, 400, { ok: false, error: '目录为空，请先「从 A6API 获取市场模型」' });
              }
              const result = await queryOpenRouter(modelIds);
              return sendJson(res, 200, {
                ok: true,
                updated: result.updated.length,
                notFound: result.notFound,
              });
            }

            // POST /catalog/update — 修改单个目录条目参数（name/contextWindow/maxTokens/input/reasoningEfforts）。
            // 若该模型已在 DSH 启用，立即重写 settings.yaml 对应条目使参数即时生效。
            if (pathname === '/catalog/update' && req.method === 'POST') {
              const body = await parseJsonBody(req);
              const id = String(body.id || '').trim();
              if (!id) return sendJson(res, 400, { ok: false, error: '缺少模型 ID' });
              const patch: Record<string, any> = {};
              // null = 删除该字段（清空语义）；undefined = 不修改
              if (body.name !== undefined) {
                if (body.name === null) {
                  patch.name = null;
                } else if (typeof body.name !== 'string') {
                  return sendJson(res, 400, { ok: false, error: 'name 必须是字符串' });
                } else {
                  const name = body.name.trim();
                  patch.name = name || null;
                }
              }
              for (const key of ['contextWindow', 'maxTokens'] as const) {
                if (body[key] === null) {
                  patch[key] = null;
                } else if (body[key] !== undefined) {
                  const n = Number(body[key]);
                  if (!Number.isInteger(n) || n < 1) {
                    return sendJson(res, 400, { ok: false, error: `${key} 必须是正整数` });
                  }
                  patch[key] = n;
                }
              }
              if (body.input !== undefined) {
                if (body.input === null) {
                  patch.input = null;
                } else if (!Array.isArray(body.input)) {
                  return sendJson(res, 400, { ok: false, error: 'input 必须是数组' });
                } else {
                  const mods = body.input.filter((m: any) => m === 'text' || m === 'image');
                  // 空数组 = 清空该字段（null 语义删除）
                  patch.input = mods.length > 0 ? mods : null;
                }
              }
              if (body.reasoningEfforts !== undefined) {
                if (body.reasoningEfforts === null) {
                  patch.reasoningEfforts = null; // 删除该字段
                } else {
                  // DSH 语义严格校验：键 ∈ THINKING_LEVELS、值非空（仅 off 可 null）、非空字典、至少一个非 off 档位
                  const v = validateReasoningEfforts(body.reasoningEfforts);
                  if (!v.ok) return sendJson(res, 400, { ok: false, error: v.error });
                  patch.reasoningEfforts = v.value;
                }
              }
              const entry = await updateCatalogEntry(id, patch);
              if (!entry) return sendJson(res, 404, { ok: false, error: '目录中不存在该模型' });

              // 已启用模型：立即重写 settings.yaml 对应条目（参数即时生效，单一数据流：目录 → settings.yaml）
              try {
                const config = await configAccess.readConfig();
                const dshModels = await configAccess.getDshConfiguredModels();
                if (dshModels.some((m) => m.toLowerCase() === entry.id.toLowerCase()) && config.activeModels.length > 0) {
                  await configAccess.syncModels(config.baseURL, config.activeModels);
                }
              } catch (err: any) {
                console.warn('[dsh-a6api] catalog update: resync settings failed:', err?.message || err);
              }
              return sendJson(res, 200, { ok: true, entry });
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
