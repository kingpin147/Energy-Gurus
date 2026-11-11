import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300 p-6 md:p-8 max-w-7xl mx-auto font-sans">
            {/* 1. Modern Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="h-8 w-48 rounded-xl bg-slate-200/80" />
                        <Skeleton className="h-5 w-20 rounded-full bg-amber/15" />
                    </div>
                    <Skeleton className="h-4 w-72 rounded-lg bg-slate-200/50" />
                </div>
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <Skeleton className="h-10 w-32 rounded-xl bg-slate-200/60" />
                    <Skeleton className="h-10 w-28 rounded-xl bg-amber/20" />
                </div>
            </div>

            {/* 2. Modern Bento Telemetry HUD Grid (5 Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[
                    { bar: "bg-navy-deep", titleW: "w-24", valW: "w-10" },
                    { bar: "bg-teal", titleW: "w-20", valW: "w-8" },
                    { bar: "bg-amber", titleW: "w-24", valW: "w-12" },
                    { bar: "bg-amber", titleW: "w-20", valW: "w-10" },
                    { bar: "bg-navy-deep", titleW: "w-28", valW: "w-14" },
                ].map((card, i) => (
                    <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden space-y-3"
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${card.bar}`} />
                        <div className="flex items-center justify-between pt-0.5">
                            <Skeleton className={`h-3 ${card.titleW} rounded bg-slate-200/70`} />
                            <Skeleton className="h-6 w-6 rounded-lg bg-slate-100" />
                        </div>
                        <div className="space-y-1.5">
                            <Skeleton className={`h-7 ${card.valW} rounded-lg bg-slate-200/90`} />
                            <Skeleton className="h-2.5 w-24 rounded bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Modern Segmented Tabs Bar Skeleton */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 gap-1.5">
                    <Skeleton className="h-8 w-44 rounded-lg bg-white shadow-xs" />
                    <Skeleton className="h-8 w-36 rounded-lg bg-slate-200/40" />
                    <Skeleton className="h-8 w-36 rounded-lg bg-slate-200/40" />
                </div>
                <Skeleton className="h-4 w-40 rounded-lg bg-slate-200/40" />
            </div>

            {/* 4. Modern Search & Filter HUD Bar Skeleton */}
            <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                    <Skeleton className="h-10 w-full sm:w-80 rounded-xl bg-slate-100 border border-slate-200/60" />
                    <Skeleton className="h-10 w-full sm:w-44 rounded-xl bg-slate-100 border border-slate-200/60" />
                    <Skeleton className="h-10 w-full sm:w-40 rounded-xl bg-slate-100 border border-slate-200/60" />
                </div>
            </div>

            {/* 5. Modern Bento Data Canvas Table Skeleton */}
            <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
                {/* Table Header Row */}
                <div className="bg-paper/80 border-b border-line/60 py-3.5 px-5 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                        <Skeleton className="h-3 w-24 rounded bg-slate-200/80" />
                    </div>
                    <div className="col-span-3">
                        <Skeleton className="h-3 w-28 rounded bg-slate-200/80" />
                    </div>
                    <div className="col-span-2">
                        <Skeleton className="h-3 w-20 rounded bg-slate-200/80" />
                    </div>
                    <div className="col-span-2">
                        <Skeleton className="h-3 w-24 rounded bg-slate-200/80" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <Skeleton className="h-3 w-16 rounded bg-slate-200/80" />
                    </div>
                </div>

                {/* Table Shimmer Rows */}
                <div className="divide-y divide-line/40">
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                        <div
                            key={row}
                            className="py-4 px-5 grid grid-cols-12 gap-4 items-center hover:bg-paper/30 transition-colors"
                        >
                            {/* Profile Col: Avatar + Name */}
                            <div className="col-span-3 flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full bg-slate-200/80 shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-32 rounded bg-slate-200/80" />
                                    <Skeleton className="h-2.5 w-20 rounded bg-slate-100" />
                                </div>
                            </div>

                            {/* Email Col */}
                            <div className="col-span-3">
                                <Skeleton className="h-3.5 w-40 rounded bg-slate-200/60" />
                            </div>

                            {/* Role Badge Col */}
                            <div className="col-span-2">
                                <Skeleton className="h-6 w-20 rounded-full bg-slate-100 border border-slate-200/60" />
                            </div>

                            {/* Status Col */}
                            <div className="col-span-2">
                                <Skeleton className="h-6 w-16 rounded-full bg-teal/15" />
                            </div>

                            {/* Action Col */}
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <Skeleton className="h-8 w-20 rounded-xl bg-slate-100 border border-slate-200/60" />
                                <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
