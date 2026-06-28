import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionAttributes, Navbar } from '../../components';
import { Legion } from '../../api/legions/legionsApi';
import { useAuth } from '../../contexts/AuthContext';
import { LegionCard } from '../dashboard/components';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useLegions } from '../missions/model/queries/useLegions';
import { legionColorByIndex, legionColorById } from '../../utils/legionColors';

const BOOK_HEIGHT = 420;

export default function LegionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const userLegion = profileQuery.data?.legion ?? null;

  const legionsQuery = useLegions();
  const legions = legionsQuery.data ?? [];

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: insets.bottom + 32,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={legionsQuery.isFetching || profileQuery.isFetching}
            onRefresh={() => { legionsQuery.refetch(); profileQuery.refetch(); }}
            tintColor="#9E1B32"
          />
        }>
        {/* Legião do usuário no topo — mesma cor da listagem */}
        <LegionCard legion={userLegion} color={legionColorById(legions, userLegion?.id)} />

        {/* Estante: bookmarks acima + livro aberto / lombadas */}
        <View>
          <Text className="text-[15px] font-extrabold text-[#111] mb-3">{t('legions.allLegions')}</Text>

          {legionsQuery.isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator color="#8B1A2B" />
            </View>
          ) : (
            <LegionBookshelf legions={legions} userLegionId={userLegion?.id} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function LegionBookshelf({
  legions,
  userLegionId,
}: {
  legions: Legion[];
  userLegionId?: number;
}) {
  const [index, setIndex] = useState(0);
  const anim = useRef(new Animated.Value(1)).current;

  // Anima o livro aberto a cada troca.
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [index, anim]);

  if (legions.length === 0) return null;

  const colorOf = (i: number) => legionColorByIndex(i);

  return (
    <View>
      {/* Livro: aberto no selecionado, lombadas (fechadas) nos demais */}
      <View className="flex-row" style={{ height: BOOK_HEIGHT }}>
        {legions.map((legion, i) =>
          i === index ? (
            <Animated.View
              key={legion.id}
              className="flex-1 mx-1.5"
              style={{ opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
              <OpenBook
                legion={legion}
                color={colorOf(i)}
                isUserLegion={userLegionId === legion.id}
              />
            </Animated.View>
          ) : (
            <Spine
              key={legion.id}
              legion={legion}
              color={colorOf(i)}
              onPress={() => setIndex(i)}
            />
          ),
        )}
      </View>
    </View>
  );
}

// Livro fechado: lombada vertical estreita com o nome rotacionado.
function Spine({
  legion,
  color,
  onPress,
}: {
  legion: Legion;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={legion.name}
      className="rounded-[5px] mx-[3px] items-center justify-center overflow-hidden"
      style={{ width: 38, height: BOOK_HEIGHT, backgroundColor: color }}>
      <Text className="text-[15px] mb-2" style={{ position: 'absolute', top: 10 }}>
        🦅
      </Text>
      <Text
        numberOfLines={1}
        className="text-[12px] font-bold text-white"
        style={{ transform: [{ rotate: '90deg' }], width: BOOK_HEIGHT - 60, textAlign: 'center' }}>
        {legion.name}
      </Text>
    </TouchableOpacity>
  );
}

// Livro aberto: card vertical grande com imagem, nome e atributos.
function OpenBook({
  legion,
  color,
  isUserLegion,
}: {
  legion: Legion;
  color: string;
  isUserLegion: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View
      className="flex-1 bg-white rounded-[14px] border border-[#f0eded] overflow-hidden"
      style={{ borderTopWidth: 4, borderTopColor: color }}>
      {/* Cabeçalho fixo: imagem + nome */}
      <View className="items-center px-4 pt-4">
        <View className="w-28 h-28 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
          {legion.image_url ? (
            <Image
              source={{ uri: legion.image_url }}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-[44px]">🦅</Text>
          )}
        </View>

        <Text
          className="text-[20px] font-extrabold text-[#111] text-center mt-3"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {legion.name}
        </Text>

        {isUserLegion && (
          <View className="bg-laurel/15 rounded-full px-2.5 py-0.5 mt-1.5">
            <Text className="text-[11px] font-bold text-laurel">{t('legions.yourLegion')}</Text>
          </View>
        )}
      </View>

      {/* Scroll apenas no espaço dos boxes de atributos */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}>
        <LegionAttributes description={legion.description} variant="rows" />

        {/* Hint de ingresso — só para legiões que não são a do usuário */}
        {!isUserLegion && (
          <View className="mt-3 bg-[#f4eaea] border border-primary-500/20 rounded-[12px] px-3 py-2.5 flex-row items-start gap-2">
            <Text className="text-[14px]">⚔️</Text>
            <Text className="flex-1 text-[12px] text-[#7a1a2b] leading-[17px]">
              {t('legions.joinHint')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
