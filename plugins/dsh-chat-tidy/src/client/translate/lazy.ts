import { clientCache } from './client-cache.ts';
import { requestTranslateBatch } from './api.ts';

type TranslateTask = {
  element: HTMLElement;
  text: string;
};

class LazyTranslationQueue {
  private batchQueue: TranslateTask[] = [];
  private debounceTimer: number | null = null;

  observe(element: HTMLElement, text: string): void {
    // 1. If cached, apply immediately
    const cached = clientCache.get(text);
    if (cached) {
      this.applyTranslation(element, cached, text);
      return;
    }

    // 2. Enqueue into debounced batch
    this.enqueueBatch(element, text);
  }

  private enqueueBatch(element: HTMLElement, text: string): void {
    this.batchQueue.push({ element, text });
    if (this.debounceTimer === null) {
      this.debounceTimer = window.setTimeout(() => {
        this.debounceTimer = null;
        this.flushBatch();
      }, 80);
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];

    // Group elements by text to avoid redundant API calls
    const textMap = new Map<string, HTMLElement[]>();
    for (const item of currentBatch) {
      if (!item.element.isConnected) continue;

      const cached = clientCache.get(item.text);
      if (cached) {
        this.applyTranslation(item.element, cached, item.text);
        continue;
      }

      const list = textMap.get(item.text) || [];
      list.push(item.element);
      textMap.set(item.text, list);
    }

    const uniqueTexts = Array.from(textMap.keys());
    if (uniqueTexts.length === 0) return;

    const results = await requestTranslateBatch(uniqueTexts);

    for (const res of results) {
      if (res.translated && res.translated.trim()) {
        clientCache.set(res.original, res.translated);
        const elements = textMap.get(res.original) || [];
        for (const el of elements) {
          if (el.isConnected) {
            this.applyTranslation(el, res.translated, res.original);
          }
        }
      }
    }
  }

  private applyTranslation(element: HTMLElement, translated: string, original: string): void {
    if (!element.isConnected) return;
    element.dataset.tidyTranslated = 'true';
    element.dataset.original = original;
    element.textContent = translated;
  }

  disconnect(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.batchQueue = [];
  }
}

export const lazyQueue = new LazyTranslationQueue();
