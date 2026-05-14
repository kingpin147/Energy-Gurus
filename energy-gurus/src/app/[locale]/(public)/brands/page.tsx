import { db } from "@/db";
import { brands, products, reviews, users } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { ShieldCheck, Star, Search, Zap, ArrowRight, Shield, Globe, Award } from "lucide-react";
import { redis } from "@/lib/redis";
import { SidebarVerification } from "@/components/brands/sidebar-verification";
import { ListSort } from "@/components/shared/list-sort";
import { desc, asc, eq, sql } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TrackedLink } from "@/components/shared/AnalyticsTracker";


export default async function BrandsListingPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>;
}) {
    const { sort } = await searchParams;
    const sortVal = sort || "latest";
    const BRANDS_LIST_CACHE_KEY = `brands:all:${sortVal}:v8`;

    let brandList: any[] | null = await redis.get(BRANDS_LIST_CACHE_KEY);

    if (!brandList) {
        const brandsData = await db
            .select({
                id: brands.id,
                brandName: brands.brandName,
                logoUrl: brands.logoUrl,
                about: brands.about,
                isVerified: brands.isVerified,
                createdAt: brands.createdAt,
                avgRating: sql<number>`CAST(AVG(${reviews.rating}) AS FLOAT)`.as('avg_rating'),
                reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
            })
            .from(brands)
            .innerJoin(users, eq(users.id, brands.userId))
            .leftJoin(reviews, eq(reviews.targetId, brands.id))
            .where(eq(users.isActive, true))
            .groupBy(brands.id)
            .orderBy((t) => {
                if (sort === "top-rated") return desc(t.avgRating);
                if (sort === "lowest-rated") return asc(t.avgRating);
                if (sort === "oldest") return asc(t.createdAt);
                return desc(t.createdAt);
            });

        const allProducts = await db.select().from(products);

        brandList = brandsData.map(brand => ({
            ...brand,
            products: allProducts.filter(p => p.brandId === brand.id).slice(0, 3)
        }));

        await redis.set(BRANDS_LIST_CACHE_KEY, brandList, { ex: 3600 });
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
            </div>

            <main className="container mx-auto px-6 py-20 relative z-10">
                {/* Hero Section */}
                <section className="mb-24 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-foreground text-xs font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700">
                        <Award className="w-4 h-4 text-yellow-500" /> Authenticity Guaranteed
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground animate-in fade-in slide-in-from-top-8 duration-1000">
                        Verified <span className="text-gradient">Brand Directory</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-80 animate-in fade-in slide-in-from-top-12 duration-1000">
                        Authenticate solar components instantly and connect with world-class manufacturers through our official global database.
                    </p>
                </section>

                <div className="flex flex-col xl:flex-row gap-16 items-start">
                    {/* Brand Listing Area */}
                    <div className="flex-1 w-full space-y-12">
                        <div className="flex flex-col md:flex-row items-center justify-between border-b border-border/50 pb-8 gap-6">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-foreground">
                                    Strategic Partners
                                </h2>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 block opacity-40">
                                    {brandList?.length || 0} Global Manufacturers Available
                                </span>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-72 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Search global brands..." 
                                        className="pl-12 h-14 bg-white/50 backdrop-blur-xl border-border/50 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all text-base font-medium shadow-sm" 
                                    />
                                </div>
                                <ListSort 
                                    options={[
                                        { label: "Newest Arrivals", value: "latest" },
                                        { label: "Elite Rating", value: "top-rated" },
                                    ]} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-10">
                            {brandList?.map((brand, index) => (
                                <article 
                                    key={brand.id} 
                                    className="group relative animate-in fade-in slide-in-from-bottom-8 duration-700"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    
                                    <Card className="border-border/50 bg-white/70 backdrop-blur-xl hover:bg-white/90 transition-all duration-500 overflow-hidden rounded-[3rem] relative z-10 premium-shadow border group-hover:border-primary/30 group-hover:-translate-y-2">
                                        <div className="p-8 md:p-12">
                                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-12">
                                                <div className="flex flex-col md:flex-row gap-8 flex-1 items-start md:items-center">
                                                    {/* Logo Wrapper */}
                                                    <div className="w-32 h-32 bg-white p-6 rounded-[2.5rem] border border-border/50 shadow-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-700">
                                                        {brand.logoUrl ? (
                                                            <img src={brand.logoUrl} alt={brand.brandName} className="max-h-full max-w-full object-contain filter drop-shadow-lg" />
                                                        ) : (
                                                            <ShieldCheck className="w-12 h-12 text-primary/10" />
                                                        )}
                                                    </div>

                                                    <div className="space-y-4 flex-1">
                                                        <div className="flex items-center gap-4 flex-wrap">
                                                            <h2 className="text-4xl font-black text-foreground tracking-tighter">
                                                                {brand.brandName}
                                                            </h2>
                                                            {brand.isVerified && (
                                                                <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                                                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent-foreground rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">
                                                                <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                                                                {brand.avgRating ? brand.avgRating.toFixed(1) : "N/A"}
                                                            </div>
                                                        </div>
                                                        <p className="text-lg text-muted-foreground leading-relaxed font-medium opacity-80 max-w-2xl">
                                                            {brand.about || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <TrackedLink 
                                                    href={`/brands/${brand.id}` as any} 
                                                    className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all duration-500 group/btn shadow-xl active:scale-95"
                                                    eventName="brand_portfolio_view"
                                                    eventProperties={{
                                                        brandId: brand.id,
                                                        brandName: brand.brandName
                                                    }}
                                                >
                                                    Access Portfolio <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                                </TrackedLink>
                                            </div>

                                            {/* Product Showcase */}
                                            <div className="bg-secondary/10 rounded-[2.5rem] p-8 md:p-10 border border-border/30">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">
                                                        Product Ecosystem
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {brand.products && brand.products.length > 0 ? (
                                                        brand.products.map((product: any) => (
                                                            <div key={product.id} className="group/item relative overflow-hidden rounded-[2rem] aspect-[16/10] bg-white border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-2xl transition-all duration-700">
                                                                {product.imageUrl ? (
                                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/item:scale-125" />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-white opacity-20">
                                                                        <Zap className="w-10 h-10 text-primary" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                                                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-8 group-hover/item:translate-y-0 transition-transform duration-500">
                                                                    <p className="text-white font-black text-sm tracking-tight">{product.name}</p>
                                                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Technical Standard</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full py-12 text-center text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.4em] border border-dashed border-border/50 rounded-[2rem]">
                                                            Inventory: N/A
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </article>
                            ))}
                        </div>

                        {(brandList?.length || 0) === 0 && (
                            <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[4rem] border-4 border-dashed border-border/50">
                                <Shield className="w-24 h-24 text-primary/10 mx-auto mb-8 animate-float" />
                                <h3 className="text-3xl font-black text-foreground tracking-tighter">Directory Empty</h3>
                                <p className="text-muted-foreground font-medium opacity-60 mt-4 text-lg">The verified brand ecosystem is currently undergoing a security update.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full xl:w-96 flex-shrink-0 xl:sticky xl:top-12 space-y-8">
                        {/* Verification Portal */}
                        <section className="bg-white/50 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-border/50 premium-shadow relative overflow-hidden group text-center">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-xs font-black text-primary mb-4 uppercase tracking-[0.3em] relative z-10">
                                Integrity Portal
                            </h3>
                            <p className="text-sm text-muted-foreground mb-10 leading-relaxed font-medium relative z-10 mx-auto max-w-sm">
                                Access the manufacturer-linked serial database to authenticate your energy infrastructure components globally.
                            </p>
                            <div className="relative z-10">
                                <SidebarVerification />
                            </div>
                        </section>

                        {/* Why Verified? */}
                        <section className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] border-b border-white/5 pb-6 mb-10">
                                Quality Standards
                            </h3>
                            <div className="space-y-10">
                                {[
                                    { icon: Shield, title: "Asset Protection", desc: "Eligible for performance warranties up to 30 years." },
                                    { icon: Zap, title: "Yield Optimization", desc: "Ensure modules perform at 100% of their rated power output." },
                                    { icon: Award, title: "Compliance", desc: "Meets Tier-1 international safety and fire hazard standards." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group/item">
                                        <div className="w-14 h-14 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center group-hover/item:bg-primary transition-all duration-500">
                                            <item.icon className="w-6 h-6 text-primary group-hover/item:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1 tracking-tight">{item.title}</h4>
                                            <p className="text-[12px] text-white/40 leading-relaxed font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
