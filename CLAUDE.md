# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@.claude/claude-md-refs/development-guide.md
@.claude/claude-md-refs/architecture.md
@.claude/claude-md-refs/exports-reference.md

## Quick Documentation Reference

| Need Help With                        | See File             |
| ------------------------------------- | -------------------- |
| Adding features / step-by-step guides | development-guide.md |
| Understanding system / routes / flows | architecture.md      |
| Finding exports / types / APIs        | exports-reference.md |

## Project Overview

Asette Inventory is a property and inventory management system built with Next.js 16 (App Router). It features authentication (JWT + Google OAuth), interactive maps (Leaflet), data tables (@tanstack/react-table), and AI-powered extraction (Gemini).

## Key Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm lint     # Run ESLint
pnpm format   # Run Prettier
```

## Architecture

### Route Structure

- `app/(auth)/` - Public routes: `/login`, `/signup` (wrapped with `GuestGuard`)
- `app/(main)/` - Protected routes: dashboard, properties, geo, access (wrapped with `AuthGuard`)
- `app/api/[...path]/` - Catch-all API proxy that forwards requests to `INVENTORY_API_URL`

### Authentication Flow

- JWT tokens stored in localStorage + synced to cookie for SSR
- `AuthProvider` (`components/providers/auth-provider.tsx`) manages auth state via React Context
- `useAuth()` hook provides `user`, `isAuthenticated`, `login`, `signup`, `loginWithGoogle`, `logout`, `isAuthorized`
- Protected routes use `AuthGuard`, public auth routes use `GuestGuard`

### API Layer

- `lib/api.ts` - Client-side API wrapper that auto-attaches Bearer token
- `lib/actions/api.ts` - Server-side fetch helpers (reads auth cookie)
- `lib/actions/entities.ts` - 64 server actions (60 CRUD + `assignUserRole`, `removeUserRole`, `bulkAssignRoles`, `bulkDelete`)
- All API calls go through `/api/...` which proxies to the backend
- 401 responses trigger automatic logout and redirect to login

### Component Organization

- `components/ui/` - Shadcn UI components (new-york style) + custom map, icon-picker, place-autocomplete
- `components/crud/` - Reusable CRUD components: EntitySheet, FormField, DeleteDialog, PageLayout, GeoEditor, skeletons
- `components/data-table/` - TanStack table with pagination, sorting, filtering, column visibility, bulk toolbar
- `components/entity/` - Entity display components: EntityIcon, EntityImage, EntityBadge (no barrel)
- `components/nav/` - Sidebar, header, navigation groups with role-based filtering
- `components/auth/` - AuthGuard, GuestGuard, login/signup forms

### CRUD Page Pattern

Each entity follows a 5-file pattern in its route directory:

| File                     | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `page.tsx`               | Page with PageLayout, opens sheet             |
| `{entities}-table.tsx`   | Table component with state, fetch, CRUD logic |
| `{entities}-columns.tsx` | Column definitions + defaultVisibleColumns    |
| `{entities}-toolbar.tsx` | Search + filters + view options               |
| `{entity}-sheet.tsx`     | Create/edit form (react-hook-form + Zod)      |

### Styling

- Tailwind CSS v4 with CSS variables (OKLCH color space)
- Shadcn UI configured in `components.json` (new-york style, neutral base color)
- Global styles in `app/globals.css`
- Use `cn()` from `lib/utils.ts` for class merging

## Conventions

- Path alias: `@/` maps to project root
- Icons: `lucide-react` (use `IconPicker` for entity icon selection, `IconDisplay` for rendering)
- Validation: Zod schemas in `lib/validations/entities.ts`
- Types: Defined in `types/` directory (entities.ts, common.ts, auth.ts)
- Forms: `react-hook-form` + `@hookform/resolvers/zod`
- Toasts: `sonner` (`toast.success()`, `toast.error()`)
- Server actions: `lib/actions/entities.ts` (pattern: `get{Entity}s`, `create{Entity}`, `update{Entity}`, `delete{Entity}`)

## Environment Variables

```
INVENTORY_API_URL     # Backend API URL (proxied via /api)
GEMINI_API_KEY        # Gemini AI integration
ASETTE_BE_API_URL     # Asette backend URL
ASETTE_BE_API_KEY     # Asette backend API key
```
