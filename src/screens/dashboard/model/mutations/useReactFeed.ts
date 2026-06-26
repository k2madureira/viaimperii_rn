import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import {
  FeedItem,
  FeedListResponse,
  reactFeed,
  ReactionType,
  unreactFeed,
} from '../../../../api/feed/feedApi';

interface Vars {
  eventId: number;
  type: ReactionType;
  currentMine: ReactionType | null;
}

type FeedCache = InfiniteData<FeedListResponse>;

// Aplica uma transformação às reações de um item específico em todas as páginas
// dos caches de feed (qualquer scope).
function patchFeedCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: number,
  patch: (item: FeedItem) => FeedItem,
) {
  queryClient.setQueriesData<FeedCache>({ queryKey: ['feed'] }, (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((it) => (it.id === eventId ? patch(it) : it)),
      })),
    };
  });
}

/**
 * Define/alterna/remove a reação do usuário num item do feed.
 * Toggle: reagir com o mesmo tipo já ativo remove a reação.
 * Atualização otimista do cache, com rollback em erro e reconciliação no sucesso.
 */
export function useReactFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, type, currentMine }: Vars) =>
      currentMine === type ? unreactFeed(eventId) : reactFeed(eventId, type),

    onMutate: async ({ eventId, type, currentMine }: Vars) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const removing = currentMine === type;

      patchFeedCaches(queryClient, eventId, (item) => {
        const by = { ...item.reactions.by_type };
        if (currentMine) by[currentMine] = Math.max(0, (by[currentMine] ?? 0) - 1);
        if (!removing) by[type] = (by[type] ?? 0) + 1;
        const total = Object.values(by).reduce((s, n) => s + (n ?? 0), 0);
        return {
          ...item,
          reactions: { total, by_type: by, mine: removing ? null : type },
        };
      });
    },

    onSuccess: (result) => {
      // Reconcilia com a verdade do servidor (totais exatos).
      patchFeedCaches(queryClient, result.feed_event_id, (item) => ({
        ...item,
        reactions: { total: result.total, by_type: result.by_type, mine: result.mine },
      }));
    },

    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.feedReactError'), text2: error.message });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
