"use client";

import { useState, useTransition } from "react";
import { Power, PowerOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleUserStatus } from "@/lib/actions/users";
import { toast } from "sonner";

interface UserStatusButtonProps {
    userId: string;
    initialActive: boolean;
    userName?: string;
    compact?: boolean;
}

export function UserStatusButton({ userId, initialActive, userName, compact = false }: UserStatusButtonProps) {
    const [isActive, setIsActive] = useState(initialActive);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const nextState = !isActive;
        // Optimistic UI update
        setIsActive(nextState);

        startTransition(async () => {
            try {
                const res = await toggleUserStatus(userId);
                if (res?.isActive !== undefined) {
                    setIsActive(res.isActive);
                    toast.success(
                        res.isActive 
                            ? `User ${userName || ''} activated successfully` 
                            : `User ${userName || ''} deactivated successfully`
                    );
                } else {
                    toast.success(
                        nextState 
                            ? `User ${userName || ''} activated` 
                            : `User ${userName || ''} deactivated`
                    );
                }
            } catch (err: any) {
                // Revert optimistic state
                setIsActive(!nextState);
                toast.error(err?.message || "Failed to update user status");
            }
        });
    };

    if (compact) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                disabled={isPending}
                className={`h-8 w-8 rounded-lg border border-transparent transition-all ${
                    isActive
                        ? "text-teal hover:bg-teal/10 hover:border-teal/20"
                        : "text-slate-400 hover:text-amber-deep hover:bg-amber/10 hover:border-amber/25"
                }`}
                title={isActive ? "Deactivate User" : "Activate User"}
            >
                {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isActive ? (
                    <Power className="w-3.5 h-3.5" />
                ) : (
                    <PowerOff className="w-3.5 h-3.5" />
                )}
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={`h-8 px-3 rounded-lg gap-1.5 text-xs font-semibold font-ibm-plex-mono transition-all border ${
                isActive
                    ? "text-teal bg-teal/10 border-teal/20 hover:bg-teal/20 hover:text-teal"
                    : "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200"
            }`}
        >
            {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : isActive ? (
                <Power className="w-3 h-3 text-teal" />
            ) : (
                <PowerOff className="w-3 h-3 text-slate-500" />
            )}
            <span>{isActive ? "Active" : "Inactive"}</span>
        </Button>
    );
}
