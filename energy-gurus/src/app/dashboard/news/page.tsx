import { db } from "@/db";
import { news } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Newspaper, Plus, ShieldCheck } from "lucide-react";
import { desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import Link from "next/link";
import { NewsTableClient } from "@/components/dashboard/news-table-client";

export default async function NewsManagementPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const allNews = await db.select().from(news).orderBy(desc(news.createdAt));

    return (
        <div className="p-4 md:p-8 space-y-8 font-sans max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                        <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">News Management</h1>
                        <p className="text-slate-custom text-sm md:text-base">Manage, edit, search, and schedule news articles across the platform.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs border-line hover:bg-paper">
                        <Link href="/dashboard/moderation?tab=articles">
                            <ShieldCheck className="w-4 h-4 mr-1.5 text-amber" /> Review Writer Submissions
                        </Link>
                    </Button>
                    <Button asChild className="rounded-xl h-10 px-5 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-md font-space-grotesk">
                        <Link href="/dashboard/news/new">
                            <Plus className="w-4 h-4 mr-1.5" /> Create Article
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Compact Table Hub with Search, Filters, and Pagination */}
            <NewsTableClient initialNews={allNews} />
        </div>
    );
}
