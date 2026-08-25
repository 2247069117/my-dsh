declare class ClientCache {
    private memCache;
    private dirty;
    private saveTimer;
    constructor();
    private load;
    get(text: string): string | undefined;
    set(text: string, translated: string): void;
    private scheduleSave;
}
export declare const clientCache: ClientCache;
export {};
