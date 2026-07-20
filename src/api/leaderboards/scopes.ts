import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LEADERBOARD_LOAD_ERROR, LeaderboardScopes } from './dto';

export async function getLeaderboardScopes(): Promise<LeaderboardScopes> {
  const res = await apiFetch('/leaderboards/scopes');
  if (!res.ok) throw new Error(await readError(res, LEADERBOARD_LOAD_ERROR));
  return readContent<LeaderboardScopes>(res);
}
