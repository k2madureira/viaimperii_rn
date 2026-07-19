import React from 'react';
import { LegionSelectModal } from '../../../../../../components';
import { Mission, MissionEvidence } from '../../../../../../api/missions/missionsApi';
import { EvidenceModal, MissionCelebration, RankUpModal } from '../../../../components';
import { useLegions } from '../../../../model/queries/useLegions';
import { useJoinLegion } from '../../../../model/mutations/useJoinLegion';

interface Props {
  // user_id do usuário logado — usado para ingressar na legião escolhida.
  userId?: string;
  legion: {
    visible: boolean;
    recommendedIds: number[];
    onClose: () => void;
  };
  evidence: {
    mission: Mission | null;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (evidence: MissionEvidence) => void;
  };
  celebration: {
    visible: boolean;
    xp: number;
    coins?: number;
    onDone: () => void;
  };
  rankUp: {
    visible: boolean;
    previousRank?: string;
    previousImage: string | null;
    newRank: string;
    newImage: string | null;
    onClose: () => void;
  };
}

// Footer da tela de missões de profissão: legião, evidência, celebração e
// promoção de patente (sem o "compartilhar como post" da tela principal).
export default function ProfessionModals({ userId, legion, evidence, celebration, rankUp }: Props) {
  const legionsQuery = useLegions();
  const joinLegionM = useJoinLegion(userId);

  return (
    <>
      <LegionSelectModal
        visible={legion.visible}
        legions={legionsQuery.data ?? []}
        recommendedIds={legion.recommendedIds}
        pending={joinLegionM.isPending}
        onClose={legion.onClose}
        onConfirm={(legionId) => joinLegionM.mutate(legionId, { onSuccess: legion.onClose })}
      />

      <EvidenceModal
        mission={evidence.mission}
        submitting={evidence.submitting}
        onClose={evidence.onClose}
        onSubmit={evidence.onSubmit}
      />

      <MissionCelebration
        visible={celebration.visible}
        xp={celebration.xp}
        coins={celebration.coins}
        onDone={celebration.onDone}
      />

      <RankUpModal
        visible={rankUp.visible}
        previousRank={rankUp.previousRank}
        previousImage={rankUp.previousImage}
        newRank={rankUp.newRank}
        newImage={rankUp.newImage}
        onClose={rankUp.onClose}
      />
    </>
  );
}
