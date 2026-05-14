"use client";

import { DialogTrigger } from "@/components/ui/dialog";
import { trackEngagement } from "@/components/shared/AnalyticsTracker";

export function TrackedDialogTrigger({
    children,
    className,
    eventName,
    eventProperties
}: {
    children: React.ReactNode;
    className?: string;
    eventName: string;
    eventProperties?: Record<string, any>;
}) {
    return (
        <DialogTrigger asChild>
            <button
                className={className}
                onClick={() => trackEngagement(eventName, eventProperties)}
            >
                {children}
            </button>
        </DialogTrigger>
    );
}
