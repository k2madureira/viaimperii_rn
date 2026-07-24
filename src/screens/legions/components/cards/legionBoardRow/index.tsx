import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { CoinAmount, StandardIcon } from '../../../../../components/icons';
import PraefectusBadge from '../../../../../components/praefectusBadge';
import { BoardSortField, LegionBoardItem } from '../../../../../api/legionLeaderboard';
import { formatCountdown } from '../../../model/hooks/useStandardCountdown';

interface Props {
  item: LegionBoardItem;
  sortField: BoardSortField;
  color: string;
  highlight?: boolean; // legião do viewer
  // Abre o modal de identidade da legião. Só o brasão e o nome são o gatilho —
  // o resto da linha é dado numérico, não navegação.
  onPressInfo?: (legionId: number) => void;
}

// Linha do ranking de legiões.
//
// A métrica em destaque ACOMPANHA a ordenação ativa: ordenar por cofre e
// destacar XP faria a lista parecer fora de ordem — o mesmo erro já cometido
// (e corrigido) no ranking de candidatos a Praefectus.
// Na prévia, todo campo pago vem `null` e o backend força a ordenação por
// `xp_week` — o fallback abaixo cobre os dois casos com o mesmo caminho.
function highlightedMetric(item: LegionBoardItem, sortField: BoardSortField) {
  switch (sortField) {
    case 'treasury':
      return item.treasury_balance != null
        ? { kind: 'coins' as const, atomic: item.treasury_balance }
        : { kind: 'number' as const, value: item.xp_week, suffix: ' XP' };
    case 'missions_week':
      return { kind: 'number' as const, value: item.missions_week ?? item.xp_week, suffix: '' };
    case 'avg_xp_per_active':
      return {
        kind: 'number' as const,
        value: item.avg_xp_per_active ?? item.xp_week,
        suffix: ' XP',
      };
    case 'active_members':
      return { kind: 'number' as const, value: item.active_members ?? item.xp_week, suffix: '' };
    case 'total_members':
      return { kind: 'number' as const, value: item.total_members ?? item.xp_week, suffix: '' };
    default:
      return { kind: 'number' as const, value: item.xp_week, suffix: ' XP' };
  }
}

export default function LegionBoardRow({
  item,
  sortField,
  color,
  highlight = false,
  onPressInfo,
}: Props) {
  const { t } = useTranslation();
  const metric = highlightedMetric(item, sortField);
  const crest = item.thumb_url ?? item.image_url;

  const openInfo = onPressInfo ? () => onPressInfo(item.legion_id) : undefined;

  return (
    <View
      className="flex-row items-center gap-3 rounded-[12px] px-3 py-2.5"
      style={{ backgroundColor: highlight ? `${color}14` : '#faf7f7' }}>
      <Text className="text-[13px] font-extrabold text-[#bbb] w-6 text-center">
        {item.position}
      </Text>

      <TouchableOpacity
        onPress={openInfo}
        disabled={!openInfo}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        className="w-9 h-9 rounded-full bg-white items-center justify-center overflow-hidden">
        {crest ? (
          <Image source={{ uri: crest }} style={{ width: 32, height: 32 }} resizeMode="contain" />
        ) : (
          <Text className="text-[16px]">🦅</Text>
        )}
      </TouchableOpacity>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={openInfo}
            disabled={!openInfo}
            activeOpacity={0.7}
            accessibilityRole="button"
            className="shrink">
            <Text className="text-[13px] font-extrabold text-[#333]" numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>

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

        {/* Ativos E totais juntos — o contraste é a informação. Ausentes na
            prévia (campos pagos vêm null), então a linha simplesmente some. */}
        {item.active_members != null && item.total_members != null && (
          <Text className="text-[10.5px] text-[#999] mt-0.5">
            {t('legions.board.members', {
              active: item.active_members,
              total: item.total_members,
            })}
          </Text>
        )}

        {item.active_standard && (
          <Text className="text-[9.5px] text-[#bbb] mt-0.5">
            {item.active_standard.name} ·{' '}
            {t('legions.treasury.remaining', {
              time: formatCountdown(item.active_standard.remaining_seconds),
            })}
          </Text>
        )}

        {/* Rosto da legião. `is_legion_leader` é best-effort no backend, então
            a ausência do selo não é erro — só não renderiza. */}
        {item.top_member && (
          <View className="flex-row items-center gap-1.5 mt-1">
            <View className="w-4 h-4 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden">
              {item.top_member.active_avatar?.url ?? item.top_member.image ? (
                <Image
                  source={{
                    uri: (item.top_member.active_avatar?.url ?? item.top_member.image) as string,
                  }}
                  style={{ width: 16, height: 16 }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-[8px]">⚔️</Text>
              )}
            </View>

            <Text className="text-[9.5px] text-[#999] flex-shrink" numberOfLines={1}>
              {item.top_member.name}
            </Text>

            {item.top_member.is_legion_leader && <PraefectusBadge size="sm" />}
          </View>
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
