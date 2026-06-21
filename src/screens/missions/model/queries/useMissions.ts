import { useQuery } from '@tanstack/react-query';
import { getMissions, Mission, MissionSort, MissionStatus } from '../../../../api/missions/missionsApi';

export function useMissions(status?: MissionStatus, enabled = true, sort?: MissionSort) {
  return useQuery({
    queryKey: ['missions', status ?? 'all', sort ?? null],
    queryFn: () => getMissions(status, sort),
    enabled,
    select: (data): Mission[] => data.items,
  });
}
