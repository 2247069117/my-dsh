// Channel truth table (user contract), credentials parsing tolerance and
// circuit-breaker single-flight probe verification.
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { ConfigManager } from '../src/server/config.ts';
import { LruDiskCache } from '../src/server/cache.ts';
import { TranslationDispatcher } from '../src/server/dispatcher.ts';
import { parseRefs, CredentialsReader } from '../src/server/credentials.ts';

// Isolate file-backed state into a temp dir.
const TMP_HOME = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-chat-tidy-chtest-'));
process.env.DSH_HOME = TMP_HOME;

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

console.log('=== Suite A: credentials parseRefs tolerance ===');

test('parses plain, quoted and numeric values', () => {
  const refs = parseRefs(`version: 1
refs:
  PLAIN_API_KEY: sk-abc123
  QUOTED_API_KEY: "sk-quoted"
  NUMERIC_API_KEY: "123456"
  SINGLE_QUOTED: 'sk-single'
records:
  some/record:
    kind: grant
`);
  assert.equal(refs.PLAIN_API_KEY, 'sk-abc123');
  assert.equal(refs.QUOTED_API_KEY, 'sk-quoted');
  assert.equal(refs.NUMERIC_API_KEY, '123456');
  assert.equal(refs.SINGLE_QUOTED, 'sk-single');
  assert.equal(refs['some/record'], undefined, 'nested records must not leak into refs');
});

test('strips inline comments before quotes', () => {
  const refs = parseRefs(`refs:
  COMMENTED: sk-abc # primary key
  QUOTED_COMMENTED: "sk-quoted" # with note
  HASH_INSIDE: "a#b"
  HASH_SPACE_INSIDE: "ab #cd"
`);
  assert.equal(refs.COMMENTED, 'sk-abc');
  assert.equal(refs.QUOTED_COMMENTED, 'sk-quoted', 'quotes must be stripped after comment removal');
  assert.equal(refs.HASH_INSIDE, 'a#b', 'quoted value containing # must survive');
  assert.equal(refs.HASH_SPACE_INSIDE, 'ab #cd', 'a " #" INSIDE quotes must not be treated as a comment');
});

test('skips empty values and top-level keys', () => {
  const refs = parseRefs(`version: 1
refs:
  EMPTY: ""
  FILLED: sk-x
`);
  assert.equal(refs.EMPTY, undefined);
  assert.equal(refs.FILLED, 'sk-x');
  assert.equal(refs.version, undefined);
});

console.log('\n=== Suite B: dual-channel truth table (user contract) ===');

await testAsync('AI on+configured, Bing on -> AI only', async () => {
  const { dispatcher, calls } = await setupDispatcher();
  await dispatcher.configManager.updateConfig({ aiEnabled: true, bingEnabled: true, baseUrl: 'http://x', model: 'm' });
  const r = await dispatcher.translateOne('TT1: List files here');
  assert.deepEqual(calls, ['openai']);
  assert.equal(r.channel, 'openai');
});

await testAsync('AI on+NOT configured, Bing on -> Bing', async () => {
  const { dispatcher, calls } = await setupDispatcher();
  await dispatcher.configManager.updateConfig({ aiEnabled: true, bingEnabled: true });
  const r = await dispatcher.translateOne('TT2: List files here');
  assert.deepEqual(calls, ['bing']);
  assert.equal(r.channel, 'bing');
});

await testAsync('AI on+NOT configured, Bing off -> no translation', async () => {
  const { dispatcher, calls } = await setupDispatcher();
  await dispatcher.configManager.updateConfig({ aiEnabled: true, bingEnabled: false });
  const r = await dispatcher.translateOne('TT3: List files here');
  assert.deepEqual(calls, []);
  assert.equal(r.channel, 'fallback');
});

await testAsync('AI off, Bing on -> Bing', async () => {
  const { dispatcher, calls } = await setupDispatcher();
  await dispatcher.configManager.updateConfig({ aiEnabled: false, bingEnabled: true, baseUrl: 'http://x', model: 'm' });
  const r = await dispatcher.translateOne('TT4: List files here');
  assert.deepEqual(calls, ['bing']);
  assert.equal(r.channel, 'bing');
});

await testAsync('AI off, Bing off -> no translation', async () => {
  const { dispatcher, calls } = await setupDispatcher();
  await dispatcher.configManager.updateConfig({ aiEnabled: false, bingEnabled: false });
  const r = await dispatcher.translateOne('TT5: List files here');
  assert.deepEqual(calls, []);
  assert.equal(r.channel, 'fallback');
});

await testAsync('AI failure falls back to Bing', async () => {
  const { dispatcher, calls } = await setupDispatcher({ failOpenai: true });
  await dispatcher.configManager.updateConfig({ aiEnabled: true, bingEnabled: true, baseUrl: 'http://x', model: 'm' });
  const r = await dispatcher.translateOne('TT6: List files here');
  assert.deepEqual(calls, ['openai', 'bing']);
  assert.equal(r.channel, 'bing');
});

async function setupDispatcher({ failOpenai = false } = {}) {
  const cfg = new ConfigManager();
  await cfg.init();
  // Reset to a clean baseline — ConfigManager persists to the shared temp dir
  // across tests, so stale baseUrl/model from a previous test must not leak in.
  await cfg.updateConfig({ enabled: true, aiEnabled: false, bingEnabled: false, baseUrl: '', model: '', concurrency: 3 });
  const cache = new LruDiskCache();
  await cache.init();
  const dispatcher = new TranslationDispatcher(cfg, cache);
  dispatcher.credentials = { getApiKey: () => 'sk-test' };
  const calls = [];
  for (const id of ['openai', 'bing']) {
    dispatcher.adapters.set(id, {
      id,
      name: id,
      isAvailable: () => true,
      translate: async (t) => {
        calls.push(id);
        if (id === 'openai' && failOpenai) throw new Error('AI boom');
        return `[${id}]${t}`;
      },
    });
  }
  return { dispatcher, calls };
}

console.log('\n=== Suite C: circuit breaker half-open single-flight ===');

await testAsync('Only one probe passes while half-open', async () => {
  const cfg = new ConfigManager();
  await cfg.init();
  const cache = new LruDiskCache();
  await cache.init();
  const dispatcher = new TranslationDispatcher(cfg, cache);
  dispatcher.credentials = { getApiKey: () => 'sk-test' };
  await cfg.updateConfig({ aiEnabled: false, bingEnabled: false, concurrency: 5 });

  let calls = 0;
  let succeed = false;
  dispatcher.adapters.set('unstable', {
    id: 'unstable',
    name: 'Unstable',
    isAvailable: () => true,
    translate: async (t) => {
      calls++;
      await new Promise((r) => setTimeout(r, 80));
      if (!succeed) throw new Error('boom');
      return `ok:${t}`;
    },
  });

  // Trip the circuit: 3 consecutive failures -> OPEN
  await dispatcher.translateOne('F1');
  await dispatcher.translateOne('F2');
  await dispatcher.translateOne('F3');
  const state = dispatcher.circuitStates.get('unstable');
  assert.equal(state.state, 'open');

  // Fast-forward the cooling window -> next call enters half-open
  state.openUntil = Date.now() - 100;

  // Fire 3 concurrent requests with the adapter healthy: exactly ONE may reach
  // the adapter as probe; the other two must be blocked by the single-flight guard.
  succeed = true;
  calls = 0;
  const results = await Promise.all([
    dispatcher.translateOne('P1'),
    dispatcher.translateOne('P2'),
    dispatcher.translateOne('P3'),
  ]);
  assert.equal(calls, 1, 'half-open must allow exactly one in-flight probe');
  const probed = results.filter((r) => r.channel === 'unstable').length;
  assert.equal(probed, 1);
  assert.equal(state.state, 'closed', 'successful probe resets the circuit to closed');
  assert.equal(state.probeInFlight, false);

  // Circuit is closed again: normal traffic flows
  const r4 = await dispatcher.translateOne('P4');
  assert.equal(r4.channel, 'unstable');
});

await testAsync('Empty probe result releases the single-flight flag', async () => {
  const cfg = new ConfigManager();
  await cfg.init();
  const cache = new LruDiskCache();
  await cache.init();
  const dispatcher = new TranslationDispatcher(cfg, cache);
  dispatcher.credentials = { getApiKey: () => 'sk-test' };
  await cfg.updateConfig({ aiEnabled: false, bingEnabled: false, concurrency: 5 });

  let calls = 0;
  let empty = true;
  dispatcher.adapters.set('emptyish', {
    id: 'emptyish',
    name: 'Emptyish',
    isAvailable: () => true,
    translate: async (t) => {
      calls++;
      if (empty) return ''; // empty result, no throw
      return `ok:${t}`;
    },
  });

  // Empty results count as failures -> circuit opens after 3
  await dispatcher.translateOne('E1');
  await dispatcher.translateOne('E2');
  await dispatcher.translateOne('E3');
  const state = dispatcher.circuitStates.get('emptyish');
  assert.equal(state.state, 'open', 'empty results must count as failures');

  // Fast-forward -> half-open probe returns empty: the single-flight flag
  // must be released, otherwise the channel would be bypassed forever.
  state.openUntil = Date.now() - 100;
  calls = 0;
  const r = await dispatcher.translateOne('E4');
  assert.equal(calls, 1, 'probe ran');
  assert.equal(state.probeInFlight, false, 'empty probe must release the flag');
  assert.equal(state.state, 'open', 'empty probe re-opens the circuit');

  // After cooldown a healthy probe succeeds and closes the circuit
  state.openUntil = Date.now() - 100;
  empty = false;
  calls = 0;
  const r2 = await dispatcher.translateOne('E5');
  assert.equal(calls, 1);
  assert.equal(r2.channel, 'emptyish');
  assert.equal(state.state, 'closed');
});

console.log('\n=== Suite D: config sanitization ===');

await testAsync('Non-boolean enabled from old config is reset to default', async () => {
  await fs.writeFile(
    path.join(TMP_HOME, 'dsh-chat-tidy-config.json'),
    JSON.stringify({ enabled: 'false', channels: ['bing'], concurrency: 3 }),
    'utf-8'
  );
  const cfg = new ConfigManager();
  await cfg.init();
  assert.equal(typeof cfg.getConfig().enabled, 'boolean');
  assert.equal(cfg.getConfig().enabled, true, 'string "false" is reset to the default (true)');
  assert.equal(cfg.getConfig().channels, undefined, 'retired channels field is dropped');
});

console.log('\n=== Suite E: CredentialsReader.setApiKey ===');

await testAsync('setApiKey inserts into existing refs and preserves the rest of the file', async () => {
  const credPath = path.join(TMP_HOME, '.credentials.yaml');
  await fs.writeFile(credPath, `version: 1
refs:
  DEEPSEEK_API_KEY: sk-keep
records:
  x/y:
    kind: grant
    payload:
      version: 1
      secret: abc
`, 'utf-8');
  const reader = new CredentialsReader();
  await reader.setApiKey('sk-new');
  const content = await fs.readFile(credPath, 'utf-8');
  assert.ok(content.includes('TRANSLATE_API_KEY: "sk-new"'), 'new ref must be present');
  assert.ok(content.includes('DEEPSEEK_API_KEY: sk-keep'), 'existing ref preserved');
  assert.ok(content.includes('records:'), 'records section preserved');
  assert.ok(content.includes('x/y:'), 'records content preserved');
  assert.ok(content.includes('secret: abc'), 'records payload preserved');
  assert.equal(reader.getApiKey(), 'sk-new', 'cached key must reflect the new value immediately');
});

await testAsync('setApiKey replaces an existing TRANSLATE_API_KEY line in place', async () => {
  const credPath = path.join(TMP_HOME, '.credentials.yaml');
  await fs.writeFile(credPath, `version: 1
refs:
  TRANSLATE_API_KEY: "sk-old"
  DEEPSEEK_API_KEY: sk-keep
`, 'utf-8');
  const reader = new CredentialsReader();
  await reader.setApiKey('sk-newer');
  const content = await fs.readFile(credPath, 'utf-8');
  assert.ok(content.includes('TRANSLATE_API_KEY: "sk-newer"'));
  assert.ok(!content.includes('sk-old'));
  assert.equal(content.match(/TRANSLATE_API_KEY/g)?.length, 1, 'no duplicated lines');
  assert.ok(content.includes('DEEPSEEK_API_KEY: sk-keep'));
});

await testAsync('setApiKey with empty value removes the ref (clear)', async () => {
  const credPath = path.join(TMP_HOME, '.credentials.yaml');
  await fs.writeFile(credPath, `version: 1
refs:
  TRANSLATE_API_KEY: "sk-old"
  DEEPSEEK_API_KEY: sk-keep
`, 'utf-8');
  const reader = new CredentialsReader();
  await reader.setApiKey('   ');
  const content = await fs.readFile(credPath, 'utf-8');
  assert.ok(!content.includes('TRANSLATE_API_KEY'), 'ref must be removed');
  assert.ok(content.includes('DEEPSEEK_API_KEY: sk-keep'));
  assert.equal(reader.getApiKey(), '', 'cleared key reads back empty');
});

await testAsync('setApiKey creates the file with 0600 permissions when missing', async () => {
  const defaultPath = path.join(TMP_HOME, '.credentials.yaml');
  await fs.rm(defaultPath, { force: true });
  const reader = new CredentialsReader();
  await reader.setApiKey('sk-fresh');
  const stat = await fs.stat(defaultPath);
  assert.equal(stat.mode & 0o777, 0o600, 'credentials file must be 0600');
  const content = await fs.readFile(defaultPath, 'utf-8');
  assert.ok(content.includes('TRANSLATE_API_KEY: "sk-fresh"'));
  assert.ok(content.includes('version: 1'));
});

console.log('\n======================================================');
console.log(`All ${passed}/${total} channel-logic tests PASSED successfully!`);
console.log('======================================================\n');
