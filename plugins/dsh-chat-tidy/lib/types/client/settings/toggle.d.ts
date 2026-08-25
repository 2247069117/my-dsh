/**
 * Mount the quick toggle. The header is React-rendered, so a keep-alive
 * MutationObserver re-inserts the button if a re-render removes it.
 * @returns disposer that removes the button, styles, observer and subscription.
 */
export declare function installQuickToggle(): () => void;
