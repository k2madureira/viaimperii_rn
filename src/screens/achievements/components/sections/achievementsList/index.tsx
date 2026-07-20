import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Achievement } from '../../../../../api/users';
import AchievementRow from '../../cards/achievementRow';

interface Props {
  unlocked: Achievement[];
  locked: Achievement[];
  refreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
}

// Lista: conquistas obtidas primeiro, depois as bloqueadas ("a desbloquear").
export default function AchievementsList({
  unlocked,
  locked,
  refreshing,
  onRefresh,
  bottomInset,
}: Props) {
  const { t } = useTranslation();
  const isEmpty = unlocked.length === 0 && locked.length === 0;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 24, gap: 10 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
      }>
      {unlocked.map((a) => (
        <AchievementRow key={a.id} achievement={a} unlocked />
      ))}
      {locked.length > 0 && (
        <Text className="text-[12px] font-bold text-[#aaa] uppercase tracking-[1px] mt-3 mb-1">
          {t('achievements.toUnlock')}
        </Text>
      )}
      {locked.map((a) => (
        <AchievementRow key={a.id} achievement={a} unlocked={false} />
      ))}
      {isEmpty && (
        <View className="py-12 items-center">
          <Text className="text-[14px] text-[#bbb]">{t('achievements.emptyFilter')}</Text>
        </View>
      )}
    </ScrollView>
  );
}
