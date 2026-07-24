import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { CreatePostInput } from '../../../../api/feed';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => viaimperiiApi.feed.createPost(input),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('toasts.feedPostCreated') });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.feedPostError'), text2: error.message });
    },
  });
}
 