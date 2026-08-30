import type {
  A6ApiConfig,
  A6ApiStateResponse,
  BalanceInfo,
  ModelCardData,
  ApiRoutingLogItem,
} from '../types.js';

export interface StoreState {
  loading: boolean;
  config: A6ApiConfig;
  balance: BalanceInfo | null;
  models: ModelCardData[];
  dshConfiguredModels: string[];
  recentLogs: ApiRoutingLogItem[];
  probingModelNames: Set<string>;
  error: string | null;
}

type Listener = () => void;

class A6ApiStore {
  private state: StoreState = {
    loading: true,
    config: {
      baseURL: 'https://api.a6api.com',
      apiKey: '',
      userId: '',
      activeModels: [],
    },
    balance: null,
    models: [],
    dshConfiguredModels: [],
    recentLogs: [],
    probingModelNames: new Set(),
    error: null,
  };

  private listeners: Set<Listener> = new Set();
  private autoRefreshTimer: any = null;

  constructor() {
    this.startAutoRefresh();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) {
      try {
        l();
      } catch (err) {
        console.error('[dsh-a6api] listener error:', err);
      }
    }
  }

  public getState(): StoreState {
    return this.state;
  }

  public async fetchState(): Promise<void> {
    this.state.loading = true;
    this.notify();
    try {
      const res = await fetch('/api/dsh-a6api/state');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const data: A6ApiStateResponse = json.data;
          this.state.config = data.config;
          this.state.balance = data.balance;
          this.state.models = data.models;
          this.state.dshConfiguredModels = data.dshConfiguredModels;
          if (data.recentLogs) {
            this.state.recentLogs = data.recentLogs;
          }
          this.state.error = null;
        }
      }
    } catch (err: any) {
      this.state.error = err?.message || String(err);
    } finally {
      this.state.loading = false;
      this.notify();
    }
  }

  public async saveConfig(config: Partial<A6ApiConfig>): Promise<boolean> {
    try {
      const res = await fetch('/api/dsh-a6api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        await this.fetchState();
        return true;
      }
    } catch (err: any) {
      this.state.error = err?.message || String(err);
      this.notify();
    }
    return false;
  }

  public async refreshBalance(): Promise<void> {
    try {
      const res = await fetch('/api/dsh-a6api/balance');
      if (res.ok) {
        const json = await res.json();
        if (json?.balance) {
          this.state.balance = json.balance;
        }
        if (json?.recentLogs) {
          this.state.recentLogs = json.recentLogs;
        }
        this.notify();
      }
    } catch {}
  }

  public async probeModel(modelName: string): Promise<void> {
    this.state.probingModelNames.add(modelName);
    this.state.models = this.state.models.map((m) =>
      m.model_name === modelName ? { ...m, probeStatus: 'probing' as const } : m,
    );
    this.notify();

    try {
      const res = await fetch('/api/dsh-a6api/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.result?.merchant) {
          this.state.models = this.state.models.map((m) =>
            m.model_name === modelName
              ? {
                  ...m,
                  merchant: json.result.merchant,
                  probeStatus: 'success' as const,
                  probeLatencyMs: json.result.durationMs,
                  probeError: undefined,
                  lastProbedAt: Date.now(),
                }
              : m,
          );
        } else if (json?.result?.error) {
          this.state.models = this.state.models.map((m) =>
            m.model_name === modelName
              ? {
                  ...m,
                  probeStatus: 'error' as const,
                  probeError: json.result.error,
                  lastProbedAt: Date.now(),
                }
              : m,
          );
        } else {
          this.state.models = this.state.models.map((m) =>
            m.model_name === modelName
              ? {
                  ...m,
                  probeStatus: json?.result?.success ? ('success' as const) : ('idle' as const),
                  probeLatencyMs: json?.result?.durationMs,
                  probeError: undefined,
                  lastProbedAt: Date.now(),
                }
              : m,
          );
        }
      } else {
        this.state.models = this.state.models.map((m) =>
          m.model_name === modelName
            ? {
                ...m,
                probeStatus: 'error' as const,
                probeError: `HTTP ${res.status}`,
                lastProbedAt: Date.now(),
              }
            : m,
        );
      }
    } catch (err: any) {
      this.state.models = this.state.models.map((m) =>
        m.model_name === modelName
          ? {
              ...m,
              probeStatus: 'error' as const,
              probeError: err?.message || String(err),
              lastProbedAt: Date.now(),
            }
          : m,
      );
    } finally {
      this.state.probingModelNames.delete(modelName);
      this.notify();
      this.refreshBalance().catch(() => {});
    }
  }

  public async probeAll(): Promise<void> {
    const allNames = this.state.models.map((m) => m.model_name);
    for (const name of allNames) {
      await this.probeModel(name);
    }
  }

  public async toggleDshModel(modelName: string): Promise<void> {
    const currentSet = new Set(this.state.dshConfiguredModels);
    if (currentSet.has(modelName)) {
      currentSet.delete(modelName);
    } else {
      currentSet.add(modelName);
    }
    const newModels = [...currentSet];
    try {
      const res = await fetch('/api/dsh-a6api/sync-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelIds: newModels }),
      });
      if (res.ok) {
        const json = await res.json();
        this.state.dshConfiguredModels = json.dshConfiguredModels || newModels;
        const dshSet = new Set(this.state.dshConfiguredModels);
        this.state.models = this.state.models.map((m) => ({
          ...m,
          inDsh: dshSet.has(m.model_name),
        }));
        this.notify();
      }
    } catch (err: any) {
      this.state.error = err?.message || String(err);
      this.notify();
    }
  }

  private startAutoRefresh() {
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
    // Refresh balance every 60 seconds
    this.autoRefreshTimer = setInterval(() => {
      this.refreshBalance().catch(() => {});
    }, 60000);
  }
}

export const store = new A6ApiStore();
