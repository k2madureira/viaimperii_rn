import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Lista de amigos aceitos do usuário logado.
export function useFriends(enabled = true) {
  return useQuery({
    queryKey: ['friends'],
    queryFn: viaimperiiApi.friendship.listFriends,
    enabled,
  });
}
