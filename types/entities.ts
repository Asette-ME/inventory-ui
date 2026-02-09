// Entity-specific types

import { BaseEntity, BaseQueryParams, Coordinates, Boundaries, GeoEntity, UIAttributeEntity } from './common';

// Re-export common types for convenience
export type { Coordinates, Boundaries };

// ============= ROLE =============
export interface Role extends BaseEntity, UIAttributeEntity {
  name: string;
}

export interface RoleCreateInput {
  name: string;
  icon?: string | null;
  image?: string | null;
  color?: string | null;
}

export interface RoleUpdateInput extends Partial<RoleCreateInput> {}

export interface RoleQueryParams extends BaseQueryParams {}

// ============= USER =============
export interface User extends BaseEntity {
  username: string;
  email: string;
  phone: string | null;
  image: string | null;
  deleted_at: string | null;
  last_login_at: string | null;
  roles: Role[];
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  phone?: string | null;
  image?: string | null;
  roles?: string[];
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  phone?: string | null;
  image?: string | null;
  roles?: string[];
}

export interface UserQueryParams extends BaseQueryParams {
  roles?: string[];
  show_deleted?: boolean;
}

// ============= COUNTRY =============
export interface Country extends GeoEntity {
  code: string;
  flag: string | null;
  currency: string | null;
  phone_code: string | null;
}

export interface CountryCreateInput {
  name: string;
  code: string;
  currency?: string | null;
  phone_code?: string | null;
  coordinates?: Coordinates | null;
  boundaries?: number[][][] | number[][][][] | null;
}

export interface CountryUpdateInput extends Partial<CountryCreateInput> {}

export interface CountryQueryParams extends BaseQueryParams {}

// ============= CITY =============
export interface City extends GeoEntity {
  country_id: string;
  timezone: string | null;
}

export interface CityCreateInput {
  name: string;
  country_id: string;
  timezone?: string | null;
  coordinates?: Coordinates | null;
  boundaries?: number[][][] | number[][][][] | null;
}

export interface CityUpdateInput extends Partial<CityCreateInput> {}

export interface CityQueryParams extends BaseQueryParams {
  country_id?: string;
}

// ============= DISTRICT =============
export interface District extends GeoEntity {
  city_id: string;
}

export interface DistrictCreateInput {
  name: string;
  city_id: string;
  coordinates?: Coordinates | null;
  boundaries?: number[][][] | number[][][][] | null;
}

export interface DistrictUpdateInput extends Partial<DistrictCreateInput> {}

export interface DistrictQueryParams extends BaseQueryParams {
  city_id?: string;
}

// ============= AREA =============
export interface Area extends GeoEntity {}

export interface AreaCreateInput {
  name: string;
  coordinates?: Coordinates | null;
  boundaries?: number[][][] | number[][][][] | null;
}

export interface AreaUpdateInput extends Partial<AreaCreateInput> {}

export interface AreaQueryParams extends BaseQueryParams {}

// ============= CATEGORY =============
export interface Category extends BaseEntity {
  name: string;
}

export interface CategoryCreateInput {
  name: string;
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {}

export interface CategoryQueryParams extends BaseQueryParams {}

// ============= AMENITY =============
export interface Amenity extends GeoEntity, UIAttributeEntity {
  description: string | null;
}

export interface AmenityCreateInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  image?: string | File | null;
  color?: string | null;
}

export interface AmenityUpdateInput extends Partial<AmenityCreateInput> {}

export interface AmenityQueryParams extends BaseQueryParams {}

// ============= ATTRACTION =============
export interface Attraction extends GeoEntity, UIAttributeEntity {
  description: string | null;
}

export interface AttractionCreateInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  color?: string | null;
  coordinates?: Coordinates | null;
  boundaries?: number[][][] | number[][][][] | null;
}

export interface AttractionUpdateInput extends Partial<AttractionCreateInput> {}

export interface AttractionQueryParams extends BaseQueryParams {}

// ============= TRANSPORT =============
export interface Transport extends BaseEntity, UIAttributeEntity {
  name: string;
}

export interface TransportCreateInput {
  name: string;
  icon?: string | null;
  image?: string | null;
  color?: string | null;
}

export interface TransportUpdateInput extends Partial<TransportCreateInput> {}

export interface TransportQueryParams extends BaseQueryParams {}

// ============= FEATURE TYPE =============
export interface FeatureType extends BaseEntity, UIAttributeEntity {
  name: string;
}

export interface FeatureTypeCreateInput {
  name: string;
  icon?: string | null;
  image?: string | null;
  color?: string | null;
}

export interface FeatureTypeUpdateInput extends Partial<FeatureTypeCreateInput> {}

export interface FeatureTypeQueryParams extends BaseQueryParams {}

// ============= STRUCTURE TYPE =============
export interface StructureType extends BaseEntity, UIAttributeEntity {
  name: string;
}

export interface StructureTypeCreateInput {
  name: string;
  icon?: string | null;
  image?: string | null;
  color?: string | null;
}

export interface StructureTypeUpdateInput extends Partial<StructureTypeCreateInput> {}

export interface StructureTypeQueryParams extends BaseQueryParams {}
