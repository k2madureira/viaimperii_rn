export type AssetRarity = 'legacy' | 'epic' | 'mythical' | 'legendary';

// Item do catálogo de cosméticos (GET /assets e GET /assets/owned).
export interface AssetItem {
  id: number;
  name: string;
  slug: string;
  url: string | null;
  thumb_url: string | null; // webp leve (~12KB) p/ listas/ícones
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
