import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { ApiError } from '../../../../api/config/defaultApi';
import { RedeemCodeResponse } from '../../../../api/codes';

// Erro → toast por status (404 inexistente · 410 expirado · 409 esgotado / já
// resgatado / coorte cheia / já é fundador · 403 e-mail da conta ≠ código).
function errorKey(err: unknown): string {
  const status = err instanceof ApiError ? err.status : 0;
  if (status === 404) return 'toasts.codeNotFound';
  if (status === 410) return 'toasts.codeExpired';
  if (status === 409) return 'toasts.codeExhausted';
  if (status === 403) return 'toasts.founderEmailMismatch';
  return 'toasts.codeRedeemError';
}

/**
 * Resgate unificado de código (§35 endpoint unificado). O backend detecta se é
 * de fundador (`kind:"founder"` → vira Recruit IV + Baú do Fundador) ou promo
 * (`kind:"promo"` → baú). onSuccess invalida os baús e, quando fundador, o perfil
 * (patente/founder). O baú concedido é aberto depois via useOpenChest.
 */
export function useRedeemCode(onSuccess?: (data: RedeemCodeResponse) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => viaimperiiApi.codes.redeem({ code }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chests'] });
      if (data.kind === 'founder') {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
      onSuccess?.(data);
    },

    onError: (err) => {
      Toast.show({ type: 'error', text1: i18n.t(errorKey(err)) });
    },
  });
}
