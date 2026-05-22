# EnergyGurus.Online — Platform Codebase

A full-stack Next.js 16 platform connecting **EPC solar installers** with **global solar brands** in Pakistan's energy market.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Clerk |
| File Storage | Cloudflare R2 (S3-compatible) |
| Cache | Upstash Redis |
| Email | Brevo (Transactional Email) |
| Analytics | PostHog |
| i18n | next-intl (EN / UR) |
| UI | Radix UI + shadcn/ui + TailwindCSS |

---

## 🏗️ Project Structure

```
src/
├── app/[locale]/
│   ├── (public)/         # Public-facing pages (Home, EPCs, Brands, Podcast, Live QA)
│   └── dashboard/        # Role-protected dashboards (Admin, EPC, Brand)
├── components/
│   ├── dashboard/        # Dashboard-specific UI components
│   ├── shared/           # Reusable components (EpcContactButtons, BrandContactButtons...)
│   ├── forms/            # Form components (ContactForm, ReviewForm...)
│   └── ui/               # shadcn/ui primitives
├── db/
│   ├── schema.ts         # Drizzle ORM schema
│   └── index.ts          # Database client
└── lib/
    ├── r2.ts             # Cloudflare R2 upload + URL utilities
    ├── redis.ts          # Upstash Redis client + cache keys
    ├── actions/          # Server Actions (auth, epc, brand, reviews...)
    └── hooks/            # Client hooks (useR2Upload)
```

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
