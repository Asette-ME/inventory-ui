export interface Params {
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
  page?: number;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
}
