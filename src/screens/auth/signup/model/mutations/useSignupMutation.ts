import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { createUserRequest, CreateUserPayload } from '../../../../../api/auth/authApi';

export function useSignupMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUserRequest(data),
    onSuccess: () => onSuccess(),
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.signupError'),
        text2: error.message ?? i18n.t('common.genericError'),
      });
    },
  });
}
