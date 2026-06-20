import { useQuery } from '@tanstack/react-query';
import { getAvailableMissions, MissionDifficulty } from '../../../../api/missions/missionsApi';

export function useAvailableMissions(
  specialtyId: number | null,
  difficulty: MissionDifficulty | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ['missions-available', specialtyId, difficulty],
    queryFn: () => getAvailableMissions(specialtyId ?? undefined, difficulty ?? undefined),
    enabled,
  });
}
