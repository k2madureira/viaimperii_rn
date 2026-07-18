import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { buyStreakShield, StreakApiError } from '../../../../api/streak/streakApi';

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
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('dashboard.streakShield.success') });
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
