import { clientCache } from './client-cache.ts';
import { lazyQueue } from './lazy.ts';

const CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5]/;

const TOOL_TITLE_SELECTOR = [
  '[data-chat-call-id] [class*="summary"]',
  '[data-slot="tool.call.toolview"] [class*="summary"]',
  '[data-sample] [class*="summary"]',
  '[data-variant] [class*="summary"]',
  '[data-tool] [data-disclosure-row] > span:not([aria-hidden])',
  '[data-disclosure-row] [class*="summary"]',
].join(', ');

function isToolSummarySpan(span: HTMLElement): boolean {
  if (span.hasAttribute('aria-hidden')) return false;
  // Never touch tool-name badges / icons / leading elements — only the
  // description summary line (e.g. `.CY-8Ka_summary`) is translated.
  const cls = span.className || '';
  if (/title|leading|icon|badge|chevron/i.test(cls)) return false;
  // Exclude think / reasoning blocks
  if (span.closest('[data-variant="think"], [data-sample="think"], [class*="_reasoning_"], [data-slot="conversation.reasoning"], .QWLzlG_row')) {
    return false;
  }
  if (span.parentElement && span.parentElement.textContent?.includes('Think')) {
    return false;
  }
  
  // Must belong to tool call
  if (span.closest('[data-chat-call-id], [data-slot="tool.call.toolview"], [data-sample], [data-variant], [data-tool]')) {
    return true;
  }
  return false;
}

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
          attributeFilter: ['data-state', 'data-tool', 'data-variant', 'data-sample', 'aria-expanded'],
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
          // React state change or accordion expansion
          this.scanNode(target);
        }
      }
    }
  }

  private scanContainer(container: HTMLElement): void {
    const spans = container.querySelectorAll<HTMLElement>(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span)) {
        this.processSpan(span);
      }
    });
  }

  private scanNode(node: HTMLElement): void {
    if (node.tagName === 'SPAN' && isToolSummarySpan(node)) {
      this.processSpan(node);
      return;
    }

    const spans = node.querySelectorAll<HTMLElement>(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span)) {
        this.processSpan(span);
      }
    });
  }

  private processSpan(span: HTMLElement): void {
    const text = span.textContent?.trim() || '';
    if (!text) return;

    // Check if already in Chinese
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
          return;
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
