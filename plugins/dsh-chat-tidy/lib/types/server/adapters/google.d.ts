import type { ITranslationAdapter, PluginConfig } from './base.ts';
/**
 * Unofficial Google Translate "GTX" endpoint — free, key-less, and the same
 * translation engine users see on translate.google.com. It is not a documented
 * public API, so this channel is deliberately positioned as a fallback that
 * sits behind the configured LLM channels: any failure (blocked network,
 * changed response shape, rate limit) falls through the dispatcher's chain.
 */
export declare class GoogleTranslateAdapter implements ITranslationAdapter {
    readonly id = "google";
    readonly name = "\u8C37\u6B4C\u7FFB\u8BD1 (\u514D\u8D39\u63A5\u53E3)";
    isAvailable(_config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, _config: PluginConfig): Promise<string>;
}
