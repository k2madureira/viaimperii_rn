import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { FeedItem } from '../../../../api/feed';

/**
 * Detalhe de um post do feed. Aceita um `initialData` (ex.: o item vindo da
 * busca) para render instantâneo, e refaz em segundo plano para trazer
 * reações/contagem atualizadas.
 */
export function useFeedEvent(eventId: number, initialData?: FeedItem) {
  return useQuery({
    queryKey: ['feed-event', eventId],
    queryFn: () => viaimperiiApi.feed.detail(eventId),
    initialData,
    // Considera o initialData "velho" para refazer em segundo plano na abertura.
    initialDataUpdatedAt: 0,
    staleTime: 15_000,
  });
}
