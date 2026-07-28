import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64 rounded-[4px]" />
                    <Skeleton className="h-4 w-48 rounded-[4px] opacity-60" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-11 w-32 rounded-[20px]" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-[6px] bg-white border border-line shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-4 w-24 rounded-[2px]" />
                            <Skeleton className="h-8 w-8 rounded-[4px]" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-16 rounded-[4px]" />
                            <Skeleton className="h-3 w-12 rounded-[2px] opacity-40" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart and Table Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 md:p-8 rounded-[6px] bg-white border border-line shadow-sm min-h-[400px] flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-48 rounded-[4px]" />
                        </div>
                        <Skeleton className="flex-1 w-full rounded-[4px] opacity-40 bg-paper" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-[6px] bg-ink border border-line shadow-sm min-h-[400px] space-y-6">
                        <Skeleton className="h-6 w-40 rounded-[4px] bg-white/20" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-[52px] w-full rounded-[3px] bg-white/10" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
