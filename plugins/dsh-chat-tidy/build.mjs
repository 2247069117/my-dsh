import { build } from 'esbuild';
import { mkdirSync, existsSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';

mkdirSync('lib', { recursive: true });

// 1. Host build
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  logLevel: 'info',
});

// 2. Client build
await build({
  entryPoints: ['src/client/index.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  external: ['react', 'react-dom'],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-chat-tidy', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
});

// 3. Types build
try {
  if (existsSync('node_modules/.bin/tsc')) {
    execFileSync('node_modules/.bin/tsc', ['-p', 'tsconfig.json'], { stdio: 'inherit' });
  } else {
    execSync('pnpm exec tsc -p tsconfig.json', { stdio: 'inherit' });
  }
} catch (err) {
  console.warn('[dsh-chat-tidy] tsc emit skipped or failed:', err?.message || err);
}
