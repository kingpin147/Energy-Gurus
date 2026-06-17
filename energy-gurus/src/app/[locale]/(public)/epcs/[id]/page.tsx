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
  Shield,
  Settings,
  Headset,
  CheckCircle2,
  Play
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating } from "@/lib/actions/reviews";
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
  isActive: boolean;
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

  const title = `${installer.companyName} | Verified Solar EPC | Energy Gurus`;
  const description = installer.about?.slice(0, 160) || `Learn more about ${installer.companyName}, a verified solar EPC installer providing high-quality energy solutions in Pakistan.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: installer.logoUrl ? [{ url: installer.logoUrl, width: 800, height: 800, alt: installer.companyName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: installer.logoUrl ? [installer.logoUrl] : [],
    }
  };
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
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

    profileData = { installer, offices, projects, rating, count, isActive: (installer as any).user?.isActive || false };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData) return notFound();

  const { installer, offices, projects, rating, count, isActive } = profileData;

  if (!isActive) notFound();

  // Enforce 50% completeness threshold
  const { score } = getEpcCompleteness(
    installer,
    offices.length,
    projects.length
  );
  if (score < 50) notFound();

  const inverters = Array.from(new Set(projects.map(p => p.inverterModel).filter(Boolean)));
  const batteries = Array.from(new Set(projects.map(p => p.batteryModel).filter(Boolean)));
  const panels = Array.from(new Set(projects.map(p => p.solarPanelModel).filter(Boolean)));
  const youtubeProjects = projects.filter(p => (p as any).youtubeUrl);

  const whatsappNumber =
    (
      installer.socialLinks as { platform: string; url: string }[] | null
    )?.find((l) => l.platform === "WhatsApp" && l.url && l.url.trim() !== "")?.url.replace(/\D/g, "") || null;

  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-primary/20 pb-20">
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
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ── LEFT SIDEBAR (1/3) ── */}
          <aside className="lg:col-span-1 space-y-8 flex flex-col items-center">
            
            {/* Big Circular Profile Area */}
            <div className="w-full flex flex-col items-center">
              <div className="w-64 h-64 bg-white rounded-full border-8 border-primary/5 shadow-2xl relative flex items-center justify-center p-2 mb-[-2rem] z-0">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  {installer.logoUrl ? (
                    <Image src={installer.logoUrl} alt={installer.companyName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-6xl font-black text-slate-300 uppercase">{installer.companyName.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-primary text-primary-foreground px-8 py-3 rounded-full z-10 flex items-center gap-2 shadow-md">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="font-black tracking-widest uppercase text-sm">SOLAR INSTALLER</span>
              </div>
            </div>

            {/* Rating Section */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-6 h-6 ${rating && rating >= star ? "fill-current" : rating && rating >= star - 0.5 ? "fill-current opacity-50" : "text-gray-200"}`} />
                ))}
                <span className="text-2xl font-black text-foreground ml-2">
                  {rating ? rating.toFixed(1) : "0.0"}/5
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                ({count}+ Happy Customers)
              </p>
            </div>

            {/* Certified Installer Section */}
            <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-border flex-1"></div>
                <h3 className="font-black text-primary tracking-widest text-sm">CERTIFIED INSTALLER</h3>
                <div className="h-px bg-border flex-1"></div>
              </div>

              <div className="space-y-4">
                {/* Inverters */}
                <div className="flex items-center gap-4 border border-border/50 rounded-xl p-3 bg-secondary/5">
                  <div className="w-10 h-10 bg-white rounded-lg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">INVERTERS</div>
                    <div className="flex flex-wrap gap-1.5">
                      {inverters.length > 0 ? inverters.map(model => (
                        <span key={model} className="text-xs font-bold text-primary bg-white border border-border/50 px-2 py-0.5 rounded-md shadow-sm">{model}</span>
                      )) : <span className="text-xs text-muted-foreground">Various Brands</span>}
                    </div>
                  </div>
                </div>

                {/* Batteries */}
                <div className="flex items-center gap-4 border border-border/50 rounded-xl p-3 bg-secondary/5">
                  <div className="w-10 h-10 bg-white rounded-lg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">BATTERIES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {batteries.length > 0 ? batteries.map(model => (
                        <span key={model} className="text-xs font-bold text-primary bg-white border border-border/50 px-2 py-0.5 rounded-md shadow-sm">{model}</span>
                      )) : <span className="text-xs text-muted-foreground">Various Brands</span>}
                    </div>
                  </div>
                </div>

                {/* Panels */}
                <div className="flex items-center gap-4 border border-border/50 rounded-xl p-3 bg-secondary/5">
                  <div className="w-10 h-10 bg-white rounded-lg border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">SOLAR PANELS</div>
                    <div className="flex flex-wrap gap-1.5">
                      {panels.length > 0 ? panels.map(model => (
                        <span key={model} className="text-xs font-bold text-primary bg-white border border-border/50 px-2 py-0.5 rounded-md shadow-sm">{model}</span>
                      )) : <span className="text-xs text-muted-foreground">Various Brands</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Traits */}
            <div className="w-full bg-primary rounded-2xl p-6 text-primary-foreground grid grid-cols-4 gap-4 text-center mt-4">
              <div className="flex flex-col items-center gap-2">
                <Shield className="w-6 h-6 text-white/80" />
                <span className="text-[9px] font-black tracking-widest uppercase leading-tight">FULLY<br/>INSURED</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Settings className="w-6 h-6 text-white/80" />
                <span className="text-[9px] font-black tracking-widest uppercase leading-tight">QUALITY<br/>WORKMANSHIP</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-white/80" />
                <span className="text-[9px] font-black tracking-widest uppercase leading-tight">PROFESSIONAL<br/>SERVICE</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Headset className="w-6 h-6 text-white/80" />
                <span className="text-[9px] font-black tracking-widest uppercase leading-tight">AFTER SALES<br/>SUPPORT</span>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="w-full pt-4">
               <EpcContactButtons
                  epcId={installer.id}
                  companyName={installer.companyName}
                  userId={installer.userId}
                  website={installer.website}
                  whatsappNumber={whatsappNumber}
                />
            </div>

          </aside>

          {/* ── RIGHT CONTENT (2/3) ── */}
          <section className="lg:col-span-2 space-y-12">
            
            {/* About Us */}
            <div>
              <h2 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">ABOUT US</h2>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-lg text-foreground/80 leading-relaxed font-medium">
                  {installer.about ? (
                    <p>{installer.about}</p>
                  ) : (
                    <p>
                      We are a professional solar installation company committed to delivering high-quality, reliable and affordable solar energy solutions for homes and businesses. Our goal is to help you save on energy bills while contributing to a cleaner and greener future.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Installer Projects Videos */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </div>
                <h2 className="text-xl font-black text-primary uppercase tracking-widest flex-1">INSTALLER PROJECTS VIDEOS</h2>
                <div className="h-px bg-border flex-1 max-w-[100px] hidden md:block"></div>
              </div>

              {youtubeProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {youtubeProjects.slice(0, 3).map((project, i) => {
                    const videoId = getYouTubeId((project as any).youtubeUrl);
                    return (
                      <div key={project.id} className="rounded-2xl overflow-hidden aspect-video bg-black relative group shadow-sm border border-border">
                        {videoId ? (
                          <>
                            <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt={project.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <a href={(project as any).youtubeUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-primary ml-1" />
                              </div>
                            </a>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              {project.name}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-white/50 text-xs">Invalid URL</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic bg-secondary/10 p-6 rounded-2xl text-center border border-border border-dashed">
                  No video projects uploaded yet.
                </div>
              )}
            </div>

            {/* Testimonials */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-black text-primary uppercase tracking-widest flex-1">TESTIMONIALS</h2>
                <div className="h-px bg-border flex-1 max-w-[100px] hidden md:block"></div>
              </div>

              <div className="mb-6">
                <ReviewForm targetId={id} targetType="epc" />
              </div>
              <ReviewList targetId={id} />
            </div>

            {/* Hire Me Banner */}
            <div className="bg-primary rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-primary-foreground shadow-xl relative overflow-hidden">
               {/* Decorative background circle */}
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
               
               <div className="flex items-center gap-6 relative z-10">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shrink-0">
                   <ShieldCheck className="w-10 h-10 text-primary" />
                 </div>
                 <div>
                   <h2 className="text-4xl font-black text-yellow-400 tracking-tight mb-2">HIRE ME</h2>
                   <p className="text-white/90 font-medium">Let&apos;s talk about your solar needs.</p>
                   <p className="text-white/70 text-sm">Get a free consultation and quote today!</p>
                 </div>
               </div>

               <div className="space-y-3 relative z-10">
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                   <span className="font-bold text-sm tracking-wide">FREE SITE SURVEY</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                   <span className="font-bold text-sm tracking-wide">BEST PRICE GUARANTEE</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                   <span className="font-bold text-sm tracking-wide">CUSTOM SOLUTIONS</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                   <span className="font-bold text-sm tracking-wide">100% CUSTOMER SATISFACTION</span>
                 </div>
               </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}
