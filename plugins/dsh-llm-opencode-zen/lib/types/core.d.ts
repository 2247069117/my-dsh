/**
 * dsh-llm-opencode-zen — core logic
 *
 * Pure, dependency-free helpers for the DSH harness plugin:
 *  - free model discovery & probing (keyless, no Authorization header)
 *  - model cache (persist, diff, add/remove)
 *
 * Reference implementation (keyless fix):
 *  - https://github.com/NousResearch/hermes-agent/blob/main/hermes_cli/models.py
 *  - https://github.com/NousResearch/hermes-agent/commit/1017a5627475dd490374abaea895f200a120d7d5
 */
export declare const DEFAULT_BASE_URL = "https://opencode.ai/zen/v1";
export declare const DEFAULT_REFRESH_INTERVAL_MS: number;
export declare const PROBE_TTL_MS: number;
export declare const PROBE_CONCURRENCY = 6;
export declare const REQUEST_TIMEOUT_MS = 8000;
/**
 * Free-tier slugs that do NOT carry a "-free" suffix (mirrors the hermes-agent
 * catalog: big-pickle is OpenCode's rotating free stealth slot).
 */
export declare const KEYLESS_EXTRA_SLUGS: Set<string>;
/**
 * True when a model id looks like an OpenCode Zen free-tier slug.
 *
 * NOTE: the name is only the *candidate* filter — it narrows the probing pool.
 * The authoritative verdict comes from the live anonymous probe: models that
 * answer 2xx are kept, models that demand auth (401/403/402) are dropped.
 * Users can extend the candidate list with OPENCODE_ZEN_EXTRA_SLUGS /
 * config["opencode-free"].extraSlugs for free slots that don't carry "-free".
 */
export declare function isFreeCandidate(id: string, extra?: ReadonlySet<string> | null): boolean;
export type Mode = "auto" | "keyless" | "keyed";
export type ProbeResult = "ok" | "bad" | "unknown";
export interface ModelMeta {
    id: string;
    name: string;
    reasoning: boolean;
    toolCall: boolean;
    attachment: boolean;
    context: number;
    output: number;
    firstSeen: string;
    lastProbed: string | null;
}
export interface Cache {
    updatedAt: string;
    mode: Mode;
    baseURL: string;
    models: Record<string, ModelMeta>;
}
export interface RuntimeConfig {
    mode: Mode;
    keyed: boolean;
    apiKey?: string;
    baseURL: string;
    headers: Record<string, string>;
    cacheFile: string;
    refreshIntervalMs: number;
    providerDisabled: boolean;
    skipProbe: boolean;
    /** Extra free-tier candidate slugs from OPENCODE_ZEN_EXTRA_SLUGS / config. */
    extraSlugs: ReadonlySet<string>;
}
export interface FetchResult {
    ok: boolean;
    status: number;
    json: any;
}
export declare function fetchJson(url: string, init?: RequestInit, timeoutMs?: number): Promise<FetchResult>;
/** GET {base}/models — OpenAI-compatible catalog. */
export declare function listModels(baseURL: string, headers: Record<string, string>): Promise<string[]>;
/**
 * Probe whether a model answers keyless requests.
 *  - 2xx         -> "ok" (free & usable)
 *  - 401/403/402 -> "bad" (needs a key / not free)
 *  - 429/5xx/net -> "unknown" (transient — keep previous state)
 *  - other 4xx   -> try the next endpoint family (chat/completions -> responses -> messages)
 */
export declare function probeModel(baseURL: string, modelId: string, headers: Record<string, string>): Promise<ProbeResult>;
export declare function humanizeModelName(id: string): string;
export declare function guessReasoning(id: string): boolean;
export declare function guessContext(id: string): number;
export declare function guessOutput(id: string): number;
export declare function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]>;
export interface SyncOptions {
    baseURL: string;
    headers: Record<string, string>;
    cache: Cache;
    mode: Mode;
    skipProbe?: boolean;
    /**
     * Keyless mode: only consider "-free" slugs (+ known extras) as candidates.
     * Defaults to `mode !== "keyed"` — paid models are never probed anonymously.
     */
    freeOnly?: boolean;
    /** Extra free-tier candidate slugs (see isFreeCandidate). */
    extraSlugs?: ReadonlySet<string>;
    probeTTLMs?: number;
    concurrency?: number;
    now?: number;
}
export interface SyncResult {
    cache: Cache;
    added: string[];
    removed: string[];
}
/**
 * Fetch the catalog, probe candidates (unless skipped), and diff against the
 * cached model list:
 *  - models that disappear from /models or fail a probe are removed
 *  - brand-new usable models are added
 *  - transient failures keep the previous entry
 */
export declare function computeNextModels(opts: SyncOptions): Promise<SyncResult>;
export declare function loadCache(cacheFile: string): Cache;
export declare function saveCache(cacheFile: string, cache: Cache): void;
