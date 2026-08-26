export interface TranslateItemResult {
    original: string;
    translated: string;
    channel: string;
    cached: boolean;
}
export interface TranslateBatchOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
}
export declare function requestTranslateBatch(texts: string[], options?: TranslateBatchOptions): Promise<TranslateItemResult[]>;
export declare function fetchServerConfig(): Promise<any>;
export declare function updateServerConfig(updates: any): Promise<any>;
export declare function testServerChannel(channel: string): Promise<{
    ok: boolean;
    latencyMs: number;
    error?: string;
}>;
