// dsh-escalation-noop — self-healing patch for @deepseek-ai/dsh-sandbox.
//
// Root cause: approveEscalation() throws when the requested sandbox mode is
// NOT strictly wider than the call's current mode. Sessions running under
// danger-full-access still expose `sandbox_permissions` in the bash/fs tool
// schemas, and models that habitually pass it (e.g. gpt-5.6-luna) hard-fail
// every call with "sandbox escalation to ... is not strictly wider ...".
//
// This plugin rewrites that one branch in the installed lib/index.js so a
// request for the mode the call already runs under becomes a no-op grant
// (real escalations still prompt for approval, downgrades still throw), and
// re-applies the rewrite after every dsh upgrade (upgrades wipe node_modules
// edits).
//
// Restart behavior (why the file edit only affects the NEXT process): the
// host composition imports dsh-sandbox during early base rows (sandbox-policy,
// bash-sandbox, fs-sandbox, ...) while this row activates last, and ESM
// caches the module; tool arguments are deep-frozen at the registry, so no
// in-process interception exists. To keep the broken window as small as
// possible the plugin patches at three moments:
//   1. BOOT      — after an upgrade the first start re-patches the file and
//                  logs a prominent "restart dsh once" notice.
//   2. EXIT      — patching again on clean process exit covers "upgrade while
//                  the app is running": the next start is already clean, so
//                  zero manual restarts are needed.
//   3. INTERVAL  — a periodic re-check (default 5 min, config.intervalMs, 0 to
//                  disable) covers killed/crashed processes and any external
//                  wipe while the app keeps running.
// The only case that still needs one manual restart is an upgrade while dsh
// is fully stopped: the first start imports the unpatched module before any
// user code can run (verified empirically), then the boot-time patch fixes
// the file for the next start.
//
// Constraints honored here:
//   - only Node built-ins are imported (node:fs, node:module, node:path);
//     no @deepseek-ai/* package is ever imported, so this module cannot
//     perturb the dsh-sandbox load order of the host process.
//   - idempotent: the marker "local patch (user)" means "already patched"
//     and every run skips the write.
//   - graceful: any failure logs a warning and returns; boot never fails.

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/** Marker that identifies a patched file (also used by the manual script). */
export const MARKER = "local patch (user)";

/** Default interval between periodic re-checks (0 disables). */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

/** The exact original line (Tab indent), from dsh-sandbox's approveEscalation. */
const OLD_LINE =
	"\tif (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) throw new Error(`sandbox escalation to " +
	'"${mode}" is not strictly wider than this call\'s current "${effectiveMode}" mode`);';

/** The replacement block, byte-identical to the manual patch (Tabs preserved). */
const NEW_BLOCK =
	"\tif (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) {\n" +
	"\t\t// local patch (user): a request for the mode the call already runs under is a\n" +
	"\t\t// no-op grant — nothing widens, so it never prompts a human. Prevents models\n" +
	"\t\t// that habitually pass sandbox_permissions from hard-failing every call.\n" +
	"\t\tif (mode === effectiveMode) return mode;\n" +
	"\t\tthrow new Error(`sandbox escalation to " +
	'"${mode}" is not strictly wider than this call\'s current "${effectiveMode}" mode`);\n' +
	"\t}";

/** Cheap brace/paren balance sanity check (string-aware enough for this file). */
function balanced(source) {
	const closing = { ")": "(", "]": "[", "}": "{" };
	const stack = [];
	for (const ch of source) {
		if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
		else if (ch === ")" || ch === "]" || ch === "}") {
			if (stack.pop() !== closing[ch]) return false;
		}
	}
	return stack.length === 0;
}

/** Atomic write: tmp file + rename, so a crash never leaves a torn file. */
function writeAtomic(file, content) {
	const tmp = `${file}.tmp`;
	fs.writeFileSync(tmp, content);
	fs.renameSync(tmp, file);
}

/**
 * Locate the real lib/index.js of @deepseek-ai/dsh-sandbox.
 * createRequire(import.meta.url).resolve() walks up from this plugin's real
 * location (symlinks followed) and finds the package in the shared module
 * fallback (~/.dsh/profiles/node_modules), which points at the global dsh
 * install. Returns null instead of throwing.
 */
export function findSandboxLib() {
	let packageJson;
	try {
		packageJson = createRequire(import.meta.url).resolve("@deepseek-ai/dsh-sandbox/package.json");
	} catch {
		return null;
	}
	const lib = path.join(path.dirname(packageJson), "lib", "index.js");
	if (!fs.existsSync(lib)) return null;
	return lib;
}

/**
 * Core routine: check one lib/index.js and re-apply the patch when missing.
 * Statuses: "already-patched" | "patched" | "version-changed" |
 * "balance-failed" | "unreadable" | "write-failed" | "resolve-failed".
 * Never throws.
 * @param {string} libFile - absolute path of the sandbox lib/index.js.
 * @param {{ backupDir?: string }} [options]
 */
export function applyPatchToFile(libFile, { backupDir } = {}) {
	let source;
	try {
		source = fs.readFileSync(libFile, "utf8");
	} catch (error) {
		return { status: "unreadable", libFile, error: String(error) };
	}
	if (source.includes(MARKER)) return { status: "already-patched", libFile };
	if (!source.includes(OLD_LINE)) return { status: "version-changed", libFile };
	const patched = source.replace(OLD_LINE, NEW_BLOCK);
	if (!balanced(patched)) return { status: "balance-failed", libFile };
	if (backupDir) {
		try {
			fs.mkdirSync(backupDir, { recursive: true });
			fs.copyFileSync(libFile, path.join(backupDir, "dsh-sandbox.index.js.bak"));
		} catch (error) {
			// Backup is best-effort; continue patching.
			process.stderr.write(`[escalation-noop] backup failed (continuing): ${String(error)}\n`);
		}
	}
	try {
		writeAtomic(libFile, patched);
	} catch (error) {
		return { status: "write-failed", libFile, error: String(error) };
	}
	return { status: "patched", libFile };
}

/**
 * Resolve the sandbox file and patch it once. Never throws; every failure is
 * reported as a status for the caller to log.
 * @param {{ backupDir?: string }} [options]
 */
export function patchEscalationNoop({ backupDir } = {}) {
	const libFile = findSandboxLib();
	if (!libFile) return { status: "resolve-failed" };
	return applyPatchToFile(libFile, { backupDir });
}

/**
 * The Cordis plugin row. Runs at boot (patches the file), at clean process
 * exit, and on a periodic interval, as documented at the top of this file.
 * Config arrives as the SECOND argument (cordis passes the resolved row
 * config there); `ctx.config` is guarded and must not be read.
 * @param {import("cordis").Context} ctx
 * @param {{ intervalMs?: number }} [config]
 */
export default function escalationNoop(ctx, config) {
	const logger = typeof ctx?.logger === "function" ? ctx.logger("escalation-noop") : null;
	const info = (message) => (logger ? logger.info(message) : console.info(`[escalation-noop] ${message}`));
	const warn = (message) => (logger ? logger.warn(message) : console.warn(`[escalation-noop] ${message}`));
	const home = process.env.DSH_HOME || process.env.HOME;
	const backupDir = home ? path.join(home, ".dsh", "patches") : undefined;

	/** Run one check; `loud` controls whether state changes are logged. */
	function runPatch(loud) {
		let result;
		try {
			result = patchEscalationNoop({ backupDir });
		} catch (error) {
			if (loud) warn(`unexpected failure (boot continues): ${error instanceof Error ? error.message : String(error)}`);
			return;
		}
		if (!loud && result.status !== "patched" && result.status !== "version-changed") return;
		switch (result.status) {
			case "already-patched":
				if (loud) info("already patched: same-mode sandbox_permissions is a no-op");
				break;
			case "patched":
				warn("patch applied to @deepseek-ai/dsh-sandbox — restart dsh once for it to take effect (auto re-applied after upgrades)");
				break;
			case "version-changed":
				warn("dsh-sandbox version changed: expected patch text not found — update dsh-escalation-noop (boot continues; the escalation error may recur)");
				break;
			case "balance-failed":
				warn("sanity check failed — patch NOT written (boot continues)");
				break;
			case "resolve-failed":
				warn("@deepseek-ai/dsh-sandbox not resolvable from this profile — is dsh installed globally? (boot continues)");
				break;
			case "unreadable":
			case "write-failed":
				warn(`${result.status}: ${result.error ?? ""} (boot continues)`);
				break;
			default:
				warn(`unknown status ${result.status} (boot continues)`);
		}
	}

	// 1. Boot-time patch (loud: the user must know about the restart).
	runPatch(true);

	// 2. Exit-time patch: covers "upgrade while running" — the next start is
	//    already clean, zero manual restarts. Best-effort and silent.
	const onExit = () => {
		try {
			patchEscalationNoop({ backupDir });
		} catch {
			// Never interfere with shutdown.
		}
	};
	process.on("exit", onExit);

	// 3. Periodic re-check: covers killed/crashed processes and external
	//    wipes while the app keeps running. Silent except when it patches.
	//    The timer is a Service: read it with ctx.get (never ctx.interval —
	//    mixin properties are guard-gated).
	const intervalMs = Number(config?.intervalMs ?? DEFAULT_INTERVAL_MS);
	const timer = typeof ctx?.get === "function" ? ctx.get("timer") : undefined;
	let intervalDisposer;
	if (intervalMs > 0 && timer && typeof timer.interval === "function") {
		intervalDisposer = timer.interval(() => runPatch(false), intervalMs);
	}

	// Fiber-owned cleanup on stop/update/unmount.
	return () => {
		process.removeListener("exit", onExit);
		if (typeof intervalDisposer === "function") intervalDisposer();
	};
}
