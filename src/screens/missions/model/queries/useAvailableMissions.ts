import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { MissionDifficulty } from '../../../../api/missions';

export function useAvailableMissions(
  specialtyId: number | null,
  difficulty: MissionDifficulty | null,
  enabled = true,
  professionId?: number | null,
) {
  return useQuery({
    queryKey: ['missions-available', specialtyId, difficulty, professionId ?? null],
    queryFn: () =>
      viaimperiiApi.missions.available(specialtyId ?? undefined, difficulty ?? undefined, 1, 50, professionId ?? undefined),
    enabled,
  });
}
