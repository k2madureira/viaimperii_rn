import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// POST /clans/{id}/join-requests — solicita ingresso. Invalida minhas solicitações
// para refletir o estado "pendente" no detalhe do clã.
export function useRequestJoin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clanId: number) => viaimperiiApi.clan.requestJoin(clanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
    },
  });
}
