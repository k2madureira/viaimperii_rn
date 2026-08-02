import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { FeedAuthor } from '../../../../../api/feed';
import { PresenceStatus } from '../../../../../api/friendship';

// Cor do ponto de presença por status (§Amigos §4). `offline` não acende ponto.
const PRESENCE_COLOR: Record<Exclude<PresenceStatus, 'offline'>, string> = {
  available: '#2F7A52', // verde — disponível
  busy: '#9E1B32', // vermelho — ocupado
  away: '#D4AF37', // âmbar — ausente
};

interface Props {
  user: FeedAuthor;
  // Presença que este viewer enxerga (§Amigos §4). `offline` (ou undefined) = sem ponto.
  presenceStatus?: PresenceStatus;
  onPress?: () => void;
}

// Bloco de identidade reutilizado por amigos, pedidos e resultados de busca:
// avatar + nome + @handle + patente. Resolvido ao vivo pelo backend (nunca congelado).
export default function UserIdentity({ user, presenceStatus, onPress }: Props) {
  const avatarUrl = user.active_avatar?.url ?? user.image ?? null;
  const initial = user.name?.trim().charAt(0).toUpperCase() || '?';
  const dotColor =
    presenceStatus && presenceStatus !== 'offline' ? PRESENCE_COLOR[presenceStatus] : null;

  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 flex-1"
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      onPress={onPress}>
      <View>
        <View className="w-11 h-11 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
          ) : (
            <Text className="text-[16px] font-bold text-primary-500">{initial}</Text>
          )}
        </View>
        {dotColor && (
          <View
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: dotColor }}
          />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[14px] font-bold text-charcoal" numberOfLines={1}>
          {user.name}
        </Text>
        {user.handle ? (
          <Text className="text-[12px] text-[#888]" numberOfLines={1}>
            @{user.handle}
          </Text>
        ) : user.rank?.name ? (
          <Text className="text-[12px] text-[#888]" numberOfLines={1}>
            {user.rank.name}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
