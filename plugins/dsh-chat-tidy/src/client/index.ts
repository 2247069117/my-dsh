import { adoptStyles } from './styles.ts';
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
 * Mount Tidy Chat's conversation stylesheet, tool title translation observer, and settings UI.
 * @param ctx - DSH browser client context.
 */
export function apply(ctx: ClientContext): void {
  // 1. Mount typography styles
  ctx.effect(() => adoptStyles(document), 'dsh-chat-tidy: stylesheet');

  // 2. Mount tool title translation observer
  ctx.effect(() => chatTranslateObserver.start(document), 'dsh-chat-tidy: title translate observer');

  // 3. Mount settings UI section
  ctx.effect(() => setupSettingsUi(ctx), 'dsh-chat-tidy: settings section');
}

export { TIDY_CHAT_CSS, STYLE_MARKER, adoptStyles } from './styles.ts';
export { chatTranslateObserver } from './translate/observer.ts';
export { setupSettingsUi } from './settings/ui.tsx';
