import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { createComment } from '../../../../api/feed/feedApi';

interface Vars {
  eventId: number;
  body: string;
  parentId?: number | null;
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, body, parentId }: Vars) => createComment(eventId, body, parentId),
    onSuccess: (_result, { eventId }) => {
      // Recarrega a thread e o feed (comments_count é desnormalizado no evento).
      queryClient.invalidateQueries({ queryKey: ['feed-comments', eventId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.feedCommentError'), text2: error.message });
    },
  });
}
