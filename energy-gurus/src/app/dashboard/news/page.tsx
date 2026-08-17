import { db } from "@/db";
import { news } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Newspaper, Plus } from "lucide-react";
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
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber/20">
                        <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">News Management</h1>
                        <p className="text-slate-custom text-sm md:text-base">Manage, edit, search, and schedule news articles across the platform.</p>
                    </div>
                </div>
                <Button asChild className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90">
                    <Link href="/dashboard/news/new">
                        <Plus className="w-4 h-4 mr-2" /> Create Article
                    </Link>
                </Button>
            </div>

            {/* Compact Table Hub with Search, Filters, and Pagination */}
            <NewsTableClient initialNews={allNews} />
        </div>
    );
}
