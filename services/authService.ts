import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';
import { UserProfile } from '../types';
import { Database } from '../types_db';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const XP_PER_LEVEL = 500;
const FREE_MESSAGE_LIMIT = 5;
const ENABLE_GUEST_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_GUEST_MODE === 'true';

// Helper to transform raw DB data to TypeScript UserProfile
const mapProfileToUser = (profile: ProfileRow): UserProfile => ({
  id: profile.id,
  name: profile.name || profile.email?.split('@')[0] || 'Sanador',
  email: profile.email || '',
  avatar: profile.avatar_url || undefined,
  joinDate: profile.join_date || new Date().toISOString(),
  isPremium: !!profile.is_premium,
  xp: profile.xp || 0,
  level: profile.level || 1,
  role: profile.role || 'user',
  badges: profile.badges || [],
  dailyMessageCount: profile.daily_message_count || 0,
  lastMessageDate: profile.last_message_date || new Date().toDateString(),
  currentStreak: profile.current_streak || 0,
  longestStreak: profile.longest_streak || 0,
  healingMoments: profile.healing_moments || 0,
  lastActiveDate: profile.last_active_at || new Date().toISOString()
});

const safePromise = <T>(promise: Promise<T>, timeoutMs = 4000, fallbackValue: T | null = null): Promise<T | null> => {
  return Promise.race([
    promise,
    new Promise<T | null>((resolve, reject) => setTimeout(() => {
      if (fallbackValue !== undefined) resolve(fallbackValue);
      else reject(new Error("Timeout en operación de Supabase"));
    }, timeoutMs))
  ]);
};

const USER_CACHE_TTL_MS = 15000;
let cachedUser: UserProfile | null = null;
let cachedUserAt = 0;
let pendingUserRequest: Promise<UserProfile | null> | null = null;
const dailySyncByUser = new Map<string, string>();

const invalidateUserCache = (): void => {
  cachedUser = null;
  cachedUserAt = 0;
};

const todayKey = (): string => new Date().toDateString();

const shouldUseCache = (): boolean => {
  return !!cachedUser && Date.now() - cachedUserAt < USER_CACHE_TTL_MS;
};

export const authService = {
  clearCachedUser: (): void => {
    invalidateUserCache();
  },

  // Login: Uses Supabase Auth
  login: async (email: string, password?: string): Promise<UserProfile | null> => {
    if (!password) {
      throw new Error("Se requiere contraseña para iniciar sesión.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Error en login:', error.message);
      throw error;
    }

    if (data.user) {
      invalidateUserCache();
      return await authService.getUser();
    }
    return null;
  },

  // Register: Creates Auth user, Trigger creates Profile
  register: async (name: string, email: string, password?: string): Promise<UserProfile | null> => {
    if (!password) {
      password = "temp-password-123";
      logger.warn("Usando contraseña temporal. Actualiza tu UI para pedir contraseña.");
    }

    // Explicitly type the options to ensure emailRedirectTo is accepted
    const options = {
      data: { name },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });

    if (error) {
      // Fallback: If user already exists, try login
      if (error.message.includes("already registered") || error.status === 422 || error.status === 400) {
        return authService.login(email, password);
      }
      throw error;
    }

    if (data.user) {
      if (!data.session) {
        // CRITICAL CASE: User created but no session (requires email confirmation)
        throw new Error("Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta antes de ingresar.");
      }

      // Successful complete login
      return {
        id: data.user.id,
        name,
        email,
        joinDate: new Date().toISOString(),
        isPremium: false,
        xp: 0,
        level: 1,
        badges: [],
        dailyMessageCount: 0,
        lastMessageDate: new Date().toDateString(),
        currentStreak: 1,
        longestStreak: 1,
        healingMoments: 0,
        lastActiveDate: new Date().toISOString()
      };
    }
    return null;
  },

  // Login with Google OAuth
  loginWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      logger.error('Error en login con Google:', error.message);
      throw error;
    }
  },

  logout: async () => {
    if (ENABLE_GUEST_MODE && localStorage.getItem('guest_mode')) {
      localStorage.removeItem('guest_mode');
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem('sanarte_user_session'); // Legacy cleanup
    invalidateUserCache();
    dailySyncByUser.clear();
  },

  getUser: async (): Promise<UserProfile | null> => {
    if (ENABLE_GUEST_MODE && localStorage.getItem('guest_mode') === 'true') {
      return {
        id: 'guest-123',
        name: 'Invitado Sanador',
        email: 'invitado@sanarte.app',
        joinDate: new Date().toISOString(),
        isPremium: true,
        xp: 100,
        level: 5,
        badges: ['Despertar'],
        dailyMessageCount: 0,
        lastMessageDate: new Date().toDateString(),
        currentStreak: 1,
        longestStreak: 1,
        healingMoments: 5,
        lastActiveDate: new Date().toISOString(),
        role: 'user',
        avatar: undefined
      };
    }

    if (shouldUseCache()) {
      return cachedUser;
    }

    if (pendingUserRequest) {
      return pendingUserRequest;
    }

    pendingUserRequest = (async () => {
      try {
        const result = await safePromise(
          supabase.auth.getUser(),
          3000,
          { data: { user: null }, error: null } as any
        );

        const authUser = result && 'data' in result ? result.data.user : null;
        if (!authUser) {
          invalidateUserCache();
          return null;
        }

        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!profile) {
          await new Promise(r => setTimeout(r, 1000));
          const retry = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          profile = retry.data;
          error = retry.error;
        }

        if (error || !profile) {
          logger.error('Error fetching profile:', error);
          invalidateUserCache();
          return null;
        }

        const supaProfile = profile as ProfileRow;
        const alreadySyncedToday = dailySyncByUser.get(authUser.id) === todayKey();

        if (!alreadySyncedToday) {
          const now = new Date();
          const lastActive = supaProfile.last_active_at ? new Date(supaProfile.last_active_at) : new Date(0);
          const updates: ProfileUpdate = {};
          let needsUpdate = false;

          if (supaProfile.last_message_date !== todayKey()) {
            updates.daily_message_count = 0;
            updates.last_message_date = todayKey();
            needsUpdate = true;
          }

          if (now.toDateString() !== lastActive.toDateString()) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const wasYesterday = lastActive.toDateString() === yesterday.toDateString();

            if (wasYesterday) {
              const newStreak = (supaProfile.current_streak || 0) + 1;
              updates.current_streak = newStreak;
              updates.longest_streak = Math.max(newStreak, supaProfile.longest_streak || 0);
            } else if (now > lastActive) {
              updates.current_streak = 1;
            }

            updates.last_active_at = now.toISOString();
            needsUpdate = true;
          }

          const badges = [...(supaProfile.badges || [])];
          let badgesChanged = false;

          if (!badges.includes('Despertar')) {
            badges.push('Despertar');
            badgesChanged = true;
          }

          if (((updates.current_streak ?? supaProfile.current_streak) || 0) > 2 && !badges.includes('Constancia')) {
            badges.push('Constancia');
            badgesChanged = true;
          }

          if ((supaProfile.level || 1) >= 5 && !badges.includes('Sabiduría')) {
            badges.push('Sabiduría');
            badgesChanged = true;
          }

          if (badgesChanged) {
            updates.badges = badges;
            needsUpdate = true;
          }

          if (authUser.email && (supaProfile.email === 'usuario@sanarte.app' || supaProfile.email !== authUser.email)) {
            updates.email = authUser.email;
            if ((supaProfile.name === 'Usuario' || !supaProfile.name) && authUser.user_metadata?.name) {
              updates.name = authUser.user_metadata.name;
            }
            needsUpdate = true;
          }

          if (needsUpdate) {
            await supabase.from('profiles').update(updates).eq('id', authUser.id);
            Object.assign(supaProfile, updates);
          }

          dailySyncByUser.set(authUser.id, todayKey());
        }

        const mappedUser = mapProfileToUser(supaProfile);
        cachedUser = mappedUser;
        cachedUserAt = Date.now();
        return mappedUser;
      } catch (e) {
        logger.warn('GetUser timeout/error', e);
        invalidateUserCache();
        return null;
      } finally {
        pendingUserRequest = null;
      }
    })();

    return pendingUserRequest;
  },

  isAuthenticated: async (): Promise<boolean> => {
    if (ENABLE_GUEST_MODE && localStorage.getItem('guest_mode') === 'true') return true;
    try {
      const result = await safePromise(
        supabase.auth.getSession(),
        3000,
        { data: { session: null }, error: null }
      );
      return !!(result && result.data && result.data.session);
    } catch (e) {
      return false;
    }
  },

  loginAsGuest: async (): Promise<void> => {
    if (!ENABLE_GUEST_MODE) {
      throw new Error('Guest mode disabled outside local development.');
    }
    localStorage.setItem('guest_mode', 'true');
    window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount: 10, levelUp: false } }));
  },

  upgradeToPremium: async (): Promise<boolean> => {
    logger.warn('Client-side premium upgrades are disabled. Use secure payment webhook flow.');
    return false;
  },

  incrementMessageCount: async (): Promise<boolean> => {
    const user = await authService.getUser();
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

  addXP: async (amount: number): Promise<UserProfile | null> => {
    const currentProfile = await authService.getUser();
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
    cachedUser = mapped;
    cachedUserAt = Date.now();
    return mapped;
  },

  resendConfirmationEmail: async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return !error;
  },

  updateAvatar: async (file: File): Promise<string | null> => {
    const user = await authService.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      logger.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 3. Update Profile
    const update: ProfileUpdate = { avatar_url: publicUrl };
    const { error: updateError } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id);

    if (updateError) {
      logger.error('Error updating profile avatar:', updateError);
      return null;
    }

    invalidateUserCache();
    return publicUrl;
  },

  incrementHealingMoments: async (): Promise<void> => {
    const user = await authService.getUser();
    if (!user) return;

    const update: ProfileUpdate = { healing_moments: (user.healingMoments || 0) + 1 };
    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id);

    if (error) logger.error("Error incrementing healing moments:", error);
    else invalidateUserCache();
  }
} as const;
