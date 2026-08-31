/**
 * @dsh-external/dsh-llm-opencode-zen
 *
 * DSH harness 插件：自动探测并注册 OpenCode Zen 免费模型（keyless），
 * 让它们在聊天模型选择器中与其它供应商一样可选、可用。
 *
 * 特性：
 *  - 自动探测：GET /models 目录 + keyless 探测（2xx=可用，401/403/402=失效），
 *    失效自动移除、新增自动添加（缓存 diff，见 src/core.ts）。
 *  - 模型只读：Config 中不暴露任何模型编辑字段，模型列表完全由探测维护。
 *  - 供应商开关：enabled=false 时从 LLM 目录与适配器注册中整体移除。
 *  - keyed 回退：设置 apiKey（或 OPENCODE_ZEN_API_KEY 环境变量）后走正常
 *    Bearer 鉴权，且不再探测（skipProbe），使用完整目录。
 *
 * 零 @deepseek-ai 硬编码路径：全部依赖（dsh-llm / dsh-settings / schemastery）
 * 通过插件自带 node_modules junction 解析（见 scripts/build.sh）。
 */
import { join } from "node:path";
import { homedir } from "node:os";
import z from "schemastery";
import { LlmAdapter, LlmError, ToolCallId, ReasoningEffortId, attributionHeaders, contentHasImage, EMPTY_RESPONSE_CODE, QUOTA_EXCEEDED_CODE, CONTEXT_WINDOW_EXCEEDED_CODE, isQuotaExceededError, isContextWindowExceededError, } from "@deepseek-ai/dsh-llm";
import { computeNextModels, loadCache, saveCache, DEFAULT_BASE_URL, DEFAULT_REFRESH_INTERVAL_MS, } from "./core.js";
export const name = "@dsh-external/dsh-llm-opencode-zen";
export const inject = ["llm"];
const PROVIDER = "opencode-zen";
const NS = "llm-opencode-zen";
const DISPLAY_NAME = "OpenCode Zen";
const OFF = ReasoningEffortId("off");
const LOW = ReasoningEffortId("low");
const MEDIUM = ReasoningEffortId("medium");
const HIGH = ReasoningEffortId("high");
const MAX = ReasoningEffortId("max");
// OpenCode Zen 思考档位（wire 映射见 reasoningWire）：off/low/medium/high
// 均为 API 实测接受的 reasoning_effort 值；"max" 不与 API 直传（实测 400），
// 仅作为 GUI 档位存在（映射为 thinking enabled），以兼容全局默认 max 档。
const ZEN_REASONING = {
    efforts: [
        { id: OFF, name: "Off" },
        { id: LOW, name: "Low" },
        { id: MEDIUM, name: "Medium" },
        { id: HIGH, name: "High" },
        { id: MAX, name: "Max" },
    ],
    defaultEffort: HIGH,
};
export const Config = z.object({
    enabled: z.boolean().default(true),
    apiKey: z.string().default(""),
    baseURL: z.string().default(DEFAULT_BASE_URL),
    refreshIntervalMs: z.number().step(1).min(60_000).default(DEFAULT_REFRESH_INTERVAL_MS),
    extraSlugs: z.array(z.string()).default([]),
});
// ---------------------------------------------------------------------------
// wire 序列化（OpenAI 兼容 chat/completions，text-only）
// ---------------------------------------------------------------------------
function flattenText(blocks) {
    return blocks
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");
}
/**
 * 思考档位 → wire 参数。实测（hy3-free）：
 *  - thinking:{type:"disabled"} 真正关闭思考（reasoning_tokens=0）
 *  - reasoning_effort low/medium/high 均被接受；"off"/"max" 会 400
 *  - 非思考模型（nemotron/laguna 系列）忽略这些参数（200，无 reasoning）
 */
function reasoningWire(effort) {
    switch (effort) {
        case "off":
            return { thinking: { type: "disabled" } };
        case "low":
            return { reasoning_effort: "low" };
        case "medium":
            return { reasoning_effort: "medium" };
        case "high":
            return { reasoning_effort: "high" };
        case "max":
            return { thinking: { type: "enabled" } };
        default:
            return {};
    }
}
function serializeRequest(options) {
    const messages = [];
    if (options.system !== undefined) {
        messages.push({ role: "system", content: options.system });
    }
    for (const message of options.messages) {
        if (message.role === "system") {
            messages.push({ role: "system", content: flattenText(message.content) });
            continue;
        }
        if (message.role === "assistant") {
            const text = flattenText(message.content);
            const toolCalls = message.content
                .filter((block) => block.type === "tool-call")
                .map((block) => ({
                id: block.id,
                type: "function",
                function: { name: block.name, arguments: block.arguments },
            }));
            messages.push({
                role: "assistant",
                content: text,
                ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
            });
            continue;
        }
        // user / tool-result
        const toolResults = message.content.filter((block) => block.type === "tool-result");
        const text = flattenText(message.content);
        if (toolResults.length === 0) {
            messages.push({ role: "user", content: text });
            continue;
        }
        if (text.length > 0)
            messages.push({ role: "user", content: text });
        for (const result of toolResults) {
            const out = flattenText(result.content);
            messages.push({
                role: "tool",
                tool_call_id: result.toolCallId,
                content: out || "(no output)",
            });
        }
    }
    const tools = options.tools?.map((tool) => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        },
    }));
    return {
        model: options.model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        ...(tools !== undefined && tools.length > 0 ? { tools } : {}),
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
        ...(options.maxTokens === undefined ? {} : { max_tokens: options.maxTokens }),
        ...(options.stop !== undefined ? { stop: options.stop } : {}),
        ...reasoningWire(options.reasoningEffort),
    };
}
// ---------------------------------------------------------------------------
// SSE 解析（不依赖 eventsource-parser，纯手写）
// ---------------------------------------------------------------------------
async function* ssePayloads(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            let sep;
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
                const frame = buffer.slice(0, sep);
                buffer = buffer.slice(sep + 2);
                for (const line of frame.split("\n")) {
                    if (line.startsWith("data:"))
                        yield line.slice(5).trim();
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
    if (buffer.trim().length > 0) {
        for (const line of buffer.split("\n")) {
            if (line.startsWith("data:"))
                yield line.slice(5).trim();
        }
    }
}
function closeBlock(block) {
    switch (block.kind) {
        case "text":
            return { type: "text", text: block.text };
        case "reasoning":
            return { type: "reasoning", text: block.text };
        case "tool-call":
            return {
                type: "tool-call",
                id: ToolCallId(block.callId ?? ""),
                name: block.name ?? "",
                arguments: block.text,
            };
    }
}
function mapUsage(usage) {
    const cacheRead = usage.prompt_tokens_details?.cached_tokens;
    return {
        inputTokens: usage.prompt_tokens - (cacheRead ?? 0),
        outputTokens: usage.completion_tokens,
        ...(cacheRead !== undefined ? { cacheReadTokens: cacheRead } : {}),
    };
}
async function* translate(payloads) {
    let nextIndex = 0;
    let textBlock;
    let reasoningBlock;
    const toolBlocks = new Map();
    const order = [];
    let pendingUsage;
    let finishReason;
    function open(kind) {
        const block = { index: nextIndex++, kind, text: "" };
        order.push(block);
        return block;
    }
    for await (const payload of payloads) {
        if (payload === "[DONE]") {
            for (const block of order) {
                yield { type: "block-end", index: block.index, block: closeBlock(block) };
            }
            if (pendingUsage !== undefined)
                yield { type: "usage", usage: pendingUsage };
            const reason = finishReason === undefined && order.length === 0
                ? {
                    kind: "error",
                    failure: {
                        message: "model returned a completed response with no content",
                        code: EMPTY_RESPONSE_CODE,
                    },
                }
                : finishReason === "length"
                    ? { kind: "length" }
                    : finishReason === "tool_calls"
                        ? { kind: "toolUse" }
                        : { kind: "stop" };
            yield { type: "finish", reason };
            return;
        }
        let chunk;
        try {
            chunk = JSON.parse(payload);
        }
        catch {
            throw new LlmError(`malformed SSE payload: ${payload.slice(0, 120)}`, "MALFORMED_RESPONSE");
        }
        for (const choice of chunk.choices ?? []) {
            const delta = choice.delta;
            const reasoning = delta?.reasoning_content;
            if (typeof reasoning === "string" && reasoning.length > 0) {
                if (!reasoningBlock) {
                    reasoningBlock = open("reasoning");
                    yield { type: "block-start", index: reasoningBlock.index, blockType: "reasoning" };
                }
                reasoningBlock.text += reasoning;
                yield { type: "reasoning-delta", index: reasoningBlock.index, text: reasoning };
            }
            const content = delta?.content;
            if (typeof content === "string" && content.length > 0) {
                if (!textBlock) {
                    textBlock = open("text");
                    yield { type: "block-start", index: textBlock.index, blockType: "text" };
                }
                textBlock.text += content;
                yield { type: "text-delta", index: textBlock.index, text: content };
            }
            for (const call of delta?.tool_calls ?? []) {
                let block = toolBlocks.get(call.index);
                if (!block) {
                    block = open("tool-call");
                    toolBlocks.set(call.index, block);
                    yield { type: "block-start", index: block.index, blockType: "tool-call" };
                }
                if (call.id !== undefined)
                    block.callId = call.id;
                if (call.function?.name !== undefined)
                    block.name = call.function.name;
                const fragment = call.function?.arguments ?? "";
                block.text += fragment;
                yield {
                    type: "tool-call-delta",
                    index: block.index,
                    ...(block.callId !== undefined ? { id: block.callId } : {}),
                    ...(block.name !== undefined ? { name: block.name } : {}),
                    arguments: fragment,
                };
            }
            if (choice.finish_reason !== undefined && choice.finish_reason !== null) {
                finishReason = String(choice.finish_reason);
            }
        }
        if (chunk.usage !== undefined)
            pendingUsage = mapUsage(chunk.usage);
    }
    throw new LlmError("stream ended before the [DONE] sentinel", "MALFORMED_RESPONSE");
}
// ---------------------------------------------------------------------------
// HTTP 错误映射
// ---------------------------------------------------------------------------
async function httpError(baseURL, response) {
    let message = `OpenCode Zen API error (HTTP ${response.status})`;
    let providerError;
    try {
        providerError = (await response.json())?.error;
    }
    catch {
        // 非 JSON 错误体不致命
    }
    if (providerError?.message)
        message = String(providerError.message);
    const detail = [providerError?.code, providerError?.type, providerError?.message]
        .filter(Boolean)
        .join(" ");
    let code;
    if (response.status === 401 || response.status === 403)
        code = "AUTH";
    else if (response.status === 413)
        code = "INVALID_REQUEST";
    else if (isQuotaExceededError(detail))
        code = QUOTA_EXCEEDED_CODE;
    else if (response.status === 429)
        code = "RATE_LIMIT";
    else if (response.status === 400) {
        code = isContextWindowExceededError(detail) ? CONTEXT_WINDOW_EXCEEDED_CODE : "INVALID_REQUEST";
    }
    else if (response.status >= 500)
        code = "SERVER";
    else
        code = `HTTP_${response.status}`;
    return new LlmError(`${baseURL} responded ${response.status}: ${message}`, code, {
        status: response.status,
    });
}
class OpenCodeZenAdapter extends LlmAdapter {
    deps;
    constructor(deps) {
        super();
        this.deps = deps;
    }
    providerInfo(provider) {
        return { id: provider, name: DISPLAY_NAME };
    }
    providerRetryPolicy(_provider) {
        return undefined;
    }
    listModels(provider) {
        const cache = this.deps.getCache();
        const models = Object.values(cache.models ?? {}).map((meta) => ({
            provider,
            id: meta.id,
            name: meta.name,
            inputModalities: ["text"],
        }));
        return Promise.resolve(models);
    }
    resolveModel(provider, model, _signal) {
        const meta = this.deps.getCache().models?.[model];
        if (meta === undefined) {
            // 未知模型（如 keyed 模式手工输入）：给出保守默认
            return Promise.resolve({
                provider,
                id: model,
                name: model,
                inputModalities: ["text"],
                context: { contextWindow: 128_000 },
                defaultMaxTokens: 8_192,
                reasoning: ZEN_REASONING,
            });
        }
        return Promise.resolve({
            provider,
            id: meta.id,
            name: meta.name,
            inputModalities: ["text"],
            context: { contextWindow: meta.context },
            defaultMaxTokens: meta.output,
            reasoning: ZEN_REASONING,
        });
    }
    prepareCall(provider, model, signal) {
        return this.resolveModel(provider, model, signal).then((resolved) => ({
            model: resolved,
            stream: (options) => this.streamWith(options, this.deps.getSnapshot()),
        }));
    }
    stream(options) {
        return this.streamWith(options, this.deps.getSnapshot());
    }
    async *streamWith(options, snap) {
        const signal = options.signal;
        try {
            if (options.messages.some((message) => contentHasImage(message.content))) {
                throw new LlmError("OpenCode Zen free models do not accept image input.", "UNSUPPORTED_CONTENT");
            }
            const headers = {
                "content-type": "application/json",
                accept: "text/event-stream",
                ...attributionHeaders(),
                ...(snap.keyed && snap.apiKey
                    ? { authorization: `Bearer ${snap.apiKey}` }
                    : {}),
                ...(options.sessionId !== undefined
                    ? { "x-dsh-harness-session-id": String(options.sessionId) }
                    : {}),
            };
            const body = serializeRequest(options);
            let response;
            try {
                response = await fetch(`${snap.baseURL}/chat/completions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                    signal,
                });
            }
            catch (error) {
                if (signal?.aborted) {
                    throw new LlmError("OpenCode Zen request aborted by caller", "ABORTED", { cause: error });
                }
                throw new LlmError(`OpenCode Zen request to ${snap.baseURL} failed`, "TRANSPORT", {
                    cause: error,
                });
            }
            if (!response.ok)
                throw await httpError(snap.baseURL, response);
            if (response.body === null) {
                throw new LlmError("OpenCode Zen returned an empty response body", "EMPTY_RESPONSE");
            }
            yield* translate(ssePayloads(response.body));
        }
        catch (error) {
            if (error instanceof LlmError)
                throw error;
            if (signal?.aborted) {
                throw new LlmError("OpenCode Zen request aborted by caller", "ABORTED", { cause: error });
            }
            throw new LlmError("OpenCode Zen stream failed", "TRANSPORT", { cause: error });
        }
    }
}
// ---------------------------------------------------------------------------
// 插件主体
// ---------------------------------------------------------------------------
export function apply(ctx, entry) {
    let current = () => entry;
    let lastRaw;
    let lastGood;
    /** 解析当前（可能来自 settings 变更的）运行快照。 */
    const options = () => {
        const raw = current();
        if (raw === lastRaw && lastGood !== undefined)
            return lastGood;
        const apiKey = String(raw.apiKey ?? "").trim();
        const keyed = apiKey.length > 0;
        const baseURL = String(raw.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
        const refreshMs = Math.max(60_000, Number(raw.refreshIntervalMs) || DEFAULT_REFRESH_INTERVAL_MS);
        const extraSlugs = new Set((raw.extraSlugs ?? [])
            .map((s) => String(s).trim().toLowerCase())
            .filter(Boolean));
        lastRaw = raw;
        lastGood = {
            enabled: raw.enabled !== false,
            keyed,
            apiKey: keyed ? apiKey : undefined,
            baseURL,
            refreshMs,
            extraSlugs,
        };
        return lastGood;
    };
    options();
    const cacheFile = join(process.env.DSH_HOME || join(homedir(), ".dsh"), "opencode-zen-free-models.json");
    let cache = loadCache(cacheFile);
    const snapshot = () => {
        const o = options();
        return { baseURL: o.baseURL, keyed: o.keyed, apiKey: o.apiKey };
    };
    const adapter = new OpenCodeZenAdapter({
        getSnapshot: snapshot,
        getCache: () => cache,
    });
    // —— 自动同步：探测 + 缓存 diff（失效移除 / 新增添加）——
    let syncing = null;
    const sync = (reason) => {
        if (syncing)
            return syncing;
        syncing = (async () => {
            const o = options();
            if (!o.enabled)
                return;
            try {
                const result = await computeNextModels({
                    baseURL: o.baseURL,
                    headers: {},
                    cache,
                    mode: o.keyed ? "keyed" : "auto",
                    skipProbe: o.keyed,
                    extraSlugs: o.extraSlugs,
                });
                cache = result.cache;
                saveCache(cacheFile, result.cache);
                const change = result.added.length > 0 || result.removed.length > 0
                    ? `+${result.added.length} -${result.removed.length}`
                    : "no change";
                ctx.logger.info(`[opencode-zen] sync (${reason}): ${result.cache.models ? Object.keys(result.cache.models).length : 0} models, ${change}`);
            }
            catch (error) {
                ctx.logger.warn(`[opencode-zen] sync failed (${reason}): keeping previous state`);
                ctx.logger.warn(error);
            }
        })();
        void syncing.finally(() => {
            syncing = null;
        });
        return syncing;
    };
    // —— 供应商注册（enabled 感知：关闭即整体移除）——
    let directory;
    let directoryKey = "";
    const ensureDirectory = () => {
        const entries = options().enabled
            ? [{ provider: PROVIDER, displayName: DISPLAY_NAME, settingsNs: NS, settingsPath: [] }]
            : [];
        const key = JSON.stringify(entries);
        if (key === directoryKey)
            return;
        if (entries.length === 0) {
            if (directory !== undefined)
                directory.replace([]);
            directoryKey = key;
            return;
        }
        if (directory === undefined) {
            directory = ctx.llm.registerConfigurableProviders(entries);
        }
        else {
            directory.replace(entries);
        }
        directoryKey = key;
    };
    let registration;
    let routesKey = "";
    const ensureRegistration = () => {
        const routes = options().enabled ? [PROVIDER] : [];
        const key = JSON.stringify(routes);
        if (key === routesKey)
            return;
        if (routes.length === 0) {
            // 关闭：从适配器路由中移除（replace([]) 会清理并广播 adapters-updated）
            if (registration !== undefined)
                registration.replace([]);
            routesKey = key;
            return;
        }
        if (registration === undefined) {
            registration = ctx.llm.registerAdapter(routes, adapter);
        }
        else {
            registration.replace(routes);
        }
        routesKey = key;
    };
    const refresh = (reason) => {
        ensureDirectory();
        ensureRegistration();
        void sync(reason);
    };
    // 定时自动同步（设置变更时重建定时器）
    let timer = null;
    ctx.effect(() => () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    });
    const scheduleTimer = () => {
        if (timer !== null)
            clearInterval(timer);
        const ms = options().refreshMs;
        timer = setInterval(() => void sync("timer"), ms);
    };
    // 设置区：模型只读（无模型字段），供应商开关 + 可选 key + 同步参数
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.installSection(ctx, NS, Config, entry, {
            setSource: (source) => {
                current = source;
            },
            onChange: () => {
                refresh("settings");
                scheduleTimer();
            },
        });
    });
    // 首次注册 + 启动同步
    ensureDirectory();
    ensureRegistration();
    scheduleTimer();
    void sync("startup");
}
//# sourceMappingURL=index.js.map