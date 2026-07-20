import { useInfiniteQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

const PAGE_SIZE = 20;

// Histórico de notificações (comentários/reações/aprovações/promoções...),
// paginado por keyset — mesmo padrão do useFeed. Só busca quando o dropdown
// do sino está aberto (enabled).
export function useNotifications(enabled = true) {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => viaimperiiApi.notifications.list(pageParam as number | null, PAGE_SIZE),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
  });
}
