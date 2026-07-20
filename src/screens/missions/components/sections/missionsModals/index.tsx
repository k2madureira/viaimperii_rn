import React from 'react';
import { Modal, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { LegionSelectModal } from '../../../../../components';
import { Mission, MissionEvidence } from '../../../../../api/missions';
import { CreatePostModal } from '../../../../dashboard/components/feed';
import { useLegions } from '../../../model/queries/useLegions';
import { useJoinLegion } from '../../../model/mutations/useJoinLegion';
import EvidenceModal from '../../modals/evidenceModal';
import MissionCelebration from '../../modals/missionCelebration';
import MissionsOnboarding from '../../modals/missionsOnboarding';
import RankUpModal from '../../modals/rankUpModal';

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
    imageAlreadyUsed?: boolean;
    onClearImageError?: () => void;
    onClose: () => void;
    onSubmit: (evidence: MissionEvidence) => void;
  };
  celebration: {
    visible: boolean;
    xp: number;
    coins?: number;
    onDone: () => void;
  };
  onboarding: {
    visible: boolean;
    onClose: () => void;
  };
  rankUp: {
    visible: boolean;
    previousRank?: string;
    previousImage: string | null;
    newRank: string;
    newImage: string | null;
    onClose: () => void;
  };
  shareConfirm: {
    visible: boolean;
    onDecline: () => void;
    onAccept: () => void;
  };
  createPost: {
    keyId: string;
    visible: boolean;
    initialText: string;
    canLegion: boolean;
    canProvince: boolean;
    authorAvatarUrl: string | null;
    onClose: () => void;
  };
}

// Footer da tela de missões: todos os overlays/modais (legião, evidência,
// celebração, onboarding, promoção de patente e compartilhar-como-post).
export default function MissionsModals({
  userId,
  legion,
  evidence,
  celebration,
  onboarding,
  rankUp,
  shareConfirm,
  createPost,
}: Props) {
  const { t } = useTranslation();
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
        onConfirm={(legionId) =>
          joinLegionM.mutate(legionId, { onSuccess: legion.onClose })
        }
      />

      <EvidenceModal
        mission={evidence.mission}
        submitting={evidence.submitting}
        imageAlreadyUsed={evidence.imageAlreadyUsed}
        onClearImageError={evidence.onClearImageError}
        onClose={evidence.onClose}
        onSubmit={evidence.onSubmit}
      />

      {/* F3: celebração de XP (camada absoluta, não bloqueia toques). */}
      <MissionCelebration
        visible={celebration.visible}
        xp={celebration.xp}
        coins={celebration.coins}
        onDone={celebration.onDone}
      />

      {/* F9: mini-tour na primeira visita */}
      <MissionsOnboarding visible={onboarding.visible} onClose={onboarding.onClose} />

      {/* Promoção de patente ao concluir missão */}
      <RankUpModal
        visible={rankUp.visible}
        previousRank={rankUp.previousRank}
        previousImage={rankUp.previousImage}
        newRank={rankUp.newRank}
        newImage={rankUp.newImage}
        onClose={rankUp.onClose}
      />

      {/* Confirmação: transformar a conclusão em post (modal padrão do app) */}
      <Modal
        visible={shareConfirm.visible}
        transparent
        animationType="fade"
        onRequestClose={shareConfirm.onDecline}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-[20px] p-6">
            <View className="items-center">
              <View className="w-14 h-14 rounded-full bg-primary-500/10 items-center justify-center mb-3">
                <Text className="text-[26px]">📣</Text>
              </View>
              <Text
                className="text-[18px] font-extrabold text-charcoal text-center"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {t('missionShare.promptTitle')}
              </Text>
            </View>
            <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
              {t('missionShare.promptBody')}
            </Text>
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={shareConfirm.onDecline}
                activeOpacity={0.85}
                className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-[#666]">{t('missionShare.decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={shareConfirm.onAccept}
                activeOpacity={0.9}
                className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-white">{t('missionShare.accept')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Compartilhar missão concluída como post (pré-preenchido com a evidência) */}
      <CreatePostModal
        key={createPost.keyId}
        visible={createPost.visible}
        initialText={createPost.initialText}
        canLegion={createPost.canLegion}
        canProvince={createPost.canProvince}
        authorAvatarUrl={createPost.authorAvatarUrl}
        onClose={createPost.onClose}
      />
    </>
  );
}
