import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { LoginStreak } from '../../../../../api/auth/authApi';
import NotificationsButton from '../../buttons/notificationsButton';
import RewardsButton from '../../buttons/rewardsButton';
import StreakButton from '../../buttons/streakButton';

interface Props {
  firstName: string;
  rankName: string;
  legionName: string | null;
  streak: LoginStreak | null;
  onOpenProfile: () => void;
}

// 1 — HEADER: saudação (abre o perfil) + atalhos de recompensas/ofensiva/notificações.
export default function DashboardHeader({
  firstName,
  rankName,
  legionName,
  streak,
  onOpenProfile,
}: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between">
      <TouchableOpacity
        className="flex-1"
        activeOpacity={0.7}
        accessibilityRole="button"
        onPress={onOpenProfile}>
        <Text
          className="text-[26px] font-extrabold text-charcoal"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('dashboard.greeting', { name: firstName })}
        </Text>
        <Text className="text-[13px] text-[#777] mt-0.5" numberOfLines={1}>
          {rankName}
          {legionName ? ` • ${legionName}` : ''}
        </Text>
      </TouchableOpacity>
      <View className="flex-row items-center gap-3">
        <RewardsButton />
        {streak && streak.current_streak > 0 && <StreakButton streak={streak} />}
        <NotificationsButton />
      </View>
    </View>
  );
}
