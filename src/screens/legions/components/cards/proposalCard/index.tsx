import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { CoinAmount, StandardIcon } from '../../../../../components/icons';
import { StandardProposal } from '../../../../../api/legionTreasury';
import { formatCountdown, useStandardCountdown } from '../../../model/hooks/useStandardCountdown';

interface Props {
  proposal: StandardProposal;
  color: string;
  pending: boolean;
  onVote: (approve: boolean) => void;
}

// Votação aberta de estandarte: progresso rumo ao limiar, prazo, quem votou e os
// botões A favor / Contra.
//
// O limiar é 60% do EFETIVO ATIVO congelado na abertura — não dos votos dados.
// Por isso a barra mede `votes_yes / votes_required` e a microcopy avisa que
// abstenção conta contra: sem isso o usuário lê "3 a 1" como aprovação folgada.
export default function ProposalCard({ proposal, color, pending, onVote }: Props) {
  const { t } = useTranslation();
  const remaining = useStandardCountdown(proposal.remaining_seconds);

  const pct = Math.min(100, (proposal.votes_yes / Math.max(1, proposal.votes_required)) * 100);
  const missing = Math.max(0, proposal.votes_required - proposal.votes_yes);
  const isWarRoom = proposal.kind === 'war_room';

  return (
    <View className="bg-accent-500/10 border border-accent-500/30 rounded-[14px] p-4 gap-3">
      {/* Cabeçalho: o que está sendo comprado + preço travado.
          `multiplier_pct`/`duration_hours` são campos do catálogo de
          estandartes — não descrevem a Sala de Guerra, então a linha de
          atributos só sai no kind `standard`. */}
      <View className="flex-row items-center gap-2.5">
        {isWarRoom ? (
          <Text className="text-[20px]">🗺️</Text>
        ) : (
          <StandardIcon size={22} color="#9a7b1f" />
        )}

        <View className="flex-1">
          <Text className="text-[10.5px] font-bold text-[#9a7b1f] tracking-[1.2px] uppercase">
            {t('legions.treasury.openVote')}
          </Text>
          <Text className="text-[14px] font-extrabold text-[#333]" numberOfLines={1}>
            {isWarRoom ? t('legions.warRoom') : proposal.standard_name}
          </Text>

          {isWarRoom ? (
            <Text className="text-[11px] text-[#888] mt-0.5">
              {t('legions.board.lockedBodyShort')}
            </Text>
          ) : (
            <Text className="text-[11px] text-[#888] mt-0.5">
              {t('legions.treasury.xpBoost', { pct: proposal.multiplier_pct })} ·{' '}
              {t('legions.treasury.duration', { hours: proposal.duration_hours })}
            </Text>
          )}
        </View>
        <CoinAmount atomic={proposal.price} size={13} compact />
      </View>

      {/* Progresso rumo ao limiar */}
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11.5px] font-bold text-[#555]">
            {t('legions.treasury.votesProgress', {
              yes: proposal.votes_yes,
              required: proposal.votes_required,
            })}
          </Text>
          <Text className="text-[11px] text-[#888]">
            {t('legions.treasury.remaining', { time: formatCountdown(remaining) })}
          </Text>
        </View>

        <View className="h-2 rounded-full bg-[#e8e4e4] overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </View>

        <Text className="text-[10.5px] text-[#999] leading-[14px]">
          {missing > 0
            ? t('legions.treasury.votesMissing', { count: missing })
            : t('legions.treasury.votesReached')}
          {proposal.votes_no > 0 && ` · ${t('legions.treasury.votesAgainst', { count: proposal.votes_no })}`}
        </Text>
      </View>

      {/* Voto do próprio usuário — mutável enquanto a janela está aberta */}
      <View className="flex-row gap-2">
        <VoteButton
          label={t('legions.treasury.voteYes')}
          active={proposal.my_vote === true}
          activeColor="#2e7d4f"
          disabled={pending}
          onPress={() => onVote(true)}
          pending={pending && proposal.my_vote !== true}
        />
        <VoteButton
          label={t('legions.treasury.voteNo')}
          active={proposal.my_vote === false}
          activeColor="#9E1B32"
          disabled={pending}
          onPress={() => onVote(false)}
          pending={pending && proposal.my_vote !== false}
        />
      </View>

      {proposal.my_vote !== null && (
        <Text className="text-[10.5px] text-[#999] text-center">
          {t('legions.treasury.myVoteHint', {
            vote: proposal.my_vote
              ? t('legions.treasury.voteYes')
              : t('legions.treasury.voteNo'),
          })}
        </Text>
      )}
    </View>
  );
}

function VoteButton({
  label,
  active,
  activeColor,
  disabled,
  pending,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  disabled: boolean;
  pending: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      className={`flex-1 rounded-[12px] py-2.5 items-center border-2 ${disabled ? 'opacity-60' : ''}`}
      style={{
        borderColor: activeColor,
        backgroundColor: active ? activeColor : 'transparent',
      }}>
      {pending ? (
        <ActivityIndicator size="small" color={active ? '#fff' : activeColor} />
      ) : (
        <Text
          className="text-[13px] font-bold"
          style={{ color: active ? '#fff' : activeColor }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
