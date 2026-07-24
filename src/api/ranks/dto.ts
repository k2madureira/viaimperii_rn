export interface Track {
  id: number;
  name: string;
  slug: string; // 'legionarios' | 'patricios'
  description: string | null;
  attributes: string[];
  max_rank_image_url: string | null;
}

export interface ChooseTrackResult {
  message: string;
  track: string;
  rank: string;
  total_xp: number;
  xp_penalty: number;
}

export interface Rank {
  id: number;
  name: string;
  level: number;
  description: string | null;
  icon_url: string | null;
  image_url: string | null;
  thumb_url: string | null; // webp leve (256px) p/ listas/grids
  track_id: number | null; // NULL = patente compartilhada (Recruta I-IV, Governador+)
  xp_required: number; // XP acumulado para alcançar a patente (curva variável)
}

export interface PaginatedRanks {
  page: number;
  perPage: number;
  total: number;
  items: Rank[];
}
