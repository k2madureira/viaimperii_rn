import { apiFetch, readContent, readError } from '../config/defaultApi';
import { UpdateProvinceResult } from './dto';

export async function updateUserProvince(
  userId: string,
  provinceId: number,
): Promise<UpdateProvinceResult> {
  // Consolidado em PATCH /users/{id} (o antigo /users/{id}/province foi removido).
  const response = await apiFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ province_id: provinceId }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao atualizar província'));
  }

  return readContent<UpdateProvinceResult>(response);
}
