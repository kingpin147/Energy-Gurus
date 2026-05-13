# EnergyGurus.Online - Product Requirements Document (PRD)

## Project Overview
EnergyGurus.Online is a specialized media and directory platform for Pakistan's energy sector. It provides expert analysis, verified installer directories, brand profiles, and live engagement sessions.

## Core Modules & Functionality

### 1. Podcast Module
- **Goal**: Publish and archive weekly energy insights.
- **Features**: 
  - Admin can add/delete YouTube embeds.
  - Featured episode highlight on homepage.
  - Full archive listing with guest details.
  - **Verification**: Check embedding works, thumbnails render, and YouTube links are valid.

### 2. Live QA Module
- **Goal**: Real-time engagement with energy experts.
- **Features**:
  - Countdown timer for upcoming sessions (must be precise down to seconds).
  - Question submission system (Clerk authenticated).
  - Live/Upcoming/Archived status badges.
  - **Verification**: Confirm timer stability (no layout shifting), status badge logic, and layout responsiveness.

### 3. EPC & Installers Directory
- **Goal**: Connect users with verified solar professionals.
- **Features**:
  - Searchable directory.
  - Detailed profiles with ratings and portfolios.
  - Verification badges for authenticated partners.
  - Inquiry system.
  - **Verification**: Test inquiry submissions and profile rendering.

### 4. Brand & Product Directory
- **Goal**: Technical validation of energy hardware.
- **Features**:
  - Brand profiles with verified product lists.
  - Datasheet downloads.
  - Comparison tools.
  - **Verification**: Check datasheet links and product categorization.

## Technical Architecture
- **Framework**: Next.js 15+ (App Router).
- **Authentication**: Clerk (Role-based: Super-admin, Admin, EPC, Brand).
- **Database**: Neon (PostgreSQL) with Drizzle ORM.
- **Storage**: UploadThing v7 (Token-based authentication).
- **Caching**: Upstash Redis (for high-traffic pages like Brand/EPC listings).
- **Styling**: Tailwind CSS (v4) with Shadcn UI.

## Testing & Audit Checklist for Ralph Loop

### A. Routing & Stability
- [ ] Check all public routes (`/`, `/podcast`, `/epcs`, `/brands`, `/live-qa`, `/about`).
- [ ] Verify that `/dashboard` requires authentication.
- [ ] Ensure no 500 errors occur on page load.

### B. Responsiveness (Mobile/Tablet/Desktop)
- [ ] Navbar collapses into mobile drawer below 768px.
- [ ] Dashboard cards stack vertically on mobile.
- [ ] Countdown timer remains centered and stable on all screen sizes.

### C. Functional Integrity
- [ ] **UploadThing**: Test file uploads in EPC Portfolio and Brand Logo sections (requires `UPLOADTHING_TOKEN`).
- [ ] **Tabs**: Content Management dashboard tabs (Podcasts vs Live QA) must toggle correctly with distinct active/inactive states.
- [ ] **Timer**: Ensure the `CountdownTimer` updates every second without shifting the UI.

### D. Security & Access Control
- [ ] Verify role-based access for `/dashboard/users` (Super-admin only).
- [ ] Check whitelist logic in `src/lib/roles.ts` for automated admin provisioning.

---
**Status**: Development & Optimization Phase
**Current Version**: 1.1 (Responsiveness & v7 UploadThing Update)
