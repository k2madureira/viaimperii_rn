import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { getUnreadNotificationsCount } from '../../../../api/notifications/notificationsApi';

// O push em tempo real (SSE, via useNotificationEvents) mantém a contagem fresca
// enquanto o app está em primeiro plano — não precisa de polling. O único gap é
// quando o app fica em segundo plano (sem conexão SSE): a notificação continua
// persistida no backend e este refetch ao voltar ao primeiro plano cobre o que
// foi perdido nesse intervalo.
export function useUnreadNotificationsCount(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      }
    });

    return () => sub.remove();
  }, [enabled, queryClient]);

  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadNotificationsCount,
    enabled,
  });
}
