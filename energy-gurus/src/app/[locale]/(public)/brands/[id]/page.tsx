import { db } from "@/db";
import { brands, products, reviews } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Globe, Mail, Phone, ShieldCheck, Star, Download, QrCode, CheckCircle2, ArrowLeft, Facebook, Twitter, Instagram, Linkedin, MessageSquare, Zap, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/routing";
import { ContactForm } from "@/components/forms/contact-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating } from "@/lib/actions/reviews";
import { VerificationTool } from "@/components/verification/verification-tool";
import { redis, CACHE_KEYS } from "@/lib/redis";

interface BrandData {
    brand: typeof brands.$inferSelect;
    products: (typeof products.$inferSelect)[];
    reviews: (typeof reviews.$inferSelect)[];
}

export default async function BrandProfilePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ sn?: string, tab?: string }> }) {
    const { id } = await params;
    const { sn, tab } = await searchParams;

    const cacheKey = CACHE_KEYS.BRAND_DETAILS(id);
    let brandData: BrandData | null = await redis.get(cacheKey);

    if (!brandData) {
        const [brand] = await db.select().from(brands).where(eq(brands.id, id));
        if (!brand) notFound();

        const brandProducts = await db.select().from(products).where(eq(products.brandId, id));
        const brandReviews = await db.select().from(reviews).where(
            and(
                eq(reviews.targetId, id),
                eq(reviews.targetType, 'brand')
            )
        ).orderBy(desc(reviews.createdAt)).limit(3);

        brandData = { brand, products: brandProducts, reviews: brandReviews };
        await redis.set(cacheKey, brandData, { ex: 3600 });
    }

    if (!brandData) return notFound();

    const { brand, products: brandProducts } = brandData;
    const { rating, count } = await getProfileRating(id);

    const categories = ["Solar Panels", "Inverters", "Batteries"];

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
            <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
                <Link href="/brands">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Brands
                </Link>
            </Button>

            {/* TOP SECTION: Brand Header */}
            <div className="bg-white rounded-[3rem] border shadow-2xl p-8 md:p-12 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-10 relative z-10">
                    <div className="w-48 h-48 rounded-[2.5rem] border-4 border-primary/10 shadow-xl bg-white p-8 flex items-center justify-center overflow-hidden shrink-0">
                        {brand.logoUrl ? (
                            <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" alt={brand.brandName} />
                        ) : (
                            <ShieldCheck className="w-20 h-20 text-primary/10" />
                        )}
                    </div>
                    
                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight">{brand.brandName}</h1>
                            <div className="flex flex-wrap gap-6 items-center">
                                {brand.countryHead && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Country Head</p>
                                            <p className="font-bold text-sm">{brand.countryHead}</p>
                                        </div>
                                    </div>
                                )}
                                {brand.customerCareHead && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Customer Care Head</p>
                                            <p className="font-bold text-sm">{brand.customerCareHead}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex items-center text-yellow-500 bg-yellow-500/5 px-4 py-2 rounded-2xl border border-yellow-500/10">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="ml-2 font-black text-lg">{rating?.toFixed(1) || "5.0"} <span className="text-muted-foreground text-xs ml-1">({count} reviews)</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                                <ShieldCheck className="w-6 h-6" />
                                <span>{brand.isVerified ? "Verified Global Partner" : "Registered Brand"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* MIDDLE SECTION: Main Content */}
                <div className="lg:col-span-2 space-y-16">
                    
                    {/* About & Contact Card */}
                    <Card className="border-none shadow-sm bg-secondary/5 rounded-[3rem] p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black flex items-center gap-2">
                                    <Globe className="w-6 h-6 text-primary" /> Global Presence
                                </h3>
                                <p className="text-muted-foreground leading-relaxed italic text-lg">
                                    “{brand.about || `${brand.brandName} is committed to delivering excellence in sustainable energy solutions through cutting-edge technology and global standards.`}”
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black">Official Channels</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Direct Line</p>
                                            <p className="font-bold">{brand.customerCare || "Available on InMail"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Digital Portal</p>
                                            <a href={brand.website || "#"} target="_blank" className="font-bold hover:text-primary transition-colors">{brand.website ? new URL(brand.website).hostname : "N/A"}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Product Tabs Section */}
                    <Tabs defaultValue={tab || "products"} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-16 p-1.5 bg-secondary/20 rounded-[1.5rem] mb-12">
                            <TabsTrigger value="products" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Zap className="w-4 h-4" /> Product Ecosystem
                            </TabsTrigger>
                            <TabsTrigger value="verification" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <ShieldCheck className="w-4 h-4" /> Global Verification
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Star className="w-4 h-4" /> Ratings & Experience
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="products" className="space-y-16">
                            {categories.map(cat => {
                                const catProducts = brandProducts.filter(p => p.category === cat);
                                if (catProducts.length === 0) return null;
                                return (
                                    <div key={cat} className="space-y-8">
                                        <h3 className="text-3xl font-black flex items-center gap-3">
                                            <span className="w-1.5 h-8 bg-primary rounded-full" />
                                            {cat}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {catProducts.map(product => (
                                                <div key={product.id} className="rounded-[2.5rem] border bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all group border-secondary/10 flex flex-col">
                                                    <div className="aspect-[16/10] relative overflow-hidden bg-secondary/5">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Zap className="w-12 h-12 opacity-5 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-8 flex-1 flex flex-col">
                                                        <h4 className="text-2xl font-black mb-3">{product.name}</h4>
                                                        <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">
                                                            {product.description || "High-performance specialized energy solution designed for peak efficiency and longevity."}
                                                        </p>
                                                        
                                                        <div className="flex gap-3 pt-6 border-t border-secondary/10">
                                                            {product.datasheetUrl && (
                                                                <Button variant="outline" size="sm" className="flex-1 h-12 gap-2 rounded-2xl font-bold uppercase tracking-widest text-[10px]" asChild>
                                                                    <a href={product.datasheetUrl} target="_blank"><Download className="w-4 h-4" /> Datasheet</a>
                                                                </Button>
                                                            )}
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="secondary" size="sm" className="flex-1 h-12 gap-2 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                                                                        <MessageSquare className="w-4 h-4" /> Inquire
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="rounded-[3rem] p-10">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="text-3xl font-black mb-4">Inquire About {product.name}</DialogTitle>
                                                                    </DialogHeader>
                                                                    <ContactForm 
                                                                        receiverId={brand.userId} 
                                                                        receiverName={brand.brandName} 
                                                                        initialMessage={`I am interested in learning more about the ${product.name}. Please share technical specifications and availability.`}
                                                                    />
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </TabsContent>

                        <TabsContent value="verification">
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] p-12">
                                <div className="max-w-2xl mx-auto space-y-8 text-center">
                                    <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto">
                                        <QrCode className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black">Authentication Portal</h3>
                                        <p className="text-muted-foreground">Verify the authenticity of your {brand.brandName} products globally using serial or QR codes.</p>
                                    </div>
                                    <VerificationTool brandName={brand.brandName} defaultSN={sn} />
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-12">
                            <div className="bg-white p-12 rounded-[3rem] shadow-sm border space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    <div className="space-y-8">
                                        <h3 className="text-2xl font-black flex items-center gap-2">
                                            <Star className="w-6 h-6 text-primary" /> Performance Feedback
                                        </h3>
                                        <ReviewList targetId={id} />
                                    </div>
                                    <div className="space-y-8">
                                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                                            <h3 className="text-xl font-black uppercase tracking-widest mb-6">Rate Brand Experience</h3>
                                            <ReviewForm targetId={id} targetType="brand" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* RIGHT COLUMN: Sidebar / Action Center */}
                <div className="space-y-8">
                    <Card className="border-none shadow-2xl bg-[#0F172A] text-white rounded-[3rem] overflow-hidden sticky top-24">
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black">Partner Access</h3>
                                <p className="text-white/40 text-sm font-medium leading-relaxed">
                                    Direct communication channel for B2B inquiries and after-sales support.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                {(() => {
                                    const socialLinks = brand.socialLinks as { platform: string; url: string }[] | null;
                                    const whatsapp = socialLinks?.find(l => l.platform === "WhatsApp");

                                    if (whatsapp) {
                                        const waNumber = whatsapp.url.replace(/\D/g, "");
                                        return (
                                            <Button className="w-full h-16 rounded-2xl font-black text-lg bg-[#25D366] hover:bg-[#20bd5a] text-white gap-3 shadow-lg shadow-[#25D366]/20" asChild>
                                                <a href={`https://wa.me/${waNumber}`} target="_blank">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                    WhatsApp Global
                                                </a>
                                            </Button>
                                        );
                                    }
                                })()}

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-white hover:bg-primary/90 gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                            <Mail className="w-6 h-6" /> Send InMail
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10 border-none shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-3xl font-black mb-4">Official Inquiry</DialogTitle>
                                        </DialogHeader>
                                        <ContactForm receiverId={brand.userId} receiverName={brand.brandName} />
                                    </DialogContent>
                                </Dialog>

                                {brand.socialLinks && (brand.socialLinks as any[]).length > 0 && (
                                    <div className="flex justify-center gap-4 pt-6 border-t border-white/5">
                                        {(brand.socialLinks as { platform: string; url: string }[]).map((link, i) => {
                                            const Icon = link.platform === "Facebook" ? Facebook : 
                                                        link.platform === "Twitter" ? Twitter : 
                                                        link.platform === "Instagram" ? Instagram : 
                                                        link.platform === "LinkedIn" ? Linkedin : Globe;
                                            return (
                                                <a key={i} href={link.url} target="_blank" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5 group">
                                                    <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h4 className="text-[10px] font-black mb-6 uppercase tracking-widest opacity-30">Brand Integrity</h4>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Avg Rating</span>
                                        <div className="flex items-center gap-1 font-black text-yellow-400">
                                            <Star className="w-4 h-4 fill-current" /> {rating?.toFixed(1) || "5.0"}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Verified Partner</span>
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="opacity-40 font-bold uppercase tracking-widest text-[10px]">Member Since</span>
                                        <span className="font-black text-white/60">{new Date(brand.createdAt).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
