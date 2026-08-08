import { db } from "@/db";
import { reviews, users, epcInstallers, brands } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, Trash2, User, Building2, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminReviewForm } from "@/components/forms/admin-review-form";
import { deleteReviewAction } from "@/lib/actions/reviews";

export default async function AdminReviewsPage() {
  const role = await getUserRole();

  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all active EPC installers for dropdown
  const allEpcs = await db
    .select({
      id: epcInstallers.id,
      name: epcInstallers.companyName,
    })
    .from(epcInstallers)
    .innerJoin(users, eq(users.id, epcInstallers.userId))
    .where(eq(users.isActive, true))
    .orderBy(epcInstallers.companyName);

  // Fetch all active Brands for dropdown
  const allBrands = await db
    .select({
      id: brands.id,
      name: brands.brandName,
    })
    .from(brands)
    .innerJoin(users, eq(users.id, brands.userId))
    .where(eq(users.isActive, true))
    .orderBy(brands.brandName);

  // Fetch EPC Reviews
  const epcReviews = await db
    .select({
      review: reviews,
      author: users,
      epc: epcInstallers,
    })
    .from(reviews)
    .innerJoin(epcInstallers, eq(reviews.targetId, epcInstallers.id))
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(eq(reviews.targetType, "epc"))
    .orderBy(desc(reviews.createdAt));

  // Fetch Brand Reviews
  const brandReviews = await db
    .select({
      review: reviews,
      author: users,
      brand: brands,
    })
    .from(reviews)
    .innerJoin(brands, eq(reviews.targetId, brands.id))
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(eq(reviews.targetType, "brand"))
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">
          <Star className="w-6 h-6 fill-current text-ink" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-space-grotesk font-bold tracking-tight text-ink">
            Admin Reviews & Team Ratings
          </h1>
          <p className="text-slate-custom text-sm">
            Give official EnergyGurus Team Ratings and moderate reviews for Solar Installers and Brands.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="installers" className="w-full space-y-6">
        <TabsList className="h-12 p-1 bg-paper border border-line rounded-xl inline-flex w-full sm:w-auto">
          <TabsTrigger
            value="installers"
            className="px-6 rounded-lg font-bold text-xs uppercase tracking-widest gap-2 flex-1 sm:flex-initial data-[state=active]:bg-ink data-[state=active]:text-white"
          >
            <Briefcase className="w-4 h-4" /> Installers ({epcReviews.length})
          </TabsTrigger>
          <TabsTrigger
            value="brands"
            className="px-6 rounded-lg font-bold text-xs uppercase tracking-widest gap-2 flex-1 sm:flex-initial data-[state=active]:bg-ink data-[state=active]:text-white"
          >
            <Building2 className="w-4 h-4" /> Brands ({brandReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* ── INSTALLERS TAB ── */}
        <TabsContent value="installers" className="space-y-8 outline-none">
          {/* Admin Review Submission Form for Installers */}
          <AdminReviewForm targetType="epc" options={allEpcs} />

          {/* List of Installer Reviews */}
          <div className="space-y-4">
            <h3 className="font-space-grotesk font-bold text-xl text-ink">
              All Installer Reviews ({epcReviews.length})
            </h3>

            {epcReviews.map(({ review, author, epc }) => {
              const isAdminAuthor = author?.role === "admin" || author?.role === "super-admin";

              return (
                <Card key={review.id} className="border border-line shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="w-9 h-9 rounded-full bg-ink text-amber flex items-center justify-center font-bold text-sm">
                            {author?.name ? author.name.substring(0, 2).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-ink">{author?.name || "Anonymous User"}</p>
                            <p className="text-xs text-slate-custom font-medium">Target: <strong className="text-ink">{epc.companyName}</strong></p>
                          </div>
                          {isAdminAuthor && (
                            <span className="bg-amber/10 text-amber border border-amber/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> EnergyGurus Team Rating
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-yellow-500 gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current text-yellow-500" : "text-gray-300"}`} />
                          ))}
                          <span className="ml-2 text-xs font-bold text-graphite">{review.rating}.0 / 5.0</span>
                        </div>

                        <p className="bg-paper p-3.5 rounded-xl text-sm italic text-graphite border border-line/60">
                          &quot;{review.comment}&quot;
                        </p>

                        <p className="text-[10px] font-bold text-slate-custom uppercase tracking-widest">
                          Posted on {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <form action={async () => {
                        "use server";
                        await deleteReviewAction(review.id, epc.id, "epc");
                      }}>
                        <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {epcReviews.length === 0 && (
              <div className="py-16 text-center border border-dashed border-line rounded-2xl bg-white">
                <p className="text-slate-custom font-medium">No installer reviews found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── BRANDS TAB ── */}
        <TabsContent value="brands" className="space-y-8 outline-none">
          {/* Admin Review Submission Form for Brands */}
          <AdminReviewForm targetType="brand" options={allBrands} />

          {/* List of Brand Reviews */}
          <div className="space-y-4">
            <h3 className="font-space-grotesk font-bold text-xl text-ink">
              All Brand Reviews ({brandReviews.length})
            </h3>

            {brandReviews.map(({ review, author, brand }) => {
              const isAdminAuthor = author?.role === "admin" || author?.role === "super-admin";

              return (
                <Card key={review.id} className="border border-line shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="w-9 h-9 rounded-full bg-ink text-amber flex items-center justify-center font-bold text-sm">
                            {author?.name ? author.name.substring(0, 2).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-ink">{author?.name || "Anonymous User"}</p>
                            <p className="text-xs text-slate-custom font-medium">Target: <strong className="text-ink">{brand.brandName}</strong></p>
                          </div>
                          {isAdminAuthor && (
                            <span className="bg-amber/10 text-amber border border-amber/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> EnergyGurus Team Rating
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-yellow-500 gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current text-yellow-500" : "text-gray-300"}`} />
                          ))}
                          <span className="ml-2 text-xs font-bold text-graphite">{review.rating}.0 / 5.0</span>
                        </div>

                        <p className="bg-paper p-3.5 rounded-xl text-sm italic text-graphite border border-line/60">
                          &quot;{review.comment}&quot;
                        </p>

                        <p className="text-[10px] font-bold text-slate-custom uppercase tracking-widest">
                          Posted on {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <form action={async () => {
                        "use server";
                        await deleteReviewAction(review.id, brand.id, "brand");
                      }}>
                        <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {brandReviews.length === 0 && (
              <div className="py-16 text-center border border-dashed border-line rounded-2xl bg-white">
                <p className="text-slate-custom font-medium">No brand reviews found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
