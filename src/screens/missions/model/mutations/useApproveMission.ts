import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { approveMission } from '../../../../api/missions/missionsApi';

export function useApproveMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, executorId }: { slug: string; executorId: string }) =>
      approveMission(slug, executorId),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: result.status === 'completed' ? 'Missão aprovada e concluída!' : 'Aprovação registrada!',
        text2:
          result.reviewer_xp_earned > 0
            ? `Você ganhou +${result.reviewer_xp_earned} XP de revisão.`
            : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao aprovar missão', text2: error.message });
    },
  });
}
