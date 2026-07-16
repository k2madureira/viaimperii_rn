import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SectionLabel from '../../labels/sectionLabel';
import MasteryRow from '../../cards/masteryRow';

interface Props {
  mastery: Record<string, number>;
}

// Maestria por especialidade. Some quando o usuário ainda não pontuou.
export default function MasterySection({ mastery }: Props) {
  const { t } = useTranslation();
  const entries = Object.entries(mastery);
  if (entries.length === 0) return null;

  return (
    <View>
      <SectionLabel text={t('profile.masteryTitle')} />
      <View className="bg-white border border-[#f0eded] rounded-[16px] p-4" style={{ gap: 14 }}>
        {entries.map(([key, val]) => (
          <MasteryRow key={key} name={key} value={val} />
        ))}
      </View>
    </View>
  );
}
