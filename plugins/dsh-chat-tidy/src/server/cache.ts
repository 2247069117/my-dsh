import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

/** Entries older than this are treated as expired. */
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  t: number; // epoch ms; 0 = legacy entry without timestamp (never expires on its own)
  v: string;
}

export class LruDiskCache {
  private cache = new Map<string, CacheEntry>();
  private maxEntries: number;
  private filePath: string;
  private saveTimer: NodeJS.Timeout | null = null;
  private dirty = false;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
    const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.filePath = path.join(dshHome, 'dsh-chat-tidy-cache.json');
  }

  async init(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      const obj = JSON.parse(content);
      if (obj && typeof obj === 'object') {
        for (const [k, raw] of Object.entries(obj)) {
          if (typeof raw === 'string') {
            // Legacy entry from an older release — keep it, no known timestamp.
            this.cache.set(k, { t: 0, v: raw });
          } else if (raw && typeof raw === 'object' && typeof (raw as CacheEntry).v === 'string') {
            const entry = raw as CacheEntry;
            if (typeof entry.t === 'number' && Number.isFinite(entry.t)) {
              this.cache.set(k, entry);
            }
          }
        }
      }
    } catch {
      // Ignore missing or corrupt cache file
    }
  }

  get(key: string): string | undefined {
    const entry = this.cache.get(key);
    if (entry === undefined) return undefined;
    if (entry.t > 0 && Date.now() - entry.t > TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }
    // Refresh key in LRU order (re-insert at the end)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.v;
  }

  set(key: string, value: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Remove least recently used entry (first in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { t: Date.now(), v: value });
    this.dirty = true;
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      if (this.dirty) {
        this.dirty = false;
        this.flush().catch((err) => {
          console.warn('[dsh-chat-tidy] Failed to flush cache to disk:', err);
        });
      }
    }, 5000);
  }

  async flush(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.dirty = false;

    const tmpPath = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    try {
      const obj: Record<string, CacheEntry> = {};
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
      }
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(tmpPath, JSON.stringify(obj, null, 2), 'utf-8');
      await fs.rename(tmpPath, this.filePath);
    } catch (err) {
      console.warn('[dsh-chat-tidy] Failed to write cache file atomically:', err);
      try {
        await fs.unlink(tmpPath);
      } catch {}
    }
  }

  async dispose(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.dirty) {
      await this.flush();
    }
  }
}
