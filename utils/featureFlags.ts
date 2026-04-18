/**
 * Feature Flags — lightweight A/B testing and gradual rollout utility.
 *
 * Flags can be:
 * - Statically configured here (default values)
 * - Overridden per-user via localStorage (for QA / manual testing)
 * - Extended later with a remote config source (Supabase, LaunchDarkly, etc.)
 *
 * Usage:
 *   isEnabled('pricing_layout_v2')   → boolean
 *   getVariant('pricing_experiment') → 'control' | 'treatment'
 *   override('pricing_layout_v2', true)  // for manual QA
 */

import { storage } from './storage';

type FlagValue = boolean | string | number;

interface FeatureFlag {
  /** Default value */
  defaultValue: FlagValue;
  /** Human-readable description for debugging */
  description: string;
  /** Rollout percentage 0-100 (for boolean flags). Computed once per user. */
  rolloutPercent?: number;
}

// ── Flag definitions ──────────────────────────────────────────────────────────

const FLAGS: Record<string, FeatureFlag> = {
  /**
   * Experiment: Alternative pricing layout (3-column vs centered premium).
   * Variants: 'control' (current), 'centered' (premium card full-width)
   */
  pricing_layout_experiment: {
    defaultValue: 'control',
    description: 'A/B test: pricing page layout variant',
  },

  /**
   * Show "streak freeze" feature in routines page.
   * Gradual rollout at 20% to test engagement impact.
   */
  streak_freeze: {
    defaultValue: false,
    description: 'Allow users to freeze their streak once per week',
    rolloutPercent: 20,
  },

  /**
   * New onboarding flow with symptom quiz.
   */
  onboarding_quiz: {
    defaultValue: false,
    description: 'Show symptom quiz during onboarding instead of direct search',
    rolloutPercent: 0, // Not rolled out yet
  },

  /**
   * AI voice narration for meditations (premium only).
   * Requires VITE_ENABLE_VOICE to be set.
   */
  voice_meditations: {
    defaultValue: false,
    description: 'Enable AI voice narration for meditation content',
  },

  /**
   * Community moderation tools for admin/moderator roles.
   */
  community_moderation: {
    defaultValue: false,
    description: 'Show moderation controls to moderators',
  },
} as const;

export type FlagKey = keyof typeof FLAGS;

// ── Bucketing (deterministic per user+flag) ───────────────────────────────────

/** Returns a stable 0-99 bucket for a user+flag combination */
const getBucket = (userId: string, flagKey: string): number => {
  let hash = 0;
  const str = `${userId}:${flagKey}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash) % 100;
};

// ── Core API ──────────────────────────────────────────────────────────────────

/**
 * Check if a boolean feature flag is enabled.
 * Respects rollout percentage and localStorage overrides.
 */
export const isEnabled = (flagKey: FlagKey, userId?: string): boolean => {
  const flag = FLAGS[flagKey];
  if (!flag) return false;

  // localStorage override takes priority (QA / manual testing)
  const override = storage.getRaw(`flag_${flagKey}`);
  if (override !== null) return override === 'true';

  if (typeof flag.defaultValue === 'boolean') {
    // Gradual rollout
    if (flag.rolloutPercent !== undefined && userId) {
      return getBucket(userId, flagKey) < flag.rolloutPercent;
    }
    return flag.defaultValue;
  }

  return false;
};

/**
 * Get a string/number variant value for a flag.
 * Returns the default value if no override is set.
 */
export const getVariant = <T extends FlagValue>(flagKey: FlagKey): T => {
  const flag = FLAGS[flagKey];
  if (!flag) return '' as T;

  const override = storage.getRaw(`flag_${flagKey}`);
  if (override !== null) return override as T;

  return flag.defaultValue as T;
};

/**
 * Override a flag value in localStorage (for QA, manual testing, demo mode).
 * Pass `null` to remove the override and revert to default.
 */
export const overrideFlag = (flagKey: FlagKey, value: FlagValue | null): void => {
  if (value === null) {
    storage.remove(`flag_${flagKey}`);
  } else {
    storage.setRaw(`flag_${flagKey}`, String(value));
  }
};

/**
 * Get all current flag states (useful for debugging and analytics attribution).
 */
export const getAllFlags = (userId?: string): Record<string, FlagValue> => {
  return Object.fromEntries(
    Object.keys(FLAGS).map(key => {
      const flagKey = key as FlagKey;
      const flag = FLAGS[flagKey];
      if (typeof flag.defaultValue === 'boolean') {
        return [key, isEnabled(flagKey, userId)];
      }
      return [key, getVariant(flagKey)];
    })
  );
};

/**
 * React hook for consuming a boolean flag.
 * Re-reads on mount (flags are stable within a session).
 */
export const useFlag = (flagKey: FlagKey, userId?: string): boolean => {
  return isEnabled(flagKey, userId);
};
