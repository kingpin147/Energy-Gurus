# Energy Gurus Dashboard Implementation Walkthrough

We have successfully implemented a robust, role-based dashboard system for the Energy Gurus platform. This walkthrough summarizes the key features and configuration details.

## 🚀 Overview of Changes

### 1. Technology Stack
- **Next.js 16 (App Router):** Full-stack framework for frontend and backend logic.
- **Neon DB (Postgres):** Serverless database for high performance.
- **Drizzle ORM:** Lightweight and fast database management.
- **Clerk:** Secure authentication and role-based access control (RBAC).
- **UploadThing:** Seamless file and portfolio image uploads.

### 2. Dashboard Features (Role-Based)
- **Super Admin / Admin:**
  - **User Management:** View all users and assign roles (Admin, EPC, Brand).
  - **Podcast/QA Management:** Add and update YouTube links that appear on the homepage.
- **EPC Dashboard:**
  - **Company Branding:** Update company name, website, and "About" section.
  - **Portfolio:** Upload and manage project images via UploadThing.
- **Brand Dashboard:**
  - **Brand Info:** Manage customer care numbers and logos.
  - **Product Verification:** (Foundation ready) Manage product serial numbers.

### 3. Public Pages
- **EPC Directory (`/epcs`):** A public list of all verified installers.
- **EPC Profile (`/epcs/[id]`):** Individual pages showing company details, portfolios, and contact options.
- **Dynamic Homepage:** Automatically fetches the latest podcast episodes and Live QA sessions from the database.

## 🛠️ Setup & Configuration

### Environment Variables (`.env`)
Ensure your `.env` file contains the following keys:
- `DATABASE_URL` (Neon)
*   `UPSTASH_REDIS_REST_URL` & `TOKEN` (Redis)
*   `UPLOADTHING_SECRET` & `APP_ID`
*   Clerk Publishable & Secret Keys

### Database Setup
We have already pushed the schema using `drizzle-kit push`. If you make changes to `src/db/schema.ts`, run:
```bash
npx drizzle-kit push
```

## 🧪 Verification & Testing
- ✅ **Database:** Verified connection using raw SQL and Drizzle queries.
- ✅ **Roles:** Sidebar dynamically filters links based on user role.
- ✅ **Homepage:** Verified YouTube embeds load correctly from DB data.

## 📁 Project Documentation
The implementation plan and task list are saved in the `docs/` folder:
- [docs/implementation_plan.md](file:///d:/nouman%20wix%20code/energy%20guru/energy-gurus/docs/implementation_plan.md)
- [docs/task.md](file:///d:/nouman%20wix%20code/energy%20guru/energy-gurus/docs/task.md)
