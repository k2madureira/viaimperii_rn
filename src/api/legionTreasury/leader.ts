import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LegionLeaderResponse, LegionTreasuryApiError } from './dto';

// GET /legions/{id}/leader — quem lidera E a conta que produziu a escolha
// (regra, janela de atividade e ranking de candidatos), para a UI explicar
// sozinha por que aquele membro. O cofre já devolve o mesmo objeto embutido;
// esta operação serve quando se quer o líder isolado.
export async function getLegionLeader(legionId: number): Promise<LegionLeaderResponse> {
  const response = await apiFetch(`/legions/${legionId}/leader`);

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao carregar o Centurião da legião'),
    );
  }

  return readContent<LegionLeaderResponse>(response);
}
