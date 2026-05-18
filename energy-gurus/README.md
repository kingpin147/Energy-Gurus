# Energy Gurus - Advanced Energy Dashboard & Directory

Energy Gurus is a high-performance, full-stack platform designed to bridge the gap between energy stakeholders, certified installers (EPCs), and brands. It features a robust role-based dashboard for managing EPC profiles, product verifications, and YouTube-integrated podcasts.

## 🚀 Technology Stack

- **Framework:** [Next.js 15+ (App Router)](https://nextjs.org/)
- **Database:** [Neon (Serverless Postgres)](https://neon.tech/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Analytics:** [PostHog Cloud](https://posthog.com/)
- **Caching:** [Upstash Redis](https://upstash.com/)
- **File Storage:** [UploadThing](https://uploadthing.com/)
- **Styling:** Tailwind CSS + Lucide Icons

## ✨ Core Features

### 📊 Real-Time Analytics Dashboard
- **Engagement Hub:** Advanced tracking of user interactions across the platform using PostHog.
- **Brand Performance Matrix:** Detailed table showing views, website clicks, and social media engagement for all brands.
- **EPC Installer Ranking:** Monitor profile views and contact inquiries for installation partners.
- **Smart Sorting:** Filter entities by Highest Engagement, Lowest Engagement, or A-Z.
- **Zero-DB Overhead:** Analytics are fetched via PostHog's HogQL API, ensuring no performance impact on the primary database.

### 👤 Role-Based Access Control (RBAC) & Automated Verification
Strictly isolated dashboards for different user types:
- **Super Admin:** Full system control, user management (promoting/demoting admins), and content moderation.
- **Admin:** Manage website users and update dynamic content like YouTube podcasts/QA.
- **EPC (Installer) & Brand Dashboards:** Manage company branding, offices, projects, warranty info, and upload multi-image portfolios.
- **Invite-Only Auto-Verification:** Auto-creation and verification (`isVerified: true`) for invited EPCs and Brands upon first-login, ensuring zero manual DB intervention.
- **Public Visibility Warning Banners:** Integrated top-level warning banner shown dynamically on the EPC/Brand dashboard if their profile completeness is below **50%**, detailing missing checkpoints to achieve public directory visibility.

### 🏢 Partner Directories & Dynamic Search
- **Strategic Directories:** Public search indices for verified EPC companies and tier-1 solar manufacturers.
- **50% Profile Completeness Threshold:** Automatic filtering of incomplete draft profiles. EPCs and Brands are completely hidden from public directories, search pages, and sitemaps unless their profile completeness score is at least **50%**.
- **Direct Link 404 Enforcers:** Accessing dynamic profiles directly via their URL (e.g. `/epcs/[id]` or `/brands/[id]`) automatically enforces a `404 Not Found` if their score is below `50%`.
- **Debounced Search Inputs:** Real-time client-side debounced search input component (`ListSearch`) synchronized with URL state parameters.
- **Type-safe Drizzle Filters:** Fast database filtering utilizing SQL case-insensitive `ilike` and `and` expressions.
- **Segmented Caching:** Cache tagged results under Next.js `unstable_cache` with search query segments.

### 📈 SEO Optimization & Discoverability
- **JSON-LD Schema Markup:** Dynamic injections of Google-friendly structured data (`LocalBusiness` on individual EPC profiles and `Organization` on Brand profiles) to display premium review star snippets.
- **Completeness-Aware Sitemap Generator:** Dynamically excludes incomplete profiles (completeness `< 50%`) from generating in `/sitemap.xml`, maintaining indexation excellence for search engine bots.

### 🎙️ Podcast & Live QA Integration
- Dynamic homepage updates fetching latest episodes directly from the database.
- YouTube embed integration managed via the Admin Dashboard.

### 🔐 Secure User Management
- **On-Demand User Sync Engine:** Solves registration status latency. As soon as an invited user registers in Clerk, loading the Admin User Management panel (`/dashboard/users`) performs an on-demand active sync, instantly transferring them to "Registered Users" and deleting their pending invitation.
- **Role Assignment:** Custom dashboard interface to assign roles without leaving the website.
- **Metadata Sync:** Seamless sync between Clerk metadata and the local Postgres database.

## 📊 PostHog Analytics Engine & HogQL Architecture

EnergyGurus implements a high-performance, decoupled analytics layer utilizing **PostHog Cloud** and Next.js Server Components. Instead of logging clicks and views inside Postgres (which degrades database performance over time), all telemetry data is captured on the client and queried on the server via PostHog's Query API and **HogQL (PostHog's SQL Dialect)**.

### 1. Telemetry Capture (Client-Side)
Telemetry is initialized inside the `CSPostHogProvider` at the root layout. Interactions are automatically captured using wrapper components:
* **`TrackedLink` & `TrackedInteraction`**: Log profile redirections, official website visits, and WhatsApp direct actions.
* **`SocialLinkTracker`**: Captures platform-specific social media link clicks (Facebook, YouTube, LinkedIn, WhatsApp).
* **Tracked Events**:
  - `brand_portfolio_view`: Tracked when users open a brand profile page.
  - `brand_website_click`: Tracked when brand outbound links are followed.
  - `epc_profile_view`: Tracked when users browse an EPC partner's showcase.
  - `brand_social_click` / `epc_social_click`: Tracked when users engage with social handles.

### 2. High-Performance Server-Side Aggregation (HogQL)
Inside [posthog.ts](file:///d:/downloads%206-11-2025/Energy%20Gurus/energy-gurus/src/lib/posthog.ts), server actions run SQL-like HogQL queries through PostHog's Query API:
* **Trend Analysis**: `getPostHogTrends` retrieves event trends over a 30-day window to plot line charts.
* **Database Alignment**: `getPostHogTable` retrieves aggregated events (e.g. `SUM(clicks)`, `COUNT(views)`) grouped by partner `id`. It queries the Neon Postgres database to get the active names first, ensuring only active profiles are returned and sorted (by engagement, views, or clicks).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- A Neon DB account (Postgres)
- A Clerk account
- An UploadThing account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kingpin147/Energy-Gurus.git
   cd Energy-Gurus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   DATABASE_URL=your_neon_db_url
   CLERK_SECRET_KEY=your_clerk_secret
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   UPLOADTHING_TOKEN=your_uploadthing_token

   # Analytics (PostHog)
   NEXT_PUBLIC_POSTHOG_KEY=your_phc_key
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   POSTHOG_API_KEY=your_phx_key_with_insight_read
   NEXT_POSTHOG_PROJECT_ID=your_project_id
   ```

4. **Push Database Schema:**
   ```bash
   npx drizzle-kit push
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `/src/app`: Next.js App Router (Pages & API routes)
- `/src/db`: Database schema and connection configuration
- `/src/lib`: Shared utilities, roles logic, and server actions
- `/src/components`: Reusable UI components
- `/docs`: Implementation plans and project walkthroughs

## 📄 License
Internal project for Energy Gurus. All rights reserved.
