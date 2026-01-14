export interface GeoBoundaries {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: any[];
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeoLocation {
  id: string;
  name: string;
  coordinates: GeoCoordinates;
  boundaries: GeoBoundaries;
  [key: string]: any;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T[];
  pagination: PaginationMeta;
  size: number;
}
