
import { supabase } from '../supabaseClient';
import { SymptomLogEntry } from '../types';
import { logger } from '../utils/logger';
import {
    REACTION_TYPES,
    emptyReactionCounts,
    emptyUserReactions,
    type ReactionCounts,
    type ReactionType,
    type UserReactions,
} from './communityReactions';

type CommunityTheme = 'healing' | 'gratitude' | 'release' | 'feedback';

// --- COMUNIDAD (INTENCIONES) ---
export interface IntentionData {
    id: string;
    text: string;
    authorName: string;
    candles: number;
    loves: number;
    isUser: boolean;
    user_id?: string; // Exposed for client-side ownership checks
    theme: 'healing' | 'gratitude' | 'release' | 'feedback';
    timestamp: Date;
    comments?: any[];
    reactionCounts: ReactionCounts;
    userReactions: UserReactions;
}

export const communityService = {
    getIntentions: async (page = 0, pageSize = 20): Promise<IntentionData[]> => {
        const { data: { user } } = await supabase.auth.getUser();

        // Obtenemos intenciones y cargamos sus comentarios también
        const { data, error } = await supabase
            .from('intentions')
            .select('*, comments(*)')
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            logger.error(error);
            return [];
        }

        const intentionIds = data.map((item: any) => item.id);

        // Reacciones agregadas: 1 sola query por todos los intentions de la página
        const reactionsByIntention = new Map<string, { counts: ReactionCounts; user: UserReactions }>();
        intentionIds.forEach((id) => {
            reactionsByIntention.set(id, { counts: emptyReactionCounts(), user: emptyUserReactions() });
        });

        if (intentionIds.length > 0) {
            const { data: reactionRows, error: reactionsError } = await supabase
                .from('intention_reactions')
                .select('intention_id, type, user_id')
                .in('intention_id', intentionIds);

            if (reactionsError) {
                logger.warn('intention_reactions fetch failed:', reactionsError.message);
            } else if (reactionRows) {
                for (const r of reactionRows as any[]) {
                    const bucket = reactionsByIntention.get(r.intention_id);
                    if (!bucket) continue;
                    if ((REACTION_TYPES as readonly string[]).includes(r.type)) {
                        const t = r.type as ReactionType;
                        bucket.counts[t] += 1;
                        if (user && r.user_id === user.id) bucket.user[t] = true;
                    }
                }
            }
        }

        return data.map((item: any) => {
            const bucket = reactionsByIntention.get(item.id);
            return {
                id: item.id,
                text: item.text,
                authorName: item.author_name || 'Anónimo',
                candles: item.candles,
                loves: item.loves,
                isUser: user ? item.user_id === user.id : false,
                user_id: item.user_id, // Map the ID
                theme: item.theme,
                timestamp: new Date(item.created_at),
                comments: item.comments || [],
                reactionCounts: bucket?.counts ?? emptyReactionCounts(),
                userReactions: bucket?.user ?? emptyUserReactions(),
            };
        });
    },

    createIntention: async (text: string, theme: CommunityTheme, authorName: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Debes iniciar sesión');

        const { data, error } = await supabase
            .from('intentions')
            .insert({
                user_id: user.id,
                text,
                theme,
                author_name: authorName
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    lightCandle: async (id: string) => {
        // Atomic increment via RPC, fallback to read-then-write
        const { error } = await supabase.rpc('increment_field', { row_id: id, table_name: 'intentions', field_name: 'candles' });
        if (error) {
            const { data } = await supabase.from('intentions').select('candles').eq('id', id).single();
            if (data) {
                await supabase.from('intentions').update({ candles: data.candles + 1 }).eq('id', id);
            }
        }
    },

    sendLove: async (id: string) => {
        const { error } = await supabase.rpc('increment_field', { row_id: id, table_name: 'intentions', field_name: 'loves' });
        if (error) {
            const { data } = await supabase.from('intentions').select('loves').eq('id', id).single();
            if (data) {
                await supabase.from('intentions').update({ loves: data.loves + 1 }).eq('id', id);
            }
        }
    },

    addComment: async (intentionId: string, text: string, authorName: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Debes iniciar sesión');

        const { data, error } = await supabase
            .from('comments')
            .insert({
                intention_id: intentionId,
                user_id: user.id,
                text,
                author_name: authorName
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteComment: async (commentId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Debes iniciar sesión');

        // Check if user is comment owner OR intention owner
        // 1. Get comment info including intention_id
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('user_id, intention_id')
            .eq('id', commentId)
            .single();

        if (fetchError || !comment) throw new Error('Comentario no encontrado');

        // Check if admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            return;
        }

        // 2. If user is comment owner, simple delete
        if (comment.user_id === user.id) {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            return;
        }

        // 3. If not, check if user is intention owner
        const { data: intention } = await supabase
            .from('intentions')
            .select('user_id')
            .eq('id', comment.intention_id)
            .single();

        if (intention && intention.user_id === user.id) {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            return;
        }

        throw new Error('No tienes permiso para eliminar este comentario');
    },

    deleteIntention: async (intentionId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Debes iniciar sesión');

        // Check if admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

        let query = supabase.from('intentions').delete().eq('id', intentionId);

        // If NOT admin, enforce ownership
        if (profile?.role !== 'admin') {
            query = query.eq('user_id', user.id);
        }

        const { error } = await query;
        if (error) throw error;
    }
};

// --- HISTORIAL Y FAVORITOS ---

export const historyService = {
    saveSymptomLog: async (log: Omit<SymptomLogEntry, 'id'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No autenticado');

        const { error } = await supabase
            .from('symptom_logs')
            .insert({ ...log, user_id: user.id });

        if (error) throw error;
    },

    getHistory: async (page = 0, pageSize = 20): Promise<SymptomLogEntry[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        // Mapeo simple si las columnas difieren ligeramente o retorno directo
        return data.map((d: any) => ({
            id: d.id,
            date: d.date,
            symptom_name: d.symptom_name,
            intensity: d.intensity,
            duration: d.duration,
            notes: d.notes
        }));
    },

    deleteLog: async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No autenticado');

        const { error } = await supabase
            .from('symptom_logs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) throw error;
    },

    toggleFavorite: async (symptomName: string, description: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Verificar si ya existe
        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('symptom_name', symptomName)
            .maybeSingle();

        if (existing) {
            await supabase.from('favorites').delete().eq('id', existing.id);
        } else {
            await supabase.from('favorites').insert({
                user_id: user.id,
                symptom_name: symptomName,
                description
            });
        }
    },

    getFavorites: async (): Promise<import('../types').Favorite[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Cache successful response
            if (data) {
                localStorage.setItem('sanarte_favorites_cache', JSON.stringify(data));
            }
            return (data as import('../types').Favorite[]) || [];
        } catch (error) {
            const cached = localStorage.getItem('sanarte_favorites_cache');
            if (cached) {
                return JSON.parse(cached);
            }
            return []; // No cache and error
        }
    },
    deleteFavoriteById: async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No autenticado');

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) throw error;
    }
};
