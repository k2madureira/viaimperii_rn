import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: viaimperiiApi.ranks.tracks,
    staleTime: 1000 * 60 * 10,
  });
}
