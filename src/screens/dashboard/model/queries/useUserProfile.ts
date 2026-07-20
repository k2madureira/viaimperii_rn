import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => viaimperiiApi.users.profile(userId as string),
    enabled: !!userId,
  });
}
