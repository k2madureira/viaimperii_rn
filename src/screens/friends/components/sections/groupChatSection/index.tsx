import React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { GroupKind } from '../../../../../api/chat';
import { CHAT_THEME } from '../../../../../constants/chatTheme';
import { useGroupConversation } from '../../../model/queries/useGroupConversation';
import ChatThreadView from '../chatThreadView';
import EmptyBox from '../../feedback/emptyBox';

interface Props {
  kind: GroupKind;
  bottomInset?: number;
}

// Sala de grupo (legião/clã): abre a conversa única do grupo do usuário e delega o
// corpo ao ChatThreadView. Header compacto com brasão + nome; estado vazio quando
// o usuário não pertence ao grupo (backend responde 403).
export default function GroupChatSection({ kind, bottomInset = 0 }: Props) {
  const { t } = useTranslation();
  const convQuery = useGroupConversation(kind);

  if (convQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#9E1B32" />
      </View>
    );
  }

  // 403 (sem grupo) ou qualquer erro → orienta o usuário a entrar no grupo.
  if (convQuery.isError || !convQuery.data) {
    return (
      <View className="flex-1 px-5 pt-6">
        <EmptyBox
          title={t(`chat.group.${kind}.emptyTitle`)}
          subtitle={t(`chat.group.${kind}.emptySubtitle`)}
        />
      </View>
    );
  }

  const conv = convQuery.data;
  const group = conv.group;
  const theme = CHAT_THEME[kind];

  return (
    <View className="flex-1">
      {/* Header da sala: brasão + nome do grupo, tingido pela cor do contexto */}
      <View
        className="flex-row items-center gap-2.5 px-4 py-2.5 border-b"
        style={{ backgroundColor: theme.accentSoft, borderBottomColor: `${theme.accent}26` }}>
        <View
          className="w-9 h-9 rounded-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#fff', borderWidth: 1.5, borderColor: `${theme.accent}55` }}>
          {group?.image ? (
            <Image source={{ uri: group.image }} style={{ width: 36, height: 36 }} resizeMode="cover" />
          ) : (
            <Text className="text-[14px] font-bold" style={{ color: theme.accent }}>
              {(group?.name ?? '?').trim().charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold" numberOfLines={1} style={{ color: theme.accent }}>
            {group?.name ?? t(`chat.group.${kind}.title`)}
          </Text>
          <Text className="text-[11px] text-[#888]">{t(`chat.group.${kind}.subtitle`)}</Text>
        </View>
      </View>

      <ChatThreadView
        conversationId={conv.id}
        initialUnread={conv.unread_count}
        showSender
        context={kind}
        bottomInset={bottomInset}
      />
    </View>
  );
}
