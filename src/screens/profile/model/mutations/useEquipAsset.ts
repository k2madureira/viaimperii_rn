import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { equipAsset } from '../../../../api/assets/assetsApi';

export function useEquipAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => equipAsset(slug),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('avatarPicker.equipSuccess'),
        text2: result.asset.name,
      });
      queryClient.invalidateQueries({ queryKey: ['asset-catalog'] });
      // active_avatar vem do detalhe/login do usuário.
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('avatarPicker.equipError'), text2: error.message });
    },
  });
}
