import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

/**
 * Histórico de propostas de estandarte da legião (qualquer status, mais novas
 * primeiro). As votações ABERTAS já vêm no cofre (`open_proposals`); esta query
 * serve ao bloco de histórico, por isso fica desligada até o usuário expandir.
 */
export function useStandardProposals(legionId: number | undefined, enabled = true, limit = 10) {
  return useQuery({
    queryKey: ['legion-standard-proposals', legionId, limit],
    queryFn: () => viaimperiiApi.legionTreasury.proposals(legionId as number, limit),
    enabled: enabled && legionId != null,
  });
}
