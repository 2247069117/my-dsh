// jsdom 验证行级错误翻译：terminal 容器内仅错误行被翻，stdout/命令/路径保留
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const dom = new JSDOM(`<!doctype html><html><body>
  <div data-chat-flow data-chat-flow-kind="assistant-step">
    <div data-chat-call-id="c2"><div class="CY-8Ka_card"><div class="CY-8Ka_root" data-variant="bash" data-state="ok">
      <span class="CY-8Ka_title">Bash</span><span class="CY-8Ka_summary">Run failing script</span>
    </div>
    <div class="CY-8Ka_terminalBody"><div class="CY-8Ka_terminal">
      <span class="line">building project...</span>
      <span class="line">Error: cannot find module './setup'</span>
      <span class="line">at Object.<anonymous> (/app/index.js:12:3)</span>
      <span class="line">exit code 1</span>
    </div></div></div></div>
  </div>
</body></html>`, { pretendToBeVisual: true, url: 'http://127.0.0.1:3080/' });
const { window } = dom;
global.window = window; global.document = window.document;
global.MutationObserver = window.MutationObserver; global.HTMLElement = window.HTMLElement;
global.localStorage = window.localStorage;

let translateCalls = [];
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/api/dsh-chat-tidy/translate')) {
    const body = JSON.parse(opts.body);
    translateCalls.push(body.texts);
    return { ok: true, json: async () => ({ ok: true, results: body.texts.map(t => ({ original: t, translated: `【译】${t}`, channel: 'mock', cached: false })) }) };
  }
  if (u.includes('/api/dsh-chat-tidy/config')) {
    if (opts?.method === 'POST') { const b = JSON.parse(opts.body); return { ok: true, json: async () => ({ config: { enabled: !!b.enabled, concurrency: b.concurrency ?? 3 } }) }; }
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

await new Promise(r => setTimeout(r, 600));
const term = window.document.querySelector('.CY-8Ka_terminalBody');
console.log('发送翻译的行:', JSON.stringify(translateCalls[0] || []));
console.log('回写后 terminal 内容:');
console.log(term.textContent);
// 断言
const txt = term.textContent;
const ok =
  txt.includes('building project...') &&          // stdout 行保留
  txt.includes('【译】Error: cannot find module') && // 错误行被翻译（前缀保留原文以含关键词）
  txt.includes('/app/index.js:12:3') &&            // at 路径行保留（无空格短路径不翻）
  txt.includes('【译】exit code 1');                 // exit code 行被翻
console.log('行级过滤正确:', ok ? 'PASS' : 'FAIL');
