import { useQuery } from '@tanstack/react-query';
import { getAvailableMissions } from '../../../../api/missions/missionsApi';

export function useAvailableMissions(specialtyId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['missions-available', specialtyId],
    queryFn: () => getAvailableMissions(specialtyId ?? undefined),
    enabled,
  });
}
