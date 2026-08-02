import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Envia uma mensagem de texto numa conversa. O backend NÃO ecoa a mensagem de
// volta pelo SSE ao remetente, então invalidamos o histórico para vê-la (e a lista
// de conversas para atualizar o preview).
export function useSendMessage(conversationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => viaimperiiApi.chat.sendMessage(conversationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}
