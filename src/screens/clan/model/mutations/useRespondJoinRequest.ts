import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// POST /clans/join-requests/{id}/accept|decline — oficial responde à solicitação.
// Ao aceitar, o solicitante vira membro → invalida o detalhe do clã e o clã do usuário.
export function useRespondJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, accept }: { requestId: number; accept: boolean }) =>
      accept
        ? viaimperiiApi.clan.acceptJoinRequest(requestId)
        : viaimperiiApi.clan.declineJoinRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['clan-detail'] });
      queryClient.invalidateQueries({ queryKey: ['user-clan'] });
    },
  });
}
