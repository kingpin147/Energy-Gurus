import { db } from "@/db";
import { brands } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { ShieldCheck, Star, ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { count } from "drizzle-orm";

export default async function BrandsListingPage() {
    const cacheKey = CACHE_KEYS.BRANDS_LIST;
    let brandList: any[] | null = await redis.get(cacheKey);

    if (!brandList) {
        brandList = await db.select().from(brands).orderBy(brands.brandName);
        await redis.set(cacheKey, brandList, { ex: 3600 });
        console.log("🗄️ Public Brands Cache Miss");
    } else {
        console.log("🚀 Public Brands Cache Hit");
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-3xl mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Solar & Energy Brands</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Explore leading solar manufacturers and energy solution providers. 
                    Access technical datasheets, verify product authenticity, and connect with brand representatives.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {brandList.map((brand) => (
                    <Link
                        key={brand.id}
                        href={`/brands/${brand.id}` as any}
                        className="group"
                    >
                        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-secondary/5 rounded-2xl">
                            <div className="aspect-[16/9] bg-white relative flex items-center justify-center p-8">
                                {brand.logoUrl ? (
                                    <img 
                                        src={brand.logoUrl} 
                                        alt={brand.brandName}
                                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                    />
                                ) : (
                                    <ShieldCheck className="w-16 h-16 text-primary/20" />
                                )}
                                <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                                    Official Brand
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                        {brand.brandName}
                                    </h2>
                                    <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-xs font-bold ml-1">4.9</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                    Leading provider of high-efficiency solar modules and energy storage systems for industrial and residential use.
                                </p>
                                <div className="flex items-center justify-between text-xs font-medium border-t pt-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Verified Products</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Active Support</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {brandList.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-secondary/10 rounded-3xl border-2 border-dashed">
                        <ShieldCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-medium text-muted-foreground">No brands registered yet.</h3>
                        <p className="text-sm text-muted-foreground mt-2">Are you a brand? Register via the dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
