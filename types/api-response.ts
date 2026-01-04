import { Pagination } from '@/types/pagination';

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface ApiResponsePaginated<T> extends ApiResponse<T[]> {
  pagination: Pagination;
  size: number;
}
