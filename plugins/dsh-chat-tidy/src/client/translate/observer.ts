import { clientCache } from './client-cache.ts';
import { lazyQueue } from './lazy.ts';
import { NonDestructiveTranslationMount } from './mount.ts';

const TOOL_TITLE_SELECTOR = '[class*="summary"]';

/**
 * Current-session scroll container (the conversation layout re-renders this
 * whole subtree when the active session changes), falling back to the chat
 * flow. Both are emitted by the DSH web UI.
 */
const SESSION_ROOT_SELECTOR = '[data-conversation-scroll], [data-chat-flow]';

/** How often (ms) we re-check that the observed root is still the live one. */
const ROOT_CHECK_INTERVAL_MS = 3000;

function isToolSummarySpan(span: HTMLElement): boolean {
  if (!span || span.nodeType !== 1) return false;
  if (span.hasAttribute('aria-hidden')) return false;

  // Never match parent rows or containers that contain title, leading icon, chevron or nested summary
  if (span.querySelector?.('[class*="title"], [class*="leading"], [class*="chevron"], [class*="sep"], [class*="summary"]')) {
    return false;
  }

  const cls = span.className || '';
  if (/title|leading|icon|badge|chevron|separator|sep\b|row\b|root\b|card\b/i.test(cls)) return false;

  // Never translate fold toggle ("展开"/"收起") or Think card's own title badge ("Think"/"思考")
  const rawToggle = (span.textContent || '').trim();
  if (
    rawToggle.length <= 12 &&
    /^(展开|收起|展开全部|收起全部|Expand|Collapse|Show more|Show less|Think|思考)$/i.test(rawToggle)
  ) {
    return false;
  }
  if (rawToggle === 'Think' || rawToggle === '思考') return false;
  if (
    span.closest('button, [role="button"]') &&
    rawToggle.length <= 12 &&
    /展开|收起|Expand|Collapse|Think|思考/i.test(rawToggle)
  ) {
    return false;
  }

  // Must belong to tool call or think block card
  if (
    span.closest(
      '[data-chat-call-id], [data-slot="tool.call.toolview"], [data-sample], [data-variant], [data-tool], [data-disclosure-row]'
    )
  ) {
    return true;
  }
  return false;
}

export class ChatTranslateObserver {
  private observer: MutationObserver | null = null;
  private rootElement: HTMLElement | null = null;
  private rootCheckTimer: number | null = null;
  private isEnabled = true;

  constructor() {
    this.handleMutations = this.handleMutations.bind(this);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      lazyQueue.setEnabled(true);
      this.start();
    } else {
      this.restoreOriginals();
      this.disconnect();
      lazyQueue.setEnabled(false);
    }
  }

  private restoreOriginals(): void {
    const scope = this.rootElement ?? document;
    const spans = scope.querySelectorAll<HTMLElement>('[data-tidy-translated="true"]');
    for (const span of spans) {
      NonDestructiveTranslationMount.unmount(span);
    }
  }

  /**
   * The active session's scroll container. Only the currently-viewed session
   * is translated; switching sessions replaces this subtree and the observer
   * naturally follows the new content.
   */
  private isVisible(el: HTMLElement): boolean {
    if (el.hasAttribute('hidden')) return false;
    if (el.style.display === 'none') return false;
    try {
      return el.getClientRects().length > 0;
    } catch {
      return true;
    }
  }

  private findRoot(documentRef: Document): HTMLElement {
    if (!documentRef.body) {
      return documentRef.documentElement;
    }
    const candidates = documentRef.querySelectorAll<HTMLElement>(SESSION_ROOT_SELECTOR);
    for (const el of candidates) {
      if (this.isVisible(el)) {
        return el;
      }
    }
    return documentRef.body;
  }

  start(documentRef: Document = document): () => void {
    if (!this.isEnabled || typeof window === 'undefined') {
      return () => {};
    }

    const findAndObserveRoot = () => {
      const root = this.findRoot(documentRef);

      this.rootElement = root;

      // 1. Initial scan of existing tool elements
      this.scanContainer(root);

      // 2. Setup MutationObserver
      if (!this.observer) {
        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
          attributeFilter: ['data-state', 'data-tool', 'data-variant', 'data-sample', 'aria-expanded'],
        });
      }
    };

    findAndObserveRoot();

    // Defense: if the observed root is detached or hidden (e.g. the user
    // switched to another view), re-probe for the live session container.
    this.scheduleRootCheck();

    return () => {
      this.disconnect();
    };
  }

  private scheduleRootCheck(): void {
    if (this.rootCheckTimer !== null || typeof window === 'undefined') return;
    this.rootCheckTimer = window.setInterval(() => {
      if (this.rootElement && this.rootElement.isConnected && this.isVisible(this.rootElement)) {
        return;
      }
      this.restart();
    }, ROOT_CHECK_INTERVAL_MS);
  }

  private restart(): void {
    if (typeof window === 'undefined') return;
    const wasEnabled = this.isEnabled;
    this.disconnect();
    if (wasEnabled) {
      this.start();
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    if (!this.isEnabled) return;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node instanceof HTMLElement) {
            if (
              node.classList?.contains('dsh-tidy-translated-block') ||
              node.classList?.contains('dsh-tidy-original-hidden') ||
              node.classList?.contains('dsh-tidy-original-shown')
            ) {
              continue;
            }
            this.scanNode(node);
          }
        }
      } else if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (target instanceof HTMLElement) {
          if (
            target.classList?.contains('dsh-tidy-translated-block') ||
            target.classList?.contains('dsh-tidy-original-hidden') ||
            target.classList?.contains('dsh-tidy-original-shown')
          ) {
            continue;
          }
          this.scanNode(target);
        }
      } else if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement;
        if (parent instanceof HTMLElement) {
          if (
            parent.classList?.contains('dsh-tidy-translated-block') ||
            parent.classList?.contains('dsh-tidy-original-hidden') ||
            parent.classList?.contains('dsh-tidy-original-shown')
          ) {
            continue;
          }
          this.scanNode(parent);
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
    if (node.matches?.(TOOL_TITLE_SELECTOR) && isToolSummarySpan(node)) {
      this.processSpan(node);
    }

    const spans = node.querySelectorAll<HTMLElement>(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span)) {
        this.processSpan(span);
      }
    });
  }

  private processSpan(span: HTMLElement): void {
    if (NonDestructiveTranslationMount.isMounted(span)) {
      const original = NonDestructiveTranslationMount.getOriginal(span);
      if (original) {
        const cached = clientCache.get(original);
        if (cached) return;
      }
      return;
    }

    const text = NonDestructiveTranslationMount.extractVisibleText(span);
    if (!text) return;

    // Check fast client cache
    const cached = clientCache.get(text);
    if (cached) {
      NonDestructiveTranslationMount.mount(span, cached, {
        originalText: text,
      });
      return;
    }

    // Send to viewport lazy queue
    lazyQueue.observe(span, text);
  }

  disconnect(): void {
    if (this.rootCheckTimer !== null) {
      clearInterval(this.rootCheckTimer);
      this.rootCheckTimer = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    lazyQueue.disconnect();
    this.rootElement = null;
  }
}

export const chatTranslateObserver = new ChatTranslateObserver();
