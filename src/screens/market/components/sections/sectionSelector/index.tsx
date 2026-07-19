import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../../../../../constants/market';
import { MarketSection } from '../../icons';
import SectionTab from '../../buttons/sectionTab';

interface Props {
  value: MarketSection;
  onChange: (section: MarketSection) => void;
}

// ── Seletor de seção do mercado ───────────────────────────────────────────
export default function SectionSelector({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-row bg-[#efeaea] rounded-[12px] p-1">
      {SECTIONS.map((s) => (
        <SectionTab
          key={s}
          section={s}
          label={t(`market.sections.${s}`)}
          active={value === s}
          onPress={() => onChange(s)}
        />
      ))}
    </View>
  );
}
