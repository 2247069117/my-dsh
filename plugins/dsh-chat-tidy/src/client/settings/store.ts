import { fetchServerConfig, updateServerConfig, testServerChannel } from '../translate/api.ts';
import { chatTranslateObserver } from '../translate/observer.ts';

export interface ClientSettingsState {
  enabled: boolean;
  concurrency: number;
  translateThinking: boolean;
}

const LS_PREFIX = 'dsh-chat-tidy:';
const LS_ENABLED = `${LS_PREFIX}enabled`;
const LS_CONCURRENCY = `${LS_PREFIX}concurrency`;
const LS_TRANSLATE_THINKING = `${LS_PREFIX}translate-thinking`;

class SettingsStore {
  private state: ClientSettingsState = {
    enabled: true,
    concurrency: 3,
    translateThinking: false,
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
        if (!isNaN(c) && c >= 1 && c <= 100) {
          this.state.concurrency = c;
        }
      }
      const thinkRaw = localStorage.getItem(LS_TRANSLATE_THINKING);
      if (thinkRaw !== null) {
        this.state.translateThinking = thinkRaw === 'true';
      }
    } catch {
      // Ignore
    }
  }

  private async syncFromServer(): Promise<void> {
    try {
      const config = await fetchServerConfig();
      if (config) {
        this.state = {
          ...this.state,
          enabled: config.enabled ?? this.state.enabled,
          concurrency: config.concurrency ?? this.state.concurrency,
        };
        chatTranslateObserver.setEnabled(this.state.enabled);
        this.notify();
      }
    } catch {
      // Host route may be unavailable during early boot — keep local defaults.
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

    if (typeof partial.translateThinking === 'boolean') {
      try {
        localStorage.setItem(LS_TRANSLATE_THINKING, String(partial.translateThinking));
      } catch {}
      chatTranslateObserver.setTranslateThinking(partial.translateThinking);
    }

    this.notify();

    // Sync to host
    const updated = await updateServerConfig({
      enabled: this.state.enabled,
      concurrency: this.state.concurrency,
      translateThinking: this.state.translateThinking,
    });
    if (updated) {
      this.state.enabled = updated.enabled ?? this.state.enabled;
      this.state.concurrency = updated.concurrency ?? this.state.concurrency;
      this.state.translateThinking = updated.translateThinking ?? this.state.translateThinking;
      this.notify();
    }
  }

  async testChannel(channel: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    return testServerChannel(channel);
  }
}

export const settingsStore = new SettingsStore();