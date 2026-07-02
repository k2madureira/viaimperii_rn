import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedComments } from '../../../../api/feed/feedApi';

// Mesma lógica de carregamento do feed: primeira leva maior, incrementos menores.
const FIRST_PAGE_SIZE = 10;
const NEXT_PAGE_SIZE = 5;

/**
 * Comentários de um evento do feed (mais antigo primeiro, keyset). Só carrega
 * quando `enabled` (ex.: o modal de comentários está aberto). Carrega 10 de
 * início e +5 a cada página seguinte.
 */
export function useFeedComments(eventId: number | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['feed-comments', eventId],
    queryFn: ({ pageParam }) =>
      getFeedComments(
        eventId as number,
        pageParam as number | null,
        pageParam == null ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE,
      ),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: enabled && eventId != null,
  });
}
