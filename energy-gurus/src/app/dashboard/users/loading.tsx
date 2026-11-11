import { Skeleton } from "@/components/ui/skeleton";

export default function UserManagementLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300 p-6 md:p-8 max-w-7xl mx-auto font-sans">
            {/* 1. Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="h-8 w-56 rounded-xl bg-slate-200/80" />
                        <Skeleton className="h-5 w-20 rounded-full bg-amber/15" />
                    </div>
                    <Skeleton className="h-4 w-80 rounded-lg bg-slate-200/50" />
                </div>
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <Skeleton className="h-10 w-36 rounded-xl bg-slate-200/60" />
                    <Skeleton className="h-10 w-32 rounded-xl bg-amber/20" />
                </div>
            </div>

            {/* 2. 5 Bento Telemetry HUD Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[
                    { bar: "bg-navy-deep", title: "w-24", val: "w-10", sub: "w-24" },
                    { bar: "bg-teal", title: "w-20", val: "w-8", sub: "w-28" },
                    { bar: "bg-amber", title: "w-24", val: "w-10", sub: "w-20" },
                    { bar: "bg-amber", title: "w-20", val: "w-10", sub: "w-20" },
                    { bar: "bg-navy-deep", title: "w-28", val: "w-12", sub: "w-24" },
                ].map((card, i) => (
                    <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden space-y-3"
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${card.bar}`} />
                        <div className="flex items-center justify-between pt-0.5">
                            <Skeleton className={`h-3 ${card.title} rounded bg-slate-200/70`} />
                            <Skeleton className="h-6 w-6 rounded-lg bg-slate-100" />
                        </div>
                        <div className="space-y-1.5">
                            <Skeleton className={`h-8 ${card.val} rounded-lg bg-slate-200/90`} />
                            <Skeleton className={`h-2.5 ${card.sub} rounded bg-slate-100`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Segmented Tabs Bar Skeleton */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 gap-1.5">
                    <Skeleton className="h-8 w-44 rounded-lg bg-white shadow-xs" />
                    <Skeleton className="h-8 w-40 rounded-lg bg-slate-200/40" />
                    <Skeleton className="h-8 w-44 rounded-lg bg-slate-200/40" />
                </div>
                <Skeleton className="h-4 w-36 rounded-lg bg-slate-200/40" />
            </div>

            {/* 4. Search & Filters Bar Skeleton */}
            <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                    <Skeleton className="h-10 w-full sm:w-80 rounded-xl bg-slate-100 border border-slate-200/60" />
                    <Skeleton className="h-10 w-full sm:w-44 rounded-xl bg-slate-100 border border-slate-200/60" />
                    <Skeleton className="h-10 w-full sm:w-40 rounded-xl bg-slate-100 border border-slate-200/60" />
                </div>
            </div>

            {/* 5. Modern Bento Table Canvas Skeleton */}
            <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
                {/* Table Header */}
                <div className="bg-paper/80 border-b border-line/60 py-3.5 px-5 grid grid-cols-12 gap-4 items-center font-ibm-plex-mono text-[11px] font-bold text-navy-deep uppercase tracking-wider">
                    <div className="col-span-3">User Profile</div>
                    <div className="col-span-3">Email Address</div>
                    <div className="col-span-2">Role &amp; Badge</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2">Activity</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Rows Shimmer */}
                <div className="divide-y divide-line/40">
                    {[1, 2, 3, 4, 5, 6, 7].map((row) => (
                        <div
                            key={row}
                            className="py-3.5 px-5 grid grid-cols-12 gap-4 items-center hover:bg-paper/30 transition-colors"
                        >
                            {/* Profile (Avatar + Name) */}
                            <div className="col-span-3 flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full bg-slate-200/80 shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-32 rounded bg-slate-200/80" />
                                    <Skeleton className="h-2.5 w-16 rounded bg-slate-100" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="col-span-3">
                                <Skeleton className="h-3.5 w-40 rounded bg-slate-200/60" />
                            </div>

                            {/* Role Badge */}
                            <div className="col-span-2">
                                <Skeleton className="h-6 w-20 rounded-full bg-slate-100 border border-slate-200/60" />
                            </div>

                            {/* Account Status Toggle */}
                            <div className="col-span-1">
                                <Skeleton className="h-6 w-16 rounded-full bg-teal/15" />
                            </div>

                            {/* Activity / Last Active */}
                            <div className="col-span-2 space-y-1">
                                <Skeleton className="h-3.5 w-20 rounded bg-slate-200/70" />
                                <Skeleton className="h-2.5 w-24 rounded bg-slate-100" />
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end gap-2">
                                <Skeleton className="h-7 w-16 rounded-lg bg-slate-100 border border-slate-200/60" />
                                <Skeleton className="h-7 w-7 rounded-lg bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
