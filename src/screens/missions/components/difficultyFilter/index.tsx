import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MissionDifficulty } from '../../../../api/missions/missionsApi';

interface Props {
  value: MissionDifficulty | null;
  onChange: (difficulty: MissionDifficulty | null) => void;
}

const DIFFICULTY_COLOR: Record<MissionDifficulty, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

const OPTIONS: MissionDifficulty[] = ['easy', 'medium', 'hard'];

// Filtro de nível visível (chips), consistente com o SpecialtyFilter ao lado.
// Antes era um ícone de funil escondido num dropdown — difícil de descobrir e
// sem mostrar qual nível estava ativo.
export default function DifficultyFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View className="gap-1.5">
      <Text className="text-[10px] font-bold text-[#aaa] uppercase tracking-[1px] px-0.5">
        {t('difficultyFilter.label')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
        <Chip
          label={t('difficultyFilter.any')}
          active={value === null}
          activeColor="#9E1B32"
          onPress={() => onChange(null)}
        />
        {OPTIONS.map((opt) => (
          <Chip
            key={opt}
            label={t(`missionItem.difficulty.${opt}`)}
            active={value === opt}
            activeColor={DIFFICULTY_COLOR[opt]}
            dotColor={DIFFICULTY_COLOR[opt]}
            onPress={() => onChange(opt)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  active,
  activeColor,
  dotColor,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  dotColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={active ? { backgroundColor: activeColor, borderColor: activeColor } : undefined}
      className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
        active ? '' : 'bg-white border-[#e0e0e0]'
      }`}>
      {dotColor && !active ? (
        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
      ) : null}
      <Text className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-[#666]'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
