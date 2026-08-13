import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { db } from "@/db";
import { epcInstallers, users, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateEpcProfile } from "@/lib/actions/epc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardInquiryList } from "@/components/dashboard/inquiry-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MessageSquare, Star, Settings, MapPin, LayoutGrid, AlertTriangle } from "lucide-react";
import { PortfolioUpload } from "@/components/dashboard/portfolio-upload";
import { DashboardReviewList } from "@/components/dashboard/dashboard-review-list";
import { ReviewVideosUpload } from "@/components/dashboard/review-videos-upload";
import { EpcProfileForm } from "@/components/dashboard/epc-profile-form";
import { OfficeManagement } from "@/components/dashboard/office-management";
import { ProjectManagement } from "@/components/dashboard/project-management";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import { SocialLinksForm } from "@/components/dashboard/social-links-form";

export default async function EpcDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const role = await getUserRole();
  if (role !== 'epc' && role !== 'super-admin' && role !== 'admin') {
    redirect("/dashboard");
  }

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) redirect("/dashboard");

  let [epc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, user.id));

  // Auto-create EPC profile if it doesn't exist
  if (!epc) {
    [epc] = await db.insert(epcInstallers).values({
      userId: user.id,
      companyName: user.name || "My Company",
      isVerified: true
    }).returning();
  }

  const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, epc.id));
  const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, epc.id));

  const { score, missing } = getEpcCompleteness(epc, offices.length, projects.length);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
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
        <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EPC Dashboard</h1>
          <p className="text-slate-custom">Manage your company profile, portfolio, and customer inquiries.</p>
        </div>
      </div>

      {/* Profile Completeness Score Card */}
      <div className="bg-white/50 backdrop-blur-xl border border-line/50 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
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
          <div className="w-full h-3 bg-paper/30 rounded-full overflow-hidden">
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
            <span className="font-bold text-slate-custom block mb-1">Missing Checkpoints to hit 100%:</span>
            <span className="text-slate-custom font-medium">
              {missing.join(", ")}
            </span>
          </div>
        ) : (
          <div className="text-xs md:text-right">
            <span className="font-black text-green-600 block mb-1">🎉 Perfectly Complete Profile!</span>
            <span className="text-slate-custom font-medium">Your profile is fully optimized for public directories and search engines.</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto p-1 bg-paper/20 rounded-xl mb-8 gap-1">
          <TabsTrigger value="profile" className="rounded-lg font-bold gap-2 flex-1 min-w-[120px] h-12">
            <Settings className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="offices" className="rounded-lg font-bold gap-2 flex-1 min-w-[120px] h-12">
            <MapPin className="w-4 h-4" /> Offices
          </TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg font-bold gap-2 flex-1 min-w-[120px] h-12">
            <LayoutGrid className="w-4 h-4" /> Showcase
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="rounded-lg font-bold gap-2 flex-1 min-w-[120px] h-12">
            <MessageSquare className="w-4 h-4" /> Inquiries
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg font-bold gap-2 flex-1 min-w-[120px] h-12">
            <Star className="w-4 h-4" /> Reviews
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
                  defaultCeoName={epc.ceoName || ""}
                  defaultSectors={epc.sectors || []}
                  defaultCertifications={(epc as any).certifications || []}
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
                  <SocialLinksForm type="epc" initialLinks={epc.socialLinks || []} />
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offices">
          <OfficeManagement epcId={epc.id} initialOffices={offices} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectManagement epcId={epc.id} initialProjects={projects} />
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
                <p className="text-slate-custom text-sm">Monitor what customers are saying about your installations.</p>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-xl border border-line/50 p-6 rounded-[2rem] shadow-sm">
              <ReviewVideosUpload initialVideos={epc.reviewVideos} />
            </div>
            <DashboardReviewList targetId={epc.id} targetType="epc" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
