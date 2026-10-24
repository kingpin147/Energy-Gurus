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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shadow-lg shadow-amber/20">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Contributing Writers Hub</h1>
            <p className="text-slate-custom text-sm mt-0.5">
              Manage existing onboarded writers (View Profile, Full Edit, Delete) or directly register new contributing authors.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Total Authors</p>
            <p className="text-2xl font-bold text-ink">{totalWriters}</p>
          </div>
        </div>

        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Approved Writers</p>
            <p className="text-2xl font-bold text-ink">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Published Articles</p>
            <p className="text-2xl font-bold text-ink">{totalArticles}</p>
          </div>
        </div>

        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">In Review</p>
            <p className="text-2xl font-bold text-ink">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="table" className="w-full space-y-6">
        <div className="border-b border-line pb-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="table" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
              <UserCheck className="w-4 h-4" /> Onboarded Writers ({totalWriters})
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
              <ShieldCheck className="w-4 h-4" /> Moderation Queue
            </TabsTrigger>
            <TabsTrigger value="onboard" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
              <UserPlus className="w-4 h-4" /> Onboard New Writer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="focus:outline-none">
          <WriterTableClient initialWriters={writersList as any} />
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
