import { db } from "@/db";
import { ads } from "@/db/schema";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import Link from "next/link";
import { AdsManagementClient } from "@/components/dashboard/ads-management-client";

export const dynamic = "force-dynamic";

export default async function AdsManagementPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const allAds = await db.select().from(ads).orderBy(desc(ads.createdAt));

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                        <LayoutDashboard className="w-6 h-6 text-navy-deep" />
                    </div>
                    <div>
                        <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">
                            Ads Management
                        </h1>
                        <p className="text-slate-custom text-xs md:text-sm">
                            Manage, monitor telemetry, and schedule banner ad campaigns across platform slots.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        className="rounded-xl h-10 px-5 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-md font-space-grotesk cursor-pointer"
                    >
                        <Link href="/dashboard/ads/new">
                            <Plus className="w-4 h-4 mr-1.5" /> Add New Ad
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Modern Ads Campaign HUD Client Component */}
            <AdsManagementClient initialAds={allAds} />
        </div>
    );
}
