# Architecture

System structure, routes, and data flows for the Asette Inventory UI.

## Package Dependencies

```
Next.js 16 (App Router)
├── React 19 + React DOM 19
├── Tailwind CSS v4 + tw-animate-css
├── Shadcn UI (new-york style, Radix primitives)
├── @tanstack/react-table (data grids)
├── react-hook-form + @hookform/resolvers + zod (forms)
├── leaflet + react-leaflet + leaflet-draw (maps)
├── @dnd-kit (drag-and-drop)
├── @aws-sdk/client-s3 + client-cloudfront (image storage)
├── jwt-decode (auth token parsing)
├── sonner (toast notifications)
├── next-themes (dark/light mode)
├── tesseract.js + pdfjs-dist (OCR)
├── cmdk + vaul (command palette, drawer)
└── lucide-react (icons)
```

---

## Directory Structure

```
app/
├── layout.tsx                          # Root layout (ThemeProvider, AuthProvider, Toaster)
├── globals.css                         # Tailwind v4 + CSS vars (OKLCH)
├── (auth)/                             # Public routes (GuestGuard)
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (main)/                             # Protected routes (AuthGuard + Sidebar)
│   ├── layout.tsx                      # Sidebar + Header layout
│   ├── dashboard/page.tsx
│   ├── developers/page.tsx
│   ├── projects/page.tsx
│   ├── categories/                     # CRUD entity page set
│   │   ├── page.tsx
│   │   ├── categories-table.tsx
│   │   ├── categories-columns.tsx
│   │   ├── categories-toolbar.tsx
│   │   └── category-sheet.tsx
│   ├── access/
│   │   ├── users/                      # Users CRUD
│   │   └── roles/                      # Roles CRUD
│   ├── geo/
│   │   ├── locations/
│   │   │   ├── _components/            # Shared: LocationGroup, LocationCard, types
│   │   │   ├── countries/              # Card UI (page + sheet only)
│   │   │   ├── cities/                 # Card UI (page + sheet only)
│   │   │   ├── districts/             # Card UI (page + sheet only)
│   │   │   └── areas/                  # Card UI (page + sheet only)
│   │   └── attractions/                # Standard 5-file CRUD
│   ├── properties/
│   │   ├── structures/page.tsx
│   │   └── units/page.tsx
│   └── settings/
│       ├── amenities/                  # Amenities CRUD
│       ├── transports/                 # Transports CRUD
│       ├── feature-types/              # Feature Types CRUD
│       └── structure-types/            # Structure Types CRUD
├── api/[...path]/route.ts              # Catch-all API proxy
├── image-uploader/                     # S3 image upload feature
└── payment-plan/                       # AI payment plan extraction

components/
├── auth/                               # AuthGuard, GuestGuard, forms
├── crud/                               # Reusable CRUD components (barrel: index.ts)
├── data-table/                         # TanStack table components (barrel: index.ts)
├── entity/                             # Entity display: EntityIcon, EntityImage, EntityBadge
├── icons/                              # Custom SVG icons
├── nav/                                # Sidebar, header, nav data
│   ├── data/                           # Route group configs (barrel: index.ts)
│   └── interfaces/                     # NavItem, NavGroupItem types
├── providers/                          # AuthProvider (React Context)
├── theme/                              # ThemeProvider, ThemeToggle
└── ui/                                 # Shadcn UI + custom components

hooks/                                  # Custom React hooks
lib/
├── api.ts                              # Client-side API wrapper
├── env.ts                              # Env validation
├── s3-client.ts                        # AWS S3/CloudFront config
├── utils.ts                            # Utility functions
├── actions/                            # Server actions
│   ├── api.ts                          # Server-side fetch helpers
│   ├── entities.ts                     # Entity CRUD actions (60 actions)
│   └── buildings.ts                    # Building-specific actions
└── validations/
    └── entities.ts                     # Zod schemas for all entities

types/                                  # TypeScript type definitions
```

---

## Authentication Flow

```
User lands on protected route
    │
    ▼
AuthGuard checks localStorage for JWT
    │
    ├── No token → Redirect to /login?redirect=...
    │
    └── Has token → jwt-decode to validate expiry
         │
         ├── Expired → Logout + redirect to /login
         │
         └── Valid → Set user context, render children
              │
              └── Cookie sync for SSR (auth-token cookie)
```

### Auth Methods

| Method         | Flow                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| Email/Password | POST /api/auth/login → JWT in response → localStorage                            |
| Google OAuth   | Popup to /api/auth/google → Backend sets cookie → Popup closes → Token extracted |
| Signup         | POST /api/auth/signup → Auto-login with returned JWT                             |

### Token Storage

- **Client:** `localStorage.getItem('auth-token')`
- **SSR:** `cookies().get('auth-token')` (synced by AuthProvider)
- **API Proxy:** Authorization header forwarded to backend

---

## API Data Flow

```
Client Component                    Next.js Server                    Backend API
     │                                   │                                │
     │  (Client-side: api.get())         │                                │
     ├──────── /api/widgets ────────────►│                                │
     │                                   ├──── INVENTORY_API_URL/api/widgets ──►│
     │                                   │◄───────── JSON response ───────┤
     │◄──────── JSON response ───────────┤                                │
     │                                   │                                │
     │  (Server action: getWidgets())    │                                │
     ├── calls apiGet() ────────────────►│                                │
     │                                   ├──── INVENTORY_API_URL/api/widgets ──►│
     │                                   │◄───────── JSON response ───────┤
     │◄──────── typed response ──────────┤                                │
```

### Two API Layers

| Layer          | File                                             | Used By                           | Auth                           |
| -------------- | ------------------------------------------------ | --------------------------------- | ------------------------------ |
| Client API     | `lib/api.ts`                                     | Client components directly        | Bearer token from localStorage |
| Server Actions | `lib/actions/api.ts` + `lib/actions/entities.ts` | Server actions, server components | Auth cookie                    |

---

## CRUD Entity Page Architecture

```
PageLayout (title, description, icon, onAdd)
├── EntityTable ("use client")
│   ├── state: items[], pagination, loading, search, sort, selectedItem
│   ├── useTableState (localStorage persistence)
│   ├── EntityToolbar
│   │   ├── Search Input
│   │   ├── Refresh Button
│   │   └── DataTableViewOptions
│   ├── DataTable (TanStack)
│   │   └── EntityColumns (column defs + actions)
│   ├── DataTablePagination
│   ├── EntitySheet (create/edit form)
│   │   ├── react-hook-form + Zod
│   │   └── FormField components
│   └── DeleteDialog (confirmation)
```

### Entity CRUD State Machine

```
Idle → Loading (fetch) → Display Data
  │                          │
  ├── Create → Sheet Open → Submit → Loading → Success (refetch) / Error (toast)
  ├── Edit → Sheet Open (prefilled) → Submit → Loading → Success (refetch) / Error (toast)
  ├── Delete → Dialog Open → Confirm → Loading → Success (refetch) / Error (toast)
  └── Bulk Select → BulkToolbar appears → Bulk Action → Loading → Success (refetch) / Error (toast)
```

### Bulk Operations

`bulkDelete(deleteFn, ids[])` runs deletions in parallel via `Promise.allSettled`.
`DataTableBulkToolbar` renders as a portal floating bar at bottom of viewport when rows are selected.

---

## All Application Routes

### Public Routes (GuestGuard)

| Route     | Page       | Purpose                       |
| --------- | ---------- | ----------------------------- |
| `/login`  | LoginForm  | Email/password + Google OAuth |
| `/signup` | SignupForm | User registration             |

### Protected Routes (AuthGuard)

| Route                       | Page                 | Entity Type        |
| --------------------------- | -------------------- | ------------------ |
| `/dashboard`                | Dashboard            | Overview           |
| `/developers`               | Developers           | Developer entities |
| `/projects`                 | Projects             | Project entities   |
| `/categories`               | Categories CRUD      | Category           |
| `/access/users`             | Users CRUD           | User               |
| `/access/roles`             | Roles CRUD           | Role               |
| `/geo/locations/countries`  | Countries CRUD       | Country (geo)      |
| `/geo/locations/cities`     | Cities CRUD          | City (geo)         |
| `/geo/locations/districts`  | Districts CRUD       | District (geo)     |
| `/geo/locations/areas`      | Areas CRUD           | Area (geo)         |
| `/geo/attractions`          | Attractions CRUD     | Attraction (geo)   |
| `/settings/amenities`       | Amenities CRUD       | Amenity (geo)      |
| `/settings/transports`      | Transports CRUD      | Transport          |
| `/settings/feature-types`   | Feature Types CRUD   | FeatureType        |
| `/settings/structure-types` | Structure Types CRUD | StructureType      |
| `/properties/structures`    | Structures           | Building/Structure |
| `/properties/units`         | Units                | Property units     |

### Special Routes (No main layout)

| Route             | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `/image-uploader` | S3 bulk image upload for buildings                          |
| `/payment-plan`   | AI-powered payment plan extraction (Gemini + Tesseract OCR) |

### API Routes

| Route            | Methods                       | Purpose                                |
| ---------------- | ----------------------------- | -------------------------------------- |
| `/api/[...path]` | GET, POST, PUT, PATCH, DELETE | Catch-all proxy to `INVENTORY_API_URL` |

---

## Navigation Structure

```
Sidebar
├── (Main)
│   ├── Dashboard          /dashboard
│   ├── Developers         /developers
│   └── Projects           /projects
├── Properties
│   ├── Buildings          /properties/structures
│   └── Units              /properties/units
├── Geo
│   ├── Locations ▼
│   │   ├── Countries      /geo/locations/countries
│   │   ├── Cities         /geo/locations/cities
│   │   ├── Districts      /geo/locations/districts
│   │   └── Areas          /geo/locations/areas
│   └── Attractions        /geo/attractions
├── Access (admin only)
│   ├── Users              /access/users
│   └── Roles              /access/roles
├── Settings
│   ├── Categories         /categories
│   ├── Amenities          /settings/amenities
│   ├── Transports         /settings/transports
│   └── Types ▼
│       ├── Feature Types  /settings/feature-types
│       └── Structure Types /settings/structure-types
└── Other
    └── Payment Plans      /extra/payment-plans
```

---

## Key Subsystems

### Image Upload Pipeline

`app/image-uploader/` - Server-side S3 upload with CloudFront CDN invalidation. Supports bulk upload with filename-to-building matching. Images stored at `S3_CONFIG.prefix/{uuid}.jpg`.

### Payment Plan Extraction

`app/payment-plan/` - Client-side feature using Tesseract.js for OCR and Gemini Vision API for structured data extraction from PDF/image payment plans. Extracts payment milestones with amounts, dates, and percentages.

### Map System

`components/ui/map.tsx` - Dynamic import wrapper around react-leaflet with drawing controls (leaflet-draw), marker clustering, and SSR protection. `components/crud/geo-editor.tsx` provides form integration for coordinates/boundaries editing.

### Data Table System

`components/data-table/` - TanStack React Table integration with server-side pagination, column sorting, faceted filtering, column visibility persistence (localStorage), and responsive mobile filter drawer.
