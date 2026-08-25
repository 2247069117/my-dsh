// jsdom 验证 Think 负载防护：长文本分块、串行（同时仅 1 个请求在途）、关闭即时还原
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const longThink = Array.from({ length: 12 }, (_, i) => `Reasoning step ${i}: weigh the tradeoffs between latency and throughput, then pick the pragmatic default for this pipeline.`).join('\n');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow data-chat-flow-kind="assistant-step">
    <div data-chat-call-id="t1"><div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="think" data-state="ok">
      <span class="CY-8Ka_title">Think</span><span class="CY-8Ka_summary">${longThink}</span>
    </div></div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;

let inFlight = 0, peakInFlight = 0, translateCalls = 0;
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    inFlight++; peakInFlight = Math.max(peakInFlight, inFlight); translateCalls++;
    await new Promise(r => setTimeout(r, 30));
    const body = JSON.parse(opts.body);
    const out = { ok: true, json: async () => ({ ok: true, results: body.texts.map(t => ({ original: t, translated: `译#${t.slice(0, 20)}`, channel: 'mock', cached: false })) }) };
    inFlight--;
    return out;
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
const sum = () => window.document.querySelector('[data-chat-call-id="t1"] .CY-8Ka_summary');

await new Promise(r => setTimeout(r, 300));
console.log('1) 默认未开启: think 长度 =', sum().textContent.length);

exports.chatTranslateObserver.setTranslateThinking(true);
await new Promise(r => setTimeout(r, 3000));
console.log('2) 开启后: think 长度 =', sum().textContent.length, '| 是否已翻译 =', sum().getAttribute('data-tidy-translated'));
console.log('   翻译请求次数 =', translateCalls, '| 峰值在途并发 =', peakInFlight, '(Think 应 ≤1)');

exports.chatTranslateObserver.setTranslateThinking(false);
await new Promise(r => setTimeout(r, 300));
console.log('3) 关闭后: think 前 40 字符 =', sum().textContent.slice(0, 40));
console.log('   已还原原文 =', sum().textContent.startsWith('Reasoning step 0'));
