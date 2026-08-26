/**
 * Mount the quick toggle. Targets the conversation session header specifically
 * rather than observing the entire document.body subtree.
 * @returns disposer that removes the button, styles, observer and subscription.
 */
export declare function installQuickToggle(): () => void;
