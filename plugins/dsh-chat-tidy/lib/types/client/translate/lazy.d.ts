declare class LazyTranslationQueue {
    private batchQueue;
    private debounceTimer;
    private enabled;
    setEnabled(enabled: boolean): void;
    observe(element: HTMLElement, text: string): void;
    private enqueueBatch;
    private flushBatch;
    private applyTranslation;
    disconnect(): void;
}
export declare const lazyQueue: LazyTranslationQueue;
export {};
