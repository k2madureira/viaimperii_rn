import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Meus baús (lista + summary). Ver §35.
export function useChests(enabled = true) {
  return useQuery({
    queryKey: ['chests'],
    queryFn: viaimperiiApi.chests.list,
    enabled,
  });
}
