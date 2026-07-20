import { apiFetch, readContent, readError } from '../config/defaultApi';
import { DonateToTreasuryInput, DonateToTreasuryResult, LegionTreasuryApiError } from './dto';

// POST /legions/{id}/treasury/donate — só membros (403), só de fundos não-restritos.
// 409 saldo insuficiente · 422 amount/unit inválidos.
export async function donateToTreasury({
  legionId,
  amount,
  unit,
}: DonateToTreasuryInput): Promise<DonateToTreasuryResult> {
  const response = await apiFetch(`/legions/${legionId}/treasury/donate`, {
    method: 'POST',
    body: JSON.stringify({ amount, unit }),
  });

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao enviar o tributo'),
    );
  }

  return readContent<DonateToTreasuryResult>(response);
}
