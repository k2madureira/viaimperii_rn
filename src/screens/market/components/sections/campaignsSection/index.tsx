import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MarketSectionIcon, SECTION_COLOR } from '../../icons';

// Campanhas — em breve.
export default function CampaignsSection() {
  const { t } = useTranslation();
  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] py-12 items-center px-6">
      <View
        className="w-14 h-14 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${SECTION_COLOR.campaigns}14` }}>
        <MarketSectionIcon section="campaigns" size={28} color={SECTION_COLOR.campaigns} />
      </View>
      <Text className="text-[14px] font-bold text-charcoal text-center mt-3">
        {t('market.campaigns.soonTitle')}
      </Text>
      <Text className="text-[12px] text-[#999] text-center mt-1 leading-[17px]">
        {t('market.campaigns.soonBody')}
      </Text>
    </View>
  );
}
