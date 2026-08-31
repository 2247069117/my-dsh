import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { MobileNavKey } from './i18n/locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Directory-drawer controls copy. */
        'mobileNav': MobileNavKey;
    }
}
/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
export declare const inject: string[];
/**
 * Mobile-adaptive shell, browser half: injects the mobile stylesheet, then
 * contributes the session-header Files action and the backdrop + floating
 * button to the shell overlay. The host's own logo-row control remains the
 * sole directory drawer toggle; adding another header toggle causes a
 * duplicate control on narrow screens.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map