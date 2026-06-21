import { useQuery } from '@tanstack/react-query';
import { getMissionsToReview } from '../../../../api/missions/missionsApi';

export function useMissionsToReview(enabled = true) {
  return useQuery({
    queryKey: ['missions-to-review'],
    queryFn: getMissionsToReview,
    enabled,
  });
}
