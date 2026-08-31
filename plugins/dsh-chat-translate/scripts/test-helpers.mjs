// Shared fakes for the dsh-chat-translate test suites.
// Since 1.2 the plugin rides DSH services (ctx.settings / ctx.credentials)
// instead of files, so tests inject in-memory fakes with the same shapes.
import { DEFAULT_CONFIG, SETTINGS_NAMESPACE } from '../src/server/config.ts';

/**
 * In-memory stand-in for the owner scope returned by ctx.settings.register().
 * get() returns the merged config; update() applies the patch and notifies
 * watchers (mirroring DSH's resolved-value commit).
 */
export function createFakeSettingsScope(initial = {}) {
  let config = { ...DEFAULT_CONFIG, ...initial };
  let userLayer = undefined;
  const listeners = new Set();
  return {
    get: () => ({ ...config }),
    watch: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update: async (patch) => {
      userLayer = { ...(userLayer ?? {}), ...patch };
      config = { ...config, ...patch };
      for (const listener of [...listeners]) listener(config);
    },
    // Minimal settings-service face for migration tests. Mirrors the real
    // service: the `user` key is OMITTED (not undefined) while no user layer
    // exists.
    describe: () => [
      { ns: SETTINGS_NAMESPACE, ...(userLayer === undefined ? {} : { user: userLayer }) },
    ],
    setUserLayer: (user) => {
      userLayer = user;
      config = { ...DEFAULT_CONFIG, ...user };
    },
  };
}

/**
 * In-memory stand-in for the DSH ctx.credentials service. Keys are plain
 * strings; TRANSLATE_API_KEY is the only ref the suites exercise.
 */
export function createFakeCredentials(initialKey = '') {
  let key = initialKey;
  return {
    resolve: async (ref) =>
      ref === 'TRANSLATE_API_KEY' && key ? { value: key, source: 'file' } : undefined,
    describe: async (ref) => ({
      configured: Boolean(ref === 'TRANSLATE_API_KEY' && key),
      writable: true,
    }),
    set: async (ref, value) => {
      if (ref === 'TRANSLATE_API_KEY') key = value;
    },
    unset: async (ref) => {
      if (ref === 'TRANSLATE_API_KEY') key = '';
    },
  };
}
