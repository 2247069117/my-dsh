import { cleanBaseUrl, fetchChannelDetails, fetchRecentLogs } from './a6api-client.js';
import type { MerchantChannelInfo } from '../types.js';

export interface ProbeResult {
  modelName: string;
  success: boolean;
  channelId?: number;
  channelName?: string;
  merchant?: MerchantChannelInfo | null;
  error?: string;
  durationMs?: number;
}

/** Delay helper */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Probe a single model by sending a 1-token prompt and querying logs */
export async function probeSingleModel(
  baseURL: string,
  apiKey: string,
  userId?: string,
  accessToken?: string,
  modelName?: string,
): Promise<ProbeResult> {
  const targetModel = modelName || '';
  const cleanUrl = cleanBaseUrl(baseURL);
  if (!apiKey) {
    return { modelName: targetModel, success: false, error: '未配置 API Key' };
  }

  const startTime = Date.now();
  let requestOk = false;
  let requestError = '';

  try {
    const res = await fetch(`${cleanUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: '1' }],
        max_tokens: 1,
      }),
      // 推理模型(如 grok-4.6)实测单次响应可达 40s+,15s 超时会被频繁掐断导致探测失败
      signal: AbortSignal.timeout(90000),
    });

    if (res.ok) {
      requestOk = true;
    } else {
      const errText = await res.text();
      requestError = `HTTP ${res.status}: ${errText.slice(0, 150)}`;
    }
  } catch (err: any) {
    requestError = err?.message || String(err);
  }

  const durationMs = Date.now() - startTime;

  // Query logs if the request was successful and user auth is configured
  if (requestOk && (userId || accessToken)) {
    // Wait slightly for gateway log writing (慢模型请求期间日志已落盘,快模型需要等待)
    await sleep(1200);
    try {
      const logs = await fetchRecentLogs(userId, accessToken, 15);
      const minTimestamp = Math.floor(startTime / 1000) - 10;
      // Find recent log entry for this model
      const log =
        logs.find(
          (it) =>
            it.model_name?.toLowerCase() === targetModel.toLowerCase() &&
            Number(it.created_at || 0) >= minTimestamp,
        ) || logs.find((it) => it.model_name?.toLowerCase() === targetModel.toLowerCase());

      if (log && log.channel) {
        const channelId = Number(log.channel);
        let logSnapshot: any = null;
        if (log.other) {
          try {
            logSnapshot = { ...JSON.parse(log.other), channel_name: log.channel_name, model_name: log.model_name };
          } catch {}
        }
        const merchant = await fetchChannelDetails(channelId, userId, accessToken, targetModel, logSnapshot);
        return {
          modelName: targetModel,
          success: true,
          channelId,
          channelName: log.channel_name,
          merchant,
          durationMs,
        };
      }
    } catch (err: any) {
      console.warn(`[dsh-a6api] Log lookup error for ${targetModel}:`, err);
    }
  }

  return {
    modelName: targetModel,
    success: requestOk,
    durationMs,
    error: requestOk ? undefined : requestError,
  };
}

/** Pre-populate merchant cards from recent logs without triggering live probe */
export async function getKnownMerchantsFromLogs(
  userId?: string,
  accessToken?: string,
  modelNames: string[] = [],
): Promise<Record<string, MerchantChannelInfo>> {
  if ((!userId && !accessToken) || modelNames.length === 0) return {};

  const result: Record<string, MerchantChannelInfo> = {};
  try {
    const logs = await fetchRecentLogs(userId, accessToken, 50);
    const modelToLog = new Map<string, any>();

    for (const log of logs) {
      const mName = log.model_name;
      const chId = Number(log.channel);
      if (mName && chId && !modelToLog.has(mName.toLowerCase())) {
        modelToLog.set(mName.toLowerCase(), log);
      }
    }

    const matchedEntries: { modelName: string; log: any }[] = [];
    for (const name of modelNames) {
      const log = modelToLog.get(name.toLowerCase());
      if (log) {
        matchedEntries.push({ modelName: name, log });
      }
    }

    // Fetch details with concurrency limit 4
    for (let i = 0; i < matchedEntries.length; i += 4) {
      const batch = matchedEntries.slice(i, i + 4);
      await Promise.all(
        batch.map(async ({ modelName, log }) => {
          try {
            const channelId = Number(log.channel);
            let logSnapshot: any = null;
            if (log.other) {
              try {
                logSnapshot = { ...JSON.parse(log.other), channel_name: log.channel_name, model_name: log.model_name };
              } catch {}
            }
            const card = await fetchChannelDetails(channelId, userId, accessToken, modelName, logSnapshot);
            if (card) {
              result[modelName] = card;
            }
          } catch {
            // ignore
          }
        }),
      );
    }
  } catch (err) {
    console.warn('[dsh-a6api] getKnownMerchantsFromLogs error:', err);
  }

  return result;
}
