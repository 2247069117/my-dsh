export interface MaskResult {
  maskedText: string;
  unmask: (translatedText: string) => string;
}

export class ContentMaskingPipeline {
  mask(text: string): MaskResult {
    if (!text || typeof text !== 'string') {
      return {
        maskedText: text,
        unmask: (t: string) => t,
      };
    }

    const masks: string[] = [];
    const addMask = (match: string): string => {
      const idx = masks.length;
      masks.push(match);
      return `__DSH_MASK_${idx}__`;
    };

    let processed = text;

    // 1. Multi-line code blocks (```...``` or ~~~...~~~)
    processed = processed.replace(/(?:```|~~~)[\s\S]*?(?:```|~~~)/g, (m) => addMask(m));

    // 2. Inline code (`...`)
    processed = processed.replace(/`[^`\n]+`/g, (m) => addMask(m));

    // 3. URLs
    processed = processed.replace(/https?:\/\/[^\s)\];,;"'<>]+/g, (m) => addMask(m));

    // 4. File paths and filenames with known extensions
    processed = processed.replace(
      /(?:(?:\/|[a-zA-Z]:[\\\/]|\.\.?[\\\/])[\w.\-\\\/]+|\b(?:[\w.\-]+\/)+[\w.\-]+\.[a-zA-Z0-9]+\b|\b[\w.\-]+\.(?:ts|tsx|js|jsx|json|ya?ml|md|py|go|rs|c|cpp|h|hpp|css|scss|html|sh|bash|mjs|cjs|toml|lock|log|env|svg|png|jpe?g|gif|tar|gz|zip|xml|sql)\b)/g,
      (m) => addMask(m)
    );

    // 5. CLI flags / options (--flag, --flag=value, -f)
    processed = processed.replace(
      /(?<=^|[\s(\[{"'])((?:--[a-zA-Z0-9_\-]+(?:=[^\s"'<>]+)?)|(?:-[a-zA-Z0-9]+))(?=[\s)\]}",:;!?]|$)/g,
      (m) => addMask(m)
    );

    const unmask = (translatedText: string): string => {
      if (!translatedText || masks.length === 0) {
        return translatedText;
      }
      // Tolerate whitespace variations and casing introduced by MT engines
      // e.g. "__ DSH_MASK_0 __", "__dsh_mask_0__", "__DSH _ MASK _ 0__"
      return translatedText.replace(
        /__\s*DSH\s*_\s*MASK\s*_\s*(\d+)\s*__/gi,
        (_fullMatch, indexStr) => {
          const idx = parseInt(indexStr, 10);
          if (!Number.isNaN(idx) && idx >= 0 && idx < masks.length) {
            return masks[idx];
          }
          return _fullMatch;
        }
      );
    };

    return {
      maskedText: processed,
      unmask,
    };
  }
}
