import React from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionAttributes } from '../../components';
import { useLegionDetail } from '../dashboard/model/queries/useLegionDetail';
import { LegionCountry } from '../../api/legion/legionApi';
import { LegionStackParamList, LegionNavigationProp } from '../../navigation/LegionStack';
import { legionColorById } from '../../utils/legionColors';
import { useLegions } from '../missions/model/queries/useLegions';

type WarRoomRoute = RouteProp<LegionStackParamList, 'WarRoom'>;

export default function WarRoomScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<LegionNavigationProp>();
  const { params } = useRoute<WarRoomRoute>();
  const { legionId } = params;

  const detailQuery = useLegionDetail(legionId);
  const legion = detailQuery.data;

  const legionsQuery = useLegions();
  const color = legionColorById(legionsQuery.data, legionId) ?? '#8B1A2B';

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-5 pb-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} className="mr-3">
          <Text className="text-[22px]" style={{ color }}>←</Text>
        </TouchableOpacity>
        <Text
          className="text-sm font-semibold text-[#111] tracking-[3px] flex-1"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('legions.warRoom').toUpperCase()}
        </Text>
      </View>

      {detailQuery.isLoading ? (
        <WarRoomSkeleton />
      ) : detailQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-[13px] text-[#888] text-center">{t('legions.detailError')}</Text>
          <TouchableOpacity
            onPress={() => detailQuery.refetch()}
            className="bg-primary-500 rounded-[12px] px-5 py-2.5">
            <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : legion ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: insets.bottom + 32,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={detailQuery.isFetching}
              onRefresh={() => detailQuery.refetch()}
              tintColor={color}
            />
          }>
          {/* Legion Hero */}
          <View className="bg-white rounded-[16px] border border-[#f0eded] overflow-hidden"
            style={{ borderTopWidth: 4, borderTopColor: color }}>
            <View className="items-center px-5 pt-5 pb-4">
              <View
                className="w-28 h-28 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${color}10` }}>
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
                className="text-[24px] font-extrabold text-[#111] text-center mt-3"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {legion.name}
              </Text>

              {/* Members count */}
              <View className="flex-row items-center mt-2 gap-1.5">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <Text className="text-[13px] font-semibold" style={{ color }}>
                  {legion.total_users} {legion.total_users === 1 ? t('legions.member') : t('legions.membersPlural')}
                </Text>
              </View>
            </View>

            {/* Attributes */}
            <View className="px-4 pb-5">
              <LegionAttributes description={legion.description} variant="rows" />
            </View>
          </View>

          {/* Territories */}
          <View>
            <Text className="text-[15px] font-extrabold text-[#111] mb-3">
              {t('legions.territories')}
            </Text>

            {legion.countries.length === 0 ? (
              <View className="bg-white rounded-[14px] border border-[#f0eded] px-4 py-6 items-center">
                <Text className="text-[13px] text-[#888]">{t('legions.noTerritories')}</Text>
              </View>
            ) : (
              <View className="gap-3">
                {legion.countries.map((country) => (
                  <CountryCard key={country.id} country={country} color={color} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function CountryCard({ country, color }: { country: LegionCountry; color: string }) {
  const { t } = useTranslation();
  const totalProvinceUsers = country.provinces.reduce((sum, p) => sum + p.quantityUsers, 0);

  return (
    <View className="bg-white rounded-[14px] border border-[#f0eded] overflow-hidden">
      {/* Country header */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#f5f2f2]">
        {country.icon_url ? (
          <Image
            source={{ uri: country.icon_url }}
            style={{ width: 24, height: 24, marginRight: 10 }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-[16px] mr-2.5">🏛</Text>
        )}
        <Text className="text-[14px] font-bold text-[#111] flex-1">{country.name}</Text>
        <Text className="text-[11px] text-[#888]">
          {country.provinces.length} {country.provinces.length === 1 ? t('legions.province') : t('legions.provinces')}
        </Text>
      </View>

      {/* Provinces */}
      {country.provinces.map((province) => (
        <View
          key={province.id}
          className="flex-row items-center px-4 py-2.5 border-b border-[#faf7f7]">
          <View className="flex-1">
            <Text className="text-[13px] text-[#333]">{province.name}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${color}15` }}>
              <Text className="text-[11px] font-semibold" style={{ color }}>
                {province.quantityUsers} {t('legions.users')}
              </Text>
            </View>
          </View>
        </View>
      ))}

      {/* Footer total */}
      {country.provinces.length > 1 && (
        <View className="flex-row items-center justify-end px-4 py-2" style={{ backgroundColor: `${color}08` }}>
          <Text className="text-[11px] font-bold" style={{ color }}>
            {totalProvinceUsers} {t('legions.users')}
          </Text>
        </View>
      )}
    </View>
  );
}

function WarRoomSkeleton() {
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
    <View className="px-5 pt-6 gap-5">
      <Animated.View style={{ opacity: pulseAnim }}>
        <View className="bg-white rounded-[16px] border border-[#f0eded] p-5 items-center gap-4">
          <View className="w-28 h-28 rounded-full bg-[#e8e4e4]" />
          <View className="bg-[#e8e4e4] rounded-full h-6 w-3/5" />
          <View className="bg-[#e8e4e4] rounded-full h-4 w-2/5" />
          <View className="w-full gap-2 mt-2">
            <View className="bg-[#e8e4e4] rounded-[10px] h-4 w-full" />
            <View className="bg-[#e8e4e4] rounded-[10px] h-4 w-4/5" />
          </View>
          <View className="flex-row gap-2 w-full">
            <View className="flex-1 bg-[#e8e4e4] rounded-[14px] h-20" />
            <View className="flex-1 bg-[#e8e4e4] rounded-[14px] h-20" />
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: pulseAnim }}>
        <View className="bg-[#e8e4e4] rounded-full h-5 w-1/3 mb-3" />
        <View className="bg-white rounded-[14px] border border-[#f0eded] p-4 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="w-6 h-6 rounded-full bg-[#e8e4e4]" />
            <View className="bg-[#e8e4e4] rounded-full h-4 flex-1" />
          </View>
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-center gap-3 pl-9">
              <View className="bg-[#e8e4e4] rounded-full h-3 flex-1" />
              <View className="bg-[#e8e4e4] rounded-full h-3 w-16" />
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
