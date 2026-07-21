import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LegionTreasuryApiError, ProposeStandardInput, ProposeStandardResult } from './dto';

// POST /legions/{id}/standard/{slug} — ABRE a votação de compra do estandarte
// (não compra mais na hora). Só o Centurião ou admin. O preço fica RESERVADO no
// cofre enquanto a votação corre, sem mover moeda.
//   404 estandarte inexistente · 403 não é o Centurião nem admin
//   409 estandarte já ativo · votação já aberta · cofre insuficiente
export async function proposeStandard({
  legionId,
  slug,
}: ProposeStandardInput): Promise<ProposeStandardResult> {
  const response = await apiFetch(`/legions/${legionId}/standard/${slug}`, { method: 'POST' });

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao propor o estandarte'),
    );
  }

  return readContent<ProposeStandardResult>(response);
}
