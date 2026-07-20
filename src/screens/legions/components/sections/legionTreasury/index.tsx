import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { useLegionTreasury } from '../../../model/queries/useLegionTreasury';
import { useStandardProposals } from '../../../model/queries/useStandardProposals';
import { useDonateToTreasury } from '../../../model/mutations/useDonateToTreasury';
import { useProposeStandard } from '../../../model/mutations/useProposeStandard';
import { useVoteProposal } from '../../../model/mutations/useVoteProposal';
import { useWallet } from '../../../../dashboard/model/queries/useWallet';
import TreasuryCard from '../../cards/treasuryCard';
import TreasuryTxRow from '../../cards/treasuryTxRow';
import CenturionCard from '../../cards/centurionCard';
import ProposalCard from '../../cards/proposalCard';
import ProposalHistoryRow from '../../cards/proposalHistoryRow';
import DonateButton from '../../buttons/donateButton';
import ProposeButton from '../../buttons/proposeButton';
import DonateModal from '../../modals/donateModal';
import StandardModal from '../../modals/standardModal';
import CenturionModal from '../../modals/centurionModal';
import TreasurySkeleton from '../../skeletons/treasurySkeleton';
import EmptyBox from '../../feedback/emptyBox';
import ErrorState from '../../feedback/errorState';

interface Props {
  legionId: number;
  legionName: string;
  color: string;
}

// Bloco do Cofre da Legião, renderizado no card expandido da legião DO PRÓPRIO
// viewer. Dono das queries/mutations do cofre (§0.2: query exclusiva vive na
// section que a usa).
//
// F5 (Legion Weekly Objective) reusa este mesmo card: o objetivo semanal entra
// como um bloco entre o `TreasuryCard` e as ações, consumindo a mesma query.
export default function LegionTreasurySection({ legionId, legionName, color }: Props) {
  const { t } = useTranslation();

  const treasuryQuery = useLegionTreasury(legionId);
  const walletQuery = useWallet();

  const [donateOpen, setDonateOpen] = useState(false);
  const [standardOpen, setStandardOpen] = useState(false);
  const [centurionOpen, setCenturionOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  // O cofre já diz `can_propose`; este flag só derruba o gatilho após um 403,
  // que acontece se a liderança mudar entre a leitura e o toque.
  const [proposeBlocked, setProposeBlocked] = useState(false);

  // Histórico é sob demanda — não custa uma requisição a quem não abre.
  const proposalsQuery = useStandardProposals(legionId, historyOpen);

  const donate = useDonateToTreasury(legionId);
  const propose = useProposeStandard(legionId, () => {
    setProposeBlocked(true);
    setStandardOpen(false);
  });
  const vote = useVoteProposal(legionId);

  if (treasuryQuery.isLoading) return <TreasurySkeleton />;

  if (treasuryQuery.isError) {
    return <ErrorState onRetry={() => treasuryQuery.refetch()} />;
  }

  const treasury = treasuryQuery.data;
  if (!treasury) return null;

  const transactions = treasury.transactions ?? [];
  const standards = treasury.standards ?? [];
  const openProposal = treasury.open_proposal;
  const leader = treasury.leader;

  // Propor exige: permissão do backend, catálogo, e nenhuma votação em curso
  // (o índice parcial do backend garante uma proposta aberta por legião).
  const showPropose =
    treasury.can_propose && !proposeBlocked && standards.length > 0 && !openProposal;

  // Propostas já encerradas — a aberta já aparece no `ProposalCard` acima.
  const pastProposals = (proposalsQuery.data?.items ?? []).filter((p) => p.status !== 'open');

  return (
    <View className="bg-white rounded-[16px] border border-[#f0eded] p-5 gap-4">
      <TreasuryCard
        balance={treasury.balance}
        reserved={treasury.reserved}
        available={treasury.available}
        activeStandard={treasury.active_standard}
        color={color}
      />

      {/* Centurião — `source: 'none'` = legião sem membro elegível */}
      {leader && leader.source !== 'none' && (
        <CenturionCard leader={leader} color={color} onPress={() => setCenturionOpen(true)} />
      )}

      {/* Votação aberta */}
      {openProposal && (
        <ProposalCard
          proposal={openProposal}
          color={color}
          pending={vote.isPending}
          onVote={(approve) => vote.mutate({ proposalId: openProposal.id, approve })}
        />
      )}

      {/* Ações */}
      <View className="flex-row gap-2">
        <DonateButton color={color} onPress={() => setDonateOpen(true)} />
        {showPropose && (
          <ProposeButton
            color={color}
            disabled={propose.isPending}
            onPress={() => setStandardOpen(true)}
          />
        )}
      </View>

      {/* Histórico de movimentações */}
      <View className="gap-2">
        <Text className="text-[11px] font-bold text-[#999] tracking-[1.5px] uppercase">
          {t('legions.treasury.history')}
        </Text>

        {transactions.length === 0 ? (
          <EmptyBox text={t('legions.treasury.empty')} />
        ) : (
          transactions.map((tx, i) => (
            <TreasuryTxRow key={`${tx.created_at}-${i}`} transaction={tx} />
          ))
        )}
      </View>

      {/* Histórico de votações — colapsado por padrão */}
      <View className="gap-2">
        <TouchableOpacity
          onPress={() => setHistoryOpen((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: historyOpen }}
          className="flex-row items-center justify-between">
          <Text className="text-[11px] font-bold text-[#999] tracking-[1.5px] uppercase">
            {t('legions.treasury.proposalHistory')}
          </Text>
          <Text className="text-[12px] text-[#bbb]">{historyOpen ? '▾' : '▸'}</Text>
        </TouchableOpacity>

        {historyOpen &&
          (proposalsQuery.isLoading ? (
            <Text className="text-[11.5px] text-[#aaa]">{t('common.loading')}</Text>
          ) : pastProposals.length === 0 ? (
            <EmptyBox text={t('legions.treasury.noProposals')} emoji="🏛️" />
          ) : (
            pastProposals.map((p) => <ProposalHistoryRow key={p.id} proposal={p} />)
          ))}
      </View>

      <DonateModal
        visible={donateOpen}
        legionName={legionName}
        walletBalance={walletQuery.data?.general_balance}
        pending={donate.isPending}
        error={donate.error}
        onConfirm={(amount, unit) =>
          donate.mutate({ amount, unit }, { onSuccess: () => setDonateOpen(false) })
        }
        onClose={() => {
          donate.reset();
          setDonateOpen(false);
        }}
      />

      <StandardModal
        visible={standardOpen}
        standards={standards}
        pending={propose.isPending}
        onConfirm={(slug) => propose.mutate(slug, { onSuccess: () => setStandardOpen(false) })}
        onClose={() => setStandardOpen(false)}
      />

      <CenturionModal
        visible={centurionOpen}
        leader={leader}
        color={color}
        onClose={() => setCenturionOpen(false)}
      />
    </View>
  );
}
