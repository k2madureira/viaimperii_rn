import { apiFetch, readContent, readError } from '../config/defaultApi';
import {
  LegionLeaderboardApiError,
  LegionLeaderboardParams,
  LegionLeaderboardResponse,
} from './dto';

// GET /legions/leaderboard — rankeia LEGIÕES entre si, em escopo global, de país
// ou de província.
//
// Escopo é territorial e a legião é global: province/country contam só os
// membros localizados ali, então uma legião espalhada pode perder o board local
// sendo grande no total. É a leitura desejada de "a mais forte AQUI".
//
//   422 escopo inválido ou id obrigatório ausente · 404 país/província inexistente
export async function getLegionLeaderboard(
  params: LegionLeaderboardParams = {},
): Promise<LegionLeaderboardResponse> {
  const query = new URLSearchParams();

  if (params.scope) query.set('scope', params.scope);
  if (params.countryId != null) query.set('countryId', String(params.countryId));
  if (params.provinceId != null) query.set('provinceId', String(params.provinceId));
  if (params.sortField) query.set('sortField', params.sortField);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);
  if (params.limit != null) query.set('limit', String(params.limit));

  const qs = query.toString();
  const response = await apiFetch(`/legions/leaderboard${qs ? `?${qs}` : ''}`);

  if (!response.ok) {
    throw new LegionLeaderboardApiError(
      response.status,
      await readError(response, 'Erro ao carregar o ranking de legiões'),
    );
  }

  return readContent<LegionLeaderboardResponse>(response);
}
