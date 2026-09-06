export interface RankingItem {
  position: number;
  name: string;
  rank: string;
  total_xp: number;
  main_specialty: string;
  total_medals: number;
  medals: string[];
  // Insígnia de fundador (§34). Best-effort/opcional.
  is_founder?: boolean;
  founder_number?: number | null;
}

export interface RankingResponse {
  ranking: RankingItem[];
}
