import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useRanking() {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: viaimperiiApi.ranking.list,
  });
}
