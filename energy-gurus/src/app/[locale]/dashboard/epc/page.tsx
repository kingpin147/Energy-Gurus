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
import { Briefcase, MessageSquare, Star, Settings, Trash2 } from "lucide-react";
import { ReviewList } from "@/components/reviews/review-list";

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
                <form action={updateEpcProfile} className="space-y-4">
                  <input type="hidden" name="id" value={epc.id} />
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Company Name</label>
                    <input 
                      name="companyName" 
                      defaultValue={epc.companyName} 
                      className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">About Company</label>
                    <textarea 
                      name="about" 
                      defaultValue={epc.about || ""} 
                      rows={4}
                      className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Website URL</label>
                    <input 
                      name="website" 
                      defaultValue={epc.website || ""} 
                      className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <button className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl">
              <CardHeader>
                <CardTitle>Branding & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Company Logo</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-2xl border bg-white flex items-center justify-center overflow-hidden p-2">
                        {epc.logoUrl ? <img src={epc.logoUrl} className="max-h-full max-w-full object-contain" alt="" /> : <Briefcase className="w-8 h-8 text-primary/20" />}
                    </div>
                    <UploadButton
                      endpoint="brandLogo"
                      onClientUploadComplete={async (res) => {
                        await updateEpcProfile({ logoUrl: res[0].url });
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Portfolio Images</label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {epc.portfolio?.map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl border overflow-hidden relative group">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <form action={async () => {
                            "use server";
                            const filtered = epc.portfolio?.filter(p => p !== url) || [];
                            await updateEpcProfile({ portfolio: filtered });
                        }}>
                            <button className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </form>
                      </div>
                    ))}
                  </div>
                  <UploadButton
                    endpoint="epcPortfolio"
                    onClientUploadComplete={async (res) => {
                      const newPortfolio = [...(epc.portfolio || []), ...res.map(f => f.url)];
                      await updateEpcProfile({ portfolio: newPortfolio });
                    }}
                  />
                </div>

                <div className="pt-8 border-t">
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Social Presence</label>
                  <form action={async (formData) => {
                    "use server";
                    const links = [
                        { platform: "Facebook", url: formData.get("facebook") as string },
                        { platform: "LinkedIn", url: formData.get("linkedin") as string },
                        { platform: "Instagram", url: formData.get("instagram") as string },
                    ].filter(l => l.url);
                    await updateEpcProfile({ socialLinks: links });
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="facebook" placeholder="Facebook URL" defaultValue={epc.socialLinks?.find(l => l.platform === "Facebook")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                        <input name="linkedin" placeholder="LinkedIn URL" defaultValue={epc.socialLinks?.find(l => l.platform === "LinkedIn")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                    </div>
                    <button className="w-full bg-secondary text-secondary-foreground h-10 rounded-xl font-bold text-sm hover:bg-secondary/80">Update Social Links</button>
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
            <ReviewList targetId={epc.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
