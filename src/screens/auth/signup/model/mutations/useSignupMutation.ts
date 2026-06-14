import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { createUserRequest, CreateUserPayload } from '../../../../../api/auth/authApi';

export function useSignupMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUserRequest(data),
    onSuccess: () => onSuccess(),
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar conta',
        text2: error.message ?? 'Ocorreu um erro. Tente novamente.',
      });
    },
  });
}
