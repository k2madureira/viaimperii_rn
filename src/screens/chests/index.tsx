import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Text from '../../components/text';
import ScreenContainer from '../../components/screenContainer';
import { Navbar } from '../../components';
import { ChestIcon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import { useChests } from './model/queries/useChests';
import { ChestCard } from './components';

export default function ChestsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();

  const chestsQuery = useChests(!!user);
  const data = chestsQuery.data;
  const items = data?.items ?? [];
  const summary = data?.summary;

  return (
    <ScreenContainer>
      <Navbar />

      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-1"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}>
          <Text className="text-[24px] text-[#111] leading-none">‹</Text>
        </TouchableOpacity>
        <View className="flex-row items-center ml-1 flex-1">
          <ChestIcon size={20} color="#8B1A2B" />
          <Text className="text-[16px] font-bold text-[#111] ml-2">{t('chests.title')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('RedeemCode')}
          activeOpacity={0.8}
          className="bg-[#f4eaea] rounded-full px-3 py-1.5">
          <Text className="text-[12px] font-semibold text-primary-500">
            {t('chests.redeemCodeCta')}
          </Text>
        </TouchableOpacity>
      </View>

      {chestsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : chestsQuery.isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[13px] text-[#999] text-center">{t('chests.error')}</Text>
          <TouchableOpacity
            onPress={() => chestsQuery.refetch()}
            className="mt-4 bg-primary-500 rounded-[10px] px-5 py-2.5">
            <Text className="text-white font-semibold text-[13px]">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={chestsQuery.isFetching}
              onRefresh={() => chestsQuery.refetch()}
              tintColor="#9E1B32"
            />
          }>
          {summary && summary.total > 0 ? (
            <View className="flex-row gap-2 mb-1">
              <View className="bg-[#f6f1e7] border border-[#e6d9bf] rounded-full px-3 py-1">
                <Text className="text-[12px] font-semibold text-[#8B1A2B]">
                  {t('chests.summaryUnopened', { count: summary.unopened })}
                </Text>
              </View>
              <View className="bg-[#f2f2f2] rounded-full px-3 py-1">
                <Text className="text-[12px] font-semibold text-[#999]">
                  {t('chests.summaryOpened', { count: summary.opened })}
                </Text>
              </View>
            </View>
          ) : null}

          {items.length === 0 ? (
            <View className="items-center pt-16 px-8">
              <ChestIcon size={40} color="#ccc" />
              <Text className="text-[13px] text-[#999] text-center mt-4 leading-[19px]">
                {t('chests.empty')}
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <ChestCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('ChestDetail', { userChestId: item.id })}
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
