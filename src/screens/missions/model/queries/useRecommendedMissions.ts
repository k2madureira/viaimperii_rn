import { useQuery } from '@tanstack/react-query';
import { getRecommendedMissions, MissionDifficulty } from '../../../../api/missions/missionsApi';

export function useRecommendedMissions(
  specialtyId: number | null,
  difficulty: MissionDifficulty | null,
  type: 'daily' | 'monthly',
  enabled = true,
) {
  return useQuery({
    queryKey: ['missions-recommended', specialtyId, difficulty, type],
    queryFn: () =>
      getRecommendedMissions(specialtyId ?? undefined, difficulty ?? undefined, type),
    enabled,
  });
}
