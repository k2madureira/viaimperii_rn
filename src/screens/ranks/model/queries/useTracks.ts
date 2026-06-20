import { useQuery } from '@tanstack/react-query';
import { getTracks } from '../../../../api/ranks/ranksApi';

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: getTracks,
    staleTime: 1000 * 60 * 10,
  });
}
