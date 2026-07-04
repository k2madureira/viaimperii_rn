import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { buyAsset } from '../../../../api/assets/assetsApi';

export function useBuyAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => buyAsset(slug),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('avatarPicker.buySuccessTitle'),
        text2: i18n.t('avatarPicker.buySuccessBody', {
          name: result.asset.name,
          coins: result.coins_spent_display,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['asset-catalog'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('avatarPicker.buyError'), text2: error.message });
    },
  });
}
