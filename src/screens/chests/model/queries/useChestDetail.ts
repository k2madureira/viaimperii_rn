import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Detalhe do baú (monta o seletor). `id` = user_chest id.
export function useChestDetail(userChestId: number, enabled = true) {
  return useQuery({
    queryKey: ['chest', userChestId],
    queryFn: () => viaimperiiApi.chests.detail(userChestId),
    enabled: enabled && Number.isFinite(userChestId),
  });
}
