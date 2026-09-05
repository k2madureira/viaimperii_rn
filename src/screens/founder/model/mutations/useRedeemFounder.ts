import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { ApiError } from '../../../../api/config/defaultApi';
import { FounderRedeemResponse } from '../../../../api/founder';

// Erro → toast por status (404 inexistente · 410 expirado · 409 já usado/coorte
// cheia/já é fundador · 403 e-mail da conta ≠ e-mail do código).
function errorKey(err: unknown): string {
  const status = err instanceof ApiError ? err.status : 0;
  if (status === 404) return 'toasts.founderCodeNotFound';
  if (status === 410) return 'toasts.founderCodeExpired';
  if (status === 409) return 'toasts.founderCodeUsed';
  if (status === 403) return 'toasts.founderEmailMismatch';
  return 'toasts.founderRedeemError';
}

/**
 * Resgate do código de fundador (§34, self). Sucesso: usuário vira Recruit IV,
 * `must_choose_track: true` e ganha o Baú do Fundador. onSuccess invalida perfil
 * (patente/founder) e baús; o chamador leva à escolha de trilha.
 */
export function useRedeemFounder(onSuccess?: (data: FounderRedeemResponse) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => viaimperiiApi.founder.redeem({ code }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['chests'] });
      onSuccess?.(data);
    },

    onError: (err) => {
      Toast.show({ type: 'error', text1: i18n.t(errorKey(err)) });
    },
  });
}
