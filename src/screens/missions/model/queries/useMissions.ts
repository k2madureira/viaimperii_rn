import { useQuery } from '@tanstack/react-query';
import { getMissions, Mission, MissionSort, MissionStatus } from '../../../../api/missions/missionsApi';

export function useMissions(
  status?: MissionStatus,
  enabled = true,
  sort?: MissionSort,
  professionId?: number | null,
) {
  return useQuery({
    queryKey: ['missions', status ?? 'all', sort ?? null, professionId ?? null],
    queryFn: () => getMissions(status, sort, professionId ?? undefined),
    enabled,
    select: (data): Mission[] => data.items,
  });
}
