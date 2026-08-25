import type { ITranslationAdapter, PluginConfig } from './base.ts';
export declare class BuiltinDictAdapter implements ITranslationAdapter {
    readonly id = "builtin";
    readonly name = "\u79BB\u7EBF\u6280\u672F\u8BCD\u5178";
    isAvailable(_config: PluginConfig): boolean;
    translate(text: string, _signal: AbortSignal, _config: PluginConfig): Promise<string>;
}
