import { clientCache } from './client-cache.ts';
import { lazyQueue } from './lazy.ts';
import { requestTranslateBatch } from './api.ts';
import { NonDestructiveTranslationMount } from './mount.ts';

const TOOL_TITLE_SELECTOR = '[class*="summary"]';

/** IO output preview text inside *failed* tool cards — "out" of error calls. */
const TOOL_ERROR_OUT_SELECTOR = [
  '[data-variant][data-state="error"] [class*="ioText"]',
  '[data-variant][data-state="aborted"] [class*="ioText"]',
  '[class*="ioText"][data-error]',
  '[class*="terminalBody"], [class*="terminalBodyWrap"]',
].join(', ');

/** Lines that carry an error semantics — the only lines worth translating. */
const ERROR_LINE_RE =
  /error|fail(?:ed|ure)?|cannot|unable|no such|not found|denied|fatal|command not found|exit code|exited with|aborted|timed? ?out|exception|permission|killed|enoent|eacces|unreachable|refused/i;

function isErrorLine(t: string): boolean {
  if (t.trim().length < 4) return false;
  if (t.length > 40 && !/\s/.test(t.trim())) return false;
  return ERROR_LINE_RE.test(t);
}

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

function isErrorOutNode(span: HTMLElement): boolean {
  if (span.hasAttribute('aria-hidden')) return false;
  if (span.closest('pre, code, [class*="ioCard"] [class*="markdown"], [class*="_file_"]')) {
    return false;
  }
  const cls = span.className || '';
  if (/terminalBody/i.test(cls)) return true;
  if (/ioText/i.test(cls)) {
    return (
      span.hasAttribute('data-error') ||
      !!span.closest('[data-variant][data-state="error"], [data-variant][data-state="aborted"]')
    );
  }
  return false;
}

function isTranslateableErrorText(t: string): boolean {
  if (t.trim().length < 4) return false;
  if (t.length > 40 && !/\s/.test(t.trim())) return false;
  if (/^[\s./\\\-_0-9a-zA-Z:'"$@#<>*~=,;()\[\]{}]+$/.test(t) && !/\s/.test(t.trim())) {
    return false;
  }
  return true;
}

const translatingErrorOuts = new WeakSet<HTMLElement>();
let errorOutEnabled = true;

async function translateErrorOut(span: HTMLElement): Promise<void> {
  if (translatingErrorOuts.has(span)) return;
  if (span.dataset.tidyTranslated === 'true') return;
  const raw = span.textContent ?? '';
  const lines = raw.split('\n');
  const targets: Array<{ idx: number; text: string }> = [];
  lines.forEach((ln, i) => {
    const t = ln.trim();
    if (isErrorLine(t) && isTranslateableErrorText(t)) {
      targets.push({ idx: i, text: t });
    }
  });
  if (targets.length === 0) {
    return;
  }
  const uniqueLines = Array.from(new Set(targets.map((x) => x.text)));
  const results = await requestTranslateBatch(uniqueLines.slice(0, 80));
  const byText = new Map<string, string>();
  results.forEach((r) => {
    if (r && r.translated && r.translated !== r.original) byText.set(r.original, r.translated);
  });

  translatingErrorOuts.add(span);
  try {
    let changed = false;
    for (const t of targets) {
      const translated = byText.get(t.text);
      if (translated) {
        lines[t.idx] = translated;
        changed = true;
      }
    }
    const merged = lines.join('\n');
    if (errorOutEnabled && changed && merged !== raw) {
      span.dataset.tidyTranslated = 'true';
      span.dataset.original = raw;
      span.textContent = merged;
      span.querySelectorAll('*').forEach((el) => {
        (el as HTMLElement).dataset.tidyTranslated = 'true';
      });
    }
  } catch {
    // Silent
  } finally {
    translatingErrorOuts.delete(span);
  }
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
    errorOutEnabled = enabled;
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
    const errorOuts = container.querySelectorAll<HTMLElement>(TOOL_ERROR_OUT_SELECTOR);
    errorOuts.forEach((span) => {
      if (isErrorOutNode(span)) {
        translateErrorOut(span);
      }
    });
  }

  private scanNode(node: HTMLElement): void {
    if (node.matches?.(TOOL_TITLE_SELECTOR) && isToolSummarySpan(node)) {
      this.processSpan(node);
    }
    if (node.matches?.(TOOL_ERROR_OUT_SELECTOR) && isErrorOutNode(node)) {
      translateErrorOut(node);
    }

    const spans = node.querySelectorAll<HTMLElement>(TOOL_TITLE_SELECTOR);
    spans.forEach((span) => {
      if (isToolSummarySpan(span)) {
        this.processSpan(span);
      }
    });
    const errorOuts = node.querySelectorAll<HTMLElement>(TOOL_ERROR_OUT_SELECTOR);
    errorOuts.forEach((span) => {
      if (isErrorOutNode(span)) {
        translateErrorOut(span);
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
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    lazyQueue.disconnect();
    this.rootElement = null;
  }
}

export const chatTranslateObserver = new ChatTranslateObserver();
