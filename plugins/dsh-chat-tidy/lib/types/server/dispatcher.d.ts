import type { TranslateItemResult } from './types.ts';
import type { ConfigManager } from './config.ts';
import type { LruDiskCache } from './cache.ts';
/**
 * Checks if text is already predominantly Chinese.
 * Calculates CJK character ratio against non-whitespace length.
 */
export declare function isMostlyChinese(text: string, threshold?: number): boolean;
export declare class TranslationDispatcher {
    private configManager;
    private cache;
    private masking;
    private adapters;
    private circuitStates;
    private inFlightMap;
    private activeCount;
    private queue;
    constructor(configManager: ConfigManager, cache: LruDiskCache);
    private registerAdapter;
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
