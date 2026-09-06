import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { viaimperiiApi } from '../../../../../api';
import { ApiError } from '../../../../../api/config/defaultApi';
import { FounderPreRegisterRequest, FounderPreRegisterResponse } from '../../../../../api/founder';

// Erro → toast por status (409 e-mail já usado/waitlist · 403 inscrição fechada).
function errorKey(err: unknown): string {
  const status = err instanceof ApiError ? err.status : 0;
  if (status === 409) return 'toasts.founderEmailExists';
  if (status === 403) return 'toasts.founderEnrollmentClosed';
  return 'toasts.founderPreRegisterError';
}

// Pré-inscrição pública (§34). onSuccess re-checa a disponibilidade (vaga a menos).
export function usePreRegisterFounder(onSuccess?: (data: FounderPreRegisterResponse) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FounderPreRegisterRequest) => viaimperiiApi.founder.preRegister(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['founder-availability'] });
      onSuccess?.(data);
    },

    onError: (err) => {
      Toast.show({ type: 'error', text1: i18n.t(errorKey(err)) });
    },
  });
}
