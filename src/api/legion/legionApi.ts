import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Legion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
}

export async function getLegion(legionId: number): Promise<Legion> {
  const response = await apiFetch(`/legions/${legionId}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a legião'));
  }

  return readContent<Legion>(response);
}
