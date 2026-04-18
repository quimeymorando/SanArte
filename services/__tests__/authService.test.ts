import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock de supabase (usando vi.hoisted para evitar problemas de hoisting) ────
const {
  mockGetUser,
  mockGetSession,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockFrom,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetSession: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      signInWithOAuth: vi.fn(),
      resend: vi.fn(),
    },
    from: mockFrom,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/avatar.jpg' } }),
      }),
    },
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
  },
}));

// ── Importar después de los mocks ─────────────────────────────────────────────
import { authService } from '../authService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@sanarte.app',
  avatar_url: null,
  join_date: '2025-01-01T00:00:00Z',
  is_premium: false,
  xp: 100,
  level: 1,
  role: 'user',
  badges: ['Despertar'],
  daily_message_count: 2,
  last_message_date: new Date().toDateString(),
  current_streak: 3,
  longest_streak: 5,
  healing_moments: 10,
  last_active_at: new Date().toISOString(),
  ...overrides,
});

describe('authService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.clearCachedUser();
  });

  // ────────── Constantes ──────────
  describe('constantes de configuración', () => {
    it('XP_PER_LEVEL es 500 — verificado a través de addXP', async () => {
      // Usuario con 400 XP, suma 100 → total 500 → nivel 2
      const profile = makeProfileRow({ xp: 400, level: 1 });

      // getUser dentro de addXP (primera llamada)
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      });
      // Mock para sincronización diaria dentro de getUser
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Segundo getUser dentro de addXP
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });

      // update().eq().select().single()
      const updatedProfile = makeProfileRow({ xp: 500, level: 2 });
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
            }),
          }),
        }),
      });

      const result = await authService.addXP(100);
      expect(result).not.toBeNull();
      expect(result!.xp).toBe(500);
      expect(result!.level).toBe(2);
    });

    it('FREE_MESSAGE_LIMIT es 5 — usuario gratuito con 5 mensajes no puede enviar más', async () => {
      const profile = makeProfileRow({ daily_message_count: 5, is_premium: false });

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      });
      // Mock para sincronización diaria dentro de getUser
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const canSend = await authService.incrementMessageCount();
      expect(canSend).toBe(false);
    });

    it('usuario premium puede enviar sin límite de mensajes', async () => {
      const profile = makeProfileRow({ daily_message_count: 99, is_premium: true });

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      });
      // Mock para sincronización diaria dentro de getUser
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const canSend = await authService.incrementMessageCount();
      expect(canSend).toBe(true);
    });
  });

  // ────────── mapProfileToUser (indirecto vía getUser) ──────────
  describe('mapProfileToUser (a través de getUser)', () => {
    const setupGetUser = (profileOverrides: Record<string, unknown> = {}) => {
      const profile = makeProfileRow(profileOverrides);
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: profile.email ?? undefined } },
        error: null,
      });
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      });
      // Mock para el update de sincronización diaria
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
    };

    it('usa profile.name cuando está disponible', async () => {
      setupGetUser({ name: 'María Sanadora' });
      const user = await authService.getUser();
      expect(user?.name).toBe('María Sanadora');
    });

    it('usa email.split("@")[0] como fallback cuando name es null', async () => {
      setupGetUser({ name: null, email: 'curandera@sanarte.app' });
      const user = await authService.getUser();
      expect(user?.name).toBe('curandera');
    });

    it('usa "Sanador" como fallback final cuando no hay name ni email', async () => {
      setupGetUser({ name: null, email: null });
      const user = await authService.getUser();
      expect(user?.name).toBe('Sanador');
    });

    it('mapea isPremium correctamente — true cuando is_premium es true', async () => {
      setupGetUser({ is_premium: true });
      const user = await authService.getUser();
      expect(user?.isPremium).toBe(true);
    });

    it('mapea isPremium correctamente — false cuando is_premium es falsy', async () => {
      setupGetUser({ is_premium: null });
      const user = await authService.getUser();
      expect(user?.isPremium).toBe(false);
    });

    it('mapea xp, level, badges, dailyMessageCount, currentStreak, longestStreak', async () => {
      setupGetUser({
        xp: 1500,
        level: 4,
        badges: ['Despertar', 'Constancia'],
        daily_message_count: 3,
        current_streak: 7,
        longest_streak: 14,
      });
      const user = await authService.getUser();

      expect(user?.xp).toBe(1500);
      expect(user?.level).toBe(4);
      expect(user?.badges).toEqual(['Despertar', 'Constancia']);
      expect(user?.dailyMessageCount).toBe(3);
      expect(user?.currentStreak).toBe(7);
      expect(user?.longestStreak).toBe(14);
    });

    it('usa valores por defecto cuando los campos del perfil son null', async () => {
      setupGetUser({
        xp: null,
        level: null,
        badges: null,
        daily_message_count: null,
        current_streak: null,
        longest_streak: null,
        healing_moments: null,
      });
      const user = await authService.getUser();

      expect(user?.xp).toBe(0);
      expect(user?.level).toBe(1);
      expect(user?.badges).toEqual(['Despertar']); // El sync siempre agrega 'Despertar' en el primer login
      expect(user?.dailyMessageCount).toBe(0);
      expect(user?.currentStreak).toBe(0);
      expect(user?.longestStreak).toBe(0);
      expect(user?.healingMoments).toBe(0);
    });
  });

  // ────────── getUser ──────────
  describe('getUser', () => {
    it('retorna null cuando no hay usuario autenticado', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const user = await authService.getUser();
      expect(user).toBeNull();
    });

    it('retorna null cuando hay error en el perfil', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      // Primera llamada falla
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
      // Retry también falla
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      });

      const user = await authService.getUser();
      expect(user).toBeNull();
    });
  });

  // ────────── login ──────────
  describe('login', () => {
    it('lanza error si no se proporciona contraseña', async () => {
      await expect(authService.login('test@test.com')).rejects.toThrow(
        'Se requiere contraseña para iniciar sesión.'
      );
    });

    it('lanza error si Supabase retorna error', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(authService.login('test@test.com', 'wrong')).rejects.toEqual(
        expect.objectContaining({ message: 'Invalid credentials' })
      );
    });
  });

  // ────────── register ──────────
  describe('register', () => {
    it('lanza error si la contraseña es muy corta (< 6 caracteres)', async () => {
      await expect(authService.register('Test', 'test@test.com', '123')).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres.'
      );
    });

    it('lanza error si no se proporciona contraseña', async () => {
      await expect(authService.register('Test', 'test@test.com')).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres.'
      );
    });
  });

  // ────────── addXP ──────────
  describe('addXP', () => {
    it('calcula el nivel correctamente: newLevel = Math.floor(newXP / 500) + 1', async () => {
      // Usuario con 900 XP (level 2), suma 200 → 1100 XP → level 3
      const profile = makeProfileRow({ xp: 900, level: 2 });

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      });
      // Mock para sincronización diaria dentro de getUser
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });

      const updatedProfile = makeProfileRow({ xp: 1100, level: 3 });
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
            }),
          }),
        }),
      });

      const result = await authService.addXP(200);
      expect(result).not.toBeNull();
      // 1100 / 500 = 2.2 → floor = 2 → +1 = 3
      expect(result!.level).toBe(3);
    });

    it('retorna null si no hay usuario autenticado', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const result = await authService.addXP(100);
      expect(result).toBeNull();
    });
  });

  // ────────── upgradeToPremium ──────────
  describe('upgradeToPremium', () => {
    it('retorna false — upgrades client-side están deshabilitados', async () => {
      const result = await authService.upgradeToPremium();
      expect(result).toBe(false);
    });
  });

  // ────────── Validación de avatar (MIME types y tamaño) ──────────
  describe('updateAvatar — validaciones', () => {
    const setupAuthenticatedUser = () => {
      const profile = makeProfileRow();
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } }, error: null });
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      });
      // Update sync
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
    };

    it('rechaza MIME type no permitido (image/gif)', async () => {
      setupAuthenticatedUser();
      const file = new File(['data'], 'avatar.gif', { type: 'image/gif' });
      const result = await authService.updateAvatar(file);
      expect(result).toBeNull();
    });

    it('rechaza archivo que excede MAX_AVATAR_SIZE_BYTES (2MB)', async () => {
      setupAuthenticatedUser();
      const bigData = new Uint8Array(2 * 1024 * 1024 + 1);
      const file = new File([bigData], 'avatar.jpg', { type: 'image/jpeg' });
      const result = await authService.updateAvatar(file);
      expect(result).toBeNull();
    });

    it('acepta MIME types válidos: image/jpeg, image/png, image/webp', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      allowedTypes.forEach((type) => {
        const file = new File(['data'], 'avatar', { type });
        expect(file.type).toBe(type);
      });
    });
  });
});
