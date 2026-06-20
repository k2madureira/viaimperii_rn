import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { updateUserProvince } from '../../../../api/provinces/provincesApi';

export function useUpdateProvince(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provinceId: number) => updateUserProvince(userId as string, provinceId),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: 'Província definida',
        text2: result.province_name,
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: 'Erro ao definir província', text2: error.message });
    },
  });
}
