import { FeedAuthor } from '../feed';

// Erro do board que carrega o status HTTP, para o front distinguir os estados
// de UI (422 escopo sem id · 404 país/província inexistente).
export class LegionLeaderboardApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'LegionLeaderboardApiError';
    this.status = status;
  }
}

export type BoardScope = 'global' | 'country' | 'province';

// Whitelist do backend. Um valor desconhecido NÃO é erro — cai no default
// (`xp_week`), então o cliente pode evoluir sem quebrar leitura.
export type BoardSortField =
  | 'xp_week'
  | 'active_members'
  | 'total_members'
  | 'missions_week'
  | 'avg_xp_per_active'
  | 'treasury';

export interface BoardWeek {
  iso_year: number;
  iso_week: number;
  starts_at: string; // ISO8601 com offset SP
  ends_at: string;
}

export interface LegionStandardMini {
  slug: string;
  name: string;
  multiplier_pct: number;
  remaining_seconds: number;
}

export interface LegionBoardItem {
  position: number;
  legion_id: number;
  name: string;
  symbol: string | null;
  image_url: string | null;
  thumb_url: string | null;
  specialty_id: number | null;
  // Os DOIS sempre: `total_members` sozinho esconde efetivo dormente e
  // `active_members` sozinho esconde o tamanho real. Juntos, o inchaço fica
  // visível (há legião com 208 totais e 0 ativos).
  active_members: number;
  total_members: number;
  xp_week: number; // critério default do ranking
  missions_week: number;
  avg_xp_per_active: number; // deixa legião pequena e dedicada competir
  treasury_balance: number; // asses atômicos
  treasury_balance_display: string;
  active_standard: LegionStandardMini | null;
  top_member: FeedAuthor | null;
}

export interface LegionLeaderboardParams {
  scope?: BoardScope;
  countryId?: number;
  provinceId?: number;
  sortField?: BoardSortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number; // 1–50, default 10
}

export interface LegionLeaderboardResponse {
  scope: BoardScope;
  scope_id: number | null;
  scope_name: string | null;
  // DUAS janelas, de propósito: `week` mede xp_week/missions_week (semana SP,
  // reseta segunda) e `active_window_days` mede active_members (7 dias
  // corridos). Rotular a partir destes campos, nunca com um 7 cravado.
  week: BoardWeek;
  active_window_days: number;
  sort_field: BoardSortField;
  sort_order: 'asc' | 'desc';
  // A linha da legião do requisitante, repetida quando ela fica FORA do top-N.
  // Null se ele não tem legião ou ela não tem membros no escopo.
  viewer_legion: LegionBoardItem | null;
  items: LegionBoardItem[];
}
