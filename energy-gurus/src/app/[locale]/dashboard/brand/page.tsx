import { db } from "@/db";
import { brands, products, productSerials, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Package, Hash, Plus, Globe, Users, ShieldCheck, Trash2 } from "lucide-react";
import { bulkImportSerials } from "@/lib/actions/serials";
import { revalidatePath } from "next/cache";
import { UploadButton } from "@/lib/uploadthing";

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Brand Info */}
                <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl h-fit overflow-hidden">
                    <CardHeader className="bg-secondary/5 border-b pb-6">
                        <CardTitle className="text-lg">Brand Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl border bg-white flex items-center justify-center p-2">
                                {myBrand.logoUrl ? <img src={myBrand.logoUrl} className="max-h-full max-w-full object-contain" alt="" /> : <Building2 className="w-8 h-8 text-primary/20" />}
                            </div>
                            <div>
                                <h3 className="font-bold">{myBrand.brandName}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {myBrand.website || "No website"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Product Models</span>
                                <span className="font-bold">{brandProducts.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Representative Team</span>
                                <span className="font-bold">{myBrand.reps?.length || 0} Members</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-2">Edit Brand Details</Button>

                        <div className="pt-6 border-t space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Brand Gallery</label>
                            <div className="grid grid-cols-2 gap-2">
                                {myBrand.photos?.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-xl border overflow-hidden relative group">
                                        <img src={url} className="w-full h-full object-cover" alt="" />
                                        <form action={async () => {
                                            "use server";
                                            const filtered = myBrand.photos?.filter(p => p !== url) || [];
                                            await db.update(brands).set({ photos: filtered }).where(eq(brands.id, myBrand.id));
                                            revalidatePath("/dashboard/brand");
                                        }}>
                                            <button className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                            <UploadButton
                                endpoint="brandLogo"
                                onClientUploadComplete={async (res) => {
                                    const newPhotos = [...(myBrand.photos || []), ...res.map(f => f.url)];
                                    await db.update(brands).set({ photos: newPhotos }).where(eq(brands.id, myBrand.id));
                                    revalidatePath("/dashboard/brand");
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Product Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" /> Product Ecosystem
                        </h2>
                        <Button className="rounded-xl font-bold gap-2">
                            <Plus className="w-4 h-4" /> Add Model
                        </Button>
                    </div>

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
            </div>
        </div>
    );
}
