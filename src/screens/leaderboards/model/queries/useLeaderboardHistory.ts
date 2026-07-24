import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { LeaderboardScope } from '../../../../api/leaderboards';

// Semana FECHADA do escopo. Sem `isoYear`/`isoWeek` volta a última semana
// fechada; com eles (ex.: vindo de uma notificação de prêmio) abre a semana exata.
export function useLeaderboardHistory(
  scope: LeaderboardScope,
  scopeId: number | null,
  professionId: number | null,
  isoYear: number | null,
  isoWeek: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      'leaderboard-history',
      scope,
      scopeId ?? null,
      professionId ?? null,
      isoYear ?? null,
      isoWeek ?? null,
    ],
    queryFn: () =>
      viaimperiiApi.leaderboards.history({
        scope,
        scopeId,
        professionId,
        isoYear: isoYear ?? undefined,
        isoWeek: isoWeek ?? undefined,
        perPage: 50,
      }),
    enabled,
  });
}
