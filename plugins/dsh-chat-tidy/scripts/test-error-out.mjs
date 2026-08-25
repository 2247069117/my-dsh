// jsdom 端到端验证：最新 client bundle 的报错 out 翻译管线
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const html = `<!doctype html><html><body><div data-chat-flow data-chat-flow-kind="assistant-step"></div></body></html>`;
const dom = new JSDOM(html, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;

global.window = window;
global.document = window.document;
global.MutationObserver = window.MutationObserver;
global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;

global.fetch = async (url, opts) => {
  console.log('[FETCH]', String(url).slice(0, 60));
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    const body = JSON.parse(opts.body);
    return {
      ok: true,
      json: async () => ({
        ok: true,
        results: body.texts.map((t) => ({ original: t, translated: `译文[${t}]`, channel: 'mock', cached: true })),
      }),
    };
  }
  if (u.includes('/api/dsh-chat-tidy/config')) {
    return { ok: true, json: async () => ({ config: { enabled: true, concurrency: 3 } }) };
  }
  return { ok: false, json: async () => ({}) };
};
window.fetch = global.fetch;

let factory = null;
window.__ModuleLoader__ = { load: (e) => { factory = e.factory; } };
window.eval(code);
if (!factory) throw new Error('factory 未捕获');
const exports = factory((id) => {
  if (id === 'react') return { useState: () => [null, () => {}], useEffect: () => {} };
  return null;
});
if (!exports.chatTranslateObserver) throw new Error('无 chatTranslateObserver');

const flow = window.document.querySelector('[data-chat-flow]');
const card = window.document.createElement('div');
card.setAttribute('data-chat-call-id', 'fake-error-1');
card.innerHTML = [
  '<div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="bash" data-state="error" data-expandable="true" aria-expanded="true">',
  '<div class="CY-8Ka_bodyWrap"><div class="CY-8Ka_ioSection"><div class="CY-8Ka_ioCard">',
  '<span class="CY-8Ka_ioText">bash: line 1: rm: command not found\nError: process exited with code 127</span>',
  '</div></div></div></div></div>',
].join('');
flow.appendChild(card);

exports.chatTranslateObserver.start(window.document);
await new Promise((r) => setTimeout(r, 500));

const out = window.document.querySelector('[data-chat-call-id="fake-error-1"] .CY-8Ka_ioText');
console.log('--- 报错 out 结果 ---');
console.log(JSON.stringify({
  text: out ? out.textContent : null,
  translated: out ? out.getAttribute('data-tidy-translated') : null,
  original: out ? out.getAttribute('data-original') : null,
}, null, 2));
