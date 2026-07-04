import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { loginRequest } from '../../../../../api/auth/authApi';
import { useAuth } from '../../../../../contexts/AuthContext';

export function useLoginMutation(onIncompleteSignup?: (email: string) => void) {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      await signIn(data.access_token, data.refresh_token, {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        is_admin: data.is_admin,
        is_temporary_password: data.is_temporary_password,
        rank: data.rank,
        total_xp: data.total_xp,
        main_specialty: data.main_specialty,
        mastery: data.mastery,
        legion_id: data.legion_id,
        province_id: data.province_id,
        streak: data.streak ?? null,
      });
    },
    onError: (error: Error, variables) => {
      if (error.message.startsWith('Cadastro incompleto')) {
        onIncompleteSignup?.(variables.email);
        return;
      }
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.loginError'),
        text2: error.message ?? i18n.t('common.genericError'),
      });
    },
  });
}
