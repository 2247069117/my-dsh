export interface ClientSettingsState {
    enabled: boolean;
    concurrency: number;
}
export declare const LS_ENABLED = "dsh-chat-tidy:enabled";
export declare const LS_CONCURRENCY = "dsh-chat-tidy:concurrency";
declare class SettingsStore {
    private state;
    private listeners;
    private storageListener;
    constructor();
    private loadFromLocalStorage;
    private initStorageListener;
    private syncFromServer;
    getState(): ClientSettingsState;
    subscribe(listener: () => void): () => void;
    private notify;
    update(partial: Partial<ClientSettingsState>): Promise<void>;
    testChannel(channel: string): Promise<{
        ok: boolean;
        latencyMs: number;
        error?: string;
    }>;
    dispose(): void;
}
export declare const settingsStore: SettingsStore;
export {};
