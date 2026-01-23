# Asette Inventory UI Project Context

## Project Overview

Asette Inventory is a Next.js 16 application designed for inventory and property management. It leverages modern web technologies to provide a responsive, accessible, and feature-rich user interface. The application includes authentication, interactive maps, data tables, and AI-powered features (implied by `GEMINI_API_KEY` and extraction specs).

## Technology Stack

*   **Framework:** Next.js 16.1.4 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4, CSS Variables (OKLCH color space)
*   **UI Components:** Shadcn UI (Radix UI primitives), Lucide React Icons
*   **State Management:** React Hooks, Context API
*   **Data Display:** @tanstack/react-table
*   **Maps:** Leaflet, React Leaflet, Leaflet Draw
*   **Validation:** Zod
*   **Package Manager:** pnpm

## Key Commands

*   `pnpm dev`: Start the development server.
*   `pnpm build`: Build the application for production.
*   `pnpm start`: Start the production server.
*   `pnpm lint`: Run ESLint.
*   `pnpm format`: Run Prettier.

## Architecture & Directory Structure

*   **`app/`**: Application source code (App Router).
    *   **`(auth)/`**: Public authentication routes (Login, Signup).
    *   **`(main)/`**: Protected application routes (Dashboard, Inventory, Maps).
        *   **`layout.tsx`**: Main layout with Sidebar and Header.
    *   **`api/`**: API routes.
    *   **`globals.css`**: Global styles and Tailwind configuration.
    *   **`layout.tsx`**: Root layout with Providers (Theme, Auth).
*   **`components/`**: React components.
    *   **`ui/`**: Shadcn UI generic components.
    *   **`nav/`**: Navigation specific components (Sidebar, Header).
    *   **`auth/`**: Authentication forms and guards.
    *   **`data-table/`**: Reusable table components.
*   **`lib/`**: Utilities and configurations.
    *   **`utils.ts`**: Helper functions (including `cn`).
    *   **`api.ts`**: API client configuration.
*   **`hooks/`**: Custom React hooks.
*   **`types/`**: TypeScript type definitions.
*   **`public/`**: Static assets.

## Development Conventions

*   **Path Aliases:** Use `@/` to import from the root directory (e.g., `import { Button } from '@/components/ui/button'`).
*   **Styling:** Use Tailwind CSS utility classes. Avoid inline styles.
*   **UI Components:** Prefer Shadcn UI components located in `components/ui`.
*   **Icons:** Use `lucide-react`.
*   **Validation:** Use Zod schemas for form and API data validation.
*   **Maps:** Use `react-leaflet` components with custom styles defined in `globals.css`.
*   **Tables:** Use `@tanstack/react-table` for complex data grids.
*   **Authentication:** Wrap protected pages/layouts with `AuthGuard`.

## Environment Variables

Ensure `.env` is configured based on `.env.example`:
*   `INVENTORY_API_URL`: Backend API URL.
*   `GEMINI_API_KEY`: API Key for Gemini integration.
*   `ASETTE_BE_API_URL` & `ASETTE_BE_API_KEY`: Asette Backend credentials.
