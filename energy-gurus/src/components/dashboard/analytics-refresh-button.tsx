"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { refreshAnalytics } from "@/lib/actions/analytics-actions";

export function AnalyticsRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<string>("Live");

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await refreshAnalytics();
        router.refresh();
        const now = new Date();
        setLastRefreshed(
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        );
      } catch (err) {
        console.error("Failed to refresh analytics:", err);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      className="h-9 px-4 rounded-xl bg-amber hover:bg-amber-deep text-navy-deep text-xs font-bold gap-1.5 shadow-sm transition-all active:scale-98 inline-flex items-center cursor-pointer disabled:opacity-50"
    >
      <RefreshCw className={`w-3.5 h-3.5 text-navy-deep ${isPending ? "animate-spin" : ""}`} />
      <span>Refresh</span>
      <span className="text-[10px] opacity-75 font-mono hidden sm:inline">
        ({lastRefreshed})
      </span>
    </button>
  );
}
