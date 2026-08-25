import { fetchServerConfig, updateServerConfig, testServerChannel } from '../translate/api.ts';
import { chatTranslateObserver } from '../translate/observer.ts';

export interface ClientSettingsState {
  enabled: boolean;
  concurrency: number;
  channels: string[];
  siliconflowKey: string;
  zhipuKey: string;
  hasSiliconflowKey: boolean;
  hasZhipuKey: boolean;
  gatewayUrl: string;
  gatewayEngine: 'bing' | 'google';
  hasGatewayUrl: boolean;
}

const LS_PREFIX = 'dsh-chat-tidy:';
const LS_ENABLED = `${LS_PREFIX}enabled`;
const LS_CONCURRENCY = `${LS_PREFIX}concurrency`;
const LS_CHANNELS = `${LS_PREFIX}channels`;
const LS_GATEWAY_URL = `${LS_PREFIX}gateway-url`;
const LS_GATEWAY_ENGINE = `${LS_PREFIX}gateway-engine`;

export const CHANNEL_NAMES: Record<string, string> = {
  siliconflow: '硅基流动 (Qwen2.5-7B)',
  zhipu: '智谱 AI (glm-4-flash)',
  bing: '微软 Bing 网页翻译 (免Key直连)',
  gateway: '本地翻译网关 (DeepLX 兼容)',
  mymemory: 'MyMemory 免费机器翻译 (免Key)',
  builtin: '离线技术词典 (0ms兜底)',
};

export const ALL_CHANNELS = ['siliconflow', 'zhipu', 'bing', 'gateway', 'mymemory', 'builtin'];

class SettingsStore {
  private state: ClientSettingsState = {
    enabled: true,
    concurrency: 3,
    channels: [...ALL_CHANNELS],
    siliconflowKey: '',
    zhipuKey: '',
    hasSiliconflowKey: false,
    hasZhipuKey: false,
    gatewayUrl: '',
    gatewayEngine: 'bing',
    hasGatewayUrl: false,
  };

  private listeners = new Set<() => void>();

  constructor() {
    this.loadFromLocalStorage();
    this.syncFromServer();
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const enabledRaw = localStorage.getItem(LS_ENABLED);
      if (enabledRaw !== null) {
        this.state.enabled = enabledRaw === 'true';
      }
      const concurrencyRaw = localStorage.getItem(LS_CONCURRENCY);
      if (concurrencyRaw !== null) {
        const c = parseInt(concurrencyRaw, 10);
        if (!isNaN(c) && c >= 1 && c <= 6) {
          this.state.concurrency = c;
        }
      }
      const channelsRaw = localStorage.getItem(LS_CHANNELS);
      if (channelsRaw !== null) {
        const arr = JSON.parse(channelsRaw);
        if (Array.isArray(arr) && arr.length > 0) {
          // Migrate the retired 'google' channel id to the local gateway.
          const migrated = arr.map((x: string) => (x === 'google' ? 'gateway' : x));
          const filtered = migrated.filter((x: string) => ALL_CHANNELS.includes(x));
          // Merge in channels added by newer releases.
          for (const ch of ALL_CHANNELS) {
            if (!filtered.includes(ch)) filtered.push(ch);
          }
          this.state.channels = filtered;
        }
      }
      const gatewayUrlRaw = localStorage.getItem(LS_GATEWAY_URL);
      if (gatewayUrlRaw !== null) {
        this.state.gatewayUrl = gatewayUrlRaw;
        this.state.hasGatewayUrl = gatewayUrlRaw.trim().length > 0;
      }
      const gatewayEngineRaw = localStorage.getItem(LS_GATEWAY_ENGINE);
      if (gatewayEngineRaw === 'google' || gatewayEngineRaw === 'bing') {
        this.state.gatewayEngine = gatewayEngineRaw;
      }
    } catch {
      // Ignore
    }
  }

  private async syncFromServer(): Promise<void> {
    const config = await fetchServerConfig();
    if (config) {
      this.state = {
        ...this.state,
        enabled: config.enabled ?? this.state.enabled,
        concurrency: config.concurrency ?? this.state.concurrency,
        channels: config.channels ?? this.state.channels,
        hasSiliconflowKey: !!config.hasSiliconflowKey,
        hasZhipuKey: !!config.hasZhipuKey,
        hasGatewayUrl: !!config.hasGatewayUrl,
      };
      if (typeof config.gatewayEngine === 'string' && (config.gatewayEngine === 'bing' || config.gatewayEngine === 'google')) {
        this.state.gatewayEngine = config.gatewayEngine;
      }
      chatTranslateObserver.setEnabled(this.state.enabled);
      this.notify();
    }
  }

  getState(): ClientSettingsState {
    return { ...this.state };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {}
    });
  }

  async update(partial: Partial<ClientSettingsState>): Promise<void> {
    this.state = {
      ...this.state,
      ...partial,
    };

    if (typeof partial.enabled === 'boolean') {
      try {
        localStorage.setItem(LS_ENABLED, String(partial.enabled));
      } catch {}
      chatTranslateObserver.setEnabled(partial.enabled);
    }

    if (typeof partial.concurrency === 'number') {
      try {
        localStorage.setItem(LS_CONCURRENCY, String(partial.concurrency));
      } catch {}
    }

    if (Array.isArray(partial.channels)) {
      try {
        localStorage.setItem(LS_CHANNELS, JSON.stringify(partial.channels));
      } catch {}
    }

    if (typeof partial.gatewayUrl === 'string') {
      try {
        localStorage.setItem(LS_GATEWAY_URL, partial.gatewayUrl);
      } catch {}
      this.state.hasGatewayUrl = partial.gatewayUrl.trim().length > 0;
    }

    if (partial.gatewayEngine === 'bing' || partial.gatewayEngine === 'google') {
      try {
        localStorage.setItem(LS_GATEWAY_ENGINE, partial.gatewayEngine);
      } catch {}
    }

    this.notify();

    // Sync to host
    const serverPayload: any = {
      enabled: this.state.enabled,
      concurrency: this.state.concurrency,
      channels: this.state.channels,
      gatewayUrl: this.state.gatewayUrl,
      gatewayEngine: this.state.gatewayEngine,
    };
    if (typeof partial.siliconflowKey === 'string') {
      serverPayload.siliconflowKey = partial.siliconflowKey;
    }
    if (typeof partial.zhipuKey === 'string') {
      serverPayload.zhipuKey = partial.zhipuKey;
    }

    const updated = await updateServerConfig(serverPayload);
    if (updated) {
      this.state.hasSiliconflowKey = !!updated.hasSiliconflowKey;
      this.state.hasZhipuKey = !!updated.hasZhipuKey;
      this.state.hasGatewayUrl = !!updated.hasGatewayUrl;
      this.notify();
    }
  }

  async testChannel(channel: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    return testServerChannel(channel);
  }
}

export const settingsStore = new SettingsStore();