import { useQuery } from '@tanstack/react-query';
import { getRanks } from '../../../../api/ranks/ranksApi';

export function useRanks(trackId: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['ranks', trackId ?? null],
    queryFn: () => getRanks(trackId),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
