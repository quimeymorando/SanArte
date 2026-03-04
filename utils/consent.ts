export interface ConsentPreferences {
  ads: boolean;
  analytics: boolean;
  essential: true;
  version: number;
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = 'sanarte_consent_v1';
export const CONSENT_EVENT = 'sanarte:consent-updated';

const CONSENT_VERSION = 1;

const isBrowser = (): boolean => typeof window !== 'undefined';

const isValidConsent = (value: unknown): value is ConsentPreferences => {
  if (!value || typeof value !== 'object') return false;

  const parsed = value as Partial<ConsentPreferences>;
  return (
    typeof parsed.ads === 'boolean' &&
    typeof parsed.analytics === 'boolean' &&
    parsed.essential === true &&
    typeof parsed.version === 'number' &&
    typeof parsed.updatedAt === 'string'
  );
};

export const getConsent = (): ConsentPreferences | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isValidConsent(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const saveConsent = (preferences: Pick<ConsentPreferences, 'ads' | 'analytics'>): ConsentPreferences | null => {
  if (!isBrowser()) return null;

  const payload: ConsentPreferences = {
    ads: preferences.ads,
    analytics: preferences.analytics,
    essential: true,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString()
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: payload }));

  return payload;
};

export const clearConsent = (): void => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
};

export const canRunAds = (): boolean => !!getConsent()?.ads;
export const canRunAnalytics = (): boolean => !!getConsent()?.analytics;
