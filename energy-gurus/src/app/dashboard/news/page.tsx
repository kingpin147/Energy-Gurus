import { db } from "@/db";
import { news } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Plus, Power, PowerOff } from "lucide-react";
import { desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import Link from "next/link";
import { DeleteContentButton } from "@/components/dashboard/delete-content-button";
import { deleteNews, toggleNewsStatus } from "@/lib/actions/news";
import { Badge } from "@/components/ui/badge";

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
                        <p className="text-slate-custom text-sm md:text-base">Manage news articles across the platform.</p>
                    </div>
                </div>
                <Button asChild className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90">
                    <Link href="/dashboard/news/new">
                        <Plus className="w-4 h-4 mr-2" /> Create Article
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allNews.map((article) => (
                    <Card key={article.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all flex flex-col">
                        <div className="aspect-[3/2] bg-slate-100 flex items-center justify-center relative border-b border-paper p-0">
                            {article.imageUrl ? (
                                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                            ) : (
                                <Newspaper className="w-10 h-10 text-slate-300" />
                            )}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur rounded-lg p-1">
                                <form action={async () => { "use server"; await toggleNewsStatus(article.id, !article.isPublished); }}>
                                    <Button type="submit" variant={article.isPublished ? "destructive" : "default"} size="icon" className="h-8 w-8 rounded-lg shadow-sm" title={article.isPublished ? "Unpublish Article" : "Publish Article"}>
                                        {article.isPublished ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    </Button>
                                </form>
                                <DeleteContentButton
                                    id={article.id}
                                    action={deleteNews}
                                    confirmMessage={`Are you sure you want to delete the article "${article.title}"?`}
                                />
                            </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <Badge variant="outline" className="mb-2 bg-paper/50">
                                    {article.category}
                                </Badge>
                                <Badge variant={article.isPublished ? "default" : "secondary"} className={article.isPublished ? "bg-teal text-white" : ""}>
                                    {article.isPublished ? "Published" : "Draft"}
                                </Badge>
                            </div>
                            
                            <h4 className="font-bold text-lg line-clamp-2 mt-1">{article.title}</h4>
                            
                            <div className="text-sm text-slate-custom mt-3 line-clamp-3">
                                {article.content}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {allNews.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-custom bg-white rounded-3xl border border-dashed border-slate-custom/30 shadow-sm">
                        <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold mb-1">No Articles Found</h3>
                        <p className="text-sm">Click the "Create Article" button to publish your first news article.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
