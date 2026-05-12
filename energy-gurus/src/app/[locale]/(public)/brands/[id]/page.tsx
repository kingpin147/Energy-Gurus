import { db } from "@/db";
import { brands, products, reviews } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Globe, Mail, Phone, ShieldCheck, Star, Download, QrCode, CheckCircle2, ArrowLeft, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
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

    // Cache Fetching Logic
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
        // Cache for 1 hour
        await redis.set(cacheKey, brandData, { ex: 3600 });
        console.log(`🗄️ Brand Profile Cache Miss: ${id}`);
    } else {
        console.log(`🚀 Brand Profile Cache Hit: ${id}`);
    }

    if (!brandData) return notFound();

    const { brand, products: brandProducts, reviews: brandReviews } = brandData;

    const { rating, count } = await getProfileRating(id);

    return (
        <div className="container mx-auto py-12 px-4">
            <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
                <Link href="/brands">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Brands
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Info & Products */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="w-32 h-32 rounded-2xl border shadow-sm bg-white p-4 flex items-center justify-center overflow-hidden">
                            {brand.logoUrl ? (
                                <img src={brand.logoUrl} className="max-h-full max-w-full object-contain" alt={brand.brandName} />
                            ) : (
                                <ShieldCheck className="w-12 h-12 text-primary/20" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold">{brand.brandName}</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="ml-1 font-bold text-foreground">{rating?.toFixed(1) || "5.0"} ({count} Reviews)</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1.5 text-primary font-medium">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>{brand.isVerified ? "Verified Partner" : "Registered Brand"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue={tab || "products"} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-secondary/20 rounded-xl mb-8">
                            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Product Showcase</TabsTrigger>
                            <TabsTrigger value="verification" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Verification</TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Reviews</TabsTrigger>
                            <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">About</TabsTrigger>
                        </TabsList>

                        <TabsContent value="products" className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {brandProducts.map((product: typeof products.$inferSelect) => (
                                    <Card key={product.id} className="border-none shadow-sm bg-secondary/5 overflow-hidden rounded-2xl">
                                        <CardHeader className="p-6 pb-2">
                                            {product.imageUrl && (
                                                <div className="aspect-video w-full mb-4 rounded-xl overflow-hidden border">
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <CardTitle className="text-xl">{product.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-2 space-y-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {product.description || "High-performance solar product with advanced technology."}
                                            </p>
                                            <div className="flex gap-3">
                                                {product.datasheetUrl && (
                                                    <Button variant="outline" size="sm" className="w-full gap-2 rounded-full" asChild>
                                                        <a href={product.datasheetUrl} target="_blank"><Download className="w-4 h-4" /> Datasheet</a>
                                                    </Button>
                                                )}
                                                <Button variant="secondary" size="sm" className="w-full gap-2 rounded-full" asChild>
                                                    <Link href={`/brands/${brand.id}?tab=verification&sn=${product.serialNumber}`}>
                                                        <ShieldCheck className="w-4 h-4" /> Verify
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {brandProducts.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl">
                                        <p className="text-muted-foreground font-medium">No products listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="verification">
                            <Card className="border-none shadow-sm bg-secondary/5 rounded-3xl p-8">
                                <VerificationTool brandName={brand.brandName} defaultSN={sn} />
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold uppercase tracking-widest opacity-60">Latest Feedback</h3>
                                    <ReviewList targetId={id} />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold uppercase tracking-widest opacity-60">Write a Review</h3>
                                    <ReviewForm targetId={id} targetType="brand" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="about" className="space-y-12">
                            <section>
                                <h3 className="text-2xl font-bold mb-4">About the Brand</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {brand.about || `${brand.brandName} is committed to delivering excellence in sustainable energy solutions.`}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold mb-6">Brand Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(brand.photos as string[])?.map((url, i) => (
                                        <div key={i} className="aspect-square rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <img src={url} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    ))}
                                    {(!brand.photos || (brand.photos as string[]).length === 0) && (
                                        <p className="col-span-full text-muted-foreground text-sm italic py-8 text-center bg-secondary/5 rounded-3xl border-2 border-dashed">
                                            No showcase photos uploaded yet.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold mb-6">Brand Representatives</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(brand.reps as { name: string; designation: string }[])?.map((rep, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white border rounded-2xl shadow-sm">
                                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                                                <span className="font-bold text-primary">{rep.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold">{rep.name}</p>
                                                <p className="text-sm text-muted-foreground">{rep.designation}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!brand.reps || (brand.reps as any[]).length === 0) && (
                                        <p className="text-muted-foreground text-sm italic">No representatives listed yet.</p>
                                    )}
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Support & Contact */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-bold">Contact Brand</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Customer Care</p>
                                        <p className="text-lg font-medium">{brand.customerCare || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-accent" />
                                    <div>
                                        <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Website</p>
                                        <a href={brand.website || "#"} target="_blank" className="text-lg font-medium hover:underline">{brand.website ? new URL(brand.website).hostname : "N/A"}</a>
                                    </div>
                                </div>

                                {brand.socialLinks && (brand.socialLinks as any[]).length > 0 && (
                                    <div className="flex justify-center gap-4 pt-6 border-t border-white/10">
                                        {(brand.socialLinks as { platform: string; url: string }[]).map((link, i) => {
                                            const Icon = link.platform === "Facebook" ? Facebook : 
                                                        link.platform === "Twitter" ? Twitter : 
                                                        link.platform === "Instagram" ? Instagram : 
                                                        link.platform === "LinkedIn" ? Linkedin : Globe;
                                            return (
                                                <a key={i} href={link.url} target="_blank" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                                    <Icon className="w-5 h-5 text-accent" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="accent" className="w-full h-14 rounded-2xl font-bold text-lg gap-2">
                                        <Mail className="w-5 h-5" /> Send InMail
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold mb-4">Contact {brand.brandName}</DialogTitle>
                                    </DialogHeader>
                                    <ContactForm receiverId={brand.userId} receiverName={brand.brandName} />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-secondary/5 rounded-3xl">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold">Ratings & Reviews</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-bold leading-none">{rating?.toFixed(1) || "5.0"}</span>
                                <div className="flex flex-col gap-1">
                                    <div className="flex text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${Number(rating) >= s ? "fill-current" : "opacity-30"}`} />)}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Out of 5.0</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl font-bold" asChild>
                                <Link href={`/brands/${brand.id}?tab=reviews`}>
                                    View All Reviews
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
