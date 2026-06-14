import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { forgotPasswordRequest } from '../../../../../api/auth/authApi';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Email enviado!',
        text2: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar email',
        text2: error.message ?? 'Ocorreu um erro. Tente novamente.',
      });
    },
  });
}
