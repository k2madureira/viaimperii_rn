import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mission } from '../../../../../api/missions/missionsApi';
import { StatsPeriod, UserActivitySummary, UserStats } from '../../../../../api/users/userApi';
import StatsFilter from '../../filters/statsFilter';
import UserSummary from '../../cards/userSummary';
import PeriodStats from '../../cards/periodStats';
import MissionSkeleton from '../../skeletons/missionSkeleton';
import EmptyBox from '../../feedback/emptyBox';
import ErrorBox from '../../feedback/errorBox';

interface Props {
  period: StatsPeriod;
  onChangePeriod: (period: StatsPeriod) => void;
  summary?: UserActivitySummary;
  summaryLoading: boolean;
  stats?: UserStats;
  statsLoading: boolean;
  historyLoading: boolean;
  historyError: boolean;
  historyMissions: Mission[];
  renderList: (list: Mission[]) => React.ReactNode;
}

// Aba "Progresso": resumo do usuário + estatísticas + histórico.
export default function ProgressSection({
  period,
  onChangePeriod,
  summary,
  summaryLoading,
  stats,
  statsLoading,
  historyLoading,
  historyError,
  historyMissions,
  renderList,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <StatsFilter value={period} onChange={onChangePeriod} />
      <UserSummary summary={summary} isLoading={summaryLoading} />
      <PeriodStats stats={stats} isLoading={statsLoading} />

      <View className="bg-white border border-[#f0eded] rounded-[20px] p-3 gap-3">
        <Text className="text-[14px] font-extrabold text-charcoal px-1 pt-1">
          {t('missions.historyTitle')}
        </Text>
        {historyLoading ? (
          <MissionSkeleton />
        ) : historyError ? (
          <ErrorBox text={t('missions.errorHistory')} />
        ) : historyMissions.length === 0 ? (
          <EmptyBox text={t('missions.emptyHistory')} emoji="📜" />
        ) : (
          renderList(historyMissions)
        )}
      </View>
    </>
  );
}
