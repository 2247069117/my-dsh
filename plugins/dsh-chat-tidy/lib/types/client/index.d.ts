/** Client plugin name, shared with the browser bundle id. */
export declare const name = "dsh-chat-tidy";
/** Declare dependency on slots for settings section */
export declare const inject: string[];
interface ClientContext {
    effect(factory: () => void | (() => void), label: string): void;
    get?(serviceName: string): any;
    slots?: any;
}
/**
 * Mount Tidy Chat's conversation stylesheet, tool title translation observer, and settings UI.
 * @param ctx - DSH browser client context.
 */
export declare function apply(ctx: ClientContext): void;
export { TIDY_CHAT_CSS, STYLE_MARKER, adoptStyles } from './styles.ts';
export { chatTranslateObserver, isMostlyChinese, containsChinese } from './translate/observer.ts';
export { setupSettingsUi } from './settings/ui.tsx';
export { installQuickToggle } from './settings/toggle.ts';
export { NonDestructiveTranslationMount } from './translate/mount.ts';
export { StreamDebounceViewportObserver } from './translate/viewport-observer.ts';
export { clientCache } from './translate/client-cache.ts';
export { lazyQueue } from './translate/lazy.ts';
export { settingsStore } from './settings/store.ts';
