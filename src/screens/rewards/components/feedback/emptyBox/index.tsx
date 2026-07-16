import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function EmptyBox() {
  const { t } = useTranslation();
  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] py-12 items-center px-6">
      <Text className="text-[28px] mb-2">🎁</Text>
      <Text className="text-[13px] text-[#999] text-center">{t('rewards.empty')}</Text>
    </View>
  );
}
