export interface MaskResult {
    maskedText: string;
    unmask: (translatedText: string) => string;
}
export declare class ContentMaskingPipeline {
    mask(text: string): MaskResult;
}
