import { apiFetch, readContent, readError } from '../config/defaultApi';

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

// Profissões que o usuário já possui (GET /users/{id}/professions).
export async function getUserProfessions(userId: string): Promise<UserProfessionItem[]> {
  const response = await apiFetch(`/users/${userId}/professions`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar suas profissões'));
  }

  const data = await readContent<{ items: UserProfessionItem[] }>(response);
  return data.items ?? [];
}

// Compra acesso a uma profissão com moedas. 409 se já possui, 422 se saldo insuficiente.
export async function buyProfession(professionId: number): Promise<BuyProfessionResponse> {
  const response = await apiFetch(`/professions/${professionId}/buy`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao comprar a profissão'));
  }

  return readContent<BuyProfessionResponse>(response);
}
