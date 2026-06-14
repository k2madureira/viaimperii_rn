import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { loginRequest } from '../../../../../api/auth/authApi';

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Login realizado com sucesso!',
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao fazer login',
        text2: error.message ?? 'Ocorreu um erro. Tente novamente.',
      });
    },
  });
}
