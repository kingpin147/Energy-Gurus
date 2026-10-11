import { db } from "@/db";
import { brands, products, users, writerProfiles, news } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { ModerationPortalTabs } from "@/components/dashboard/moderation-portal-tabs";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Moderation Portal | EnergyGurus",
  description: "Review and approve brand profiles, contributing writer credentials, and submitted articles."
};

export default async function AdminModerationPage() {
  const role = await getUserRole();

  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  let formattedBrands: any[] = [];
  let formattedWriters: any[] = [];
  let formattedArticles: any[] = [];

  try {
    // 1. Brands
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

    // 2. Writer Profiles
    const rawWriters = await db
      .select({
        id: writerProfiles.id,
        userId: writerProfiles.userId,
        name: writerProfiles.name,
        pictureUrl: writerProfiles.pictureUrl,
        designation: writerProfiles.designation,
        bio: writerProfiles.bio,
        socialLinks: writerProfiles.socialLinks,
        status: writerProfiles.status,
        adminFeedback: writerProfiles.adminFeedback,
        updatedAt: writerProfiles.updatedAt,
        userEmail: users.email
      })
      .from(writerProfiles)
      .innerJoin(users, eq(writerProfiles.userId, users.id))
      .orderBy(desc(writerProfiles.updatedAt));

    formattedWriters = rawWriters.map((w) => ({
      id: w.id,
      userId: w.userId,
      name: w.name,
      email: w.userEmail,
      pictureUrl: w.pictureUrl,
      designation: w.designation,
      bio: w.bio,
      socialLinks: w.socialLinks,
      status: w.status as any,
      adminFeedback: w.adminFeedback,
      updatedAt: w.updatedAt ? new Date(w.updatedAt).toISOString() : new Date().toISOString()
    }));

    // 3. Articles (Pending Review or Recent)
    const rawArticles = await db
      .select({
        id: news.id,
        title: news.title,
        category: news.category,
        content: news.content,
        imageUrl: news.imageUrl,
        authorName: news.authorName,
        authorDesignation: news.authorDesignation,
        authorPictureUrl: news.authorPictureUrl,
        isPublished: news.isPublished,
        status: news.status,
        adminFeedback: news.adminFeedback,
        updatedAt: news.updatedAt,
        slug: news.slug
      })
      .from(news)
      .orderBy(desc(news.updatedAt));

    formattedArticles = rawArticles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      content: a.content,
      imageUrl: a.imageUrl,
      authorName: a.authorName,
      authorDesignation: a.authorDesignation,
      authorPictureUrl: a.authorPictureUrl,
      isPublished: !!a.isPublished,
      status: a.status as any,
      adminFeedback: a.adminFeedback,
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
      slug: a.slug
    }));
  } catch (error) {
    console.error("Error fetching moderation items:", error);
  }

  return (
    <div className="bg-cream min-h-screen text-ink pb-20">
      {/* Header */}
      <div className="bg-white border-b border-line py-8 shadow-sm">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-deep uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-deep" />
            Central Moderation Portal
          </div>
          <h1 className="font-fraunces text-2xl md:text-3xl font-bold text-navy-deep">
            Submissions & Editorial Moderation
          </h1>
          <p className="text-xs md:text-sm text-slate-custom mt-1 max-w-2xl leading-relaxed">
            Review and approve solar brand profiles, contributing writer author credentials, and pending article submissions.
            Nothing appears live across EnergyGurus without editorial approval.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-8">
        <ModerationPortalTabs
          brands={formattedBrands}
          writers={formattedWriters}
          articles={formattedArticles}
        />
      </div>
    </div>
  );
}
