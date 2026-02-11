# Exports Reference

Complete API surface for the Asette Inventory UI codebase.

## Types (`types/`)

### Base Types (`types/common.ts`)

| Export               | Kind      | Purpose                                        |
| -------------------- | --------- | ---------------------------------------------- |
| `Coordinates`        | interface | `{ latitude: number, longitude: number }`      |
| `Boundaries`         | interface | GeoJSON polygon/multipolygon                   |
| `BaseEntity`         | interface | `{ id, created_at, updated_at }`               |
| `GeoEntity`          | interface | BaseEntity + name, coordinates, boundaries     |
| `UIAttributeEntity`  | interface | `{ icon, image, color }`                       |
| `ApiResponse<T>`     | interface | `{ success, message, data: T }`                |
| `ApiListResponse<T>` | interface | ApiResponse + pagination, size                 |
| `PaginationMeta`     | interface | Pagination metadata object                     |
| `BaseQueryParams`    | interface | `{ search, sort_by, sort_order, limit, page }` |

### Auth Types (`types/auth.ts`)

| Export                 | Kind      | Purpose                                         |
| ---------------------- | --------- | ----------------------------------------------- |
| `AuthUser`             | interface | User in JWT (id, username, email, image, roles) |
| `AuthToken`            | interface | Decoded JWT (user, auth_method, exp, type)      |
| `Login`                | interface | `{ email, password }`                           |
| `Signup`               | interface | Login + username                                |
| `SignupResponse`       | interface | API response with token data                    |
| `LoginResponse`        | interface | API response with token data                    |
| `RefreshTokenResponse` | interface | Token refresh response                          |

### Entity Types (`types/entities.ts`)

Each entity follows a pattern: `Entity`, `EntityCreateInput`, `EntityUpdateInput`, `EntityQueryParams`.

| Entity          | Extends                        | Extra Fields                                                    |
| --------------- | ------------------------------ | --------------------------------------------------------------- |
| `Role`          | BaseEntity + UIAttributeEntity | name                                                            |
| `User`          | BaseEntity                     | username, email, phone, image, deleted_at, last_login_at, roles |
| `Country`       | GeoEntity                      | code, flag, currency, phone_code                                |
| `City`          | GeoEntity                      | country_id, timezone                                            |
| `District`      | GeoEntity                      | city_id                                                         |
| `Area`          | GeoEntity                      | (none)                                                          |
| `Category`      | BaseEntity                     | name                                                            |
| `Amenity`       | GeoEntity + UIAttributeEntity  | description                                                     |
| `Attraction`    | GeoEntity + UIAttributeEntity  | description                                                     |
| `Transport`     | BaseEntity + UIAttributeEntity | name                                                            |
| `FeatureType`   | BaseEntity + UIAttributeEntity | name                                                            |
| `StructureType` | BaseEntity + UIAttributeEntity | name                                                            |

### Other Types

| File                    | Export                                      | Purpose                       |
| ----------------------- | ------------------------------------------- | ----------------------------- |
| `types/pagination.ts`   | `Pagination`                                | Full pagination metadata      |
| `types/params.ts`       | `Params`                                    | Legacy query params interface |
| `types/user.ts`         | `User`, `UsersResponse`, `UsersParams`      | Legacy user types             |
| `types/role.ts`         | `Role`                                      | Legacy role type              |
| `types/building.ts`     | `Building`, `BuildingWithImage`             | Building entity types         |
| `types/api-response.ts` | `ApiResponse<T>`, `ApiResponsePaginated<T>` | Generic response wrappers     |

---

## Lib (`lib/`)

### `lib/utils.ts`

| Export             | Signature                                 | Purpose                                       |
| ------------------ | ----------------------------------------- | --------------------------------------------- |
| `cn`               | `(...inputs: ClassValue[]) => string`     | Tailwind class merger (clsx + tailwind-merge) |
| `getUserInitials`  | `(name: string) => string`                | Extract initials from username                |
| `swapCoordinates`  | `(coords: any) => any`                    | Swap lat/lng recursively for Leaflet          |
| `buildQueryString` | `<T extends object>(params: T) => string` | Build URL query string from params            |

### `lib/api.ts`

| Export              | Type     | Purpose                                  |
| ------------------- | -------- | ---------------------------------------- |
| `api.fetch`         | function | Base fetch with Bearer token auto-attach |
| `api.get`           | function | GET request wrapper                      |
| `api.post`          | function | POST with JSON body                      |
| `api.postFormData`  | function | POST with FormData (file uploads)        |
| `api.put`           | function | PUT with JSON body                       |
| `api.patch`         | function | PATCH with JSON body                     |
| `api.patchFormData` | function | PATCH with FormData (file uploads)       |
| `api.delete`        | function | DELETE request wrapper                   |

### `lib/env.ts`

| Export | Type  | Purpose                                  |
| ------ | ----- | ---------------------------------------- |
| `env`  | const | Validated env vars (`INVENTORY_API_URL`) |

### `lib/s3-client.ts`

| Export             | Type             | Purpose                                                       |
| ------------------ | ---------------- | ------------------------------------------------------------- |
| `s3Client`         | S3Client         | AWS S3 client instance                                        |
| `cloudFrontClient` | CloudFrontClient | AWS CloudFront client                                         |
| `S3_CONFIG`        | object           | `{ bucket, prefix, cloudfrontUrl, cloudfrontDistributionId }` |
| `getImageUrl`      | function         | `(uuid, cacheBust?) => string` - CloudFront image URL         |

### `lib/actions/api.ts` (Server-side)

| Export        | Signature                               | Purpose                            |
| ------------- | --------------------------------------- | ---------------------------------- |
| `serverFetch` | `<T>(endpoint, options?) => Promise<T>` | Server-side fetch with auth cookie |
| `apiGet`      | `<T>(endpoint) => Promise<T>`           | Server GET                         |
| `apiPost`     | `<T>(endpoint, body) => Promise<T>`     | Server POST                        |
| `apiPatch`    | `<T>(endpoint, body) => Promise<T>`     | Server PATCH                       |
| `apiDelete`   | `<T>(endpoint) => Promise<T>`           | Server DELETE                      |

### `lib/actions/entities.ts` (Server Actions)

CRUD server actions for every entity. Pattern per entity:

```
get{Entity}s(params?) => ApiListResponse<Entity>
get{Entity}(id) => ApiResponse<Entity>
create{Entity}(data) => ApiResponse<Entity>
update{Entity}(id, data) => ApiResponse<Entity>
delete{Entity}(id) => ApiResponse<boolean>
```

**Entities covered:** Role, User, Country, City, District, Area, Category, Amenity, Attraction, Transport, FeatureType, StructureType (60 standard CRUD actions)

#### Additional User Role Actions

| Export            | Signature                                            | Purpose                             |
| ----------------- | ---------------------------------------------------- | ----------------------------------- |
| `assignUserRole`  | `(userId, roleId) => Promise<ApiResponse<User>>`     | Assign single role to a user        |
| `removeUserRole`  | `(userId, roleId) => Promise<ApiResponse<User>>`     | Remove single role from a user      |
| `bulkAssignRoles` | `(userIds[], roleIds[]) => Promise<SettledResult[]>` | Bulk assign roles to multiple users |

#### Bulk Operations

| Export       | Signature                                                | Purpose                                 |
| ------------ | -------------------------------------------------------- | --------------------------------------- |
| `bulkDelete` | `(deleteFn, ids[]) => Promise<PromiseSettledResult<>[]>` | Generic bulk delete using any entity fn |

### `lib/actions/buildings.ts`

| Export                 | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `fetchBuildingsAction` | `() => Promise<Building[]>` - Fetch buildings list |

---

## Validations (`lib/validations/entities.ts`)

Zod schemas per entity. Pattern: `{entity}CreateSchema`, `{entity}UpdateSchema`, `{Entity}FormData`.

| Entity        | Create Schema               | Update Schema               | Form Data Type                             |
| ------------- | --------------------------- | --------------------------- | ------------------------------------------ |
| Role          | `roleCreateSchema`          | `roleUpdateSchema`          | `RoleFormData`                             |
| User          | `userCreateSchema`          | `userUpdateSchema`          | `UserCreateFormData`, `UserUpdateFormData` |
| Country       | `countryCreateSchema`       | `countryUpdateSchema`       | `CountryFormData`                          |
| City          | `cityCreateSchema`          | `cityUpdateSchema`          | `CityFormData`                             |
| District      | `districtCreateSchema`      | `districtUpdateSchema`      | `DistrictFormData`                         |
| Area          | `areaCreateSchema`          | `areaUpdateSchema`          | `AreaFormData`                             |
| Category      | `categoryCreateSchema`      | `categoryUpdateSchema`      | `CategoryFormData`                         |
| Amenity       | `amenityCreateSchema`       | `amenityUpdateSchema`       | `AmenityFormData`                          |
| Attraction    | `attractionCreateSchema`    | `attractionUpdateSchema`    | `AttractionFormData`                       |
| Transport     | `transportCreateSchema`     | `transportUpdateSchema`     | `TransportFormData`                        |
| FeatureType   | `featureTypeCreateSchema`   | `featureTypeUpdateSchema`   | `FeatureTypeFormData`                      |
| StructureType | `structureTypeCreateSchema` | `structureTypeUpdateSchema` | `StructureTypeFormData`                    |

---

## Hooks (`hooks/`)

| Hook             | Signature                                                      | Purpose                                    |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `useIsMobile`    | `() => boolean`                                                | Viewport < 768px detection                 |
| `useTableState`  | `(options) => { columnVisibility, columnOrder, onChange... }`  | Persist table column state to localStorage |
| `useUsersParams` | `() => { params, setParams, resetParams }`                     | URL-synced query params for users page     |
| `useUsers`       | `(params) => { users, pagination, isLoading, error, refetch }` | Fetch users with pagination                |

---

## Components - CRUD (`components/crud/`)

| Export               | Component           | Props                                                                          |
| -------------------- | ------------------- | ------------------------------------------------------------------------------ |
| `EntitySheet`        | Sheet wrapper       | open, onOpenChange, title, description, children, isSubmitting, onSubmit, size |
| `FormField`          | Form input          | register, name, label, error, type (input/textarea)                            |
| `FormFieldWrapper`   | Label+error wrapper | label, error, description, children                                            |
| `DeleteDialog`       | Confirm dialog      | open, onOpenChange, itemName, onConfirm                                        |
| `ColorPicker`        | Color selector      | value, onChange, disabled                                                      |
| `GeoEditor`          | Map editor          | coordinates, boundaries, onChange                                              |
| `PageLayout`         | Page wrapper        | title, description, icon, onAdd, children                                      |
| `FilterBar`          | Toolbar wrapper     | children                                                                       |
| `EmptyState`         | Empty placeholder   | icon, title, description, action                                               |
| `TableSkeleton`      | Loading skeleton    | -                                                                              |
| `CardGridSkeleton`   | Loading skeleton    | -                                                                              |
| `FormSkeleton`       | Loading skeleton    | -                                                                              |
| `SheetSkeleton`      | Loading skeleton    | -                                                                              |
| `PageHeaderSkeleton` | Loading skeleton    | -                                                                              |
| `FilterBarSkeleton`  | Loading skeleton    | -                                                                              |

---

## Components - Data Table (`components/data-table/`)

| Export                   | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `DataTable`              | Main table with TanStack integration, sorting, loading states        |
| `DataTableBulkToolbar`   | Floating bulk action bar (portal to body, shows when items selected) |
| `DataTableColumnHeader`  | Sortable column header with dropdown                                 |
| `DataTablePagination`    | Page controls + page size selector                                   |
| `DataTableViewOptions`   | Column visibility toggle                                             |
| `DataTableFacetedFilter` | Multi-select facet filter                                            |
| `DataTableFilterDrawer`  | Mobile filter drawer                                                 |

---

## Components - Entity (`components/entity/`)

Display components for entities with UIAttributeEntity fields. No barrel export — import directly.

| Export        | Component    | Props                                                                |
| ------------- | ------------ | -------------------------------------------------------------------- |
| `EntityIcon`  | Icon display | `icon: string`                                                       |
| `EntityImage` | Avatar image | `image: string, className?: string`                                  |
| `EntityBadge` | Badge combo  | `id, name, icon?, image?, color?` — shows icon/image + name in Badge |

```typescript
import { EntityBadge } from '@/components/entity/entity-badge';
import { EntityIcon } from '@/components/entity/entity-icon';
import { EntityImage } from '@/components/entity/entity-image';
```

---

## Components - Auth (`components/auth/`)

| Export         | Purpose                                 |
| -------------- | --------------------------------------- |
| `AuthGuard`    | Redirect to /login if not authenticated |
| `GuestGuard`   | Redirect to /dashboard if authenticated |
| `LoginForm`    | Email/password + Google OAuth login     |
| `SignupForm`   | Username/email/password signup          |
| `GoogleButton` | Google OAuth button                     |

---

## Components - Navigation

| Export           | File                  | Purpose                                            |
| ---------------- | --------------------- | -------------------------------------------------- |
| `AppSidebar`     | `nav/app-sidebar.tsx` | Main sidebar with role-filtered nav groups         |
| `Header`         | `nav/header.tsx`      | Sticky header with glass effect, search, user menu |
| `NavGroup`       | `nav/nav-group.tsx`   | Collapsible sidebar nav group                      |
| `NavUser`        | `nav/nav-user.tsx`    | Sidebar footer user menu                           |
| `HeaderUser`     | `nav/header-user.tsx` | Header user dropdown                               |
| `navRouteGroups` | `nav/data/index.ts`   | Combined nav config array                          |

### Nav Interfaces (`nav/interfaces/nav.interface.ts`)

| Export         | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `NavItem`      | `{ title, url, icon, isActive?, subItems?, authorizedRoles? }` |
| `NavGroupItem` | `{ title?, items: NavItem[], authorizedRoles? }`               |

---

## Auth Provider (`components/providers/auth-provider.tsx`)

| Export         | Type      | Purpose                                                                                              |
| -------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `AuthProvider` | component | React Context provider for auth state                                                                |
| `useAuth`      | hook      | Returns `{ user, isAuthenticated, isLoading, login, signup, loginWithGoogle, logout, isAuthorized }` |

---

## Server Actions (App-level)

| Action                  | File                            | Purpose                                      |
| ----------------------- | ------------------------------- | -------------------------------------------- |
| `uploadImageAction`     | `app/image-uploader/actions.ts` | Upload image to S3 + CloudFront invalidation |
| `uploadImagesAction`    | `app/image-uploader/actions.ts` | Batch upload images                          |
| `callGeminiAction`      | `app/payment-plan/actions.ts`   | Call Gemini AI API                           |
| `savePaymentPlanAction` | `app/payment-plan/actions.ts`   | Save payment plan to backend                 |

---

## Import Patterns

```typescript
// Types
import type { Country, CountryCreateInput } from '@/types/entities';
import type { ApiResponse, ApiListResponse } from '@/types/common';
import type { AuthUser } from '@/types/auth';

// Server actions
import { getCountries, createCountry, updateCountry, deleteCountry } from '@/lib/actions/entities';

// Validations
import { countryCreateSchema, type CountryFormData } from '@/lib/validations/entities';

// CRUD components
import { EntitySheet, FormField, DeleteDialog, PageLayout, FilterBar, EmptyState } from '@/components/crud';

// Data table
import {
  DataTable,
  DataTableBulkToolbar,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
} from '@/components/data-table';

// Entity display (no barrel - import directly)
import { EntityBadge } from '@/components/entity/entity-badge';

// Bulk operations
import { bulkDelete, bulkAssignRoles } from '@/lib/actions/entities';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// Hooks
import { useTableState } from '@/hooks/use-table-state';
import { useAuth } from '@/components/providers/auth-provider';

// Utils
import { cn, buildQueryString, swapCoordinates } from '@/lib/utils';
import { api } from '@/lib/api';
```
