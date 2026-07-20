import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LegionTreasuryApiError, StandardProposalsResponse } from './dto';

// GET /legions/{id}/standard-proposals — histórico de propostas (qualquer
// status), mais novas primeiro. `limit` aceito pelo backend é 1–50 (default 10).
export async function getStandardProposals(
  legionId: number,
  limit = 10,
): Promise<StandardProposalsResponse> {
  const response = await apiFetch(`/legions/${legionId}/standard-proposals?limit=${limit}`);

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao carregar as propostas de estandarte'),
    );
  }

  return readContent<StandardProposalsResponse>(response);
}
