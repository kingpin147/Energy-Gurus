"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BrandModerationQueue } from "@/components/dashboard/BrandModerationQueue";
import { WriterModerationQueue, WriterModerationItem } from "@/components/dashboard/writer-moderation-queue";
import { ArticleModerationQueue, ArticleModerationItem } from "@/components/dashboard/article-moderation-queue";
import { Building2, UserCheck, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationPortalTabsProps {
  brands: any[];
  writers: WriterModerationItem[];
  articles: ArticleModerationItem[];
}

export function ModerationPortalTabs({ brands, writers, articles }: ModerationPortalTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab");
  const defaultTab = initialTab === "articles" ? "articles" : initialTab === "writers" ? "writers" : "brands";
  const [activeTab, setActiveTab] = useState<"brands" | "writers" | "articles">(defaultTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "articles" || tabParam === "writers" || tabParam === "brands") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: "brands" | "writers" | "articles") => {
    setActiveTab(tab);
    router.replace(`/dashboard/moderation?tab=${tab}`, { scroll: false });
  };

  const pendingBrands = brands.filter((b) => b.status === "pending_review").length;
  const pendingWriters = writers.filter((w) => w.status === "pending_review").length;
  const pendingArticles = articles.filter((a) => a.status === "pending_review").length;

  return (
    <div className="space-y-6">
      {/* 1. INTERACTIVE METRIC CARDS AS PRIMARY TABS */}
      {/* Condenses the triple-nested navigation into a single interactive tier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Brands Queue Switcher */}
        <button
          type="button"
          onClick={() => handleTabChange("brands")}
          className={cn(
            "text-left p-5 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition-all duration-200 group cursor-pointer focus:outline-none",
            activeTab === "brands"
              ? "border-amber ring-2 ring-amber/25 shadow-sm"
              : "border-line hover:border-amber/50 hover:bg-paper/30"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 transition-all",
              activeTab === "brands" ? "bg-amber" : "bg-transparent group-hover:bg-amber/40"
            )}
          />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono flex items-center gap-1.5">
              <span>Brand Queue</span>
              {activeTab === "brands" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              )}
            </span>
            <div
              className={cn(
                "p-1.5 rounded-lg border transition-colors",
                activeTab === "brands"
                  ? "bg-amber/15 text-amber border-amber/30"
                  : "bg-paper text-slate-400 border-line/60 group-hover:text-amber"
              )}
            >
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">
              {pendingBrands}
            </div>
            <span className="text-xs font-bold text-slate-500 font-ibm-plex-mono">Pending</span>
            {pendingBrands > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-amber/20 text-amber-deep border border-amber/30 font-mono">
                Needs Review
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-ibm-plex-mono mt-1 truncate">
            {brands.length} total brand profiles
          </p>
        </button>

        {/* Writers Queue Switcher */}
        <button
          type="button"
          onClick={() => handleTabChange("writers")}
          className={cn(
            "text-left p-5 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition-all duration-200 group cursor-pointer focus:outline-none",
            activeTab === "writers"
              ? "border-navy-deep ring-2 ring-navy-deep/25 shadow-sm"
              : "border-line hover:border-navy-deep/50 hover:bg-paper/30"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 transition-all",
              activeTab === "writers" ? "bg-navy-deep" : "bg-transparent group-hover:bg-navy-deep/40"
            )}
          />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono flex items-center gap-1.5">
              <span>Writer Queue</span>
              {activeTab === "writers" && (
                <span className="w-1.5 h-1.5 rounded-full bg-navy-deep animate-pulse" />
              )}
            </span>
            <div
              className={cn(
                "p-1.5 rounded-lg border transition-colors",
                activeTab === "writers"
                  ? "bg-navy-deep text-white border-navy-deep"
                  : "bg-paper text-slate-400 border-line/60 group-hover:text-navy-deep"
              )}
            >
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">
              {pendingWriters}
            </div>
            <span className="text-xs font-bold text-slate-500 font-ibm-plex-mono">Pending</span>
            {pendingWriters > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-navy-deep/10 text-navy-deep border border-navy-deep/20 font-mono">
                Needs Review
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-ibm-plex-mono mt-1 truncate">
            {writers.length} registered authors
          </p>
        </button>

        {/* Articles Queue Switcher */}
        <button
          type="button"
          onClick={() => handleTabChange("articles")}
          className={cn(
            "text-left p-5 rounded-2xl bg-white border shadow-xs relative overflow-hidden transition-all duration-200 group cursor-pointer focus:outline-none",
            activeTab === "articles"
              ? "border-teal ring-2 ring-teal/25 shadow-sm"
              : "border-line hover:border-teal/50 hover:bg-paper/30"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 transition-all",
              activeTab === "articles" ? "bg-teal" : "bg-transparent group-hover:bg-teal/40"
            )}
          />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono flex items-center gap-1.5">
              <span>Article Queue</span>
              {activeTab === "articles" && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              )}
            </span>
            <div
              className={cn(
                "p-1.5 rounded-lg border transition-colors",
                activeTab === "articles"
                  ? "bg-teal/15 text-teal border-teal/30"
                  : "bg-paper text-slate-400 border-line/60 group-hover:text-teal"
              )}
            >
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">
              {pendingArticles}
            </div>
            <span className="text-xs font-bold text-slate-500 font-ibm-plex-mono">Pending</span>
            {pendingArticles > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-teal/15 text-teal border border-teal/25 font-mono">
                Needs Review
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-ibm-plex-mono mt-1 truncate">
            {articles.length} submitted pieces
          </p>
        </button>
      </div>

      {/* 2. DIRECT QUEUE CONTENT (Eliminated redundant primary tab row) */}
      <div className="transition-all duration-200 animate-in fade-in-50">
        {activeTab === "brands" && <BrandModerationQueue brands={brands} />}
        {activeTab === "writers" && <WriterModerationQueue writers={writers} />}
        {activeTab === "articles" && <ArticleModerationQueue articles={articles} />}
      </div>
    </div>
  );
}
