export interface ClientSettingsState {
    enabled: boolean;
    concurrency: number;
    translateThinking: boolean;
}
export declare const LS_ENABLED = "dsh-chat-tidy:enabled";
export declare const LS_CONCURRENCY = "dsh-chat-tidy:concurrency";
export declare const LS_TRANSLATE_THINKING = "dsh-chat-tidy:translate-thinking";
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
