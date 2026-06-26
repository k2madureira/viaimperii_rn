import { useInfiniteQuery } from '@tanstack/react-query';
import { FeedView, getFeed } from '../../../../api/feed/feedApi';

/**
 * Timeline social paginada por keyset (cursor = id). Cada página traz
 * `nextCursor`; o react-query encadeia as páginas via `getNextPageParam`.
 */
export function useFeed(scope: FeedView = 'home', enabled = true) {
  return useInfiniteQuery({
    queryKey: ['feed', scope],
    queryFn: ({ pageParam }) => getFeed(scope, pageParam as number | null),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
  });
}
