import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Inbox de conversas do usuário (DM na Fase 1), com preview e não-lidas.
export function useConversations(enabled = true) {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: viaimperiiApi.chat.conversations,
    enabled,
  });
}
