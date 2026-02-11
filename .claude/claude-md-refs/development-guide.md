# Development Guide

Step-by-step implementation guides for the Asette Inventory UI.

## Adding a New Entity (Full CRUD)

### Step 1: Define Types (`types/entities.ts`)

Add 4 types following existing entity patterns:

```typescript
export interface Widget extends BaseEntity {
  name: string;
  description?: string;
  // Add UIAttributeEntity if entity needs icon/image/color
  // Add GeoEntity fields if entity has coordinates/boundaries
}

export interface WidgetCreateInput {
  name: string;
  description?: string;
}

export interface WidgetUpdateInput extends Partial<WidgetCreateInput> {}

export interface WidgetQueryParams extends BaseQueryParams {}
```

### Step 2: Add Zod Validation (`lib/validations/entities.ts`)

```typescript
export const widgetCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().nullable().optional(),
  // Add uiAttributeSchema spread if entity has icon/image/color
  // Add coordinatesSchema/boundariesSchema if geo entity
});

export const widgetUpdateSchema = widgetCreateSchema.partial();
export type WidgetFormData = z.infer<typeof widgetCreateSchema>;
```

### Step 3: Add Server Actions (`lib/actions/entities.ts`)

Add 5 server actions following the pattern:

```typescript
export async function getWidgets(params?: WidgetQueryParams): Promise<ApiListResponse<Widget>> {
  return apiGet<ApiListResponse<Widget>>(`/api/widgets?${buildQueryString(params || {})}`);
}
export async function getWidget(id: string): Promise<ApiResponse<Widget>> {
  return apiGet<ApiResponse<Widget>>(`/api/widgets/${id}`);
}
export async function createWidget(data: WidgetCreateInput): Promise<ApiResponse<Widget>> {
  return apiPost<ApiResponse<Widget>>('/api/widgets', data);
}
export async function updateWidget(id: string, data: WidgetUpdateInput): Promise<ApiResponse<Widget>> {
  return apiPatch<ApiResponse<Widget>>(`/api/widgets/${id}`, data);
}
export async function deleteWidget(id: string): Promise<ApiResponse<boolean>> {
  return apiDelete<ApiResponse<boolean>>(`/api/widgets/${id}`);
}
```

### Step 4: Create Page Files

Create directory `app/(main)/widgets/` with 5 files:

#### `page.tsx` - Main page

```typescript
'use client';
import { useState } from 'react';
import { Puzzle } from 'lucide-react';
import { PageLayout } from '@/components/crud';
import { WidgetsTable } from './widgets-table';

export default function WidgetsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <PageLayout title="Widgets" description="Manage widgets" icon={Puzzle} onAdd={() => setSheetOpen(true)}>
      <WidgetsTable sheetOpen={sheetOpen} onSheetOpenChange={setSheetOpen} />
    </PageLayout>
  );
}
```

#### `widgets-columns.tsx` - Column definitions

Define columns using `ColumnDef<Widget>[]`. Must export `columns` and `defaultVisibleColumns`.
Use `DataTableColumnHeader` for sortable headers. Include Actions column with Edit/Delete dropdown.

#### `widgets-table.tsx` - Table with CRUD logic

State: items, pagination, loading, search, sort, selectedItem, deleteDialog.
Use `useTableState` for column persistence. Fetch with `getWidgets()`.
Integrate: WidgetsToolbar, DataTable, DataTablePagination, WidgetSheet, DeleteDialog.

#### `widgets-toolbar.tsx` - Search and controls

Search input + refresh button + DataTableViewOptions.

#### `widget-sheet.tsx` - Create/Edit form

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySheet, FormField } from '@/components/crud';
import { widgetCreateSchema, widgetUpdateSchema, type WidgetFormData } from '@/lib/validations/entities';
import { createWidget, updateWidget } from '@/lib/actions/entities';

// Use widgetCreateSchema for create, widgetUpdateSchema for edit
// Reset form via useEffect when entity prop changes
// Call onSuccess() after successful create/update
```

### Step 5: Add Navigation

In the appropriate nav data file (e.g., `components/nav/data/settings.nav.ts`):

```typescript
{ title: 'Widgets', url: '/widgets', icon: Puzzle }
```

---

## Adding a Geo Entity (with Map)

Same as standard CRUD above, but also:

**Note:** Geo location entities (Countries, Cities, Districts, Areas) use a **card-based UI** instead of the standard 5-file table pattern. They share components via `app/(main)/geo/locations/_components/` (`LocationGroup`, `LocationCard`, `types.ts`). Each location entity has only `page.tsx` + `{entity}-sheet.tsx`.

For non-location geo entities (Attractions, Amenities), use the standard 5-file table pattern.

1. Entity extends `GeoEntity` (adds coordinates, boundaries)
2. Zod schema includes `coordinatesSchema` and `boundariesSchema`
3. Sheet form includes `<GeoEditor>` component:

```typescript
<FormFieldWrapper label="Location">
  <GeoEditor
    coordinates={form.watch('coordinates')}
    boundaries={form.watch('boundaries')}
    onCoordinatesChange={(c) => form.setValue('coordinates', c)}
    onBoundariesChange={(b) => form.setValue('boundaries', b)}
  />
</FormFieldWrapper>
```

---

## Adding a New API Route

The app uses a catch-all proxy at `app/api/[...path]/route.ts`. All API calls to `/api/*` are proxied to `INVENTORY_API_URL`. You do NOT need to create new API routes for standard CRUD - just call the server actions which use `apiGet`/`apiPost`/`apiPatch`/`apiDelete`.

For custom server-side endpoints (non-proxied), create server actions in `lib/actions/` or `app/*/actions.ts`.

---

## Response Formats

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  error_code?: never;
  errors?: never;
}
```

### Error Response

```typescript
interface ApiResponse<T> {
  success: false;
  message: string;
  data?: never;
  error_code?: string;
  errors?: Record<string, string[]>;
}
```

### Paginated Response

```typescript
interface ApiListResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    total: number;
    filtered: number;
    limit: number;
    page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  size: number;
}
```

---

## Entity Sheet Pattern

### Props Interface

```typescript
interface EntitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: EntityType | null; // null = create mode
  onSuccess: () => void;
}
```

### EntitySheet Component Props

| Prop           | Type                  | Default | Purpose          |
| -------------- | --------------------- | ------- | ---------------- |
| `open`         | boolean               | -       | Sheet visibility |
| `onOpenChange` | function              | -       | Toggle handler   |
| `title`        | string                | -       | Header title     |
| `description`  | string                | -       | Header subtitle  |
| `children`     | ReactNode             | -       | Form content     |
| `isSubmitting` | boolean               | false   | Loading state    |
| `onSubmit`     | function              | -       | Save handler     |
| `submitLabel`  | string                | "Save"  | Button text      |
| `size`         | sm/md/lg/xl/full      | "xl"    | Sheet width      |
| `side`         | top/right/bottom/left | "right" | Slide direction  |

---

## Data Table Integration

### Column Definition Pattern

```typescript
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table';

export const columns: ColumnDef<Entity>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <span>{row.getValue('name')}</span>,
    meta: { className: 'w-[200px]' },  // Optional custom width
  },
  // Actions column (always last)
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const defaultVisibleColumns: Record<string, boolean> = {
  name: true,
  created_at: false,  // Hidden by default
};
```

### Table State Hook

```typescript
const { columnVisibility, columnOrder, onColumnVisibilityChange, onColumnOrderChange, isLoaded } = useTableState({
  key: 'widgets-table', // localStorage key
  defaultVisibility: defaultVisibleColumns,
  columns: tableColumns,
});
```

---

## Authentication Integration

### Protecting Pages

All pages under `app/(main)/` are auto-protected by `AuthGuard` in the layout.

### Role-Based Access

```typescript
const { isAuthorized } = useAuth();

// Check if user has required role
if (isAuthorized(['admin'])) {
  // Show admin-only content
}
```

### Navigation Role Filtering

Nav items support `authorizedRoles` array - sidebar auto-filters items based on user roles.

---

## Client vs Server API Calls

| Context           | Module                                                     | Usage                                        |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------- |
| Client components | `lib/api.ts` (`api.get/post/put/delete`)                   | Auto-attaches Bearer token from localStorage |
| Server actions    | `lib/actions/api.ts` (`apiGet/apiPost/apiPatch/apiDelete`) | Reads auth cookie for SSR                    |

---

## Toast Notifications

```typescript
import { toast } from 'sonner';

toast.success('Entity created successfully');
toast.error(response.message || 'Failed to create entity');
```

---

## Map Integration

The `Map` component (`components/ui/map.tsx`) wraps react-leaflet with SSR-safe dynamic imports.

```typescript
import { Map, MapTileLayer, MapMarker, MapFitBounds, MapDrawControl } from '@/components/ui/map';

<Map>
  <MapTileLayer />
  <MapMarker position={[lat, lng]} />
  <MapFitBounds bounds={bounds} />
</Map>
```

For editing coordinates/boundaries in forms, use the `GeoEditor` CRUD component.

---

## Bulk Operations

### Bulk Delete

Use `bulkDelete()` with any entity's delete function:

```typescript
import { bulkDelete, deleteWidget } from '@/lib/actions/entities';

const results = await bulkDelete(deleteWidget, selectedIds);
const failed = results.filter((r) => r.status === 'rejected');
if (failed.length) toast.error(`${failed.length} deletions failed`);
```

### Bulk Toolbar

Use `DataTableBulkToolbar` for a floating action bar when rows are selected:

```typescript
import { DataTableBulkToolbar } from '@/components/data-table';

<DataTableBulkToolbar
  selectedCount={selectedIds.length}
  onClearSelection={() => table.toggleAllRowsSelected(false)}
  actions={[
    { label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'destructive', onClick: handleBulkDelete },
  ]}
/>
```

### Entity Display Components

Use `components/entity/` for rendering entities with UIAttributeEntity fields in tables/lists:

```typescript
import { EntityBadge } from '@/components/entity/entity-badge';

// In column cell - shows icon/image + name in a badge
<EntityBadge id={role.id} name={role.name} icon={role.icon} color={role.color} />
```

---

## Icon Picker Integration

```typescript
import { IconPicker } from '@/components/ui/icon-picker';
import { IconDisplay } from '@/components/ui/icon-display';

// In form
<IconPicker value={icon} onChange={(name) => form.setValue('icon', name)} />

// Display saved icon
<IconDisplay name="map-pin" className="h-4 w-4" />
```
