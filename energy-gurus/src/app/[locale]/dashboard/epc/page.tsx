import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { epcInstallers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateEpcProfile } from "@/lib/actions/epc";
import { UploadButton } from "@/lib/uploadthing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardInquiryList } from "@/components/dashboard/inquiry-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MessageSquare, Star, Settings } from "lucide-react";
import { PortfolioUpload } from "@/components/dashboard/portfolio-upload";
import { DashboardReviewList } from "@/components/dashboard/dashboard-review-list";
import { EpcProfileForm } from "@/components/dashboard/epc-profile-form";

export default async function EpcDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) redirect("/dashboard");

  let [epc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, user.id));

  // Auto-create EPC profile if it doesn't exist
  if (!epc) {
    [epc] = await db.insert(epcInstallers).values({
      userId: user.id,
      companyName: user.name || "My Company",
    }).returning();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">EPC Dashboard</h1>
            <p className="text-muted-foreground">Manage your company profile, portfolio, and customer inquiries.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-secondary/20 rounded-xl mb-8">
          <TabsTrigger value="profile" className="rounded-lg font-bold gap-2">
            <Settings className="w-4 h-4" /> Profile & Portfolio
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-2">
            <MessageSquare className="w-4 h-4" /> Inquiries
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg font-bold gap-2">
            <Star className="w-4 h-4" /> Ratings & Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <EpcProfileForm
                  epcId={epc.id}
                  defaultCompanyName={epc.companyName}
                  defaultAbout={epc.about || ""}
                  defaultWebsite={epc.website || ""}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle>Branding & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <PortfolioUpload 
                  initialLogoUrl={epc.logoUrl} 
                  initialPortfolio={epc.portfolio} 
                />


                <div className="pt-8 border-t">
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Social Presence</label>
                  <form action={async (formData) => {
                    "use server";
                    const links = [
                        { platform: "Facebook", url: formData.get("facebook") as string },
                        { platform: "LinkedIn", url: formData.get("linkedin") as string },
                        { platform: "Instagram", url: formData.get("instagram") as string },
                        { platform: "Twitter", url: formData.get("twitter") as string },
                        { platform: "WhatsApp", url: formData.get("whatsapp") as string },
                    ].filter(l => l.url);
                    await updateEpcProfile({ socialLinks: links });
                  }} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">Facebook</span>
                      <input name="facebook" placeholder="https://facebook.com/yourpage" defaultValue={epc.socialLinks?.find(l => l.platform === "Facebook")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">LinkedIn</span>
                      <input name="linkedin" placeholder="https://linkedin.com/company/yourpage" defaultValue={epc.socialLinks?.find(l => l.platform === "LinkedIn")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">Instagram</span>
                      <input name="instagram" placeholder="https://instagram.com/yourprofile" defaultValue={epc.socialLinks?.find(l => l.platform === "Instagram")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">Twitter</span>
                      <input name="twitter" placeholder="https://twitter.com/yourhandle" defaultValue={epc.socialLinks?.find(l => l.platform === "Twitter")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">WhatsApp</span>
                      <input name="whatsapp" placeholder="+92 3XX XXXXXXX" defaultValue={epc.socialLinks?.find(l => l.platform === "WhatsApp")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <button className="w-full bg-secondary text-secondary-foreground h-10 rounded-xl font-bold text-sm hover:bg-secondary/80 mt-2">Update Social Links</button>
                  </form>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inquiries">
          <div className="max-w-3xl">
            <DashboardInquiryList receiverId={user.id} />
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-4 p-6 bg-yellow-500/5 rounded-3xl border border-yellow-500/10">
                <Star className="w-10 h-10 text-yellow-500" />
                <div>
                    <h3 className="text-xl font-bold">Ratings & Feedback</h3>
                    <p className="text-muted-foreground text-sm">Monitor what customers are saying about your installations.</p>
                </div>
            </div>
            <DashboardReviewList targetId={epc.id} targetType="epc" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
