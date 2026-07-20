import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

// Chaves invalidadas após qualquer resgate (carteira/perfil mudam com o grant).
const REWARD_KEYS = [['daily-rewards'], ['wallet'], ['user-profile'], ['ranking']];

// Resgata as ações não resgatadas de hoje de um prêmio. Atualiza prêmios +
// carteira + perfil (o grant pode conceder XP/moeda e recalcular patente).
export function useClaimDailyReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, count }: { slug: string; count?: number }) =>
      viaimperiiApi.dailyRewards.claim(slug, count),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('rewards.claimedToast') });
      REWARD_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('rewards.claimError'), text2: error.message });
    },
  });
}

// Resgata todos os prêmios resgatáveis (um POST por slug). Atualiza carteira/perfil.
export function useClaimAllDailyRewards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slugs: string[]) => viaimperiiApi.dailyRewards.claimAll(slugs),
    onSuccess: (results) => {
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      if (ok > 0) {
        Toast.show({ type: 'success', text1: i18n.t('rewards.claimedToast') });
      }
      REWARD_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('rewards.claimError'), text2: error.message });
    },
  });
}
