import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

/**
 * Cofre da legião (saldo, movimentações, estandarte ativo e catálogo).
 * Só faz sentido para a legião do próprio viewer — o chamador controla `enabled`.
 */
export function useLegionTreasury(legionId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ['legion-treasury', legionId],
    queryFn: () => viaimperiiApi.legionTreasury.detail(legionId as number),
    enabled: enabled && legionId != null,
  });
}
