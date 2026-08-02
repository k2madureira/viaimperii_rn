import { FeedAuthor } from '../feed';

// Divisão hierárquica do clã (5 níveis, maior → menor poder):
// marechal(5) → general(4) → major(3) → capitão(2) → soldado(1).
export type ClanDivision = 'soldado' | 'capitão' | 'major' | 'general' | 'marechal';

// Escada de capacidade (níveis de membros) — usada no detalhe/loja.
export interface ClanUpgradeInfo {
  level: number;
  member_cap: number;
  max_level: number;
  next_level: number | null;
  next_member_cap: number | null;
  next_price: number | null; // atômico (asses)
  next_price_display: string | null; // humanizado, ex.: "4 aurei"
}

export interface ClanMemberItem {
  user: FeedAuthor;
  rank_level: number; // 1..5
  division: string; // soldado | capitão | major | general | marechal
  joined_at: string | null;
}

// Linha do diretório de clãs.
export interface ClanSummary {
  id: number;
  slug: string;
  name: string;
  tag: string | null;
  emblem_url: string | null;
  level: number;
  member_cap: number;
  members_count: number;
  marshal: FeedAuthor | null;
}

export interface ClanDetail extends ClanSummary {
  description: string | null;
  upgrade: ClanUpgradeInfo;
  members: ClanMemberItem[];
  // Divisão do próprio viewer neste clã (null se não é membro).
  my_rank_level: number | null;
  my_division: string | null;
}

export interface PaginatedClans {
  page: number;
  perPage: number;
  totalItems: number;
  items: ClanSummary[];
}

// Resposta genérica de toda ação de comando do clã.
export interface ClanActionResponse {
  clan_id: number | null;
  status: string; // created | invited | joined | declined | promoted | demoted |
  //               kicked | left | transferred | upgraded | dissolved | none
  message: string;
  rank_level?: number | null;
  division?: string | null;
  level?: number | null;
  member_cap?: number | null;
  coins_spent?: number | null;
  coins_spent_display?: string | null;
  user?: FeedAuthor | null; // a outra parte (alvo de convite/promoção/expulsão)
}

export interface ClanInviteItem {
  id: number; // id do convite — usado para aceitar/recusar
  clan: ClanSummary;
  inviter: FeedAuthor;
  created_at: string;
}

export interface ClanInvitesResponse {
  total: number;
  items: ClanInviteItem[];
}

// Solicitação de ingresso (join request) — espelho invertido do convite
// (usuário → clã). Fila do oficial (capitão+): traz o solicitante.
export interface ClanJoinRequestItem {
  id: number; // id da solicitação — usado para aceitar/recusar
  user: FeedAuthor;
  created_at: string;
}

export interface ClanJoinRequestsResponse {
  total: number;
  items: ClanJoinRequestItem[];
}

// Minha própria solicitação pendente — inclui o clã alvo.
export interface MyClanJoinRequestItem {
  id: number;
  clan: ClanSummary;
  created_at: string;
}

export interface MyClanJoinRequestsResponse {
  total: number;
  items: MyClanJoinRequestItem[];
}

// GET /users/{id}/clan — o clã do usuário + sua divisão, ou clã nulo.
export interface UserClanResponse {
  clan: ClanDetail | null;
  rank_level: number | null;
  division: string | null;
}

export interface CreateClanInput {
  name: string;
  tag?: string;
  description?: string;
  // Key pública do presign (purpose=clan) — emblema escolhido na fundação (opcional).
  emblem_key?: string;
}

// Convite por @handle (preferido) ou por user_id (fallback do autocomplete).
export interface ClanInviteInput {
  handle?: string;
  user_id?: string;
}

export interface ClanListParams {
  q?: string;
  page?: number;
  perPage?: number;
}
