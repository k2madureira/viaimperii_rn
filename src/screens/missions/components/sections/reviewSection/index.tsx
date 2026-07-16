import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ToReviewItem } from '../../../../../api/missions/missionsApi';
import { useApproveMission } from '../../../model/mutations/useApproveMission';
import { useRejectMission } from '../../../model/mutations/useRejectMission';
import ReviewItem from '../../cards/reviewItem';
import EmptyBox from '../../feedback/emptyBox';
import ErrorBox from '../../feedback/errorBox';

interface Props {
  query: { isLoading: boolean; isError: boolean; data?: ToReviewItem[] };
}

export default function ReviewSection({ query }: Props) {
  const { t } = useTranslation();
  const approveM = useApproveMission();
  const rejectM = useRejectMission();
  const items = query.data ?? [];

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
              onApprove={(slug, executorId) => approveM.mutate({ slug, executorId })}
              onReject={(slug, executorId, reason) => rejectM.mutate({ slug, executorId, reason })}
              pending={pendingSlug === item.mission_slug}
            />
          ))}
        </View>
      )}
    </View>
  );
}
