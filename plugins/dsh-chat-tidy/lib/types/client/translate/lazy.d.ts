declare class LazyTranslationQueue {
    private batchQueue;
    private debounceTimer;
    observe(element: HTMLElement, text: string): void;
    private enqueueBatch;
    private flushBatch;
    private applyTranslation;
    disconnect(): void;
}
export declare const lazyQueue: LazyTranslationQueue;
export {};
