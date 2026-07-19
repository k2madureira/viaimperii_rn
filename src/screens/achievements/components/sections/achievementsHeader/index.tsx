import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

interface Props {
  unlocked: number;
  total: number;
}

export default function AchievementsHeader({ unlocked, total }: Props) {
  const { t } = useTranslation();
  return (
    <View className="px-5 pt-4 pb-1">
      <Text className="text-[13px] text-[#888]">
        {t('achievements.progress', { unlocked, total })}
      </Text>
    </View>
  );
}
