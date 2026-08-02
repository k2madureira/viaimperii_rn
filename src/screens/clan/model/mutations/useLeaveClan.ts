import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// POST /clans/{id}/leave — sair do clã. Invalida o clã do usuário e o detalhe.
export function useLeaveClan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clanId: number) => viaimperiiApi.clan.leave(clanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-clan'] });
      queryClient.invalidateQueries({ queryKey: ['clan-detail'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
