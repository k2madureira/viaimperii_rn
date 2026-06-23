import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { rejectMission } from '../../../../api/missions/missionsApi';

export function useRejectMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, executorId, reason }: { slug: string; executorId: string; reason?: string }) =>
      rejectMission(slug, executorId, reason),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Evidência rejeitada',
        text2: 'A missão voltou para o executor reenviar.',
      });
      queryClient.invalidateQueries({ queryKey: ['missions-to-review'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao rejeitar missão', text2: error.message });
    },
  });
}
