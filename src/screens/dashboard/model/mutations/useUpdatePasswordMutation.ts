import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { updatePasswordRequest } from '../../../../api/auth/authApi';
import { useAuth } from '../../../../contexts/AuthContext';

export function useUpdatePasswordMutation(onSuccess: () => void) {
  const { markPasswordUpdated } = useAuth();

  return useMutation({
    mutationFn: ({ current_password, new_password }: { current_password: string; new_password: string }) =>
      updatePasswordRequest(current_password, new_password),
    onSuccess: async () => {
      await markPasswordUpdated();
      Toast.show({ type: 'success', text1: i18n.t('toasts.passwordUpdated') });
      onSuccess();
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.passwordUpdateError'),
        text2: error.message ?? i18n.t('common.genericError'),
      });
    },
  });
}
