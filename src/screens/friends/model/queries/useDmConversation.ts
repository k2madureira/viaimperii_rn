import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Abre (ou retorna) a DM com um amigo. É idempotente no backend — get-or-create —
// então modelado como query. 422 se não for amigo aceito; 403 se houver bloqueio.
export function useDmConversation(friendUserId: string | null) {
  return useQuery({
    queryKey: ['chat', 'dm', friendUserId],
    enabled: friendUserId != null,
    queryFn: () => viaimperiiApi.chat.openDm(friendUserId as string),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
