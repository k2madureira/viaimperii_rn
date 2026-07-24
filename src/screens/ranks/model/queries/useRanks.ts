import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useRanks(trackId: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['ranks', trackId ?? null],
    queryFn: () => viaimperiiApi.ranks.list(trackId),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
