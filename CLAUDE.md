# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- JWT tokens stored in localStorage
- `AuthProvider` (`components/providers/auth-provider.tsx`) manages auth state via React Context
- `useAuth()` hook provides `user`, `isAuthenticated`, `login`, `signup`, `loginWithGoogle`, `logout`
- Protected routes use `AuthGuard`, public auth routes use `GuestGuard`

### API Layer

- `lib/api.ts` - Client-side API wrapper that auto-attaches Bearer token
- All API calls go through `/api/...` which proxies to the backend
- 401 responses trigger automatic logout and redirect to login

### Component Organization

- `components/ui/` - Shadcn UI components (new-york style)
- `components/data-table/` - Reusable table components with pagination, filtering, column visibility
- `components/nav/` - Sidebar, header, navigation groups
- `components/auth/` - AuthGuard, GuestGuard, login/signup forms

### Styling

- Tailwind CSS v4 with CSS variables (OKLCH color space)
- Shadcn UI configured in `components.json` (new-york style, neutral base color)
- Global styles in `app/globals.css`
- Use `cn()` from `lib/utils.ts` for class merging

### Data Tables

- Uses `@tanstack/react-table` for complex data grids
- `useTableState` hook persists column visibility/order to localStorage
- Column definitions support `meta.className` for custom styling

### Maps

- Leaflet with `react-leaflet` for interactive maps
- `swapCoordinates()` utility in `lib/utils.ts` for coordinate format conversion

## Conventions

- Path alias: `@/` maps to project root
- Icons: `lucide-react`
- Validation: Zod schemas
- Types: Defined in `types/` directory

## Environment Variables

```
INVENTORY_API_URL     # Backend API URL (proxied via /api)
GEMINI_API_KEY        # Gemini AI integration
ASETTE_BE_API_URL     # Asette backend URL
ASETTE_BE_API_KEY     # Asette backend API key
```
