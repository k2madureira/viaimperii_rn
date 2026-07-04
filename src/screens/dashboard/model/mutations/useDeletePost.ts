import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { deletePost } from '../../../../api/feed/feedApi';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => deletePost(eventId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('toasts.feedPostDeleted') });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.feedPostDeleteError'), text2: error.message });
    },
  });
}
