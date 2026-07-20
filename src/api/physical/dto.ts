// Tipos de produto do mercado (bate com PRODUCT_TYPES do backend).
export type ProductType = 'apparel' | 'drinkware' | 'accessory' | 'collectible' | 'other';

export const PRODUCT_TYPES: ProductType[] = [
  'apparel',
  'drinkware',
  'accessory',
  'collectible',
  'other',
];

// Produto físico do mercado (GET /physical-products).
export interface PhysicalProduct {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  product_type: ProductType;
  price: number; // unidades atômicas
  price_display: string;
  image_url: string | null; // null → mostrar placeholder SVG por tipo
  stock: number | null; // null = ilimitado
  is_active: boolean;
  affordable: boolean | null; // vs. saldo gastável do usuário
}

export interface PaginatedProducts {
  page: number;
  perPage: number;
  totalItems: number;
  items: PhysicalProduct[];
}

export interface RedemptionResult {
  id: number;
  product_id: number;
  product_name: string;
  coins_spent: number;
  coins_spent_display: string;
  status: string;
  shipping_info: string | null;
  created_at: string;
}

export interface RedeemResponse {
  message: string;
  redemption: RedemptionResult;
  coin_balance: number;
  coin_balance_display: string;
  general_balance: number;
  general_balance_display: string;
}

export interface ProductCatalogParams {
  type?: ProductType;
  page?: number;
  perPage?: number;
}
