import React from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { CoinAmount, StandardIcon } from '../../../../../components/icons';
import { BoardSortField, LegionBoardItem } from '../../../../../api/legionLeaderboard';
import { formatCountdown } from '../../../model/hooks/useStandardCountdown';

interface Props {
  item: LegionBoardItem;
  sortField: BoardSortField;
  color: string;
  highlight?: boolean; // legião do viewer
}

// Linha do ranking de legiões.
//
// A métrica em destaque ACOMPANHA a ordenação ativa: ordenar por cofre e
// destacar XP faria a lista parecer fora de ordem — o mesmo erro já cometido
// (e corrigido) no ranking de candidatos a Praefectus.
function highlightedMetric(item: LegionBoardItem, sortField: BoardSortField) {
  switch (sortField) {
    case 'treasury':
      return { kind: 'coins' as const, atomic: item.treasury_balance };
    case 'missions_week':
      return { kind: 'number' as const, value: item.missions_week, suffix: '' };
    case 'avg_xp_per_active':
      return { kind: 'number' as const, value: item.avg_xp_per_active, suffix: ' XP' };
    case 'active_members':
      return { kind: 'number' as const, value: item.active_members, suffix: '' };
    case 'total_members':
      return { kind: 'number' as const, value: item.total_members, suffix: '' };
    default:
      return { kind: 'number' as const, value: item.xp_week, suffix: ' XP' };
  }
}

export default function LegionBoardRow({ item, sortField, color, highlight = false }: Props) {
  const { t } = useTranslation();
  const metric = highlightedMetric(item, sortField);
  const crest = item.thumb_url ?? item.image_url;

  return (
    <View
      className="flex-row items-center gap-3 rounded-[12px] px-3 py-2.5"
      style={{ backgroundColor: highlight ? `${color}14` : '#faf7f7' }}>
      <Text className="text-[13px] font-extrabold text-[#bbb] w-6 text-center">
        {item.position}
      </Text>

      <View className="w-9 h-9 rounded-full bg-white items-center justify-center overflow-hidden">
        {crest ? (
          <Image source={{ uri: crest }} style={{ width: 32, height: 32 }} resizeMode="contain" />
        ) : (
          <Text className="text-[16px]">🦅</Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[13px] font-extrabold text-[#333]" numberOfLines={1}>
            {item.name}
          </Text>

          {/* Estandarte ativo: quem está com buff AGORA. É o que cria a tensão
              "estão na frente e ainda com +X% de XP". */}
          {item.active_standard && (
            <View className="flex-row items-center gap-0.5 bg-accent-500/20 rounded-full px-1.5 py-0.5">
              <StandardIcon size={10} color="#9a7b1f" />
              <Text className="text-[9.5px] font-bold text-[#9a7b1f]">
                +{item.active_standard.multiplier_pct}%
              </Text>
            </View>
          )}
        </View>

        {/* Ativos E totais juntos — o contraste é a informação. */}
        <Text className="text-[10.5px] text-[#999] mt-0.5">
          {t('legions.board.members', {
            active: item.active_members,
            total: item.total_members,
          })}
        </Text>

        {item.active_standard && (
          <Text className="text-[9.5px] text-[#bbb] mt-0.5">
            {item.active_standard.name} ·{' '}
            {t('legions.treasury.remaining', {
              time: formatCountdown(item.active_standard.remaining_seconds),
            })}
          </Text>
        )}
      </View>

      {metric.kind === 'coins' ? (
        <CoinAmount atomic={metric.atomic} size={12.5} compact />
      ) : (
        <Text className="text-[13px] font-extrabold" style={{ color: '#555' }}>
          {metric.value.toLocaleString()}
          {metric.suffix}
        </Text>
      )}
    </View>
  );
}
