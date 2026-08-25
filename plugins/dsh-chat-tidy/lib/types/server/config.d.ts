import type { PluginConfig, MaskedPluginConfig } from './types.ts';
/** Hard cap for the translation concurrency pool (Bing tolerates >> this). */
export declare const MAX_CONCURRENCY = 100;
export declare class ConfigManager {
    private config;
    private configPath;
    constructor();
    init(): Promise<void>;
    getConfig(): PluginConfig;
    getMaskedConfig(): MaskedPluginConfig;
    updateConfig(partial: Partial<PluginConfig>): Promise<PluginConfig>;
    private save;
}
