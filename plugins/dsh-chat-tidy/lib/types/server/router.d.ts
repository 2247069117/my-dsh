import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ConfigManager } from './config.ts';
import type { TranslationDispatcher } from './dispatcher.ts';
export declare function createHttpHandler(configManager: ConfigManager, dispatcher: TranslationDispatcher): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
