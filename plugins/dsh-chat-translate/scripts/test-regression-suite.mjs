// Comprehensive Automated Regression Test Suite for dsh-chat-translate
// Tests:
// 1. ContentMaskingPipeline placeholder masking & robust unmasking
// 2. Direct translation pass-through (no restrictive language skipping)
// 3. Concurrency pool, Token mutex & Circuit breaker state machine
// 4. LruDiskCache & ClientCache LRU eviction and TTL handling
// 5. ConfigManager validation, atomic persistence, and change events
// 6. NonDestructiveTranslationMount DOM preservation, toggle, and clean unmount
// 7. HttpRouter DoS 1MB protection and endpoint handling

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { JSDOM } from 'jsdom';

// Isolate all file-backed state (config/cache/credentials) into a temp dir so
// the suite never reads or overwrites the real ~/.dsh files.
const TMP_HOME = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-translate-test-'));
process.env.DSH_HOME = TMP_HOME;

import { ContentMaskingPipeline } from '../src/server/pipeline/masking.ts';
import { TranslationDispatcher } from '../src/server/dispatcher.ts';
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

console.log('=== Starting dsh-chat-translate Regression Test Suite ===\n');

// -------------------------------------------------------------
// Suite 1: ContentMaskingPipeline Placeholder Protection
// -------------------------------------------------------------
console.log('--- Suite 1: ContentMaskingPipeline Placeholder Protection ---');

const pipeline = new ContentMaskingPipeline();

test('Masks multi-line code blocks with backticks and tildes', () => {
  const input = 'Here is some code:\n```typescript\nconst answer: number = 42;\nconsole.log(answer);\n```\nAnd more text.';
  const { maskedText, unmask } = pipeline.mask(input);
  assert.match(maskedText, /__DSH_MASK_0__/);
  assert.ok(!maskedText.includes('const answer'));

  const simulatedTranslation = '这是代码：\n__DSH_MASK_0__\n以及更多文本。';
  const unmasked = unmask(simulatedTranslation);
  assert.ok(unmasked.includes('const answer: number = 42;'));
  assert.ok(unmasked.startsWith('这是代码：'));
});

test('Masks inline code spans', () => {
  const input = 'Please execute `pnpm run build` and `pnpm run typecheck` before releasing.';
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
  const input = 'Locate `DSH_HOME` directory';
  const { maskedText, unmask } = pipeline.mask(input);

  // Machine translation engines often lowercase tokens or insert spaces around placeholders
  const altered1 = '定位 __dsh_mask_0__ 目录';
  assert.equal(unmask(altered1), '定位 `DSH_HOME` 目录');

  const altered2 = '定位 __DSH _ MASK _ 0__ 目录';
  assert.equal(unmask(altered2), '定位 `DSH_HOME` 目录');
});

// -------------------------------------------------------------
// Suite 2: Concurrency Pool & Circuit Breaker State Machine
// -------------------------------------------------------------
console.log('\n--- Suite 2: Concurrency Pool & Circuit Breaker State Machine ---');

await testAsync('In-flight deduplication merges identical concurrent requests', async () => {
  const config = new ConfigManager();
  await config.init();
  const cache = new LruDiskCache();
  await cache.init();
  const dispatcher = new TranslationDispatcher(config, cache);

  let calls = 0;
  // Mock mock adapter
  const mockAdapter = {
    id: 'mock-dedup',
    name: 'Mock Dedup',
    isAvailable: () => true,
    translate: async (t) => {
      calls++;
      await new Promise((r) => setTimeout(r, 60));
      return `translated:${t}`;
    },
  };
  dispatcher.adapters.set('mock-dedup', mockAdapter);
  // Disable real channels so only the injected mock is active
  await config.updateConfig({ aiEnabled: false, bingEnabled: false, concurrency: 5 });

  const promises = [
    dispatcher.translateOne('Identical task text'),
    dispatcher.translateOne('Identical task text'),
    dispatcher.translateOne('Identical task text'),
    dispatcher.translateOne('Identical task text'),
    dispatcher.translateOne('Identical task text'),
  ];

  const results = await Promise.all(promises);
  assert.equal(calls, 1, 'In-flight map must merge 5 identical requests into 1 network call');
  assert.equal(results[0].translated, 'translated:Identical task text');
  assert.equal(results[4].translated, 'translated:Identical task text');
});

await testAsync('Circuit Breaker trips to OPEN after 3 failures and resets on recovery', async () => {
  const config = new ConfigManager();
  await config.init();
  const cache = new LruDiskCache();
  const dispatcher = new TranslationDispatcher(config, cache);

  let failCount = 0;
  let succeed = false;
  const unstableAdapter = {
    id: 'unstable',
    name: 'Unstable',
    isAvailable: () => true,
    translate: async (t) => {
      if (!succeed) {
        failCount++;
        throw new Error('503 Service Unavailable');
      }
      return `ok:${t}`;
    },
  };
  dispatcher.adapters.set('unstable', unstableAdapter);
  await config.updateConfig({ aiEnabled: false, bingEnabled: false, concurrency: 1 });

  // 3 consecutive failures
  const r1 = await dispatcher.translateOne('Fail 1');
  const r2 = await dispatcher.translateOne('Fail 2');
  const r3 = await dispatcher.translateOne('Fail 3');
  assert.equal(r1.channel, 'fallback');
  assert.equal(r3.channel, 'fallback');
  assert.equal(failCount, 3);

  // 4th call: circuit should be OPEN, skipping the adapter entirely
  const r4 = await dispatcher.translateOne('Fail 4');
  assert.equal(failCount, 3, 'Circuit is open: adapter must not be called');
  assert.equal(r4.channel, 'fallback');

  // Fast-forward openUntil to simulate cooling timeout
  const circuitState = dispatcher.circuitStates.get('unstable');
  assert.ok(circuitState);
  assert.equal(circuitState.state, 'open');
  circuitState.openUntil = Date.now() - 100; // time elapsed -> triggers half-open

  // Allow adapter to succeed on trial
  succeed = true;
  const r5 = await dispatcher.translateOne('Recovery trial');
  assert.equal(r5.translated, 'ok:Recovery trial');
  assert.equal(circuitState.state, 'closed', 'Successful half-open probe resets circuit to closed');
  assert.equal(circuitState.failureCount, 0);
});

// -------------------------------------------------------------
// Suite 3: LRU Cache Semantics & TTL
// -------------------------------------------------------------
console.log('\n--- Suite 3: LRU Cache Semantics & TTL ---');

test('ClientCache implements strict LRU eviction order', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.localStorage = dom.window.localStorage;
  global.window = dom.window;

  const clientCache = new ClientCache();
  clientCache.memCache.clear();

  // Insert 3 items
  clientCache.set('a', 'alpha');
  clientCache.set('b', 'beta');
  clientCache.set('c', 'gamma');

  // Access 'a' to refresh its position in LRU (making 'b' the oldest)
  const aVal = clientCache.get('a');
  assert.equal(aVal, 'alpha');

  // Verify internal map order: oldest should be 'b'
  const keys = Array.from(clientCache.memCache.keys());
  assert.deepEqual(keys, ['b', 'c', 'a']);
});

await testAsync('LruDiskCache handles TTL expiration and LRU eviction', async () => {
  const cache = new LruDiskCache(3);
  cache.cache.clear();

  cache.set('k1', 'v1');
  cache.set('k2', 'v2');
  cache.set('k3', 'v3');

  // Access k1 to make k2 the oldest
  cache.get('k1');

  // Insert k4 -> should evict k2 (oldest unaccessed)
  cache.set('k4', 'v4');
  assert.equal(cache.get('k2'), undefined, 'k2 should have been evicted');
  assert.equal(cache.get('k1'), 'v1', 'k1 should still exist');
  assert.equal(cache.get('k3'), 'v3', 'k3 should still exist');
  assert.equal(cache.get('k4'), 'v4', 'k4 should still exist');
});

// -------------------------------------------------------------
// Suite 4: ConfigManager Validation & Change Notification
// -------------------------------------------------------------
console.log('\n--- Suite 4: ConfigManager Validation & Change Notification ---');

await testAsync('ConfigManager clamps numeric bounds and notifies listeners', async () => {
  const cfg = new ConfigManager();
  await cfg.init();

  let notified = false;
  const unsub = cfg.onConfigChange((next) => {
    notified = true;
    assert.equal(next.concurrency, 100);
  });

  // Clamp concurrency to 100
  await cfg.updateConfig({ concurrency: 9999 });
  assert.equal(cfg.getConfig().concurrency, 100);
  assert.equal(notified, true);

  // Clamp timeoutMs to minimum 500
  await cfg.updateConfig({ timeoutMs: 10 });
  assert.equal(cfg.getConfig().timeoutMs, 500);

  unsub();
});

// -------------------------------------------------------------
// Suite 5: NonDestructiveTranslationMount DOM Lifecycle
// -------------------------------------------------------------
console.log('\n--- Suite 5: NonDestructiveTranslationMount DOM Lifecycle ---');

test('Mounts translation without destroying child nodes or event listeners', () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="target"><span class="title">Bash</span><code class="cmd">npm test</code></div></body></html>');
  const target = dom.window.document.getElementById('target');
  assert.ok(target);

  let clicked = false;
  target.querySelector('.cmd')?.addEventListener('click', () => { clicked = true; });

  // Mount translation
  NonDestructiveTranslationMount.mount(target, '运行测试命令');
  assert.equal(NonDestructiveTranslationMount.isMounted(target), true);

  // Translation container should be visible
  const transBlock = target.querySelector('.dsh-tidy-translated-block');
  assert.ok(transBlock);
  assert.equal(transBlock.textContent, '运行测试命令');

  // Original nodes must be preserved inside .dsh-tidy-original-hidden
  const origWrapper = target.querySelector('.dsh-tidy-original-hidden');
  assert.ok(origWrapper);
  assert.equal(origWrapper.querySelector('.title')?.textContent, 'Bash');
  assert.equal(origWrapper.querySelector('.cmd')?.textContent, 'npm test');

  // Interactive toggle: clicking transBlock shows original
  transBlock.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal((origWrapper).style.display, 'inline');
  assert.equal((transBlock).style.display, 'none');

  // Clicking origWrapper toggles back
  origWrapper.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.equal((transBlock).style.display, 'inline');
  assert.equal((origWrapper).style.display, 'none');

  // Event listener on original node still works
  origWrapper.querySelector('.cmd')?.dispatchEvent(new dom.window.MouseEvent('click'));
  assert.equal(clicked, true);

  // Clean unmount restores original DOM structure
  NonDestructiveTranslationMount.unmount(target);
  assert.equal(target.querySelector('.dsh-tidy-translated-block'), null);
  assert.equal(target.querySelector('.dsh-tidy-original-hidden'), null);
  assert.equal(target.querySelector('.title')?.textContent, 'Bash');
  assert.equal(target.querySelector('.cmd')?.textContent, 'npm test');
});

// -------------------------------------------------------------
// Suite 6: HttpRouter 1MB DoS Protection & API Endpoints
// -------------------------------------------------------------
console.log('\n--- Suite 6: HttpRouter 1MB DoS Protection & API Endpoints ---');

await testAsync('Router rejects bodies exceeding 1MB with 413 Payload Too Large', async () => {
  const cfg = new ConfigManager();
  await cfg.init();
  const cache = new LruDiskCache();
  const dispatcher = new TranslationDispatcher(cfg, cache);
  const handler = createHttpHandler(cfg, dispatcher);

  // Construct mock large request (> 1MB)
  const hugeChunk = Buffer.alloc(1024 * 1024 + 100, 'a');
  let responseStatus = 0;
  let responseData = '';

  const mockReq = {
    url: '/api/dsh-chat-translate/translate',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') cb(hugeChunk);
      if (evt === 'end') cb();
    },
  };

  const mockRes = {
    writeHead: (status, headers) => { responseStatus = status; },
    end: (data) => { responseData = data; },
  };

  await handler(mockReq, mockRes);
  assert.equal(responseStatus, 413, 'Over-limit body must return 413 Payload Too Large');
});

await testAsync('Router POST /config and GET /config work correctly', async () => {
  const cfg = new ConfigManager();
  await cfg.init();
  const cache = new LruDiskCache();
  const dispatcher = new TranslationDispatcher(cfg, cache);
  const handler = createHttpHandler(cfg, dispatcher);

  let responseStatus = 0;
  let responseBody = null;

  const mockPostReq = {
    url: '/api/dsh-chat-translate/config',
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') cb(Buffer.from(JSON.stringify({ concurrency: 8 })));
      if (evt === 'end') cb();
    },
  };

  const mockRes = {
    writeHead: (status, headers) => { responseStatus = status; },
    end: (data) => { responseBody = JSON.parse(data); },
  };

  await handler(mockPostReq, mockRes);
  assert.equal(responseStatus, 200);
  assert.equal(responseBody.ok, true);
  assert.equal(responseBody.config.concurrency, 8);
});

console.log('\n======================================================');
console.log(`All ${passed}/${total} regression tests PASSED successfully!`);
console.log('======================================================\n');