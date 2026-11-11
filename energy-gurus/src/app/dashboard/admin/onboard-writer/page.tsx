import { WriterOnboardingForm } from "@/components/forms/writer-onboarding-form";
import { WriterTableClient } from "@/components/dashboard/writer-table-client";
import { WriterModerationQueue } from "@/components/dashboard/writer-moderation-queue";
import { getAllWritersAdmin } from "@/lib/actions/admin-writer-actions";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { UserCheck, CheckCircle2, ShieldCheck, UserPlus, FileText, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Writers Hub & Direct Onboarding | EnergyGurus",
  description: "Manage contributing writers, review editorial submissions, or directly onboard new authors.",
};

export default async function OnboardWriterPage() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const writersList = await getAllWritersAdmin();

  const totalWriters = writersList.length;
  const approvedCount = writersList.filter((w) => w.status === "approved").length;
  const pendingCount = writersList.filter((w) => w.status === "pending_review").length;
  const totalArticles = writersList.reduce((acc, w) => acc + (w.articlesCount || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shadow-md">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">Contributing Writers Hub</h1>
            <p className="text-slate-custom text-sm mt-0.5">
              Manage existing onboarded writers (View Profile, Full Edit, Delete) or directly register new contributing authors.
            </p>
          </div>
        </div>
      </div>

      {/* Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Authors */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-navy-deep/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Total Authors</span>
            <div className="p-1.5 rounded-lg bg-paper border border-line/60">
              <UserCheck className="w-4 h-4 text-navy-deep" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{totalWriters}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Registered columnists</p>
        </div>

        {/* Approved Writers */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Approved Writers</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{approvedCount}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Verified author credentials</p>
        </div>

        {/* Published Articles */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-teal/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Published Articles</span>
            <div className="p-1.5 rounded-lg bg-teal/10 text-teal">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{totalArticles}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Live editorial pieces</p>
        </div>

        {/* In Review */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-amber-deep/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">In Review</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{pendingCount}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Pending author applications</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="table" className="w-full space-y-6">
        <div className="border-b border-line/60 pb-3">
          <TabsList className="bg-paper border border-line p-1 rounded-xl">
            <TabsTrigger value="table" className="rounded-lg text-xs font-bold px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <UserCheck className="w-3.5 h-3.5" /> Onboarded Writers ({totalWriters})
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-lg text-xs font-bold px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Moderation Queue
            </TabsTrigger>
            <TabsTrigger value="onboard" className="rounded-lg text-xs font-bold px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <UserPlus className="w-3.5 h-3.5" /> Onboard New Writer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="focus:outline-none">
          <WriterTableClient initialWriters={writersList} />
        </TabsContent>

        <TabsContent value="moderation" className="focus:outline-none">
          <WriterModerationQueue writers={writersList as any} />
        </TabsContent>

        <TabsContent value="onboard" className="focus:outline-none">
          <WriterOnboardingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
