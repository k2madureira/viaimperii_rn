import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { connectMissionEvents, MissionEvent } from '../../../../api/missions/missionEvents';

/**
 * Opens a persistent SSE connection to GET /missions/events?token=<token>.
 *
 * On each event the corresponding React Query caches are invalidated so the
 * UI updates automatically without polling. The connection is paused when the
 * app goes to the background and resumed when it comes back to the foreground.
 *
 * @param enabled - pass false to skip connecting (e.g. when user is not logged in).
 */
export function useMissionEvents(enabled = true) {
  const queryClient = useQueryClient();
  const disconnectRef = useRef<(() => void) | null>(null);

  function handleEvent(event: MissionEvent) {

    switch (event.type) {
      case 'connected':
        // Handshake — o servidor confirma a conexão com { user }.
        if (__DEV__) console.log('[SSE] conectado:', event.user);
        break;

      case 'mission_updated':
      case 'mission_completed':
      case 'mission_approved':
      case 'mission_rejected':
        // Update live-status poller for this specific mission.
        if (event.mission_slug) {
          queryClient.invalidateQueries({ queryKey: ['mission-status', event.mission_slug] });
        }
        // Refresh all mission lists so status badges update.
        queryClient.invalidateQueries({ queryKey: ['missions'] });
        queryClient.invalidateQueries({ queryKey: ['missions-available'] });
        queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
        queryClient.invalidateQueries({ queryKey: ['ranking'] });
        break;

      case 'new_review_available':
        // A new mission entered pending_review and we can validate it.
        queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
        break;

      default:
        break;
    }
  }

  function connect() {
    if (disconnectRef.current) return; // already connected
    disconnectRef.current = connectMissionEvents(handleEvent);
  }

  function disconnect() {
    disconnectRef.current?.();
    disconnectRef.current = null;
  }

  useEffect(() => {
    if (!enabled) return;

    connect();

    // Pause when the app is backgrounded, resume on foreground.
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        connect();
      } else {
        disconnect();
      }
    });

    return () => {
      sub.remove();
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
