import { db } from "@/db";
import { epcInstallers, reviews, users, epcOffices, epcProjects } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { Star, ShieldCheck, ArrowLeft, MapPin, Briefcase, Zap, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ }> }): Promise<Metadata> {
  
  const baseUrl = "https://www.energygurus.online";
  const title = "Compare Solar Installers Side-by-Side | EnergyGurus";
  const description = "Compare ratings, project counts, sector specializations, and office footprints of solar EPC companies in Pakistan.";

  return {
    title,
    description,
    keywords: [
      "compare solar installers Pakistan",
      "best solar companies in Pakistan",
      "top solar installers in Pakistan",
      "solar installation near me"
    ],
    alternates: {
      canonical: `${baseUrl}/epcs/compare`,
    },
    openGraph: {
      url: `${baseUrl}/epcs/compare`,
      title,
      description,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Compare Solar Installers" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`]
    }
    };
}

export default async function EpcComparePage({
  searchParams
    }: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  if (!ids) return notFound();

  const idArray = ids.split(",").slice(0, 3);
  if (idArray.length < 2) return notFound();

  const installers = await db
    .select({
      id: epcInstallers.id,
      companyName: epcInstallers.companyName,
      logoUrl: epcInstallers.logoUrl,
      sectors: epcInstallers.sectors,
      certifications: epcInstallers.certifications,
      isVerified: epcInstallers.isVerified,
      about: epcInstallers.about,
      avgRating: sql<number>`COALESCE(CAST(AVG(${reviews.rating}) AS FLOAT), 0)`.as('avg_rating'),
      reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`.as('review_count'),
      officesCount: sql<number>`(SELECT COUNT(*) FROM ${epcOffices} WHERE ${epcOffices.epcId} = ${epcInstallers.id})`.mapWith(Number),
      projectsCount: sql<number>`(SELECT COUNT(*) FROM ${epcProjects} WHERE ${epcProjects.epcId} = ${epcInstallers.id})`.mapWith(Number)
    })
    .from(epcInstallers)
    .leftJoin(reviews, eq(reviews.targetId, epcInstallers.id))
    .where(inArray(epcInstallers.id, idArray))
    .groupBy(epcInstallers.id);

  if (installers.length < 2) return notFound();

  return (
    <div className="min-h-screen bg-paper text-graphite pb-20">
      <div className="bg-white border-b border-line sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/epcs" className="flex items-center gap-1.5 text-sm font-medium text-slate-custom hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <div className="w-px h-6 bg-line"></div>
          <h1 className="font-space-grotesk font-semibold text-lg flex items-center gap-2">
            Compare Installers
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-line">
                <th className="p-6 bg-paper/50 font-ibm-plex-mono text-[0.7rem] uppercase tracking-widest text-slate-custom w-48">
                  Features
                </th>
                {installers.map((installer) => (
                  <th key={installer.id} className="p-6 text-center border-l border-line bg-white align-top w-1/3">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-xl bg-paper flex items-center justify-center overflow-hidden border border-line p-1">
                        {installer.logoUrl ? (
                          <Image src={installer.logoUrl} alt={installer.companyName} width={80} height={80} className="object-contain w-full h-full" />
                        ) : (
                          <span className="text-xl font-bold text-slate-custom">{installer.companyName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-space-grotesk font-bold text-lg text-ink flex items-center justify-center gap-1.5">
                          {installer.companyName}
                          {installer.isVerified && <ShieldCheck className="w-4 h-4 text-teal" />}
                        </h3>
                        <div className="flex items-center justify-center gap-1 font-ibm-plex-mono text-sm">
                          <Star className="w-4 h-4 text-amber fill-amber" />
                          <span className="font-semibold text-ink">{installer.avgRating?.toFixed(1) || "0.0"}</span>
                          <span className="text-slate-custom">({installer.reviewCount || 0})</span>
                        </div>
                      </div>
                      <Link href={`/epcs/${installer.id}` as any} className="mt-2 w-full py-2 bg-ink text-white rounded-lg text-sm font-semibold hover:bg-ink/90 transition-colors block">
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
                  <Briefcase className="w-4 h-4 text-amber" /> Projects & Experience
                </td>
                {installers.map((installer) => (
                  <td key={installer.id} className="p-6 border-l border-line text-center">
                    <div className="text-2xl font-space-grotesk font-bold text-ink">{installer.projectsCount || 0}</div>
                    <div className="text-xs text-slate-custom uppercase tracking-wider font-ibm-plex-mono mt-1">Verified Projects</div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber" /> Coverage
                </td>
                {installers.map((installer) => (
                  <td key={installer.id} className="p-6 border-l border-line text-center">
                    <div className="text-lg font-bold text-ink">{installer.officesCount || 0}</div>
                    <div className="text-xs text-slate-custom uppercase tracking-wider font-ibm-plex-mono mt-1">Active Offices</div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber" /> Supported Sectors
                </td>
                {installers.map((installer) => (
                  <td key={installer.id} className="p-6 border-l border-line text-center align-top">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {installer.sectors && (installer.sectors as string[]).length > 0 ? (
                        (installer.sectors as string[]).map((sector, i) => (
                          <span key={i} className="bg-[rgba(47,110,98,0.1)] text-teal px-2 py-0.5 rounded-full text-[0.7rem] font-semibold tracking-wide uppercase">
                            {sector}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-custom text-sm">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-6 bg-paper/30 font-semibold text-slate-custom flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber" /> Certifications
                </td>
                {installers.map((installer) => (
                  <td key={installer.id} className="p-6 border-l border-line text-center align-top">
                    <div className="flex flex-col items-center gap-2">
                      {installer.certifications && (installer.certifications as string[]).length > 0 ? (
                        (installer.certifications as string[]).map((cert, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-sm text-graphite">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                            {cert}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-custom text-sm">—</span>
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
