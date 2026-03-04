import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CONSENT_EVENT,
  ConsentPreferences,
  getConsent,
  saveConsent
} from '../utils/consent';

export const useConsent = () => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(() => getConsent());

  useEffect(() => {
    const syncConsent = () => {
      setConsent(getConsent());
    };

    window.addEventListener(CONSENT_EVENT, syncConsent);
    window.addEventListener('storage', syncConsent);

    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsent);
      window.removeEventListener('storage', syncConsent);
    };
  }, []);

  const setPreferences = useCallback((preferences: { ads: boolean; analytics: boolean }) => {
    const updated = saveConsent(preferences);
    setConsent(updated);
  }, []);

  const acceptAll = useCallback(() => {
    setPreferences({ ads: true, analytics: true });
  }, [setPreferences]);

  const rejectOptional = useCallback(() => {
    setPreferences({ ads: false, analytics: false });
  }, [setPreferences]);

  return useMemo(() => ({
    consent,
    hasDecision: !!consent,
    canShowAds: !!consent?.ads,
    canTrackAnalytics: !!consent?.analytics,
    setPreferences,
    acceptAll,
    rejectOptional
  }), [acceptAll, consent, rejectOptional, setPreferences]);
};
