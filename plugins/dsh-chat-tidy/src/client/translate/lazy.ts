import { clientCache } from './client-cache.ts';
import { requestTranslateBatch } from './api.ts';
import { NonDestructiveTranslationMount } from './mount.ts';
import { StreamDebounceViewportObserver } from './viewport-observer.ts';

type TranslateTask = {
  element: HTMLElement;
  text: string;
  isThink?: boolean;
};

class LazyTranslationQueue {
  private enabled = true;
  private viewportObserver: StreamDebounceViewportObserver;

  constructor() {
    this.viewportObserver = new StreamDebounceViewportObserver({
      rootMargin: '150px 0px',
      debounceMs: 400,
      onVisibleBatch: (items) => this.handleVisibleBatch(items),
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.viewportObserver.disconnect();
    }
  }

  observe(element: HTMLElement, text: string, immediate = false, isThink = false): void {
    if (!this.enabled || !element.isConnected) return;

    // 1. If cached, apply immediately non-destructively
    const cached = clientCache.get(text);
    if (cached) {
      this.applyTranslation(element, cached, text, isThink);
      return;
    }

    // 2. Delegate to streaming-debounced viewport observer
    this.viewportObserver.observeWithDebounce(element, text, immediate, isThink);
  }

  private async handleVisibleBatch(items: TranslateTask[]): Promise<void> {
    if (!this.enabled || items.length === 0) return;

    // Group elements by text to deduplicate API requests
    const textMap = new Map<string, Array<{ element: HTMLElement; isThink?: boolean }>>();
    for (const item of items) {
      if (!item.element.isConnected) continue;

      const cached = clientCache.get(item.text);
      if (cached) {
        this.applyTranslation(item.element, cached, item.text, item.isThink);
        continue;
      }

      const list = textMap.get(item.text) || [];
      list.push({ element: item.element, isThink: item.isThink });
      textMap.set(item.text, list);
    }

    const uniqueTexts = Array.from(textMap.keys());
    if (uniqueTexts.length === 0) return;

    const results = await requestTranslateBatch(uniqueTexts);

    for (const res of results) {
      if (res.translated && res.translated.trim()) {
        clientCache.set(res.original, res.translated);
        const entries = textMap.get(res.original) || [];
        for (const entry of entries) {
          if (entry.element.isConnected && this.enabled) {
            this.applyTranslation(entry.element, res.translated, res.original, entry.isThink);
          }
        }
      }
    }
  }

  private applyTranslation(element: HTMLElement, translated: string, original: string, isThink?: boolean): void {
    if (!element.isConnected || !this.enabled) return;
    NonDestructiveTranslationMount.mount(element, translated, {
      originalText: original,
      isThink: isThink || element.dataset.tidyThink === 'true',
    });
  }

  disconnect(): void {
    this.viewportObserver.disconnect();
  }
}

export const lazyQueue = new LazyTranslationQueue();
