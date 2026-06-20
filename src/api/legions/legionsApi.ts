import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Legion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
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

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao ingressar na legião'));
  }

  return readContent<JoinLegionResult>(response);
}
