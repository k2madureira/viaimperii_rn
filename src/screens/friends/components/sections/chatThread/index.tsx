import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { useDmConversation } from '../../../model/queries/useDmConversation';
import { useConversations } from '../../../model/queries/useConversations';
import ChatThreadView from '../chatThreadView';

interface Props {
  friendUserId: string;
  bottomInset?: number;
}

// Conversa de DM (tela dedicada): abre a DM lazy com o amigo e delega o corpo ao
// ChatThreadView (histórico + composer + divisor de não-lidas + "ir ao fim").
export default function ChatThread({ friendUserId, bottomInset = 0 }: Props) {
  const { t } = useTranslation();

  const convQuery = useDmConversation(friendUserId);
  const conversationId = convQuery.data?.id ?? null;

  // Não-lidas da abertura vêm do inbox (cross-ref pela conversa).
  const conversationsQuery = useConversations();
  const inboxItem = (conversationsQuery.data?.items ?? []).find((c) => c.id === conversationId);
  const initialUnread = inboxItem?.unread_count ?? 0;

  if (convQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#9E1B32" />
      </View>
    );
  }

  if (convQuery.isError) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[14px] text-[#9E1B32] text-center" maxFontSizeMultiplier={0}>
          {(convQuery.error as Error)?.message ?? t('chat.errors.openDm')}
        </Text>
      </View>
    );
  }

  return (
    <ChatThreadView
      conversationId={conversationId}
      initialUnread={initialUnread}
      context="dm"
      bottomInset={bottomInset}
    />
  );
}
