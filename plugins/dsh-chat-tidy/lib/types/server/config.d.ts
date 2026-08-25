import type { PluginConfig, MaskedPluginConfig } from './types.ts';
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
