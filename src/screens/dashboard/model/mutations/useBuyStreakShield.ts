import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import {
  buyStreakShield,
  StreakApiError,
  StreakResponse,
} from '../../../../api/streak/streakApi';

/**
 * Compra 1 Streak Shield via POST /users/{id}/streak/shield.
 *
 * Contrato real do backend (divergente da spec, ver hand-off):
 *   409 → teto de escudos atingido; 422 → saldo insuficiente; 403 → não é o dono.
 *
 * Em sucesso: Toast, invalida a query de streak (contagem) e a carteira (saldo).
 */
export function useBuyStreakShield(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => buyStreakShield(userId as string),
    onSuccess: (data) => {
      Toast.show({ type: 'success', text1: i18n.t('dashboard.streakShield.success') });
      // Atualiza a contagem exibida NA HORA (o tooltip/modal renderizam a partir
      // desta query): sem o seed síncrono, o número só mudava após o refetch do
      // invalidate resolver — daí "só atualiza reabrindo". `data` traz o novo total.
      queryClient.setQueryData<StreakResponse>(['streak', userId], (old) =>
        old
          ? {
              ...old,
              streak_shields: data.streak_shields,
              max_streak_shields: data.max_streak_shields,
            }
          : old,
      );
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: unknown) => {
      const status = error instanceof StreakApiError ? error.status : undefined;
      if (status === 422) {
        Toast.show({ type: 'error', text1: i18n.t('dashboard.streakShield.insufficient') });
      } else if (status === 409) {
        Toast.show({ type: 'error', text1: i18n.t('dashboard.streakShield.maxed') });
        queryClient.invalidateQueries({ queryKey: ['streak', userId] });
      } else {
        const message = error instanceof Error ? error.message : undefined;
        Toast.show({ type: 'error', text1: i18n.t('dashboard.streakShield.error'), text2: message });
      }
    },
  });
}
