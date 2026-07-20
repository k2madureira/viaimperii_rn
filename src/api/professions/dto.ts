// Profissão comprável no mercado — desbloqueia as missões vinculadas a ela.
export interface Profession {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  specialty_id: number | null;
  specialty_name: string | null;
  specialty_color: string | null; // cor da especialidade (#RRGGBB) — badges/filtros
  track_id: number | null;
  track_slug: string | null;
  icon_url: string | null;
  color: string | null; // cor-marca da profissão
  price: number; // preço cheio, asses atômicos (0 = grátis)
  price_display: string | null;
  discount_pct: number;
  on_sale: boolean;
  effective_price: number | null; // preço realmente cobrado (com desconto)
  effective_price_display: string | null;
  is_free: boolean;
  affordable: boolean | null;
  mission_count: number; // quantas missões pertencem à profissão
}

export interface ProfessionCatalogParams {
  track?: string; // slug da trilha: legionarios | patricios
  specialtyId?: number;
  perPage?: number;
}

export interface BuyProfessionResponse {
  message: string;
  profession: Profession;
  is_active: boolean;
  already_owned: boolean;
  discount_pct: number;
  coins_spent: number;
  coins_spent_display: string | null;
  coin_balance: number;
  coin_balance_display: string | null;
}

export interface UserProfessionItem {
  profession: Profession;
  is_active: boolean;
  acquired_at: string | null;
}
