import { apiFetch, readContent, readError } from '../config/defaultApi';

const LOAD_ERROR = 'Não foi possível carregar o placar.';

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

function buildParams(q: LeaderboardQuery): string {
  const params = new URLSearchParams();
  params.set('scope', q.scope);
  if (q.scopeId != null) params.set('scopeId', String(q.scopeId));
  if (q.professionId != null) params.set('professionId', String(q.professionId));
  if (q.perPage != null) params.set('perPage', String(q.perPage));
  return params.toString();
}

export async function getLeaderboard(q: LeaderboardQuery): Promise<Leaderboard> {
  const res = await apiFetch(`/leaderboards?${buildParams(q)}`);
  if (!res.ok) throw new Error(await readError(res, LOAD_ERROR));
  return readContent<Leaderboard>(res);
}

export interface LeaderboardHistoryQuery extends LeaderboardQuery {
  isoYear?: number;
  isoWeek?: number;
}

export async function getLeaderboardHistory(q: LeaderboardHistoryQuery): Promise<Leaderboard> {
  const params = new URLSearchParams(buildParams(q));
  if (q.isoYear != null) params.set('isoYear', String(q.isoYear));
  if (q.isoWeek != null) params.set('isoWeek', String(q.isoWeek));
  const res = await apiFetch(`/leaderboards/history?${params.toString()}`);
  if (!res.ok) throw new Error(await readError(res, LOAD_ERROR));
  return readContent<Leaderboard>(res);
}

export async function getLeaderboardScopes(): Promise<LeaderboardScopes> {
  const res = await apiFetch('/leaderboards/scopes');
  if (!res.ok) throw new Error(await readError(res, LOAD_ERROR));
  return readContent<LeaderboardScopes>(res);
}
