import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useProvinces(search: string, enabled = true) {
  return useQuery({
    queryKey: ['provinces', search],
    queryFn: () => viaimperiiApi.provinces.list(search || undefined),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
