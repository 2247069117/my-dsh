// jsdom 验证思维链翻译开关：默认不翻 → 开启翻译可还原
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow data-chat-flow-kind="assistant-step">
    <div data-chat-call-id="t1"><div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="think" data-state="ok">
      <span class="CY-8Ka_title">Think</span><span class="CY-8Ka_summary">Reasoning about the best approach here</span>
    </div></div></div>
    <div data-chat-call-id="t2"><div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="bash" data-state="ok">
      <span class="CY-8Ka_title">Bash</span><span class="CY-8Ka_summary">Check disk usage</span>
    </div></div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;
let translated = [];
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    const body = JSON.parse(opts.body); translated.push(...body.texts);
    return { ok: true, json: async () => ({ ok: true, results: body.texts.map(t => ({ original: t, translated: `译文:${t}`, channel: 'mock', cached: false })) }) };
  }
  if (u.includes('/api/dsh-chat-tidy/config')) {
    if (opts?.method === 'POST') { const b = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ config: { enabled: !!b.enabled, concurrency: b.concurrency ?? 3, translateThinking: !!b.translateThinking } }) }; }
    const b = JSON.parse(localStorage.getItem('dsh-chat-tidy:translate-thinking') || 'false');
    return { ok: true, json: async () => ({ config: { enabled: true, concurrency: 3, translateThinking: b === 'true' } }) };
  }
  return { ok: false, json: async () => ({}) };
};
window.fetch = global.fetch;

let factory = null;
window.__ModuleLoader__ = { load: (e) => { factory = e.factory; } };
window.eval(code);
const exports = factory((id) => id === 'react' ? { useState: () => [null, () => {}], useEffect: () => {} } : null);
exports.apply({ effect: (fn) => { try { fn(); } catch (e) { console.log('[effect err]', e.message); } }, get: () => null });

const thinkSummary = () => window.document.querySelector('[data-chat-call-id="t1"] .CY-8Ka_summary');
const bashSummary = () => window.document.querySelector('[data-chat-call-id="t2"] .CY-8Ka_summary');

await new Promise(r => setTimeout(r, 600));
console.log('1) 默认（不翻 Think）: think =', thinkSummary().textContent, '| bash =', bashSummary().textContent);
console.log('   发送翻译:', JSON.stringify(translated));

// 开启思维链翻译（store 的 update() 最终调用同一个 setTranslateThinking）
exports.chatTranslateObserver.setTranslateThinking(true);
await new Promise(r => setTimeout(r, 800));
console.log('2) 开启后: think =', thinkSummary().textContent, '| bash =', bashSummary().textContent);

// 再关掉 → think 还原，bash 保持译文
exports.chatTranslateObserver.setTranslateThinking(false);
await new Promise(r => setTimeout(r, 200));
console.log('3) 关闭后: think =', thinkSummary().textContent, '| bash =', bashSummary().textContent);
