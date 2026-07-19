import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Mission, MissionDifficulty } from '../../../../../../api/missions/missionsApi';
import { ProfessionTheme } from '../../../../../../utils/color';
import { DifficultyFilter, EmptyBox, ErrorBox } from '../../../../components';
import { Loading, StatusTab } from '../..';

type Tab = 'available' | 'inprogress';

interface Props {
  theme: ProfessionTheme;
  isBelowRecruitIV: boolean;
  tab: Tab;
  onChangeTab: (tab: Tab) => void;
  difficultyFilter: MissionDifficulty | null;
  onChangeDifficulty: (difficulty: MissionDifficulty | null) => void;
  availableLoading: boolean;
  availableError: boolean;
  availableMissions: Mission[];
  inProgressLoading: boolean;
  inProgressError: boolean;
  inProgressMissions: Mission[];
  renderItem: (m: Mission) => React.ReactNode;
}

// ── Box: abas de status (Disponíveis/Em andamento) + conteúdo ────────────
export default function ProfessionMissionsBox({
  theme,
  isBelowRecruitIV,
  tab,
  onChangeTab,
  difficultyFilter,
  onChangeDifficulty,
  availableLoading,
  availableError,
  availableMissions,
  inProgressLoading,
  inProgressError,
  inProgressMissions,
  renderItem,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
      <View className="px-3 pt-3">
        <View className="flex-row bg-[#f4f4f4] rounded-[12px] p-1">
          <StatusTab
            label={t('missionsTabs.available')}
            active={tab === 'available'}
            color={theme.base}
            onPress={() => onChangeTab('available')}
          />
          <StatusTab
            label={t('missionsTabs.inprogress')}
            active={tab === 'inprogress'}
            color={theme.base}
            badge={inProgressMissions.length}
            onPress={() => onChangeTab('inprogress')}
          />
        </View>
      </View>

      <View className="p-3 gap-3">
        {isBelowRecruitIV && (
          <View
            className="rounded-[12px] px-4 py-3 flex-row items-center gap-2"
            style={{ backgroundColor: theme.faint, borderWidth: 1, borderColor: theme.border }}>
            <Text className="text-[14px]">⚔️</Text>
            <Text className="flex-1 text-[12px] leading-[18px]" style={{ color: theme.header }}>
              {t('professionMissions.belowRecruit')}
            </Text>
          </View>
        )}

        {tab === 'available' ? (
          <>
            {!isBelowRecruitIV && (
              <DifficultyFilter value={difficultyFilter} onChange={onChangeDifficulty} />
            )}
            {availableLoading ? (
              <Loading color={theme.base} />
            ) : availableError ? (
              <ErrorBox text={t('missions.errorAvailable')} />
            ) : availableMissions.length === 0 ? (
              <EmptyBox text={t('professionMissions.emptyAvailable')} emoji="⚔️" />
            ) : (
              <View className="gap-3">{availableMissions.map(renderItem)}</View>
            )}
          </>
        ) : (
          <>
            {inProgressLoading ? (
              <Loading color={theme.base} />
            ) : inProgressError ? (
              <ErrorBox text={t('missions.errorInProgress')} />
            ) : inProgressMissions.length === 0 ? (
              <EmptyBox text={t('missions.emptyInProgress')} emoji="🛡️" />
            ) : (
              <View className="gap-3">{inProgressMissions.map(renderItem)}</View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
