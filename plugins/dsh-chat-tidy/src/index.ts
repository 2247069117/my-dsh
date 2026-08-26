import { ConfigManager } from './server/config.ts';
import { LruDiskCache } from './server/cache.ts';
import { TranslationDispatcher } from './server/dispatcher.ts';
import { createHttpHandler } from './server/router.ts';

/** Stable Cordis loader name. */
export const name = 'dsh-chat-tidy';

/** Inject webServer to serve the translation API */
export const inject = ['webServer'];

interface HostContext {
  webServer?: {
    register(route: {
      kind: 'prefix' | 'exact';
      path: string;
      handler: (req: any, res: any) => Promise<void> | void;
    }): () => void;
  };
  effect(factory: () => void | (() => void), label: string): void;
  get?(serviceName: string): any;
}

/** Mount the host half; provides translation proxy and settings persistence */
export function apply(ctx: HostContext): void {
  const configManager = new ConfigManager();
  const cache = new LruDiskCache(1000);
  const dispatcher = new TranslationDispatcher(configManager, cache);

  // Initialize async resources
  const initPromise = Promise.all([configManager.init(), cache.init()]).catch((err) => {
    console.warn('[dsh-chat-tidy] Initialization error:', err);
  });

  const webServer = ctx.webServer || (ctx.get ? ctx.get('webServer') : null);
  if (webServer && typeof webServer.register === 'function') {
    const rawHandler = createHttpHandler(configManager, dispatcher);
    const handler = async (req: any, res: any) => {
      await initPromise;
      return rawHandler(req, res);
    };

    ctx.effect(
      () => {
        const unregister = webServer.register({
          kind: 'prefix',
          path: '/api/dsh-chat-tidy',
          handler,
        });
        return () => {
          if (typeof unregister === 'function') {
            unregister();
          }
          cache.dispose().catch((err) => {
            console.warn('[dsh-chat-tidy] Dispose cache error:', err);
          });
        };
      },
      'dsh-chat-tidy: translation API routes'
    );
  }
}
