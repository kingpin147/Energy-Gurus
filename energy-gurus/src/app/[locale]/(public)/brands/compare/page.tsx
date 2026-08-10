import { db } from "@/db";
import { brands, products, reviews, users } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { Star, ShieldCheck, ArrowLeft, Package, User, Phone, Globe, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.energygurus.online";
  const title = "Compare Solar Brands & Tier-1 Manufacturers | EnergyGurus";
  const description = "Compare solar panel and inverter brands side-by-side. View product counts, country head contacts, warranty details, and customer ratings.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/brands/compare`,
      languages: {
        en: `${baseUrl}/en/brands/compare`,
        ur: `${baseUrl}/ur/brands/compare`,
        "x-default": `${baseUrl}/en/brands/compare`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/brands/compare`,
      siteName: "EnergyGurus",
      locale: locale === "ur" ? "ur_PK" : "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Compare Solar Brands" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`],
    },
  };
}

export default async function BrandsComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  if (!ids) return notFound();

  const idArray = ids.split(",").slice(0, 3);
  if (idArray.length < 2) return notFound();

  const brandList = await db
    .select({
      id: brands.id,
      brandName: brands.brandName,
      logoUrl: brands.logoUrl,
      countryHead: brands.countryHead,
      customerCareHead: brands.customerCareHead,
      customerCare: brands.customerCare,
      website: brands.website,
      warrantyUrl: brands.warrantyUrl,
      isVerified: brands.isVerified,
      about: brands.about,
      avgRating: sql<number>`COALESCE(CAST(AVG(${reviews.rating}) AS FLOAT), 0)`.as('avg_rating'),
      reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`.as('review_count'),
      productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number),
    })
    .from(brands)
    .leftJoin(reviews, eq(reviews.targetId, brands.id))
    .where(inArray(brands.id, idArray))
    .groupBy(brands.id);

  if (brandList.length < 2) return notFound();

  return (
    <div className="min-h-screen bg-paper text-graphite pb-20">
      <div className="bg-white border-b border-line sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/brands" className="flex items-center gap-1.5 text-sm font-medium text-slate-custom hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <div className="w-px h-6 bg-line"></div>
          <h1 className="font-space-grotesk font-semibold text-lg flex items-center gap-2">
            Compare Brands
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-line">
                <th className="p-6 bg-paper/50 font-ibm-plex-mono text-[0.7rem] uppercase tracking-widest text-slate-custom w-48">
                  Brand Specs
                </th>
                {brandList.map((brand) => (
                  <th key={brand.id} className="p-6 text-center border-l border-line bg-white align-top w-1/3">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-xl bg-paper flex items-center justify-center overflow-hidden border border-line p-1">
                        {brand.logoUrl ? (
                          <Image src={brand.logoUrl} alt={brand.brandName} width={80} height={80} className="object-contain w-full h-full" />
                        ) : (
                          <span className="text-xl font-bold text-slate-custom">{brand.brandName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-space-grotesk font-bold text-lg text-ink flex items-center justify-center gap-1.5">
                          {brand.brandName}
                          {brand.isVerified && <ShieldCheck className="w-4 h-4 text-teal" />}
                        </h3>
                        <div className="flex items-center justify-center gap-1 font-ibm-plex-mono text-sm">
                          <Star className="w-4 h-4 text-amber fill-amber" />
                          <span className="font-semibold text-ink">{brand.avgRating?.toFixed(1) || "0.0"}</span>
                          <span className="text-slate-custom">({brand.reviewCount || 0})</span>
                        </div>
                      </div>
                      <Link href={`/brands/${brand.id}` as any} className="mt-2 w-full py-2 bg-ink text-white rounded-lg text-sm font-semibold hover:bg-ink/90 transition-colors block">
                        View Profile
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber" /> Products Available
                </td>
                {brandList.map((brand) => (
                  <td key={brand.id} className="p-6 border-l border-line text-center">
                    <div className="text-2xl font-space-grotesk font-bold text-ink">{brand.productsCount || 0}</div>
                    <div className="text-xs text-slate-custom uppercase tracking-wider font-ibm-plex-mono mt-1">Listed Products</div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <User className="w-4 h-4 text-amber" /> Leadership
                </td>
                {brandList.map((brand) => (
                  <td key={brand.id} className="p-6 border-l border-line text-center align-top">
                    {brand.countryHead ? (
                      <div>
                        <div className="font-semibold text-ink">{brand.countryHead}</div>
                        <div className="text-xs text-slate-custom font-ibm-plex-mono mt-0.5">Country Head</div>
                      </div>
                    ) : <span className="text-slate-custom text-sm">—</span>}
                    
                    {brand.customerCareHead && (
                      <div className="mt-3 pt-3 border-t border-line/50">
                        <div className="font-semibold text-ink">{brand.customerCareHead}</div>
                        <div className="text-xs text-slate-custom font-ibm-plex-mono mt-0.5">Customer Care Head</div>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber" /> Support Contact
                </td>
                {brandList.map((brand) => (
                  <td key={brand.id} className="p-6 border-l border-line text-center">
                    {brand.customerCare ? (
                      <div className="font-semibold text-ink">{brand.customerCare}</div>
                    ) : (
                      <span className="text-slate-custom text-sm">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber" /> Official Links
                </td>
                {brandList.map((brand) => (
                  <td key={brand.id} className="p-6 border-l border-line align-top text-center">
                    <div className="flex flex-col items-center gap-2">
                      {brand.website ? (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal hover:underline flex items-center gap-1">
                          Official Website <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-slate-custom text-sm">—</span>}

                      {brand.warrantyUrl && (
                        <a href={brand.warrantyUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-amber hover:underline flex items-center gap-1">
                          Warranty Claims <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
