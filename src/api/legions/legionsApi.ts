import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Legion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
  thumb_url: string | null; // webp leve (256px) p/ listas/grids
  specialty_id: number | null;
}

interface PaginatedLegions {
  page: number;
  perPage: number;
  total: number;
  items: Legion[];
}

export interface JoinLegionResult {
  message: string;
  legion_id: number;
  legion_name: string;
  balance_status: 'shortage' | 'balanced' | 'excess' | null;
  distribution: Record<string, number>;
}

// Legio X Equestris é exclusiva de admins — não deve aparecer para usuários comuns.
const ADMIN_LEGION = /equestris/i;

export async function getLegions(): Promise<Legion[]> {
  const response = await apiFetch('/legions?page=1&perPage=50');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar legiões'));
  }

  const data = await readContent<PaginatedLegions | Legion[]>(response);
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return items.filter((l) => !ADMIN_LEGION.test(l.name));
}

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
