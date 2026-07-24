import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { LegionLeaderboardParams } from '../../../../api/legionLeaderboard';

/**
 * Ranking de legiões da War Room.
 *
 * A key inclui escopo e ordenação porque cada combinação é um board diferente
 * — cachear tudo sob uma key só faria a troca de aba mostrar o board anterior.
 */
export function useLegionLeaderboard(params: LegionLeaderboardParams = {}) {
  const { scope = 'global', countryId, provinceId, sortField = 'xp_week', limit = 10 } = params;

  return useQuery({
    queryKey: ['legion-leaderboard', scope, countryId ?? null, provinceId ?? null, sortField, limit],
    queryFn: () =>
      viaimperiiApi.legionLeaderboard.board({ scope, countryId, provinceId, sortField, limit }),
  });
}
