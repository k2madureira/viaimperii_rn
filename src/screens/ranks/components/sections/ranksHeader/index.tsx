import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';

export default function RanksHeader() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="pr-3">
        <Text className="text-[24px] text-[#333] leading-none">‹</Text>
      </TouchableOpacity>
      <Text
        className="text-sm font-semibold text-[#111] tracking-[3px]"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
        {t('ranks.title')}
      </Text>
    </View>
  );
}
