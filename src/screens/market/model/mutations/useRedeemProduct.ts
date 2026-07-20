import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

export function useRedeemProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { slug: string; shippingInfo?: string }) =>
      viaimperiiApi.physical.redeem(vars.slug, vars.shippingInfo),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('market.redeemSuccessTitle'),
        text2: i18n.t('market.redeemSuccessBody', {
          name: result.redemption.product_name,
          coins: result.redemption.coins_spent_display,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['physical-products'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('market.redeemError'), text2: error.message });
    },
  });
}
