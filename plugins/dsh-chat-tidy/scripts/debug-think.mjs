import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow data-chat-flow-kind="assistant-step">
    <div data-chat-call-id="t1"><div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="think" data-state="ok">
      <span class="CY-8Ka_title">Think</span><span class="CY-8Ka_summary">Reasoning about the best approach here</span>
    </div></div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;
global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, results: [{ original: 'Reasoning about the best approach here', translated: '译文:Reasoning' }] }) });

let factory = null;
window.__ModuleLoader__ = { load: (e) => { factory = e.factory; } };
window.eval(code);
const exports = factory(() => null);
exports.apply({ effect: (fn) => fn(), get: () => null });

const thinkSummary = () => window.document.querySelector('[data-chat-call-id="t1"] .CY-8Ka_summary');
await new Promise(r => setTimeout(r, 600));
console.log('1) default innerHTML:', thinkSummary()?.innerHTML);
exports.chatTranslateObserver.setTranslateThinking(true);
await new Promise(r => setTimeout(r, 800));
console.log('2) enabled innerHTML:', thinkSummary()?.innerHTML);
console.log('   dataset:', JSON.stringify(thinkSummary()?.dataset));
exports.chatTranslateObserver.setTranslateThinking(false);
await new Promise(r => setTimeout(r, 200));
console.log('3) disabled innerHTML:', thinkSummary()?.innerHTML);
console.log('   dataset:', JSON.stringify(thinkSummary()?.dataset));
