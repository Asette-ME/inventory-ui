'use server';

import { ApiResponse, ApiListResponse } from '@/types/common';
import {
  Role,
  RoleCreateInput,
  RoleUpdateInput,
  RoleQueryParams,
  User,
  UserCreateInput,
  UserUpdateInput,
  UserQueryParams,
  Country,
  CountryCreateInput,
  CountryUpdateInput,
  CountryQueryParams,
  City,
  CityCreateInput,
  CityUpdateInput,
  CityQueryParams,
  District,
  DistrictCreateInput,
  DistrictUpdateInput,
  DistrictQueryParams,
  Area,
  AreaCreateInput,
  AreaUpdateInput,
  AreaQueryParams,
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryQueryParams,
  Amenity,
  AmenityCreateInput,
  AmenityUpdateInput,
  AmenityQueryParams,
  Attraction,
  AttractionCreateInput,
  AttractionUpdateInput,
  AttractionQueryParams,
  Transport,
  TransportCreateInput,
  TransportUpdateInput,
  TransportQueryParams,
  FeatureType,
  FeatureTypeCreateInput,
  FeatureTypeUpdateInput,
  FeatureTypeQueryParams,
  StructureType,
  StructureTypeCreateInput,
  StructureTypeUpdateInput,
  StructureTypeQueryParams,
} from '@/types/entities';
import { apiGet, apiPost, apiPatch, apiDelete, buildQueryString } from './api';

// ============= ROLE ACTIONS =============
export async function getRoles(params: RoleQueryParams = {}): Promise<ApiListResponse<Role>> {
  const query = buildQueryString(params);
  return apiGet(`/role${query ? `?${query}` : ''}`);
}

export async function getRole(id: string): Promise<ApiResponse<Role>> {
  return apiGet(`/role/${id}`);
}

export async function createRole(data: RoleCreateInput): Promise<ApiResponse<Role>> {
  return apiPost('/role', data);
}

export async function updateRole(id: string, data: RoleUpdateInput): Promise<ApiResponse<Role>> {
  return apiPatch(`/role/${id}`, data);
}

export async function deleteRole(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/role/${id}`);
}

// ============= USER ACTIONS =============
export async function getUsers(params: UserQueryParams = {}): Promise<ApiListResponse<User>> {
  const query = buildQueryString(params);
  return apiGet(`/user${query ? `?${query}` : ''}`);
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  return apiGet(`/user/${id}`);
}

export async function createUser(data: UserCreateInput): Promise<ApiResponse<User>> {
  return apiPost('/user', data);
}

export async function updateUser(id: string, data: UserUpdateInput): Promise<ApiResponse<User>> {
  return apiPatch(`/user/${id}`, data);
}

export async function deleteUser(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/user/${id}`);
}

// ============= COUNTRY ACTIONS =============
export async function getCountries(params: CountryQueryParams = {}): Promise<ApiListResponse<Country>> {
  const query = buildQueryString(params);
  return apiGet(`/country${query ? `?${query}` : ''}`);
}

export async function getCountry(id: string): Promise<ApiResponse<Country>> {
  return apiGet(`/country/${id}`);
}

export async function createCountry(data: CountryCreateInput): Promise<ApiResponse<Country>> {
  return apiPost('/country', data);
}

export async function updateCountry(id: string, data: CountryUpdateInput): Promise<ApiResponse<Country>> {
  return apiPatch(`/country/${id}`, data);
}

export async function deleteCountry(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/country/${id}`);
}

// ============= CITY ACTIONS =============
export async function getCities(params: CityQueryParams = {}): Promise<ApiListResponse<City>> {
  const query = buildQueryString(params);
  return apiGet(`/city${query ? `?${query}` : ''}`);
}

export async function getCity(id: string): Promise<ApiResponse<City>> {
  return apiGet(`/city/${id}`);
}

export async function createCity(data: CityCreateInput): Promise<ApiResponse<City>> {
  return apiPost('/city', data);
}

export async function updateCity(id: string, data: CityUpdateInput): Promise<ApiResponse<City>> {
  return apiPatch(`/city/${id}`, data);
}

export async function deleteCity(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/city/${id}`);
}

// ============= DISTRICT ACTIONS =============
export async function getDistricts(params: DistrictQueryParams = {}): Promise<ApiListResponse<District>> {
  const query = buildQueryString(params);
  return apiGet(`/district${query ? `?${query}` : ''}`);
}

export async function getDistrict(id: string): Promise<ApiResponse<District>> {
  return apiGet(`/district/${id}`);
}

export async function createDistrict(data: DistrictCreateInput): Promise<ApiResponse<District>> {
  return apiPost('/district', data);
}

export async function updateDistrict(id: string, data: DistrictUpdateInput): Promise<ApiResponse<District>> {
  return apiPatch(`/district/${id}`, data);
}

export async function deleteDistrict(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/district/${id}`);
}

// ============= AREA ACTIONS =============
export async function getAreas(params: AreaQueryParams = {}): Promise<ApiListResponse<Area>> {
  const query = buildQueryString(params);
  return apiGet(`/area${query ? `?${query}` : ''}`);
}

export async function getArea(id: string): Promise<ApiResponse<Area>> {
  return apiGet(`/area/${id}`);
}

export async function createArea(data: AreaCreateInput): Promise<ApiResponse<Area>> {
  return apiPost('/area', data);
}

export async function updateArea(id: string, data: AreaUpdateInput): Promise<ApiResponse<Area>> {
  return apiPatch(`/area/${id}`, data);
}

export async function deleteArea(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/area/${id}`);
}

// ============= CATEGORY ACTIONS =============
export async function getCategories(params: CategoryQueryParams = {}): Promise<ApiListResponse<Category>> {
  const query = buildQueryString(params);
  return apiGet(`/category${query ? `?${query}` : ''}`);
}

export async function getCategory(id: string): Promise<ApiResponse<Category>> {
  return apiGet(`/category/${id}`);
}

export async function createCategory(data: CategoryCreateInput): Promise<ApiResponse<Category>> {
  return apiPost('/category', data);
}

export async function updateCategory(id: string, data: CategoryUpdateInput): Promise<ApiResponse<Category>> {
  return apiPatch(`/category/${id}`, data);
}

export async function deleteCategory(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/category/${id}`);
}

// ============= AMENITY ACTIONS =============
export async function getAmenities(params: AmenityQueryParams = {}): Promise<ApiListResponse<Amenity>> {
  const query = buildQueryString(params);
  return apiGet(`/amenity${query ? `?${query}` : ''}`);
}

export async function getAmenity(id: string): Promise<ApiResponse<Amenity>> {
  return apiGet(`/amenity/${id}`);
}

export async function createAmenity(data: AmenityCreateInput): Promise<ApiResponse<Amenity>> {
  return apiPost('/amenity', data);
}

export async function updateAmenity(id: string, data: AmenityUpdateInput): Promise<ApiResponse<Amenity>> {
  return apiPatch(`/amenity/${id}`, data);
}

export async function deleteAmenity(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/amenity/${id}`);
}

// ============= ATTRACTION ACTIONS =============
export async function getAttractions(params: AttractionQueryParams = {}): Promise<ApiListResponse<Attraction>> {
  const query = buildQueryString(params);
  return apiGet(`/attraction${query ? `?${query}` : ''}`);
}

export async function getAttraction(id: string): Promise<ApiResponse<Attraction>> {
  return apiGet(`/attraction/${id}`);
}

export async function createAttraction(data: AttractionCreateInput): Promise<ApiResponse<Attraction>> {
  return apiPost('/attraction', data);
}

export async function updateAttraction(id: string, data: AttractionUpdateInput): Promise<ApiResponse<Attraction>> {
  return apiPatch(`/attraction/${id}`, data);
}

export async function deleteAttraction(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/attraction/${id}`);
}

// ============= TRANSPORT ACTIONS =============
export async function getTransports(params: TransportQueryParams = {}): Promise<ApiListResponse<Transport>> {
  const query = buildQueryString(params);
  return apiGet(`/transport${query ? `?${query}` : ''}`);
}

export async function getTransport(id: string): Promise<ApiResponse<Transport>> {
  return apiGet(`/transport/${id}`);
}

export async function createTransport(data: TransportCreateInput): Promise<ApiResponse<Transport>> {
  return apiPost('/transport', data);
}

export async function updateTransport(id: string, data: TransportUpdateInput): Promise<ApiResponse<Transport>> {
  return apiPatch(`/transport/${id}`, data);
}

export async function deleteTransport(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/transport/${id}`);
}

// ============= FEATURE TYPE ACTIONS =============
export async function getFeatureTypes(params: FeatureTypeQueryParams = {}): Promise<ApiListResponse<FeatureType>> {
  const query = buildQueryString(params);
  return apiGet(`/feature-type${query ? `?${query}` : ''}`);
}

export async function getFeatureType(id: string): Promise<ApiResponse<FeatureType>> {
  return apiGet(`/feature-type/${id}`);
}

export async function createFeatureType(data: FeatureTypeCreateInput): Promise<ApiResponse<FeatureType>> {
  return apiPost('/feature-type', data);
}

export async function updateFeatureType(id: string, data: FeatureTypeUpdateInput): Promise<ApiResponse<FeatureType>> {
  return apiPatch(`/feature-type/${id}`, data);
}

export async function deleteFeatureType(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/feature-type/${id}`);
}

// ============= STRUCTURE TYPE ACTIONS =============
export async function getStructureTypes(
  params: StructureTypeQueryParams = {},
): Promise<ApiListResponse<StructureType>> {
  const query = buildQueryString(params);
  return apiGet(`/structure-type${query ? `?${query}` : ''}`);
}

export async function getStructureType(id: string): Promise<ApiResponse<StructureType>> {
  return apiGet(`/structure-type/${id}`);
}

export async function createStructureType(data: StructureTypeCreateInput): Promise<ApiResponse<StructureType>> {
  return apiPost('/structure-type', data);
}

export async function updateStructureType(
  id: string,
  data: StructureTypeUpdateInput,
): Promise<ApiResponse<StructureType>> {
  return apiPatch(`/structure-type/${id}`, data);
}

export async function deleteStructureType(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete(`/structure-type/${id}`);
}
