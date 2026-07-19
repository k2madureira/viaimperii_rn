import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useLegions(enabled = true) {
  return useQuery({
    queryKey: ['legions'],
    queryFn: viaimperiiApi.legion.list,
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
