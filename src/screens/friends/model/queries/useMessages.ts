import { useInfiniteQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { MessagesResponse } from '../../../../api/chat';

// Histórico de uma conversa (keyset desc). `nextCursor` busca as mensagens mais
// antigas. Só habilita quando há uma conversa aberta (id != null).
export function useMessages(conversationId: number | null) {
  return useInfiniteQuery<MessagesResponse>({
    queryKey: ['chat', 'messages', conversationId],
    enabled: conversationId != null,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      viaimperiiApi.chat.messages(conversationId as number, pageParam as number | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
