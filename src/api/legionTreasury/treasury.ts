import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LegionTreasury, LegionTreasuryApiError } from './dto';

// GET /legions/{id}/treasury — saldo, movimentações recentes, estandarte ativo e
// catálogo de estandartes com `affordable` contra o saldo do cofre.
export async function getLegionTreasury(legionId: number): Promise<LegionTreasury> {
  const response = await apiFetch(`/legions/${legionId}/treasury`);

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao carregar o cofre da legião'),
    );
  }

  return readContent<LegionTreasury>(response);
}
