import { getCurrentWriterProfile } from "@/lib/actions/writer-profile";
import { WriterProfileForm } from "@/components/dashboard/writer-profile-form";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "My Author Profile | EnergyGurus",
  description: "Set up and manage your Contributing Writer profile, social links, and author bio."
};

export default async function WriterProfilePage() {
  const role = await getUserRole();

  if (role !== "writer" && role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  const data = await getCurrentWriterProfile();

  if (!data?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber/20">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contributing Writer Profile</h1>
          <p className="text-slate-custom text-sm md:text-base">
            Set up your public author credentials, social handles, and professional bio.
          </p>
        </div>
      </div>

      <WriterProfileForm
        initialProfile={data.profile as any}
        userEmail={data.user.email}
      />
    </div>
  );
}
