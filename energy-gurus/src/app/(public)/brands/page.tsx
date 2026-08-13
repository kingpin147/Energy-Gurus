import { db } from "@/db";
import { brands, products, reviews, users } from "@/db/schema";
import { ShieldCheck, Star, ArrowRight, Globe, Award, Zap, Shield } from "lucide-react";
import { SidebarVerification } from "@/components/brands/sidebar-verification";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";
import { desc, asc, eq, sql, ilike, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { getBrandCompleteness } from "@/lib/utils/completeness";
import { AdBanner } from "@/components/shared/AdBanner";
import { CompareToggle } from "@/components/shared/compare-toggle";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ }> }): Promise<Metadata> {
  
  const baseUrl = "https://www.energygurus.online";
  const title = "Solar Manufacturers & Energy Brands in Pakistan | EnergyGurus";
  const description = "Discover Tier-1 solar panel and inverter brands in Pakistan. View technical datasheets, warranty links, country representatives, and certified products.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/brands`,
      
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/brands`,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Solar Brands Pakistan" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`]
    }
    };
}

const getBrandsData = unstable_cache(
    async (sort: string, q?: string) => {
        let conditions = [
            eq(users.isActive, true),
            eq(users.role, 'brand'),
        ];

        if (q) conditions.push(ilike(brands.brandName, `%${q}%`));

        const brandsData = await db
            .select({
                id: brands.id,
                brandName: brands.brandName,
                countryHead: brands.countryHead,
                customerCareHead: brands.customerCareHead,
                logoUrl: brands.logoUrl,
                about: brands.about,
                headOffice: brands.headOffice,
                website: brands.website,
                socialLinks: brands.socialLinks,
                warrantyUrl: brands.warrantyUrl,
                isVerified: brands.isVerified,
                createdAt: brands.createdAt,
                avgRating: sql<number>`COALESCE(CAST(AVG(${reviews.rating}) AS FLOAT), 0)`.as('avg_rating'),
                reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`.as('review_count'),
                productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number)
    })
            .from(brands)
            .innerJoin(users, eq(users.id, brands.userId))
            .leftJoin(reviews, eq(reviews.targetId, brands.id))
            .where(and(...conditions))
            .groupBy(brands.id)
            .orderBy((t) => {
                if (sort === "top-rated") return [desc(t.avgRating), desc(t.reviewCount)];
                if (sort === "lowest-rated") return [asc(t.avgRating), asc(t.reviewCount)];
                if (sort === "oldest") return asc(t.createdAt);
                return desc(t.createdAt);
            });

        const allProducts = await db.select().from(products);

        const brandsWithScore = brandsData.map(brand => {
            const { score } = getBrandCompleteness(brand, brand.productsCount || 0);
            return {
                ...brand,
                score,
                products: allProducts.filter(p => p.brandId === brand.id).slice(0, 3)
            };
        });

        return brandsWithScore.filter(brand => brand.score >= 40);
    },
    ['brands-list-cache-v3'],
    { revalidate: 3600, tags: ['brands'] }
);

export default async function BrandsListingPage({
    searchParams
    }: {
    searchParams: Promise<{ sort?: string; q?: string }>;
}) {
    const { sort = "top-rated", q = "" } = await searchParams;
    const brandList = await getBrandsData(sort, q);

    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
            
            <header className="bg-ink text-white pt-[64px] pb-[44px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        Brand Directory
                    </p>
                    <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.01em]">
                        Compare solar brands, side by side.
                    </h1>
                    <p className="text-paper/70 max-w-[560px] mt-[14px] text-[1.02rem]">
                        Panels, inverters, and batteries — reviewed on specs, warranty, and real-world performance. No sponsored rankings, just the facts.
                    </p>
                </div>
            </header>

            <div className="bg-white border-b border-line sticky top-[72px] z-40">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-[18px] flex flex-wrap gap-7 items-center">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <label className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom">Search</label>
                        <ListSearch
                            placeholder="Brand name..."
                            className="border border-line rounded-[3px] pr-3 py-2 font-sans text-[0.88rem] bg-paper text-graphite h-auto focus:ring-amber/20 focus:border-amber transition-all shadow-none w-[200px]"
                        />
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <label className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom">Sort</label>
                        <div className="border border-line rounded-[3px] bg-paper text-graphite flex items-center px-2 py-1">
                            <ListSort
                                defaultValue="top-rated"
                                options={[
                                    { label: "Elite Rating", value: "top-rated" },
                                    { label: "Lowest Rating", value: "lowest-rated" },
                                    { label: "Newest Arrivals", value: "latest" },
                                    { label: "Oldest First", value: "oldest" },
                                ]}
                            />
                        </div>
                    </div>
                    <span className="ml-auto font-ibm-plex-mono text-[0.82rem] text-slate-custom mt-4 sm:mt-0">
                        {brandList?.length || 0} brands
                    </span>
                </div>
            </div>

            <section className="py-[56px] pb-[96px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    
                    {(brandList?.length || 0) === 0 ? (
                        <div className="text-center py-20 bg-white border border-line rounded-[4px]">
                            <ShieldCheck className="w-16 h-16 text-slate-custom/20 mx-auto mb-4" />
                            <h3 className="font-space-grotesk font-semibold text-xl text-ink">Directory Empty</h3>
                            <p className="text-slate-custom mt-2">No brands match your criteria right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {brandList?.map((brand, index) => (
                                <TrackedLink
                                    key={brand.id}
                                    href={`/brands/${brand.id}` as any}
                                    className="bg-white border border-line rounded-[4px] p-[26px] flex flex-col gap-[14px] hover:border-teal transition-colors group"
                                    eventName="brand_portfolio_view"
                                    eventProperties={{ brandId: brand.id, brandName: brand.brandName }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-[44px] h-[44px] rounded-[4px] bg-ink text-amber flex items-center justify-center font-space-grotesk font-bold text-[1.1rem] overflow-hidden">
                                            {brand.logoUrl ? (
                                                <Image src={brand.logoUrl} alt={brand.brandName} width={44} height={44} className="object-cover w-full h-full" />
                                            ) : (
                                                brand.brandName.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        {brand.isVerified && (
                                            <span className="font-ibm-plex-mono text-[0.68rem] tracking-[0.06em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[9px] py-1 rounded-[20px]">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-space-grotesk font-semibold text-[1.15rem] text-ink tracking-[-0.01em]">
                                        {brand.brandName}
                                    </h3>
                                    <div className="font-ibm-plex-mono text-[0.82rem] text-slate-custom flex-grow">
                                        <div className="flex items-center gap-1.5 mb-1 text-yellow-600">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            {brand.avgRating ? brand.avgRating.toFixed(1) : "N/A"} ({brand.reviewCount} reviews)
                                        </div>
                                        <div>
                                            {brand.productsCount || 0} products registered
                                        </div>
                                        <div className="mt-3 text-[0.78rem] line-clamp-2 font-sans">
                                            {brand.about || "Verified energy solution provider."}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-[10px] flex items-center justify-between border-t border-line">
                                        <CompareToggle id={brand.id} name={brand.brandName} type="brand" />
                                        <span className="text-[0.86rem] font-semibold text-ink inline-flex items-center gap-1.5">
                                            View Brand <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform" />
                                        </span>
                                    </div>
                                </TrackedLink>
                            ))}
                        </div>
                    )}
                    
                    {/* Mid-listing ad */}
                    {(brandList?.length ?? 0) >= 6 && (
                        <div className="mt-12 w-full flex justify-center">
                            <AdBanner placement="in_list" targetPage="brands" />
                        </div>
                    )}
                    
                </div>
            </section>
        </div>
    );
}
