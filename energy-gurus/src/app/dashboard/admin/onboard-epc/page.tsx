import { EpcOnboardingForm } from "@/components/forms/epc-onboarding-form";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";

export default async function OnboardEpcPage() {
    const role = await getUserRole();
    if (role !== "super-admin" && role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Onboard EPC Installer</h1>
                        <p className="text-slate-custom text-sm">Create a new EPC installer profile and generate their temporary password.</p>
                    </div>
                </div>
            </div>
            
            <EpcOnboardingForm />
        </div>
    );
}
