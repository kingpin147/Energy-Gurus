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
}

export function UserStatusButton({ userId, initialActive, userName }: UserStatusButtonProps) {
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

    return (
        <Button
            type="button"
            variant={isActive ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={`h-9 px-4 rounded-xl gap-2 font-bold transition-all shadow-sm ${
                isActive
                    ? "text-emerald-700 bg-emerald-50/60 border-emerald-200/80 hover:bg-emerald-100/80 hover:text-emerald-800 hover:border-emerald-300"
                    : "bg-red-600 hover:bg-red-700 text-white border-transparent"
            }`}
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isActive ? (
                <Power className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
                <PowerOff className="w-3.5 h-3.5" />
            )}
            <span>{isActive ? "Active" : "Inactive"}</span>
        </Button>
    );
}
