import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { completeMission, startMission } from '../../../../api/missions/missionsApi';

export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => startMission(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao iniciar missão', text2: error.message });
    },
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => completeMission(slug),
    onSuccess: (result) => {
      if (result.status === 'completed') {
        Toast.show({
          type: 'success',
          text1: result.promoted ? `Promovido a ${result.current_rank}!` : 'Missão concluída!',
          text2: `+${result.xp_earned} XP${result.medal_earned ? ` · Medalha: ${result.medal_earned}` : ''}`,
        });
      } else {
        // pending_review — entra na janela de revisão antes de conceder XP.
        Toast.show({
          type: 'success',
          text1: 'Conclusão solicitada!',
          text2:
            result.approvals_required > 0
              ? 'Aguardando o tempo de revisão ou aprovação de pares.'
              : 'Sua missão está em revisão e será concluída em breve.',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao concluir missão', text2: error.message });
    },
  });
}
