import { apiFetch, readContent, readError } from '../config/defaultApi';
import { AssetCatalogParams, PaginatedAssets } from './dto';

// Catálogo paginado de cosméticos. Cada item traz owned/is_active/affordable.
export async function getAssetCatalog(params: AssetCatalogParams = {}): Promise<PaginatedAssets> {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.rarity) qs.set('rarity', params.rarity);
  if (params.owned != null) qs.set('owned', String(params.owned));
  if (params.page) qs.set('page', String(params.page));
  if (params.perPage) qs.set('per_page', String(params.perPage));

  const query = qs.toString();
  const response = await apiFetch(`/assets${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a loja'));
  }

  return readContent<PaginatedAssets>(response);
}
