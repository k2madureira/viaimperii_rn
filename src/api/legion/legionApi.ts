import { apiFetch } from '../config/defaultApi';

export interface Legion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
}

export async function getLegion(legionId: number): Promise<Legion> {
  const response = await apiFetch(`/legions/${legionId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? error.message ?? 'Erro ao carregar a legião');
  }

  const json = await response.json();
  return (json.content ?? json) as Legion;
}
