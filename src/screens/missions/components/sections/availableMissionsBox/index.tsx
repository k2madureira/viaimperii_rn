import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Mission, MissionDifficulty } from '../../../../../api/missions';
import { Specialty } from '../../../../../api/specialties';
import SpecialtyFilter from '../../filters/specialtyFilter';
import DifficultyFilter from '../../filters/difficultyFilter';
import MissionSkeleton from '../../skeletons/missionSkeleton';
import EmptyBox from '../../feedback/emptyBox';
import ErrorBox from '../../feedback/errorBox';

interface Props {
  isRecommended: boolean;
  onToggleMode: () => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  hasActiveFilter: boolean;
  isBelowRecruitIV: boolean;
  unlockRankName: string;
  filteredSpecialties: Specialty[];
  specialtyId: number | null;
  onChangeSpecialty: (specialtyId: number | null) => void;
  difficultyFilter: MissionDifficulty | null;
  onChangeDifficulty: (difficulty: MissionDifficulty | null) => void;
  recommendedQuery: { isLoading: boolean; isError: boolean };
  recommendedMissions: Mission[];
  availableQuery: { isLoading: boolean; isError: boolean };
  availableMissions: Mission[];
  renderList: (list: Mission[]) => React.ReactNode;
}

// ── Box: Disponíveis (foco da tela) ─────────────────────────────────────
export default function AvailableMissionsBox({
  isRecommended,
  onToggleMode,
  filtersOpen,
  onToggleFilters,
  hasActiveFilter,
  isBelowRecruitIV,
  unlockRankName,
  filteredSpecialties,
  specialtyId,
  onChangeSpecialty,
  difficultyFilter,
  onChangeDifficulty,
  recommendedQuery,
  recommendedMissions,
  availableQuery,
  availableMissions,
  renderList,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
      <View className="p-3 gap-3">
        {/* C4/M5: ordenação recomendadas × catálogo é um controle DISCRETO
            (label do modo atual + link de troca), não uma faixa de abas. */}
        <View className="flex-row items-center justify-between px-1">
          <Text className="text-[12px] text-[#888]">
            {isRecommended ? t('missions.recommendedCaption') : t('missions.allCaption')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isRecommended ? t('missions.switchToAll') : t('missions.switchToRecommended')}
            onPress={onToggleMode}
            className="flex-row items-center gap-1 py-1">
            <Text className="text-[12px] font-bold text-primary-500">
              {isRecommended ? t('missions.switchToAll') : t('missions.switchToRecommended')}
            </Text>
            <Text className="text-[11px] text-primary-500">⇄</Text>
          </TouchableOpacity>
        </View>

        {/* F4: filtros colapsados atrás de "Filtrar" — a tela abre já nas
            recomendadas, com menos ruído. Um ponto sinaliza filtro ativo. */}
        {(filteredSpecialties.length > 0 || !isBelowRecruitIV) && (
          <View className="gap-2.5">
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ expanded: filtersOpen }}
              accessibilityLabel={t('missions.filtersButton')}
              onPress={onToggleFilters}
              className="flex-row items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#f4f4f4]">
              <Text className="text-[12px] font-bold text-[#666]">
                {t('missions.filtersButton')}
              </Text>
              {hasActiveFilter && <View className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
              <Text className="text-[11px] text-[#888]">{filtersOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {filtersOpen && (
              <View className="gap-3">
                {filteredSpecialties.length > 0 && (
                  <SpecialtyFilter
                    specialties={filteredSpecialties}
                    value={specialtyId}
                    onChange={onChangeSpecialty}
                  />
                )}
                {!isBelowRecruitIV && (
                  <DifficultyFilter value={difficultyFilter} onChange={onChangeDifficulty} />
                )}
              </View>
            )}
          </View>
        )}

        {isBelowRecruitIV && (
          <View className="bg-accent-500/15 border border-accent-500/40 rounded-[12px] px-4 py-3 flex-row items-center gap-2">
            <Text className="text-[14px]">⚔️</Text>
            <Text className="flex-1 text-[12px] text-[#7a5b00] leading-[18px]">
              {t('missions.belowRecruitInfo', { rank: unlockRankName })}
            </Text>
          </View>
        )}

        {isRecommended ? (
          recommendedQuery.isLoading ? (
            <MissionSkeleton />
          ) : recommendedQuery.isError ? (
            <ErrorBox text={t('missions.errorRecommended')} />
          ) : recommendedMissions.length === 0 ? (
            <EmptyBox text={t('missions.emptyAvailable')} emoji="⚔️" />
          ) : (
            renderList(recommendedMissions)
          )
        ) : availableQuery.isLoading ? (
          <MissionSkeleton />
        ) : availableQuery.isError ? (
          <ErrorBox text={t('missions.errorAvailable')} />
        ) : availableMissions.length === 0 ? (
          <EmptyBox text={t('missions.emptyAvailable')} emoji="⚔️" />
        ) : (
          renderList(availableMissions)
        )}
      </View>
    </View>
  );
}
