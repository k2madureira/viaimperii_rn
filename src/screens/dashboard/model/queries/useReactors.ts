import { useInfiniteQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { ReactionType } from '../../../../api/feed';

/**
 * Lista (paginada, keyset) os usuários que reagiram a um evento do feed,
 * opcionalmente filtrada por tipo de reação. Só carrega quando `enabled`
 * (ex.: o popover de reações está aberto).
 */
export function useReactors(
  eventId: number | null,
  type: ReactionType | null,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ['feed-reactors', eventId, type],
    queryFn: ({ pageParam }) =>
      viaimperiiApi.feed.reactors(eventId as number, type, pageParam as number | null),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: enabled && eventId != null,
  });
}
