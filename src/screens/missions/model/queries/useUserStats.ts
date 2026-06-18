import { useQuery } from '@tanstack/react-query';
import { getUserStats, StatsPeriod } from '../../../../api/users/userApi';

export function useUserStats(userId: string | undefined, period: StatsPeriod) {
  return useQuery({
    queryKey: ['user-stats', userId, period],
    queryFn: () => getUserStats(userId as string, period),
    enabled: !!userId,
  });
}
