import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  name: string;
  avatarUrl: string | null;
  rankName: string;
  rankImage: string | null;
  memberSince: string;
  isOwnProfile: boolean;
  onOpenAvatar: () => void;
  onEditAvatar: () => void;
}

// Cabeçalho do perfil: avatar (+ editar), nome, chip de patente e "membro desde".
export default function ProfileIdentity({
  name,
  avatarUrl,
  rankName,
  rankImage,
  memberSince,
  isOwnProfile,
  onOpenAvatar,
  onEditAvatar,
}: Props) {
  const { t } = useTranslation();
  const initial = name.trim().charAt(0).toUpperCase();
  const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

  return (
    <View className="items-center pt-2">
      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenAvatar}
          className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80 }} resizeMode="cover" />
          ) : (
            <Text className="text-[30px] font-extrabold text-white">{initial}</Text>
          )}
        </TouchableOpacity>
        {/* Editar avatar — abre o seletor (possuídos + loja) */}
        {isOwnProfile && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onEditAvatar}
            accessibilityLabel={t('avatarPicker.editAvatar')}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-charcoal border-2 border-white items-center justify-center">
            <Text className="text-[11px]">✏️</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-[22px] font-extrabold text-charcoal mt-3" style={{ fontFamily: serif }}>
        {name}
      </Text>
      {/* Chip de patente */}
      <View className="flex-row items-center mt-1.5">
        {rankImage ? (
          <Image
            source={{ uri: rankImage }}
            style={{ width: 18, height: 18, marginRight: 5 }}
            resizeMode="contain"
          />
        ) : null}
        <Text className="text-[13px] font-semibold text-[#777]">{rankName}</Text>
      </View>
      <Text className="text-[12px] text-[#aaa] mt-1">
        {t('profile.memberSince')} {memberSince}
      </Text>
    </View>
  );
}
