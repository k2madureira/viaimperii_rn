import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { equipAsset } from '../../../../api/assets/assetsApi';
import { GetUserResponse } from '../../../../api/users/userApi';
import { useAuth } from '../../../../contexts/AuthContext';

export function useEquipAsset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.user_id;

  return useMutation({
    mutationFn: (slug: string) => equipAsset(slug),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('avatarPicker.equipSuccess'),
        text2: result.asset.name,
      });

      // Atualização otimista: troca o active_avatar no cache do perfil na hora,
      // para que todos os ícones do usuário logado (header, navbar, compositor)
      // mudem imediatamente — sem esperar o refetch de rede.
      if (userId) {
        const a = result.asset;
        queryClient.setQueryData<GetUserResponse>(['user-profile', userId], (old) =>
          old
            ? {
                ...old,
                active_avatar: {
                  id: a.id,
                  name: a.name,
                  slug: a.slug,
                  url: a.url,
                  thumb_url: a.thumb_url,
                  type: a.type,
                  is_free: a.is_free,
                  price: a.price,
                },
              }
            : old,
        );
      }

      queryClient.invalidateQueries({ queryKey: ['asset-catalog'] });
      // Reconcilia com o servidor em segundo plano (o cache já reflete o novo avatar).
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('avatarPicker.equipError'), text2: error.message });
    },
  });
}
