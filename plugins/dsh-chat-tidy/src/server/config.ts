import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import type { PluginConfig, MaskedPluginConfig } from './types.ts';

/** All known channel ids, in the order the dispatcher tries them by default. */
const KNOWN_CHANNELS = ['siliconflow', 'zhipu', 'bing'];

const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  concurrency: 3,
  timeoutMs: 2000,
  channels: [...KNOWN_CHANNELS],
  siliconflowKey: '',
  zhipuKey: '',
};

export class ConfigManager {
  private config: PluginConfig = { ...DEFAULT_CONFIG };
  private configPath: string;

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
    // Drop channels that no longer exist ('google' gtx channel and the
    // 'gateway' DeepLX channel were retired), then merge in any adapter
    // channels the config predates, so a persisted order from an older
    // release keeps working with new channels.
    const retired = new Set(['google', 'gateway', 'builtin', 'mymemory']);
    const merged = this.config.channels.filter((ch) => !retired.has(ch));
    for (const ch of KNOWN_CHANNELS) {
      if (!merged.includes(ch)) merged.push(ch);
    }
    this.config.channels = merged;
  }

  getConfig(): PluginConfig {
    return { ...this.config };
  }

  getMaskedConfig(): MaskedPluginConfig {
    const maskKey = (k?: string) => {
      if (!k || k.length < 8) return k ? '********' : '';
      return `${k.slice(0, 3)}****${k.slice(-4)}`;
    };

    return {
      enabled: this.config.enabled,
      concurrency: this.config.concurrency,
      timeoutMs: this.config.timeoutMs,
      channels: [...this.config.channels],
      siliconflowKeyMasked: maskKey(this.config.siliconflowKey),
      zhipuKeyMasked: maskKey(this.config.zhipuKey),
      hasSiliconflowKey: !!(this.config.siliconflowKey && this.config.siliconflowKey.trim().length > 0),
      hasZhipuKey: !!(this.config.zhipuKey && this.config.zhipuKey.trim().length > 0),
    };
  }

  async updateConfig(partial: Partial<PluginConfig>): Promise<PluginConfig> {
    // If empty key passed or key not changed, handle carefully
    const next: PluginConfig = {
      ...this.config,
      ...partial,
    };

    // Bounds check
    if (typeof next.concurrency === 'number') {
      next.concurrency = Math.min(Math.max(Math.round(next.concurrency), 1), 6);
    }
    if (typeof next.timeoutMs === 'number') {
      next.timeoutMs = Math.min(Math.max(Math.round(next.timeoutMs), 500), 10000);
    }

    this.config = next;
    await this.save();
    return this.getConfig();
  }

  private async save(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[dsh-chat-tidy] Failed to save config file:', err);
    }
  }
}