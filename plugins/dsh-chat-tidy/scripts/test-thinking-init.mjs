// 验证初始化：localStorage 已开 translateThinking，刷新后应自动翻译 Think 块
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const bodyText = `The user just said "nih" — this is a very short message, probably a typo or a greeting attempt (maybe "hi" or "nihao" - Chinese for hello, or a typo). Given the workspace is Chinese-oriented, "nih" could be a typo for "nihao" (你好) or "hi".`;
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow>
    <div data-chat-call-id="r1"><div data-variant="think" data-state="ok">
      <span class="QWLzlG_title">Think</span>
      <div class="QWLzlG_thinkBody">${bodyText}</div>
    </div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;
window.localStorage.setItem('dsh-chat-tidy:translate-thinking', 'true');
window.localStorage.setItem('dsh-chat-tidy:enabled', 'true');
let calls = [];
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    const body = JSON.parse(opts.body);
    calls.push(...body.texts);
    return { ok: true, json: async () => ({ ok: true, results: body.texts.map(t => ({ original: t, translated: `中译:${t.slice(0,20)}…`, channel: 'mock', cached: false })) }) };
  }
  if (u.includes('/api/dsh-chat-tidy/config')) {
    if (opts?.method === 'POST') { const b = JSON.parse(opts.body); return { ok: true, json: async () => ({ ok: true, config: { enabled: !!b.enabled, concurrency: 3, translateThinking: !!b.translateThinking } }) }; }
    return { ok: true, json: async () => ({ ok: true, config: { enabled: true, concurrency: 3, translateThinking: true } }) };
  }
  return { ok: false, json: async () => ({}) };
};
window.fetch = global.fetch;
let factory = null;
window.__ModuleLoader__ = { load: (e) => { factory = e.factory; } };
window.eval(code);
const exports = factory((id) => id === 'react' ? { useState: () => [null, ()=>{}], useEffect: ()=>{} } : null);
// 模拟 DSH 的 effect 挂载：此时 store 已在 bundle 评估时构造，loadFromLocalStorage 已调用 setTranslateThinking
exports.apply({ effect: (fn) => { try { fn(); } catch(e){ console.log('[effect]',e.message)} }, get:()=>null });
await new Promise(r=>setTimeout(r, 2500));
const el = window.document.querySelector('.QWLzlG_thinkBody');
console.log('calls:', calls.length, calls.slice(0,2).map(s=>s.slice(0,30)));
console.log('translated?', el.textContent.startsWith('中译'));
console.log('snippet:', el.textContent.slice(0,60));
console.log('dataset tidyThink:', el.dataset.tidyThink, 'tidyTranslated:', el.dataset.tidyTranslated);
if (el.textContent.startsWith('中译')) console.log('PASS: 初始化后自动翻译');
else console.log('FAIL: 未翻译 — 初始化丢失');
