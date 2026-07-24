import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { SendFriendRequestInput } from '../../../../api/friendship';

// Envia um pedido de amizade por @handle ou user_id. Se o alvo já me pediu, o
// backend responde `accepted` (intenção mútua) — refletimos nas duas listas.
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendFriendRequestInput) => viaimperiiApi.friendship.request(input),
    onSuccess: (result) => {
      const accepted = result.status === 'accepted';
      Toast.show({
        type: 'success',
        text1: accepted ? i18n.t('friends.toasts.nowFriends') : i18n.t('friends.toasts.requestSent'),
      });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'outgoing'] });
      if (accepted) {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['friend-requests', 'incoming'] });
      }
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('friends.toasts.requestError'), text2: error.message });
    },
  });
}
