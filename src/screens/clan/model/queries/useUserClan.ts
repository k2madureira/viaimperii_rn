import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// GET /users/{id}/clan — clã do usuário + sua divisão (clã nulo se não pertence).
export function useUserClan(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-clan', userId],
    queryFn: () => viaimperiiApi.clan.userClan(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
