import { fetchServerConfig, updateServerConfig, testServerChannel, saveCredentials } from '../translate/api.ts';
import { chatTranslateObserver } from '../translate/observer.ts';

export interface ClientSettingsState {
  enabled: boolean;
  concurrency: number;
  aiEnabled: boolean;
  bingEnabled: boolean;
  baseUrl: string;
  model: string;
  aiConfigured: boolean;
}

const LS_PREFIX = 'dsh-chat-tidy:';
export const LS_ENABLED = `${LS_PREFIX}enabled`;
export const LS_CONCURRENCY = `${LS_PREFIX}concurrency`;
export const LS_AI_ENABLED = `${LS_PREFIX}aiEnabled`;
export const LS_BING_ENABLED = `${LS_PREFIX}bingEnabled`;
export const LS_BASE_URL = `${LS_PREFIX}baseUrl`;
export const LS_MODEL = `${LS_PREFIX}model`;

const DEFAULT_STATE: ClientSettingsState = {
  enabled: true,
  concurrency: 3,
  aiEnabled: true,
  bingEnabled: true,
  baseUrl: '',
  model: '',
  aiConfigured: false,
};

class SettingsStore {
  private state: ClientSettingsState = { ...DEFAULT_STATE };

  private listeners = new Set<() => void>();
  private storageListener: ((e: StorageEvent) => void) | null = null;
  private pushTimer: number | null = null;
  private pushSeq = 0;
  private userTouched = false;

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
      const aiRaw = localStorage.getItem(LS_AI_ENABLED);
      if (aiRaw !== null) {
        this.state.aiEnabled = aiRaw === 'true';
      }
      const bingRaw = localStorage.getItem(LS_BING_ENABLED);
      if (bingRaw !== null) {
        this.state.bingEnabled = bingRaw === 'true';
      }
      const baseUrlRaw = localStorage.getItem(LS_BASE_URL);
      if (baseUrlRaw !== null) {
        this.state.baseUrl = baseUrlRaw;
      }
      const modelRaw = localStorage.getItem(LS_MODEL);
      if (modelRaw !== null) {
        this.state.model = modelRaw;
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
      } else if (e.key === LS_AI_ENABLED && e.newValue !== null) {
        const val = e.newValue === 'true';
        if (this.state.aiEnabled !== val) {
          this.state.aiEnabled = val;
          changed = true;
        }
      } else if (e.key === LS_BING_ENABLED && e.newValue !== null) {
        const val = e.newValue === 'true';
        if (this.state.bingEnabled !== val) {
          this.state.bingEnabled = val;
          changed = true;
        }
      } else if (e.key === LS_BASE_URL && e.newValue !== null && this.state.baseUrl !== e.newValue) {
        this.state.baseUrl = e.newValue;
        changed = true;
      } else if (e.key === LS_MODEL && e.newValue !== null && this.state.model !== e.newValue) {
        this.state.model = e.newValue;
        changed = true;
      }
      if (changed) {
        this.notify();
        this.schedulePush();
      }
    };
    window.addEventListener('storage', this.storageListener);
  }

  private async syncFromServer(): Promise<void> {
    try {
      const config = await fetchServerConfig();
      if (config) {
        // If the user already edited something before the first server
        // snapshot arrived, keep their values — otherwise the echo would
        // overwrite the edit and (since no push is queued for it) it would be
        // lost forever. aiConfigured is a server-derived status, always safe.
        const touched = this.userTouched;
        this.state = {
          enabled: !touched && typeof config.enabled === 'boolean' ? config.enabled : this.state.enabled,
          concurrency:
            !touched && typeof config.concurrency === 'number' && Number.isFinite(config.concurrency)
              ? config.concurrency
              : this.state.concurrency,
          aiEnabled: !touched && typeof config.aiEnabled === 'boolean' ? config.aiEnabled : this.state.aiEnabled,
          bingEnabled: !touched && typeof config.bingEnabled === 'boolean' ? config.bingEnabled : this.state.bingEnabled,
          baseUrl: !touched && typeof config.baseUrl === 'string' ? config.baseUrl : this.state.baseUrl,
          model: !touched && typeof config.model === 'string' ? config.model : this.state.model,
          aiConfigured: typeof config.aiConfigured === 'boolean' ? config.aiConfigured : this.state.aiConfigured,
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

  /**
   * Debounced server push: fast typing in the baseUrl/model/concurrency inputs
   * collapses into a single POST (300ms trailing). A monotonic sequence number
   * ensures an out-of-order older response never overwrites newer state.
   */
  private schedulePush(): void {
    if (this.pushTimer !== null || typeof window === 'undefined') return;
    this.pushTimer = window.setTimeout(() => {
      this.pushTimer = null;
      this.pushToServer();
    }, 300);
  }

  private async pushToServer(): Promise<void> {
    const seq = ++this.pushSeq;
    const sent = {
      enabled: this.state.enabled,
      concurrency: this.state.concurrency,
      aiEnabled: this.state.aiEnabled,
      bingEnabled: this.state.bingEnabled,
      baseUrl: this.state.baseUrl,
      model: this.state.model,
    };
    try {
      const updated = await updateServerConfig(sent);
      if (!updated || seq !== this.pushSeq) return; // superseded by a newer push
      // Per-field echo guard: only write back fields the user has NOT edited
      // since this request was sent. Otherwise a slow response could clobber a
      // newer local edit (a later push is already queued with the new value).
      this.state = {
        ...this.state,
        enabled:
          this.state.enabled === sent.enabled && typeof updated.enabled === 'boolean'
            ? updated.enabled
            : this.state.enabled,
        concurrency:
          this.state.concurrency === sent.concurrency && typeof updated.concurrency === 'number'
            ? updated.concurrency
            : this.state.concurrency,
        aiEnabled:
          this.state.aiEnabled === sent.aiEnabled && typeof updated.aiEnabled === 'boolean'
            ? updated.aiEnabled
            : this.state.aiEnabled,
        bingEnabled:
          this.state.bingEnabled === sent.bingEnabled && typeof updated.bingEnabled === 'boolean'
            ? updated.bingEnabled
            : this.state.bingEnabled,
        baseUrl:
          this.state.baseUrl === sent.baseUrl && typeof updated.baseUrl === 'string'
            ? updated.baseUrl
            : this.state.baseUrl,
        model:
          this.state.model === sent.model && typeof updated.model === 'string'
            ? updated.model
            : this.state.model,
        aiConfigured: typeof updated.aiConfigured === 'boolean' ? updated.aiConfigured : this.state.aiConfigured,
      };
      this.notify();
    } catch {
      // Host route may be unavailable — keep local state.
    }
  }

  async update(partial: Partial<ClientSettingsState>): Promise<void> {
    this.userTouched = true;
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
    if (typeof partial.aiEnabled === 'boolean') {
      try {
        localStorage.setItem(LS_AI_ENABLED, String(partial.aiEnabled));
      } catch {}
    }
    if (typeof partial.bingEnabled === 'boolean') {
      try {
        localStorage.setItem(LS_BING_ENABLED, String(partial.bingEnabled));
      } catch {}
    }
    if (typeof partial.baseUrl === 'string') {
      try {
        localStorage.setItem(LS_BASE_URL, partial.baseUrl);
      } catch {}
    }
    if (typeof partial.model === 'string') {
      try {
        localStorage.setItem(LS_MODEL, partial.model);
      } catch {}
    }

    this.notify();
    this.schedulePush();
  }

  async testChannel(channel: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    return testServerChannel(channel);
  }

  /** Persist the API key via the host and refresh the server-derived status. */
  async saveApiKey(apiKey: string): Promise<{ ok: boolean; error?: string }> {
    const res = await saveCredentials(apiKey);
    if (res.ok) {
      await this.syncFromServer();
    }
    return { ok: Boolean(res.ok), error: res.error };
  }

  /** Re-pull the server config (e.g. after the API key changed). */
  async refreshFromServer(): Promise<void> {
    await this.syncFromServer();
  }

  dispose(): void {
    if (this.pushTimer !== null && typeof window !== 'undefined') {
      clearTimeout(this.pushTimer);
      this.pushTimer = null;
    }
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    this.listeners.clear();
  }
}

export const settingsStore = new SettingsStore();
