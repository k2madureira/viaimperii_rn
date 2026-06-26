import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedComments } from '../../../../api/feed/feedApi';

/**
 * Comentários de um evento do feed (mais antigo primeiro, keyset). Só carrega
 * quando `enabled` (ex.: o modal de comentários está aberto).
 */
export function useFeedComments(eventId: number | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['feed-comments', eventId],
    queryFn: ({ pageParam }) => getFeedComments(eventId as number, pageParam as number | null),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: enabled && eventId != null,
  });
}
