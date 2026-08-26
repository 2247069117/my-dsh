import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import type { PluginConfig, MaskedPluginConfig } from './types.ts';

/** All known channel ids, in the order the dispatcher tries them by default. */
const KNOWN_CHANNELS = ['bing'];

/** Hard cap for the translation concurrency pool (Bing tolerates >> this). */
export const MAX_CONCURRENCY = 100;

const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  concurrency: 3,
  timeoutMs: 2000,
  channels: [...KNOWN_CHANNELS],
  targetLang: 'zh-Hans',
};

export class ConfigManager {
  private config: PluginConfig = { ...DEFAULT_CONFIG };
  private configPath: string;
  private listeners = new Set<(config: PluginConfig) => void>();

  constructor() {
    const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.configPath = path.join(dshHome, 'dsh-chat-tidy-config.json');
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

    if (!this.config.targetLang || typeof this.config.targetLang !== 'string') {
      this.config.targetLang = DEFAULT_CONFIG.targetLang;
    }

    // Drop retired channels
    const retired = new Set(['google', 'gateway', 'builtin', 'mymemory', 'siliconflow', 'zhipu']);
    const merged = Array.isArray(this.config.channels)
      ? this.config.channels.filter((ch) => typeof ch === 'string' && !retired.has(ch))
      : [];
    for (const ch of KNOWN_CHANNELS) {
      if (!merged.includes(ch)) merged.push(ch);
    }
    this.config.channels = merged;
  }

  getConfig(): PluginConfig {
    return { ...this.config, channels: [...this.config.channels] };
  }

  getMaskedConfig(): MaskedPluginConfig {
    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      channels: [...this.config.channels],
      targetLang: this.config.targetLang || 'zh-Hans',
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
        console.warn('[dsh-chat-tidy] Config listener error:', err);
      }
    }
  }

  async updateConfig(partial: Partial<PluginConfig>): Promise<PluginConfig> {
    const next: PluginConfig = {
      ...this.config,
      ...partial,
    };

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

    if (typeof partial.enabled === 'boolean') {
      next.enabled = partial.enabled;
    }

    if (typeof partial.targetLang === 'string' && partial.targetLang.trim()) {
      next.targetLang = partial.targetLang.trim();
    }

    if (Array.isArray(partial.channels)) {
      next.channels = partial.channels.filter((ch): ch is string => typeof ch === 'string');
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
      console.warn('[dsh-chat-tidy] Failed to save config file atomically:', err);
      try {
        await fs.unlink(tmpPath);
      } catch {}
    }
  }
}
