export declare class ClientCache {
    private memCache;
    private dirty;
    private saveTimer;
    constructor();
    private load;
    get(text: string): string | undefined;
    set(text: string, translated: string): void;
    private scheduleSave;
    flushSync(): void;
    clear(): void;
    size(): number;
}
export declare const clientCache: ClientCache;
