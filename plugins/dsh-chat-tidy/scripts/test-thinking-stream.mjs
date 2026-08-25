// jsdom 验证「流式渐进」：长 Think 分块、中途回写前缀、最终全量、串行元素间
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const lines = Array.from({ length: 16 }, (_, i) => `Reasoning paragraph ${i}: analyze option A versus option B, then settle on the robust default for this deployment.`).join('\n'); // ~16 行 ≈ 920 字符 → 2 块+（600/块）
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow data-chat-flow-kind="assistant-step">
    <div data-chat-call-id="s1"><div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="think" data-state="ok">
      <span class="CY-8Ka_title">Think</span><span class="CY-8Ka_summary">${lines}</span>
    </div></div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;

let callSeq = 0; const seq = [];
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    const mySeq = callSeq++;
    const body = JSON.parse(opts.body);
    await new Promise(r => setTimeout(r, 120 + Math.random() * 120)); // 模拟网络抖动
    seq.push({ seq: mySeq, texts: body.texts.length });
    return { ok: true, json: async () => ({ ok: true, results: body.texts.map(t => ({ original: t, translated: `译块[${t.slice(0, 16)}…]`, channel: 'mock', cached: false })) }) };
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
const sum = () => window.document.querySelector('[data-chat-call-id="s1"] .CY-8Ka_summary');

await new Promise(r => setTimeout(r, 300));
console.log('1) 原始长度:', sum().textContent.length);

exports.chatTranslateObserver.setTranslateThinking(true);
// 观察中间状态（约 250ms 时应有部分块回写）
await new Promise(r => setTimeout(r, 250));
const mid = sum().textContent;
console.log('2) 中途(250ms): 是否出现流式中文块 =', mid.includes('译块'), '| 是否仍含原文行 =', mid.includes('Reasoning paragraph'));

await new Promise(r => setTimeout(r, 3000));
const fin = sum().textContent;
console.log('3) 完成: tidyTranslated =', sum().getAttribute('data-tidy-translated'), '| 含译块 =', fin.includes('译块'), '| 残留原文行 =', fin.includes('Reasoning paragraph 15'));
console.log('   请求序列(块的到达序):', JSON.stringify(seq.map(x => x.seq)));
console.log('   每请求块数均=1（逐块单发）:', seq.every(x => x.texts === 1) ? 'PASS' : 'FAIL');

exports.chatTranslateObserver.setTranslateThinking(false);
await new Promise(r => setTimeout(r, 200));
console.log('4) 关闭还原: 开头 =', sum().textContent.slice(0, 20), '| 原文恢复 =', sum().textContent.startsWith('Reasoning paragraph 0'));
