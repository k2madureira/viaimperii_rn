import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { LegionTreasuryApiError } from '../../../../api/legionTreasury';
import { CoinDenom } from '../../../../utils/coins';

/**
 * Tributo ao cofre da legião (POST /legions/{id}/treasury/donate).
 *
 * Mapa de erros (contrato do backend):
 *   403 → não é membro da legião · 409 → saldo insuficiente
 *   422 → amount/unit inválidos (o modal mostra INLINE, sem Toast)
 *
 * Em sucesso: Toast + invalida o cofre e a carteira (saldo pessoal do header).
 */
export function useDonateToTreasury(legionId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { amount: number; unit: CoinDenom }) =>
      viaimperiiApi.legionTreasury.donate({ legionId: legionId as number, ...input }),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('legions.treasury.donateSuccess'),
        text2: i18n.t('legions.treasury.donateSuccessBody', {
          amount: result.donated_display,
          balance: result.your_balance_display,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: unknown) => {
      const status = error instanceof LegionTreasuryApiError ? error.status : undefined;
      // 422 é erro de campo: o donateModal renderiza inline a partir de mutation.error.
      if (status === 422) return;

      if (status === 409) {
        Toast.show({ type: 'error', text1: i18n.t('legions.treasury.insufficient') });
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        return;
      }
      if (status === 403) {
        Toast.show({ type: 'error', text1: i18n.t('legions.treasury.notMember') });
        return;
      }
      Toast.show({
        type: 'error',
        text1: i18n.t('legions.treasury.donateError'),
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });
}
