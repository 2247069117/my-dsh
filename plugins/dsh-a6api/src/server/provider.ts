import type { Context } from '@deepseek-ai/cordis';

/** Register a6api in DSH LLM runtime configurable providers directory */
export function registerA6ApiProvider(ctx: any): (() => void) | void {
  try {
    const llm = ctx.llm || (ctx.get ? ctx.get('llm') : null);
    if (llm && typeof llm.registerConfigurableProviders === 'function') {
      const handle = llm.registerConfigurableProviders([
        {
          provider: 'a6api',
          displayName: 'A6API',
          settingsNs: 'llm-pi-ai',
          settingsPath: ['providers', 'a6api'],
          declared: true,
        },
      ]);
      return () => {
        try {
          if (typeof handle === 'function') {
            handle();
          } else if (handle && typeof handle.dispose === 'function') {
            handle.dispose();
          }
        } catch (err) {
          console.warn('[dsh-a6api] Dispose configurable provider error:', err);
        }
      };
    }
  } catch (err) {
    console.warn('[dsh-a6api] Failed to register configurable provider:', err);
  }
}
