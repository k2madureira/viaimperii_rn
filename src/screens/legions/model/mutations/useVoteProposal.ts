import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import {
  LegionTreasury,
  LegionTreasuryApiError,
  VoteProposalResult,
} from '../../../../api/legionTreasury';

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
    onSuccess: (result: VoteProposalResult) => {
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
      // Sem refetch do cofre: a resposta traz a proposta apurada e o saldo novo.
      // Voto aberto → só atualiza a proposta e o saldo (reserva/available intactos).
      // Resolvido → a reserva sem escrow desta proposta (p.price) é liberada:
      // `reserved -= price` e `available = balance − reserved`. (Aprovação gasta e
      // libera igual valor → available fica estável; rejeição/expiração devolve.)
      const p = result.proposal;
      queryClient.setQueryData<LegionTreasury>(['legion-treasury', legionId], (data) => {
        if (!data) return data;
        const patch = (op: (typeof data.open_proposals)[number]) => (op.id === p.id ? p : op);

        if (p.status === 'open') {
          return {
            ...data,
            balance: result.balance,
            balance_display: result.balance_display,
            open_proposals: (data.open_proposals ?? []).map(patch),
            open_proposal: data.open_proposal ? patch(data.open_proposal) : data.open_proposal,
          };
        }

        const reserved = Math.max(0, data.reserved - p.price);
        return {
          ...data,
          balance: result.balance,
          balance_display: result.balance_display,
          reserved,
          available: result.balance - reserved,
          open_proposals: (data.open_proposals ?? []).filter((op) => op.id !== p.id),
          open_proposal: data.open_proposal?.id === p.id ? null : data.open_proposal,
          active_standard: result.standard ?? data.active_standard,
        };
      });

      // Só relê o histórico (on-demand) quando a votação de fato encerrou — o SSE
      // de votos já faz isso, mas o voto do próprio usuário não depende do stream.
      if (p.status !== 'open') {
        queryClient.invalidateQueries({ queryKey: ['legion-standard-proposals', legionId] });
      }
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
