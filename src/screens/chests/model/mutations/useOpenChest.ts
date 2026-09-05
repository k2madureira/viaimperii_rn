import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { ApiError } from '../../../../api/config/defaultApi';
import { OpenChestResponse } from '../../../../api/chests';

interface Vars {
  userChestId: number;
  // { "<slot_key>": "<reward_ref>", ... } (v1: 1 escolha por slot)
  selections: Record<string, string>;
}

// Erro → toast localizado por status (409 já aberto · 422 escolha inválida).
function errorKey(err: unknown): string {
  const status = err instanceof ApiError ? err.status : 0;
  if (status === 409) return 'toasts.chestAlreadyOpened';
  if (status === 422) return 'toasts.chestInvalidChoice';
  return 'toasts.chestOpenError';
}

/**
 * Abre o baú com as escolhas do usuário (§35). Efeito no backend: avatar →
 * user_assets (posse); missão → ativa a profissão grátis. onSuccess invalida os
 * baús, o detalhe, o catálogo de avatares, as profissões e o perfil (avatar/posse).
 */
export function useOpenChest(onSuccess?: (data: OpenChestResponse) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userChestId, selections }: Vars) =>
      viaimperiiApi.chests.open(userChestId, { selections }),

    onSuccess: (data, { userChestId }) => {
      queryClient.invalidateQueries({ queryKey: ['chests'] });
      queryClient.invalidateQueries({ queryKey: ['chest', userChestId] });
      queryClient.invalidateQueries({ queryKey: ['asset-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['professions'] });
      queryClient.invalidateQueries({ queryKey: ['user-professions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      onSuccess?.(data);
    },

    onError: (err) => {
      Toast.show({ type: 'error', text1: i18n.t(errorKey(err)) });
    },
  });
}
