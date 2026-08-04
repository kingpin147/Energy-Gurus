# EnergyGurus.Online — Platform Codebase

A full-stack Next.js 16 platform connecting **EPC solar installers** with **global solar brands** in Pakistan's energy market.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14/15 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Clerk |
| File Storage | Cloudflare R2 (S3-compatible) |
| Cache | Upstash Redis |
| Email | Brevo (Transactional Email via SMTP/API) |
| Analytics | PostHog |
| i18n | next-intl (EN / UR) |
| UI | Radix UI + shadcn/ui + TailwindCSS + Lucide Icons |

---

## 🏗️ Project Structure

```text
src/
├── app/[locale]/
│   ├── (public)/         # Public-facing pages (Home, EPCs, Brands, Podcast, Live QA...)
│   └── dashboard/        # Role-protected dashboards (Admin, EPC, Brand...)
├── components/
│   ├── dashboard/        # Dashboard-specific UI components (Sidebar, Tables, Dialogs)
│   ├── shared/           # Reusable components (EpcContactButtons, BrandContactButtons...)
│   ├── monitoring/       # Forms and UI for Monitoring & O&M pages
│   ├── forms/            # Form components (ContactForm, ReviewForm...)
│   └── ui/               # shadcn/ui primitives
├── db/
│   ├── schema.ts         # Drizzle ORM schema definitions
│   └── index.ts          # Database client configuration
└── lib/
    ├── r2.ts             # Cloudflare R2 upload + URL utilities
    ├── redis.ts          # Upstash Redis client + cache keys
    ├── mail.ts           # Brevo email integration for notifications
    ├── actions/          # Server Actions (auth, epc, brand, reviews, inquiries...)
    └── utils/            # Shared utility functions
```

---

## 🌐 Public Pages

- **Home (`/`)**: Landing page with hero, search, and core feature highlights.
- **Solar Brands (`/brands`)**: Directory of solar equipment manufacturers.
- **Find an Installer (`/epcs`)**: Directory of EPC contractors with advanced search/filters.
- **Monitoring & O&M (`/monitoring` & `/om`)**: Dedicated service pages for system monitoring and operation & maintenance, including interactive pricing tables and pre-pay request forms.
- **Podcast (`/podcast`)**: Video library of previous podcast episodes and interviews.
- **Live Q&A (`/live-qa`)**: Real-time Q&A interface featuring a YouTube embed, a countdown timer, and a live Q&A submission system with highlight voting.

---

## 🎛️ Dashboard Modules

The platform features role-based dashboards (`/dashboard`) tailored to the user's permissions:

### **1. Admin Dashboard** (Super-Admin & Admin)
- **Analytics (`/dashboard/analytics`)**: Real-time telemetry, user stats, and system health overview.
- **Users (`/dashboard/users`)**: Invite, activate/deactivate, manage profiles, and delete EPC/Brand users.
- **Inquiries (`/dashboard/inquiries`)**: Centralized support inbox for contact forms submitted from public profiles or the general contact page.
- **Monitoring Requests (`/dashboard/monitoring/requests`)**: Dashboard to view and manage customer requests for monitoring and O&M services.
- **Reports (`/dashboard/reports`)**: Exportable CSV reports for users and form submissions.
- **Content Management (`/dashboard/content`, `/dashboard/podcasts`)**: Controls for Podcast episodes and Live Q&A sessions.
- **Moderation (`/dashboard/moderation`)**: Reviewing platform content and user reviews.

### **2. EPC Dashboard** (Installers)
- **Profile Management**: Update company info, logo, contact details, and cover image.
- **Projects Portfolio**: Manage installed projects and upload images.
- **Inbox**: View direct inquiries and leads from customers.

### **3. Brand Dashboard** (Manufacturers)
- **Profile Management**: Update brand details, branding, and contact info.
- **Products**: Add and manage solar products, upload datasheets, and product images.
- **Inbox**: View direct inquiries from distributors or EPCs.

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd energy-gurus
npm install
```

### 2. Configure Environment Variables

Copy `.env` to `.env.local` and fill in all values:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Cloudflare R2 — Primary File Storage
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_key_id
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=energy-gurus
R2_PUBLIC_URL=https://pub-xxxx.r2.dev   # Your R2 public subdomain

# Upstash Redis Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Email (Brevo)
BREVO_API_KEY=xkeysib-...

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# App URL
NEXT_PUBLIC_APP_URL=https://energygurus.online
```

### 3. Run Locally

```bash
npm run dev
```

---

## 📦 Storage: Cloudflare R2

All user-uploaded assets (logos, portfolio images, product photos, datasheets) are stored on **Cloudflare R2** using presigned URL uploads.

### How Uploads Work
1. Client calls `useR2Upload` hook → requests a presigned URL from `/api/r2/presign`
2. File is uploaded directly from the browser to R2
3. The public URL (`R2_PUBLIC_URL/key`) is saved to the database

### Folder Structure in R2 Bucket
```
energy-gurus/
├── epc-logos/
├── epc-portfolio/
├── project-images/
├── brand-logos/
├── brand-photos/
├── product-images/
├── datasheets/
└── podcast-thumbnails/
```

### Automated Cleanup
When an Admin **deletes an EPC or Brand user**, all associated R2 assets are automatically deleted via the `deleteUser` server action.

---

## 🗄️ Database

Drizzle ORM manages the schema. To apply migrations:

```bash
npx drizzle-kit push    # Push schema changes to Neon
npx drizzle-kit studio  # Open Drizzle Studio (local DB browser)
```

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| `super-admin` | Full platform control |
| `admin` | Manage users, view reports |
| `epc` | Manage own installer profile |
| `brand` | Manage own brand profile |

---

## 📊 Admin Features

- **Live Telemetry** — Real-time stats from the database (users, inquiries, sessions)
- **CSV Reports** — Exportable reports for Users, Monitoring, and Support Inbox
- **User Management** — Invite, activate/deactivate, and delete EPC/Brand users
- **Support Inbox** — View all contact inquiries sent via public profiles

---

## 🌍 Internationalization

The platform supports **English (EN)** and **Urdu (UR)** via `next-intl`. Translation keys are stored in `messages/en.json` and `messages/ur.json`.

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Set all environment variables in the Vercel dashboard
4. Deploy — Vercel handles Next.js SSR + API routes automatically

> **Note:** Ensure your R2 bucket has a public subdomain configured in Cloudflare (Bucket Settings → Connect Custom Domain) before going live.

---

## 🔐 Security Notes

- All server actions and API routes validate the Clerk session before accessing data
- R2 presign endpoint is protected — only authenticated users can generate upload URLs
- Admin/Super-Admin routes use server-side role checks via `getUserRole()`
