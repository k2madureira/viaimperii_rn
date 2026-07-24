import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { LegionTreasuryApiError } from '../../../../api/legionTreasury';

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
    onSuccess: (result) => {
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
      queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
      queryClient.invalidateQueries({ queryKey: ['legion-standard-proposals', legionId] });
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
