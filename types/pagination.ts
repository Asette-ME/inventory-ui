export interface Pagination {
  total: number;
  filtered: number;
  limit: number;
  page: number;
  total_pages: number;
  next_page: number | null;
  previous_page: number | null;
  has_next: boolean;
  has_previous: boolean;
}
