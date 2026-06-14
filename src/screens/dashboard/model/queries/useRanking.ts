import { useQuery } from '@tanstack/react-query';
import { getRanking } from '../../../../api/ranking/rankingApi';

export function useRanking() {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: getRanking,
  });
}
