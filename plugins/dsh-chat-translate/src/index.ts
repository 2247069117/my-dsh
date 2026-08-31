import z from '@deepseek-ai/schemastery';
import { dshHomePath } from '@deepseek-ai/dsh-home-paths';
import {
  ConfigManager,
  migrateLegacyConfigFile,
  SETTINGS_NAMESPACE,
  DEFAULT_CONFIG,
  MAX_CONCURRENCY,
  AI_TIMEOUT_MIN,
  AI_TIMEOUT_MAX,
} from './server/config.ts';
import { CredentialsReader, TRANSLATE_API_KEY_REF } from './server/credentials.ts';
import { LruDiskCache } from './server/cache.ts';
import { TranslationDispatcher } from './server/dispatcher.ts';
import { createHttpHandler } from './server/router.ts';

/** Stable Cordis loader name. */
export const name = 'dsh-chat-translate';

/**
 * Hard dependencies: webServer serves the translation proxy; settings and
 * credentials are the DSH-owned config/secret surfaces this plugin now rides
 * on (no standalone config file since 1.2).
 */
export const inject = ['webServer', 'settings', 'credentials'];

/** Settings namespace schema: defaults + bounds, resolved by DSH itself. */
const CONFIG_SCHEMA = z.object({
  enabled: z.boolean().default(DEFAULT_CONFIG.enabled),
  concurrency: z.number().min(1).max(MAX_CONCURRENCY).default(DEFAULT_CONFIG.concurrency),
  timeoutMs: z.number().min(500).max(10000).default(DEFAULT_CONFIG.timeoutMs),
  aiTimeoutMs: z.number().min(AI_TIMEOUT_MIN).max(AI_TIMEOUT_MAX).default(DEFAULT_CONFIG.aiTimeoutMs),
  aiEnabled: z.boolean().default(DEFAULT_CONFIG.aiEnabled),
  bingEnabled: z.boolean().default(DEFAULT_CONFIG.bingEnabled),
  baseUrl: z.string().default(DEFAULT_CONFIG.baseUrl),
  model: z.string().default(DEFAULT_CONFIG.model),
  targetLang: z.string().default(DEFAULT_CONFIG.targetLang),
});

interface HostContext {
  webServer?: {
    register(route: {
      kind: 'prefix' | 'exact';
      path: string;
      handler: (req: any, res: any) => Promise<void> | void;
    }): () => void;
  };
  settings: {
    register(ns: string, schema: unknown): {
      get(): any;
      watch(listener: (config: any) => void): () => void;
      update(patch: Record<string, unknown>): Promise<unknown>;
    };
    describe(): Array<{ ns: string; user?: unknown }>;
    update(ns: string, patch: Record<string, unknown>): Promise<unknown>;
  };
  credentials: {
    resolve(ref: string): Promise<{ value: string; source?: string } | undefined>;
    describe(ref: string): Promise<{ configured: boolean; source?: string; writable: boolean }>;
    set(ref: string, value: string): Promise<void>;
    unset(ref: string): Promise<void>;
  };
  on(event: string, listener: (...args: any[]) => void): () => void;
  effect(factory: () => void | (() => void), label: string): void;
  get?(serviceName: string): any;
}

/** Mount the host half; provides the translation proxy and rides DSH config. */
export function apply(ctx: HostContext): void {
  const credentials = new CredentialsReader(ctx.credentials);
  const configManager = new ConfigManager(ctx.settings.register(SETTINGS_NAMESPACE, CONFIG_SCHEMA), credentials);
  const cache = new LruDiskCache(1000);
  const dispatcher = new TranslationDispatcher(configManager, cache, credentials);

  // Initialize async resources: credentials cache, disk cache relocation, and
  // the one-shot migration of the legacy dsh-chat-translate-config.json.
  const legacyConfigPath = dshHomePath('dsh-chat-translate-config.json');
  const initPromise = Promise.all([
    credentials.init(),
    cache.init(),
    migrateLegacyConfigFile(ctx.settings, legacyConfigPath),
  ]).catch((err) => {
    console.warn('[dsh-chat-translate] Initialization error:', err);
  });

  // Keep the synchronous key cache warm: the credentials service fans this
  // event out after every committed write or external reload.
  ctx.on('credentials/reference-updated', (ref: unknown) => {
    if (ref === TRANSLATE_API_KEY_REF) {
      void credentials.refresh();
    }
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
          path: '/api/dsh-chat-translate',
          handler,
        });
        return () => {
          if (typeof unregister === 'function') {
            unregister();
          }
          cache.dispose().catch((err) => {
            console.warn('[dsh-chat-translate] Dispose cache error:', err);
          });
        };
      },
      'dsh-chat-translate: translation API routes'
    );
  }
}
