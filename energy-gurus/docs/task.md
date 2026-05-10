# Project Execution Tasks

## Phase 1: Setup & Configuration
- `[x]` Install Drizzle ORM, Neon serverless, and Upstash Redis dependencies.
- `[ ]` Install UploadThing for file management (in progress).
- `[x]` Create Drizzle schema for `Users`, `EpcInstallers`, `Brands`, `Products`, and `Podcasts`.
- `[x]` Configure `.env` structure (Clerk, Neon, Redis, UploadThing).

## Phase 2: Authentication & Middleware
- `[/]` Configure Clerk Middleware to strictly isolate dashboard routes based on user roles (Route-level protection implemented).
- `[ ]` Create Clerk role sync webhook or database sync utility.

## Phase 3: Dashboard Interfaces
- `[x]` Create `dashboard/layout.tsx` with role-aware sidebar navigation.
- `[x]` Create Super Admin & Admin Dashboards.
  - `[x]` User Management interface.
  - `[x]` Podcast & Live QA YouTube Link Management interface.
- `[x]` Create EPC Dashboard.
  - `[x]` Profile & Branding management.
  - `[x]` UploadThing integration for portfolios.
- `[x]` Create Brand Dashboard.

## Phase 4: Public Directory & Pages
- `[x]` Create public EPC Directory listing page.
- `[x]` Create public EPC Profile page.
- `[x]` Update Homepage to display YouTube embeds for Podcasts and QA sessions fetching from DB.

## Phase 5: Verification
- `[ ]` Verify DB schemas.
- `[ ]` Verify role-based routing (EPC cannot access Admin dashboard).
- `[ ]` Verify upload functionality.
