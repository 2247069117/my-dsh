const CACHE_KEY = 'dsh-chat-tidy:cache';
const MAX_LOCAL_ENTRIES = 500;

class ClientCache {
  private memCache = new Map<string, string>();
  private dirty = false;
  private saveTimer: number | null = null;

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
          for (const [k, v] of Object.entries(obj)) {
            if (typeof v === 'string') {
              this.memCache.set(k, v);
            }
          }
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  get(text: string): string | undefined {
    const key = text.trim().toLowerCase();
    return this.memCache.get(key);
  }

  set(text: string, translated: string): void {
    const key = text.trim().toLowerCase();
    if (this.memCache.has(key)) {
      this.memCache.delete(key);
    } else if (this.memCache.size >= MAX_LOCAL_ENTRIES) {
      const oldest = this.memCache.keys().next().value;
      if (oldest !== undefined) {
        this.memCache.delete(oldest);
      }
    }
    this.memCache.set(key, translated);
    this.dirty = true;
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimer !== null || typeof window === 'undefined') return;
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      if (this.dirty) {
        this.dirty = false;
        try {
          const obj: Record<string, string> = {};
          for (const [k, v] of this.memCache.entries()) {
            obj[k] = v;
          }
          localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
        } catch {
          // Ignore quota error
        }
      }
    }, 2000);
  }
}

export const clientCache = new ClientCache();
