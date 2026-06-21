import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { chooseTrack } from '../../../../api/ranks/ranksApi';

export function useChooseTrack(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackSlug: string) => chooseTrack(userId as string, trackSlug),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: 'Trilha escolhida!',
        text2: result.xp_penalty > 0
          ? `Você perdeu ${result.xp_penalty} XP pela troca.`
          : `Bem-vindo à trilha ${result.track}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao escolher trilha', text2: error.message });
    },
  });
}
