import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ChatIcon } from '../../../../../components/icons';
import NotificationsButton from '../../buttons/notificationsButton';
import { useConversations } from '../../../../friends/model/queries/useConversations';

interface Props {
  name: string;
  rankName: string;
  avatarUrl: string | null;
  onOpenProfile: () => void;
  onOpenChat: () => void;
}

// 1 — HEADER: banner vermelho imperial com avatar + nome + patente (abre o perfil)
// à esquerda; à direita o atalho do chat seguido do sino de notificações.
export default function DashboardHeader({
  name,
  rankName,
  avatarUrl,
  onOpenProfile,
  onOpenChat,
}: Props) {
  const { t } = useTranslation();
  const initial = name?.trim().charAt(0).toUpperCase() || '?';

  // Não-lidas de todas as conversas (DM + salas). O SSE de chat (global) invalida
  // este cache ao chegar mensagem, então o badge acende em tempo real.
  const conversationsQuery = useConversations();
  const chatUnread = (conversationsQuery.data?.items ?? []).reduce(
    (sum, c) => sum + c.unread_count,
    0,
  );

  return (
    <View className="flex-row items-center justify-between bg-primary-500 rounded-[18px] px-4 py-3">
      <TouchableOpacity
        className="flex-row items-center flex-1 gap-3"
        activeOpacity={0.7}
        accessibilityRole="button"
        onPress={onOpenProfile}>
        <View className="w-12 h-12 rounded-full bg-white items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
          ) : (
            <Text className="text-[18px] font-bold text-primary-500">{initial}</Text>
          )}
        </View>
        <View className="flex-1" style={{ minWidth: 0 }}>
          <Text className="text-[17px] font-extrabold text-white" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-[13px] text-white/80 mt-0.5" numberOfLines={1}>
            {rankName}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center ml-2">
        <TouchableOpacity
          onPress={onOpenChat}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t('chat.title')}
          className="w-9 h-9 items-center justify-center">
          <ChatIcon size={28} color="#fff" />
          {chatUnread > 0 && (
            <View
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full items-center justify-center px-1 bg-white"
              style={{ borderWidth: 1.5, borderColor: '#9E1B32' }}>
              <Text className="text-[9px] font-extrabold leading-none text-primary-500">
                {chatUnread > 99 ? '99+' : chatUnread}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sino de notificações imediatamente à direita do chat (§ajuste 1) */}
        <NotificationsButton onDark />
      </View>
    </View>
  );
}
