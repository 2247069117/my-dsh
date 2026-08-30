import type {
  A6ApiConfig,
  A6ApiStateResponse,
  BalanceInfo,
  ModelCardData,
  ApiRoutingLogItem,
  PriceFluctuationState,
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
  priceFluctuation: PriceFluctuationState;
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
    priceFluctuation: { pendingCount: 0, unseenCount: 0, totalCount: 0, updatedAt: null } as any,
  };

  private listeners: Set<Listener> = new Set();
  private autoRefreshTimer: any = null;
  private pricePollTimer: any = null;

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
          // 若已配 token，顺带刷新价格波动（防重复：10s 内已拉过则跳过）
          if (this.state.config?.hasToken) {
            const last = (this.state.priceFluctuation as any)?.updatedAt;
            if (!last || Date.now() - last > 10000) {
              this.fetchPriceFluctuation().catch(() => {});
            }
          }
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

  public async fetchPriceFluctuation(): Promise<void> {
    try {
      const res = await fetch('/api/dsh-a6api/price-fluctuation');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const d = json.data;
          const hasAuth = d.hasAuth !== false && !d.authError;
          // 服务端已区分“未配置/失效”与“有待处理 0”，客户端尊重 hasAuth
          if (!hasAuth) {
            // 失效或未配置时，显示 -- 而非 0（由 UI 层判断），但仍更新时间避免频繁重试
            const next = { pendingCount: 0, unseenCount: 0, totalCount: 0, updatedAt: Date.now(), hasAuth: false, authError: Boolean(d.authError) } as any;
            if (JSON.stringify(next) !== JSON.stringify(this.state.priceFluctuation)) {
              this.state.priceFluctuation = next;
              this.notify();
            }
            return;
          }
          const pending = Number(d.pendingCount ?? 0);
          const unseen = Number(d.unseenCount ?? 0);
          const total = Number(d.totalCount ?? 0);
          const next = { pendingCount: pending, unseenCount: unseen, totalCount: total, updatedAt: Date.now(), hasAuth: true, authError: false } as any;
          if (pending !== (this.state.priceFluctuation as any).pendingCount || unseen !== (this.state.priceFluctuation as any).unseenCount || (this.state.priceFluctuation as any).hasAuth === false || (this.state.priceFluctuation as any).updatedAt === null) {
            this.state.priceFluctuation = next;
            this.notify();
          } else if ((this.state.priceFluctuation as any).updatedAt === null) {
            this.state.priceFluctuation = next;
            this.notify();
          }
        }
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
                  merchant: undefined,
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
                  probeError: json?.result?.success
                    ? '探测成功,但未捕获商户信息(需配置系统访问令牌)'
                    : undefined,
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
                merchant: undefined,
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
              merchant: undefined,
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
    // 推理模型单次探测可达 40s+,按 3 并发批次探测,避免全量串行等待过久
    const CONCURRENCY = 3;
    for (let i = 0; i < allNames.length; i += CONCURRENCY) {
      await Promise.all(allNames.slice(i, i + CONCURRENCY).map((n) => this.probeModel(n)));
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
    // 价格波动轻量轮询 60s（与余额同频，便于及时变红）
    if (this.pricePollTimer) clearInterval(this.pricePollTimer);
    this.pricePollTimer = setInterval(() => {
      if (this.state.config?.hasToken) {
        this.fetchPriceFluctuation().catch(() => {});
      }
    }, 60 * 1000);
  }

  public stopAutoRefresh() {
    if (this.autoRefreshTimer) { clearInterval(this.autoRefreshTimer); this.autoRefreshTimer = null; }
    if (this.pricePollTimer) { clearInterval(this.pricePollTimer); this.pricePollTimer = null; }
  }

  public initPricePolling() {
    if (this.pricePollTimer) return;
    this.startAutoRefresh();
    if (this.state.config?.hasToken) {
      this.fetchPriceFluctuation().catch(() => {});
    }
  }
}

export const store = new A6ApiStore();
