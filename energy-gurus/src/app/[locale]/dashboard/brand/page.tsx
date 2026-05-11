import { db } from "@/db";
import { brands, products, productSerials, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Package, Hash, Plus, Globe, ShieldCheck } from "lucide-react";
import { bulkImportSerials } from "@/lib/actions/serials";
import { BrandGalleryUpload } from "@/components/dashboard/brand-gallery-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Star } from "lucide-react";
import { DashboardInquiryList } from "@/components/dashboard/inquiry-list";
import { DashboardReviewList } from "@/components/dashboard/dashboard-review-list";
import { addProductModel, updateBrandProfile } from "@/lib/actions/brand";

export default async function BrandDashboard() {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId) redirect("/sign-in");

    const role = (sessionClaims?.metadata as { role?: string })?.role || "user";
    if (role !== 'brand') {
        redirect("/dashboard");
    }

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) redirect("/dashboard");

    const [myBrand] = await db.select().from(brands).where(eq(brands.userId, dbUser.id));

    if (!myBrand) {
        return (
            <div className="p-8 text-center py-20">
                <Building2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">No Brand Profile Found</h2>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Please contact a Super Admin to link your account to a brand profile.
                </p>
            </div>
        );
    }

    const brandProducts = await db.select({
        product: products,
        serialCount: count(productSerials.id)
    })
    .from(products)
    .leftJoin(productSerials, eq(productSerials.productId, products.id))
    .where(eq(products.brandId, myBrand.id))
    .groupBy(products.id);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{myBrand.brandName}</h1>
                    <p className="text-muted-foreground">Brand Management Portal & Product Verification</p>
                </div>
            </div>

            <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-secondary/20 rounded-xl mb-8">
                    <TabsTrigger value="products" className="rounded-lg font-bold gap-2">
                        <Package className="w-4 h-4" /> Products
                    </TabsTrigger>
                    <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-2">
                        <MessageSquare className="w-4 h-4" /> Inquiries
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-lg font-bold gap-2">
                        <Star className="w-4 h-4" /> Reviews
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-lg font-bold gap-2">
                        <Building2 className="w-4 h-4" /> Profile
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" /> Product Ecosystem
                        </h2>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl font-bold gap-2">
                                    <Plus className="w-4 h-4" /> Add Model
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold mb-4">Add Product Model</DialogTitle>
                                </DialogHeader>
                                <form action={addProductModel} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Model Name</label>
                                        <input name="name" placeholder="e.g. Hi-MO 6" className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Description</label>
                                        <textarea name="description" placeholder="Technical highlights..." className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" rows={3} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Serial/Model Prefix</label>
                                            <input name="serialNumber" placeholder="LR5-72HPH" className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Datasheet URL</label>
                                            <input name="datasheetUrl" placeholder="https://..." className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-4">Save Product Model</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {brandProducts.map(({ product, serialCount }) => (
                            <Card key={product.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-xl">{product.name}</h4>
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
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Customer Care Number</label>
                                        <input name="customerCare" defaultValue={myBrand.customerCare || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Official Website</label>
                                        <input name="website" defaultValue={myBrand.website || ""} className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl font-bold">Update Profile</Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle>Media & Gallery</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <BrandGalleryUpload initialPhotos={myBrand.photos} />
                                
                                <div className="pt-6 border-t">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 block">Social Media Presence</label>
                                    <form action={async (formData) => {
                                        "use server";
                                        const links = [
                                            { platform: "Facebook", url: formData.get("facebook") as string },
                                            { platform: "LinkedIn", url: formData.get("linkedin") as string },
                                            { platform: "Instagram", url: formData.get("instagram") as string },
                                        ].filter(l => l.url);
                                        await updateBrandProfile({ socialLinks: links });
                                    }} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input name="facebook" placeholder="Facebook URL" defaultValue={(myBrand.socialLinks as any[])?.find(l => l.platform === "Facebook")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                                            <input name="linkedin" placeholder="LinkedIn URL" defaultValue={(myBrand.socialLinks as any[])?.find(l => l.platform === "LinkedIn")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                                        </div>
                                        <Button className="w-full bg-secondary text-secondary-foreground">Update Links</Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
