import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

export const USER_QUERY_KEY = ['user'] as const;

export function useUser() {
  return useQuery<UserProfile | null>({
    queryKey: USER_QUERY_KEY,
    queryFn: () => authService.getUser(),
    staleTime: 1000 * 15, // Match profileService USER_CACHE_TTL_MS
    refetchOnWindowFocus: false,
  });
}

export function useInvalidateUser() {
  const queryClient = useQueryClient();
  return () => {
    authService.clearCachedUser();
    queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
  };
}
