# Dashboard and Technology Implementation Plan

This plan details the addition of dashboard functionalities with user access controls based on the updated structure document, along with technology recommendations to ensure high performance and speed.

## Confirmed Decisions

> [!NOTE]
> - **Database:** We will proceed with Neon DB. (We will need to set up the connection string in the `.env` file).
> - **Role Management:** We will use Clerk for authentication, but we will build a custom **User Management Interface in the Website Dashboard**. The Super Admin will be able to assign roles (Admin, EPC, Brand) directly from the dashboard UI, and this will sync with Clerk's Backend API to securely apply the roles without needing to use Clerk's external dashboard.

## Next Steps for Execution

> [!IMPORTANT]
> If you are ready for me to begin, please provide your **approval to proceed**. I will start by installing the necessary dependencies (Drizzle ORM, Upstash Redis, etc.) and initializing the database configuration.

## Technology Stack Recommendations for Speed

To ensure the fastest possible speeds, scalability, and optimal developer experience, I recommend integrating the following modern technologies into your current Next.js 16 setup:

1. **Database:** **Neon (Serverless Postgres)**
   - **Why:** Neon separates storage and compute, allowing it to scale to zero and start up in milliseconds. It integrates seamlessly with serverless environments (like Vercel or Netlify) without exhausting connection pools.

2. **ORM:** **Drizzle ORM**
   - **Why:** Drizzle is incredibly lightweight and performs faster than Prisma because it avoids the heavy rust engine at runtime. It's perfectly suited for serverless/edge environments.

3. **Caching & Speed:** **Upstash Redis**
   - **Why:** Serverless Redis is excellent for caching frequently accessed data (like the public EPC and Brand directories). Instead of hitting the Neon database on every page load, we cache the results in Redis. It is also great for API rate-limiting to prevent spam.

4. **Authentication / RBAC:** **Clerk (Already Installed)**
   - **Why:** We will utilize Clerk's metadata and organization features to assign roles (Super Admin, Admin, EPC, Brand) at the edge. This prevents unauthorized users from loading dashboard pages instantly.

5. **File Uploading:** **UploadThing** or **Vercel Blob**
   - **Why:** Since EPCs and Brands need to upload portfolios, datasheets, and images, we need a robust file storage solution. I recommend **UploadThing** because it integrates seamlessly with Next.js, provides excellent developer experience, and handles large files efficiently without overloading your server.

### Architecture Strategy & Hosting Recommendation

You asked if Vercel Premium (Pro) can hold this project or if we should switch to a Nest.js backend + Next.js frontend on a Hostinger Ubuntu VPS.

**My Recommendation: Stick to Next.js Full-Stack on Vercel Pro (For Now).**
- **Why:** Next.js (using the App Router) is essentially a full-stack framework. It can easily handle the backend logic for dashboards, user management, and API routes via server actions. By using Neon DB (serverless Postgres) and Upstash Redis, the heavy database lifting is offloaded from Vercel. Vercel Pro is highly capable of running large enterprise applications with this setup.
- **When to switch to Nest.js + VPS:** If your application logic becomes extremely complex (e.g., heavy background processing, websockets, microservices) or if Vercel bandwidth costs become too high due to massive scale, *then* it makes sense to decouple the backend to Nest.js and host on a Hostinger Ubuntu VPS. However, starting with a split architecture right now will significantly increase development time and DevOps overhead. Next.js + Vercel + Neon is the fastest and most efficient way to scale this project initially.

## Proposed Changes

---

### 1. Database & Schema Configuration
Implement Drizzle ORM to connect to Neon Postgres and define tables.

#### [NEW] `src/db/schema.ts`
Define the tables:
- `Users` (Profile info synced from Clerk)
- `Brands` (Brand profile, logos, representatives)
- `Products` (Belongs to Brand, datasheets, verification codes)
- `EpcInstallers` (Company profile, portfolio, ratings)
- `Inquiries` (Customer messages to Brands/EPCs)
- `Reviews` (Customer ratings for EPCs/Brands)

#### [NEW] `src/db/index.ts`
Initialize Drizzle ORM and Neon HTTP client.

---

### 2. User Access & Strict Dashboard Isolation
Dashboards will be strictly isolated using Next.js Middleware and Layouts. Users will only see what their role permits.

#### [NEW] `src/middleware.ts`
Implement Clerk middleware to protect routes. An EPC trying to access `/dashboard/admin` will be immediately redirected or blocked. 

#### [NEW] `src/app/dashboard/layout.tsx`
A global dashboard wrapper that checks the user's role. **User management links will ONLY be visible to Super Admins and Admins.**

#### [NEW] `src/app/dashboard/super-admin/page.tsx`
- **Super User Capabilities:** Add/Delete Admin users, manage all website users. Super Admins see everything.

#### [NEW] `src/app/dashboard/admin/page.tsx`
- **Admin Capabilities:** Manage standard users, approve EPC and Brand applications, moderate reviews.

---

### 3. EPC / Installer System
This includes both the public-facing pages and the isolated EPC dashboard.

#### [NEW] `src/app/epcs/page.tsx`
- **Public EPC Listing Page:** Displays the directory of certified EPC companies and installers.

#### [NEW] `src/app/epcs/[id]/page.tsx`
- **Public EPC Full Profile:** Displays the individual EPC profile (logo, about, work portfolio, ratings, reviews, contact options).

#### [NEW] `src/app/dashboard/epc/page.tsx`
- **Isolated EPC Dashboard:** Only the specific EPC profile holder can access this to:
  - View customer inquiries and reply to messages.
  - Upload portfolio images (via UploadThing).
  - View and respond to ratings & feedback.

---

### 4. Brands Dashboard
Separate portal for brand representatives.

#### [NEW] `src/app/dashboard/brand/page.tsx`
- Manage products and upload datasheets.
- View customer inquiries.
- Reply to customer feedback.
- Manage product verification section (Serial Number & QR Verification).

---

### 5. Data Fetching & Caching (Redis)
Integrating Redis to speed up public routes.

#### [NEW] `src/lib/redis.ts`
Initialize Upstash Redis client.

#### [MODIFY] `src/app/page.tsx`
Implement Next.js ISR (Incremental Static Regeneration) backed by Redis to cache the list of Brands and EPCs so the homepage loads instantly.

## Verification Plan

### Automated/Developer Verification
- Run database migrations locally using Drizzle to ensure schema is correct.
- Verify Clerk Role Based Access blocks unauthorized access to `/dashboard/super-admin` and `/dashboard/admin`.
- Verify Redis caching speeds up API responses.

### Manual Verification
- Have the user simulate logging in as an EPC and uploading a portfolio item.
- Have the user simulate logging in as a Brand and adding a product serial number.
- Have the user verify the Super Admin can successfully assign the "Admin" role to another user.
