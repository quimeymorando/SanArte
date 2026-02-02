
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

const XP_PER_LEVEL = 500;
const FREE_MESSAGE_LIMIT = 5;

// Interface matching the Supabase 'profiles' table structure
interface SupaProfile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  join_date?: string;
  is_premium?: boolean;
  xp?: number;
  level?: number;
  role?: 'user' | 'admin';
  badges?: string[];
  daily_message_count?: number;
  last_message_date?: string;
  current_streak?: number;
  longest_streak?: number;
  healing_moments?: number;
  last_active_at?: string;
}

// Helper to transform raw DB data to TypeScript UserProfile
const mapProfileToUser = (profile: SupaProfile): UserProfile => ({
  id: profile.id,
  name: profile.name || profile.email?.split('@')[0] || 'Sanador',
  email: profile.email || '',
  avatar: profile.avatar_url,
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

export const authService = {
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
      console.error('Error en login:', error.message);
      throw error;
    }

    if (data.user) {
      return await authService.getUser();
    }
    return null;
  },

  // Register: Creates Auth user, Trigger creates Profile
  register: async (name: string, email: string, password?: string): Promise<UserProfile | null> => {
    if (!password) {
      password = "temp-password-123";
      console.warn("Usando contraseña temporal. Actualiza tu UI para pedir contraseña.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Used by Trigger to populate profiles table
        emailRedirectTo: window.location.origin
      }
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

  logout: async () => {
    if (localStorage.getItem('guest_mode')) {
      localStorage.removeItem('guest_mode');
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem('sanarte_user_session'); // Legacy cleanup
  },

  getUser: async (): Promise<UserProfile | null> => {
    // GUEST BYPASS FOR DEV/TESTING
    if (localStorage.getItem('guest_mode') === 'true') {
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

    try {
      const result = await safePromise(
        supabase.auth.getUser(),
        3000,
        { data: { user: null }, error: null }
      );

      const user = result && 'data' in result ? result.data.user : null;
      if (!user) return null;

      // Fetch extended profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // RETRY LOGIC: Race condition with trigger
      if (!profile) {
        await new Promise(r => setTimeout(r, 1000));
        const retry = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profile = retry.data;
        error = retry.error;
      }

      if (error || !profile) {
        console.error("Error fetching profile:", error);
        return null;
      }

      const supaProfile = profile as SupaProfile;

      // --- UPDATE LOGIC ---
      const today = new Date();
      const lastActive = supaProfile.last_active_at ? new Date(supaProfile.last_active_at) : new Date(0);
      const lastMessageDateStr = supaProfile.last_message_date;
      const todayDateStr = today.toDateString();

      let needsUpdate = false;
      const updates: Partial<SupaProfile> = {};

      // 1. Daily message reset
      if (lastMessageDateStr !== todayDateStr) {
        updates.daily_message_count = 0;
        updates.last_message_date = todayDateStr;
        needsUpdate = true;
      }

      // 2. Streak Calculation
      if (today.getDate() !== lastActive.getDate() || today.getMonth() !== lastActive.getMonth() || today.getFullYear() !== lastActive.getFullYear()) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const wasYesterday = lastActive.getDate() === yesterday.getDate() &&
          lastActive.getMonth() === yesterday.getMonth() &&
          lastActive.getFullYear() === yesterday.getFullYear();

        if (wasYesterday) {
          const newStreak = (supaProfile.current_streak || 0) + 1;
          updates.current_streak = newStreak;
          updates.longest_streak = Math.max(newStreak, supaProfile.longest_streak || 0);
        } else if (today > lastActive) {
          updates.current_streak = 1;
        }

        updates.last_active_at = today.toISOString();
        needsUpdate = true;
      }

      // 3. Badges Unlocking
      const newBadges = [...(supaProfile.badges || [])];
      let badgesChanged = false;

      if (!newBadges.includes("Despertar")) {
        newBadges.push("Despertar");
        badgesChanged = true;
      }

      if (((updates.current_streak !== undefined ? updates.current_streak : supaProfile.current_streak) || 0) > 2 && !newBadges.includes("Constancia")) {
        newBadges.push("Constancia");
        badgesChanged = true;
      }

      if ((supaProfile.level || 1) >= 5 && !newBadges.includes("Sabiduría")) {
        newBadges.push("Sabiduría");
        badgesChanged = true;
      }

      if (badgesChanged) {
        updates.badges = newBadges;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await supabase.from('profiles').update(updates).eq('id', user.id);
        // Update local object
        Object.assign(supaProfile, updates);
      }

      // SELF-HEAL: Update profile if it has placeholder data or mismatch
      if (supaProfile && user.email && (supaProfile.email === 'usuario@sanarte.app' || supaProfile.email !== user.email)) {
        const syncUpdates: { email: string; name?: string } = { email: user.email };
        if ((supaProfile.name === 'Usuario' || !supaProfile.name) && user.user_metadata?.name) {
          syncUpdates.name = user.user_metadata.name;
        }
        await supabase.from('profiles').update(syncUpdates).eq('id', user.id);
        supaProfile.email = syncUpdates.email;
        if (syncUpdates.name) supaProfile.name = syncUpdates.name;
      }

      return mapProfileToUser(supaProfile);

    } catch (e) {
      console.warn("GetUser timeout/error", e);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    if (localStorage.getItem('guest_mode') === 'true') return true;
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
    localStorage.setItem('guest_mode', 'true');
    window.dispatchEvent(new CustomEvent('xp-gained', { detail: { amount: 10, levelUp: false } }));
  },

  upgradeToPremium: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', user.id);

    return !error;
  },

  incrementMessageCount: async (): Promise<boolean> => {
    const user = await authService.getUser();
    if (!user) return false;

    if (user.isPremium) return true;
    if (user.dailyMessageCount >= FREE_MESSAGE_LIMIT) return false;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ daily_message_count: user.dailyMessageCount + 1 })
      .eq('id', session.user.id);

    return !error;
  },

  addXP: async (amount: number): Promise<UserProfile | null> => {
    const currentProfile = await authService.getUser();
    if (!currentProfile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const newXp = currentProfile.xp + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    const updates: { xp: number; level?: number } = { xp: newXp };
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

    return mapProfileToUser(updatedProfile as SupaProfile);
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
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 3. Update Profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile avatar:', updateError);
      return null;
    }

    return publicUrl;
  },

  incrementHealingMoments: async (): Promise<void> => {
    const user = await authService.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ healing_moments: (user.healingMoments || 0) + 1 })
      .eq('id', user.id);

    if (error) console.error("Error incrementing healing moments:", error);
  }
} as const;
