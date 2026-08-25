declare class LazyTranslationQueue {
    private intersectionObserver;
    private pendingElements;
    private batchQueue;
    private debounceTimer;
    constructor();
    observe(element: HTMLElement, text: string): void;
    private enqueueBatch;
    private flushBatch;
    private applyTranslation;
    disconnect(): void;
}
export declare const lazyQueue: LazyTranslationQueue;
export {};
