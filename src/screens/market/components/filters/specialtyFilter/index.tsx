import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

export interface SpecialtyOption {
  id: number;
  name: string;
  color: string;
}

interface Props {
  options: SpecialtyOption[];
  value: number | null;
  onChange: (id: number | null) => void;
}

// Filtro por especialidade (chips), cada uma com a cor da própria especialidade.
// As opções seguem a trilha do usuário (derivadas das profissões visíveis).
export default function SpecialtyFilter({ options, value, onChange }: Props) {
  const { t } = useTranslation();
  if (options.length <= 1) return null; // nada a filtrar

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
      <Chip
        label={t('market.professions.allSpecialties')}
        color="#5B6B7A"
        active={value === null}
        onPress={() => onChange(null)}
      />
      {options.map((o) => (
        <Chip
          key={o.id}
          label={o.name}
          color={o.color}
          active={value === o.id}
          onPress={() => onChange(o.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={active ? { backgroundColor: color, borderColor: color } : { borderColor: `${color}55` }}
      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${active ? '' : 'bg-white'}`}>
      {!active && <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      <Text className="text-[12px] font-semibold" style={{ color: active ? '#fff' : '#666' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
