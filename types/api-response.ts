import { Pagination } from '@/types/pagination';

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  error_code?: number;
  errors?: unknown[];
}

export interface ApiResponsePaginated<T> extends ApiResponse<T[]> {
  pagination: Pagination;
  size: number;
}
