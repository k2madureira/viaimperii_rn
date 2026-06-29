import { apiFetch, readContent, readError } from '../config/defaultApi';

export type AssetRarity = 'legacy' | 'epic' | 'mythical' | 'legendary';

// Item do catálogo de cosméticos (GET /assets e GET /assets/owned).
export interface AssetItem {
  id: number;
  name: string;
  slug: string;
  url: string | null;
  type: string; // avatar | frame | badge | …
  rarity: AssetRarity;
  is_free: boolean;
  price: number; // unidades atômicas
  price_display: string;
  owned: boolean;
  is_active: boolean; // equipado pelo usuário
  affordable: boolean | null; // vs. saldo total do usuário
}

export interface PaginatedAssets {
  page: number;
  perPage: number;
  totalItems: number;
  items: AssetItem[];
}

export interface BuyAssetResponse {
  message: string;
  asset: AssetItem;
  coins_spent: number;
  coins_spent_display: string;
  coin_balance: number;
  coin_balance_display: string;
  general_balance: number;
  restricted_balance: number;
}

export interface EquipAssetResponse {
  message: string;
  asset: AssetItem;
}

export interface AssetCatalogParams {
  type?: string; // default avatar (no backend)
  rarity?: AssetRarity;
  owned?: boolean;
  page?: number;
  perPage?: number;
}

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

// Avatares (cosméticos) que o usuário já possui, com qual está ativo.
export async function getOwnedAssets(type = 'avatar'): Promise<AssetItem[]> {
  const response = await apiFetch(`/assets/owned${type ? `?type=${type}` : ''}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar seus avatares'));
  }

  return readContent<AssetItem[]>(response);
}

// Compra com moedas. 409 se já possui, 422 se saldo insuficiente.
export async function buyAsset(slug: string): Promise<BuyAssetResponse> {
  const response = await apiFetch(`/assets/${slug}/buy`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao comprar avatar'));
  }

  return readContent<BuyAssetResponse>(response);
}

// Ativa o avatar e desativa os outros do mesmo tipo.
export async function equipAsset(slug: string): Promise<EquipAssetResponse> {
  const response = await apiFetch(`/assets/${slug}/equip`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao equipar avatar'));
  }

  return readContent<EquipAssetResponse>(response);
}
