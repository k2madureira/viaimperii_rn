import React, { useCallback, useState } from 'react';
import {
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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionAttributes, Navbar } from '../../components';
import { Legion } from '../../api/legions/legionsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useLegions } from '../missions/model/queries/useLegions';
import { legionColorByIndex } from '../../utils/legionColors';
import { LegionNavigationProp } from '../../navigation/LegionStack';

export default function LegionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const userLegion = profileQuery.data?.legion ?? null;

  const legionsQuery = useLegions();
  const legions = legionsQuery.data ?? [];

  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const totalImages = legions.filter((l) => l.image_url).length;

  const handleImageLoad = useCallback(() => {
    setLoadedCount((prev) => {
      const next = prev + 1;
      if (next >= totalImages && totalImages > 0) setAllImagesLoaded(true);
      return next;
    });
  }, [totalImages]);

  const showSkeleton = legionsQuery.isLoading || (!allImagesLoaded && legions.length > 0);

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
            onRefresh={() => {
              setLoadedCount(0);
              setAllImagesLoaded(false);
              legionsQuery.refetch();
              profileQuery.refetch();
            }}
            tintColor="#9E1B32"
          />
        }>

        {showSkeleton && <LegionSkeleton />}

        {/* Preload images offscreen */}
        {!allImagesLoaded && legions.length > 0 && (
          <View style={{ position: 'absolute', opacity: 0, width: 1, height: 1, overflow: 'hidden' }}>
            {legions.map((l) =>
              l.image_url ? (
                <Image
                  key={l.id}
                  source={{ uri: l.image_url }}
                  style={{ width: 1, height: 1 }}
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              ) : null,
            )}
          </View>
        )}

        {!showSkeleton && legionsQuery.isError && (
          <View className="py-10 items-center gap-3">
            <Text className="text-[13px] text-[#888] text-center">{t('legions.loadError')}</Text>
            <TouchableOpacity
              onPress={() => legionsQuery.refetch()}
              className="bg-primary-500 rounded-[12px] px-5 py-2.5">
              <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showSkeleton && !legionsQuery.isError && legions.length > 0 && (
          <LegionBadges
            legions={legions}
            userLegionId={userLegion?.id ?? null}
          />
        )}
      </ScrollView>
    </View>
  );
}

function LegionSkeleton() {
  const pulseAnim = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View className="gap-4">
      {/* Badge row skeleton */}
      <Animated.View style={{ opacity: pulseAnim }} className="flex-row gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="bg-[#e8e4e4] rounded-full" style={{ width: 60, height: 60 }} />
        ))}
      </Animated.View>

      {/* Card skeleton */}
      <Animated.View style={{ opacity: pulseAnim }}>
        <View className="bg-white rounded-[16px] border border-[#f0eded] p-5 gap-4">
          <View className="flex-row items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-[#e8e4e4]" />
            <View className="flex-1 gap-2">
              <View className="bg-[#e8e4e4] rounded-full h-5 w-3/4" />
              <View className="bg-[#e8e4e4] rounded-full h-3 w-1/2" />
            </View>
          </View>
          <View className="gap-2">
            <View className="bg-[#e8e4e4] rounded-[10px] h-4 w-full" />
            <View className="bg-[#e8e4e4] rounded-[10px] h-4 w-5/6" />
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 bg-[#e8e4e4] rounded-[14px] h-20" />
            <View className="flex-1 bg-[#e8e4e4] rounded-[14px] h-20" />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function LegionBadges({
  legions,
  userLegionId,
}: {
  legions: Legion[];
  userLegionId: number | null;
}) {
  const [selectedId, setSelectedId] = useState<number>(legions[0]?.id ?? 0);
  const selected = legions.find((l) => l.id === selectedId) ?? legions[0];
  const selectedIndex = legions.findIndex((l) => l.id === selectedId);

  return (
    <View className="gap-4">
      {/* Badge row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
        {legions.map((legion, i) => {
          const isActive = legion.id === selectedId;
          const color = legionColorByIndex(i);
          const isUserLegion = legion.id === userLegionId;
          return (
            <TouchableOpacity
              key={legion.id}
              activeOpacity={0.8}
              onPress={() => setSelectedId(legion.id)}
              className="items-center"
              style={{ width: 64 }}>
              <View
                className="w-[56px] h-[56px] rounded-full items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: isActive ? color : '#f5f2f2',
                  borderWidth: isUserLegion ? 2.5 : isActive ? 2 : 0,
                  borderColor: isUserLegion ? '#2F7A52' : color,
                }}>
                {legion.image_url ? (
                  <Image
                    source={{ uri: legion.image_url }}
                    style={{
                      width: 40,
                      height: 40,
                      tintColor: isActive ? '#fff' : color,
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-[22px]">🦅</Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                className="text-[10px] mt-1 text-center font-semibold"
                style={{ color: isActive ? color : '#888' }}>
                {legion.name.split(' ').pop()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Expanded card */}
      {selected && (
        <LegionExpandedCard
          legion={selected}
          color={legionColorByIndex(selectedIndex)}
          isUserLegion={selected.id === userLegionId}
        />
      )}
    </View>
  );
}

function LegionExpandedCard({
  legion,
  color,
  isUserLegion,
}: {
  legion: Legion;
  color: string;
  isUserLegion: boolean;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation<LegionNavigationProp>();

  return (
    <View
      className="bg-white rounded-[16px] border border-[#f0eded] overflow-hidden"
      style={{ borderTopWidth: 4, borderTopColor: color }}>
      {/* Header */}
      <View className="items-center px-5 pt-5">
        <View
          className="w-24 h-24 rounded-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: `${color}10` }}>
          {legion.image_url ? (
            <Image
              source={{ uri: legion.image_url }}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-[40px]">🦅</Text>
          )}
        </View>

        <Text
          className="text-[22px] font-extrabold text-[#111] text-center mt-3"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {legion.name}
        </Text>

        {isUserLegion && (
          <View className="bg-laurel/15 rounded-full px-2.5 py-0.5 mt-1.5">
            <Text className="text-[11px] font-bold text-laurel">{t('legions.yourLegion')}</Text>
          </View>
        )}
      </View>

      {/* Attributes */}
      <View className="px-4 pb-4">
        <LegionAttributes description={legion.description} variant="rows" />

        {isUserLegion ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('WarRoom', { legionId: legion.id })}
            className="mt-4 rounded-[12px] py-3 items-center"
            style={{ backgroundColor: color }}>
            <Text className="text-[14px] font-bold text-white">
              ⚔️  {t('legions.enterWarRoom')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="mt-3 bg-[#f4eaea] border border-primary-500/20 rounded-[12px] px-3 py-2.5 flex-row items-start gap-2">
            <Text className="text-[14px]">⚔️</Text>
            <Text className="flex-1 text-[12px] text-[#7a1a2b] leading-[17px]">
              {t('legions.joinHint')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
