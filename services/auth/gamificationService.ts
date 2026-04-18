import { supabase } from '../../supabaseClient';
import { logger } from '../../utils/logger';
import { UserProfile } from '../../types';
import { Database } from '../../types_db';
import { mapProfileToUser, invalidateUserCache, setCachedUser } from './profileService';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const XP_PER_LEVEL = 500;
const FREE_MESSAGE_LIMIT = 5;

// Injected at runtime by index.ts to avoid circular deps
let _getUser: () => Promise<UserProfile | null>;

export const injectGamificationDeps = (deps: {
  getUser: () => Promise<UserProfile | null>;
}) => {
  _getUser = deps.getUser;
};

export const gamificationOps = {
  addXP: async (amount: number): Promise<UserProfile | null> => {
    const currentProfile = await _getUser();
    if (!currentProfile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const newXp = currentProfile.xp + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    const updates: ProfileUpdate = { xp: newXp };
    if (newLevel > currentProfile.level) {
      updates.level = newLevel;
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return null;

    if (amount > 0) {
      window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount, levelUp: newLevel > currentProfile.level } }));
    }

    const mapped = mapProfileToUser(updatedProfile as ProfileRow);
    setCachedUser(mapped);
    return mapped;
  },

  incrementMessageCount: async (): Promise<boolean> => {
    const user = await _getUser();
    if (!user) return false;

    if (user.isPremium) return true;
    if (user.dailyMessageCount >= FREE_MESSAGE_LIMIT) return false;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const update: ProfileUpdate = { daily_message_count: user.dailyMessageCount + 1 };
    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', session.user.id);

    if (!error) invalidateUserCache();
    return !error;
  },

  incrementHealingMoments: async (): Promise<void> => {
    const user = await _getUser();
    if (!user) return;

    const update: ProfileUpdate = { healing_moments: (user.healingMoments || 0) + 1 };
    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id);

    if (error) logger.error("Error incrementing healing moments:", error);
    else invalidateUserCache();
  },
};
