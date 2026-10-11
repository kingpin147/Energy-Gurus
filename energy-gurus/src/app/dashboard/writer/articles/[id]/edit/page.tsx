import { db } from "@/db";
import { news } from "@/db/schema";
import { getCurrentWriterProfile } from "@/lib/actions/writer-profile";
import { WriterArticleForm } from "@/components/forms/writer-article-form";
import { getUserRole } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Edit3 } from "lucide-react";

export const metadata = {
  title: "Edit Article | EnergyGurus",
  description: "Edit and resubmit your article for editorial review."
};

export default async function EditWriterArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getUserRole();

  if (role !== "writer" && role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  const [article] = await db.select().from(news).where(eq(news.id, id)).limit(1);

  if (!article) {
    notFound();
  }

  const profileData = await getCurrentWriterProfile();

  // If writer, make sure they own the article
  if (role === "writer" && profileData?.user && article.authorId !== profileData.user.id) {
    redirect("/dashboard/writer/articles");
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber/20">
          <Edit3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-slate-custom text-sm md:text-base">
            Update your article content and resubmit for editorial review.
          </p>
        </div>
      </div>

      <WriterArticleForm
        initialData={{
          id: article.id,
          title: article.title,
          content: article.content,
          category: article.category,
          imageUrl: article.imageUrl,
          status: article.status,
          adminFeedback: article.adminFeedback
        }}
        writerProfile={profileData?.profile as any}
      />
    </div>
  );
}
