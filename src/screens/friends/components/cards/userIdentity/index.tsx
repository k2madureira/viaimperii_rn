import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { FeedAuthor } from '../../../../../api/feed';

interface Props {
  user: FeedAuthor;
  // Ponto verde de presença — placeholder até o Chat entregar o stream (§Amigos §4).
  isOnline?: boolean;
  onPress?: () => void;
}

// Bloco de identidade reutilizado por amigos, pedidos e resultados de busca:
// avatar + nome + @handle + patente. Resolvido ao vivo pelo backend (nunca congelado).
export default function UserIdentity({ user, isOnline = false, onPress }: Props) {
  const avatarUrl = user.active_avatar?.url ?? user.image ?? null;
  const initial = user.name?.trim().charAt(0).toUpperCase() || '?';

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
        {isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#2F7A52] border-2 border-white" />
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
