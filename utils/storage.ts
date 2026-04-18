/**
 * Versioned localStorage utility.
 *
 * All keys are automatically prefixed with `sanarte_v1_` to:
 * 1. Avoid collisions with other apps / browser extensions
 * 2. Enable easy cache invalidation: bumping STORAGE_VERSION clears all old keys
 * 3. Make debugging trivial — all SanArte keys are identifiable in DevTools
 *
 * Usage:
 *   storage.set('favorites_cache', data);
 *   storage.get<Favorite[]>('favorites_cache');
 *   storage.remove('favorites_cache');
 */

const STORAGE_VERSION = 'v1';
const PREFIX = `sanarte_${STORAGE_VERSION}_`;

const prefixed = (key: string): string => `${PREFIX}${key}`;

/**
 * Migrates legacy unprefixed keys to the new versioned format on first run.
 * Called once at app startup. Safe to call multiple times (idempotent).
 */
export const migrateStorage = (): void => {
  const LEGACY_KEYS: Record<string, string> = {
    'sanarte_favorites_cache': 'favorites_cache',
    'guest_mode':              'guest_mode',
    'consent_analytics':       'consent_analytics',
  };

  const migrationDoneKey = `${PREFIX}migrated`;
  if (localStorage.getItem(migrationDoneKey)) return;

  for (const [legacyKey, newKey] of Object.entries(LEGACY_KEYS)) {
    const value = localStorage.getItem(legacyKey);
    if (value !== null) {
      localStorage.setItem(prefixed(newKey), value);
      localStorage.removeItem(legacyKey);
    }
  }

  localStorage.setItem(migrationDoneKey, 'true');
};

export const storage = {
  /**
   * Retrieve and JSON-parse a value. Returns `null` if key doesn't exist or parse fails.
   */
  get: <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(prefixed(key));
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Serialize and store a value. Silently ignores QuotaExceededError.
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(prefixed(key), JSON.stringify(value));
    } catch {
      // QuotaExceededError — storage full, ignore
    }
  },

  /**
   * Store a raw string (no JSON serialization).
   */
  setRaw: (key: string, value: string): void => {
    try {
      localStorage.setItem(prefixed(key), value);
    } catch {
      // ignore
    }
  },

  /**
   * Retrieve a raw string value (no JSON parsing).
   */
  getRaw: (key: string): string | null => {
    return localStorage.getItem(prefixed(key));
  },

  remove: (key: string): void => {
    localStorage.removeItem(prefixed(key));
  },

  /** Clear only SanArte keys (leaves other apps' storage intact). */
  clearAll: (): void => {
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) toDelete.push(key);
    }
    toDelete.forEach(k => localStorage.removeItem(k));
  },

  /** Check if a key exists. */
  has: (key: string): boolean => {
    return localStorage.getItem(prefixed(key)) !== null;
  },
};
