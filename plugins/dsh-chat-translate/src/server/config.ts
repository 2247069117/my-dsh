import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import type { PluginConfig, MaskedPluginConfig } from './types.ts';
import { CredentialsReader, TRANSLATE_API_KEY_REF } from './credentials.ts';

/** Hard cap for the translation concurrency pool. */
export const MAX_CONCURRENCY = 100;

/** Bounds for the AI channel request timeout. */
export const AI_TIMEOUT_MIN = 500;
export const AI_TIMEOUT_MAX = 120000;

const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  concurrency: 3,
  timeoutMs: 2000,
  aiTimeoutMs: 30000,
  aiEnabled: true,
  bingEnabled: true,
  baseUrl: '',
  model: '',
  targetLang: 'zh-Hans',
};

export class ConfigManager {
  private config: PluginConfig = { ...DEFAULT_CONFIG };
  private configPath: string;
  private credentials: CredentialsReader;
  private listeners = new Set<(config: PluginConfig) => void>();

  constructor(credentials?: CredentialsReader) {
    this.credentials = credentials ?? new CredentialsReader();
    const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.configPath = path.join(dshHome, 'dsh-chat-translate-config.json');
  }

  async init(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.config = {
        ...DEFAULT_CONFIG,
        ...parsed,
      };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }

    // Sanitize values
    if (!Number.isFinite(this.config.concurrency) || this.config.concurrency < 1) {
      this.config.concurrency = DEFAULT_CONFIG.concurrency;
    } else {
      this.config.concurrency = Math.min(Math.max(Math.round(this.config.concurrency), 1), MAX_CONCURRENCY);
    }

    if (!Number.isFinite(this.config.timeoutMs) || this.config.timeoutMs < 500) {
      this.config.timeoutMs = DEFAULT_CONFIG.timeoutMs;
    } else {
      this.config.timeoutMs = Math.min(Math.max(Math.round(this.config.timeoutMs), 500), 10000);
    }

    if (!Number.isFinite(this.config.aiTimeoutMs) || this.config.aiTimeoutMs < AI_TIMEOUT_MIN) {
      this.config.aiTimeoutMs = DEFAULT_CONFIG.aiTimeoutMs;
    } else {
      this.config.aiTimeoutMs = Math.min(
        Math.max(Math.round(this.config.aiTimeoutMs), AI_TIMEOUT_MIN),
        AI_TIMEOUT_MAX
      );
    }

    if (typeof this.config.enabled !== 'boolean') this.config.enabled = DEFAULT_CONFIG.enabled;
    if (typeof this.config.aiEnabled !== 'boolean') this.config.aiEnabled = DEFAULT_CONFIG.aiEnabled;
    if (typeof this.config.bingEnabled !== 'boolean') this.config.bingEnabled = DEFAULT_CONFIG.bingEnabled;
    if (typeof this.config.baseUrl !== 'string') this.config.baseUrl = DEFAULT_CONFIG.baseUrl;
    if (typeof this.config.model !== 'string') this.config.model = DEFAULT_CONFIG.model;
    if (!this.config.targetLang || typeof this.config.targetLang !== 'string') {
      this.config.targetLang = DEFAULT_CONFIG.targetLang;
    }

    // Drop the retired `channels` field carried over from pre-1.1 configs so
    // it is not re-persisted on the next save.
    delete (this.config as Partial<PluginConfig> & { channels?: unknown }).channels;
  }

  getConfig(): PluginConfig {
    return { ...this.config };
  }

  /** Whether the AI channel has every required piece: baseUrl, model and key. */
  isAiConfigured(): boolean {
    return Boolean(
      this.config.baseUrl.trim() &&
        this.config.model.trim() &&
        this.credentials.getApiKey()
    );
  }

  getMaskedConfig(): MaskedPluginConfig {
    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      aiTimeoutMs: this.config.aiTimeoutMs,
      aiEnabled: this.config.aiEnabled,
      bingEnabled: this.config.bingEnabled,
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      targetLang: this.config.targetLang || 'zh-Hans',
      aiConfigured: this.isAiConfigured(),
    };
  }

  onConfigChange(listener: (config: PluginConfig) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const snapshot = this.getConfig();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn('[dsh-chat-translate] Config listener error:', err);
      }
    }
  }

  async updateConfig(partial: Partial<PluginConfig>): Promise<PluginConfig> {
    const next: PluginConfig = {
      ...this.config,
      ...partial,
    };
    // Never let retired/unknown keys (e.g. the pre-1.1 `channels`) be
    // re-persisted through an update path.
    delete (next as Partial<PluginConfig> & { channels?: unknown }).channels;

    // Bounds check with Number.isFinite
    if (typeof partial.concurrency === 'number' && Number.isFinite(partial.concurrency)) {
      next.concurrency = Math.min(Math.max(Math.round(partial.concurrency), 1), MAX_CONCURRENCY);
    } else {
      next.concurrency = this.config.concurrency;
    }

    if (typeof partial.timeoutMs === 'number' && Number.isFinite(partial.timeoutMs)) {
      next.timeoutMs = Math.min(Math.max(Math.round(partial.timeoutMs), 500), 10000);
    } else {
      next.timeoutMs = this.config.timeoutMs;
    }

    if (typeof partial.aiTimeoutMs === 'number' && Number.isFinite(partial.aiTimeoutMs)) {
      next.aiTimeoutMs = Math.min(
        Math.max(Math.round(partial.aiTimeoutMs), AI_TIMEOUT_MIN),
        AI_TIMEOUT_MAX
      );
    } else {
      next.aiTimeoutMs = this.config.aiTimeoutMs;
    }

    if (typeof partial.enabled === 'boolean') next.enabled = partial.enabled;
    if (typeof partial.aiEnabled === 'boolean') next.aiEnabled = partial.aiEnabled;
    if (typeof partial.bingEnabled === 'boolean') next.bingEnabled = partial.bingEnabled;
    if (typeof partial.baseUrl === 'string') next.baseUrl = partial.baseUrl.trim();
    if (typeof partial.model === 'string') next.model = partial.model.trim();
    if (typeof partial.targetLang === 'string' && partial.targetLang.trim()) {
      next.targetLang = partial.targetLang.trim();
    }

    this.config = next;
    await this.save();
    this.notifyListeners();
    return this.getConfig();
  }

  private async save(): Promise<void> {
    const tmpPath = `${this.configPath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(tmpPath, JSON.stringify(this.config, null, 2), 'utf-8');
      await fs.rename(tmpPath, this.configPath);
    } catch (err) {
      console.warn('[dsh-chat-translate] Failed to save config file atomically:', err);
      try {
        await fs.unlink(tmpPath);
      } catch {}
    }
  }
}

export { TRANSLATE_API_KEY_REF };
