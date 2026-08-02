import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { FriendItem } from '../../../../../api/friendship';
import UserIdentity from '../userIdentity';

interface Props {
  item: FriendItem;
  onPress: () => void;
  unreadCount?: number;
  lastPreview?: string | null;
}

// Linha da aba Chat (inbox): tocar abre a tela dedicada da conversa (estilo
// Instagram). Mostra preview da última mensagem e contador de não-lidas.
export default function FriendCard({ item, onPress, unreadCount = 0, lastPreview }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-[16px] border border-[#f0eded] px-4 py-3">
      <View className="flex-row items-center">
        <UserIdentity user={item.user} presenceStatus={item.presence_status} />

        {unreadCount > 0 && (
          <View className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 items-center justify-center ml-1">
            <Text className="text-[11px] font-bold text-white" maxFontSizeMultiplier={0}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      {lastPreview ? (
        <Text
          className="text-[12px] text-[#9a8f8f] mt-1 ml-14"
          numberOfLines={1}
          maxFontSizeMultiplier={0}>
          {lastPreview}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
