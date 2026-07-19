export interface LegionProvince {
  id: number;
  name: string;
  quantityUsers: number;
}

export interface LegionCountry {
  id: number;
  name: string;
  icon_url: string | null;
  provinces: LegionProvince[];
}

export interface Legion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
  thumb_url: string | null; // webp leve (256px) p/ listas/grids
  specialty_id: number | null;
  total_users: number;
  countries: LegionCountry[];
}

export interface JoinLegionResult {
  message: string;
  legion_id: number;
  legion_name: string;
  balance_status: 'shortage' | 'balanced' | 'excess' | null;
  distribution: Record<string, number>;
}