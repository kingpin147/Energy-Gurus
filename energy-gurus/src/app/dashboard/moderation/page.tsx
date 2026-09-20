import { db } from "@/db";
import { brands, products, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { BrandModerationQueue } from "@/components/dashboard/BrandModerationQueue";
import { ShieldCheck, Building2 } from "lucide-react";

export default async function AdminBrandModerationPage() {
  const role = await getUserRole();

  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  let formattedBrands: any[] = [];

  try {
    const rawBrands = await db
      .select({
        id: brands.id,
        brandName: brands.brandName,
        logoUrl: brands.logoUrl,
        status: brands.status,
        countryOfOrigin: brands.countryOfOrigin,
        headquarters: brands.headquarters,
        website: brands.website,
        about: brands.about,
        adminFeedback: brands.adminFeedback,
        isVerified: brands.isVerified,
        updatedAt: brands.updatedAt,
        distributors: brands.distributors,
        productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number)
      })
      .from(brands)
      .orderBy(desc(brands.updatedAt));

    formattedBrands = rawBrands.map((b) => ({
      id: b.id,
      brandName: b.brandName || "Solar Brand",
      logoUrl: b.logoUrl,
      status: (b.status || "draft") as "draft" | "pending_review" | "changes_requested" | "live",
      countryOfOrigin: b.countryOfOrigin,
      headquarters: b.headquarters,
      website: b.website,
      about: b.about,
      adminFeedback: b.adminFeedback,
      isVerified: !!b.isVerified,
      productsCount: b.productsCount || 0,
      distributorsCount: (b.distributors as any[] | null)?.length || 0,
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching brand submissions for moderation:", error);
  }

  return (
    <div className="bg-cream min-h-screen text-ink pb-20">

      {/* Header */}
      <div className="bg-white border-b border-line py-8 shadow-sm">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-deep uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4 text-amber-deep" />
            Brand Moderation Portal
          </div>
          <h1 className="font-fraunces text-2xl md:text-3xl font-bold text-navy-deep">
            Brand Profile Submissions & Change Requests
          </h1>
          <p className="text-xs md:text-sm text-slate-custom mt-1 max-w-2xl leading-relaxed">
            Review brand profile additions and updates submitted by brand owners. Approve to publish live on the public directory, or send specific feedback notes to request changes.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-8">
        <BrandModerationQueue brands={formattedBrands} />
      </div>
    </div>
  );
}
