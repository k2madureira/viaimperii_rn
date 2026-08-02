import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// DELETE /clans/join-requests/{id} — cancela a minha própria solicitação pendente.
export function useCancelJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => viaimperiiApi.clan.cancelJoinRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
    },
  });
}
