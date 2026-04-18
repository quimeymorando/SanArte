import { supabase } from '../../supabaseClient';
import { logger } from '../../utils/logger';
import { UserProfile } from '../../types';

const MIN_PASSWORD_LENGTH = 6;
const ENABLE_GUEST_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_GUEST_MODE === 'true';

// These are injected at runtime by index.ts to avoid circular deps
let _getUser: () => Promise<UserProfile | null>;
let _invalidateUserCache: () => void;
let _clearDailySync: () => void;

export const injectAuthCoreDeps = (deps: {
  getUser: () => Promise<UserProfile | null>;
  invalidateUserCache: () => void;
  clearDailySync: () => void;
}) => {
  _getUser = deps.getUser;
  _invalidateUserCache = deps.invalidateUserCache;
  _clearDailySync = deps.clearDailySync;
};

export const authCore = {
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
      _invalidateUserCache();
      return await _getUser();
    }
    return null;
  },

  register: async (name: string, email: string, password?: string): Promise<UserProfile | null> => {
    if (!password || password.trim().length < MIN_PASSWORD_LENGTH) {
      throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

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
      if (error.message.includes("already registered") || error.status === 422 || error.status === 400) {
        return authCore.login(email, password);
      }
      throw error;
    }

    if (data.user) {
      if (!data.session) {
        throw new Error("Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta antes de ingresar.");
      }

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
    localStorage.removeItem('sanarte_user_session');
    _invalidateUserCache();
    _clearDailySync();
  },

  isAuthenticated: async (): Promise<boolean> => {
    if (ENABLE_GUEST_MODE && localStorage.getItem('guest_mode') === 'true') return true;
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise<{ data: { session: null }; error: null }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: null }), 3000)
        )
      ]);
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

  resendConfirmationEmail: async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return !error;
  },

  upgradeToPremium: async (): Promise<boolean> => {
    logger.warn('Client-side premium upgrades are disabled. Use secure payment webhook flow.');
    return false;
  },
};
