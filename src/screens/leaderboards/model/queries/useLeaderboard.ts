import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { LeaderboardScope } from '../../../../api/leaderboards';

// Placar ao vivo do escopo selecionado. `scopeKey` = id da instância
// (legião/província) ou `professionId`; null no global.
export function useLeaderboard(
  scope: LeaderboardScope,
  scopeId: number | null,
  professionId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ['leaderboard', scope, scopeId ?? null, professionId ?? null],
    queryFn: () =>
      viaimperiiApi.leaderboards.board({ scope, scopeId, professionId, perPage: 50 }),
    enabled,
  });
}
