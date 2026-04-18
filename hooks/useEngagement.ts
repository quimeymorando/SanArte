/**
 * useEngagement — React hook for engagement tracking and re-engagement prompts.
 *
 * Handles:
 * 1. Session start tracking (DAU, streak)
 * 2. Web Push permission + subscription for re-engagement notifications
 * 3. Exposing tracking functions to components
 *
 * Usage:
 *   const { trackSearch, trackSymptomView, trackCompletionAction } = useEngagement(userId);
 */

import { useEffect, useCallback } from 'react';
import {
  trackAppOpen,
  trackSearch as _trackSearch,
  trackSymptomView as _trackSymptomView,
  trackCompletionAction as _trackCompletionAction,
  trackUpgrade as _trackUpgrade,
  isUserInactive,
} from '../utils/engagement';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

// ── Push Notification helpers ─────────────────────────────────────────────────

const PUSH_ASKED_KEY = 'push_permission_asked';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
};

const registerPushSubscription = async (): Promise<void> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (!VAPID_PUBLIC_KEY) return; // Push not configured

  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) return; // Already subscribed

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Send subscription to backend to store for later push delivery
    await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    logger.log('[Push] Subscribed to web push notifications');
  } catch (err) {
    logger.warn('[Push] Subscription failed:', err);
  }
};

/**
 * Ask for push notification permission if:
 * - User has been active for >= 3 sessions (not a new user)
 * - We haven't asked before
 * - User is inactive for 0 days (i.e., active right now, ask proactively for future re-engagement)
 */
const maybeRequestPushPermission = async (): Promise<void> => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return; // Already granted or denied
  if (storage.has(PUSH_ASKED_KEY)) return; // Already asked this user

  const sessionCount = (storage.get<number>('session_count') ?? 0);
  if (sessionCount < 3) return; // Too new — don't push for permission yet

  storage.setRaw(PUSH_ASKED_KEY, 'true');

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await registerPushSubscription();
  }
};

// ── Service Worker registration ───────────────────────────────────────────────

const registerServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (err) {
    logger.warn('[SW] Registration failed:', err);
  }
};

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseEngagementReturn {
  trackSearch: (query: string) => void;
  trackSymptomView: (symptomName: string) => void;
  trackCompletionAction: (action: 'favorited' | 'journaled' | 'routine_added') => void;
  trackUpgrade: (plan: string) => void;
  /** true if user hasn't opened the app in 3+ days */
  isInactive: boolean;
}

export const useEngagement = (_userId?: string): UseEngagementReturn => {
  useEffect(() => {
    // Track session start
    trackAppOpen();

    // Increment persistent session counter
    const sessions = (storage.get<number>('session_count') ?? 0) + 1;
    storage.set('session_count', sessions);

    // Register service worker for push notifications
    registerServiceWorker().then(() => {
      maybeRequestPushPermission().catch(() => {});
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const trackSearch = useCallback((query: string) => {
    _trackSearch(query);
  }, []);

  const trackSymptomView = useCallback((symptomName: string) => {
    _trackSymptomView(symptomName);
  }, []);

  const trackCompletionAction = useCallback((action: 'favorited' | 'journaled' | 'routine_added') => {
    _trackCompletionAction(action);
  }, []);

  const trackUpgrade = useCallback((plan: string) => {
    _trackUpgrade(plan);
  }, []);

  return {
    trackSearch,
    trackSymptomView,
    trackCompletionAction,
    trackUpgrade,
    isInactive: isUserInactive(3),
  };
};
