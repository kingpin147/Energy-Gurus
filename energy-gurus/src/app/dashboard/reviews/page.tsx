import { db } from "@/db";
import { reviews, users, epcInstallers, brands } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { ReviewManagementClient } from "@/components/dashboard/review-management-client";

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      <ReviewManagementClient
        initialReviews={formattedReviews}
        allEpcs={allEpcs}
        allBrands={allBrands}
      />
    </div>
  );
}
