import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { verifyTokenRequest, VerifyTokenResponse } from '../../../../../api/auth/authApi';

export function useVerifyTokenMutation(
  onSuccess: (result: VerifyTokenResponse) => void,
) {
  return useMutation({
    mutationFn: ({ email, test_code }: { email: string; test_code: string }) =>
      verifyTokenRequest(email, test_code),
    onSuccess,
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.verifyFailedTitle'),
        text2: error.message ?? i18n.t('toasts.verifyFailedBody'),
      });
    },
  });
}
