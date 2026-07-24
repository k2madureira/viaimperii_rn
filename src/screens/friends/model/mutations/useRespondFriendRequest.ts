import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

// Aceita ou recusa um pedido recebido (§Amigos §2). Só o addressee pode responder.
export function useRespondFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ friendshipId, accept }: { friendshipId: number; accept: boolean }) =>
      accept
        ? viaimperiiApi.friendship.accept(friendshipId)
        : viaimperiiApi.friendship.decline(friendshipId),
    onSuccess: (_result, variables) => {
      Toast.show({
        type: 'success',
        text1: variables.accept
          ? i18n.t('friends.toasts.nowFriends')
          : i18n.t('friends.toasts.requestDeclined'),
      });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'incoming'] });
      if (variables.accept) {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
      }
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('friends.toasts.respondError'), text2: error.message });
    },
  });
}
