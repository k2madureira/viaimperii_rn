import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useMissionsToReview(enabled = true) {
  return useQuery({
    queryKey: ['missions-to-review'],
    queryFn: viaimperiiApi.missions.toReview,
    enabled,
  });
}
