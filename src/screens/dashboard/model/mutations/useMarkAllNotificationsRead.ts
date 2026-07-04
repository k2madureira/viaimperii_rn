import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import {
  markAllNotificationsRead,
  NotificationsListResponse,
  UnreadCountResponse,
} from '../../../../api/notifications/notificationsApi';

type NotificationsCache = InfiniteData<NotificationsListResponse>;

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,

    onMutate: async () => {
      // Cancela QUALQUER refetch em voo das duas queries. Sem cancelar o
      // `unread-count`, um GET disparado por foco/remontagem no meio da mutação
      // pode resolver depois do update otimista e sobrescrever o zero com a
      // contagem antiga — era isso que reacendia o badge.
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

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

      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], { count: 0 });
    },

    // Grava a contagem autoritativa retornada pelo servidor (0) já após o commit
    // do read-all — reconcilia caso o zero otimista tenha sido perdido por corrida.
    onSuccess: (data) => {
      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], data);
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

    // Refetch final autoritativo depois que a mutação assenta (o read-all já
    // commitou no backend), garantindo que o badge reflita o estado real.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
