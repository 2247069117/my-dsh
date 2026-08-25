import { clientCache } from './client-cache.ts';
import { lazyQueue } from './lazy.ts';
import { requestTranslateBatch } from './api.ts';

const CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5]/;

const TOOL_TITLE_SELECTOR = [
  '[data-chat-call-id] [class*="summary"]',
  '[data-slot="tool.call.toolview"] [class*="summary"]',
  '[data-sample] [class*="summary"]',
  '[data-variant] [class*="summary"]',
  '[data-tool] [data-disclosure-row] > span:not([aria-hidden])',
  '[data-disclosure-row] [class*="summary"]',
].join(', ');

/** IO output preview text inside *failed* tool cards — "out" of error calls. */
const TOOL_ERROR_OUT_SELECTOR = [
  '[data-variant][data-state="error"] [class*="ioText"]',
  '[data-variant][data-state="aborted"] [class*="ioText"]',
  '[class*="ioText"][data-error]',
  '[class*="terminalBody"], [class*="terminalBodyWrap"]',
].join(', ');

/** Max characters per line-group chunk sent to the translation API. */
const ERROR_OUT_CHUNK_MAX = 600;

/** Lines that carry an error semantics — the only lines worth translating. */
const ERROR_LINE_RE =
  /error|fail(?:ed|ure)?|cannot|unable|no such|not found|denied|fatal|command not found|exit code|exited with|aborted|timed? ?out|exception|permission|killed|enoent|eacces|unreachable|refused/i;

function isErrorLine(t: string): boolean {
  if (CHINESE_CHAR_REGEX.test(t)) return false;
  if (t.trim().length < 4) return false;
  if (t.length > 40 && !/\s/.test(t.trim())) return false;
  return ERROR_LINE_RE.test(t);
}

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

function isErrorOutNode(span: HTMLElement): boolean {
  if (span.hasAttribute('aria-hidden')) return false;
  // Never touch code blocks / rich output — only plain IO preview text.
  if (span.closest('pre, code, [class*="ioCard"] [class*="markdown"], [class*="_file_"]')) return false;
  const cls = span.className || '';
  if (/terminalBody/i.test(cls)) return true;
  if (/ioText/i.test(cls)) {
    return span.hasAttribute('data-error') ||
      !!span.closest('[data-variant][data-state="error"], [data-variant][data-state="aborted"]');
  }
  return false;
}

/** Heuristic: is this error text worth translating (skips paths/hashes/commands). */
function isTranslateableErrorText(t: string): boolean {
  if (CHINESE_CHAR_REGEX.test(t)) return false;
  if (t.trim().length < 4) return false;
  // A single long no-space token (path, hash, command line) — leave as-is.
  if (t.length > 40 && !/\s/.test(t.trim())) return false;
  // A pure path / symbol line without spaces.
  if (/^[\s./\\\-_0-9a-zA-Z:'"$@#<>*~=,;()\[\]{}]+$/.test(t) && !/\s/.test(t.trim())) return false;
  return true;
}

function chunkLines(text: string, max: number): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let cur = '';
  for (const line of lines) {
    const candidate = cur ? `${cur}\n${line}` : line;
    if (candidate.length > max && cur) {
      chunks.push(cur);
      cur = line;
    } else {
      cur = candidate;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

const translatingErrorOuts = new WeakSet<HTMLElement>();
/** Gate for error-out writes; flipped together with the plugin switch. */
let errorOutEnabled = true;

async function translateErrorOut(span: HTMLElement): Promise<void> {
  if (translatingErrorOuts.has(span)) return;
  if (span.dataset.tidyTranslated === 'true') return;
  const raw = span.textContent ?? '';
  // Per-line mode: only error-semantic lines are translated; plain stdout,
  // commands and paths stay byte-identical.
  const lines = raw.split('\n');
  const targets: Array<{ idx: number; text: string }> = [];
  lines.forEach((ln, i) => {
    const t = ln.trim();
    if (isErrorLine(t) && isTranslateableErrorText(t)) {
      targets.push({ idx: i, text: t });
    }
  });
  if (targets.length === 0) {
    if (CHINESE_CHAR_REGEX.test(raw)) span.dataset.tidyTranslated = 'true';
    return;
  }
  // Translate a line exactly once per error-out element (dedup via Set).
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
      // Mark descendants too so nested text nodes are skipped on re-scans.
      span.querySelectorAll('*').forEach((el) => {
        (el as HTMLElement).dataset.tidyTranslated = 'true';
      });
    }
  } catch {
    // Silent — keep the original error output
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
    // Flip the gate FIRST so restore-triggered mutations cannot re-translate.
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

  /**
   * Restore every translated node back to its English original so toggling
   * the switch off takes effect immediately (no browser refresh needed).
   */
  private restoreOriginals(): void {
    const scope = this.rootElement ?? document;
    const spans = scope.querySelectorAll<HTMLElement>('[data-tidy-translated="true"]');
    for (const span of spans) {
      const original = span.dataset.original;
      if (original && original !== span.textContent) {
        span.textContent = original;
      }
      delete span.dataset.tidyTranslated;
      delete span.dataset.original;
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
            this.scanNode(node);
          }
        }
      } else if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (target instanceof HTMLElement) {
          // React state change (running -> error, accordion expansion)
          this.scanNode(target);
        }
      } else if (mutation.type === 'characterData') {
        // React re-rendered a text node (e.g. wiped our translation back to
        // English). Re-scan the owner element; the dataset guard keeps this
        // loop-free: translated text is Chinese or equals the cached value.
        const parent = mutation.target.parentElement;
        if (parent instanceof HTMLElement) {
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
    if (node.tagName === 'SPAN' && isToolSummarySpan(node)) {
      this.processSpan(node);
      return;
    }
    if (node.tagName === 'SPAN' && isErrorOutNode(node)) {
      translateErrorOut(node);
      return;
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