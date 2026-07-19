import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Specialty } from '../../../../../api/specialties/specialtiesApi';

interface Props {
  specialties: Specialty[];
  value: number | null;
  onChange: (specialtyId: number | null) => void;
}

const ALL_COLOR = '#5B6B7A';

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
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={active ? { backgroundColor: color, borderColor: color } : { borderColor: `${color}55` }}
      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${active ? '' : 'bg-white'}`}>
      {!active && <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      <Text className="text-[12px] font-semibold" style={{ color: active ? '#fff' : '#666' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SpecialtyFilter({ specialties, value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
      <Chip
        label={t('specialtyFilter.all')}
        color={ALL_COLOR}
        active={value === null}
        onPress={() => onChange(null)}
      />
      {specialties.map((s) => (
        <Chip
          key={s.id}
          label={s.name}
          color={s.color ?? '#6B1221'}
          active={value === s.id}
          onPress={() => onChange(s.id)}
        />
      ))}
    </ScrollView>
  );
}
