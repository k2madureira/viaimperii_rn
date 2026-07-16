import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSpecialties } from '../../../../missions/model/queries/useSpecialties';
import FilterChip from '../../buttons/filterChip';

interface Props {
  value: number | null;
  onChange: (specialtyId: number | null) => void;
}

// Filtro horizontal por especialidade. Some quando não há especialidades.
export default function SpecialtyFilterBar({ value, onChange }: Props) {
  const { t } = useTranslation();
  const specialtiesQuery = useSpecialties();
  const specialties = specialtiesQuery.data ?? [];

  if (specialties.length === 0) return null;

  return (
    <View style={{ height: 48 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center', gap: 8, height: 48 }}>
        <FilterChip
          label={t('achievements.filterAll')}
          active={value == null}
          onPress={() => onChange(null)}
        />
        {specialties.map((s) => (
          <FilterChip
            key={s.id}
            label={s.name}
            active={value === s.id}
            onPress={() => onChange(value === s.id ? null : s.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
