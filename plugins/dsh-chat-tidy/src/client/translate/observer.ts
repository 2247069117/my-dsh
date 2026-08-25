import { clientCache } from './client-cache.ts';
import { lazyQueue } from './lazy.ts';

const CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5]/;

export class ChatTranslateObserver {
  private observer: MutationObserver | null = null;
  private rootElement: HTMLElement | null = null;
  private isEnabled = true;

  constructor() {
    this.handleMutations = this.handleMutations.bind(this);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.disconnect();
    } else {
      this.start();
    }
  }

  start(documentRef: Document = document): () => void {
    if (!this.isEnabled || typeof window === 'undefined') {
      return () => {};
    }

    const findAndObserveRoot = () => {
      const root =
        documentRef.querySelector<HTMLElement>('[data-chat-flow]') ??
        documentRef.querySelector<HTMLElement>('[data-conversation-scroll]') ??
        documentRef.body;

      if (!root) {
        window.setTimeout(findAndObserveRoot, 200);
        return;
      }

      this.rootElement = root;

      // 1. Initial scan of existing tool elements
      this.scanContainer(root);

      // 2. Setup MutationObserver for new nodes & attribute changes
      if (!this.observer) {
        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-state', 'data-tool'],
        });
      }
    };

    findAndObserveRoot();

    return () => {
      this.disconnect();
    };
  }

  private handleMutations(mutations: MutationRecord[]): void {
    if (!this.isEnabled) return;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node instanceof HTMLElement) {
            this.scanNode(node);
          }
        }
      } else if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (target instanceof HTMLElement) {
          // React might have updated the tool state (running -> done)
          this.scanNode(target);
        }
      }
    }
  }

  private scanContainer(container: HTMLElement): void {
    const spans = container.querySelectorAll<HTMLElement>(
      '[data-tool] [data-disclosure-row] > span:not([aria-hidden])'
    );
    spans.forEach((span) => this.processSpan(span));
  }

  private scanNode(node: HTMLElement): void {
    // If the node itself is a tool title span
    if (
      node.tagName === 'SPAN' &&
      !node.hasAttribute('aria-hidden') &&
      node.closest('[data-disclosure-row]') &&
      node.closest('[data-tool]')
    ) {
      this.processSpan(node);
      return;
    }

    // If the node contains tool cards or rows
    const spans = node.querySelectorAll<HTMLElement>(
      '[data-tool] [data-disclosure-row] > span:not([aria-hidden])'
    );
    spans.forEach((span) => this.processSpan(span));
  }

  private processSpan(span: HTMLElement): void {
    const text = span.textContent?.trim() || '';
    if (!text) return;

    // Check if it's already in Chinese or has Chinese characters
    if (CHINESE_CHAR_REGEX.test(text)) {
      span.dataset.tidyTranslated = 'true';
      return;
    }

    // Check if already translated to this exact translation
    if (span.dataset.tidyTranslated === 'true') {
      const original = span.dataset.original;
      if (original) {
        const cached = clientCache.get(original);
        if (cached && text === cached) {
          return; // Already has translated text
        }
      }
    }

    // Check fast client cache
    const cached = clientCache.get(text);
    if (cached) {
      span.dataset.tidyTranslated = 'true';
      span.dataset.original = text;
      span.textContent = cached;
      return;
    }

    // Send to viewport lazy queue
    lazyQueue.observe(span, text);
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    lazyQueue.disconnect();
    this.rootElement = null;
  }
}

export const chatTranslateObserver = new ChatTranslateObserver();
