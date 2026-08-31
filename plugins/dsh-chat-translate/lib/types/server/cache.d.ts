export declare class LruDiskCache {
    private cache;
    private maxEntries;
    private filePath;
    private saveTimer;
    private dirty;
    /** Legacy root-level cache file (<=1.1); moved under the plugin subdir. */
    private legacyPath;
    constructor(maxEntries?: number);
    init(): Promise<void>;
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    private scheduleSave;
    flush(): Promise<void>;
    dispose(): Promise<void>;
}
