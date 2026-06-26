import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { approveMission } from '../../../../api/missions/missionsApi';

export function useApproveMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, executorId }: { slug: string; executorId: string }) =>
      approveMission(slug, executorId),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: result.status === 'completed'
          ? i18n.t('toasts.approveCompletedTitle')
          : i18n.t('toasts.approveRegisteredTitle'),
        text2:
          result.reviewer_xp_earned > 0
            ? i18n.t('toasts.approveReviewerXp', { xp: result.reviewer_xp_earned })
            : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.approveError'), text2: error.message });
    },
  });
}
