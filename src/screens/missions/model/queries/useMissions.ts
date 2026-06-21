import { useQuery } from '@tanstack/react-query';
import { getMissions, Mission, MissionStatus } from '../../../../api/missions/missionsApi';

export function useMissions(status?: MissionStatus, enabled = true) {
  return useQuery({
    queryKey: ['missions', status ?? 'all'],
    queryFn: () => getMissions(status),
    enabled,
    select: (data): Mission[] => data.items,
  });
}
