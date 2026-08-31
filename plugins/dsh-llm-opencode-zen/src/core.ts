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

import * as fs from "node:fs"
import * as path from "node:path"

// ---------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------

export const DEFAULT_BASE_URL = "https://opencode.ai/zen/v1"
export const DEFAULT_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6 hours
export const PROBE_TTL_MS = 24 * 60 * 60 * 1000 // re-probe a model at most once a day
export const PROBE_CONCURRENCY = 6
export const REQUEST_TIMEOUT_MS = 8_000

/**
 * Free-tier slugs that do NOT carry a "-free" suffix (mirrors the hermes-agent
 * catalog: big-pickle is OpenCode's rotating free stealth slot).
 */
export const KEYLESS_EXTRA_SLUGS = new Set(["big-pickle"])

/**
 * True when a model id looks like an OpenCode Zen free-tier slug.
 *
 * NOTE: the name is only the *candidate* filter — it narrows the probing pool.
 * The authoritative verdict comes from the live anonymous probe: models that
 * answer 2xx are kept, models that demand auth (401/403/402) are dropped.
 * Users can extend the candidate list with OPENCODE_ZEN_EXTRA_SLUGS /
 * config["opencode-free"].extraSlugs for free slots that don't carry "-free".
 */
export function isFreeCandidate(id: string, extra?: ReadonlySet<string> | null): boolean {
  const bare = String(id || "").trim().split("/").pop()?.toLowerCase() ?? ""
  if (!bare) return false
  if (bare.endsWith("-free")) return true
  if (KEYLESS_EXTRA_SLUGS.has(bare)) return true
  if (extra && extra.has(bare)) return true
  return false
}

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------

export type Mode = "auto" | "keyless" | "keyed"
export type ProbeResult = "ok" | "bad" | "unknown"

export interface ModelMeta {
  id: string
  name: string
  reasoning: boolean
  toolCall: boolean
  attachment: boolean
  context: number
  output: number
  firstSeen: string
  lastProbed: string | null
}

export interface Cache {
  updatedAt: string
  mode: Mode
  baseURL: string
  models: Record<string, ModelMeta>
}

export interface RuntimeConfig {
  mode: Mode
  keyed: boolean
  apiKey?: string
  baseURL: string
  headers: Record<string, string>
  cacheFile: string
  refreshIntervalMs: number
  providerDisabled: boolean
  skipProbe: boolean
  /** Extra free-tier candidate slugs from OPENCODE_ZEN_EXTRA_SLUGS / config. */
  extraSlugs: ReadonlySet<string>
}

// ---------------------------------------------------------------------------
// model discovery / probing
// ---------------------------------------------------------------------------

export interface FetchResult {
  ok: boolean
  status: number
  json: any
}

export async function fetchJson(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<FetchResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    let json: any = null
    try {
      json = await res.json()
    } catch {
      // non-JSON body is fine for our probing purposes
    }
    return { ok: res.ok, status: res.status, json }
  } finally {
    clearTimeout(timer)
  }
}

/** GET {base}/models — OpenAI-compatible catalog. */
export async function listModels(
  baseURL: string,
  headers: Record<string, string>,
): Promise<string[]> {
  const base = baseURL.replace(/\/+$/, "")
  const { ok, status, json } = await fetchJson(`${base}/models`, { headers })
  if (!ok) throw new Error(`GET /models failed with status ${status}`)
  const data = Array.isArray(json?.data) ? json.data : []
  return data
    .map((m: any) => (typeof m === "string" ? m : m?.id))
    .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
}

const PROBE_ENDPOINTS: Array<{ path: string; body: (model: string) => Record<string, unknown> }> = [
  {
    path: "/v1/chat/completions",
    body: (model) => ({
      model,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
      stream: false,
    }),
  },
  {
    path: "/chat/completions",
    body: (model) => ({
      model,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
      stream: false,
    }),
  },
  {
    path: "/responses",
    body: (model) => ({
      model,
      input: "ping",
      max_output_tokens: 1,
      stream: false,
    }),
  },
  {
    path: "/messages",
    body: (model) => ({
      model,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
      stream: false,
    }),
  },
]

/**
 * Probe whether a model answers keyless requests.
 *  - 2xx         -> "ok" (free & usable)
 *  - 401/403/402 -> "bad" (needs a key / not free)
 *  - 429/5xx/net -> "unknown" (transient — keep previous state)
 *  - other 4xx   -> try the next endpoint family (chat/completions -> responses -> messages)
 */
export async function probeModel(
  baseURL: string,
  modelId: string,
  headers: Record<string, string>,
): Promise<ProbeResult> {
  const base = baseURL.replace(/\/+$/, "")
  let sawBad = false
  for (const ep of PROBE_ENDPOINTS) {
    let res: FetchResult
    try {
      res = await fetchJson(`${base}${ep.path}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(ep.body(modelId)),
      })
    } catch {
      return "unknown"
    }
    if (res.ok) return "ok"
    if (res.status === 401 || res.status === 403 || res.status === 402) return "bad"
    if (res.status === 429) return "unknown"
    if (res.status >= 400 && res.status < 500) sawBad = true
  }
  return sawBad ? "bad" : "unknown"
}

export function humanizeModelName(id: string): string {
  const part = id.split(/[/:]/).pop() ?? id
  return part
    .replace(/[-_.]+/g, " ")
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .trim()
}

export function guessReasoning(id: string): boolean {
  return (
    /(^|[-/_.])(r1|o[1-9]|o3|o4|reasoner|thinking|gpt-5)([-/_.]|$)/i.test(id) ||
    /reason/i.test(id) ||
    /think/i.test(id)
  )
}

export function guessContext(id: string): number {
  const s = id.toLowerCase()
  if (/(1m|1\.5m|2m)/.test(s)) return 1_000_000
  if (s.includes("200k")) return 200_000
  if (/(128k|131k)/.test(s)) return 131_072
  return 128_000
}

export function guessOutput(id: string): number {
  const s = id.toLowerCase()
  if (s.includes("64k")) return 65_536
  if (s.includes("32k")) return 32_768
  if (guessReasoning(id)) return 16_384
  return 8_192
}

export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    for (;;) {
      const i = next++
      if (i >= items.length) return
      results[i] = await fn(items[i])
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

// ---------------------------------------------------------------------------
// sync / diff
// ---------------------------------------------------------------------------

export interface SyncOptions {
  baseURL: string
  headers: Record<string, string>
  cache: Cache
  mode: Mode
  skipProbe?: boolean
  /**
   * Keyless mode: only consider "-free" slugs (+ known extras) as candidates.
   * Defaults to `mode !== "keyed"` — paid models are never probed anonymously.
   */
  freeOnly?: boolean
  /** Extra free-tier candidate slugs (see isFreeCandidate). */
  extraSlugs?: ReadonlySet<string>
  probeTTLMs?: number
  concurrency?: number
  now?: number
}

export interface SyncResult {
  cache: Cache
  added: string[]
  removed: string[]
}

/**
 * Fetch the catalog, probe candidates (unless skipped), and diff against the
 * cached model list:
 *  - models that disappear from /models or fail a probe are removed
 *  - brand-new usable models are added
 *  - transient failures keep the previous entry
 */
export async function computeNextModels(opts: SyncOptions): Promise<SyncResult> {
  const now = opts.now ?? Date.now()
  const ttl = opts.probeTTLMs ?? PROBE_TTL_MS
  const concurrency = opts.concurrency ?? PROBE_CONCURRENCY
  const skipProbe = opts.skipProbe === true
  const freeOnly = opts.freeOnly ?? opts.mode !== "keyed"
  const all = await listModels(opts.baseURL, opts.headers)
  const candidates = freeOnly ? all.filter((m) => isFreeCandidate(m, opts.extraSlugs)) : all

  const current = opts.cache.models
  const next: Record<string, ModelMeta> = {}
  const toProbe: string[] = []

  for (const id of candidates) {
    const prev = current[id]
    if (skipProbe) {
      next[id] = prev ?? {
        id,
        name: humanizeModelName(id),
        reasoning: guessReasoning(id),
        toolCall: true,
        attachment: false,
        context: guessContext(id),
        output: guessOutput(id),
        firstSeen: new Date(now).toISOString(),
        lastProbed: null,
      }
      continue
    }
    if (prev?.lastProbed && now - Date.parse(prev.lastProbed) < ttl) {
      next[id] = prev
    } else {
      toProbe.push(id)
    }
  }

  await mapLimit(toProbe, concurrency, async (id) => {
    const prev = current[id]
    const result = await probeModel(opts.baseURL, id, opts.headers)
    if (result === "ok") {
      next[id] = {
        id,
        name: humanizeModelName(id),
        reasoning: guessReasoning(id),
        toolCall: true,
        attachment: false,
        context: guessContext(id),
        output: guessOutput(id),
        firstSeen: prev?.firstSeen ?? new Date(now).toISOString(),
        lastProbed: new Date(now).toISOString(),
      }
    } else if (result === "bad") {
      // stale / not free -> drop
    } else if (prev) {
      // transient failure -> keep previous state
      next[id] = prev
    }
  })

  const added = Object.keys(next).filter((id) => !current[id])
  const removed = Object.keys(current).filter((id) => !next[id])
  return {
    cache: {
      updatedAt: new Date(now).toISOString(),
      mode: opts.mode,
      baseURL: opts.baseURL,
      models: next,
    },
    added,
    removed,
  }
}

// ---------------------------------------------------------------------------
// cache persistence
// ---------------------------------------------------------------------------

export function loadCache(cacheFile: string): Cache {
  try {
    const raw = fs.readFileSync(cacheFile, "utf8")
    const parsed = JSON.parse(raw) as Partial<Cache>
    if (parsed && typeof parsed === "object" && parsed.models && typeof parsed.models === "object") {
      return {
        updatedAt: parsed.updatedAt ?? "",
        mode: parsed.mode ?? "auto",
        baseURL: parsed.baseURL ?? "",
        models: parsed.models as Record<string, ModelMeta>,
      }
    }
  } catch {
    // no cache yet
  }
  return { updatedAt: "", mode: "auto", baseURL: "", models: {} }
}

export function saveCache(cacheFile: string, cache: Cache): void {
  try {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true })
    const tmp = `${cacheFile}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 2))
    fs.renameSync(tmp, cacheFile)
  } catch (err) {
    console.warn(`[opencode-free] failed to save cache ${cacheFile}: ${err}`)
  }
}
