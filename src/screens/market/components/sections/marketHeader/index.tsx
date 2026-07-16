import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function MarketHeader() {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="text-[22px] font-extrabold text-charcoal">{t('market.title')}</Text>
      <Text className="text-[13px] text-[#888] mt-1 leading-[18px]">{t('market.subtitle')}</Text>
    </View>
  );
}
