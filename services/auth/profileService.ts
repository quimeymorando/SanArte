import { supabase } from '../../supabaseClient';
import { logger } from '../../utils/logger';
import { UserProfile } from '../../types';
import { Database } from '../../types_db';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);
const ENABLE_GUEST_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_GUEST_MODE === 'true';

export const mapProfileToUser = (profile: ProfileRow): UserProfile => ({
  id: profile.id,
  name: profile.name || profile.email?.split('@')[0] || 'Sanador',
  email: profile.email || '',
  avatar: profile.avatar_url || undefined,
  joinDate: profile.join_date || new Date().toISOString(),
  isPremium: !!profile.is_premium,
  premiumGraceUntil: (profile as any).premium_grace_until || undefined,
  trialEndsAt: (profile as any).trial_ends_at || undefined,
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

const todayKey = (): string => new Date().toDateString();

const USER_CACHE_TTL_MS = 15000;
let cachedUser: UserProfile | null = null;
let cachedUserAt = 0;
let pendingUserRequest: Promise<UserProfile | null> | null = null;
export const dailySyncByUser = new Map<string, string>();

export const invalidateUserCache = (): void => {
  cachedUser = null;
  cachedUserAt = 0;
};

const shouldUseCache = (): boolean => {
  return !!cachedUser && Date.now() - cachedUserAt < USER_CACHE_TTL_MS;
};

export const setCachedUser = (user: UserProfile): void => {
  cachedUser = user;
  cachedUserAt = Date.now();
};

export const profileOps = {
  clearCachedUser: (): void => {
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

  updateAvatar: async (file: File): Promise<string | null> => {
    const user = await profileOps.getUser();
    if (!user) return null;

    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
      logger.warn('Formato de avatar no permitido', file.type);
      return null;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      logger.warn('Avatar excede tamaño máximo permitido');
      return null;
    }

    const sanitizeImage = (src: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context unavailable'));
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Blob conversion failed')),
            src.type,
            0.9
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(src);
      });
    };

    let cleanFile: Blob;
    try {
      cleanFile = await sanitizeImage(file);
    } catch {
      logger.error('Error sanitizing avatar EXIF data');
      return null;
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };

    const fileExt = mimeToExt[file.type] || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, cleanFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      logger.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

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
};
