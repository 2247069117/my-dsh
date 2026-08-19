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
// edits). The running process is unaffected by the file edit (ESM cache), so
// a restart is required once; after an upgrade the first boot re-patches and
// a second restart restores behavior.
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
 * "balance-failed" | "unreadable". Never throws.
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
 * The Cordis plugin row. Runs at boot, after the base bundle has already
 * imported dsh-sandbox (which is fine: the file edit only affects the next
 * process start, as documented above).
 */
export default function escalationNoop(ctx) {
	const logger = typeof ctx?.logger === "function" ? ctx.logger("escalation-noop") : null;
	const info = (message) => (logger ? logger.info(message) : console.info(`[escalation-noop] ${message}`));
	const warn = (message) => (logger ? logger.warn(message) : console.warn(`[escalation-noop] ${message}`));
	const home = process.env.DSH_HOME || process.env.HOME;
	let result;
	try {
		result = patchEscalationNoop({ backupDir: home ? path.join(home, ".dsh", "patches") : undefined });
	} catch (error) {
		warn(`unexpected failure (boot continues): ${error instanceof Error ? error.message : String(error)}`);
		return;
	}
	switch (result.status) {
		case "already-patched":
			info("already patched: same-mode sandbox_permissions is a no-op");
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
