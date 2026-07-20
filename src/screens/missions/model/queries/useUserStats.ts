import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { StatsPeriod } from '../../../../api/users';

export function useUserStats(userId: string | undefined, period: StatsPeriod) {
  return useQuery({
    queryKey: ['user-stats', userId, period],
    queryFn: () => viaimperiiApi.users.stats(userId as string, period),
    enabled: !!userId,
  });
}
