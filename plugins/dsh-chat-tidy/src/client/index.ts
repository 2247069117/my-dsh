import { chatTranslateObserver } from './translate/observer.ts';
import { setupSettingsUi } from './settings/ui.tsx';

/** Client plugin name, shared with the browser bundle id. */
export const name = 'dsh-chat-tidy';

/** Declare dependency on slots for settings section */
export const inject = ['slots'];

interface ClientContext {
  effect(factory: () => void | (() => void), label: string): void;
  get?(serviceName: string): any;
  slots?: any;
}

/**
 * Mount the tool-call / think-summary translation observer and the settings UI.
 * @param ctx - DSH browser client context.
 */
export function apply(ctx: ClientContext): void {
  // 1. Mount tool title / think summary translation observer (current session only)
  ctx.effect(() => chatTranslateObserver.start(document), 'dsh-chat-tidy: title translate observer');

  // 2. Mount settings UI section
  ctx.effect(() => setupSettingsUi(ctx), 'dsh-chat-tidy: settings section');
}

export { chatTranslateObserver } from './translate/observer.ts';
export { setupSettingsUi } from './settings/ui.tsx';
export { NonDestructiveTranslationMount } from './translate/mount.ts';
export { StreamDebounceViewportObserver } from './translate/viewport-observer.ts';
export { clientCache } from './translate/client-cache.ts';
export { lazyQueue } from './translate/lazy.ts';
export { settingsStore } from './settings/store.ts';
