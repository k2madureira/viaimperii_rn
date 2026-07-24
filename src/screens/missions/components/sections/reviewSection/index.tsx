import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ToReviewItem } from '../../../../../api/missions';
import { useApproveMission } from '../../../model/mutations/useApproveMission';
import { useRejectMission } from '../../../model/mutations/useRejectMission';
import { useSendMissionTribute } from '../../../model/mutations/useSendMissionTribute';
import { useWallet } from '../../../../dashboard/model/queries/useWallet';
import { TributeModal } from '../../../../dashboard/components/feed';
import ReviewItem from '../../cards/reviewItem';
import EmptyBox from '../../feedback/emptyBox';
import ErrorBox from '../../feedback/errorBox';

interface Props {
  query: { isLoading: boolean; isError: boolean; data?: ToReviewItem[] };
}

// Alvo do tributo de missão, capturado no momento em que a aprovação finaliza a
// missão do executor (o item some da fila logo em seguida).
interface TributeTarget {
  missionSlug: string;
  executorId: string;
  name: string;
}

export default function ReviewSection({ query }: Props) {
  const { t } = useTranslation();
  const approveM = useApproveMission();
  const rejectM = useRejectMission();
  const items = query.data ?? [];

  // O tributo de missão exige o executor já COMPLETED (senão o backend responde
  // 409), e a fila só lista missões PENDING_REVIEW — então o único instante em
  // que a ação é válida é logo após a aprovação que finaliza a missão. É aí que
  // o convite aparece, em vez de um botão permanentemente desabilitado no item.
  const [tributeTarget, setTributeTarget] = useState<TributeTarget | null>(null);
  const tributeM = useSendMissionTribute();
  const { data: wallet } = useWallet(tributeTarget != null);

  const closeTribute = () => {
    setTributeTarget(null);
    tributeM.reset();
  };

  const approve = (slug: string, executorId: string, name: string) => {
    approveM.mutate(
      { slug, executorId },
      {
        onSuccess: (result) => {
          if (result.status !== 'completed') return;
          tributeM.reset();
          setTributeTarget({ missionSlug: slug, executorId, name });
        },
      },
    );
  };

  const pendingSlug = approveM.isPending
    ? approveM.variables?.slug ?? null
    : rejectM.isPending
      ? rejectM.variables?.slug ?? null
      : null;

  return (
    <View className="bg-white border border-[#f0eded] rounded-[20px] p-3 gap-3">
      <View className="px-1 pt-1">
        <Text className="text-[14px] font-extrabold text-charcoal">{t('missions.reviewWaiting')}</Text>
        <Text className="text-[11px] text-[#999] mt-0.5 leading-[15px]">
          {t('missions.reviewDescription')}
        </Text>
      </View>

      {query.isLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      ) : query.isError ? (
        <ErrorBox text={t('missions.errorReview')} />
      ) : items.length === 0 ? (
        <EmptyBox text={t('missions.emptyReview')} emoji="✅" />
      ) : (
        <View className="gap-3">
          {items.map((item) => (
            <ReviewItem
              key={`${item.mission_slug}-${item.executor.id}`}
              item={item}
              onApprove={(slug, executorId) => approve(slug, executorId, item.executor.name)}
              onReject={(slug, executorId, reason) => rejectM.mutate({ slug, executorId, reason })}
              pending={pendingSlug === item.mission_slug}
            />
          ))}
        </View>
      )}

      <TributeModal
        visible={tributeTarget != null}
        recipientName={tributeTarget?.name ?? ''}
        walletBalance={wallet?.general_balance}
        pending={tributeM.isPending}
        error={tributeM.error}
        result={tributeM.data}
        onConfirm={(amount) => {
          if (!tributeTarget) return;
          tributeM.mutate({
            missionSlug: tributeTarget.missionSlug,
            executorId: tributeTarget.executorId,
            amount,
          });
        }}
        onClose={closeTribute}
      />
    </View>
  );
}
