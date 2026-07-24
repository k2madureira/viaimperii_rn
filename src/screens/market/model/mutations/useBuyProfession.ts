import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

export function useBuyProfession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (professionId: number) => viaimperiiApi.professions.buy(professionId),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('market.professions.buySuccessTitle'),
        text2: i18n.t('market.professions.buySuccessBody', {
          name: result.profession.name,
          coins: result.coins_spent_display ?? result.coins_spent,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['professions'] });
      queryClient.invalidateQueries({ queryKey: ['user-professions'] });
      // As missões disponíveis mudam ao desbloquear uma profissão.
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      queryClient.invalidateQueries({ queryKey: ['missions-recommended'] });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('market.professions.buyError'),
        text2: error.message,
      });
    },
  });
}
