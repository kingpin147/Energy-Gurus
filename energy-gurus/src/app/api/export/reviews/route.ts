import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { reviews, users, epcInstallers, brands } from "@/db/schema";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/roles";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getUserRole();
    if (role !== "super-admin" && role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const allReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        reply: reviews.reply,
        targetType: reviews.targetType,
        createdAt: reviews.createdAt,
        authorName: users.name,
        authorEmail: users.email,
        epcName: epcInstallers.companyName,
        brandName: brands.brandName
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.authorId, users.id))
      .leftJoin(epcInstallers, eq(reviews.targetId, epcInstallers.id))
      .leftJoin(brands, eq(reviews.targetId, brands.id))
      .orderBy(desc(reviews.createdAt));

    const headers = [
      "ID",
      "Reviewer Name",
      "Reviewer Email",
      "Target Type",
      "Target Business Name",
      "Rating (Stars)",
      "Comment",
      "Owner Reply",
      "Created At"
    ].join(",");

    const rows = allReviews.map(rev => {
      const businessName = rev.targetType === "epc" ? rev.epcName : rev.brandName;
      return [
        rev.id,
        `"${(rev.authorName || "").replace(/"/g, '""')}"`,
        rev.authorEmail,
        rev.targetType,
        `"${(businessName || "Unknown Business").replace(/"/g, '""')}"`,
        rev.rating,
        `"${(rev.comment || "").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${(rev.reply || "").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        rev.createdAt ? rev.createdAt.toISOString() : ""
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reviews_report_${Date.now()}.csv"`
      }
    });
  } catch (error: any) {
    console.error("Export Reviews CSV Error:", error);
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
