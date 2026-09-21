import { db } from "@/db";
import { brands, products, reviews, users } from "@/db/schema";
import { ShieldCheck, Star, ArrowRight, CheckCircle2, Globe, Building2, Wrench } from "lucide-react";
import { desc, asc, eq, sql, ilike, and, or } from "drizzle-orm";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { AdBanner } from "@/components/shared/AdBanner";
import { CompareToggle } from "@/components/shared/compare-toggle";
import { CategoryTabs } from "@/components/brands/CategoryTabs";
import { DirectoryFilters } from "@/components/brands/DirectoryFilters";
import type { Metadata } from "next";

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
    <div className="bg-cream text-ink min-h-screen selection:bg-amber/20">
      
      {/* Top Banner Ad if configured */}
      <AdBanner placement="skyscraper_left" targetPage="brands" />
      <AdBanner placement="skyscraper_right" targetPage="brands" />

      {/* Hero Header */}
      <header className="bg-navy-deep text-white pt-16 pb-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(1200px 300px at 85% -20%, rgba(224,167,59,0.35), transparent 70%)"
          }}
        />
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-10">
          <div className="flex items-center gap-2.5 text-amber text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-6 h-[1.5px] bg-amber" />
            Verified Equipment Manufacturers
          </div>
          <h1 className="font-fraunces text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Explore Solar Brands in Pakistan
          </h1>
          <p className="text-paper/75 max-w-[620px] mt-3.5 text-sm md:text-base leading-relaxed">
            Inverters, solar panels, and storage systems — reviewed on warranty terms, after-sales support networks, authorized distributors, and real customer satisfaction.
          </p>
        </div>
      </header>

      {/* Category Pills Bar */}
      <div className="bg-navy border-t border-white/10 py-3 shadow-inner">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <CategoryTabs activeCategory={activeCategory} />
        </div>
      </div>

      {/* Sticky Search & Filter Toolbar */}
      <DirectoryFilters totalCount={filteredBrands.length} />

      {/* Main Content Area */}
      <main className="max-w-[1180px] mx-auto px-5 md:px-8 py-10 pb-28">
        
        {/* Results Counter */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs md:text-sm text-slate-custom font-medium">
            Showing <strong className="text-navy-deep font-bold">{filteredBrands.length}</strong> {filteredBrands.length === 1 ? "brand" : "brands"}
            {activeCategory !== "all" && <span> in <strong className="text-navy-deep font-bold">{activeCategory}</strong></span>}
            {origin && <span> from <strong className="text-navy-deep font-bold">{origin}</strong></span>}
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
              const cats = (brand.categories as string[] | undefined) || [];
              const originText = brand.countryOfOrigin || brand.headquarters || "Global";
              const networkTotal = (brand.distributorCount || 0) + (brand.serviceCentreCount || 0);

              return (
                <div
                  key={brand.id}
                  className="bg-white border border-line rounded-[4px] p-6 flex flex-col justify-between hover:border-amber hover:shadow-md transition-all duration-200 group relative"
                >
                  <div>
                    {/* Top Row: Brandmark Logo + Verified Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-14 h-14 rounded-[3px] bg-navy flex items-center justify-center font-fraunces font-bold text-xl text-white overflow-hidden shadow-sm shrink-0 border border-navy-deep">
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt={brand.brandName}
                            width={56}
                            height={56}
                            className="object-contain w-full h-full p-1 bg-white"
                          />
                        ) : (
                          brand.brandName.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {brand.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber/15 text-amber-deep border border-amber/30 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-amber-deep" /> Verified
                          </span>
                        )}
                        {brand.countryOfOrigin && (
                          <span className="text-[11px] font-medium text-slate-custom flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-custom/70" /> {brand.countryOfOrigin}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Brand Name & Tagline */}
                    <TrackedLink
                      href={`/brands/${brand.id}` as any}
                      eventName="brand_profile_click"
                      eventProperties={{ brandId: brand.id, brandName: brand.brandName }}
                      className="block group-hover:text-amber-deep transition-colors"
                    >
                      <h2 className="font-fraunces font-semibold text-xl text-navy-deep">
                        {brand.brandName}
                      </h2>
                    </TrackedLink>

                    <p className="text-xs text-slate-custom mt-2 line-clamp-2 leading-relaxed min-h-[36px]">
                      {brand.about || "Manufacturer of solar energy systems, inverters, and power equipment."}
                    </p>

                    {/* Meta Facts Row */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-line/70 text-[11.5px] font-medium text-slate-custom">
                      <div>
                        <span className="text-slate-custom/70 block text-[10px] uppercase tracking-wider">Products</span>
                        <strong className="text-navy-deep font-bold text-sm">{brand.productsCount || 0}</strong> models
                      </div>
                      <div>
                        <span className="text-slate-custom/70 block text-[10px] uppercase tracking-wider">Support Network</span>
                        <strong className="text-navy-deep font-bold text-sm">{networkTotal}</strong> verified points
                      </div>
                    </div>

                    {/* Rating & Categories */}
                    <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-deep bg-amber/10 px-2 py-1 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                        <span>{brand.avgRating > 0 ? brand.avgRating.toFixed(1) : "5.0"}</span>
                        <span className="text-slate-custom font-normal text-[11px]">({brand.reviewCount || 0})</span>
                      </div>

                      <div className="flex gap-1.5 flex-wrap">
                        {cats.slice(0, 2).map((c, i) => (
                          <span
                            key={i}
                            className="text-[10.5px] font-medium text-navy-deep bg-cream border border-line px-2 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-5 pt-3.5 border-t border-line flex items-center justify-between gap-3">
                    <CompareToggle id={brand.id} name={brand.brandName} type="brand" />
                    <TrackedLink
                      href={`/brands/${brand.id}` as any}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-deep hover:text-amber-deep transition-colors"
                      eventName="brand_view_details"
                      eventProperties={{ brandId: brand.id }}
                    >
                      View Profile <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
