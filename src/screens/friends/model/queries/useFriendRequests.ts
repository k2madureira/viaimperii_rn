import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { RequestDirection } from '../../../../api/friendship';

// Pedidos pendentes numa direção (recebidos ou enviados).
export function useFriendRequests(direction: RequestDirection, enabled = true) {
  return useQuery({
    queryKey: ['friend-requests', direction],
    queryFn: () => viaimperiiApi.friendship.listRequests(direction),
    enabled,
  });
}
