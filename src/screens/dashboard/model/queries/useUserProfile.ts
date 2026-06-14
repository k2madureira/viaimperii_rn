import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../../../api/users/userApi';

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId as string),
    enabled: !!userId,
  });
}
