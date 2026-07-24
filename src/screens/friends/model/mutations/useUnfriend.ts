import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

// Desfaz uma amizade aceita (§Amigos §2). Libera o par para um novo pedido.
export function useUnfriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => viaimperiiApi.friendship.unfriend(userId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('friends.toasts.unfriended') });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('friends.toasts.unfriendError'), text2: error.message });
    },
  });
}
