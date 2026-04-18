import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json';

/**
 * i18n configuration for SanArte.
 *
 * Default language: Spanish (es) — primary market.
 * Adding a new language:
 *   1. Create locales/<lang>/common.json (copy es/common.json as template)
 *   2. Add import above and add to `resources` below
 *   3. Add language selector to ProfilePage / settings
 *
 * Usage in components:
 *   const { t } = useTranslation();
 *   t('nav.home')              → "Inicio"
 *   t('profile.level', { level: 3 }) → "Nivel 3"
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇦🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const STORAGE_KEY = 'sanarte_v1_language';

const detectLanguage = (): string => {
  // 1. User preference persisted in localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) return stored;

  // 2. Browser preference
  const browserLang = navigator.language?.split('-')[0];
  if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) return browserLang;

  // 3. Default
  return 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { common: esCommon },
      en: { common: enCommon },
    },
    lng: detectLanguage(),
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false, // React handles XSS
    },
    // Prevents hydration mismatch warnings in strict mode
    react: {
      useSuspense: false,
    },
  });

/** Persist language choice and change i18n language */
export const changeLanguage = (lang: SupportedLanguage): void => {
  localStorage.setItem(STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export default i18n;
