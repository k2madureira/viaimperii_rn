import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// GET /clans/{id}/join-requests — fila de solicitações do clã (capitão+). Habilitada
// só quando o viewer é oficial (rank_level ≥ 2), evitando 403.
export function useClanJoinRequests(clanId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['clan-join-requests', clanId],
    queryFn: () => viaimperiiApi.clan.clanJoinRequests(clanId as number),
    enabled: !!clanId && enabled,
    staleTime: 1000 * 30,
  });
}
