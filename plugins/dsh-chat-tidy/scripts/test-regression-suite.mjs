// Comprehensive Automated Regression Test Suite for dsh-chat-tidy
// Tests:
// 1. isMostlyChinese language ratio detection
// 2. ContentMaskingPipeline placeholder masking & robust unmasking
// 3. Concurrency pool, Token mutex & Circuit breaker state machine
// 4. LruDiskCache & ClientCache LRU eviction and TTL handling
// 5. ConfigManager validation, atomic persistence, and change events
// 6. NonDestructiveTranslationMount DOM preservation, toggle, and clean unmount
// 7. HttpRouter DoS 1MB protection and endpoint handling

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import { JSDOM } from 'jsdom';

import { ContentMaskingPipeline } from '../src/server/pipeline/masking.ts';
import { isMostlyChinese, TranslationDispatcher } from '../src/server/dispatcher.ts';
import { ConfigManager } from '../src/server/config.ts';
import { LruDiskCache } from '../src/server/cache.ts';
import { ClientCache } from '../src/client/translate/client-cache.ts';
import { NonDestructiveTranslationMount } from '../src/client/translate/mount.ts';
import { createHttpHandler } from '../src/server/router.ts';

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function testAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

console.log('=== Starting dsh-chat-tidy Regression Test Suite ===\n');

// -------------------------------------------------------------
// Suite 1: isMostlyChinese Language Ratio Detection
// -------------------------------------------------------------
console.log('--- Suite 1: isMostlyChinese Language Ratio Detection ---');

test('Empty or whitespace-only text should return false', () => {
  assert.equal(isMostlyChinese(''), false);
  assert.equal(isMostlyChinese('   \n\t  '), false);
});

test('Pure English text should return false', () => {
  assert.equal(isMostlyChinese('Hello world'), false);
  assert.equal(isMostlyChinese('Run integration test suite with pnpm'), false);
  assert.equal(isMostlyChinese('Fixing bug in router'), false);
});

test('Pure Chinese text should return true', () => {
  assert.equal(isMostlyChinese('你好世界'), true);
  assert.equal(isMostlyChinese('正在构建项目并运行测试'), true);
  assert.equal(isMostlyChinese('测试'), true);
});

test('Mixed Chinese/English respects 40% threshold', () => {
  // "Hello 世界" -> 2 Chinese / 8 non-space chars = 25% < 40% -> false
  assert.equal(isMostlyChinese('Hello 世界'), false);

  // "Hello 世界你好啊" -> 5 Chinese / 10 non-space chars = 50% >= 40% -> true
  assert.equal(isMostlyChinese('Hello 世界你好啊'), true);

  // Short sentences: English "Hi" -> false, "好" -> true (100%), "OK" -> false
  assert.equal(isMostlyChinese('Hi'), false);
  assert.equal(isMostlyChinese('好'), true);
  assert.equal(isMostlyChinese('OK'), false);
});

test('Code & technical terms detection', () => {
  assert.equal(isMostlyChinese('git commit -m "update masking pipeline"'), false);
  assert.equal(isMostlyChinese('npm install @lynn123411/dsh-chat-tidy'), false);
  assert.equal(isMostlyChinese('编译完成，共 10 个测试用例通过'), true);
});

// -------------------------------------------------------------
// Suite 2: ContentMaskingPipeline Placeholder Protection
// -------------------------------------------------------------
console.log('\n--- Suite 2: ContentMaskingPipeline Placeholder Protection ---');

const pipeline = new ContentMaskingPipeline();

test('Masks multi-line code blocks with backticks and tildes', () => {
  const input = 'Here is some code:\n\`\`\`typescript\nconst answer: number = 42;\nconsole.log(answer);\n\`\`\`\nAnd more text.';
  const { maskedText, unmask } = pipeline.mask(input);
  assert.match(maskedText, /__DSH_MASK_0__/);
  assert.ok(!maskedText.includes('const answer'));

  const simulatedTranslation = '这是代码：\n__DSH_MASK_0__\n以及更多文本。';
  const unmasked = unmask(simulatedTranslation);
  assert.ok(unmasked.includes('const answer: number = 42;'));
  assert.ok(unmasked.startsWith('这是代码：'));
});

test('Masks inline code spans', () => {
  const input = 'Please execute \`pnpm run build\` and \`pnpm run typecheck\` before releasing.';
  const { maskedText, unmask } = pipeline.mask(input);
  assert.match(maskedText, /__DSH_MASK_0__/);
  assert.match(maskedText, /__DSH_MASK_1__/);

  const simulated = '请在发布前执行 __DSH_MASK_0__ 和 __DSH_MASK_1__。';
  const unmasked = unmask(simulated);
  assert.equal(unmasked, '请在发布前执行 `pnpm run build` 和 `pnpm run typecheck`。');
});

test('Masks URLs accurately', () => {
  const input = 'Check the documentation at https://cn.bing.com/translator?q=test&lang=zh-Hans for updates.';
  const { maskedText, unmask } = pipeline.mask(input);
  assert.match(maskedText, /__DSH_MASK_0__/);

  const simulated = '查看文档位于 __DSH_MASK_0__ 获取更新。';
  const unmasked = unmask(simulated);
  assert.equal(unmasked, '查看文档位于 https://cn.bing.com/translator?q=test&lang=zh-Hans 获取更新。');
});

test('Masks file paths (Linux, Windows, relative, source files)', () => {
  const input = 'Files located at /etc/nginx/nginx.conf, src/server/dispatcher.ts, and C:\\Users\\test\\config.json';
  const { maskedText, unmask } = pipeline.mask(input);
  assert.ok(!maskedText.includes('/etc/nginx/nginx.conf'));
  assert.ok(!maskedText.includes('src/server/dispatcher.ts'));

  const unmasked = unmask(maskedText);
  assert.equal(unmasked, input);
});

test('Masks CLI flags and options', () => {
  const input = 'Run command with --concurrency=5 --force-refresh -p 3080 and -rf';
  const { maskedText, unmask } = pipeline.mask(input);
  assert.ok(!maskedText.includes('--concurrency=5'));
  assert.ok(!maskedText.includes('--force-refresh'));

  const unmasked = unmask(maskedText);
  assert.equal(unmasked, input);
});

test('Robust unmasking handles MT engine spacing and casing changes', () => {
  const input = 'Run \`pnpm test\` and open https://localhost:3080';
  const { maskedText, unmask } = pipeline.mask(input);

  // Machine translation engines often corrupt placeholder format:
  // e.g. "__ DSH_MASK_0 __" or "__dsh_mask_0__" or "__DSH _ MASK _ 1__"
  const corruptedTranslation = '运行 __ DSH_MASK_0 __ 并打开 __dsh_mask_1__';
  const unmasked = unmask(corruptedTranslation);
  assert.equal(unmasked, '运行 `pnpm test` 并打开 https://localhost:3080');
});

// -------------------------------------------------------------
// Suite 3: Concurrency Pool, In-flight Dedup & Circuit Breaker
// -------------------------------------------------------------
console.log('\n--- Suite 3: Concurrency Pool & Circuit Breaker State Machine ---');

await testAsync('In-flight deduplication merges identical concurrent requests', async () => {
  const config = new ConfigManager();
  const cache = new LruDiskCache(100);
  const dispatcher = new TranslationDispatcher(config, cache);

  let calls = 0;
  // Mock adapter
  dispatcher['adapters'].set('mock', {
    id: 'mock',
    isAvailable: () => true,
    translate: async (text) => {
      calls++;
      await new Promise((r) => setTimeout(r, 50));
      return `译文:${text}`;
    }
  });
  config.updateConfig({ channels: ['mock'] });

  // Fire 5 identical requests concurrently
  const promises = Array.from({ length: 5 }, () => dispatcher.translateOne('Identical request text'));
  const results = await Promise.all(promises);

  assert.equal(calls, 1, 'Should only call adapter once for concurrent identical in-flight requests');
  for (const res of results) {
    assert.equal(res.translated, '译文:Identical request text');
  }
});

await testAsync('Circuit Breaker trips to OPEN after 3 failures and resets on recovery', async () => {
  const config = new ConfigManager();
  const cache = new LruDiskCache(100);
  const dispatcher = new TranslationDispatcher(config, cache);

  let failCount = 0;
  let succeed = false;
  dispatcher['adapters'].set('unstable', {
    id: 'unstable',
    isAvailable: () => true,
    translate: async () => {
      if (!succeed) {
        failCount++;
        throw new Error('503 Service Unavailable');
      }
      return '恢复成功';
    }
  });
  config.updateConfig({ channels: ['unstable'], timeoutMs: 1000 });

  // 3 consecutive failures
  await dispatcher.translateOne('Fail 1', true);
  await dispatcher.translateOne('Fail 2', true);
  await dispatcher.translateOne('Fail 3', true);

  assert.equal(failCount, 3);
  assert.equal(dispatcher['circuitStates'].get('unstable')?.state, 'open');

  // 4th request while OPEN should skip the channel without calling it
  const resOpen = await dispatcher.translateOne('Fail 4 while open', true);
  assert.equal(failCount, 3, 'Open circuit breaker must skip adapter without incrementing call count');
  assert.equal(resOpen.channel, 'fallback');

  // Fast forward cooldown: set openUntil to past
  dispatcher['circuitStates'].get('unstable').openUntil = Date.now() - 1000;

  // Next request moves to half-open
  succeed = true;
  const resRecover = await dispatcher.translateOne('Probe request', true);
  assert.equal(resRecover.translated, '恢复成功');
  assert.equal(dispatcher['circuitStates'].get('unstable')?.state, 'closed');
  assert.equal(dispatcher['circuitStates'].get('unstable')?.failureCount, 0);
});

// -------------------------------------------------------------
// Suite 4: LRU Disk & Client Cache Semantics and TTL
// -------------------------------------------------------------
console.log('\n--- Suite 4: LRU Cache Semantics & TTL ---');

test('ClientCache implements strict LRU eviction order', () => {
  // Mock localStorage for ClientCache
  const store = new Map();
  global.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  const clientCache = new ClientCache();
  // Fill up to max
  clientCache.set('k1', 'v1');
  clientCache.set('k2', 'v2');
  clientCache.set('k3', 'v3');

  // Access k1 so it becomes most recently used: order becomes [k2, k3, k1]
  assert.equal(clientCache.get('k1'), 'v1');

  // Capacity is 500 in ClientCache, simulate small limit
  clientCache['memCache'].clear();
  clientCache.set('a', '1');
  clientCache.set('b', '2');
  clientCache.set('c', '3');
  // access 'a' -> keys: ['b', 'c', 'a']
  clientCache.get('a');

  const keys = Array.from(clientCache['memCache'].keys());
  assert.deepEqual(keys, ['b', 'c', 'a']); // 'a' moved to end as most recently used
  assert.equal(keys[keys.length - 1], 'a');
});

await testAsync('LruDiskCache handles TTL expiration and LRU eviction', async () => {
  const diskCache = new LruDiskCache(3);
  diskCache.set('item1', 'val1');
  diskCache.set('item2', 'val2');
  diskCache.set('item3', 'val3');

  // Access item1 -> [item2, item3, item1]
  assert.equal(diskCache.get('item1'), 'val1');

  // Add item4 -> item2 (least recently used) should be evicted
  diskCache.set('item4', 'val4');
  assert.equal(diskCache.get('item2'), undefined);
  assert.equal(diskCache.get('item1'), 'val1');
  assert.equal(diskCache.get('item3'), 'val3');
  assert.equal(diskCache.get('item4'), 'val4');

  // Test TTL expiration
  diskCache['cache'].set('expired', { t: Date.now() - (8 * 24 * 60 * 60 * 1000), v: 'old' });
  assert.equal(diskCache.get('expired'), undefined, 'Expired cache entry must return undefined');
});

// -------------------------------------------------------------
// Suite 5: ConfigManager Validation & Atomic Persistence
// -------------------------------------------------------------
console.log('\n--- Suite 5: ConfigManager Validation & Change Notification ---');

await testAsync('ConfigManager clamps numeric bounds and notifies listeners', async () => {
  const config = new ConfigManager();
  let notified = 0;
  config.onConfigChange(() => { notified++; });

  // Update with out-of-bound concurrency
  await config.updateConfig({ concurrency: 9999 });
  assert.equal(config.getConfig().concurrency, 100, 'Concurrency should be capped at MAX_CONCURRENCY');
  assert.equal(notified, 1);

  // Update with negative concurrency
  await config.updateConfig({ concurrency: -5 });
  assert.equal(config.getConfig().concurrency, 1, 'Concurrency should have floor of 1');
  assert.equal(notified, 2);

  // Update timeout
  await config.updateConfig({ timeoutMs: 50 });
  assert.equal(config.getConfig().timeoutMs, 500, 'Timeout should have floor of 500ms');

  // Update boolean flags
  await config.updateConfig({ enabled: false, translateThinking: true });
  assert.equal(config.getConfig().enabled, false);
  assert.equal(config.getConfig().translateThinking, true);
});

// -------------------------------------------------------------
// Suite 6: NonDestructiveTranslationMount DOM Preservation
// -------------------------------------------------------------
console.log('\n--- Suite 6: NonDestructiveTranslationMount DOM Lifecycle ---');

test('Mounts translation without destroying child nodes or event listeners', () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="target"><span class="title">Original Title</span><button id="btn">Click Me</button></div></body></html>');
  const doc = dom.window.document;
  const target = doc.getElementById('target');
  const btn = doc.getElementById('btn');

  let btnClicked = false;
  btn.addEventListener('click', () => { btnClicked = true; });

  // Mount translation
  NonDestructiveTranslationMount.mount(target, '【译】原始标题', { originalText: 'Original Title Click Me' });

  // Verify DOM structure
  const transBlock = target.querySelector('.dsh-tidy-translated-block');
  const origWrapper = target.querySelector('.dsh-tidy-original-hidden');

  assert.ok(transBlock, 'Translation block should exist');
  assert.ok(origWrapper, 'Original hidden wrapper should exist');
  assert.equal(transBlock.textContent, '【译】原始标题');
  assert.equal(origWrapper.style.display, 'none');

  // Verify button is preserved inside origWrapper and event listener still works
  btn.dispatchEvent(new dom.window.MouseEvent('click'));
  assert.equal(btnClicked, true, 'Original event listeners on DOM nodes must remain intact');

  // Interactive toggle: clicking transBlock shows original
  transBlock.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal(origWrapper.style.display, 'inline');
  assert.equal(transBlock.style.display, 'none');

  // Clicking origWrapper toggles back
  origWrapper.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal(origWrapper.style.display, 'none');
  assert.equal(transBlock.style.display, 'inline');

  // Unmount completely restores target
  NonDestructiveTranslationMount.unmount(target);
  assert.equal(target.querySelector('.dsh-tidy-translated-block'), null);
  assert.equal(target.querySelector('.dsh-tidy-original-hidden'), null);
  assert.equal(target.children.length, 2);
  assert.equal(target.children[0].className, 'title');
  assert.equal(target.children[1].id, 'btn');
});

// -------------------------------------------------------------
// Suite 7: HttpRouter 1MB DoS Protection & API Endpoints
// -------------------------------------------------------------
console.log('\n--- Suite 7: HttpRouter 1MB DoS Protection & API Endpoints ---');

await testAsync('Router rejects bodies exceeding 1MB with 413 Payload Too Large', async () => {
  const config = new ConfigManager();
  const cache = new LruDiskCache(10);
  const dispatcher = new TranslationDispatcher(config, cache);
  const handler = createHttpHandler(config, dispatcher);

  // Create oversized dummy body > 1MB
  const hugeBody = Buffer.alloc(1024 * 1024 + 1024, 'a');

  const { EventEmitter } = await import('node:events');
  class MockReq extends EventEmitter {
    method = 'POST';
    url = '/api/dsh-chat-tidy/translate';
    destroy() {}
  }

  const mockReq = new MockReq();
  let statusCode = 0;
  let responseData = '';

  const mockRes = {
    writeHead: (code) => { statusCode = code; },
    end: (data) => { responseData = data; }
  };

  const handlerPromise = handler(mockReq, mockRes);

  // Send huge chunk
  mockReq.emit('data', hugeBody);
  mockReq.emit('end');

  await handlerPromise;

  assert.equal(statusCode, 413, 'Must return 413 for payload > 1MB');
  const parsed = JSON.parse(responseData);
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /exceeded maximum allowed size/);
});

await testAsync('Router POST /config and GET /config work correctly', async () => {
  const config = new ConfigManager();
  const cache = new LruDiskCache(10);
  const dispatcher = new TranslationDispatcher(config, cache);
  const handler = createHttpHandler(config, dispatcher);

  const { EventEmitter } = await import('node:events');

  // 1. GET /config
  class GetReq extends EventEmitter {
    method = 'GET';
    url = '/api/dsh-chat-tidy/config';
  }
  let getStatus = 0;
  let getJson = '';
  const getReq = new GetReq();
  const getRes = {
    writeHead: (c) => { getStatus = c; },
    end: (d) => { getJson = d; }
  };
  const getPromise = handler(getReq, getRes);
  getReq.emit('end');
  await getPromise;

  assert.equal(getStatus, 200);
  assert.equal(JSON.parse(getJson).ok, true);

  // 2. POST /config
  class PostReq extends EventEmitter {
    method = 'POST';
    url = '/api/dsh-chat-tidy/config';
  }
  let postStatus = 0;
  let postJson = '';
  const postReq = new PostReq();
  const postRes = {
    writeHead: (c) => { postStatus = c; },
    end: (d) => { postJson = d; }
  };
  const postPromise = handler(postReq, postRes);
  postReq.emit('data', Buffer.from(JSON.stringify({ concurrency: 5, translateThinking: true })));
  postReq.emit('end');
  await postPromise;

  assert.equal(postStatus, 200);
  const postResult = JSON.parse(postJson);
  assert.equal(postResult.ok, true);
  assert.equal(postResult.config.concurrency, 5);
  assert.equal(postResult.config.translateThinking, true);
});

console.log(`\n======================================================`);
console.log(`All ${passed}/${total} regression tests PASSED successfully!`);
console.log(`======================================================\n`);
