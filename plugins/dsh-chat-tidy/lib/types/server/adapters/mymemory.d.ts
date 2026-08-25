import type { ITranslationAdapter, PluginConfig } from './base.ts';
export declare class MyMemoryAdapter implements ITranslationAdapter {
    readonly id = "mymemory";
    readonly name = "MyMemory \u514D\u8D39\u673A\u5668\u7FFB\u8BD1";
    isAvailable(_config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, _config: PluginConfig): Promise<string>;
}
