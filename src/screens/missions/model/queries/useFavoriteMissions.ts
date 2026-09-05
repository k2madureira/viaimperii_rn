import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Lista "executar hoje" (favoritas visíveis, mais recentes primeiro). A higiene
// automática é do backend — o app só renderiza o que vier.
export function useFavoriteMissions(enabled = true, page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['missions-favorites', page, perPage],
    queryFn: () => viaimperiiApi.missions.favorites(page, perPage),
    enabled,
  });
}
