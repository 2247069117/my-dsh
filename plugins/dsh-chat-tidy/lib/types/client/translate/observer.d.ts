export declare class ChatTranslateObserver {
    private observer;
    private rootElement;
    private isEnabled;
    constructor();
    setEnabled(enabled: boolean): void;
    start(documentRef?: Document): () => void;
    private handleMutations;
    private scanContainer;
    private scanNode;
    private processSpan;
    disconnect(): void;
}
export declare const chatTranslateObserver: ChatTranslateObserver;
