import { useQuery } from '@tanstack/react-query';
import { getLeaderboardScopes } from '../../../../api/leaderboards/leaderboardsApi';

// Monta os escopos disponíveis para o viewer (global sempre; legião/província só
// se resolvíveis; profissões que ele tem). Base do seletor de abas.
export function useLeaderboardScopes(enabled = true) {
  return useQuery({
    queryKey: ['leaderboard-scopes'],
    queryFn: getLeaderboardScopes,
    enabled,
  });
}
