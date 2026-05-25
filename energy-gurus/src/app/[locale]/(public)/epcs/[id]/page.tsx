import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import {
  Globe,
  Star,
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Zap,
  MessageSquare,
  Building2,
  Calendar,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";
import { ProjectGallery } from "@/components/shared/ProjectGallery";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating } from "@/lib/actions/reviews";
import { SocialLinkTracker } from "@/components/brands/SocialLinkTracker";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { EpcContactButtons } from "@/components/shared/EpcContactButtons";
import { ShareButton } from "@/components/shared/ShareButton";

type EpcInstaller = InferSelectModel<typeof epcInstallers>;
type EpcOffice = InferSelectModel<typeof epcOffices>;
type EpcProject = InferSelectModel<typeof epcProjects>;

interface EpcProfileData {
  installer: EpcInstaller;
  offices: EpcOffice[];
  projects: EpcProject[];
  rating: number | null;
  count: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const installer = await db.query.epcInstallers.findFirst({
    where: eq(epcInstallers.id, id),
  });

  if (!installer) return {};

  return {
    title: `${installer.companyName} | Verified Solar EPC | Energy Gurus`,
    description: installer.about?.slice(0, 160) || `Learn more about ${installer.companyName}, a verified solar EPC installer on Energy Gurus.`,
    openGraph: {
      title: `${installer.companyName} | Energy Gurus`,
      description: installer.about?.slice(0, 160),
      images: installer.logoUrl ? [installer.logoUrl] : [],
    }
  };
}

export default async function EpcProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cacheKey = CACHE_KEYS.EPC_DETAILS(id);

  let profileData: EpcProfileData | null =
    await redis.get<EpcProfileData>(cacheKey);

  if (!profileData) {
    const installer = await db.query.epcInstallers.findFirst({
      where: eq(epcInstallers.id, id),
      with: { user: true },
    });

    if (!installer || !(installer as any).user?.isActive) notFound();

    const offices = await db
      .select()
      .from(epcOffices)
      .where(eq(epcOffices.epcId, id));
    const projects = await db
      .select()
      .from(epcProjects)
      .where(eq(epcProjects.epcId, id));
    const { rating, count } = await getProfileRating(id);

    profileData = { installer, offices, projects, rating, count };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData) return notFound();

  const { installer, offices, projects, rating, count } = profileData;

  // Always verify active status even from cache
  const [userData] = await db
    .select({ isActive: users.isActive })
    .from(users)
    .where(eq(users.id, installer.userId));
  if (!userData?.isActive) notFound();

  // Enforce 50% completeness threshold
  const { score } = getEpcCompleteness(
    installer,
    offices.length,
    projects.length
  );
  if (score < 50) notFound();

  const whatsappNumber =
    (
      installer.socialLinks as { platform: string; url: string }[] | null
    )?.find((l) => l.platform === "WhatsApp" && l.url && l.url.trim() !== "")?.url.replace(/\D/g, "") || null;

  const socialLinks = (
    installer.socialLinks as { platform: string; url: string }[] | null
  )?.filter((l) => l.platform !== "WhatsApp" && l.url && l.url.trim() !== "") ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: installer.companyName,
    description:
      installer.about ||
      `Verified EPC solar installer: ${installer.companyName}`,
    logo: installer.logoUrl || undefined,
    url: installer.website || undefined,
    address:
      offices.length > 0
        ? {
          "@type": "PostalAddress",
          addressLocality: offices[0].city,
          streetAddress: [
            offices[0].officeNumber,
            offices[0].block,
            offices[0].area,
          ]
            .filter(Boolean)
            .join(", "),
        }
        : undefined,
    aggregateRating:
      rating && count > 0
        ? {
          "@type": "AggregateRating",
          ratingValue: rating.toFixed(1),
          reviewCount: count,
        }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-foreground selection:bg-primary/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top nav bar */}
      <div className="bg-white border-b border-border/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/epcs"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            EPC Network
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
            {installer.companyName}
          </span>
          {installer.isVerified && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              {/* Hero banner */}
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-2 right-4 w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
                  <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-accent/30 blur-xl" />
                </div>
                {/* Decorative grid lines */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="px-6 pb-6">
                {/* Logo overlapping banner */}
                <div className="relative -mt-14 mb-4">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                    {installer.logoUrl ? (
                      <Image
                        src={installer.logoUrl}
                        width={96}
                        height={96}
                        className="object-contain w-full h-full p-2"
                        alt={installer.companyName}
                      />
                    ) : (
                      <ShieldCheck className="w-12 h-12 text-primary/30" />
                    )}
                  </div>
                </div>

                {/* Name & CEO */}
                <h1 className="text-xl font-black tracking-tight leading-tight mb-1">
                  {installer.companyName}
                </h1>
                {installer.ceoName && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Led by{" "}
                    <span className="font-semibold text-foreground">
                      {installer.ceoName}
                    </span>
                  </p>
                )}

                {/* Rating row */}
                {count > 0 ? (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-black text-sm">
                      {rating?.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({count} {count === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5" />
                    No reviews yet
                  </div>
                )}

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {installer.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Calendar className="w-2.5 h-2.5" />{" "}
                    Since {new Date(installer.createdAt).getFullYear()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-foreground border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Globe className="w-2.5 h-2.5" /> Nationwide
                  </span>
                </div>

                {/* Sectors */}
                {installer.sectors &&
                  (installer.sectors as string[]).length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
                        Sectors
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(installer.sectors as string[]).map((sector) => (
                          <span
                            key={sector}
                            className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-[10px] font-bold border border-border/50"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Certifications */}
                {(installer as any).certifications &&
                  ((installer as any).certifications as string[]).length >
                  0 && (
                    <div className="mb-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
                        Certifications
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          (installer as any).certifications as string[]
                        ).map((cert) => (
                          <span
                            key={cert}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold"
                          >
                            <Award className="w-2.5 h-2.5" /> {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Rate & Share row */}
                <div className="flex gap-2 mb-4">
                  <a
                    href="#reviews"
                    className="flex-1 h-10 rounded-xl border border-border bg-white hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1.5 text-sm font-bold text-foreground"
                  >
                    <Star className="w-4 h-4 text-yellow-500" /> Rate
                  </a>
                  <ShareButton
                    companyName={installer.companyName}
                    className="flex-1 h-10 rounded-xl border border-border bg-white hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1.5 text-sm font-bold text-foreground"
                  />
                </div>

                {/* Social links */}
                {socialLinks.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {socialLinks.map((link, i) => (
                      <SocialLinkTracker
                        key={i}
                        link={link}
                        id={installer.id}
                        name={installer.companyName}
                        type="epc"
                        variant="light"
                      />
                    ))}
                  </div>
                )}

                {/* Contact CTA */}
                <EpcContactButtons
                  epcId={installer.id}
                  companyName={installer.companyName}
                  userId={installer.userId}
                  website={installer.website}
                  whatsappNumber={whatsappNumber}
                />

                <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
                  By continuing, you agree to our{" "}
                  <span className="underline cursor-pointer">Terms</span> &{" "}
                  <span className="underline cursor-pointer">Privacy Policy</span>
                </p>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4">
                Quick Stats
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                    </div>
                    Projects
                  </div>
                  <span className="font-black text-sm">{projects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    Offices
                  </div>
                  <span className="font-black text-sm">{offices.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    Reviews
                  </div>
                  <span className="font-black text-sm">{count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    Verification
                  </div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-full ${installer.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {installer.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RIGHT CONTENT ── */}
          <section className="lg:col-span-8 xl:col-span-9 space-y-5">
            {/* About */}
            <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm">
              <h2 className="text-base font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                About {installer.companyName}
              </h2>
              <p className="text-base text-foreground/80 leading-relaxed">
                {installer.about ||
                  "Company vision and core values information is currently unavailable."}
              </p>

              {/* Website link */}
              {installer.website && (
                <a
                  href={installer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  {installer.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            {/* Geographic Hubs */}
            {offices.length > 0 && (
              <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm">
                <h2 className="text-base font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                  Office Locations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offices.map((office) => (
                    <div
                      key={office.id}
                      className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl border border-border/40 hover:border-primary/30 transition-colors"
                    >
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm leading-tight">
                          {office.city || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 break-words">
                          {[office.officeNumber, office.block, office.area]
                            .filter(Boolean)
                            .join(", ") || "Address details unavailable"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div
              id="reviews"
              className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm"
            >
              <h2 className="text-base font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                Verified Experiences
                {count > 0 && (
                  <span className="ml-auto text-xs font-black text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    {count}
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Review form */}
                <div className="lg:col-span-2">
                  <div className="bg-secondary/30 rounded-xl p-5 border border-border/40">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Leave a Review
                    </h3>
                    <ReviewForm targetId={id} targetType="epc" />
                  </div>
                </div>

                {/* Review list */}
                <div className="lg:col-span-3">
                  <ReviewList targetId={id} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
