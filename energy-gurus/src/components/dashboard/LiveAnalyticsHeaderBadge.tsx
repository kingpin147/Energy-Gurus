"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Search, Zap } from "lucide-react";

export function LiveAnalyticsHeaderBadge() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [refreshedAt, setRefreshedAt] = useState<string>("Just now");

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      const now = new Date();
      setRefreshedAt(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    });
  };

  const handleOpenCommand = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Telemetry Status Pill */}
      <div className="bg-teal/10 text-teal px-3 py-1.5 rounded-full text-[0.7rem] font-ibm-plex-mono font-semibold flex items-center gap-2 border border-teal/20 uppercase tracking-wider shadow-2xs">
        <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
        <span>LIVE TELEMETRY</span>
      </div>

      {/* Refresh Button */}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        title={`Click to fetch latest analytics. (Last refreshed: ${refreshedAt})`}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-ibm-plex-mono font-semibold bg-white hover:bg-paper text-navy-deep border border-line hover:border-teal/50 shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 text-teal ${
            isPending ? "animate-spin text-amber" : ""
          }`}
        />
        <span>{isPending ? "Syncing..." : "Refresh Stats"}</span>
      </button>

      {/* Quick Search HUD Button */}
      <button
        type="button"
        onClick={handleOpenCommand}
        title="Open Command Palette (Cmd+K / Ctrl+K)"
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-ibm-plex-mono font-medium bg-white hover:bg-paper text-slate-500 hover:text-navy-deep border border-line hover:border-amber/50 shadow-2xs transition-all cursor-pointer group"
      >
        <Search className="w-3.5 h-3.5 text-amber group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-semibold">Quick Jump</span>
        <kbd className="text-[10px] bg-paper px-1.5 py-0.5 rounded border border-line/80 font-mono text-slate-400 group-hover:text-navy-deep">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}

