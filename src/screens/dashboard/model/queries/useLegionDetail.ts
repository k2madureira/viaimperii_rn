import { useQuery } from '@tanstack/react-query';
import { getLegion } from '../../../../api/legion/legionApi';

export function useLegionDetail(legionId: number | null | undefined) {
  return useQuery({
    queryKey: ['legion-detail', legionId],
    queryFn: () => getLegion(legionId as number),
    enabled: legionId != null,
    staleTime: 1000 * 60 * 10,
  });
}
