import type { ITranslationAdapter, PluginConfig } from './base.ts';
export declare class ZhipuAdapter implements ITranslationAdapter {
    readonly id = "zhipu";
    readonly name = "\u667A\u8C31 AI (glm-4-flash)";
    isAvailable(config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string>;
}
