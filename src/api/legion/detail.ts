import { apiFetch, readContent, readError } from '../config/defaultApi';

import { Legion } from "./dto";

export async function getLegion(legionId: number): Promise<Legion> {
  const response = await apiFetch(`/legions/${legionId}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a legião'));
  }

  return readContent<Legion>(response);
}
