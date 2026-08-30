import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import {
  LegionTreasury,
  LegionTreasuryApiError,
  ProposeStandardResult,
} from '../../../../api/legionTreasury';

/**
 * Abre a votação de compra de um estandarte (POST /legions/{id}/standard/{slug}).
 *
 * NÃO compra na hora: o preço fica reservado e a legião tem 5 dias para aprovar
 * (60% do efetivo ativo congelado na abertura). `standard` só vem preenchido no
 * caso raro em que o SIM do proponente já cruza o limiar sozinho.
 *
 * Mapa de erros (contrato do backend):
 *   403 → não é o Centurião (nem admin)
 *   409 → estandarte já ativo · votação já aberta · cofre insuficiente
 *
 * `onForbidden` deixa a section esconder o gatilho após um 403. O cofre expõe
 * `can_propose`, então o 403 aqui é rede de segurança contra estado obsoleto
 * (ex.: a liderança mudou entre a leitura e o toque).
 */
export function useProposeStandard(legionId: number | undefined, onForbidden?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      viaimperiiApi.legionTreasury.proposeStandard({ legionId: legionId as number, slug }),
    onSuccess: (result: ProposeStandardResult) => {
      // Resolveu já na abertura (legião pequena): o estandarte subiu de fato.
      if (result.standard) {
        Toast.show({
          type: 'success',
          text1: i18n.t('legions.treasury.hoistSuccess'),
          text2: i18n.t('legions.treasury.hoistSuccessBody', {
            name: result.standard.name,
            pct: result.standard.multiplier_pct,
          }),
        });
      } else {
        Toast.show({
          type: 'success',
          text1: i18n.t('legions.treasury.proposeSuccess'),
          text2: i18n.t('legions.treasury.proposeSuccessBody', {
            name: result.proposal.standard_name,
            required: result.proposal.votes_required,
          }),
        });
      }
      // Sem refetch do cofre (payload pesado): escreve o cache pela resposta, que
      // já traz saldo/available novos e a proposta. `reserved = balance − available`
      // (a reserva sem escrow de uma votação aberta).
      const p = result.proposal;
      queryClient.setQueryData<LegionTreasury>(['legion-treasury', legionId], (data) => {
        if (!data) return data;
        const others = (data.open_proposals ?? []).filter((op) => op.id !== p.id);
        return {
          ...data,
          balance: result.balance,
          balance_display: result.balance_display,
          available: result.available,
          available_display: result.available_display,
          reserved: result.balance - result.available,
          // Aberta → entra na lista (uma por kind: descarta outra do mesmo kind).
          // Resolvida na abertura → NÃO é aberta, fica de fora; o estandarte sobe.
          open_proposals:
            p.status === 'open' ? [...others.filter((op) => op.kind !== p.kind), p] : others,
          open_proposal:
            p.status === 'open' ? data.open_proposal ?? p : data.open_proposal,
          active_standard: result.standard ?? data.active_standard,
        };
      });

      // Histórico de votações é on-demand (só carrega com a aba aberta). Só precisa
      // relê-lo quando a proposta JÁ resolveu na abertura (vira item de histórico);
      // uma votação aberta é filtrada do histórico, então não custa nada.
      if (p.status !== 'open') {
        queryClient.invalidateQueries({ queryKey: ['legion-standard-proposals', legionId] });
      }
    },
    onError: (error: unknown) => {
      const status = error instanceof LegionTreasuryApiError ? error.status : undefined;

      if (status === 403) {
        Toast.show({ type: 'error', text1: i18n.t('legions.treasury.notLeader') });
        onForbidden?.();
        return;
      }
      if (status === 409) {
        // Já ativo · votação aberta · cofre insuficiente — a mensagem do backend
        // distingue os três; refazer a leitura corrige o card.
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
        text1: i18n.t('legions.treasury.proposeError'),
        text2: error instanceof Error ? error.message : undefined,
      });
    },
  });
}
