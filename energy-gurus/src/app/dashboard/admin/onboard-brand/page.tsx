import { BrandOnboardingForm } from "@/components/forms/brand-onboarding-form";
import { BrandTableClient } from "@/components/dashboard/brand-table-client";
import { BrandModerationQueue } from "@/components/dashboard/BrandModerationQueue";
import { getAllBrandsAdmin } from "@/lib/actions/admin-brand-actions";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { Building2, CheckCircle2, ShieldCheck, UserPlus, Package, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Brands Hub & Direct Onboarding | EnergyGurus",
  description: "Manage existing onboarded brands, cataloged solar equipment, or register new manufacturers directly.",
};

export default async function OnboardBrandPage() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const brandsList = await getAllBrandsAdmin();

  const totalBrands = brandsList.length;
  const verifiedCount = brandsList.filter((b) => b.isVerified).length;
  const liveCount = brandsList.filter((b) => b.status === "live").length;
  const totalProducts = brandsList.reduce((acc, b) => acc + (b.productsCount || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">Brands Hub</h1>
            <p className="text-slate-custom text-sm mt-0.5">
              Manage existing onboarded brands (View Profile, Full Edit, Delete) or directly register new solar manufacturers.
            </p>
          </div>
        </div>
      </div>

      {/* Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Brands */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-navy-deep/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Total Brands</span>
            <div className="p-1.5 rounded-lg bg-paper border border-line/60">
              <Building2 className="w-4 h-4 text-navy-deep" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{totalBrands}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Solar manufacturers</p>
        </div>

        {/* Verified Profiles */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Verified Profiles</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{verifiedCount}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Official manufacturer accounts</p>
        </div>

        {/* Live Directory */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-amber-deep/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Live Directory</span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{liveCount}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Publicly searchable brands</p>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-line p-5 rounded-2xl shadow-xs relative overflow-hidden group hover:border-teal/50 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">Cataloged Products</span>
            <div className="p-1.5 rounded-lg bg-teal/10 text-teal">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{totalProducts}</div>
          <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">Inverters, modules, storage</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="table" className="w-full space-y-6">
        <div className="border-b border-line/60 pb-3">
          <TabsList className="bg-paper border border-line p-1 rounded-xl">
            <TabsTrigger value="table" className="rounded-lg text-xs font-bold px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <Building2 className="w-3.5 h-3.5" /> Onboarded Brands ({totalBrands})
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-lg text-xs font-bold px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Moderation Queue
            </TabsTrigger>
            <TabsTrigger value="onboard" className="rounded-lg text-xs font-bold px-4 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <UserPlus className="w-3.5 h-3.5" /> Onboard New Brand
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="focus:outline-none">
          <BrandTableClient initialBrands={brandsList} />
        </TabsContent>

        <TabsContent value="moderation" className="focus:outline-none">
          <BrandModerationQueue brands={brandsList as any} />
        </TabsContent>

        <TabsContent value="onboard" className="focus:outline-none">
          <BrandOnboardingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
