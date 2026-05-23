import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import { Globe, Star, ShieldCheck, ArrowLeft, MapPin, Zap, MessageSquare, LayoutGrid, Building2 } from "lucide-react";
import { ProjectGallery } from "@/components/shared/ProjectGallery";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating } from "@/lib/actions/reviews";
import { SocialLinkTracker } from "@/components/brands/SocialLinkTracker";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { EpcContactButtons } from "@/components/shared/EpcContactButtons";

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

export default async function EpcProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cacheKey = CACHE_KEYS.EPC_DETAILS(id);
  let profileData: EpcProfileData | null = await redis.get<EpcProfileData>(cacheKey);

  if (!profileData) {
    const installer = await db.query.epcInstallers.findFirst({
      where: eq(epcInstallers.id, id),
      with: {
        user: true
      }
    });

    if (!installer || !installer.user?.isActive) notFound();

    const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, id));
    const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, id));
    const { rating, count } = await getProfileRating(id);

    profileData = { installer, offices, projects, rating, count };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData) return notFound();

  const { installer, offices, projects, rating, count } = profileData;

  // Always check if the user is active, even if coming from cache
  const [userData] = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, installer.userId));
  if (!userData?.isActive) notFound();

  // Enforce 50% completeness score threshold
  const { score } = getEpcCompleteness(installer, offices.length, projects.length);
  if (score < 50) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": installer.companyName,
    "description": installer.about || `Verified EPC solar installer: ${installer.companyName}`,
    "logo": installer.logoUrl || undefined,
    "url": installer.website || undefined,
    "address": offices.length > 0 ? {
      "@type": "PostalAddress",
      "addressLocality": offices[0].city,
      "streetAddress": [offices[0].officeNumber, offices[0].block, offices[0].area].filter(Boolean).join(", ")
    } : undefined,
    "aggregateRating": rating && count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": rating.toFixed(1),
      "reviewCount": count
    } : undefined
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <Button variant="ghost" className="group p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-all font-bold uppercase tracking-widest text-[10px]" asChild>
          <Link href="/epcs">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Back to Network
          </Link>
        </Button>
      </div>

      {/* HERO SECTION */}
      <section className="container mx-auto px-6 mb-16 relative z-10">
        <div className="relative rounded-[3.5rem] overflow-hidden border border-border/50 premium-shadow bg-white/40 backdrop-blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

          <div className="p-8 md:p-16 flex flex-col items-center text-center gap-12 relative z-10">
            {/* Logo Area */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3.5rem] border-2 border-white/50 bg-white p-10 flex items-center justify-center overflow-hidden shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-105">
                {installer.logoUrl ? (
                  <Image src={installer.logoUrl} fill className="object-contain p-4 filter drop-shadow-lg" alt={installer.companyName} sizes="(max-width: 768px) 192px, 256px" />
                ) : (
                  <ShieldCheck className="w-24 h-24 text-primary/10" />
                )}
              </div>
            </div>

            {/* Header Content */}
            <div className="flex-1 space-y-8 max-w-3xl">
              <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    {/* Sectors */}
                    {installer.sectors && (installer.sectors as string[]).length > 0 && (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Sectors</span>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          {installer.isVerified && (
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3" /> Verified Partner
                            </span>
                          )}
                          {(installer.sectors as string[]).map((sector) => (
                            <span key={sector} className="px-4 py-1.5 bg-accent/5 text-accent-foreground rounded-full text-[10px] font-black uppercase tracking-widest border border-border/50">
                              {sector}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* If no sectors but verified, still show verified badge */}
                    {(!installer.sectors || (installer.sectors as string[]).length === 0) && installer.isVerified && (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3" /> Verified Partner
                        </span>
                      </div>
                    )}

                    {/* Certifications */}
                    {(installer as any).certifications && ((installer as any).certifications as string[]).length > 0 && (
                      <div className="flex flex-col items-center gap-2 pt-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Certifications</span>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {((installer as any).certifications as string[]).map((cert) => (
                            <span key={cert} className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 fill-current" /> {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground">
                  {installer.companyName}
                </h1>

                {installer.ceoName ? (
                  <p className="text-xl text-muted-foreground font-medium flex items-center justify-center gap-3 italic">
                    <span className="w-8 h-[1px] bg-primary/30" />
                    Led by {installer.ceoName}
                    <span className="w-8 h-[1px] bg-primary/30" />
                  </p>
                ) : (
                  <p className="text-muted-foreground/40 text-sm font-medium italic">Management Details: N/A</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8">
                {count > 0 ? (
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/50 rounded-2xl border border-border/50 shadow-sm">
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="ml-2 text-2xl font-black text-foreground">{rating?.toFixed(1)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-border/50" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {count} {count === 1 ? "Review" : "Reviews"}
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs font-bold uppercase tracking-widest bg-white/30 px-6 py-3 rounded-2xl border border-dashed border-border/50">
                    Ratings: N/A
                  </div>
                )}

                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  Operational Excellence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 relative z-10 space-y-24">
        {/* MIDDLE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* LEFT COLUMN: About & Offices */}
          <div className="lg:col-span-8 space-y-16">
            {/* About Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(0,109,109,0.4)]" />
                <h2 className="text-4xl font-black tracking-tight">The Vision</h2>
              </div>
              <div className="bg-white/50 backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-all duration-700 group-hover:scale-150" />
                <p className="text-xl leading-relaxed text-foreground font-medium italic opacity-90 relative z-10">
                  “{installer.about || "Information about the company's vision and core values is currently unavailable."}”
                </p>
              </div>
            </div>

            {/* Geographic Hubs (Offices) */}
            {offices.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(0,109,109,0.4)]" />
                  <h2 className="text-4xl font-black tracking-tight">Geographic Hubs</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {offices.map((office) => (
                    <div key={office.id} className="p-8 bg-white/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] flex items-center gap-6 shadow-sm group hover:border-primary transition-all duration-500">
                      <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                        <Building2 className="w-7 h-7 text-primary group-hover:text-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-xl leading-none">{office.city || "N/A"}</h4>
                        <p className="text-sm text-muted-foreground font-medium">
                          {[office.officeNumber, office.block, office.area].filter(Boolean).join(", ") || "Address details: N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Contact & Communication */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl bg-[#0F172A] text-white rounded-[3rem] overflow-hidden sticky top-12">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-none">Connect with Expert</h3>
                  <p className="text-white/40 text-xs font-medium leading-relaxed">
                    Discuss high-performance solar solutions directly with the {installer.companyName} technical team.
                  </p>
                </div>

                <EpcContactButtons
                  epcId={installer.id}
                  companyName={installer.companyName}
                  userId={installer.userId}
                  website={installer.website}
                  whatsappNumber={(installer.socialLinks as { platform: string; url: string }[] | null)?.find(l => l.platform === "WhatsApp")?.url.replace(/\D/g, "") ?? null}
                />

                {installer.socialLinks && (installer.socialLinks as any[]).length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-white/5">
                    {(installer.socialLinks as { platform: string; url: string }[]).map((link, i) => (
                      <SocialLinkTracker
                        key={i}
                        link={link}
                        id={installer.id}
                        name={installer.companyName}
                        type="epc"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="pt-8 border-t border-border/20 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-35">Integrity Report</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Onboarding</span>
                  <span className="font-black text-primary">{new Date(installer.createdAt).getFullYear() || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Verification</span>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Service Area</span>
                  <span className="font-black text-foreground/80 text-[10px] uppercase tracking-widest">Nationwide</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION */}
        <section className="space-y-24 border-t border-border/40 pt-16">
          {/* Showcase Projects */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(0,109,109,0.4)]" />
                <h2 className="text-4xl font-black tracking-tight text-gradient">Portfolio Showcase</h2>
              </div>
              <span className="text-xs font-black uppercase tracking-widest opacity-35">{projects.length} Masterpieces</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="group relative rounded-[2.5rem] overflow-hidden bg-white border border-border/50 premium-shadow transition-all duration-500 hover:-translate-y-2">
                  <div className="aspect-[4/3] relative overflow-hidden group/gallery">
                    <ProjectGallery
                      images={(project.images as string[]) || []}
                      videos={(project.videos as string[]) || []}
                      name={project.name || "Project"}
                    />
                    <div className="absolute top-6 right-6 flex flex-wrap gap-2 max-w-[80%] z-30">
                      {(() => {
                        let segments: string[] = [];
                        if (project.segmentType) {
                          try {
                            const parsed = typeof project.segmentType === 'string' ? JSON.parse(project.segmentType) : project.segmentType;
                            segments = Array.isArray(parsed) ? parsed : [parsed];
                          } catch {
                            segments = Array.isArray(project.segmentType) ? project.segmentType : [project.segmentType];
                          }
                        }
                        return segments.map(seg => (
                          <span key={seg} className="bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-xl border border-primary/10">
                            {seg}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black tracking-tight leading-snug">{project.name}</h4>
                      <p className="text-muted-foreground font-bold text-xs flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> {project.city || "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none">System Size</p>
                        <p className="text-base font-black flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-yellow-500 fill-current" /> {project.systemSize || "N/A"} <span className="text-[10px] opacity-50 uppercase tracking-widest">kW</span>
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none">System Type</p>
                        <p className="text-base font-black">{project.systemType || "N/A"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-35">Technical Architecture</p>
                      <div className="flex flex-wrap gap-2">
                        {project.inverterModel ? (
                          <span className="text-[9px] font-bold bg-primary/5 text-primary px-2.5 py-1 rounded-lg border border-primary/10">INV: {project.inverterModel}</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-border/20 px-2.5 py-1 rounded-lg opacity-40 italic">Inv: N/A</span>
                        )}
                        {project.solarPanelModel ? (
                          <span className="text-[9px] font-bold bg-primary/5 text-primary px-2.5 py-1 rounded-lg border border-primary/10">PANEL: {project.solarPanelModel}</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-border/20 px-2.5 py-1 rounded-lg opacity-40 italic">Panel: N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-xl rounded-[3rem] border-4 border-dashed border-border/50">
                  <LayoutGrid className="w-12 h-12 text-primary/10 mx-auto mb-4" />
                  <p className="text-muted-foreground text-base font-bold">Project Showcase: N/A</p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">Inventory Loading</p>
                </div>
              )}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="space-y-8 border-t border-border/40 pt-16">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(0,109,109,0.4)]" />
              <h2 className="text-4xl font-black tracking-tight">Verified Experiences</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 premium-shadow">
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" /> Leave a Review
                </h3>
                <ReviewForm targetId={id} targetType="epc" />
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 border-b border-border/50 pb-4">Community Feedback</h3>
                <ReviewList targetId={id} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
