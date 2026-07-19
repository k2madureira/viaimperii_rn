import React from 'react';
import { TouchableOpacity } from 'react-native';
import Text from '../../../../../components/text';

// Aba de escopo do placar (Global / Legião / Província / Ofício). Ativo = pílula
// vinho preenchida; inativo = contorno claro. Mesmo espírito do `typeTab`/`sectionTab`.
interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function ScopeTab({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`px-3.5 py-2 rounded-full ${
        active ? 'bg-primary-500' : 'bg-white border border-[#e6dede]'
      }`}>
      <Text
        className="text-[12.5px] font-bold"
        style={{ color: active ? '#fff' : '#8a7f7f' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
