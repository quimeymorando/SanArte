import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock de supabase (usando vi.hoisted para evitar problemas de hoisting) ────
const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
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
import { getStoredRoutines } from '../routineService';
import { historyService } from '../dataService';

describe('getStoredRoutines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve array vacío si no hay usuario autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const routines = await getStoredRoutines();
    expect(routines).toEqual([]);
  });

  it('devuelve las rutinas del usuario autenticado', async () => {
    const mockRoutines = [
      { id: '1', text: 'Meditar', time: '08:00', completed: false, category: 'meditation' },
      { id: '2', text: 'Infusión', time: '09:00', completed: true, category: 'infusion' },
    ];

    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    });

    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRoutines, error: null }),
        }),
      }),
    });

    const routines = await getStoredRoutines();
    expect(routines).toEqual(mockRoutines);
    expect(routines).toHaveLength(2);
  });

  it('devuelve array vacío si no hay datos', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    });

    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const routines = await getStoredRoutines();
    expect(routines).toEqual([]);
  });
});

describe('historyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getHistory', () => {
    it('devuelve array vacío si no hay usuario autenticado', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const history = await historyService.getHistory();
      expect(history).toEqual([]);
    });

    it('devuelve el historial mapeado correctamente', async () => {
      const mockData = [
        {
          id: 'log-1',
          date: '2025-06-01',
          symptom_name: 'Dolor de cabeza',
          intensity: 7,
          duration: '2 horas',
          notes: 'Después de estrés laboral',
          created_at: '2025-06-01T10:00:00Z',
        },
      ];

      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      const history = await historyService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({
        id: 'log-1',
        date: '2025-06-01',
        symptom_name: 'Dolor de cabeza',
        intensity: 7,
        duration: '2 horas',
        notes: 'Después de estrés laboral',
      });
    });
  });

  describe('getFavorites', () => {
    it('devuelve array vacío si no hay usuario autenticado', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const favorites = await historyService.getFavorites();
      expect(favorites).toEqual([]);
    });

    it('devuelve favoritos y los guarda en localStorage cache', async () => {
      const mockFavorites = [
        { id: 'fav-1', user_id: 'user-123', symptom_name: 'Migraña', description: 'Frecuente' },
      ];

      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
          }),
        }),
      });

      const favorites = await historyService.getFavorites();
      expect(favorites).toEqual(mockFavorites);

      // Verificar que se guardó en localStorage
      const cached = localStorage.getItem('sanarte_favorites_cache');
      expect(cached).toBe(JSON.stringify(mockFavorites));
    });

    it('usa localStorage cache como fallback cuando hay error', async () => {
      const cachedFavorites = [
        { id: 'fav-cached', user_id: 'user-123', symptom_name: 'Cervical', description: 'Guardado' },
      ];
      localStorage.setItem('sanarte_favorites_cache', JSON.stringify(cachedFavorites));

      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } }),
          }),
        }),
      });

      const favorites = await historyService.getFavorites();
      expect(favorites).toEqual(cachedFavorites);
    });

    it('devuelve array vacío si hay error y no hay cache', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
      });

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } }),
          }),
        }),
      });

      const favorites = await historyService.getFavorites();
      expect(favorites).toEqual([]);
    });
  });
});
