// Common types shared across entities

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Boundaries {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface GeoEntity extends BaseEntity {
  name: string;
  coordinates: Coordinates | null;
  boundaries: Boundaries | null;
}

export interface UIAttributeEntity {
  icon: string | null;
  image: string | null;
  color: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string | null;
  data: T[];
  pagination: PaginationMeta;
  size: number;
}

export interface PaginationMeta {
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

// Base query params
export interface BaseQueryParams {
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}
