import { useQuery } from '@tanstack/react-query';
import { getMissions, MissionStatus } from '../../../../api/missions/missionsApi';

export function useMissions(status?: MissionStatus, enabled = true) {
  return useQuery({
    queryKey: ['missions', status ?? 'all'],
    queryFn: () => getMissions(status),
    enabled,
  });
}
