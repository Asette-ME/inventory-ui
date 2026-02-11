import { api } from '@/lib/api';
import { buildQueryString } from '@/lib/utils';
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

// Helper to parse API response and throw on error
async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.detail || 'Request failed');
  }
  if (res.status === 204) {
    return { success: true } as T;
  }
  return res.json();
}

// Helper to build FormData from an object (for entities with image file uploads)
function buildFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

// Check if data contains a File object (needs FormData)
function hasFileUpload(data: Record<string, any>): boolean {
  return Object.values(data).some((v) => v instanceof File);
}

// ============= ROLE ACTIONS =============
export async function getRoles(params: RoleQueryParams = {}): Promise<ApiListResponse<Role>> {
  const query = buildQueryString(params);
  const res = await api.get(`/role${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getRole(id: string): Promise<ApiResponse<Role>> {
  const res = await api.get(`/role/${id}`);
  return parseResponse(res);
}

export async function createRole(data: RoleCreateInput): Promise<ApiResponse<Role>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/role', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/role', data);
  return parseResponse(res);
}

export async function updateRole(id: string, data: RoleUpdateInput): Promise<ApiResponse<Role>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/role/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/role/${id}`, data);
  return parseResponse(res);
}

export async function deleteRole(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/role/${id}`);
  return parseResponse(res);
}

// ============= USER ACTIONS =============
export async function getUsers(params: UserQueryParams = {}): Promise<ApiListResponse<User>> {
  const query = buildQueryString(params);
  const res = await api.get(`/user${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  const res = await api.get(`/user/${id}`);
  return parseResponse(res);
}

export async function createUser(data: UserCreateInput): Promise<ApiResponse<User>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/user', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/user', data);
  return parseResponse(res);
}

export async function updateUser(id: string, data: UserUpdateInput): Promise<ApiResponse<User>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/user/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/user/${id}`, data);
  return parseResponse(res);
}

export async function deleteUser(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/user/${id}`);
  return parseResponse(res);
}

// Assign a single role to a user
export async function assignUserRole(userId: string, roleId: string): Promise<ApiResponse<User>> {
  const res = await api.post(`/user/${userId}/roles/${roleId}`, {});
  return parseResponse(res);
}

// Remove a single role from a user
export async function removeUserRole(userId: string, roleId: string): Promise<ApiResponse<User>> {
  const res = await api.delete(`/user/${userId}/roles/${roleId}`);
  return parseResponse(res);
}

// Bulk assign roles to multiple users in parallel
export async function bulkAssignRoles(
  userIds: string[],
  roleIds: string[],
): Promise<PromiseSettledResult<ApiResponse<User>>[]> {
  const assignments = userIds.flatMap((userId) => roleIds.map((roleId) => assignUserRole(userId, roleId)));
  return Promise.allSettled(assignments);
}

// ============= COUNTRY ACTIONS =============
export async function getCountries(params: CountryQueryParams = {}): Promise<ApiListResponse<Country>> {
  const query = buildQueryString(params);
  const res = await api.get(`/country${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getCountry(id: string): Promise<ApiResponse<Country>> {
  const res = await api.get(`/country/${id}`);
  return parseResponse(res);
}

export async function createCountry(data: CountryCreateInput): Promise<ApiResponse<Country>> {
  const res = await api.post('/country', data);
  return parseResponse(res);
}

export async function updateCountry(id: string, data: CountryUpdateInput): Promise<ApiResponse<Country>> {
  const res = await api.patch(`/country/${id}`, data);
  return parseResponse(res);
}

export async function deleteCountry(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/country/${id}`);
  return parseResponse(res);
}

// ============= CITY ACTIONS =============
export async function getCities(params: CityQueryParams = {}): Promise<ApiListResponse<City>> {
  const query = buildQueryString(params);
  const res = await api.get(`/city${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getCity(id: string): Promise<ApiResponse<City>> {
  const res = await api.get(`/city/${id}`);
  return parseResponse(res);
}

export async function createCity(data: CityCreateInput): Promise<ApiResponse<City>> {
  const res = await api.post('/city', data);
  return parseResponse(res);
}

export async function updateCity(id: string, data: CityUpdateInput): Promise<ApiResponse<City>> {
  const res = await api.patch(`/city/${id}`, data);
  return parseResponse(res);
}

export async function deleteCity(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/city/${id}`);
  return parseResponse(res);
}

// ============= DISTRICT ACTIONS =============
export async function getDistricts(params: DistrictQueryParams = {}): Promise<ApiListResponse<District>> {
  const query = buildQueryString(params);
  const res = await api.get(`/district${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getDistrict(id: string): Promise<ApiResponse<District>> {
  const res = await api.get(`/district/${id}`);
  return parseResponse(res);
}

export async function createDistrict(data: DistrictCreateInput): Promise<ApiResponse<District>> {
  const res = await api.post('/district', data);
  return parseResponse(res);
}

export async function updateDistrict(id: string, data: DistrictUpdateInput): Promise<ApiResponse<District>> {
  const res = await api.patch(`/district/${id}`, data);
  return parseResponse(res);
}

export async function deleteDistrict(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/district/${id}`);
  return parseResponse(res);
}

// ============= AREA ACTIONS =============
export async function getAreas(params: AreaQueryParams = {}): Promise<ApiListResponse<Area>> {
  const query = buildQueryString(params);
  const res = await api.get(`/area${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getArea(id: string): Promise<ApiResponse<Area>> {
  const res = await api.get(`/area/${id}`);
  return parseResponse(res);
}

export async function createArea(data: AreaCreateInput): Promise<ApiResponse<Area>> {
  const res = await api.post('/area', data);
  return parseResponse(res);
}

export async function updateArea(id: string, data: AreaUpdateInput): Promise<ApiResponse<Area>> {
  const res = await api.patch(`/area/${id}`, data);
  return parseResponse(res);
}

export async function deleteArea(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/area/${id}`);
  return parseResponse(res);
}

// ============= CATEGORY ACTIONS =============
export async function getCategories(params: CategoryQueryParams = {}): Promise<ApiListResponse<Category>> {
  const query = buildQueryString(params);
  const res = await api.get(`/category${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getCategory(id: string): Promise<ApiResponse<Category>> {
  const res = await api.get(`/category/${id}`);
  return parseResponse(res);
}

export async function createCategory(data: CategoryCreateInput): Promise<ApiResponse<Category>> {
  const res = await api.post('/category', data);
  return parseResponse(res);
}

export async function updateCategory(id: string, data: CategoryUpdateInput): Promise<ApiResponse<Category>> {
  const res = await api.patch(`/category/${id}`, data);
  return parseResponse(res);
}

export async function deleteCategory(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/category/${id}`);
  return parseResponse(res);
}

// ============= AMENITY ACTIONS =============
export async function getAmenities(params: AmenityQueryParams = {}): Promise<ApiListResponse<Amenity>> {
  const query = buildQueryString(params);
  const res = await api.get(`/amenity${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getAmenity(id: string): Promise<ApiResponse<Amenity>> {
  const res = await api.get(`/amenity/${id}`);
  return parseResponse(res);
}

export async function createAmenity(data: AmenityCreateInput): Promise<ApiResponse<Amenity>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/amenity', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/amenity', data);
  return parseResponse(res);
}

export async function updateAmenity(id: string, data: AmenityUpdateInput): Promise<ApiResponse<Amenity>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/amenity/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/amenity/${id}`, data);
  return parseResponse(res);
}

export async function deleteAmenity(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/amenity/${id}`);
  return parseResponse(res);
}

// ============= ATTRACTION ACTIONS =============
export async function getAttractions(params: AttractionQueryParams = {}): Promise<ApiListResponse<Attraction>> {
  const query = buildQueryString(params);
  const res = await api.get(`/attraction${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getAttraction(id: string): Promise<ApiResponse<Attraction>> {
  const res = await api.get(`/attraction/${id}`);
  return parseResponse(res);
}

export async function createAttraction(data: AttractionCreateInput): Promise<ApiResponse<Attraction>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/attraction', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/attraction', data);
  return parseResponse(res);
}

export async function updateAttraction(id: string, data: AttractionUpdateInput): Promise<ApiResponse<Attraction>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/attraction/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/attraction/${id}`, data);
  return parseResponse(res);
}

export async function deleteAttraction(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/attraction/${id}`);
  return parseResponse(res);
}

// ============= TRANSPORT ACTIONS =============
export async function getTransports(params: TransportQueryParams = {}): Promise<ApiListResponse<Transport>> {
  const query = buildQueryString(params);
  const res = await api.get(`/transport${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getTransport(id: string): Promise<ApiResponse<Transport>> {
  const res = await api.get(`/transport/${id}`);
  return parseResponse(res);
}

export async function createTransport(data: TransportCreateInput): Promise<ApiResponse<Transport>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/transport', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/transport', data);
  return parseResponse(res);
}

export async function updateTransport(id: string, data: TransportUpdateInput): Promise<ApiResponse<Transport>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/transport/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/transport/${id}`, data);
  return parseResponse(res);
}

export async function deleteTransport(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/transport/${id}`);
  return parseResponse(res);
}

// ============= FEATURE TYPE ACTIONS =============
export async function getFeatureTypes(params: FeatureTypeQueryParams = {}): Promise<ApiListResponse<FeatureType>> {
  const query = buildQueryString(params);
  const res = await api.get(`/feature-type${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getFeatureType(id: string): Promise<ApiResponse<FeatureType>> {
  const res = await api.get(`/feature-type/${id}`);
  return parseResponse(res);
}

export async function createFeatureType(data: FeatureTypeCreateInput): Promise<ApiResponse<FeatureType>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/feature-type', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/feature-type', data);
  return parseResponse(res);
}

export async function updateFeatureType(id: string, data: FeatureTypeUpdateInput): Promise<ApiResponse<FeatureType>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/feature-type/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/feature-type/${id}`, data);
  return parseResponse(res);
}

export async function deleteFeatureType(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/feature-type/${id}`);
  return parseResponse(res);
}

// ============= STRUCTURE TYPE ACTIONS =============
export async function getStructureTypes(
  params: StructureTypeQueryParams = {},
): Promise<ApiListResponse<StructureType>> {
  const query = buildQueryString(params);
  const res = await api.get(`/structure-type${query ? `?${query}` : ''}`);
  return parseResponse(res);
}

export async function getStructureType(id: string): Promise<ApiResponse<StructureType>> {
  const res = await api.get(`/structure-type/${id}`);
  return parseResponse(res);
}

export async function createStructureType(data: StructureTypeCreateInput): Promise<ApiResponse<StructureType>> {
  if (hasFileUpload(data as any)) {
    const res = await api.postFormData('/structure-type', buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.post('/structure-type', data);
  return parseResponse(res);
}

export async function updateStructureType(
  id: string,
  data: StructureTypeUpdateInput,
): Promise<ApiResponse<StructureType>> {
  if (hasFileUpload(data as any)) {
    const res = await api.patchFormData(`/structure-type/${id}`, buildFormData(data as any));
    return parseResponse(res);
  }
  const res = await api.patch(`/structure-type/${id}`, data);
  return parseResponse(res);
}

export async function deleteStructureType(id: string): Promise<ApiResponse<boolean>> {
  const res = await api.delete(`/structure-type/${id}`);
  return parseResponse(res);
}

// ============= BULK OPERATIONS =============
export async function bulkDelete(
  deleteFn: (id: string) => Promise<ApiResponse<boolean>>,
  ids: string[],
): Promise<PromiseSettledResult<ApiResponse<boolean>>[]> {
  return Promise.allSettled(ids.map((id) => deleteFn(id)));
}
