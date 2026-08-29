export interface ClientSettingsState {
    enabled: boolean;
    concurrency: number;
    aiEnabled: boolean;
    bingEnabled: boolean;
    baseUrl: string;
    model: string;
    aiConfigured: boolean;
}
export declare const LS_ENABLED = "dsh-chat-translate:enabled";
export declare const LS_CONCURRENCY = "dsh-chat-translate:concurrency";
export declare const LS_AI_ENABLED = "dsh-chat-translate:aiEnabled";
export declare const LS_BING_ENABLED = "dsh-chat-translate:bingEnabled";
export declare const LS_BASE_URL = "dsh-chat-translate:baseUrl";
export declare const LS_MODEL = "dsh-chat-translate:model";
declare class SettingsStore {
    private state;
    private listeners;
    private storageListener;
    private pushTimer;
    private pushSeq;
    private userTouched;
    constructor();
    private loadFromLocalStorage;
    private initStorageListener;
    private syncFromServer;
    getState(): ClientSettingsState;
    subscribe(listener: () => void): () => void;
    private notify;
    /**
     * Debounced server push: fast typing in the baseUrl/model/concurrency inputs
     * collapses into a single POST (300ms trailing). A monotonic sequence number
     * ensures an out-of-order older response never overwrites newer state.
     */
    private schedulePush;
    private pushToServer;
    update(partial: Partial<ClientSettingsState>): Promise<void>;
    testChannel(channel: string): Promise<{
        ok: boolean;
        latencyMs: number;
        error?: string;
    }>;
    /** Persist the API key via the host and refresh the server-derived status. */
    saveApiKey(apiKey: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    /** Re-pull the server config (e.g. after the API key changed). */
    refreshFromServer(): Promise<void>;
    dispose(): void;
}
export declare const settingsStore: SettingsStore;
export {};
