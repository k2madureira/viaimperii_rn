import { apiFetch, readContent, readError } from '../config/defaultApi';
import { Profession, ProfessionCatalogParams } from './dto';

// Catálogo de profissões (GET /professions) — resposta paginada; retorna os itens.
export async function getProfessions(params: ProfessionCatalogParams = {}): Promise<Profession[]> {
  const qs = new URLSearchParams();
  if (params.track) qs.set('track', params.track);
  if (params.specialtyId != null) qs.set('specialtyId', String(params.specialtyId));
  qs.set('perPage', String(params.perPage ?? 100));

  const response = await apiFetch(`/professions?${qs.toString()}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar as profissões'));
  }

  const data = await readContent<{ items: Profession[] }>(response);
  return data.items ?? [];
}
