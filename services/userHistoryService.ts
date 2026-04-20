import { supabase } from '../supabaseClient';
import { logger } from '../utils/logger';

export interface HistoryItem {
    id: string;
    symptom_name: string;
    searched_at: string;
    slug?: string;
}

export interface FavoriteItem {
    id: string;
    symptom_name: string;
    saved_at: string;
    slug?: string;
}

const deriveSlug = (name: string): string =>
    name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const dedupeByName = <T extends { symptom_name: string }>(rows: T[]): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const row of rows) {
        const key = (row.symptom_name || '').trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(row);
    }
    return out;
};

export const userHistoryService = {
    async getRecentHistory(limit = 5): Promise<HistoryItem[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return [];

        const { data, error } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(limit * 3);

        if (error) {
            logger.warn('History fetch error:', error.message);
            return [];
        }

        const mapped = (data || [])
            .map((row: any): HistoryItem | null => {
                const rawName = row.symptom_name || row.query || row.slug || '';
                if (!rawName || typeof rawName !== 'string') return null;
                if (rawName.toLowerCase().startsWith('consulta:')) {
                    const stripped = rawName.slice(rawName.indexOf(':') + 1).trim();
                    return {
                        id: row.id,
                        symptom_name: stripped || rawName,
                        searched_at: row.created_at || row.date,
                        slug: row.slug || deriveSlug(stripped || rawName),
                    };
                }
                return {
                    id: row.id,
                    symptom_name: rawName,
                    searched_at: row.created_at || row.date,
                    slug: row.slug || deriveSlug(rawName),
                };
            })
            .filter((x): x is HistoryItem => x !== null);

        return dedupeByName(mapped).slice(0, limit);
    },

    async getFavorites(limit = 5): Promise<FavoriteItem[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return [];

        const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            logger.warn('Favorites fetch error:', error.message);
            return [];
        }

        return (data || [])
            .map((row: any): FavoriteItem | null => {
                const rawName = row.symptom_name || row.name || '';
                if (!rawName || typeof rawName !== 'string') return null;
                return {
                    id: row.id,
                    symptom_name: rawName,
                    saved_at: row.created_at,
                    slug: row.slug || deriveSlug(rawName),
                };
            })
            .filter((x): x is FavoriteItem => x !== null);
    },
};
