import { db } from "@/db";
import { brands, products, productSerials, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Package, Hash, Plus, Globe, ShieldCheck, AlertTriangle } from "lucide-react";
import { bulkImportSerials } from "@/lib/actions/serials";
import { BrandGalleryUpload } from "@/components/dashboard/brand-gallery-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star } from "lucide-react";
import { DashboardInquiryList } from "@/components/dashboard/inquiry-list";
import { DashboardReviewList } from "@/components/dashboard/dashboard-review-list";
import { updateBrandProfile } from "@/lib/actions/brand";
import { getBrandCompleteness } from "@/lib/utils/completeness";
import { SocialLinksForm } from "@/components/dashboard/social-links-form";
import { AddProductDialog } from "@/components/dashboard/AddProductDialog";
import { BrandRepsForm } from "@/components/dashboard/BrandRepsForm";

export default async function BrandDashboard() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const role = await getUserRole();
    if (role !== 'brand') {
        redirect("/dashboard");
    }

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) redirect("/dashboard");

    let [myBrand] = await db.select().from(brands).where(eq(brands.userId, dbUser.id));

    // Auto-create Brand profile if it doesn't exist
    if (!myBrand) {
        [myBrand] = await db.insert(brands).values({
            userId: dbUser.id,
            brandName: dbUser.name || "My Brand",
            isVerified: true,
        }).returning();
    }

    const brandProducts = await db.select({
        product: products,
        serialCount: count(productSerials.id)
    })
        .from(products)
        .leftJoin(productSerials, eq(productSerials.productId, products.id))
        .where(eq(products.brandId, myBrand.id))
        .groupBy(products.id);

    const { score, missing } = getBrandCompleteness(myBrand, brandProducts.length);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {score < 50 && (
                <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-red-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-wider">Public Visibility Restrained</h4>
                        <p className="text-xs text-red-700/80 font-bold mt-0.5">Your profile is currently hidden from public search directories and detail pages. You must complete at least **50%** of your profile (currently at **{score}%**) to become visible to clients.</p>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{myBrand.brandName}</h1>
                    <p className="text-muted-foreground">Brand Management Portal & Product Verification</p>
                </div>
            </div>

            {/* Profile Completeness Score Card */}
            <div className="bg-white/50 backdrop-blur-xl border border-border/50 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-black uppercase tracking-widest text-[11px] opacity-60">Profile Completeness</span>
                        <span className={`font-black px-3 py-1 rounded-xl text-xs border ${score === 100 ? "bg-green-100 text-green-600 border-green-200" :
                            score >= 70 ? "bg-blue-100 text-blue-600 border-blue-200" :
                                "bg-orange-100 text-orange-600 border-orange-200"
                            }`}>
                            {score}% Complete
                        </span>
                    </div>
                    <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${score === 100 ? "bg-green-500" :
                                score >= 70 ? "bg-blue-500" :
                                    "bg-orange-500"
                                }`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>

                {missing.length > 0 ? (
                    <div className="text-xs md:text-right max-w-sm">
                        <span className="font-bold text-muted-foreground block mb-1">Missing Checkpoints to hit 100%:</span>
                        <span className="text-muted-foreground font-medium">
                            {missing.join(", ")}
                        </span>
                    </div>
                ) : (
                    <div className="text-xs md:text-right">
                        <span className="font-black text-green-600 block mb-1">🎉 Perfectly Complete Profile!</span>
                        <span className="text-muted-foreground font-medium">Your brand details are fully populated and optimized for public searches.</span>
                    </div>
                )}
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-secondary/20 rounded-xl mb-8">
                    <TabsTrigger value="profile" className="rounded-lg font-bold gap-2">
                        <Building2 className="w-4 h-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="products" className="rounded-lg font-bold gap-2">
                        <Package className="w-4 h-4" /> Products
                    </TabsTrigger>
                    <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-2">
                        <MessageSquare className="w-4 h-4" /> Inquiries
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-lg font-bold gap-2">
                        <Star className="w-4 h-4" /> Reviews
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle>Brand Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={updateBrandProfile} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Brand Name</label>
                                        <input name="brandName" defaultValue={myBrand.brandName} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Head Office Address</label>
                                        <input name="headOffice" defaultValue={myBrand.headOffice || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" placeholder="123 Energy St, Solar City" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Country Head Name</label>
                                            <input name="countryHead" defaultValue={myBrand.countryHead || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Customer Care Lead</label>
                                            <input name="customerCareHead" defaultValue={myBrand.customerCareHead || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Customer Care Number</label>
                                            <input name="customerCare" defaultValue={myBrand.customerCare || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Official Website</label>
                                            <input name="website" defaultValue={myBrand.website || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                        </div>
                                    </div>
                                    <BrandRepsForm initialReps={(myBrand.reps as any[]) || []} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Warranty Registry URL</label>
                                            <input name="warrantyUrl" defaultValue={myBrand.warrantyUrl || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">QR Verification URL</label>
                                            <input name="qrUrl" defaultValue={myBrand.qrUrl || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2">Update Profile</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle>Media & Socials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <BrandGalleryUpload initialPhotos={myBrand.photos} />

                                <div className="pt-6 border-t">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 block">Social Media Presence</label>
                                    <SocialLinksForm type="brand" initialLinks={(myBrand.socialLinks as any[]) || []} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" /> Product Ecosystem
                        </h2>
                        <AddProductDialog />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {brandProducts.map(({ product, serialCount }) => (
                            <Card key={product.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{product.category}</span>
                                                <h4 className="font-bold text-xl">{product.name}</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{product.description || "No model description"}</p>
                                        </div>
                                        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Hash className="w-3 h-3" /> {serialCount} Serials Active
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-secondary/10">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 block">Bulk Serial Injection</label>
                                        <form action={async (formData) => {
                                            "use server";
                                            const raw = formData.get("serials") as string;
                                            await bulkImportSerials(product.id, raw);
                                        }} className="space-y-3">
                                            <textarea
                                                name="serials"
                                                rows={3}
                                                placeholder="Paste serial numbers...&#10;SN-882-991&#10;SN-882-992"
                                                className="w-full border rounded-2xl p-4 text-sm bg-secondary/5 focus:ring-2 focus:ring-primary outline-none font-mono"
                                            />
                                            <Button type="submit" variant="secondary" className="w-full rounded-xl font-bold h-11">
                                                <ShieldCheck className="w-4 h-4 mr-2" /> Verify & Import Codes
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="inquiries">
                    <div className="max-w-3xl">
                        <DashboardInquiryList receiverId={dbUser.id} />
                    </div>
                </TabsContent>

                <TabsContent value="reviews">
                    <div className="max-w-3xl">
                        <DashboardReviewList targetId={myBrand.id} targetType="brand" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
