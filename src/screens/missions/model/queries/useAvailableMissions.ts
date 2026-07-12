import { useQuery } from '@tanstack/react-query';
import { getAvailableMissions, MissionDifficulty } from '../../../../api/missions/missionsApi';

export function useAvailableMissions(
  specialtyId: number | null,
  difficulty: MissionDifficulty | null,
  enabled = true,
  professionId?: number | null,
) {
  return useQuery({
    queryKey: ['missions-available', specialtyId, difficulty, professionId ?? null],
    queryFn: () =>
      getAvailableMissions(specialtyId ?? undefined, difficulty ?? undefined, 1, 50, professionId ?? undefined),
    enabled,
  });
}
