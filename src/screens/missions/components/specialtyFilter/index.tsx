import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { Specialty } from '../../../../api/specialties/specialtiesApi';

interface Props {
  specialties: Specialty[];
  value: number | null;
  onChange: (specialtyId: number | null) => void;
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-white border-[#e0e0e0]'}`}>
      <Text className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-[#666]'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SpecialtyFilter({ specialties, value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
      <Chip label="Todas" active={value === null} onPress={() => onChange(null)} />
      {specialties.map((s) => (
        <Chip
          key={s.id}
          label={s.name}
          active={value === s.id}
          onPress={() => onChange(s.id)}
        />
      ))}
    </ScrollView>
  );
}
