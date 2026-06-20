import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface CompletedMission {
  mission_id: string;
  completed_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  rank: string;
  total_xp: number;
  main_specialty: string | null;
  mastery: Record<string, number>;
  completed_missions: CompletedMission[];
  medals: string[];
  completed_campaigns: string[];
  created_at: string;
}

export interface RankImage {
  id: number;
  name: string;
  level: number;
  icon_url: string | null;
  image_url: string | null;
}

export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  xp_reward: number;
  specialty_id: number | null;
  icon_url: string | null;
  achieved_at: string | null;
}

export interface UserTrack {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface UserLegion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
  specialty_id: number | null;
}

export interface UserProvince {
  id: number;
  name: string;
  abbreviation: string | null;
  country_id: number | null;
}

export interface GetUserResponse {
  user: UserProfile;
  xp_to_next_rank: number;
  must_choose_track: boolean;
  track: UserTrack | null;
  legion: UserLegion | null;
  province: UserProvince | null;
  current_rank: RankImage | null;
  ranks: RankImage[];
  achievements: Achievement[];
}

export async function getUserProfile(userId: string): Promise<GetUserResponse> {
  const response = await apiFetch(`/users/${userId}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar perfil'));
  }

  return readContent<GetUserResponse>(response);
}

export type StatsPeriod = 'weekly' | 'monthly' | 'annual' | 'all';

export interface UserStats {
  period: string;
  start_date: string | null;
  end_date: string | null;
  total_xp: number;
  current_rank: string;
  medals_count: number;
  missions_in_progress: number;
  missions_completed_total: number;
  xp_in_period: number;
  missions_completed: number;
  campaigns_completed: number;
  achievements_unlocked: number;
  ranks_gained: number;
  active_days: number;
  xp_by_source: Record<string, number>;
}

export async function getUserStats(
  userId: string,
  period: StatsPeriod = 'all',
): Promise<UserStats> {
  const query = period !== 'all' ? `?period=${period}` : '';
  const response = await apiFetch(`/users/${userId}/stats${query}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar estatísticas'));
  }

  return readContent<UserStats>(response);
}
