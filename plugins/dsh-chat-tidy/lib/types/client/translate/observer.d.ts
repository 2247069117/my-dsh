export declare class ChatTranslateObserver {
    private observer;
    private rootElement;
    private rootCheckTimer;
    private isEnabled;
    constructor();
    setEnabled(enabled: boolean): void;
    private restoreOriginals;
    /**
     * The active session's scroll container. Only the currently-viewed session
     * is translated; switching sessions replaces this subtree and the observer
     * naturally follows the new content.
     */
    private isVisible;
    private findRoot;
    start(documentRef?: Document): () => void;
    private scheduleRootCheck;
    private restart;
    private handleMutations;
    private scanContainer;
    private scanNode;
    private processSpan;
    disconnect(): void;
}
export declare const chatTranslateObserver: ChatTranslateObserver;
