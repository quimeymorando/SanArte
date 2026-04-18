/**
 * Engagement tracking — DAU, session metrics, and retention signals.
 *
 * Tracks lightweight events client-side via localStorage (no extra network cost).
 * Reports aggregated signals to Vercel Analytics on session end.
 *
 * Metrics tracked:
 *  - DAU: daily active user via `last_active_date`
 *  - searches_today: symptom searches in current day
 *  - session_searches: searches in current page load
 *  - symptom_view_count: total symptom detail pages viewed
 *  - streak_days: days in a row the user opened the app
 *  - last_active_ts: ISO timestamp for re-engagement detection
 *  - completion_rate: ratio of symptom views with "saved" action
 */

import { storage } from './storage';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EngagementSnapshot {
  dau: boolean;           // true if this is the user's first action today
  searchesToday: number;
  sessionSearches: number;
  symptomViewCount: number;
  streakDays: number;
  lastActiveDaysAgo: number;
  completionRate: number; // 0-1
}

// ── Session state (in-memory, reset on page load) ─────────────────────────────

let sessionSearches = 0;
let sessionSymptomViews = 0;
let sessionSavedActions = 0;

// ── Internal helpers ──────────────────────────────────────────────────────────

const todayString = (): string => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const getLastActiveDate = (): string | null => storage.getRaw('last_active_date');

const daysDiff = (isoA: string, isoB: string): number => {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
};

/** Compute consecutive-day streak. Called once per day. */
const updateStreak = (): number => {
  const today = todayString();
  const lastActive = getLastActiveDate();
  const currentStreak = storage.get<number>('streak_days') ?? 0;

  if (!lastActive) return 1; // First time ever
  if (lastActive === today) return currentStreak; // Already counted today

  const diff = daysDiff(lastActive, today);

  if (diff === 1) {
    // Consecutive day — increment streak
    return currentStreak + 1;
  } else {
    // Streak broken
    return 1;
  }
};

/** Mark the user active for today (DAU). Returns true on first call of the day. */
const markActiveToday = (): boolean => {
  const today = todayString();
  const lastActive = getLastActiveDate();
  const isNewDay = lastActive !== today;

  if (isNewDay) {
    const newStreak = updateStreak();
    storage.setRaw('last_active_date', today);
    storage.set('streak_days', newStreak);
    storage.set('searches_today', 0);
    storage.setRaw('last_active_ts', new Date().toISOString());
  } else {
    storage.setRaw('last_active_ts', new Date().toISOString());
  }

  return isNewDay;
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Call once on app mount / user session start.
 * Handles DAU tracking and streak updates.
 */
export const trackAppOpen = (): void => {
  markActiveToday();
  reportToAnalytics('app_open', { streak: storage.get<number>('streak_days') ?? 1 });
};

/**
 * Track a symptom search query.
 */
export const trackSearch = (query: string): void => {
  sessionSearches++;
  const today = storage.get<number>('searches_today') ?? 0;
  storage.set('searches_today', today + 1);
  reportToAnalytics('search', { query: query.slice(0, 50), session_count: sessionSearches });
};

/**
 * Track a symptom detail page view.
 */
export const trackSymptomView = (symptomName: string): void => {
  sessionSymptomViews++;
  const total = storage.get<number>('symptom_view_count') ?? 0;
  storage.set('symptom_view_count', total + 1);
  reportToAnalytics('symptom_view', { symptom: symptomName.slice(0, 60), total_views: total + 1 });
};

/**
 * Track a "save" or completion action (favorited, journaled, routine added).
 * Used to compute completion_rate.
 */
export const trackCompletionAction = (action: 'favorited' | 'journaled' | 'routine_added'): void => {
  sessionSavedActions++;
  const total = storage.get<number>('completion_actions') ?? 0;
  storage.set('completion_actions', total + 1);
  reportToAnalytics('completion', { action, session_completion_actions: sessionSavedActions });
};

/**
 * Track premium upgrade conversion.
 */
export const trackUpgrade = (plan: string): void => {
  reportToAnalytics('upgrade', { plan });
};

/**
 * Get a full snapshot of the user's engagement state.
 */
export const getEngagementSnapshot = (): EngagementSnapshot => {
  const lastActiveTs = storage.getRaw('last_active_ts');
  const lastActiveDaysAgo = lastActiveTs
    ? daysDiff(lastActiveTs, new Date().toISOString())
    : 0;

  const totalViews = storage.get<number>('symptom_view_count') ?? 0;
  const totalCompletions = storage.get<number>('completion_actions') ?? 0;

  return {
    dau: getLastActiveDate() === todayString(),
    searchesToday: storage.get<number>('searches_today') ?? 0,
    sessionSearches,
    symptomViewCount: totalViews,
    streakDays: storage.get<number>('streak_days') ?? 0,
    lastActiveDaysAgo,
    completionRate: totalViews > 0 ? Math.min(1, totalCompletions / totalViews) : 0,
  };
};

/**
 * Returns true if the user has been inactive for >= `days` days.
 * Used to decide whether to show re-engagement prompts.
 */
export const isUserInactive = (days = 3): boolean => {
  const lastActiveTs = storage.getRaw('last_active_ts');
  if (!lastActiveTs) return false; // New user, not yet inactive
  const daysAgo = daysDiff(lastActiveTs, new Date().toISOString());
  return daysAgo >= days;
};

// ── Analytics reporter ────────────────────────────────────────────────────────

const reportToAnalytics = (event: string, data: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  // Vercel Analytics custom events
  const va = (window as unknown as Record<string, unknown>).va;
  if (typeof va === 'function') {
    (va as (e: string, d: Record<string, unknown>) => void)(event, data);
  }
};
