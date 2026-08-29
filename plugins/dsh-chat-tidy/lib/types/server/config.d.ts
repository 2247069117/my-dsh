import type { PluginConfig, MaskedPluginConfig } from './types.ts';
import { CredentialsReader, TRANSLATE_API_KEY_REF } from './credentials.ts';
/** Hard cap for the translation concurrency pool. */
export declare const MAX_CONCURRENCY = 100;
/** Bounds for the AI channel request timeout. */
export declare const AI_TIMEOUT_MIN = 500;
export declare const AI_TIMEOUT_MAX = 120000;
export declare class ConfigManager {
    private config;
    private configPath;
    private credentials;
    private listeners;
    constructor(credentials?: CredentialsReader);
    init(): Promise<void>;
    getConfig(): PluginConfig;
    /** Whether the AI channel has every required piece: baseUrl, model and key. */
    isAiConfigured(): boolean;
    getMaskedConfig(): MaskedPluginConfig;
    onConfigChange(listener: (config: PluginConfig) => void): () => void;
    private notifyListeners;
    updateConfig(partial: Partial<PluginConfig>): Promise<PluginConfig>;
    private save;
}
export { TRANSLATE_API_KEY_REF };
