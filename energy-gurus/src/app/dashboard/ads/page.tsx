import { db } from "@/db";
import { ads } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Plus, Power, PowerOff } from "lucide-react";
import { desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import Link from "next/link";
import { DeleteContentButton } from "@/components/dashboard/delete-content-button";
import { deleteAd, toggleAdStatus } from "@/lib/actions/ads";
import { Badge } from "@/components/ui/badge";

export default async function AdsManagementPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const allAds = await db.select().from(ads).orderBy(desc(ads.createdAt));

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber/20">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ads Management</h1>
                        <p className="text-slate-custom text-sm md:text-base">Manage banner ads across the platform.</p>
                    </div>
                </div>
                <Button asChild className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90">
                    <Link href="/dashboard/ads/new">
                        <Plus className="w-4 h-4 mr-2" /> Add New Ad
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allAds.map((ad) => (
                    <Card key={ad.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all flex flex-col">
                        <div className="aspect-[3/1] bg-slate-100 flex items-center justify-center relative border-b border-paper p-4">
                            <img src={ad.imageUrl} alt={ad.title} className="max-w-full max-h-full object-contain" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <form action={toggleAdStatus.bind(null, ad.id, !ad.isActive)}>
                                    <Button type="submit" variant={ad.isActive ? "destructive" : "default"} size="icon" className="h-8 w-8 rounded-lg shadow-sm" title={ad.isActive ? "Deactivate Ad" : "Activate Ad"}>
                                        {ad.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    </Button>
                                </form>
                                <DeleteContentButton
                                    id={ad.id}
                                    action={deleteAd}
                                    confirmMessage={`Are you sure you want to delete the ad "${ad.title}"?`}
                                />
                            </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-lg line-clamp-1">{ad.title}</h4>
                                <Badge variant={ad.isActive ? "default" : "secondary"} className={ad.isActive ? "bg-teal text-white" : ""}>
                                    {ad.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="text-xs flex justify-between">
                                    <span className="font-bold text-slate-custom uppercase tracking-wider opacity-60">Placement</span>
                                    <span className="font-medium bg-paper/50 px-2 py-0.5 rounded-md">{ad.placement}</span>
                                </div>
                                <div className="text-xs flex justify-between mt-1">
                                    <span className="font-bold text-slate-custom uppercase tracking-wider opacity-60">Target Page</span>
                                    <span className="font-medium bg-paper/50 px-2 py-0.5 rounded-md capitalize">{ad.targetPage}</span>
                                </div>
                                {ad.linkUrl && (
                                    <div className="text-xs flex justify-between mt-3 pt-3 border-t border-paper/50">
                                        <span className="font-bold text-slate-custom uppercase tracking-wider opacity-60">Link</span>
                                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-amber hover:underline truncate max-w-[150px] font-medium">
                                            {ad.linkUrl}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {allAds.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-custom bg-white rounded-3xl border border-dashed border-slate-custom/30 shadow-sm">
                        <LayoutDashboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold mb-1">No Ads Found</h3>
                        <p className="text-sm">Click the "Add New Ad" button to create your first banner.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
