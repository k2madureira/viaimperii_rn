import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GetUserResponse, UserStats } from '../../../../../api/users';
import SectionLabel from '../../labels/sectionLabel';
import StatCard from '../../cards/statCard';

interface Props {
  data: GetUserResponse | undefined;
  stats: UserStats | undefined;
  loading: boolean;
}

// Grid de counts agregados (all-time).
export default function ProfileStats({ data, stats, loading }: Props) {
  const { t } = useTranslation();
  return (
    <View>
      <SectionLabel text={t('profile.statsTitle')} />
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        <StatCard
          value={stats?.missions_completed_total ?? data?.user.completed_missions?.length ?? 0}
          label={t('profile.stats.missionsCompleted')}
          loading={loading}
        />
        <StatCard
          value={stats?.achievements_unlocked ?? data?.achievements?.length ?? 0}
          label={t('profile.stats.achievements')}
          loading={loading}
        />
        <StatCard
          value={stats?.medals_count ?? data?.user.medals?.length ?? 0}
          label={t('profile.stats.medals')}
          loading={loading}
        />
        <StatCard
          value={stats?.campaigns_completed ?? data?.user.completed_campaigns?.length ?? 0}
          label={t('profile.stats.campaigns')}
          loading={loading}
        />
        <StatCard value={stats?.ranks_gained ?? 0} label={t('profile.stats.ranksGained')} loading={loading} />
        <StatCard value={stats?.active_days ?? 0} label={t('profile.stats.activeDays')} loading={loading} />
      </View>
    </View>
  );
}
