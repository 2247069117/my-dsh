import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

export class LruDiskCache {
  private cache = new Map<string, string>();
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
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === 'string') {
            this.cache.set(k, v);
          }
        }
      }
    } catch {
      // Ignore missing or corrupt cache file
    }
  }

  get(key: string): string | undefined {
    const val = this.cache.get(key);
    if (val !== undefined) {
      // Refresh key in LRU order
      this.cache.delete(key);
      this.cache.set(key, val);
      return val;
    }
    return undefined;
  }

  set(key: string, value: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
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
    try {
      const obj: Record<string, string> = {};
      for (const [k, v] of this.cache.entries()) {
        obj[k] = v;
      }
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[dsh-chat-tidy] Failed to write cache file:', err);
    }
  }
}
