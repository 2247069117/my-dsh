import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Reads API keys from the shared DSH credentials file (~/.dsh/.credentials.yaml).
 *
 * The file is a tiny flat YAML document shaped like:
 *
 *   version: 1
 *   refs:
 *     DEEPSEEK_API_KEY: sk-...
 *     TRANSLATE_API_KEY: sk-...
 *   records:
 *     ...
 *
 * We only need the `refs` section (flat `KEY: value` pairs), so instead of
 * pulling in a YAML dependency we parse it with a small tolerant scanner.
 */

/** Refs key that holds the translation API key. */
export const TRANSLATE_API_KEY_REF = 'TRANSLATE_API_KEY';

/**
 * Parse the `refs` section of the credentials file into a flat map.
 * Returns an empty map on any malformed input — callers treat a missing key
 * as "not configured", never as an error.
 */
export function parseRefs(yaml: string): Record<string, string> {
  const refs: Record<string, string> = {};
  let inRefs = false;

  for (const line of yaml.split(/\r?\n/)) {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (indent === 0) {
      // Top-level key — only `refs:` opens the section we care about.
      inRefs = trimmed === 'refs:' || trimmed.startsWith('refs:');
      continue;
    }
    if (!inRefs) continue;

    const m = /^([A-Za-z0-9_.\-]+):\s*(.*)$/.exec(trimmed);
    if (!m) continue;

    let value = m[2].trim();
    // Quote-aware handling: if the value starts with a quote, find the closing
    // quote first so a ` #` INSIDE the quoted value is not treated as a
    // comment. Anything after the closing quote (e.g. ` # note`) is dropped.
    if (value.startsWith('"') || value.startsWith("'")) {
      const q = value[0];
      let close = -1;
      for (let i = 1; i < value.length; i++) {
        if (q === '"' && value[i] === '\\') {
          i++; // skip escaped character
          continue;
        }
        if (value[i] === q) {
          close = i;
          break;
        }
      }
      if (close > 0) {
        let inner = value.slice(1, close);
        if (q === '"') inner = inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        value = inner;
      } else {
        value = value.slice(1); // unterminated quote — take the rest verbatim
      }
    } else {
      // Unquoted value: strip a trailing inline comment (e.g. `key: sk-x # note`)
      const hashIdx = value.indexOf(' #');
      if (hashIdx >= 0) value = value.slice(0, hashIdx).trim();
    }

    if (value) refs[m[1]] = value;
  }
  return refs;
}

/** How long a read key is considered fresh; keeps batches off the disk. */
const KEY_CACHE_TTL_MS = 1000;

export class CredentialsReader {
  private filePath: string;
  private cachedKey = '';
  private cachedAt = 0;

  constructor() {
    const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.filePath = path.join(dshHome, '.credentials.yaml');
  }

  /** Read the file fresh on every call so a key added at runtime takes effect immediately. */
  readRefs(): Record<string, string> {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return parseRefs(content);
    } catch {
      return {};
    }
  }

  getApiKey(): string {
    const now = Date.now();
    if (now - this.cachedAt < KEY_CACHE_TTL_MS) {
      return this.cachedKey;
    }
    this.cachedKey = (this.readRefs()[TRANSLATE_API_KEY_REF] || '').trim();
    this.cachedAt = now;
    return this.cachedKey;
  }

  /**
   * Write (or clear) the TRANSLATE_API_KEY ref, preserving every other line of
   * the file (other refs, records section, comments). The file stays the single
   * source of truth for credentials and keeps 0600 permissions. An empty key
   * removes the ref entirely.
   */
  async setApiKey(apiKey: string): Promise<void> {
    const normalized = apiKey.trim();
    let lines: string[];
    try {
      lines = fs.readFileSync(this.filePath, 'utf-8').split(/\r?\n/);
    } catch {
      // File missing -> create the minimal document shape.
      lines = ['version: 1', 'refs:', 'records: {}'];
    }

    const refsStart = lines.findIndex((l) => l.trim() === 'refs:' || l.trim().startsWith('refs:'));
    let replaced = false;
    if (refsStart >= 0) {
      for (let i = refsStart + 1; i < lines.length; i++) {
        const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
        if (indent === 0) break; // left the refs section
        if (/^TRANSLATE_API_KEY\s*:/.test(lines[i].trim())) {
          if (normalized) {
            lines[i] = `  TRANSLATE_API_KEY: "${escapeYaml(normalized)}"`;
          } else {
            lines.splice(i, 1); // clear -> remove the ref line
          }
          replaced = true;
          break;
        }
      }
    }

    if (!replaced && normalized) {
      if (refsStart >= 0) {
        // Insert at the end of the refs section (before the next top-level key).
        let insertAt = lines.length;
        for (let i = refsStart + 1; i < lines.length; i++) {
          const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
          if (indent === 0 && lines[i].trim()) {
            insertAt = i;
            break;
          }
        }
        lines.splice(insertAt, 0, `  TRANSLATE_API_KEY: "${escapeYaml(normalized)}"`);
      } else {
        // No refs section yet -> create one right after the version line.
        lines.splice(1, 0, 'refs:', `  TRANSLATE_API_KEY: "${escapeYaml(normalized)}"`);
      }
    }

    await fsp.mkdir(path.dirname(this.filePath), { recursive: true });
    // Atomic write: temp file + rename, so a crash mid-write can never leave
    // the credentials file truncated. Keep 0600 permissions throughout.
    const tmpPath = `${this.filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    await fsp.writeFile(tmpPath, lines.join('\n'), 'utf-8');
    await fsp.chmod(tmpPath, 0o600);
    await fsp.rename(tmpPath, this.filePath);

    // Invalidate the short cache so the new key is picked up immediately.
    this.cachedKey = '';
    this.cachedAt = 0;
  }
}

/** Escape a value for a double-quoted YAML scalar. */
function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
