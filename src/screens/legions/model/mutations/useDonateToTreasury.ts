import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import {
  DonateToTreasuryResult,
  LegionTreasury,
  LegionTreasuryApiError,
  TreasuryTransaction,
} from '../../../../api/legionTreasury';
import { WalletBalance } from '../../../../api/wallet';
import { CoinDenom } from '../../../../utils/coins';

/**
 * Tributo ao cofre da legião (POST /legions/{id}/treasury/donate).
 *
 * Mapa de erros (contrato do backend):
 *   403 → não é membro da legião · 409 → saldo insuficiente
 *   422 → amount/unit inválidos (o modal mostra INLINE, sem Toast)
 *
 * Em sucesso NÃO refazemos GET /treasury nem GET /wallet: a própria resposta do
 * POST já traz o saldo novo do cofre (`balance`) e o saldo pessoal do doador
 * (`your_balance`). Reinvalidar dispararia dois refetches por tributo — sendo o
 * do cofre um payload pesado (transações + candidatos a centurião + catálogo de
 * estandartes) — e é o que fazia o clique "travar". Aqui só escrevemos no cache
 * a partir da resposta (mesma estratégia do stream de votos, que também patcha
 * sem refetch). O estado persistido volta no próximo GET natural (mount/refresh).
 */
export function useDonateToTreasury(legionId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { amount: number; unit: CoinDenom }) =>
      viaimperiiApi.legionTreasury.donate({ legionId: legionId as number, ...input }),
    onSuccess: (result: DonateToTreasuryResult) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('legions.treasury.donateSuccess'),
        text2: i18n.t('legions.treasury.donateSuccessBody', {
          amount: result.donated_display,
          balance: result.your_balance_display,
        }),
      });

      // Cofre: saldo novo + a movimentação otimista (a doação é entrada, +valor).
      // `available = balance − reserved`; a reserva de uma votação aberta não muda
      // com um tributo, então recomputa a partir do novo saldo.
      queryClient.setQueryData<LegionTreasury>(['legion-treasury', legionId], (data) => {
        if (!data) return data;
        const tx: TreasuryTransaction = {
          tx_type: 'earn',
          reference_type: 'legion_donation',
          amount: result.donated,
          amount_display: result.donated_display,
          memo: null,
          created_at: new Date().toISOString(),
        };
        return {
          ...data,
          balance: result.balance,
          balance_display: result.balance_display,
          available: result.balance - data.reserved,
          transactions: [tx, ...(data.transactions ?? [])],
        };
      });

      // Carteira pessoal: general_balance = saldo pessoal pós-doação; o total
      // (balance) = geral + restrito (o restrito não se move num tributo).
      queryClient.setQueryData<WalletBalance>(['wallet'], (data) => {
        if (!data) return data;
        return {
          ...data,
          general_balance: result.your_balance,
          general_balance_display: result.your_balance_display,
          balance: result.your_balance + data.restricted_balance,
        };
      });
    },
    onError: (error: unknown) => {
      const status = error instanceof LegionTreasuryApiError ? error.status : undefined;
      // 422 é erro de campo: o donateModal renderiza inline a partir de mutation.error.
      if (status === 422) return;

      if (status === 409) {
        Toast.show({ type: 'error', text1: i18n.t('legions.treasury.insufficient') });
        // Saldo insuficiente: o cache local pode estar adiantado — relê a carteira
        // (chamada leve) para mostrar o saldo real.
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
