import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { updatePasswordRequest } from '../../../../api/auth/authApi';
import { useAuth } from '../../../../contexts/AuthContext';

export function useUpdatePasswordMutation(onSuccess: () => void) {
  const { markPasswordUpdated } = useAuth();

  return useMutation({
    mutationFn: ({ current_password, new_password }: { current_password: string; new_password: string }) =>
      updatePasswordRequest(current_password, new_password),
    onSuccess: async () => {
      await markPasswordUpdated();
      Toast.show({ type: 'success', text1: 'Senha atualizada com sucesso!' });
      onSuccess();
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar senha',
        text2: error.message ?? 'Ocorreu um erro. Tente novamente.',
      });
    },
  });
}
