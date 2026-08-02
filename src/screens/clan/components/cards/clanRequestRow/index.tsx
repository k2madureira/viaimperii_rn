import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanJoinRequestItem } from '../../../../../api/clan';

interface Props {
  request: ClanJoinRequestItem;
  pending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

// Linha da fila de solicitações (visão do oficial): solicitante + aceitar/recusar.
export default function ClanRequestRow({ request, pending, onAccept, onDecline }: Props) {
  const { t } = useTranslation();
  const aa = request.user.active_avatar;
  const avatarUrl = aa?.url ?? request.user.image ?? null;

  return (
    <View className="flex-row items-center py-2.5">
      <View className="w-10 h-10 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden mr-3">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" />
        ) : (
          <Text className="text-[16px] font-bold text-[#9E1B32]">
            {request.user.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        )}
      </View>

      <View className="flex-1 pr-2">
        <Text className="text-[14px] font-semibold text-[#111]" numberOfLines={1}>
          {request.user.name}
        </Text>
        {request.user.rank?.name ? (
          <Text className="text-[11px] text-[#888]" numberOfLines={1}>
            {request.user.rank.name}
          </Text>
        ) : null}
      </View>

      {pending ? (
        <ActivityIndicator size="small" color="#9E1B32" />
      ) : (
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-[#eef6f0] items-center justify-center mr-2"
            activeOpacity={0.75}
            accessibilityLabel={t('clan.requests.accept')}
            onPress={onAccept}>
            <Text className="text-[16px] text-[#2F7A52] font-bold leading-none">✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-[#f6eeee] items-center justify-center"
            activeOpacity={0.75}
            accessibilityLabel={t('clan.requests.decline')}
            onPress={onDecline}>
            <Text className="text-[16px] text-[#9E1B32] font-bold leading-none">✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
