import type { PluginConfig, MaskedPluginConfig } from './types.ts';
/** Hard cap for the translation concurrency pool (Bing tolerates >> this). */
export declare const MAX_CONCURRENCY = 100;
export declare class ConfigManager {
    private config;
    private configPath;
    private listeners;
    constructor();
    init(): Promise<void>;
    getConfig(): PluginConfig;
    getMaskedConfig(): MaskedPluginConfig;
    onConfigChange(listener: (config: PluginConfig) => void): () => void;
    private notifyListeners;
    updateConfig(partial: Partial<PluginConfig>): Promise<PluginConfig>;
    private save;
}
