import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Sobe o WEBP local do emblema (presign público, purpose=clan) e grava a key no clã
// via POST /clans/{id}/emblem. Só o marechal pode. Invalida clã/perfil.
export function useSetClanEmblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clanId, uri }: { clanId: number; uri: string }) => {
      const key = await viaimperiiApi.upload.media(uri, 'image/webp', 'clan');
      return viaimperiiApi.clan.setEmblem(clanId, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-detail'] });
      queryClient.invalidateQueries({ queryKey: ['user-clan'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
