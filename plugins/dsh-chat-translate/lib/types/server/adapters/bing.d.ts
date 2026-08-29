import type { ITranslationAdapter, PluginConfig } from './base.ts';
interface BingTokens {
    ig: string;
    key: string;
    token: string;
}
export declare function fetchTokens(signal: AbortSignal, forceRefresh?: boolean): Promise<BingTokens>;
export declare class BingWebAdapter implements ITranslationAdapter {
    readonly id = "bing";
    readonly name = "\u5FAE\u8F6F Bing \u7F51\u9875\u7FFB\u8BD1 (\u514DKey\u76F4\u8FDE)";
    isAvailable(_config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string>;
    private executeTranslate;
}
export {};
