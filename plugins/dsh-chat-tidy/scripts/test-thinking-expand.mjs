// 验证折叠(summary)与展开(thinkBody)同时翻译
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow>
    <div data-chat-call-id="r1"><div class="QWLzlG_row" data-variant="think" data-state="ok">
      <span class="QWLzlG_title">Think</span>
      <span class="QWLzlG_summary">Investigating why the DSH install path points to a built library instead of source and how collapsed versus expanded thinking chains differ.</span>
      <div class="QWLzlG_thinkBody">Investigating why the DSH install path points to a built library instead of source and how collapsed versus expanded thinking chains differ. This is the expanded body that was previously not translated while the collapsed summary was.</div>
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
exports.apply({ effect: (fn) => { try { fn(); } catch(e){ console.log('[effect]',e.message)} }, get:()=>null });

await new Promise(r=>setTimeout(r, 2000));
const summary = window.document.querySelector('.QWLzlG_summary');
const body = window.document.querySelector('.QWLzlG_thinkBody');
console.log('calls:', calls.length, calls.map(s=>s.slice(0,30)));
console.log('summary translated?', summary.textContent.startsWith('中译'), '=>', summary.textContent.slice(0,40));
console.log('body translated?', body.textContent.startsWith('中译'), '=>', body.textContent.slice(0,40));
console.log('summary dataset', summary.dataset.tidyTranslated, summary.dataset.tidyThink);
console.log('body dataset', body.dataset.tidyTranslated, body.dataset.tidyThink);
if (summary.textContent.startsWith('中译') && body.textContent.startsWith('中译')) console.log('PASS: 折叠与展开都已翻译');
else console.log('FAIL: 展开未翻译或折叠未翻译');

// Test dynamic expand: remove body then re-add (simulate user clicking expand)
const container = window.document.querySelector('[data-variant="think"]');
const bodyClone = body.cloneNode(true);
bodyClone.textContent = "Investigating why the DSH install path points to a built library instead of source and how collapsed versus expanded thinking chains differ. NEW expanded content after click.";
body.remove();
await new Promise(r=>setTimeout(r, 300));
container.appendChild(bodyClone);
await new Promise(r=>setTimeout(r, 2000));
console.log('--- after dynamic expand ---');
console.log('new body translated?', bodyClone.textContent.startsWith('中译'), '=>', bodyClone.textContent.slice(0,40));
console.log('calls after:', calls.length);
if (bodyClone.textContent.startsWith('中译')) console.log('PASS: 动态展开也已翻译');
else console.log('FAIL: 动态展开未翻译');
