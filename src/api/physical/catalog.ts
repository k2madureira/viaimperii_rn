import { apiFetch, readContent, readError } from '../config/defaultApi';
import { PaginatedProducts, ProductCatalogParams } from './dto';

// Catálogo paginado de produtos físicos, filtrável por tipo NO SERVIDOR.
export async function getProducts(params: ProductCatalogParams = {}): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.page) qs.set('page', String(params.page));
  if (params.perPage) qs.set('per_page', String(params.perPage));

  const query = qs.toString();
  const response = await apiFetch(`/physical-products${query ? `?${query}` : ''}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o mercado'));
  }

  return readContent<PaginatedProducts>(response);
}
