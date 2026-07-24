import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';

// Bloqueia um usuário (§Amigos §3): encerra amizade/pedido e some da busca do outro.
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => viaimperiiApi.friendship.block(userId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('friends.toasts.blocked') });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', 'outgoing'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('friends.toasts.blockError'), text2: error.message });
    },
  });
}
