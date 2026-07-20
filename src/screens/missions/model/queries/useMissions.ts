import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { Mission, MissionSort, MissionStatus } from '../../../../api/missions';

export function useMissions(
  status?: MissionStatus,
  enabled = true,
  sort?: MissionSort,
  professionId?: number | null,
) {
  return useQuery({
    queryKey: ['missions', status ?? 'all', sort ?? null, professionId ?? null],
    queryFn: () => viaimperiiApi.missions.list(status, sort, professionId ?? undefined),
    enabled,
    select: (data): Mission[] => data.items,
  });
}
