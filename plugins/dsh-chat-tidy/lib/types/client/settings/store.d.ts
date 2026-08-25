export interface ClientSettingsState {
    enabled: boolean;
    concurrency: number;
    channels: string[];
    siliconflowKey: string;
    zhipuKey: string;
    hasSiliconflowKey: boolean;
    hasZhipuKey: boolean;
}
export declare const CHANNEL_NAMES: Record<string, string>;
export declare const ALL_CHANNELS: string[];
declare class SettingsStore {
    private state;
    private listeners;
    constructor();
    private loadFromLocalStorage;
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
}
export declare const settingsStore: SettingsStore;
export {};
