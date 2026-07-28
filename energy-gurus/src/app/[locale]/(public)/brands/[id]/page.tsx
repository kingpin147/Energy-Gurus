import { db } from "@/db";
import { brands, products, brandCertifications, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBrandCompleteness } from "@/lib/utils/completeness";
import { Star, ShieldCheck, ArrowLeft, Zap, Shield, Award, Package, CheckCircle2, Info, HeadphonesIcon, Building2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating } from "@/lib/actions/reviews";
import { SocialLinkTracker } from "@/components/brands/SocialLinkTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductVerification } from "@/components/brands/ProductVerification";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { BrandContactButtons } from "@/components/shared/BrandContactButtons";

type Brand = InferSelectModel<typeof brands>;
type Product = InferSelectModel<typeof products>;
type Certification = InferSelectModel<typeof brandCertifications>;

interface BrandProfileData {
  brand: Brand;
  brandProducts: Product[];
  certifications: Certification[];
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
  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, id),
  });

  if (!brand) return {};

  const title = `${brand.brandName} | Solar Manufacturer | Energy Gurus`;
  const description = brand.about?.slice(0, 160) || `Explore ${brand.brandName}'s high-efficiency solar products and technical specifications on Energy Gurus.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: brand.logoUrl ? [{ url: brand.logoUrl, width: 800, height: 800, alt: brand.brandName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: brand.logoUrl ? [brand.logoUrl] : [],
    }
  };
}

export default async function BrandProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cacheKey = CACHE_KEYS.BRAND_DETAILS(id);
  let profileData: BrandProfileData | null = await redis.get<BrandProfileData>(cacheKey);

  if (!profileData) {
    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!brand) {
      console.log(`[Brand Profile] 404: Brand not found for id ${id}`);
      notFound();
    }

    const [userData] = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, brand.userId));
    if (!userData?.isActive) {
      console.log(`[Brand Profile] 404: User is not active for brand id ${id}`);
      notFound();
    }

    const brandProducts = await db.select().from(products).where(eq(products.brandId, id));
    const certifications = await db.select().from(brandCertifications).where(eq(brandCertifications.brandId, id));
    const { rating, count } = await getProfileRating(id);

    profileData = { brand, brandProducts, certifications, rating, count, isActive: userData.isActive };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData) {
    console.log(`[Brand Profile] 404: Profile data could not be built for id ${id}`);
    return notFound();
  }

  const { brand, brandProducts, certifications, rating, count, isActive } = profileData;

  if (!isActive) {
    console.log(`[Brand Profile] 404: User is not active for brand id ${id}`);
    notFound();
  }

  // Enforce 50% completeness score threshold
  const { score } = getBrandCompleteness(brand, brandProducts.length);
  if (score < 50) {
    console.log(`[Brand Profile] 404: Completeness score is ${score} (below 50) for brand id ${id}`);
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand.brandName,
    "description": brand.about || `Verified global solar manufacturer: ${brand.brandName}`,
    "logo": brand.logoUrl || undefined,
    "url": brand.website || undefined,
    "aggregateRating": rating && count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": rating.toFixed(1),
      "reviewCount": count
    } : undefined
  };

  return (
    <div className="min-h-screen bg-paper text-graphite selection:bg-amber/20 text-ink pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[50%] h-[40%] bg-amber/5 text-ink rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[30%] bg-paper/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-10 relative z-10">
        <Button variant="ghost" className="group p-0 hover:bg-transparent text-slate-custom hover:text-amber transition-all font-black uppercase tracking-[0.2em] text-[10px]" asChild>
          <Link href="/brands">
            <ArrowLeft className="mr-3 w-4 h-4 group-hover:-translate-x-2 transition-transform" /> Global Network
          </Link>
        </Button>
      </nav>

      {/* BRAND HERO */}
      <section className="container mx-auto px-6 mb-24 relative z-10">
        <div className="relative rounded-[4rem] overflow-hidden border border-line/50 premium-shadow bg-white/40 backdrop-blur-3xl p-10 md:p-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

          <div className="flex flex-col items-center text-center gap-16 relative z-10">
            {/* Brand Identity */}
            <div className="relative group">
              <div className="absolute inset-0 bg-amber/20 text-ink rounded-[3.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-[4rem] border-2 border-white/50 bg-white p-12 flex items-center justify-center overflow-hidden shadow-2xl relative z-10 transition-transform duration-1000 group-hover:scale-105">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} className="max-h-full max-w-full object-contain filter drop-shadow-lg" alt={brand.brandName} />
                ) : (
                  <ShieldCheck className="w-24 h-24 text-amber/10" />
                )}
              </div>
            </div>

            {/* Narrative Header */}
            <div className="flex-1 space-y-8 max-w-4xl">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {brand.isVerified && (
                    <span className="px-5 py-2 bg-amber/10 text-ink text-amber rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber/20 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Tier-1 Verified
                    </span>
                  )}
                  <span className="px-5 py-2 bg-paper/5 text-ink rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-line/50">
                    Global Manufacturer
                  </span>
                </div>

                <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] text-graphite">
                  {brand.brandName}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                  {count > 0 ? (
                    <div className="flex items-center gap-4 px-6 py-3 bg-white/50 rounded-2xl border border-line/50 shadow-sm">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-6 h-6 fill-current" />
                        <span className="ml-2 text-3xl font-black text-graphite">{rating?.toFixed(1)}</span>
                      </div>
                      <div className="h-10 w-[1px] bg-border/50" />
                      <span className="text-[11px] font-black text-slate-custom uppercase tracking-[0.2em]">
                        {count} Customer Audits
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-custom text-[10px] font-black uppercase tracking-[0.2em] bg-white/30 px-6 py-3 rounded-2xl border border-dashed border-line/50">
                      Market Rating: N/A
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* MAIN CONTENT STREAM */}
          <div className="lg:col-span-8 space-y-32">

            {/* Brand Legacy / About */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-3 h-12 bg-amber text-ink rounded-full shadow-[0_0_30px_rgba(0,109,109,0.5)]" />
                <h2 className="text-5xl font-black tracking-tighter uppercase">Brand Philosophy</h2>
              </div>
              <div className="bg-white/50 backdrop-blur-2xl p-12 md:p-20 rounded-[4rem] border border-line/50 shadow-sm relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber/5 text-ink rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150" />
                <p className="text-2xl md:text-3xl leading-relaxed text-graphite font-medium italic opacity-90 relative z-10">
                  “{brand.about || "Manufacturer statement and global vision details are currently being finalized for verification."}”
                </p>
              </div>
            </section>

            {/* Product & Verification Tabs */}
            <Tabs defaultValue="portfolio" className="w-full space-y-12">
              <TabsList className="h-16 p-1 bg-white/50 backdrop-blur-xl border border-line/50 rounded-2xl inline-flex w-auto mb-8">
                <TabsTrigger value="portfolio" className="px-8 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-amber text-ink data-[state=active]:text-white">
                  <Package className="w-4 h-4" /> Portfolio
                </TabsTrigger>
                <TabsTrigger value="verification" className="px-8 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-amber text-ink data-[state=active]:text-white">
                  <ShieldCheck className="w-4 h-4" /> Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-12 outline-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-3 h-12 bg-amber text-ink rounded-full shadow-[0_0_30px_rgba(0,109,109,0.5)]" />
                    <h2 className="text-5xl font-black tracking-tighter uppercase text-gradient">Product Portfolio</h2>
                  </div>
                  <div className="hidden md:flex items-center gap-3 px-6 py-2 bg-paper/10 rounded-full border border-line/50 text-[10px] font-black uppercase tracking-widest opacity-40">
                    <Package className="w-4 h-4" /> {brandProducts.length} Certified Units
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {brandProducts.map((product) => (
                    <div key={product.id} className="group relative rounded-[3.5rem] overflow-hidden bg-white border border-line/50 premium-shadow transition-all duration-700 hover:-translate-y-4">
                      <div className="aspect-[4/3] relative overflow-hidden bg-paper/5 p-8 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-out" alt={product.name} />
                        ) : (
                          <Zap className="w-24 h-24 text-amber/5" />
                        )}
                        <div className="absolute bottom-8 left-8 right-8">
                          <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center justify-between border border-line/50 shadow-xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber">Certified Spec</span>
                            <CheckCircle2 className="w-4 h-4 text-amber" />
                          </div>
                        </div>
                      </div>

                      <div className="p-12 space-y-8">
                        <div className="space-y-3">
                          <h4 className="text-3xl font-black tracking-tight leading-none">{product.name}</h4>
                          <p className="text-slate-custom font-bold text-xs uppercase tracking-[0.2em] opacity-40">Series: {product.series || "Standard"}</p>
                        </div>

                        <div className="py-8 border-y border-line/50">
                          <p className="text-sm text-slate-custom leading-relaxed font-medium">
                            {product.description || "Detailed technical specifications for this unit are available upon request through verified channels."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <Button variant="outline" className="h-14 rounded-2xl border-amber/20 text-amber font-black uppercase tracking-widest text-[10px] hover:bg-amber/5 text-ink transition-all" asChild>
                            <a href={product.datasheetUrl || "#"} target="_blank">
                              Datasheet
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {brandProducts.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white/40 backdrop-blur-xl rounded-[4rem] border-4 border-dashed border-line/50">
                      <Package className="w-20 h-20 text-amber/10 mx-auto mb-8" />
                      <p className="text-2xl font-black text-slate-custom tracking-tighter">Inventory Architecture: N/A</p>
                      <p className="text-[10px] text-slate-custom/40 uppercase tracking-[0.3em] mt-3">Syncing with global logistics</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="verification" className="outline-none">
                <ProductVerification brandId={brand.id} />
              </TabsContent>
            </Tabs>

            {/* Certifications & Compliance */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-3 h-12 bg-amber text-ink rounded-full shadow-[0_0_30px_rgba(0,109,109,0.5)]" />
                <h2 className="text-5xl font-black tracking-tighter uppercase">Compliance Network</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {certifications.map((cert) => (
                  <div key={cert.id} className="p-10 bg-white/50 backdrop-blur-xl border border-line/50 rounded-[3rem] flex flex-col gap-6 shadow-sm group hover:border-amber transition-all duration-700">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-amber/5 text-ink rounded-2xl flex items-center justify-center border border-amber/10 group-hover:bg-amber text-ink transition-colors duration-700">
                        <Award className="w-8 h-8 text-amber group-hover:text-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-2xl tracking-tight leading-none">{cert.name}</h4>
                        <p className="text-[10px] font-bold text-slate-custom uppercase tracking-[0.2em]">{cert.issuingBody || "Verified Agency"}</p>
                      </div>
                    </div>
                    {cert.expiryDate && (
                      <div className="pt-6 border-t border-line/30 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="opacity-40">VALID UNTIL</span>
                        <span className="text-amber">{new Date(cert.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}

                {certifications.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-paper/5 rounded-[3rem] border border-dashed border-accent/20">
                    <Shield className="w-12 h-12 text-amber/10 mx-auto mb-4" />
                    <p className="text-sm font-black text-ink/30 uppercase tracking-[0.3em]">Compliance Portfolio: N/A</p>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-3 h-12 bg-amber text-ink rounded-full shadow-[0_0_30px_rgba(0,109,109,0.5)]" />
                <h2 className="text-5xl font-black tracking-tighter uppercase">Market Feedback</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="bg-amber/5 text-ink p-12 rounded-[3.5rem] border border-amber/10 premium-shadow">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4">
                      <Award className="w-6 h-6 text-amber" /> Audit Experience
                    </h3>
                    <ReviewForm targetId={id} targetType="brand" />
                  </div>
                </div>
                <div className="space-y-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 border-b border-line/50 pb-6">Verified Global Audits</h3>
                  <ReviewList targetId={id} />
                </div>
              </div>
            </section>
          </div>

          {/* ACTION SIDEBAR */}
          <div className="lg:col-span-4">
            <aside className="sticky top-12 space-y-10">
              {/* Executive Contact Card */}
              <Card className="border-none shadow-2xl bg-[#0F172A] text-white rounded-[4rem] overflow-hidden">
                <CardContent className="p-12 space-y-12">
                  <div className="space-y-4">
                    <div className="w-14 h-14 bg-amber/20 text-ink rounded-2xl flex items-center justify-center mb-8">
                      <Zap className="w-7 h-7 text-amber" />
                    </div>
                    <h3 className="text-4xl font-black tracking-tighter leading-none">Manufacturer Support</h3>
                    <p className="text-white/40 text-sm font-medium leading-relaxed">
                      Connect with {brand.brandName}&apos;s regional representatives for bulk procurement and technical support.
                    </p>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 leading-none">Regional Head</p>
                        <p className="text-xl font-black flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-amber" /> {brand.countryHead || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 leading-none">Customer Care</p>
                        <p className="text-xl font-black flex items-center gap-3 text-amber">
                          <HeadphonesIcon className="w-5 h-5" /> {brand.customerCare || brand.customerCareHead || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Representatives List */}
                  {brand.reps && (brand.reps as any[]).length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 leading-none mb-4">Official Representatives</p>
                      <div className="space-y-4">
                        {(brand.reps as { name: string; designation: string }[]).map((rep, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-amber/20 text-ink rounded-xl flex items-center justify-center font-black text-amber uppercase">
                              {rep.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black leading-none">{rep.name}</p>
                              <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">{rep.designation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <BrandContactButtons
                    brandId={brand.id}
                    brandName={brand.brandName}
                    userId={brand.userId}
                    website={brand.website}
                    whatsappNumber={(brand.socialLinks as { platform: string; url: string }[] | null)?.find(l => l.platform === "WhatsApp")?.url.replace(/\D/g, "") ?? null}
                  />

                  {/* Social Network */}
                  {brand.socialLinks && (brand.socialLinks as any[]).length > 0 && (
                    <div className="flex justify-center gap-5 pt-10 border-t border-white/5">
                      {(brand.socialLinks as { platform: string; url: string }[]).map((link, i) => (
                        <SocialLinkTracker
                          key={i}
                          link={link}
                          id={brand.id}
                          name={brand.brandName}
                          type="brand"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Integrity Metric Widget */}
              <div className="p-12 rounded-[4rem] bg-paper/5 border border-accent/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-paper/5 rounded-bl-full group-hover:scale-125 transition-transform duration-1000" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ink mb-6 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Supply Chain Metrics
                </h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-40">System Integration</span>
                    <span className="text-ink">Global Standard</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-40">Market Presence</span>
                    <span className="text-ink">Tier-1 Rank</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-40">Authenticity</span>
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
