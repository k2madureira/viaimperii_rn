import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LegionTreasuryApiError, ProposeStandardResult } from './dto';

// POST /legions/{id}/war-room — abre a votação de compra (ou extensão) do
// acesso à Sala de Guerra. Mesmo caminho de consentimento do Estandarte:
// Praefectus propõe, 60% do efetivo ativo aprova em 5 dias.
//
// Comprar com o acesso ativo ESTENDE em vez de reiniciar, então propor de novo
// perto do fim não desperdiça os dias restantes.
//
//   403 não é o Praefectus nem admin
//   409 votação de Sala de Guerra já aberta · cofre sem saldo disponível
export async function proposeWarRoom(legionId: number): Promise<ProposeStandardResult> {
  const response = await apiFetch(`/legions/${legionId}/war-room`, { method: 'POST' });

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao propor a Sala de Guerra'),
    );
  }

  return readContent<ProposeStandardResult>(response);
}
