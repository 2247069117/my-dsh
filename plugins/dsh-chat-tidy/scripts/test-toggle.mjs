// jsdom 验证快捷开关：插入 header → 按钮出现 → 点击切换 → 状态同步
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-slot="conversation.session.header"><header><div class="utilities"></div></header></div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/config')) {
    if (opts && opts.method === 'POST') {
      const b = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ config: { enabled: !!b.enabled, concurrency: b.concurrency ?? 3 } }) };
    }
    return { ok: true, json: async () => ({ config: { enabled: true, concurrency: 3 } }) };
  }
  return { ok: false, json: async () => ({}) };
};
window.fetch = global.fetch;

let factory = null;
window.__ModuleLoader__ = { load: (e) => { factory = e.factory; } };
window.eval(code);
const exports = factory((id) => id === 'react' ? { useState: () => [null, () => {}], useEffect: () => {} } : null);
exports.apply({ effect: (fn) => { try { fn(); } catch (e) { console.log('[effect err]', e.message); } }, get: () => null });
await new Promise(r => setTimeout(r, 300));

const btn = window.document.getElementById('dsh-chat-tidy-toggle');
console.log('按钮已插入:', !!btn, '| pressed:', btn?.getAttribute('aria-pressed'));
if (!btn) process.exit(1);
// 点击两次验证切换
console.log('点击前 enabled =', (() => { try { return window.localStorage.getItem('dsh-chat-tidy:enabled'); } catch { return 'n/a'; } })());
btn.addEventListener('click', () => console.log('[handler 被触发]'));
btn.click(); await new Promise(r => setTimeout(r, 100));
console.log('点击1次 →', btn.getAttribute('aria-pressed'), '(应为 false) | LS:', window.localStorage.getItem('dsh-chat-tidy:enabled'));
btn.click(); await new Promise(r => setTimeout(r, 100));
console.log('点击2次 →', btn.getAttribute('aria-pressed'), '(应为 true)');
// React 重渲染模拟：移除按钮 → keepAlive 补插
btn.remove(); await new Promise(r => setTimeout(r, 100));
const again = window.document.getElementById('dsh-chat-tidy-toggle');
console.log('重渲染后补插:', !!again);
