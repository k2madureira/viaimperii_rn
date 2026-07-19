export interface IPaginated<T> {
  page: number;
  perPage: number;
  total: number;
  items: T[]; 
}