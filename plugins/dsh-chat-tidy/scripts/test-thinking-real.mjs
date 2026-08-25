// jsdom 用真实 DSH 结构验证：DIV.QWLzlG_thinkBody 思考链翻译
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const bodyText = Array.from({ length: 6 }, (_, i) => `Reasoning step ${i}: the user asks about offline dictionary, so we should remove that channel entirely.`).join('\n');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow data-chat-flow-kind="assistant-step">
    <div data-chat-call-id="r1"><div class="_row_9cl6j_10 QWLzlG_row" data-variant="think" data-state="ok">
      <span class="_title_9cl6j_64 QWLzlG_title">Think</span>
      <div class="QWLzlG_thinkBody">${bodyText}</div>
    </div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;
let calls = 0;
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    calls++;
    const body = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ ok: true, results: body.texts.map(t => ({ original: t, translated: `中译:${t.slice(0, 18)}…`, channel: 'mock', cached: false })) }) };
  }
  if (u.includes('/api/dsh-chat-tidy/config')) {
    if (opts?.method === 'POST') { const b = JSON.parse(opts.body); return { ok: true, json: async () => ({ config: { enabled: !!b.enabled, concurrency: b.concurrency ?? 3, translateThinking: !!b.translateThinking } }) }; }
    return { ok: true, json: async () => ({ config: { enabled: true, concurrency: 3, translateThinking: false } }) };
  }
  return { ok: false, json: async () => ({}) };
};
window.fetch = global.fetch;
let factory = null;
window.__ModuleLoader__ = { load: (e) => { factory = e.factory; } };
window.eval(code);
const exports = factory((id) => id === 'react' ? { useState: () => [null, () => {}], useEffect: () => {} } : null);
exports.apply({ effect: (fn) => { try { fn(); } catch (e) { console.log('[effect err]', e.message); } }, get: () => null });
const body = () => window.document.querySelector('.QWLzlG_thinkBody');

await new Promise(r => setTimeout(r, 300));
console.log('1) 默认: 原样 =', body().textContent.slice(0, 30), '| 翻译调用 =', calls);

exports.chatTranslateObserver.setTranslateThinking(true);
await new Promise(r => setTimeout(r, 3000));
console.log('2) 开启: 已译 =', body().textContent.slice(0, 30), '| tidyTranslated =', body().getAttribute('data-tidy-translated'), '| 调用 =', calls);

exports.chatTranslateObserver.setTranslateThinking(false);
await new Promise(r => setTimeout(r, 200));
console.log('3) 关闭: 还原 =', body().textContent.slice(0, 30));
console.log('4) Think 徽标没被动:', window.document.querySelector('.QWLzlG_title').textContent);
