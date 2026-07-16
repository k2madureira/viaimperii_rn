import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

export default function RewardsHeader() {
  const { t } = useTranslation();
  return (
    <View>
      <Text className="text-[22px] font-extrabold text-charcoal">{t('rewards.title')}</Text>
      <Text className="text-[13px] text-[#888] mt-1 leading-[18px]">{t('rewards.subtitle')}</Text>
    </View>
  );
}
