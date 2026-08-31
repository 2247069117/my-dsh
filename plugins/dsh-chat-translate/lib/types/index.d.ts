/** Stable Cordis loader name. */
export declare const name = "dsh-chat-translate";
/**
 * Hard dependencies: webServer serves the translation proxy; settings and
 * credentials are the DSH-owned config/secret surfaces this plugin now rides
 * on (no standalone config file since 1.2).
 */
export declare const inject: string[];
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
        describe(): Array<{
            ns: string;
            user?: unknown;
        }>;
        update(ns: string, patch: Record<string, unknown>): Promise<unknown>;
    };
    credentials: {
        resolve(ref: string): Promise<{
            value: string;
            source?: string;
        } | undefined>;
        describe(ref: string): Promise<{
            configured: boolean;
            source?: string;
            writable: boolean;
        }>;
        set(ref: string, value: string): Promise<void>;
        unset(ref: string): Promise<void>;
    };
    on(event: string, listener: (...args: any[]) => void): () => void;
    effect(factory: () => void | (() => void), label: string): void;
    get?(serviceName: string): any;
}
/** Mount the host half; provides the translation proxy and rides DSH config. */
export declare function apply(ctx: HostContext): void;
export {};
