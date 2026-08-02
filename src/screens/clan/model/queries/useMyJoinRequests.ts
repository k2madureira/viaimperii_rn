import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// GET /clans/join-requests/mine — minhas solicitações pendentes. Usada no detalhe
// de um clã para saber se já solicitei ingresso (estado "pendente" + cancelar).
export function useMyJoinRequests(enabled = true) {
  return useQuery({
    queryKey: ['my-join-requests'],
    queryFn: viaimperiiApi.clan.myJoinRequests,
    enabled,
    staleTime: 1000 * 30,
  });
}
