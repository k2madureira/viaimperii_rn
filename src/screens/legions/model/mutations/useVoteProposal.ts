import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { LegionTreasuryApiError } from '../../../../api/legionTreasury';

/**
 * Voto na proposta de estandarte (POST .../standard-proposals/{id}/vote).
 *
 * Qualquer membro vota e pode TROCAR o voto enquanto a janela está aberta. Se
 * este voto cruzar o limiar, a resposta já traz o `standard` hasteado — daí o
 * Toast de aprovação em vez do de voto registrado.
 *
 * Mapa de erros (contrato do backend):
 *   403 → não é membro da legião
 *   409 → votação encerrada · prazo vencido (a leitura seguinte reflete o fim)
 */
export function useVoteProposal(legionId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proposalId, approve }: { proposalId: number; approve: boolean }) =>
      viaimperiiApi.legionTreasury.vote({ legionId: legionId as number, proposalId, approve }),
    onSuccess: (result) => {
      if (result.standard) {
        Toast.show({
          type: 'success',
          text1: i18n.t('legions.treasury.voteApproved'),
          text2: i18n.t('legions.treasury.hoistSuccessBody', {
            name: result.standard.name,
            pct: result.standard.multiplier_pct,
          }),
        });
      } else {
        Toast.show({ type: 'success', text1: i18n.t('legions.treasury.voteRegistered') });
      }
      queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
      queryClient.invalidateQueries({ queryKey: ['legion-standard-proposals', legionId] });
    },
    onError: (error: unknown) => {
      const status = error instanceof LegionTreasuryApiError ? error.status : undefined;

      if (status === 403) {
        Toast.show({ type: 'error', text1: i18n.t('legions.treasury.notMember') });
        return;
      }
      if (status === 409) {
        Toast.show({
          type: 'error',
          text1: i18n.t('legions.treasury.voteClosed'),
          text2: error instanceof Error ? error.message : undefined,
        });
        // A votação acabou entre a leitura e o toque — recarrega para mostrar o desfecho.
        queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
        return;
      }
      Toast.show({
        type: 'error',
        text1: i18n.t('legions.treasury.voteError'),
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });
}
