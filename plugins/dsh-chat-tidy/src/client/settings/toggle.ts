import { settingsStore } from './store.ts';

/**
 * Quick-toggle button mounted in the conversation session header: one-click
 * enable/disable of title translation without opening the settings dialog.
 * State stays in sync with the settings panel via {@link settingsStore}
 * (same localStorage key + host config), so both surfaces drive the same
 * on/off switch and the observer reacts immediately.
 */

const TOGGLE_ID = 'dsh-chat-tidy-toggle';
const TOGGLE_CSS_ID = 'dsh-tidy-toggle-css';

const TOGGLE_CSS = String.raw`
.dsh-tidy-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  background: transparent;
  color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.8));
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  flex: none;
  padding: 0;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.dsh-tidy-toggle:hover {
  border-color: rgba(59, 130, 246, 0.6);
}

.dsh-tidy-toggle[aria-pressed="true"] {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.45);
}

.dsh-tidy-toggle[aria-pressed="false"] span {
  text-decoration: line-through;
  opacity: 0.45;
}
`;

function findHeader(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    '[data-slot="conversation.session.header"] header, [data-slot="conversation.session.header"]'
  );
}

function createButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = TOGGLE_ID;
  btn.className = 'dsh-tidy-toggle';
  const on = settingsStore.getState().enabled;
  btn.setAttribute('aria-pressed', String(on));
  btn.title = on ? '标题翻译：已开启（点击关闭）' : '标题翻译：已关闭（点击开启）';
  btn.setAttribute('aria-label', '标题翻译开关');
  const mark = document.createElement('span');
  mark.textContent = '译';
  btn.appendChild(mark);
  btn.addEventListener('click', () => {
    settingsStore.update({ enabled: !settingsStore.getState().enabled });
  });
  return btn;
}

function syncButtonState(): void {
  const btn = document.getElementById(TOGGLE_ID);
  if (!btn) return;
  const on = settingsStore.getState().enabled;
  btn.setAttribute('aria-pressed', String(on));
  btn.title = on ? '标题翻译：已开启（点击关闭）' : '标题翻译：已关闭（点击开启）';
}

/**
 * Mount the quick toggle. The header is React-rendered, so a keep-alive
 * MutationObserver re-inserts the button if a re-render removes it.
 * @returns disposer that removes the button, styles, observer and subscription.
 */
export function installQuickToggle(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (!document.getElementById(TOGGLE_CSS_ID)) {
    const style = document.createElement('style');
    style.id = TOGGLE_CSS_ID;
    style.textContent = TOGGLE_CSS;
    document.head.appendChild(style);
  }

  const ensure = (): void => {
    const header = findHeader();
    if (!header) return;
    if (!document.getElementById(TOGGLE_ID)) {
      const btn = createButton();
      header.appendChild(btn);
      // Keep the button in the header's right-aligned utility cluster.
      btn.style.marginLeft = '8px';
      const cluster = btn.closest('[class*="utilities"], [class*="header"] > div:last-child');
      if (cluster && cluster !== header) {
        header.insertBefore(btn, cluster.nextSibling);
      }
    }
  };

  ensure();

  const keepAlive = new MutationObserver(() => ensure());
  keepAlive.observe(document.body, { childList: true, subtree: true });

  const unsubscribe = settingsStore.subscribe(syncButtonState);

  return () => {
    keepAlive.disconnect();
    unsubscribe();
    document.getElementById(TOGGLE_ID)?.remove();
  };
}