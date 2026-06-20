import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { joinLegion } from '../../../../api/legions/legionsApi';

const BALANCE_LABEL: Record<string, string> = {
  shortage: 'Sua especialidade reforça o equilíbrio da legião.',
  excess: 'Sua especialidade já é bem representada aqui.',
  balanced: '',
};

export function useJoinLegion(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (legionId: number) => joinLegion(userId as string, legionId),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: `Bem-vindo à ${result.legion_name}!`,
        text2: BALANCE_LABEL[result.balance_status ?? 'balanced'] || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao ingressar na legião', text2: error.message });
    },
  });
}
