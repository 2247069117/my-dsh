/** Stable Cordis loader name. */
export declare const name = "dsh-chat-tidy";
/** Inject webServer to serve the translation API */
export declare const inject: string[];
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
export declare function apply(ctx: HostContext): void;
export {};
