import { A6ApiSettingsPanel } from './components/A6ApiSettings.js';
import mainCss from './styles/main.css';
import { store } from './store.js';

export const name = '@lynn123411/dsh-a6api';
export const inject = ['slots'];

function injectStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'dsh-a6api-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = mainCss;
    document.head.appendChild(style);
  }
}

export function apply(ctx: any): void {
  injectStyles();
  if (typeof window === 'undefined') return;
  // 启动价格波动轻量轮询（后台 60s，与余额同频）
  try {
    setTimeout(() => {
      try { store.initPricePolling(); } catch {}
    }, 1500);
  } catch {}


  try {
    const slots = ctx?.slots || (ctx?.get ? ctx.get('slots') : null);
    if (!slots || typeof slots.inject !== 'function') return;

    slots.inject('settings.section', () => {
      return slots.register(
        {
          name: 'settings.section',
          id: 'dsh-a6api',
          order: 11,
          label: () => 'A6api',
        },
        A6ApiSettingsPanel,
      );
    });
  } catch (err) {
    console.warn('[dsh-a6api] Failed to inject settings section:', err);
  }
}