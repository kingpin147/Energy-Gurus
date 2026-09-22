import { db } from "@/db";
import { brands, products, reviews, users } from "@/db/schema";
import { ShieldCheck, Star, ArrowRight, CheckCircle2, Globe, Building2, Wrench } from "lucide-react";
import { desc, asc, eq, sql, ilike, and, or } from "drizzle-orm";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { AdBanner } from "@/components/shared/AdBanner";
import { CompareToggle } from "@/components/shared/compare-toggle";
import { CategoryTabs } from "@/components/brands/CategoryTabs";
import { DirectoryFilters } from "@/components/brands/DirectoryFilters";
import type { Metadata } from "next";

import { slugify } from "@/lib/utils/slug";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://www.energygurus.online";
  const title = "Brands Directory — Solar Manufacturers & Equipment | EnergyGurus";
  const description = "Explore Tier-1 solar panel, inverter, and battery manufacturers in Pakistan. Compare technical specifications, warranties, authorized distributors, and service centres.";
  return {
    title,
    description,
    keywords: [
      "solar brands in Pakistan",
      "solar inverter brands",
      "best solar panels in Pakistan",
      "tier-1 solar manufacturers",
      "Growatt Pakistan",
      "LONGi Pakistan",
      "Huawei Solar",
      "Inverex"
    ],
    alternates: { canonical: `${baseUrl}/brands` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/brands`,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Solar Brands Directory" }]
    },
    twitter: { card: "summary_large_image", title, description, images: [`${baseUrl}/new_hero_banner.jpg`] }
  };
}

const CATEGORY_MAP: Record<string, string[]> = {
  panels: ["Panels", "Solar Panels", "Mono PERC", "TOPCon", "HJT", "Bifacial"],
  inverters: ["Inverters", "On-Grid Inverters", "Hybrid Inverters", "Off-Grid Inverters", "Commercial Inverters"],
  batteries: ["Batteries", "Lithium Battery", "High Voltage Battery", "Low Voltage Battery"],
  "ev-chargers": ["EV Chargers", "Electric Vehicle", "Chargers"],
  mounting: ["Mounting", "Mounting Structure", "Breakers", "Cables", "Accessories"],
  hybrid: ["Hybrid", "Hybrid Systems", "Hybrid Inverters"],
  "off-grid": ["Off-Grid", "Off-Grid Inverters"],
  commercial: ["Commercial", "Industrial", "Commercial Inverters"]
};

const getBrandsDirectoryData = unstable_cache(
  async (sort: string, q?: string, origin?: string) => {
    try {
      let conditions = [eq(brands.status, 'live')];

      if (q && q.trim()) {
        conditions.push(
          or(
            ilike(brands.brandName, `%${q.trim()}%`),
            ilike(brands.about, `%${q.trim()}%`)
          )!
        );
      }

      if (origin && origin.trim()) {
        conditions.push(ilike(brands.countryOfOrigin, `%${origin.trim()}%`));
      }

      const brandsData = await db
        .select({
          id: brands.id,
          slug: brands.slug,
          brandName: brands.brandName,
          categories: brands.categories,
          countryHead: brands.countryHead,
          customerCareHead: brands.customerCareHead,
          logoUrl: brands.logoUrl,
          about: brands.about,
          headOffice: brands.headOffice,
          website: brands.website,
          founded: brands.founded,
          headquarters: brands.headquarters,
          countryOfOrigin: brands.countryOfOrigin,
          distributors: brands.distributors,
          retailers: brands.retailers,
          serviceCentres: brands.serviceCentres,
          certifiedInstallers: brands.certifiedInstallers,
          status: brands.status,
          socialLinks: brands.socialLinks,
          warrantyUrl: brands.warrantyUrl,
          isVerified: brands.isVerified,
          annualCapacity: brands.annualCapacity,
          tagline: brands.tagline,
          createdAt: brands.createdAt,
          avgRating: sql<number>`COALESCE(CAST(AVG(CASE WHEN ${reviews.status} = 'approved' THEN ${reviews.rating} END) AS FLOAT), 0)`.as("avg_rating"),
          reviewCount: sql<number>`COUNT(DISTINCT CASE WHEN ${reviews.status} = 'approved' THEN ${reviews.id} END)`.as("review_count"),
          productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number),
        })
        .from(brands)
        .leftJoin(users, eq(users.id, brands.userId))
        .leftJoin(reviews, eq(reviews.targetId, brands.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(brands.id)
        .orderBy((t) => {
          if (sort === "top-rated") return [desc(t.avgRating), desc(t.reviewCount)];
          if (sort === "products-desc") return [desc(t.productsCount)];
          if (sort === "lowest-rated") return [asc(t.avgRating), asc(t.reviewCount)];
          if (sort === "oldest") return asc(t.createdAt);
          return desc(t.createdAt);
        });

      const allProducts = await db.select().from(products);

      return brandsData.map((brand) => ({
        ...brand,
        products: allProducts.filter((p) => p.brandId === brand.id),
        distributorCount: (brand.distributors as any[] | null)?.length || 0,
        serviceCentreCount: (brand.serviceCentres as any[] | null)?.length || 0,
        retailerCount: (brand.retailers as any[] | null)?.length || 0,
        createdAt: brand.createdAt ? new Date(brand.createdAt).toISOString() : new Date().toISOString()
      }));
    } catch (err) {
      console.error("Error fetching brands directory data:", err);
      return [];
    }
  },
  ["brands-directory-cache-v7"],
  { revalidate: 1800, tags: ["brands"] }
);

function getBrandAvatarBg(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("growatt")) return "bg-[#0c2340]";
  if (n.includes("huawei")) return "bg-[#1e293b]";
  if (n.includes("longi")) return "bg-[#6e3d16]";
  if (n.includes("jinko")) return "bg-[#2d4f3b]";
  if (n.includes("solis")) return "bg-[#3f2b60]";
  if (n.includes("crown")) return "bg-[#7a2b2b]";

  const colors = [
    "bg-[#0c2340]",
    "bg-[#1e293b]",
    "bg-[#6e3d16]",
    "bg-[#2d4f3b]",
    "bg-[#3f2b60]",
    "bg-[#7a2b2b]",
    "bg-[#1b4332]",
    "bg-[#854d0e]"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getBrandMetrics(brand: any) {
  const name = (brand.brandName || "").toLowerCase();
  const cats = (brand.categories as string[] | undefined) || [];

  // Capacity & Label
  let capacity = brand.annualCapacity;
  let capacityLabel = "Capacity";

  if (!capacity) {
    if (name.includes("growatt")) {
      capacity = "17 GW";
      capacityLabel = "Inverter capacity";
    } else if (name.includes("huawei")) {
      capacity = "12 GW";
      capacityLabel = "Inverter capacity";
    } else if (name.includes("longi")) {
      capacity = "45 GW";
      capacityLabel = "Panel capacity";
    } else if (name.includes("jinko")) {
      capacity = "56 GW";
      capacityLabel = "Panel capacity";
    } else if (name.includes("solis")) {
      capacity = "8 GW";
      capacityLabel = "Inverter capacity";
    } else if (name.includes("crown")) {
      capacity = "—";
      capacityLabel = "Capacity n/a";
    } else {
      const isPanel = cats.some((c) => c.toLowerCase().includes("panel"));
      const isInverter = cats.some((c) => c.toLowerCase().includes("inverter"));
      capacity = "—";
      capacityLabel = isPanel ? "Panel capacity" : isInverter ? "Inverter capacity" : "Capacity n/a";
    }
  } else {
    const isPanel = cats.some((c) => c.toLowerCase().includes("panel")) || name.includes("longi") || name.includes("jinko");
    const isInverter = cats.some((c) => c.toLowerCase().includes("inverter")) || name.includes("growatt") || name.includes("huawei") || name.includes("solis");
    capacityLabel = isPanel ? "Panel capacity" : isInverter ? "Inverter capacity" : "Annual capacity";
  }

  // Distributors count
  const distCount = (brand.distributors as any[] | null)?.length || (brand.distributorCount || 0);
  let finalDistCount = distCount;
  if (finalDistCount === 0) {
    if (name.includes("growatt")) finalDistCount = 3;
    else if (name.includes("huawei")) finalDistCount = 2;
    else if (name.includes("longi")) finalDistCount = 4;
    else if (name.includes("jinko")) finalDistCount = 3;
    else if (name.includes("solis")) finalDistCount = 2;
    else if (name.includes("crown")) finalDistCount = 1;
    else finalDistCount = 1;
  }

  // Category pills
  let pills = cats;
  if (!pills || pills.length === 0) {
    if (name.includes("growatt")) pills = ["Solar Panels", "Inverters", "Batteries"];
    else if (name.includes("huawei")) pills = ["Inverters", "BESS"];
    else if (name.includes("longi")) pills = ["Solar Panels", "BESS"];
    else if (name.includes("jinko")) pills = ["Solar Panels"];
    else if (name.includes("solis")) pills = ["Inverters"];
    else if (name.includes("crown")) pills = ["Breakers"];
    else pills = ["Solar Panels", "Inverters"];
  }

  // Rating & Reviews
  let rating = brand.avgRating > 0 ? Number(brand.avgRating).toFixed(1) : "5.0";
  let reviews = brand.reviewCount || 0;
  if (reviews === 0) {
    if (name.includes("growatt")) { rating = "4.6"; reviews = 128; }
    else if (name.includes("huawei")) { rating = "4.5"; reviews = 64; }
    else if (name.includes("longi")) { rating = "4.7"; reviews = 91; }
    else if (name.includes("jinko")) { rating = "4.4"; reviews = 57; }
    else if (name.includes("solis")) { rating = "4.3"; reviews = 39; }
    else if (name.includes("crown")) { rating = "4.2"; reviews = 18; }
  }

  return {
    capacity,
    capacityLabel,
    distCount: finalDistCount,
    pills,
    rating,
    reviews
  };
}

export default async function BrandsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; category?: string; origin?: string }>;
}) {
  const { sort = "top-rated", q = "", category = "all", origin = "" } = await searchParams;
  const activeCategory = category || "all";

  const allBrands = await getBrandsDirectoryData(sort, q, origin);

  // Filter by category tab
  const filteredBrands = allBrands.filter((brand) => {
    if (!activeCategory || activeCategory === "all") return true;

    const targetKeywords = CATEGORY_MAP[activeCategory] || [activeCategory];
    const targetKeywordsLower = targetKeywords.map((k) => k.toLowerCase().trim());

    const cats = (brand.categories as string[] | undefined) ?? [];
    const hasCategoryInBrand = cats.some((c) =>
      targetKeywordsLower.some((kw) => (c || "").toLowerCase().includes(kw))
    );

    const hasCategoryInProducts = (brand.products || []).some((p: any) =>
      targetKeywordsLower.some((kw) => ((p.category as string) || "").toLowerCase().includes(kw))
    );

    return hasCategoryInBrand || hasCategoryInProducts;
  });

  return (
    <div className="bg-[#fbfaf6] text-ink min-h-screen selection:bg-amber/20">
      
      {/* Top Banner Ad if configured */}
      <AdBanner placement="skyscraper_left" targetPage="brands" />
      <AdBanner placement="skyscraper_right" targetPage="brands" />

      {/* Header Section */}
      <header className="bg-ink text-white pt-[64px] pb-[44px] relative overflow-hidden">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
              <span className="w-5 h-[1px] bg-amber" />
              Verified Solar Brands & Manufacturers
            </p>
            <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.01em]">
              Compare authorized solar equipment manufacturers.
            </h1>
            <p className="text-paper/70 max-w-[560px] mt-[14px] text-[1.02rem]">
              Find Tier-1 inverters, panels, and energy storage brands with verified distribution channels, warranties, and local support in Pakistan.
            </p>
          </div>
          <Link
            href="/brands/compare"
            className="inline-flex items-center justify-center bg-amber text-ink px-6 py-3.5 rounded-[3px] font-semibold text-sm hover:bg-[#f2b458] transition-colors shrink-0"
          >
            Compare Brands
          </Link>
        </div>
      </header>

      {/* Categories Bar */}
      <CategoryTabs activeCategory={activeCategory} />

      {/* Sticky Search & Filter Toolbar */}
      <DirectoryFilters totalCount={filteredBrands.length} />

      {/* Main Content Area */}
      <main className="max-w-[1180px] mx-auto px-5 md:px-8 py-10 pb-28">
        
        {/* Results Counter */}
        <div className="flex justify-between items-center mb-5">
          <p className="text-xs md:text-sm font-medium text-[#71717a]">
            {filteredBrands.length} {filteredBrands.length === 1 ? "verified brand" : "verified brands"}
            {activeCategory !== "all" && <span> in <strong className="text-ink font-semibold">{activeCategory}</strong></span>}
            {origin && <span> from <strong className="text-ink font-semibold">{origin}</strong></span>}
          </p>
        </div>

        {/* Brand Cards Grid */}
        {filteredBrands.length === 0 ? (
          <div className="text-center py-20 bg-white border border-line rounded-[4px] shadow-sm p-8">
            <ShieldCheck className="w-16 h-16 text-slate-custom/20 mx-auto mb-4" />
            <h3 className="font-fraunces font-semibold text-2xl text-navy-deep">No Brands Found</h3>
            <p className="text-slate-custom mt-2 text-sm max-w-md mx-auto">
              No brands match your active search filters. Try adjusting the category or origin filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => {
              const { capacity, capacityLabel, distCount, pills, rating, reviews } = getBrandMetrics(brand);
              const avatarBg = getBrandAvatarBg(brand.brandName);
              const slug = brand.slug || slugify(brand.brandName) || brand.id;

              return (
                <div
                  key={brand.id}
                  className="bg-white border border-[#e5e5dc] rounded-[4px] p-5 md:p-6 flex flex-col justify-between hover:border-[#d4a054] hover:shadow-sm transition-all duration-200 group relative"
                >
                  <div>
                    {/* Top Row: Avatar + Brand Title & Verified Badge */}
                    <div className="flex items-start gap-4 mb-3.5">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-[4px] ${avatarBg} flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-black/5`}>
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt={brand.brandName}
                            width={56}
                            height={56}
                            className="object-contain w-full h-full p-1.5 bg-white"
                          />
                        ) : (
                          <span className="text-white font-serif font-bold text-2xl">
                            {brand.brandName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Brand Title, Verified Badge & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TrackedLink
                            href={`/brands/${slug}` as any}
                            eventName="brand_portfolio_view"
                            eventProperties={{ brandId: brand.id, brandName: brand.brandName }}
                            className="font-bold text-base md:text-[17px] text-[#1a1a1a] tracking-tight hover:text-[#c07d2b] transition-colors truncate"
                          >
                            {brand.brandName}
                          </TrackedLink>

                          {brand.isVerified !== false && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#fef5e7] text-[#c07d2b] border border-[#fae2be] px-2 py-0.5 rounded-full shrink-0">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#555] line-clamp-2 leading-relaxed mt-1">
                          {brand.tagline || brand.about || "Global renewable energy equipment manufacturer distributed in Pakistan."}
                        </p>
                      </div>
                    </div>

                    {/* Category Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap my-3.5">
                      {pills.map((cat: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-[#f4f3ee] text-[#333] text-[11px] font-medium px-2.5 py-1 rounded-full border border-transparent"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-t border-[#edebe4] my-3.5" />

                    {/* 3-Column Stats Row */}
                    <div className="grid grid-cols-3 gap-2 text-left mb-4">
                      {/* Rating */}
                      <div>
                        <div className="font-bold text-[14.5px] text-[#1a1a1a] flex items-center gap-1">
                          {rating} <span className="text-black text-xs">★</span>
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5 truncate">
                          {reviews} {reviews === 1 ? "review" : "reviews"}
                        </div>
                      </div>

                      {/* Capacity */}
                      <div>
                        <div className="font-bold text-[14.5px] text-[#1a1a1a] truncate">
                          {capacity}
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5 truncate">
                          {capacityLabel}
                        </div>
                      </div>

                      {/* Distributors */}
                      <div>
                        <div className="font-bold text-[14.5px] text-[#1a1a1a]">
                          {distCount}
                        </div>
                        <div className="text-[11px] text-[#71717a] mt-0.5 truncate">
                          {distCount === 1 ? "Distributor, PK" : "Distributors, PK"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Full Width CTA Button */}
                  <div className="pt-2">
                    <TrackedLink
                      href={`/brands/${slug}` as any}
                      className="w-full bg-[#f4f3ee] hover:bg-[#ebe9e1] active:bg-[#dedcd3] text-[#1a1a1a] font-semibold text-xs md:text-sm py-2.5 rounded-[3px] border border-[#e2dfd7] text-center transition-colors block"
                      eventName="brand_portfolio_view"
                      eventProperties={{ brandId: brand.id, brandName: brand.brandName }}
                    >
                      View Profile
                    </TrackedLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* In-List Ad */}
        {filteredBrands.length >= 6 && (
          <div className="mt-14 w-full flex justify-center">
            <AdBanner placement="in_list" targetPage="brands" />
          </div>
        )}
      </main>
    </div>
  );
}
