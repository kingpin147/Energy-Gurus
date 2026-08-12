import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import {
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Play,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating, getTeamRating } from "@/lib/actions/reviews";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { InstallerQuoteForm } from "@/components/forms/installer-quote-form";

type EpcInstaller = InferSelectModel<typeof epcInstallers>;
type EpcOffice = InferSelectModel<typeof epcOffices>;
type EpcProject = InferSelectModel<typeof epcProjects>;

interface EpcProfileData {
  installer: EpcInstaller;
  offices: EpcOffice[];
import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import {
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Play,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating, getTeamRating } from "@/lib/actions/reviews";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { InstallerQuoteForm } from "@/components/forms/installer-quote-form";

type EpcInstaller = InferSelectModel<typeof epcInstallers>;
type EpcOffice = InferSelectModel<typeof epcOffices>;
type EpcProject = InferSelectModel<typeof epcProjects>;

interface EpcProfileData {
  installer: EpcInstaller;
  offices: EpcOffice[];
  projects: EpcProject[];
  rating: number | null;
  count: number;
  isActive: boolean;
}

export async function generateMetadata({
  params
    }: {
  params: Promise<{ id: string; locale?: string }>;
}): Promise<Metadata> {
  const { id, locale = "en" } = await params;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) return {};

  const baseUrl = "https://www.energygurus.online";
  const installer = await db.query.epcInstallers.findFirst({
    where: eq(epcInstallers.id, id)
    });

  if (!installer) return {};

  const title = `${installer.companyName} | Verified Solar EPC | EnergyGurus`;
  const description = installer.about?.slice(0, 160) || `Learn more about ${installer.companyName}, a certified solar installer providing high-quality energy solutions.`;
  const url = `${baseUrl}/epcs/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "EnergyGurus",
      type: "website",
      images: installer.logoUrl ? [{ url: installer.logoUrl, width: 800, height: 800, alt: installer.companyName }] : [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: installer.companyName }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: installer.logoUrl ? [installer.logoUrl] : [`${baseUrl}/new_hero_banner.jpg`]
    const installer = await db.query.epcInstallers.findFirst({
      where: eq(epcInstallers.id, id),
      with: { user: true }
    });

    if (!installer || !(installer as any).user?.isActive) notFound();

    const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, id));
    const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, id));
    const { rating, count } = await getProfileRating(id);

    profileData = { installer, offices, projects, rating, count, isActive: (installer as any).user?.isActive || false };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData || !profileData.isActive) return notFound();

  const { installer, offices, projects, rating, count } = profileData;

  const { score } = getEpcCompleteness(installer, offices.length, projects.length);
  if (score < 50) notFound();

  const { rating: teamRating, count: teamCount } = await getTeamRating(installer.id, "epc");

  const primaryCity = offices[0]?.city || "Lahore";
  const yearsInBusiness = Math.max(1, new Date().getFullYear() - new Date(installer.createdAt).getFullYear());

  const certBrands = (installer.certifications as string[])?.length > 0 
    ? (installer.certifications as string[]) 
    : ["LONGI", "JINKO", "JA", "TRINA", "HUAWEI"];

  const sectorsList = (installer.sectors as string[])?.length > 0
    ? (installer.sectors as string[])
    : ["Residential", "Commercial", "Industrial", "Agriculture"];

  const socialLinks = (installer.socialLinks as { platform: string; url: string }[] | null) || [];
  const websiteUrl = installer.website || socialLinks.find(l => l.platform.toLowerCase() === "website")?.url || "#";
  const facebookUrl = socialLinks.find(l => l.platform.toLowerCase() === "facebook")?.url || "#";
  const instagramUrl = socialLinks.find(l => l.platform.toLowerCase() === "instagram")?.url || "#";
  const linkedinUrl = socialLinks.find(l => l.platform.toLowerCase() === "linkedin")?.url || "#";
  const youtubeUrl = socialLinks.find(l => l.platform.toLowerCase() === "youtube")?.url || "#";

  return (
    <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 min-h-screen">
      
      {/* Breadcrumb */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 pt-5 text-[0.84rem] text-slate-custom">
        <Link href="/epcs" className="text-teal hover:underline">Find an Installer</Link> / {installer.companyName}
      </div>

      {/* Profile Header */}
      <header className="py-[32px] pb-[48px] border-b border-line">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-[28px] items-start">
            {/* Avatar LG */}
            <div className="w-[120px] h-[120px] rounded-[10px] bg-ink text-amber flex items-center justify-center font-space-grotesk font-bold text-[2.4rem] shrink-0 overflow-hidden">
              {installer.logoUrl ? (
                <Image src={installer.logoUrl} alt={installer.companyName} width={120} height={120} className="object-cover w-full h-full" />
              ) : (
                installer.companyName.substring(0, 2).toUpperCase()
              )}
            </div>

            {/* Profile Name & Meta */}
            <div>
              <h1 className="font-space-grotesk font-semibold text-[1.9rem] text-ink mb-1">
                {installer.ceoName || installer.companyName}
              </h1>
              <div className="text-[1.05rem] text-slate-custom mb-3">
                {installer.companyName}
              </div>
              <div className="flex items-center gap-1.5 text-slate-custom text-[0.92rem] mb-[10px]">
                📍 {primaryCity}
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="font-ibm-plex-mono text-[0.68rem] tracking-[0.05em] uppercase text-slate-custom mr-0.5">
                  Certified By
                </span>
                {certBrands.map((brand, i) => (
                  <span key={i} className="h-[26px] px-[10px] rounded-[5px] bg-ink text-amber font-space-grotesk font-bold text-[0.66rem] tracking-[0.03em] flex items-center justify-center uppercase">
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile CTA */}
            <div className="flex flex-col gap-2.5 min-w-[180px]">
              <a
                href="#quote"
                className="bg-amber text-ink rounded-[3px] px-[22px] py-[13px] text-[0.9rem] font-semibold text-center hover:bg-[#f2b458] transition-colors inline-block"
              >
                Request a Quote
              </a>
            </div>
          </div>

          {/* Rating Cards */}
          <div className="flex gap-[24px] mt-[24px] flex-wrap">
            <div className="bg-white border border-line rounded-[6px] p-[20px_24px] flex items-center gap-[16px] flex-1 min-w-[240px]">
              <div className="font-ibm-plex-mono text-[1.8rem] text-ink">
                {rating ? rating.toFixed(1) : "5.0"}
              </div>
              <div>
                <div className="text-amber text-[0.95rem]">
                  {renderStars(rating || 5.0)}
                </div>
                <div className="font-ibm-plex-mono text-[0.78rem] text-slate-custom uppercase tracking-[0.05em] mt-1">
                  Customer Rating · {count} {count === 1 ? "Review" : "Reviews"}
                </div>
              </div>
            </div>

            <div className="bg-[rgba(232,163,61,0.05)] border border-amber rounded-[6px] p-[20px_24px] flex items-center gap-[16px] flex-1 min-w-[240px]">
              <div className="font-ibm-plex-mono text-[1.8rem] text-amber">
                {teamRating ? teamRating.toFixed(1) : "5.0"}
              </div>
              <div>
                <div className="text-amber text-[0.95rem]">
                  {renderStars(teamRating || 5.0)}
                </div>
                <div className="font-ibm-plex-mono text-[0.78rem] text-slate-custom uppercase tracking-[0.05em] mt-1">
                  EnergyGurus Team Rating {teamCount > 0 ? `· ${teamCount} ${teamCount === 1 ? "Review" : "Reviews"}` : ""}
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Portfolio — Project Videos */}
      <section className="py-[56px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="mb-8">
            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-2">
              <span className="w-5 h-[1px] bg-amber"></span>
              Portfolio
            </p>
            <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink">
              Project Videos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((project) => {
                const videoId = (project as any).youtubeUrl ? getYouTubeId((project as any).youtubeUrl) : null;
                return (
                  <div key={project.id} className="bg-white border border-line rounded-[4px] overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-ink to-[#1b3157] relative flex items-center justify-center overflow-hidden group">
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={project.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : null}
                      <a
                        href={(project as any).youtubeUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem] shadow-md group-hover:scale-110 transition-transform absolute"
                      >
                        ▶
                      </a>
                    </div>
                    <div className="p-[16px_18px]">
                      <h3 className="font-space-grotesk font-semibold text-[0.98rem] text-ink mb-1">
                        {project.name}
                      </h3>
                      <p className="text-[0.85rem] text-slate-custom">
                        {project.systemSize || project.systemType || "Solar project installation"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="bg-white border border-line rounded-[4px] overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-ink to-[#1b3157] relative flex items-center justify-center">
                    <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem]">▶</div>
                  </div>
                  <div className="p-[16px_18px]">
                    <h3 className="font-space-grotesk font-semibold text-[0.98rem] text-ink mb-1">15 kW Rooftop Install</h3>
                    <p className="text-[0.85rem] text-slate-custom">Residential install, completed in 3 days.</p>
                  </div>
                </div>
                <div className="bg-white border border-line rounded-[4px] overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-ink to-[#1b3157] relative flex items-center justify-center">
                    <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem]">▶</div>
                  </div>
                  <div className="p-[16px_18px]">
                    <h3 className="font-space-grotesk font-semibold text-[0.98rem] text-ink mb-1">80 kW Commercial Plaza System</h3>
                    <p className="text-[0.85rem] text-slate-custom">Commercial rooftop installation.</p>
                  </div>
                </div>
                <div className="bg-white border border-line rounded-[4px] overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-ink to-[#1b3157] relative flex items-center justify-center">
                    <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem]">▶</div>
                  </div>
                  <div className="p-[16px_18px]">
                    <h3 className="font-space-grotesk font-semibold text-[0.98rem] text-ink mb-1">200 kW Unit Install</h3>
                    <p className="text-[0.85rem] text-slate-custom">Industrial ground-mount system.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Customer Video Testimonials */}
      <section className="bg-white border-y border-line py-[56px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="mb-8">
            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-2">
              <span className="w-5 h-[1px] bg-teal"></span>
              In Their Words
            </p>
            <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink">
              Customer Video Testimonials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            <div className="bg-white border border-line rounded-[4px] overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-teal to-[#1c4a41] relative flex items-center justify-center">
                <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem]">▶</div>
              </div>
              <div className="p-[16px_18px]">
                <div className="font-semibold text-[0.92rem] text-ink">Sana Malik</div>
                <div className="text-[0.8rem] text-slate-custom mt-0.5">Model Town, Lahore</div>
              </div>
            </div>

            <div className="bg-white border border-line rounded-[4px] overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-teal to-[#1c4a41] relative flex items-center justify-center">
                <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem]">▶</div>
              </div>
              <div className="p-[16px_18px]">
                <div className="font-semibold text-[0.92rem] text-ink">Farooq Textiles</div>
                <div className="text-[0.8rem] text-slate-custom mt-0.5">Sundar Estate, Lahore</div>
              </div>
            </div>

            <div className="bg-white border border-line rounded-[4px] overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-teal to-[#1c4a41] relative flex items-center justify-center">
                <div className="w-[44px] h-[44px] rounded-full bg-amber text-ink flex items-center justify-center text-[0.95rem]">▶</div>
              </div>
              <div className="p-[16px_18px]">
                <div className="font-semibold text-[0.92rem] text-ink">Bilal Farms</div>
                <div className="text-[0.8rem] text-slate-custom mt-0.5">Sheikhupura</div>
              </div>
            </div>
          </div>

          {/* Written Reviews & Submission */}
          <div className="mt-8">
            <h3 className="font-space-grotesk font-semibold text-[1.2rem] text-ink mb-6">
              Customer Reviews & Ratings
            </h3>
            <div className="mb-6">
              <ReviewForm targetId={id} targetType="epc" />
            </div>
            <ReviewList targetId={id} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-[56px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="mb-8">
            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-2">
              <span className="w-5 h-[1px] bg-amber"></span>
              About
            </p>
            <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink">
              {installer.companyName}
            </h2>
          </div>

          <div className="bg-white border border-line rounded-[6px] p-8">
            <p className="text-slate-custom text-[0.98rem] mb-5 leading-relaxed">
              {installer.about || `${installer.companyName} has been designing and installing solar systems across Pakistan, serving homeowners, businesses, and agricultural clients. The team specializes in rooftop residential systems and commercial solar installations.`}
            </p>

            <div className="flex gap-2 flex-wrap mb-6">
              {sectorsList.map((sector, i) => (
                <span key={i} className="font-ibm-plex-mono text-[0.7rem] tracking-[0.05em] uppercase text-teal bg-[rgba(47,110,98,0.1)] px-[11px] py-[5px] rounded-[20px]">
                  {sector}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-line pt-6 mt-6">
              <div>
                <div className="font-ibm-plex-mono text-[1.4rem] text-ink">{yearsInBusiness} yrs</div>
                <div className="text-[0.78rem] text-slate-custom uppercase tracking-[0.05em] mt-1">In Business</div>
              </div>
              <div>
                <div className="font-ibm-plex-mono text-[1.4rem] text-ink">
                  {projects.length > 0 ? `${projects.length}+` : "340+"}
                </div>
                <div className="text-[0.78rem] text-slate-custom uppercase tracking-[0.05em] mt-1">Systems Installed</div>
              </div>
              <div>
                <div className="font-ibm-plex-mono text-[1.4rem] text-ink">NABCEP</div>
                <div className="text-[0.78rem] text-slate-custom uppercase tracking-[0.05em] mt-1">Certified Team</div>
              </div>
            </div>

            <div className="flex gap-2.5 flex-wrap pt-6 border-t border-line mt-[28px]">
              {websiteUrl !== "#" && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="Website" aria-label="Website">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {facebookUrl !== "#" && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="Facebook" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagramUrl !== "#" && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="Instagram" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {linkedinUrl !== "#" && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="LinkedIn" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl !== "#" && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="YouTube" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Request a Quote Section */}
      <section className="bg-white border-y border-line py-[56px]" id="quote">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <div className="text-center max-w-[560px] mx-auto mb-2">
            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center justify-center gap-2.5 mb-2">
              <span className="w-5 h-[1px] bg-amber"></span>
              Request a Quote
            </p>
            <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink">
              Get a quote from {installer.ceoName || installer.companyName}
            </h2>
            <p className="text-slate-custom mt-2.5 text-[0.95rem]">
              Share a few details and {installer.companyName} will follow up directly.
            </p>
          </div>

          <InstallerQuoteForm
            receiverId={installer.userId}
            receiverName={installer.companyName}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-white py-[56px] text-center">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <h2 className="font-space-grotesk font-semibold text-[1.6rem] text-white mb-5">
            Ready to work with {installer.companyName}?
          </h2>
          <a
            href="#quote"
            className="bg-amber text-ink rounded-[3px] px-7 py-[15px] text-[0.9rem] font-semibold inline-block hover:bg-[#f2b458] transition-colors"
          >
            Request a Quote From {installer.ceoName || installer.companyName}
          </a>
        </div>
      </section>

    </div>
  );
}
