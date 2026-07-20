import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { viaimperiiApi } from '../../../../../api';

interface Vars {
  token: string;
  newPassword: string;
}

export function useResetPasswordMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ token, newPassword }: Vars) => viaimperiiApi.auth.resetPassword(token, newPassword),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: i18n.t('toasts.resetPasswordSuccessTitle'),
        text2: i18n.t('toasts.resetPasswordSuccessBody'),
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.resetPasswordError'),
        text2: error.message ?? i18n.t('common.genericError'),
      });
    },
  });
}
