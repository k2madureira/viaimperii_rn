import { useQuery } from '@tanstack/react-query';
import { getLegions } from '../../../../api/legions/legionsApi';

export function useLegions(enabled = true) {
  return useQuery({
    queryKey: ['legions'],
    queryFn: getLegions,
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
