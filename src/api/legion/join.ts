import { apiFetch, readContent, readError } from '../config/defaultApi';
import { JoinLegionResult } from './dto';


export async function joinLegion(userId: string, legionId: number): Promise<JoinLegionResult> {
  const response = await apiFetch(`/users/${userId}/legion`, {
    method: 'POST',
    body: JSON.stringify({ legion_id: legionId }),
  });

  // 409 "already belongs": o usuário já está nesta legião (ex.: perfil defasado no
  // prod lento). O estado final desejado já foi alcançado → trata como sucesso para
  // fechar o modal e atualizar a tela em vez de travar num erro.
  if (response.status === 409) {
    return { message: '', legion_id: legionId, legion_name: '', balance_status: null, distribution: {} };
  }

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao ingressar na legião'));
  }

  return readContent<JoinLegionResult>(response);
}