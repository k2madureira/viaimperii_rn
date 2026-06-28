import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { forgotPasswordRequest } from '../../../../../api/auth/authApi';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: i18n.t('toasts.forgotEmailSentTitle'),
        text2: i18n.t('toasts.forgotEmailSentBody'),
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.forgotEmailError'),
        text2: error.message ?? i18n.t('common.genericError'),
      });
    },
  });
}
