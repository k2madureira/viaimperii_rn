import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { joinLegion } from '../../../../api/legions/legionsApi';

const BALANCE_LABEL: Record<string, string> = {
  shortage: i18n.t('toasts.balanceShortage'),
  excess: i18n.t('toasts.balanceExcess'),
  balanced: '',
};

export function useJoinLegion(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (legionId: number) => joinLegion(userId as string, legionId),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('toasts.joinLegionWelcome', { name: result.legion_name }),
        text2: BALANCE_LABEL[result.balance_status ?? 'balanced'] || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.joinLegionError'), text2: error.message });
    },
  });
}
