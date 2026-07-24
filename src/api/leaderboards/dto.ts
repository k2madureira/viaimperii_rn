// Placares semanais escopados (reset segunda 00:00 SP). Response-wrapped: os
// dados vêm em `content.*`. O board ao vivo usa chaves camelCase; o histórico
// repete o shape do live e ainda traz `prize_amount`/`prize_amount_display`
// (snake) por linha (semana fechada).

export type LeaderboardScope = 'global' | 'legion' | 'province' | 'profession';

export interface LeaderboardMiniRank {
  id: number | string;
  name: string;
  image?: string | null;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  image?: string | null;
  active_avatar?: { url?: string | null } | null;
  rank?: LeaderboardMiniRank | null;
  legion_id?: number | null;
}

export interface LeaderboardItem {
  position: number;
  xp: number;
  user: LeaderboardUser;
  // Só no histórico (semana fechada):
  prize_amount?: number;
  prize_amount_display?: string;
}

export interface LeaderboardViewer {
  position: number | null;
  xp: number;
}

export interface Leaderboard {
  scope: LeaderboardScope;
  scopeKey: number | null;
  weekStart: string;
  weekEnd: string;
  items: LeaderboardItem[];
  viewer: LeaderboardViewer;
  prizes: Record<string, number>; // denarii por posição ("1","2","3")
}

export interface LeaderboardScopeRef {
  id: number;
  name: string;
}

export interface LeaderboardScopes {
  global_available: boolean;
  legion: LeaderboardScopeRef | null;
  province: LeaderboardScopeRef | null;
  professions: LeaderboardScopeRef[];
}

export interface LeaderboardQuery {
  scope: LeaderboardScope;
  scopeId?: number | null;
  professionId?: number | null;
  perPage?: number;
}

export interface LeaderboardHistoryQuery extends LeaderboardQuery {
  isoYear?: number;
  isoWeek?: number;
}

export const LEADERBOARD_LOAD_ERROR = 'Não foi possível carregar o placar.';

export function buildLeaderboardParams(q: LeaderboardQuery): string {
  const params = new URLSearchParams();
  params.set('scope', q.scope);
  if (q.scopeId != null) params.set('scopeId', String(q.scopeId));
  if (q.professionId != null) params.set('professionId', String(q.professionId));
  if (q.perPage != null) params.set('perPage', String(q.perPage));
  return params.toString();
}
