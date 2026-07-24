import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { FriendRequestItem } from '../../../../../api/friendship';
import UserIdentity from '../userIdentity';

interface Props {
  item: FriendRequestItem;
  onOpenProfile: (userId: string) => void;
  onAccept: (item: FriendRequestItem) => void;
  onDecline: (item: FriendRequestItem) => void;
  pending?: boolean;
}

// Linha de um pedido. Recebido: aceitar / recusar. Enviado: rótulo "pendente".
export default function RequestCard({ item, onOpenProfile, onAccept, onDecline, pending }: Props) {
  const { t } = useTranslation();
  const incoming = item.direction === 'incoming';

  return (
    <View className="bg-white rounded-[16px] border border-[#f0eded] px-4 py-3">
      <View className="flex-row items-center">
        <UserIdentity user={item.user} onPress={() => onOpenProfile(item.user.id)} />
        {!incoming && (
          <View className="px-2.5 py-1 rounded-full bg-[#f4eaea]">
            <Text className="text-[11px] font-bold text-[#999]">{t('friends.requests.pending')}</Text>
          </View>
        )}
      </View>

      {incoming && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-[#f5f0f0]">
          {pending ? (
            <View className="flex-1 items-center py-2.5">
              <ActivityIndicator size="small" color="#8B1A2B" />
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => onAccept(item)}
                activeOpacity={0.85}
                className="flex-1 items-center py-2.5 rounded-[12px] bg-primary-500">
                <Text className="text-[13px] font-bold text-white">{t('friends.actions.accept')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDecline(item)}
                activeOpacity={0.85}
                className="flex-1 items-center py-2.5 rounded-[12px] bg-[#f4eaea]">
                <Text className="text-[13px] font-bold text-[#666]">{t('friends.actions.decline')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}
