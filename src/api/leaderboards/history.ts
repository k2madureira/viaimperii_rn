import { apiFetch, readContent, readError } from '../config/defaultApi';
import {
  buildLeaderboardParams,
  Leaderboard,
  LEADERBOARD_LOAD_ERROR,
  LeaderboardHistoryQuery,
} from './dto';

export async function getLeaderboardHistory(q: LeaderboardHistoryQuery): Promise<Leaderboard> {
  const params = new URLSearchParams(buildLeaderboardParams(q));
  if (q.isoYear != null) params.set('isoYear', String(q.isoYear));
  if (q.isoWeek != null) params.set('isoWeek', String(q.isoWeek));
  const res = await apiFetch(`/leaderboards/history?${params.toString()}`);
  if (!res.ok) throw new Error(await readError(res, LEADERBOARD_LOAD_ERROR));
  return readContent<Leaderboard>(res);
}
