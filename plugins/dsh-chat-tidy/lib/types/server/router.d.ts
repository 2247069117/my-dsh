import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ConfigManager } from './config.ts';
import type { TranslationDispatcher } from './dispatcher.ts';
import type { CredentialsReader } from './credentials.ts';
export declare function createHttpHandler(configManager: ConfigManager, dispatcher: TranslationDispatcher, credentials?: CredentialsReader): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
