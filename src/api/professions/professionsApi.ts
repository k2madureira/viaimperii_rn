import { apiFetch, readContent, readError } from '../config/defaultApi';

// Profissão comprável no mercado — desbloqueia as missões vinculadas a ela.
export interface Profession {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  specialty_id: number | null;
  specialty_name: string | null;
  track_id: number | null;
  track_slug: string | null;
  icon_url: string | null;
  price: number; // preço cheio, asses atômicos (0 = grátis)
  price_display: string | null;
  discount_pct: number;
  on_sale: boolean;
  effective_price: number | null; // preço realmente cobrado (com desconto)
  effective_price_display: string | null;
  is_free: boolean;
  mission_count: number; // quantas missões pertencem à profissão
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

// Catálogo de profissões (GET /professions).
export async function getProfessions(): Promise<Profession[]> {
  const response = await apiFetch('/professions');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar as profissões'));
  }

  return readContent<Profession[]>(response);
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
