"use client";

import { useState } from "react";
import { updateLiveQAStatus } from "@/lib/actions/content";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StatusSelectProps {
    id: string;
    initialStatus: 'upcoming' | 'live' | 'archived';
}

export function LiveQAStatusSelect({ id, initialStatus }: StatusSelectProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, setIsPending] = useState(false);

    const handleStatusChange = async (newStatus: 'upcoming' | 'live' | 'archived') => {
        if (newStatus === status) return;

        setIsPending(true);
        try {
            const result = await updateLiveQAStatus(id, newStatus);
            if (result.success) {
                setStatus(newStatus);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="relative inline-block">
            <select
                disabled={isPending}
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg appearance-none cursor-pointer outline-none transition-all pr-8 ${status === 'live' ? 'bg-red-500 text-white shadow-red-500/20' :
                        status === 'upcoming' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                            'bg-slate-500 text-white shadow-slate-500/20'
                    } disabled:opacity-50`}
            >
                <option value="upcoming" className="bg-white text-slate-900">Upcoming</option>
                <option value="live" className="bg-white text-slate-900">Live Now</option>
                <option value="archived" className="bg-white text-slate-900">Archived</option>
            </select>
            {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1.5 text-white" />
            ) : (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
