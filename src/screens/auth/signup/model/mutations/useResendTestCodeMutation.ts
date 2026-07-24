import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { viaimperiiApi } from '../../../../../api';

export function useResendTestCodeMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (email: string) => viaimperiiApi.quiz.resendCode(email),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: i18n.t('auth.signup.resendCodeSent'),
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.error'),
        text2: error.message,
      });
    },
  });
}
