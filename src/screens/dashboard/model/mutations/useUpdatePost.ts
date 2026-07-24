import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { UpdatePostInput } from '../../../../api/feed';

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: number; input: UpdatePostInput }) =>
      viaimperiiApi.feed.updatePost(eventId, input),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('toasts.feedPostUpdated') });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.feedPostUpdateError'), text2: error.message });
    },
  });
}
