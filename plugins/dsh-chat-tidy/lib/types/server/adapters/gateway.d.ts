import type { ITranslationAdapter, PluginConfig } from './base.ts';
/**
 * DeepLX-compatible self-hosted translation gateway adapter. Point it at any
 * local/self-hosted gateway that exposes the DeepLX-ish contract, e.g.
 * https://github.com/17Yuns/Translate_Api_Free (POST {base}/Google/translate
 * and {base}/Bing/translate, returning { code, data }).
 *
 * Bing's web endpoint works from mainland networks without a key and does not
 * depend on a third-party relay; Google's endpoint requires a relay or your own
 * reverse proxy. The engine is selectable in the settings panel.
 */
export declare class GatewayAdapter implements ITranslationAdapter {
    readonly id = "gateway";
    readonly name = "\u672C\u5730\u7FFB\u8BD1\u7F51\u5173 (DeepLX \u517C\u5BB9)";
    isAvailable(config: PluginConfig): boolean;
    translate(text: string, signal: AbortSignal, config: PluginConfig): Promise<string>;
}
