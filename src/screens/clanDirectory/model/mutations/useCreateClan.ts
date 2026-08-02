import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { CreateClanInput } from '../../../../api/clan';

// POST /clans — funda um clã (rank ≥ 20, taxa de fundação, 1 clã por usuário).
// Invalida o clã do usuário e o diretório para refletir a nova fundação.
export function useCreateClan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClanInput) => viaimperiiApi.clan.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-clan'] });
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}
