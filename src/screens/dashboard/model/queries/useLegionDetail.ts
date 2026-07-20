import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { Legion } from '../../../../api/legion';

export function useLegionDetail(legionId: number | null | undefined) {
  return useQuery<Legion>({
    queryKey: ['legion-detail', legionId],
    queryFn: () => viaimperiiApi.legion.detail(legionId as number),
    enabled: legionId != null,
    staleTime: 1000 * 60 * 10,
  });
}
