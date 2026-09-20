import { db } from "@/db";
import { reviews, users, epcInstallers, brands } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { ReviewModerationQueue } from "@/components/dashboard/ReviewModerationQueue";
import { AdminReviewForm } from "@/components/forms/admin-review-form";
import { Star, ShieldCheck } from "lucide-react";

export default async function AdminReviewsPage() {
  const role = await getUserRole();

  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  let allEpcs: { id: string; name: string }[] = [];
  let allBrands: { id: string; name: string }[] = [];
  let formattedReviews: any[] = [];

  try {
    // Fetch all EPC installers for dropdown
    const epcsData = await db
      .select({
        id: epcInstallers.id,
        name: epcInstallers.companyName
      })
      .from(epcInstallers)
      .orderBy(epcInstallers.companyName);

    allEpcs = epcsData.map((e) => ({
      id: e.id,
      name: e.name || "EPC Installer"
    }));

    // Fetch all Brands for dropdown
    const brandsData = await db
      .select({
        id: brands.id,
        name: brands.brandName
      })
      .from(brands)
      .orderBy(brands.brandName);

    allBrands = brandsData.map((b) => ({
      id: b.id,
      name: b.name || "Solar Brand"
    }));

    // Fetch all reviews
    const rawReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        status: reviews.status,
        rejectionReason: reviews.rejectionReason,
        proofUrl: reviews.proofUrl,
        authorName: reviews.authorName,
        authorEmail: reviews.authorEmail,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        targetType: reviews.targetType,
        targetId: reviews.targetId,
        createdAt: reviews.createdAt,
        userAuthorName: users.name,
        userAuthorEmail: users.email
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.authorId, users.id))
      .orderBy(desc(reviews.createdAt));

    // Map target names (Brand name or EPC company name)
    formattedReviews = rawReviews.map((r) => {
      let targetName = "Unknown Target";
      if (r.targetType === "brand") {
        const match = allBrands.find((b) => b.id === r.targetId);
        targetName = match?.name || "Solar Brand";
      } else if (r.targetType === "epc") {
        const match = allEpcs.find((e) => e.id === r.targetId);
        targetName = match?.name || "EPC Installer";
      }

      return {
        id: r.id,
        rating: r.rating || 5,
        comment: r.comment || "",
        status: (r.status || "pending") as "pending" | "approved" | "rejected",
        rejectionReason: r.rejectionReason || null,
        proofUrl: r.proofUrl || null,
        authorName: r.authorName || r.userAuthorName || "Customer",
        authorEmail: r.authorEmail || r.userAuthorEmail || null,
        isVerifiedPurchase: !!r.isVerifiedPurchase,
        targetType: (r.targetType || "epc") as "brand" | "epc",
        targetName,
        targetId: r.targetId,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("Error loading AdminReviewsPage data:", error);
  }

  return (
    <div className="bg-cream min-h-screen text-ink pb-20">

      {/* Header */}
      <div className="bg-white border-b border-line py-8 shadow-sm">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-deep uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-deep" />
            Quality & Trust Assurance
          </div>
          <h1 className="font-fraunces text-2xl md:text-3xl font-bold text-navy-deep">
            Review Moderation & Official Ratings
          </h1>
          <p className="text-xs md:text-sm text-slate-custom mt-1 max-w-2xl leading-relaxed">
            Customer reviews submitted across all brand and installer pages. Approve to publish, or reject with a reason sent back to the reviewer. Nothing appears on public pages until approved.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-8 space-y-10">
        
        {/* Moderation Queue */}
        <section>
          <ReviewModerationQueue reviews={formattedReviews} />
        </section>

        {/* Official Team Rating Form */}
        <section className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm">
          <div className="border-b border-line pb-4 mb-6">
            <h2 className="font-fraunces text-lg font-bold text-navy-deep flex items-center gap-2">
              <Star className="w-4 h-4 text-amber fill-amber" />
              Submit Official EnergyGurus Team Rating
            </h2>
            <p className="text-xs text-slate-custom mt-1">
              Add verified benchmark ratings for brands or installers evaluated by EnergyGurus technical experts.
            </p>
          </div>
          <AdminReviewForm allEpcs={allEpcs} allBrands={allBrands} />
        </section>

      </div>
    </div>
  );
}
