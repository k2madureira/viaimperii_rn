import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { rejectMission } from '../../../../api/missions/missionsApi';

export function useRejectMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, executorId, reason }: { slug: string; executorId: string; reason?: string }) =>
      rejectMission(slug, executorId, reason),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: i18n.t('toasts.rejectTitle'),
        text2: i18n.t('toasts.rejectBody'),
      });
      queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.rejectError'), text2: error.message });
    },
  });
}
