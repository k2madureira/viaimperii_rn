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
  // ── sempre presentes (também na prévia gratuita) ──────────────────────────
  position: number;
  legion_id: number;
  name: string;
  symbol: string | null;
  image_url: string | null;
  thumb_url: string | null;
  specialty_id: number | null;
  xp_week: number; // critério default do ranking

  // ── campos PAGOS: `null` quando `access === 'preview'` ────────────────────
  // A censura acontece no SERVIDOR. Mascarar no cliente significaria que a
  // resposta completa já chegou ao device, onde qualquer proxy a lê.
  //
  // `active_members`/`total_members` continuam vindo juntos no `full`: um
  // sozinho esconde metade da verdade (há legião com 208 totais e 0 ativos).
  active_members: number | null;
  total_members: number | null;
  missions_week: number | null;
  avg_xp_per_active: number | null; // deixa legião pequena e dedicada competir
  treasury_balance: number | null; // asses atômicos
  treasury_balance_display: string | null;
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
  // 'preview' = prévia gratuita (3 linhas, só brasão e xp_week);
  // 'full' = a legião tem acesso à Sala de Guerra.
  //
  // Na prévia o backend IGNORA scope/sortField/limit e responde sempre global
  // por xp_week — honrá-los deixaria varrer o board de três em três linhas e
  // remontar o conteúdo pago. Por isso a UI desabilita abas e chips no preview.
  access: 'preview' | 'full';
  // Posse da Sala de Guerra, para o cliente travar a tela a partir do DADO em
  // vez de uma constante de build.
  war_room_unlocked: boolean;
  war_room_expires_at: string | null;
  // Quantas legiões existem no escopo. Três linhas não expressam "você é #7 de
  // 12", e essa razão é boa parte do que puxa para a compra.
  total_legions: number;
  // A linha da legião do requisitante, repetida quando ela fica FORA do top-N.
  // Null se ele não tem legião ou ela não tem membros no escopo.
  viewer_legion: LegionBoardItem | null;
  items: LegionBoardItem[];
}
