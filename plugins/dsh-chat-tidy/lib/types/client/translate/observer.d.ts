export declare class ChatTranslateObserver {
    private observer;
    private rootElement;
    private isEnabled;
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
    disconnect(): void;
}
export declare const chatTranslateObserver: ChatTranslateObserver;
