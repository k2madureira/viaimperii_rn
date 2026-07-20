export interface Specialty {
  id: number;
  name: string;
  latin_name: string | null;
  description: string | null;
  icon: string | null;
  icon_url: string | null;
  color: string | null; // cor da especialidade (#RRGGBB) — badges/filtros
}

export interface PaginatedSpecialties {
  page: number;
  perPage: number;
  total: number;
  items: Specialty[];
}
