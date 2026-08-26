import { fetchServerConfig, updateServerConfig, testServerChannel } from '../translate/api.ts';
import { chatTranslateObserver } from '../translate/observer.ts';

export interface ClientSettingsState {
  enabled: boolean;
  concurrency: number;
}

const LS_PREFIX = 'dsh-chat-tidy:';
export const LS_ENABLED = `${LS_PREFIX}enabled`;
export const LS_CONCURRENCY = `${LS_PREFIX}concurrency`;

class SettingsStore {
  private state: ClientSettingsState = {
    enabled: true,
    concurrency: 3,
  };

  private listeners = new Set<() => void>();
  private storageListener: ((e: StorageEvent) => void) | null = null;

  constructor() {
    this.loadFromLocalStorage();
    this.initStorageListener();
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
        if (Number.isFinite(c) && c >= 1 && c <= 100) {
          this.state.concurrency = c;
        }
      }
    } catch {
      // Ignore storage access errors
    }
    try {
      chatTranslateObserver.setEnabled(this.state.enabled);
    } catch {}
  }

  private initStorageListener(): void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    this.storageListener = (e: StorageEvent) => {
      if (!e.key || !e.key.startsWith(LS_PREFIX)) return;
      let changed = false;
      if (e.key === LS_ENABLED && e.newValue !== null) {
        const val = e.newValue === 'true';
        if (this.state.enabled !== val) {
          this.state.enabled = val;
          chatTranslateObserver.setEnabled(val);
          changed = true;
        }
      } else if (e.key === LS_CONCURRENCY && e.newValue !== null) {
        const c = parseInt(e.newValue, 10);
        if (Number.isFinite(c) && c >= 1 && c <= 100 && this.state.concurrency !== c) {
          this.state.concurrency = c;
          changed = true;
        }
      }
      if (changed) {
        this.notify();
      }
    };
    window.addEventListener('storage', this.storageListener);
  }

  private async syncFromServer(): Promise<void> {
    try {
      const config = await fetchServerConfig();
      if (config) {
        const newEnabled = typeof config.enabled === 'boolean' ? config.enabled : this.state.enabled;
        const newConcurrency =
          typeof config.concurrency === 'number' && Number.isFinite(config.concurrency)
            ? config.concurrency
            : this.state.concurrency;

        this.state = {
          ...this.state,
          enabled: newEnabled,
          concurrency: newConcurrency,
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
    let sanitizedConcurrency = this.state.concurrency;
    if (typeof partial.concurrency === 'number') {
      if (Number.isFinite(partial.concurrency)) {
        sanitizedConcurrency = Math.min(Math.max(Math.round(partial.concurrency), 1), 100);
      }
    }

    this.state = {
      ...this.state,
      ...partial,
      concurrency: sanitizedConcurrency,
    };

    if (typeof partial.enabled === 'boolean') {
      try {
        localStorage.setItem(LS_ENABLED, String(partial.enabled));
      } catch {}
      chatTranslateObserver.setEnabled(partial.enabled);
    }

    if (typeof partial.concurrency === 'number' && Number.isFinite(partial.concurrency)) {
      try {
        localStorage.setItem(LS_CONCURRENCY, String(sanitizedConcurrency));
      } catch {}
    }

    this.notify();

    // Sync to host
    const updated = await updateServerConfig({
      enabled: this.state.enabled,
      concurrency: this.state.concurrency,
    });
    if (updated) {
      this.state.enabled = updated.enabled ?? this.state.enabled;
      this.state.concurrency = updated.concurrency ?? this.state.concurrency;
      this.notify();
    }
  }

  async testChannel(channel: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    return testServerChannel(channel);
  }

  dispose(): void {
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    this.listeners.clear();
  }
}

export const settingsStore = new SettingsStore();
