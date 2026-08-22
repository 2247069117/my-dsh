// Standalone verifier for the dsh-message-edit-log-compat patch.
//
// Drives the REAL persistence read path (JsonlSessionPersistence backend ->
// PersistenceCoordinator.load -> prepareCore -> adoptStoredEvents ->
// assertEventsSupported) in a fresh Node process — the exact path the web
// server takes when restoring stored session history.
//
// Usage:
//   node verify-session-load.mjs                    scan all stored sessions
//   node verify-session-load.mjs <session-id>       load one session
//   node verify-session-load.mjs scan <id>          load + also scan all
//
// Env:
//   DSH_SESSION_PKG     path to the @deepseek-ai/dsh-session package dir
//                       (default: derived from `dsh` bin / `npm root -g`,
//                       incl. the nested .../dsh/node_modules/@deepseek-ai layout)
//   DSH_SESSIONS_ROOT   root of stored session logs (default: ~/.dsh/sessions)
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

function sessionPkgDir() {
  if (process.env.DSH_SESSION_PKG) return path.resolve(process.env.DSH_SESSION_PKG);
  const candidates = [];
  try {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    candidates.push(path.join(root, "@deepseek-ai", "dsh", "node_modules", "@deepseek-ai", "dsh-session"));
    candidates.push(path.join(root, "@deepseek-ai", "dsh-session"));
  } catch {}
  try {
    const bin = execFileSync("sh", ["-c", "command -v dsh"], { encoding: "utf8" }).trim();
    const real = execFileSync("python3", ["-c", "import os,sys; print(os.path.realpath(sys.argv[1]))", bin], { encoding: "utf8" }).trim();
    // bin -> <global>/lib/node_modules/@deepseek-ai/dsh/lib/bin.js
    const root = path.join(real, "..", "..", "..", "..");
    candidates.push(path.join(root, "@deepseek-ai", "dsh", "node_modules", "@deepseek-ai", "dsh-session"));
    candidates.push(path.join(root, "@deepseek-ai", "dsh-session"));
  } catch {}
  for (const c of candidates) {
    if (existsSync(c) && existsSync(path.join(c, "lib", "index.js"))) return c;
  }
  throw new Error("cannot locate the @deepseek-ai/dsh-session package; set DSH_SESSION_PKG");
}

const SESSION_PKG = sessionPkgDir();
const PKGS_DIR = path.dirname(SESSION_PKG);
const SESSIONS_ROOT = process.env.DSH_SESSIONS_ROOT ?? path.join(homedir(), ".dsh", "sessions");

const { JsonlSessionPersistence } = await import(
  path.join(PKGS_DIR, "dsh-session-persistence-jsonl", "lib", "index.js")
);
const { Session } = await import(
  path.join(SESSION_PKG, "lib", "index.js")
);

const logger = { warn() {}, info() {}, error() {}, debug() {} };
const sessionsStub = {
  get: () => undefined,
  list: () => [],
  prepare: (id, options) => Session.fromRestore(id, options.seed, options.meta)
};
const ctx = {
  logger,
  reflect: { provide() {}, dispose() {} },
  get(key) {
    if (key === "sessions") return sessionsStub;
    if (key === "logger") return logger;
    return undefined;
  },
  sessions: sessionsStub,
  on() {},
  emit() {},
  once() {},
  effect() { return () => {}; },
  dispose() {},
  uid() { return "stub"; }
};

const backend = new JsonlSessionPersistence(ctx, {
  root: SESSIONS_ROOT,
  compression: "zstd",
  packChunks: true
});

async function loadOne(id) {
  const view = await backend.coordinator.load(id);
  const events = view.events;
  const mv = events.filter((e) => e.type === "message-edit/version");
  const seqs = events.map((e) => e.seq);
  const contiguous = seqs.every((s, i) => s === i);
  const mvDesc = mv.map((e) => ({ seq: e.seq, ignorable: e.ignorable }));
  return { id, events: events.length, contiguous, meta: view.meta, mv: mvDesc };
}

const targets = process.argv[2]
  ? [process.argv[2]]
  : (await backend.list()).map((h) => h.id);

let failed = 0;
for (const id of targets) {
  try {
    const ok = await loadOne(id);
    console.log(
      `LOAD OK: ${id}\n` +
      `  events=${ok.events} contiguousSeq=${ok.contiguous}\n` +
      `  meta.id=${ok.meta.id} seedLength=${ok.meta.seedLength ?? "-"} parent=${ok.meta.parentSession ?? "-"}\n` +
      `  message-edit/version events: ${JSON.stringify(ok.mv)}`
    );
  } catch (error) {
    failed += 1;
    console.error(`LOAD FAILED: ${id}\n${String(error && error.stack ? error.stack : error)}`);
  }
}
console.log(`\nchecked ${targets.length} session(s), ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;