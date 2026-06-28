import { useQuery } from '@tanstack/react-query';
import { getLegion, LegionDetail } from '../../../../api/legion/legionApi';

export function useLegionDetail(legionId: number | null | undefined) {
  return useQuery<LegionDetail>({
    queryKey: ['legion-detail', legionId],
    queryFn: () => getLegion(legionId as number),
    enabled: legionId != null,
    staleTime: 1000 * 60 * 10,
  });
}
