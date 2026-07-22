import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { LegionTreasuryApiError } from '../../../../api/legionTreasury';

/**
 * Abre a votação de compra (ou extensão) da Sala de Guerra.
 *
 * Como no Estandarte, NÃO compra na hora: o preço fica reservado e a legião
 * tem 5 dias para aprovar. O acesso é coletivo e temporário — comprar com ele
 * ativo estende em vez de reiniciar.
 *
 *   403 → não é o Praefectus (nem admin)
 *   409 → votação de Sala de Guerra já aberta · cofre sem saldo disponível
 */
export function useProposeWarRoom(legionId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => viaimperiiApi.legionTreasury.proposeWarRoom(legionId as number),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('legions.warRoomProposeSuccess'),
        text2: i18n.t('legions.treasury.proposeSuccessBody', {
          name: i18n.t('legions.warRoom'),
          required: result.proposal.votes_required,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
      queryClient.invalidateQueries({ queryKey: ['legion-standard-proposals', legionId] });
      // O board muda de `preview` para `full` quando a votação já aprova na
      // abertura (legião de 1 ativo), então a leitura dele também sai do cache.
      queryClient.invalidateQueries({ queryKey: ['legion-leaderboard'] });
    },
    onError: (error: unknown) => {
      const status = error instanceof LegionTreasuryApiError ? error.status : undefined;

      if (status === 403) {
        Toast.show({ type: 'error', text1: i18n.t('legions.treasury.notLeader') });
        return;
      }
      if (status === 409) {
        Toast.show({
          type: 'error',
          text1: i18n.t('legions.treasury.proposeBlocked'),
          text2: error instanceof Error ? error.message : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
        return;
      }
      Toast.show({
        type: 'error',
        text1: i18n.t('legions.warRoomProposeError'),
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });
}
