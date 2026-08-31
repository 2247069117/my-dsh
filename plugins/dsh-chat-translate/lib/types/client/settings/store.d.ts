export interface ClientSettingsState {
    enabled: boolean;
    concurrency: number;
    aiEnabled: boolean;
    bingEnabled: boolean;
    baseUrl: string;
    model: string;
    aiConfigured: boolean;
}
/** Settings namespace + credentials ref, mirroring the host constants. */
export declare const SETTINGS_NAMESPACE = "dsh-chat-translate";
export declare const TRANSLATE_API_KEY_REF = "TRANSLATE_API_KEY";
/**
 * Minimal structural shapes of the DSH browser services this store rides on:
 * `settingsScope` (from @deepseek-ai/dsh-client-ui-settings) and the
 * `credentials` Remote namespace. Keeping them structural keeps this bundle
 * free of host-service imports and lets tests inject fakes.
 */
export interface SettingsScopeLike {
    getSnapshot(): {
        status: string;
        value?: Record<string, unknown>;
        writable: boolean;
    };
    subscribe(listener: () => void): () => void;
    set(field: string, value: unknown): Promise<unknown>;
    unset(field: string): Promise<unknown>;
}
/** Shape of every DSH client Remote call: {ok, value} / {ok, error} wrapper. */
export type RemoteResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: {
        code?: string;
        message: string;
        details?: unknown;
    };
};
export interface CredentialsRemoteLike {
    describe(refs: string[]): Promise<RemoteResult<Record<string, {
        configured: boolean;
        source?: string;
        writable: boolean;
    }>>>;
    set(ref: string, value: string): Promise<RemoteResult<void>>;
    unset(ref: string): Promise<RemoteResult<void>>;
}
/**
 * Client settings store backed by the DSH settings namespace.
 *
 * Since 1.2 there is no localStorage overlay and no custom config HTTP
 * endpoint: the store derives from the bound `settingsScope` (which mirrors
 * the host document and folds every write answer back), and writes go
 * through `scope.set` — serialized, revision-checked, persisted by DSH.
 * Without a bound scope (e.g. non-loopback pages, unit tests) it degrades to
 * an in-memory store with the same semantics DSH itself uses for memory
 * persistence.
 */
declare class SettingsStore {
    private state;
    private listeners;
    private scope;
    private credentials;
    private unsubscribeScope;
    private keyConfigured;
    private writeTimer;
    private pendingFields;
    /**
     * Bind the DSH services. Called once from the settings UI setup; re-binding
     * (e.g. after a reconnect) detaches the previous subscription first.
     */
    attach(scope: SettingsScopeLike | null, credentials: CredentialsRemoteLike | null): void;
    getState(): ClientSettingsState;
    subscribe(listener: () => void): () => void;
    /** Map the resolved namespace value into client state and notify. */
    private derive;
    private applyState;
    private notify;
    /** Pull the key's status-only view and re-derive aiConfigured. */
    private refreshKeyStatus;
    /**
     * Optimistically apply locally, then persist each touched field through the
     * settings scope. Writes are trailing-debounced (300ms) so typing in the
     * baseUrl/model inputs collapses into a single queued mutation instead of
     * one write per keystroke — which would otherwise flash stale mirror values
     * back into the inputs between commits. A failed write makes the scope
     * reload its mirror, which re-derives this store from the host document
     * (conflict-safe recovery).
     */
    update(partial: Partial<ClientSettingsState>): Promise<void>;
    private scheduleWrite;
    private flushWrite;
    testChannel(channel: string): Promise<{
        ok: boolean;
        latencyMs: number;
        error?: string;
    }>;
    /** Write (or clear) the API key through the credentials Remote API. */
    saveApiKey(apiKey: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    dispose(): void;
}
export declare const settingsStore: SettingsStore;
export {};
