import { EpcOnboardingForm } from "@/components/forms/epc-onboarding-form";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function OnboardEpcPage() {
    const role = await getUserRole();
    if (role !== "super-admin" && role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-6">
            <div className="mb-8 bg-ink text-white p-8 rounded-2xl">
                <p className="font-ibm-plex-mono text-xs tracking-widest uppercase text-amber flex items-center gap-2.5 mb-4">
                    <span className="w-5 h-px bg-amber"></span>
                    Admin Action
                </p>
                <h1 className="text-3xl font-space-grotesk font-semibold mb-2">Onboard EPC Installer</h1>
                <p className="text-white/70 max-w-2xl">
                    Create a new EPC installer profile and account. A secure temporary password will be generated for their first login.
                </p>
            </div>
            
            <EpcOnboardingForm />
        </div>
    );
}
