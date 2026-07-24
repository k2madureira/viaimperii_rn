export interface Province {
  id: number;
  name: string;
  abbreviation: string | null;
  country_id: number;
}

export interface PaginatedProvinces {
  page: number;
  perPage: number;
  total: number;
  items: Province[];
}

export interface UpdateProvinceResult {
  message: string;
  province_id: number;
  province_name: string;
}
