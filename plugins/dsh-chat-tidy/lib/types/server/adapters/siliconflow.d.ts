import type { ITranslationAdapter, PluginConfig } from './base.ts';
export declare class SiliconFlowAdapter implements ITranslationAdapter {
    readonly id = "siliconflow";
    readonly name = "\u7845\u57FA\u6D41\u52A8 (Qwen2.5-7B)";
    isAvailable(config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string>;
}
