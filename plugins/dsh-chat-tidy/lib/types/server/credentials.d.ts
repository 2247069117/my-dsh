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
export declare const TRANSLATE_API_KEY_REF = "TRANSLATE_API_KEY";
/**
 * Parse the `refs` section of the credentials file into a flat map.
 * Returns an empty map on any malformed input — callers treat a missing key
 * as "not configured", never as an error.
 */
export declare function parseRefs(yaml: string): Record<string, string>;
export declare class CredentialsReader {
    private filePath;
    private cachedKey;
    private cachedAt;
    constructor();
    /** Read the file fresh on every call so a key added at runtime takes effect immediately. */
    readRefs(): Record<string, string>;
    getApiKey(): string;
    /**
     * Write (or clear) the TRANSLATE_API_KEY ref, preserving every other line of
     * the file (other refs, records section, comments). The file stays the single
     * source of truth for credentials and keeps 0600 permissions. An empty key
     * removes the ref entirely.
     */
    setApiKey(apiKey: string): Promise<void>;
}
