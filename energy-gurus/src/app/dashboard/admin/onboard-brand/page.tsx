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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shadow-lg shadow-amber/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Brands Hub</h1>
            <p className="text-slate-custom text-sm mt-0.5">
              Manage existing onboarded brands (View Profile, Full Edit, Delete) or directly register new solar manufacturers.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Total Brands</p>
            <p className="text-2xl font-bold text-ink">{totalBrands}</p>
          </div>
        </div>

        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Verified Profiles</p>
            <p className="text-2xl font-bold text-ink">{verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Live Directory</p>
            <p className="text-2xl font-bold text-ink">{liveCount}</p>
          </div>
        </div>

        <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Total Products</p>
            <p className="text-2xl font-bold text-ink">{totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="table" className="w-full space-y-6">
        <div className="border-b border-line pb-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="table" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
              <Building2 className="w-4 h-4" /> Onboarded Brands ({totalBrands})
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
              <ShieldCheck className="w-4 h-4" /> Moderation Queue
            </TabsTrigger>
            <TabsTrigger value="onboard" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
              <UserPlus className="w-4 h-4" /> Onboard New Brand
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
