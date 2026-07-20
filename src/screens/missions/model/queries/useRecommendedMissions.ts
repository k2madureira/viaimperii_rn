import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { MissionDifficulty } from '../../../../api/missions';

export function useRecommendedMissions(
  specialtyId: number | null,
  difficulty: MissionDifficulty | null,
  type: 'daily' | 'monthly',
  enabled = true,
) {
  return useQuery({
    queryKey: ['missions-recommended', specialtyId, difficulty, type],
    queryFn: () =>
      viaimperiiApi.missions.recommended(specialtyId ?? undefined, difficulty ?? undefined, type),
    enabled,
  });
}
