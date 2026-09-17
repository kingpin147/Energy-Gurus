import { db } from "@/db";
import { brands, products, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { BrandSubmissionEditor } from "@/components/dashboard/BrandSubmissionEditor";

export default async function BrandDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = await getUserRole();
  if (role !== "brand" && role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) redirect("/dashboard");

  let [myBrand] = await db.select().from(brands).where(eq(brands.userId, dbUser.id));

  // Auto-create Brand profile placeholder if it doesn't exist
  if (!myBrand) {
    [myBrand] = await db
      .insert(brands)
      .values({
        userId: dbUser.id,
        brandName: dbUser.name || "Solar Brand",
        status: "draft",
        isVerified: false
      })
      .returning();
  }

  const brandProducts = await db
    .select()
    .from(products)
    .where(eq(products.brandId, myBrand.id))
    .orderBy(desc(products.createdAt));

  return (
    <BrandSubmissionEditor
      brand={myBrand}
      products={brandProducts}
      currentUser={dbUser}
    />
  );
}
