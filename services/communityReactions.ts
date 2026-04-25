import { supabase } from '../supabaseClient';

export type ReactionType = 'love' | 'hug' | 'accompany' | 'reverence';

export const REACTION_TYPES: readonly ReactionType[] = [
  'love',
  'hug',
  'accompany',
  'reverence',
] as const;

export type ReactionCounts = {
  love: number;
  hug: number;
  accompany: number;
  reverence: number;
};

export type UserReactions = {
  love: boolean;
  hug: boolean;
  accompany: boolean;
  reverence: boolean;
};

export const emptyReactionCounts = (): ReactionCounts => ({
  love: 0,
  hug: 0,
  accompany: 0,
  reverence: 0,
});

export const emptyUserReactions = (): UserReactions => ({
  love: false,
  hug: false,
  accompany: false,
  reverence: false,
});

export async function toggleReaction(
  intentionId: string,
  type: ReactionType
): Promise<{ active: boolean; totalCount: number }> {
  const { data, error } = await supabase.rpc('toggle_intention_reaction', {
    p_intention_id: intentionId,
    p_type: type,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    active: !!row?.active,
    totalCount: Number(row?.total_count ?? 0),
  };
}
