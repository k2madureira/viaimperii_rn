import { useInfiniteQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { FeedView } from '../../../../api/feed';

// Primeira leva maior; leituras seguintes menores (carregamento incremental
// conforme o usuário se aproxima do fim da lista).
const FIRST_PAGE_SIZE = 10;
const NEXT_PAGE_SIZE = 5;

/**
 * Timeline social paginada por keyset (cursor = id). Cada página traz
 * `nextCursor`; o react-query encadeia as páginas via `getNextPageParam`.
 * Carrega 10 posts de início e +5 a cada página seguinte.
 */
export function useFeed(scope: FeedView = 'home', enabled = true) {
  return useInfiniteQuery({
    queryKey: ['feed', scope],
    queryFn: ({ pageParam }) =>
      viaimperiiApi.feed.list(scope, pageParam as number | null, pageParam == null ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
  });
}
