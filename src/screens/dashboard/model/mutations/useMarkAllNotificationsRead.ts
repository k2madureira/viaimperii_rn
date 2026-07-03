import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import {
  markAllNotificationsRead,
  NotificationsListResponse,
} from '../../../../api/notifications/notificationsApi';

type NotificationsCache = InfiniteData<NotificationsListResponse>;

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      queryClient.setQueriesData<NotificationsCache>({ queryKey: ['notifications'] }, (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => ({ ...item, read: true })),
          })),
        };
      });

      queryClient.setQueryData(['notifications-unread-count'], { count: 0 });
    },

    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.notificationsMarkAllError'),
        text2: error.message,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
