import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { brands, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateBrandProfile } from "@/lib/actions/brand";
import { UploadButton } from "@/lib/uploadthing";

export default async function BrandDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) redirect("/dashboard");

  let [brand] = await db.select().from(brands).where(eq(brands.userId, user.id));

  if (!brand) {
    [brand] = await db.insert(brands).values({
      userId: user.id,
      brandName: user.name || "My Brand",
    }).returning();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Brand Management</h1>
      
      <div className="space-y-8">
        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Brand Details</h2>
          <form action={updateBrandProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand Name</label>
              <input 
                name="brandName" 
                defaultValue={brand.brandName} 
                className="w-full border rounded p-2 bg-transparent"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Care Number</label>
              <input 
                name="customerCare" 
                defaultValue={brand.customerCare || ""} 
                className="w-full border rounded p-2 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input 
                name="website" 
                defaultValue={brand.website || ""} 
                className="w-full border rounded p-2 bg-transparent"
              />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:opacity-90">
              Update Brand Info
            </button>
          </form>
        </section>

        <section className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Branding</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Brand Logo</label>
            <div className="flex items-center space-x-4">
              {brand.logoUrl && <img src={brand.logoUrl} className="w-16 h-16 rounded border object-contain" alt="" />}
              <UploadButton
                endpoint="brandLogo"
                onClientUploadComplete={async (res) => {
                  await updateBrandProfile({ logoUrl: res[0].url });
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
