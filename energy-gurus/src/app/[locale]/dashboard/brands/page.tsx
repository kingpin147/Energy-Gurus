import { db } from "@/db";
import { brands, products, productSerials } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Trash2, Globe, Package, ShieldCheck, ArrowLeft, Hash } from "lucide-react";
import { revalidatePath } from "next/cache";
import { eq, count, desc, asc, like } from "drizzle-orm";
import { Link } from "@/i18n/routing";
import { bulkImportSerials } from "@/lib/actions/serials";
import { BrandRegistrationForm } from "@/components/forms/brand-registration-form";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { getUserRole } from "@/lib/roles";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";

export default async function BrandManagementPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ id?: string; sort?: string; q?: string }> 
}) {
    const { id: selectedBrandId, sort, q } = await searchParams;
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const where = selectedBrandId ? eq(brands.id, selectedBrandId) : (q ? like(brands.brandName, `%${q}%`) : undefined);
    const order = sort === "oldest" ? asc(brands.createdAt) : desc(brands.createdAt);

    // 1. If a brand is selected, show Product & Serial management for that brand
    if (selectedBrandId) {
        const brand = await db.query.brands.findFirst({ where: eq(brands.id, selectedBrandId) });
        if (!brand) redirect("/dashboard/brands");

        const brandProducts = await db.select({
            product: products,
            serialCount: count(productSerials.id)
        })
        .from(products)
        .leftJoin(productSerials, eq(productSerials.productId, products.id))
        .where(eq(products.brandId, selectedBrandId))
        .groupBy(products.id);

        return (
            <div className="p-8 space-y-8">
                <Button variant="ghost" className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" asChild>
                    <Link href="/dashboard/brands">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Brands
                    </Link>
                </Button>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{brand.brandName}</h1>
                        <p className="text-muted-foreground">Manage products and serial number verification for this brand.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl h-fit">
                        <CardHeader>
                            <CardTitle>Add Product Model</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={async (formData) => {
                                "use server";
                                const name = formData.get("name") as string;
                                const description = formData.get("description") as string;
                                await db.insert(products).values({ brandId: selectedBrandId, name, description });
                                revalidatePath("/dashboard/brands");
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Model Name</label>
                                    <input name="name" className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Short Description</label>
                                    <textarea name="description" rows={3} className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <Button type="submit" className="w-full rounded-xl font-bold h-12 gap-2">
                                    <Plus className="w-4 h-4" /> Add Model
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold">Product Directory</h3>
                        {brandProducts.map(({ product, serialCount }) => (
                            <Card key={product.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-bold text-lg">{product.name}</h4>
                                            <p className="text-xs text-muted-foreground">{product.description || "No description"}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
                                            <Hash className="w-3 h-3" /> {serialCount} Serials
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-secondary/10">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Bulk Import Serials</label>
                                        <form action={async (formData) => {
                                            "use server";
                                            const raw = formData.get("serials") as string;
                                            await bulkImportSerials(product.id, raw);
                                        }} className="space-y-3">
                                            <textarea 
                                                name="serials" 
                                                rows={3}
                                                placeholder="Paste serial numbers (one per line)...&#10;SN-1234-5678&#10;SN-8765-4321" 
                                                className="w-full border rounded-xl p-3 text-sm bg-secondary/5 focus:ring-2 focus:ring-primary outline-none font-mono"
                                            />
                                            <Button type="submit" variant="secondary" size="sm" className="w-full rounded-xl font-bold h-10">
                                                <Hash className="w-4 h-4 mr-2" /> Import Serials
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {brandProducts.length === 0 && (
                            <div className="py-12 text-center border-2 border-dashed rounded-3xl bg-secondary/5">
                                <p className="text-muted-foreground font-medium">No products listed for this brand yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Main Brand Listing (Default View)
    const allBrands = await db.select().from(brands).where(where).orderBy(order);

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Brand Management</h1>
                        <p className="text-muted-foreground">Manage the global directory of Solar & Energy Brands.</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <ListSearch placeholder="Search brands..." />
                    <ListSort 
                        options={[
                            { label: "Latest", value: "latest" },
                            { label: "Oldest", value: "oldest" },
                        ]} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl h-fit">
                    <CardHeader>
                        <CardTitle>Add Global Brand</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BrandRegistrationForm />
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold mb-4">Registered Brands</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allBrands.map((brand) => (
                            <Card key={brand.id} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center overflow-hidden">
                                            {brand.logoUrl ? (
                                                <img src={brand.logoUrl} className="max-h-full max-w-full object-contain p-2" alt="" />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/brands?id=${brand.id}`}>
                                                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold gap-2">
                                                    <Package className="w-4 h-4" /> Details
                                                </Button>
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await db.delete(brands).where(eq(brands.id, brand.id));
                                                revalidatePath("/dashboard/brands");
                                            }}>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">{brand.brandName}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Globe className="w-3 h-3" /> {brand.website || "No website"}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
