import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

/**
 * Centurião de uma legião (`GET /legions/{id}/leader`).
 *
 * Ao contrário do cofre, este endpoint NÃO exige ser membro — só auth. Por isso
 * a tela de Legiões consegue mostrar o Centurião de qualquer legião, não apenas
 * o da legião do viewer.
 */
export function useLegionLeader(legionId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ['legion-leader', legionId],
    queryFn: () => viaimperiiApi.legionTreasury.leader(legionId as number),
    enabled: enabled && legionId != null,
  });
}
