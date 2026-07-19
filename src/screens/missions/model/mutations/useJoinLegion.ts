import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

const BALANCE_LABEL: Record<string, string> = {
  shortage: i18n.t('toasts.balanceShortage'),
  excess: i18n.t('toasts.balanceExcess'),
  balanced: '',
};

export function useJoinLegion(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (legionId: number) => viaimperiiApi.legion.join(userId as string, legionId),
    onSuccess: (result) => {
      // Sem nome (caso do 409 "já pertence") não mostra o toast de boas-vindas.
      if (result.legion_name) {
        Toast.show({
          type: 'success',
          text1: i18n.t('toasts.joinLegionWelcome', { name: result.legion_name }),
          text2: BALANCE_LABEL[result.balance_status ?? 'balanced'] || undefined,
        });
      }
      // Atualiza perfil (legião do usuário) + contagens de membros + detalhe da legião.
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['legions'] });
      queryClient.invalidateQueries({ queryKey: ['legion-detail'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.joinLegionError'), text2: error.message });
    },
  });
}
