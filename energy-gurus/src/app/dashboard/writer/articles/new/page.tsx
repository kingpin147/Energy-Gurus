import { getCurrentWriterProfile } from "@/lib/actions/writer-profile";
import { WriterArticleForm } from "@/components/forms/writer-article-form";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { PenTool } from "lucide-react";

export const metadata = {
  title: "Write Article | EnergyGurus",
  description: "Draft and submit a new renewable energy article for editorial review."
};

export default async function NewWriterArticlePage() {
  const role = await getUserRole();

  if (role !== "writer" && role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  const profileData = await getCurrentWriterProfile();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber/20">
          <PenTool className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Write New Article</h1>
          <p className="text-slate-custom text-sm md:text-base">
            Draft your article with rich formatting and submit for editorial approval.
          </p>
        </div>
      </div>

      <WriterArticleForm writerProfile={profileData?.profile as any} />
    </div>
  );
}
