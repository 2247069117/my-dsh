export declare class ChatTranslateObserver {
    private observer;
    private rootElement;
    private isEnabled;
    private translateThinking;
    /**
     * Toggle Think/reasoning translation. Turning it on scans immediately;
     * turning it off restores already-translated think nodes right away.
     */
    setTranslateThinking(enabled: boolean): void;
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
    /** Restore think-translated nodes (used when the thinking toggle goes off). */
    private restoreThinkOriginals;
    disconnect(): void;
}
export declare const chatTranslateObserver: ChatTranslateObserver;
