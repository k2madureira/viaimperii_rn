import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { SendMissionTributeInput, TributeApiError, TributeResult } from '../../../../api/tributes';

/**
 * Envia um tributo ao executor de uma missão concluída (fila de revisão).
 *
 * Diferente do tributo de feed, aqui não há resumo agregado por alvo para
 * atualizar no cache — a fila é recarregada e o saldo, invalidado. Erros de
 * campo (422/429) ficam inline no modal; 409 (missão ainda não concluída) vira
 * Toast, porque nesse caso o item da fila é que está defasado.
 */
export function useSendMissionTribute() {
  const queryClient = useQueryClient();

  return useMutation<TributeResult, Error, SendMissionTributeInput>({
    mutationFn: (input) => viaimperiiApi.tributes.mission(input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
    },

    onError: (error: Error) => {
      const status = error instanceof TributeApiError ? error.status : 0;
      if (status === 422 || status === 429) return;
      const key =
        status === 409
          ? 'tributes.errors.notCompleted'
          : status === 400
            ? 'tributes.errors.self'
            : 'tributes.errors.generic';
      Toast.show({
        type: 'error',
        text1: i18n.t(key),
        text2: status === 409 || status === 400 ? undefined : error.message,
      });
    },
  });
}
