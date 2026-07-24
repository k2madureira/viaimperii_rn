import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { FeedItem, FeedListResponse } from '../../../../api/feed';
import { SendFeedTributeInput, TributeApiError, TributeResult } from '../../../../api/tributes';

type FeedCache = InfiniteData<FeedListResponse>;

/**
 * Aplica uma transformação ao item nos três caches que renderizam um `FeedCard`:
 * a timeline (`['feed', scope]`, casada por prefixo), o feed de hashtag e o
 * detalhe do post — todos podem estar montados ao mesmo tempo.
 */
function patchTributes(
  queryClient: ReturnType<typeof useQueryClient>,
  eventId: number,
  patch: (item: FeedItem) => FeedItem,
) {
  const patchPages = (data: FeedCache | undefined) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((it) => (it.id === eventId ? patch(it) : it)),
      })),
    };
  };

  queryClient.setQueriesData<FeedCache>({ queryKey: ['feed'] }, patchPages);
  queryClient.setQueriesData<FeedCache>({ queryKey: ['feed-hashtag'] }, patchPages);
  queryClient.setQueryData<FeedItem>(['feed-event', eventId], (item) =>
    item ? patch(item) : item,
  );
}

/**
 * Envia um tributo em moedas ao autor de um post.
 *
 * O contador do card é reconciliado no SUCESSO, não antes: só o servidor sabe o
 * valor atômico transferido (`amount` chega em denarii) e o total do alvo, e a
 * regra do projeto proíbe aritmética de moeda no front. O envio é rápido e o
 * modal já mostra loading, então não há ganho perceptível em adivinhar.
 *
 * Erros de campo (422 faixa/saldo, 429 cap diário) NÃO viram Toast — o modal os
 * exibe inline, ancorados no valor digitado.
 */
export function useSendTribute() {
  const queryClient = useQueryClient();

  return useMutation<TributeResult, Error, SendFeedTributeInput>({
    mutationFn: (input) => viaimperiiApi.tributes.feed(input),

    onSuccess: (result, { eventId }) => {
      patchTributes(queryClient, eventId, (item) => {
        const previous = item.tributes;
        return {
          ...item,
          tributes: {
            total: result.target_total,
            total_display: result.target_total_display,
            count: (previous?.count ?? 0) + 1,
            mine: (previous?.mine ?? 0) + result.coins_sent,
          },
        };
      });
      // O saldo do remetente mudou (o modal mostra o novo valor vindo da resposta,
      // mas a carteira do header lê a query).
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },

    onError: (error: Error) => {
      const status = error instanceof TributeApiError ? error.status : 0;
      // Erros de campo ficam inline no modal, ancorados no valor digitado.
      if (status === 422 || status === 429) return;
      // 400 = auto-tributo: o botão está escondido nos próprios posts, então só
      // acontece com um cache defasado — vale uma mensagem própria mesmo assim.
      Toast.show({
        type: 'error',
        text1: status === 400 ? i18n.t('tributes.errors.self') : i18n.t('tributes.errors.generic'),
        text2: status === 400 ? undefined : error.message,
      });
    },
  });
}
