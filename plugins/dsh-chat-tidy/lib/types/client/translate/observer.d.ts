/**
 * Checks whether text is predominantly Chinese.
 * Threshold: > 40% CJK characters.
 * Note: Removed the buggy "< 80 chars short-circuit" to avoid skipping short mixed strings.
 */
export declare function isMostlyChinese(text: string, threshold?: number): boolean;
export declare function containsChinese(text: string): boolean;
export declare class ChatTranslateObserver {
    private observer;
    private rootElement;
    private isEnabled;
    private translateThinking;
    private thinkChain;
    /**
     * Toggle Think/reasoning translation. Turning it on scans immediately;
     * turning it off restores already-translated think nodes right away.
     */
    setTranslateThinking(enabled: boolean): void;
    /**
     * Think translation runs on its own serial chain (one request in flight at
     * a time) so long reasoning blocks can never fan out into a burst that
     * hammers Bing. Short think lines still use the debounced shared queue.
     */
    private enqueueThink;
    private translateThink;
    constructor();
    setEnabled(enabled: boolean): void;
    /**
     * Restore every translated node back to its English original so toggling
     * the switch off takes effect immediately (no browser refresh needed).
     */
    private restoreOriginals;
    start(documentRef?: Document): () => void;
    private handleMutations;
    private scanContainer;
    private scanNode;
    private processSpan;
    private drainThinkChain;
    private restoreThinkOriginals;
    disconnect(): void;
}
export declare const chatTranslateObserver: ChatTranslateObserver;
