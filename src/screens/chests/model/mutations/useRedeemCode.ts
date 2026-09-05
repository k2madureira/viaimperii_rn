import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { ApiError } from '../../../../api/config/defaultApi';
import { RedeemCodeResponse } from '../../../../api/codes';

// Erro → toast localizado por status (404 inexistente · 410 expirado · 409 esgotado/já resgatado).
function errorKey(err: unknown): string {
  const status = err instanceof ApiError ? err.status : 0;
  if (status === 404) return 'toasts.codeNotFound';
  if (status === 410) return 'toasts.codeExpired';
  if (status === 409) return 'toasts.codeExhausted';
  return 'toasts.codeRedeemError';
}

/**
 * Resgata um código promocional (§35) → concede um baú fechado. onSuccess invalida
 * a lista de baús; o baú resultante é aberto depois via useOpenChest.
 */
export function useRedeemCode(onSuccess?: (data: RedeemCodeResponse) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => viaimperiiApi.codes.redeem({ code }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chests'] });
      onSuccess?.(data);
    },

    onError: (err) => {
      Toast.show({ type: 'error', text1: i18n.t(errorKey(err)) });
    },
  });
}
