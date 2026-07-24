import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { LeaderboardViewer } from '../../../../../api/leaderboards';

// Linha fixada do próprio viewer ("Você — #14") quando ele está fora do top-N
// visível. Se `viewer.position === null`, ele ainda não pontuou na semana.
interface Props {
  viewer: LeaderboardViewer;
}

export default function ViewerPin({ viewer }: Props) {
  const { t } = useTranslation();
  const scored = viewer.position != null;

  return (
    <View
      className="flex-row items-center rounded-[14px] px-3 py-3 border"
      style={{ backgroundColor: '#8B1A2B', borderColor: '#8B1A2B', gap: 10 }}>
      <View className="w-8 items-center">
        <Text className="text-[13px] font-extrabold text-white">
          {scored ? `#${viewer.position}` : '—'}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-bold text-white">{t('leaderboards.youRow')}</Text>
        <Text className="text-[10.5px] text-white/70">
          {scored ? t('leaderboards.xp', { xp: viewer.xp }) : t('leaderboards.notScored')}
        </Text>
      </View>
    </View>
  );
}
