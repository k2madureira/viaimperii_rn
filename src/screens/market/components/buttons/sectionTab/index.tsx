import React from 'react';
import { TouchableOpacity } from 'react-native';
import Text from '../../../../../components/text';
import { MarketSection, MarketSectionIcon, SECTION_COLOR } from '../../icons';

interface Props {
  section: MarketSection;
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function SectionTab({ section, label, active, onPress }: Props) {
  const color = SECTION_COLOR[section];
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}
      style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
      {/* Ícone sempre colorido pelo tema da seção — adiciona cor mesmo inativo. */}
      <MarketSectionIcon section={section} size={16} color={active ? color : `${color}99`} />
      <Text className="text-[13px] font-bold" style={{ color: active ? color : '#888' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
