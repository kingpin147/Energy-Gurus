import { EpcOnboardingForm } from "@/components/forms/epc-onboarding-form";
import { EpcTableClient } from "@/components/dashboard/epc-table-client";
import { getAllEpcInstallers } from "@/lib/actions/admin-epc-actions";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { Briefcase, Building2, CheckCircle2, Award, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function OnboardEpcPage() {
    const role = await getUserRole();
    if (role !== "super-admin" && role !== "admin") {
        redirect("/dashboard");
    }

    const epcInstallers = await getAllEpcInstallers();

    const totalInstallers = epcInstallers.length;
    const verifiedCount = epcInstallers.filter(e => e.isVerified).length;
    const goldCount = epcInstallers.filter(e => e.tier === 'gold').length;
    const silverCount = epcInstallers.filter(e => e.tier === 'silver').length;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shadow-lg shadow-amber/20">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-ink">EPC Installers Hub</h1>
                        <p className="text-slate-custom text-sm mt-0.5">
                            Manage existing onboarded EPC installers (View, Edit, Delete) or register new companies.
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
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Total Installers</p>
                        <p className="text-2xl font-bold text-ink">{totalInstallers}</p>
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
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Gold Tier</p>
                        <p className="text-2xl font-bold text-ink">{goldCount}</p>
                    </div>
                </div>

                <div className="bg-white border border-line p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-custom">Silver Tier</p>
                        <p className="text-2xl font-bold text-ink">{silverCount}</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="table" className="w-full space-y-6">
                <div className="border-b border-line pb-4">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="table" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
                            <Building2 className="w-4 h-4" /> Onboarded Installers ({totalInstallers})
                        </TabsTrigger>
                        <TabsTrigger value="onboard" className="rounded-lg text-sm font-bold px-5 py-2.5 gap-2">
                            <UserPlus className="w-4 h-4" /> Onboard New EPC
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="table" className="focus:outline-none">
                    <EpcTableClient initialEpcs={epcInstallers} />
                </TabsContent>

                <TabsContent value="onboard" className="focus:outline-none">
                    <EpcOnboardingForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
