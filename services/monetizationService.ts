type MonetizationEventName =
  | 'paywall_view'
  | 'checkout_click'
  | 'donation_click'
  | 'ad_impression_house'
  | 'ad_impression_network'
  | 'ad_click_house';

type MonetizationPayload = Record<string, string | number | boolean | null | undefined>;

import { canRunAnalytics } from '../utils/consent';

export const trackMonetizationEvent = (
  name: MonetizationEventName,
  payload: MonetizationPayload = {}
): void => {
  const safePayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  const maybeGtag = (window as any).gtag;
  if (canRunAnalytics() && typeof maybeGtag === 'function') {
    maybeGtag('event', name, safePayload);
  }

  window.dispatchEvent(
    new CustomEvent('sanarte:monetization', {
      detail: { name, payload: safePayload, at: Date.now() }
    })
  );
};
