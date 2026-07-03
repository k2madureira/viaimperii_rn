import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markNotificationRead,
  NotificationsListResponse,
  UnreadCountResponse,
} from '../../../../api/notifications/notificationsApi';

type NotificationsCache = InfiniteData<NotificationsListResponse>;

// Marca uma notificação como lida ao tocar nela. Atualização otimista: risca o
// item no cache da lista e decrementa o badge, sem esperar a resposta.
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),

    onMutate: async (notificationId: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      let wasUnread = false;
      queryClient.setQueriesData<NotificationsCache>({ queryKey: ['notifications'] }, (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => {
              if (item.id !== notificationId) return item;
              wasUnread = !item.read;
              return { ...item, read: true };
            }),
          })),
        };
      });

      if (wasUnread) {
        queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], (data) => ({
          count: Math.max(0, (data?.count ?? 1) - 1),
        }));
      }
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
