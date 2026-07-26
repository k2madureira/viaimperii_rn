import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/screenContainer';
import Text from '../../components/text';
import { HomeNavigationProp, HomeStackParamList } from '../../navigation/HomeStack';
import { PresenceStatus } from '../../api/friendship';
import { ChatThread } from '../friends/components/sections';

// Cor do ponto de presença que este viewer enxerga (§Amigos §4).
const PRESENCE_COLOR: Partial<Record<PresenceStatus, string>> = {
  available: '#2F7A52',
  busy: '#9E1B32',
  away: '#D4AF37',
};

// Tela dedicada de uma conversa (DM), estilo Instagram: header do interlocutor +
// histórico + composer. O corpo (ChatThread) é reusado da tela de Amigos/Chat.
export default function DmConversationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigationProp>();
  const route = useRoute<RouteProp<HomeStackParamList, 'DmConversation'>>();
  const { userId, name, avatarUrl, presenceStatus } = route.params;

  const initial = name?.trim().charAt(0).toUpperCase() || '?';
  const dotColor =
    presenceStatus && presenceStatus !== 'offline' ? PRESENCE_COLOR[presenceStatus] : null;

  return (
    <ScreenContainer>
      {/* Header do interlocutor (abaixo do topo; a Navbar padrão não cabe aqui). */}
      <View className="flex-row items-center px-2 py-2 border-b border-[#f0eded] bg-white">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          className="w-9 h-9 items-center justify-center">
          <Text className="text-[28px] text-[#111] leading-none">‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile', { userId })}
          className="flex-row items-center flex-1 ml-1">
          <View className="w-9 h-9 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
            ) : (
              <Text className="text-[14px] font-bold text-primary-500">{initial}</Text>
            )}
          </View>
          <View className="ml-2 flex-1">
            <Text className="text-[15px] font-bold text-charcoal" numberOfLines={1}>
              {name}
            </Text>
            {dotColor && (
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                <Text className="text-[11px] text-[#888]" numberOfLines={1}>
                  {t(`presence.${presenceStatus}`)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ChatThread friendUserId={userId} bottomInset={insets.bottom} />
    </ScreenContainer>
  );
}
