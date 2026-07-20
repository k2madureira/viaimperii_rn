import { apiFetch, readContent, readError } from '../config/defaultApi';
import { buildLeaderboardParams, Leaderboard, LEADERBOARD_LOAD_ERROR, LeaderboardQuery } from './dto';

export async function getLeaderboard(q: LeaderboardQuery): Promise<Leaderboard> {
  const res = await apiFetch(`/leaderboards?${buildLeaderboardParams(q)}`);
  if (!res.ok) throw new Error(await readError(res, LEADERBOARD_LOAD_ERROR));
  return readContent<Leaderboard>(res);
}
