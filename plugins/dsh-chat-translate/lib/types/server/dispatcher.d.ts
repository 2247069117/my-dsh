import type { TranslateItemResult } from './types.ts';
import type { ConfigManager } from './config.ts';
import type { LruDiskCache } from './cache.ts';
import type { KeyReader } from './credentials.ts';
export declare class TranslationDispatcher {
    private configManager;
    private cache;
    private credentials;
    private masking;
    private adapters;
    private circuitStates;
    private inFlightMap;
    private activeCount;
    private queue;
    constructor(configManager: ConfigManager, cache: LruDiskCache, credentials?: KeyReader);
    private registerAdapter;
    /**
     * Decide which channels are active for the current config, in priority order.
     *
     * Truth table (user contract):
     *  - AI on + configured + Bing on        -> [openai, bing]  (AI first, Bing fallback)
     *  - AI on + NOT configured + Bing on    -> [bing]
     *  - AI on + NOT configured + Bing off   -> []              (no translation)
     *  - AI off + Bing on                    -> [bing]
     *  - AI off + Bing off                   -> []              (no translation)
     */
    private computeChannels;
    translateBatch(texts: string[], forceRefresh?: boolean): Promise<TranslateItemResult[]>;
    translateOne(rawText: string, forceRefresh?: boolean): Promise<TranslateItemResult>;
    testChannel(channelId: string): Promise<{
        ok: boolean;
        latencyMs: number;
        error?: string;
    }>;
    private enqueueTask;
    private processNext;
    private isCircuitOpen;
    private recordSuccess;
    private recordFailure;
}
