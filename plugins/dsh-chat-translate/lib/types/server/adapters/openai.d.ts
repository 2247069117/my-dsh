import type { ITranslationAdapter, PluginConfig } from './base.ts';
import type { KeyReader } from '../credentials.ts';
export declare class OpenAiCompatibleAdapter implements ITranslationAdapter {
    readonly id = "openai";
    readonly name = "OpenAI \u517C\u5BB9 (Chat Completions)";
    private credentials;
    constructor(credentials: KeyReader);
    isAvailable(config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string>;
}
