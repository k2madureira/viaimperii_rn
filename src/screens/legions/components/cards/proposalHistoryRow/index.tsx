import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { ProposalStatus, StandardProposal } from '../../../../../api/legionTreasury';
import { formatRelativeTime } from '../../../../../utils/date';

interface Props {
  proposal: StandardProposal;
}

const STATUS_COLOR: Record<ProposalStatus, string> = {
  open: '#9a7b1f',
  approved: '#2e7d4f',
  rejected: '#9E1B32',
  expired: '#999',
};

// Linha do histórico de propostas: desfecho + a nota de resolução, que o backend
// já devolve pronta em PT-BR (não remontar o texto aqui).
export default function ProposalHistoryRow({ proposal }: Props) {
  const { t } = useTranslation();

  const color = STATUS_COLOR[proposal.status] ?? '#999';

  return (
    <View className="bg-[#faf7f7] rounded-[10px] px-3 py-2.5 gap-1">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[12.5px] font-bold text-[#333] flex-1" numberOfLines={1}>
          {proposal.standard_name}
        </Text>

        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${color}1f` }}>
          <Text className="text-[10px] font-bold" style={{ color }}>
            {t(`legions.treasury.status.${proposal.status}`)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[10.5px] text-[#999]">
          {t('legions.treasury.votesTally', {
            yes: proposal.votes_yes,
            no: proposal.votes_no,
            required: proposal.votes_required,
          })}
        </Text>
        <Text className="text-[10.5px] text-[#999]">
          {formatRelativeTime(proposal.resolved_at ?? proposal.expires_at, t)}
        </Text>
      </View>

      {proposal.resolution_note && (
        <Text className="text-[10.5px] text-[#888] leading-[14px] mt-0.5">
          {proposal.resolution_note}
        </Text>
      )}
    </View>
  );
}
