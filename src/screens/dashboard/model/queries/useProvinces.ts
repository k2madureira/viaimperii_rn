import { useQuery } from '@tanstack/react-query';
import { getProvinces } from '../../../../api/provinces/provincesApi';

export function useProvinces(search: string, enabled = true) {
  return useQuery({
    queryKey: ['provinces', search],
    queryFn: () => getProvinces(search || undefined),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
