import { getMyWriterArticles } from "@/lib/actions/news";
import { getCurrentWriterProfile } from "@/lib/actions/writer-profile";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock, CheckCircle2, AlertTriangle, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "My Articles | EnergyGurus",
  description: "View and manage your submitted articles and editorial approval statuses."
};

export default async function WriterArticlesPage() {
  const role = await getUserRole();

  if (role !== "writer" && role !== "admin" && role !== "super-admin") {
    redirect("/dashboard");
  }

  const [articles, profileData] = await Promise.all([
    getMyWriterArticles(),
    getCurrentWriterProfile()
  ]);

  const profile = profileData?.profile;
  const isProfileApproved = profile?.status === "approved";

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Articles</h1>
            <p className="text-slate-custom text-sm md:text-base">
              Manage your submitted articles and monitor their editorial review status.
            </p>
          </div>
        </div>

        {isProfileApproved ? (
          <Button asChild className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90 shadow-lg shadow-amber/20">
            <Link href="/dashboard/writer/articles/new">
              <Plus className="w-4 h-4 mr-2" /> Write New Article
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-xl h-11 px-6 font-bold border-amber text-amber-deep">
            <Link href="/dashboard/writer">
              Complete Profile to Write
            </Link>
          </Button>
        )}
      </div>

      {!isProfileApproved && (
        <div className="p-5 rounded-2xl bg-amber/15 border border-amber/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber/20 text-amber-deep flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-amber-deep">Profile Approval Required</h4>
            <p className="text-sm text-slate-custom mt-0.5 leading-relaxed">
              Your writer profile must be approved before you can create articles. Please complete your profile with
              at least 2 social handles and a 50–100 word bio.
            </p>
            <div className="mt-3">
              <Button asChild size="sm" className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold">
                <Link href="/dashboard/writer">Go to Profile Setup</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-sm">
        {articles.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-paper flex items-center justify-center mx-auto text-slate-custom">
              <FileText className="w-8 h-8 opacity-40" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-ink">No articles created yet</h3>
              <p className="text-sm text-slate-custom max-w-md mx-auto mt-1">
                Once your author profile is approved, click Write New Article to draft your first renewable energy post.
              </p>
            </div>
            {isProfileApproved && (
              <Button asChild className="rounded-xl font-bold bg-amber text-ink hover:bg-amber/90">
                <Link href="/dashboard/writer/articles/new">
                  <Plus className="w-4 h-4 mr-2" /> Write Article
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-paper/5 border-b border-line text-[11px] font-black uppercase tracking-wider text-slate-custom">
                  <th className="p-6">Article</th>
                  <th className="p-6">Category</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Submitted / Updated</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {articles.map((art) => {
                  const isLive = art.isPublished;
                  const isPending = art.status === "pending_review";
                  const isChangesReq = art.status === "changes_requested";

                  return (
                    <tr key={art.id} className="hover:bg-paper/5 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          {art.imageUrl ? (
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-14 h-14 object-cover rounded-xl border border-line shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-paper rounded-xl border border-line flex items-center justify-center shrink-0">
                              <FileText className="w-6 h-6 text-slate-custom opacity-40" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-ink hover:text-amber transition-colors line-clamp-1">
                              {art.title}
                            </p>
                            {art.adminFeedback && (
                              <p className="text-xs text-red-600 mt-1 line-clamp-1 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                Feedback: {art.adminFeedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-paper border border-line text-slate-custom">
                          {art.category}
                        </span>
                      </td>

                      <td className="p-6">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Published
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber/15 text-amber-deep border border-amber/30">
                            <Clock className="w-3.5 h-3.5" /> In Review
                          </span>
                        ) : isChangesReq ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Changes Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="p-6 text-xs text-slate-custom font-mono">
                        {art.updatedAt ? format(art.updatedAt, "MMM d, yyyy") : "—"}
                      </td>

                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLive && art.slug && (
                            <Button asChild variant="ghost" size="sm" className="h-9 px-3 rounded-xl gap-1.5 text-teal hover:bg-teal/10 font-bold">
                              <Link href={`/news/${art.slug}`} target="_blank">
                                <Eye className="w-4 h-4" /> View Live
                              </Link>
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm" className="h-9 px-3 rounded-xl gap-1.5 font-bold border-line">
                            <Link href={`/dashboard/writer/articles/${art.id}/edit`}>
                              <Edit className="w-4 h-4" /> Edit
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
