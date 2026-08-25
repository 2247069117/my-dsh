import type { ITranslationAdapter, PluginConfig, TranslateItemResult } from './types.ts';
import type { ConfigManager } from './config.ts';
import { MAX_CONCURRENCY } from './config.ts';
import type { LruDiskCache } from './cache.ts';
import { BingWebAdapter } from './adapters/bing.ts';

const CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5]/;

interface CircuitState {
  failureCount: number;
  openUntil: number;
}

export class TranslationDispatcher {
  private configManager: ConfigManager;
  private cache: LruDiskCache;
  private adapters = new Map<string, ITranslationAdapter>();
  private circuitStates = new Map<string, CircuitState>();
  private inFlightMap = new Map<string, Promise<TranslateItemResult>>();
  private activeCount = 0;
  private queue: Array<() => void> = [];

  constructor(configManager: ConfigManager, cache: LruDiskCache) {
    this.configManager = configManager;
    this.cache = cache;
    this.registerAdapter(new BingWebAdapter());
  }

  private registerAdapter(adapter: ITranslationAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  async translateBatch(
    texts: string[],
    forceRefresh = false
  ): Promise<TranslateItemResult[]> {
    return Promise.all(texts.map((t) => this.translateOne(t, forceRefresh)));
  }

  async translateOne(
    rawText: string,
    forceRefresh = false
  ): Promise<TranslateItemResult> {
    const text = rawText.trim();
    if (!text) {
      return { original: rawText, translated: rawText, channel: 'none', cached: true };
    }

    // If text already contains Chinese characters, return as-is
    if (CHINESE_CHAR_REGEX.test(text)) {
      return { original: rawText, translated: rawText, channel: 'none', cached: true };
    }

    const config = this.configManager.getConfig();
    if (!config.enabled) {
      return { original: rawText, translated: rawText, channel: 'disabled', cached: true };
    }

    const cacheKey = text.toLowerCase();

    // 1. Check L1/L2 Cache
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { original: rawText, translated: cached, channel: 'cache', cached: true };
      }
    }

    // 2. In-flight Promise deduplication
    const inFlight = this.inFlightMap.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Queue task with concurrency limit
    const taskPromise = this.enqueueTask(async () => {
      const currentConfig = this.configManager.getConfig();
      const channels = currentConfig.channels || ['bing'];

      for (const chId of channels) {
        const adapter = this.adapters.get(chId);
        if (!adapter || !adapter.isAvailable(currentConfig) || this.isCircuitOpen(chId)) {
          continue;
        }

        try {
          const timeout = currentConfig.timeoutMs || 2000;
          const abortCtrl = new AbortController();
          const timer = setTimeout(() => abortCtrl.abort(), timeout);

          let translatedText = '';
          try {
            translatedText = await adapter.translate(text, abortCtrl.signal, currentConfig);
          } finally {
            clearTimeout(timer);
          }

          const cleaned = translatedText?.trim();
          if (cleaned && cleaned.length > 0) {
            this.recordSuccess(chId);
            this.cache.set(cacheKey, cleaned);
            return {
              original: rawText,
              translated: cleaned,
              channel: chId,
              cached: false,
            };
          }
        } catch (err: any) {
          this.recordFailure(chId);
          console.warn(
            `[dsh-chat-tidy] channel ${chId} failed: ${err?.message || String(err)} | text: ${text.slice(0, 60)}`
          );
          // Continue to next channel
        }
      }

      return { original: rawText, translated: rawText, channel: 'fallback', cached: false };
    });

    this.inFlightMap.set(cacheKey, taskPromise);
    try {
      return await taskPromise;
    } finally {
      this.inFlightMap.delete(cacheKey);
    }
  }

  async testChannel(channelId: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const adapter = this.adapters.get(channelId);
    const config = this.configManager.getConfig();
    if (!adapter) {
      return { ok: false, latencyMs: 0, error: `Channel ${channelId} not found` };
    }
    if (!adapter.isAvailable(config)) {
      return { ok: false, latencyMs: 0, error: `Channel ${channelId} API key is not configured` };
    }

    const testText = 'List files in current directory';
    const start = Date.now();
    try {
      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), 4000);
      let res = '';
      try {
        res = await adapter.translate(testText, abortCtrl.signal, config);
      } finally {
        clearTimeout(timer);
      }

      const latencyMs = Date.now() - start;
      if (res && res.trim()) {
        return { ok: true, latencyMs };
      }
      return { ok: false, latencyMs, error: 'Empty translation returned' };
    } catch (err: any) {
      return { ok: false, latencyMs: Date.now() - start, error: err?.message || String(err) };
    }
  }

  private enqueueTask<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const exec = async () => {
        this.activeCount++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.activeCount--;
          this.processNext();
        }
      };

      const maxConcurrency = Math.min(
        Math.max(this.configManager.getConfig().concurrency || 3, 1),
        MAX_CONCURRENCY
      );

      if (this.activeCount < maxConcurrency) {
        exec();
      } else {
        this.queue.push(exec);
      }
    });
  }

  private processNext(): void {
    const maxConcurrency = Math.min(
      Math.max(this.configManager.getConfig().concurrency || 3, 1),
      MAX_CONCURRENCY
    );

    while (this.queue.length > 0 && this.activeCount < maxConcurrency) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  private isCircuitOpen(channelId: string): boolean {
    const state = this.circuitStates.get(channelId);
    if (!state) return false;
    if (state.openUntil > Date.now()) {
      return true;
    }
    // Half-open / reset
    state.openUntil = 0;
    return false;
  }

  private recordSuccess(channelId: string): void {
    const state = this.circuitStates.get(channelId);
    if (state) {
      state.failureCount = 0;
      state.openUntil = 0;
    }
  }

  private recordFailure(channelId: string): void {
    let state = this.circuitStates.get(channelId);
    if (!state) {
      state = { failureCount: 0, openUntil: 0 };
      this.circuitStates.set(channelId, state);
    }
    state.failureCount++;
    if (state.failureCount >= 3) {
      state.openUntil = Date.now() + 30000; // Open circuit for 30 seconds
    }
  }
}
