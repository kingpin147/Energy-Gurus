import { db } from "@/db";
import { brands, products, reviews, news, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { BrandProfileView } from "@/components/brands/BrandProfileView";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) return {};

  const baseUrl = "https://www.energygurus.online";
  const [brand] = await db.select().from(brands).where(eq(brands.id, id));

  if (!brand) return {};

  const title = `${brand.brandName} — Brand Profile & Products | EnergyGurus`;
  const description =
    brand.about?.slice(0, 160) ||
    `Explore ${brand.brandName}'s solar inverters, solar panels, technical datasheets, and authorized distributors in Pakistan.`;
  const url = `${baseUrl}/brands/${id}`;

  return {
    title,
    description,
    keywords: [
      brand.brandName,
      `${brand.brandName} solar in Pakistan`,
      `${brand.brandName} inverters`,
      `${brand.brandName} datasheets`,
      "solar equipment Pakistan",
      "best solar inverters"
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "EnergyGurus",
      type: "website",
      images: brand.logoUrl
        ? [{ url: brand.logoUrl, width: 800, height: 800, alt: brand.brandName }]
        : [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: brand.brandName }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: brand.logoUrl ? [brand.logoUrl] : [`${baseUrl}/new_hero_banner.jpg`]
    }
  };
}

export default async function BrandProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) return notFound();

  // Fetch brand
  const [brand] = await db.select().from(brands).where(eq(brands.id, id));
  if (!brand) return notFound();

  // If brand is not live, only allow brand owner or admin to preview
  if (brand.status !== "live") {
    const { userId: clerkId } = await auth();
    if (!clerkId) return notFound();
    const role = await getUserRole();
    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    const isOwner = dbUser && dbUser.id === brand.userId;
    const isAdmin = role === "admin" || role === "super-admin";
    if (!isOwner && !isAdmin) return notFound();
  }

  // Fetch products
  const brandProducts = await db
    .select()
    .from(products)
    .where(eq(products.brandId, id))
    .orderBy(desc(products.createdAt));

  // Fetch approved reviews
  const brandReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      reply: reviews.reply,
      status: reviews.status,
      proofUrl: reviews.proofUrl,
      authorName: reviews.authorName,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      author: {
        name: users.name,
        email: users.email
      }
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(and(eq(reviews.targetId, id), eq(reviews.targetType, "brand"), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));

  // Fetch brand news
  const brandNews = await db
    .select()
    .from(news)
    .where(eq(news.isPublished, true))
    .orderBy(desc(news.createdAt))
    .limit(6);

  // Compute rating average
  const totalRating = brandReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const avgRating = brandReviews.length > 0 ? totalRating / brandReviews.length : 5.0;

  return (
    <BrandProfileView
      brand={brand}
      products={brandProducts}
      reviews={brandReviews}
      news={brandNews}
      rating={avgRating}
      reviewCount={brandReviews.length}
    />
  );
}
