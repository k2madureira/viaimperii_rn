import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Marca a conversa lida até uma mensagem (zera o contador de não-lidas).
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { conversationId: number; lastReadMessageId: number }) =>
      viaimperiiApi.chat.markRead(input.conversationId, input.lastReadMessageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}
