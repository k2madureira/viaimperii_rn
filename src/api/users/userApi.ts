import { apiFetch } from '../config/defaultApi';

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

export interface GetUserResponse {
  user: UserProfile;
  xp_to_next_rank: number;
  current_rank: RankImage | null;
  ranks: RankImage[];
  achievements: Achievement[];
}

export async function getUserProfile(userId: string): Promise<GetUserResponse> {
  const response = await apiFetch(`/users/${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? error.message ?? 'Erro ao carregar perfil');
  }

  const json = await response.json();
  return (json.content ?? json) as GetUserResponse;
}
