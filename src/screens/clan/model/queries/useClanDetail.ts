import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// GET /clans/{id} — detalhe do clã (membros por divisão, info de upgrade).
export function useClanDetail(clanId: number | undefined) {
  return useQuery({
    queryKey: ['clan-detail', clanId],
    queryFn: () => viaimperiiApi.clan.detail(clanId as number),
    enabled: !!clanId,
  });
}
