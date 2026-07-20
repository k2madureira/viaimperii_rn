import { useInfiniteQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

const FIRST_PAGE_SIZE = 10;
const NEXT_PAGE_SIZE = 5;

// Posts de uma hashtag, paginados por keyset (cursor = id). Mesma cadência do feed.
export function useHashtagFeed(tag: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['feed-hashtag', tag],
    queryFn: ({ pageParam }) =>
      viaimperiiApi.feed.hashtag(
        tag,
        pageParam as number | null,
        pageParam == null ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE,
      ),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: enabled && !!tag,
  });
}
