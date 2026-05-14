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

### 👤 Role-Based Access Control (RBAC)
Strictly isolated dashboards for different user types:
- **Super Admin:** Full system control, user management (promoting/demoting admins), and content moderation.
- **Admin:** Manage website users and update dynamic content like YouTube podcasts/QA.
- **EPC (Installer):** Manage company branding, about section, and upload work portfolios.
- **Brand:** Manage brand profile and product verification codes.

### 🏢 EPC Directory
- Public listing of verified EPC companies.
- Detailed profile pages with portfolio galleries and contact options.
- Lead generation for installers via inquiry forms.

### 🎙️ Podcast & Live QA Integration
- Dynamic homepage updates fetching latest episodes directly from the database.
- YouTube embed integration managed via the Admin Dashboard.

### 🔐 Secure User Management
- Custom dashboard interface to assign roles without leaving the website.
- Seamless sync between Clerk metadata and the local Postgres database.

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
