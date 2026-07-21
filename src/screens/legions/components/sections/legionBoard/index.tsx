import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { BoardScope, BoardSortField } from '../../../../../api/legionLeaderboard';
import { UserProvince } from '../../../../../api/users';
import { Legion } from '../../../../../api/legion/dto';
import { legionColorById } from '../../../../../utils/legionColors';
import { useLegionLeaderboard } from '../../../model/queries/useLegionLeaderboard';
import { useLegionTreasury } from '../../../model/queries/useLegionTreasury';
import { useProposeWarRoom } from '../../../model/mutations/useProposeWarRoom';
import { formatCountdown } from '../../../model/hooks/useStandardCountdown';
import LegionBoardRow from '../../cards/legionBoardRow';
import LockedBoardRows from '../../cards/lockedBoardRows';
import ScopeTab, { ScopeOption } from '../../buttons/scopeTab';
import BoardSortChips from '../../filters/boardSortChips';
import BoardSkeleton from '../../skeletons/boardSkeleton';
import EmptyBox from '../../feedback/emptyBox';
import ErrorState from '../../feedback/errorState';

interface Props {
  province: UserProvince | null;
  viewerLegionId: number | null;
  // Catálogo de legiões — só para derivar a cor de cada linha (a cor vem da
  // POSIÇÃO na listagem, então cada legião mantém a mesma cor em todas as telas).
  legions: Legion[];
  // Cor dos controles (abas/chips). Não é a cor de nenhuma legião: a War Room
  // é sobre todas elas.
  color: string;
}

// Segundos até o fim da semana SP, a partir de `week.ends_at`. Sem o prazo
// visível, "XP da semana" não gera urgência — o board reseta na segunda.
function secondsUntil(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
}

// Ranking de legiões — corpo da War Room (tela paga).
//
// Dona da query (§0.2). O escopo territorial usa a província do viewer: sem
// província, as abas de país/província ficam desabilitadas em vez de sumir.
export default function LegionBoardSection({
  province,
  viewerLegionId,
  legions,
  color,
}: Props) {
  const { t } = useTranslation();
  const [scope, setScope] = useState<BoardScope>('global');
  const [sortField, setSortField] = useState<BoardSortField>('xp_week');

  const countryId = province?.country_id ?? province?.country?.id ?? undefined;
  const provinceId = province?.id;

  const scopeOptions: ScopeOption<BoardScope>[] = useMemo(
    () => [
      { value: 'global', label: t('legions.board.scopeGlobal') },
      {
        value: 'country',
        label: province?.country?.name ?? t('legions.board.scopeCountry'),
        disabled: countryId == null,
      },
      {
        value: 'province',
        label: province?.abbreviation ?? province?.name ?? t('legions.board.scopeProvince'),
        disabled: provinceId == null,
      },
    ],
    [t, province, countryId, provinceId],
  );

  const boardQuery = useLegionLeaderboard({
    scope,
    countryId: scope === 'country' ? countryId : undefined,
    provinceId: scope === 'province' ? provinceId : undefined,
    sortField,
    limit: 10,
  });

  const board = boardQuery.data;
  const items = board?.items ?? [];
  const isPreview = board?.access === 'preview';

  // O preço e o `can_propose` da Sala vivem no cofre, e o cofre exige ser
  // membro — por isso a query só roda quando o viewer tem legião. Mesma key do
  // QG, então não custa requisição extra.
  const treasuryQuery = useLegionTreasury(viewerLegionId ?? undefined, viewerLegionId != null);
  const warRoom = treasuryQuery.data?.war_room ?? null;
  const proposeWarRoom = useProposeWarRoom(viewerLegionId ?? undefined);

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-3">
        <Text className="text-[15px] font-extrabold text-[#111]">{t('legions.board.title')}</Text>

        {board && (
          <Text className="text-[10.5px] text-[#999]">
            {t('legions.board.weekResets', {
              time: formatCountdown(secondsUntil(board.week.ends_at)),
            })}
          </Text>
        )}
      </View>

      {/* Na prévia o backend ignora escopo e ordenação — deixar os controles
          ativos prometeria um filtro que não acontece. Desabilitados, eles
          continuam mostrando o que existe do outro lado do acesso. */}
      <ScopeTab
        options={
          isPreview ? scopeOptions.map((o) => ({ ...o, disabled: true })) : scopeOptions
        }
        value={isPreview ? 'global' : scope}
        color={color}
        onChange={setScope}
      />

      {!isPreview && scope !== 'global' && (
        <Text className="text-[10.5px] text-[#aaa] leading-[14px]">
          {t('legions.board.scopeHint')}
        </Text>
      )}

      {!isPreview && (
        <BoardSortChips value={sortField} color={color} onChange={setSortField} />
      )}

      {boardQuery.isLoading ? (
        <BoardSkeleton />
      ) : boardQuery.isError ? (
        <ErrorState onRetry={() => boardQuery.refetch()} />
      ) : items.length === 0 ? (
        <EmptyBox text={t('legions.board.empty')} />
      ) : (
        <View className="gap-2">
          {items.map((item) => (
            <LegionBoardRow
              key={item.legion_id}
              item={item}
              sortField={board?.sort_field ?? sortField}
              color={legionColorById(legions, item.legion_id) ?? color}
              highlight={item.legion_id === viewerLegionId}
            />
          ))}
        </View>
      )}

      {/* Prévia: silhuetas + CTA no lugar do resto do ranking */}
      {isPreview && board && (
        <LockedBoardRows
          totalLegions={board.total_legions}
          shownRows={items.length}
          price={warRoom?.price ?? null}
          activeMembers={warRoom?.active_members ?? null}
          durationDays={warRoom?.duration_days ?? null}
          canPropose={warRoom?.can_propose ?? false}
          proposing={proposeWarRoom.isPending}
          onPropose={() => proposeWarRoom.mutate()}
          color={color}
        />
      )}

      {/* Legião do viewer fora do top-N — o gancho "você está em #N".
          `null` quando ele não tem legião ou ela não tem membros no escopo:
          nesse caso não renderiza nada, em vez de inventar uma linha zerada. */}
      {board?.viewer_legion && (
        <View className="gap-2 pt-1">
          <Text className="text-[10.5px] font-bold text-[#999] tracking-[1.2px] uppercase">
            {t('legions.board.yourLegion')}
          </Text>
          <LegionBoardRow
            item={board.viewer_legion}
            sortField={board.sort_field}
            color={legionColorById(legions, board.viewer_legion.legion_id) ?? color}
            highlight
          />
        </View>
      )}

      {/* As duas janelas são diferentes e vêm do backend — rotular pelo dado. */}
      {board && (
        <Text className="text-[10px] text-[#bbb] leading-[13px]">
          {t('legions.board.activeWindow', { days: board.active_window_days })}
        </Text>
      )}
    </View>
  );
}
