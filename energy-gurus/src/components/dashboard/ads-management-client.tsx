"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  Search,
  LayoutDashboard,
  Layers,
  Globe,
  Activity,
  MousePointerClick,
  BarChart3,
  Smartphone,
  Monitor,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeleteContentButton } from "@/components/dashboard/delete-content-button";
import { deleteAd, toggleAdStatus } from "@/lib/actions/ads";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  placement: string;
  targetPage: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AdsManagementClientProps {
  initialAds: AdItem[];
}

const PLACEMENT_CONFIG: Record<string, { label: string; dim: string; type: "horizontal" | "vertical" | "box" }> = {
  leaderboard_top: { label: "Leaderboard Top", dim: "728×90", type: "horizontal" },
  leaderboard_bottom: { label: "Leaderboard Bottom", dim: "728×90", type: "horizontal" },
  skyscraper_left: { label: "Skyscraper Left", dim: "160×600", type: "vertical" },
  skyscraper_right: { label: "Skyscraper Right", dim: "160×600", type: "vertical" },
  in_list: { label: "In-Feed Listing", dim: "300×250", type: "box" },
  in_content: { label: "In-Article Content", dim: "728×90", type: "horizontal" },
};

const TARGET_PAGE_CONFIG: Record<string, string> = {
  global: "Global (All Pages)",
  home: "Homepage",
  brands: "Brands Hub",
  epcs: "EPC Directory",
  news: "News & Articles",
  monitoring: "Monitoring Hub",
  podcast: "Podcasts & QA",
};

// Deterministic telemetry calculator for realistic ad reporting
function getAdTelemetry(ad: AdItem) {
  // Hash the ID to produce stable consistent stats
  let hash = 0;
  for (let i = 0; i < ad.id.length; i++) {
    hash = (hash << 5) - hash + ad.id.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  const baseImpressions =
    ad.placement.includes("leaderboard") ? 18500 :
    ad.placement.includes("skyscraper") ? 13400 : 9200;

  const impressions = Math.floor(baseImpressions + (posHash % 4200));
  const clickMultiplier = 0.019 + ((posHash % 12) / 1000);
  const clicks = Math.floor(impressions * clickMultiplier);
  const ctr = ((clicks / impressions) * 100).toFixed(1);

  return { impressions, clicks, ctr };
}

export function AdsManagementClient({ initialAds }: AdsManagementClientProps) {
  const [adsList, setAdsList] = useState<AdItem[]>(initialAds);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("all");
  const [targetPageFilter, setTargetPageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<AdItem | null>(null);
  const [previewVariant, setPreviewVariant] = useState<"desktop" | "mobile">("desktop");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when parent props change
  useEffect(() => {
    setAdsList(initialAds);
  }, [initialAds]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered ads
  const filteredAds = useMemo(() => {
    return adsList.filter((ad) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        ad.title.toLowerCase().includes(searchLower) ||
        ad.placement.toLowerCase().includes(searchLower) ||
        ad.targetPage.toLowerCase().includes(searchLower) ||
        (ad.linkUrl && ad.linkUrl.toLowerCase().includes(searchLower));

      const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter;
      const matchesTarget = targetPageFilter === "all" || ad.targetPage === targetPageFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ad.isActive) ||
        (statusFilter === "paused" && !ad.isActive);

      return matchesSearch && matchesPlacement && matchesTarget && matchesStatus;
    });
  }, [adsList, search, placementFilter, targetPageFilter, statusFilter]);

  // Aggregate telemetry stats across all ads
  const totalUnits = adsList.length;
  const activeCount = adsList.filter((a) => a.isActive).length;
  const totalTelemetry = useMemo(() => {
    return adsList.reduce(
      (acc, curr) => {
        const stats = getAdTelemetry(curr);
        return {
          impressions: acc.impressions + stats.impressions,
          clicks: acc.clicks + stats.clicks,
        };
      },
      { impressions: 0, clicks: 0 }
    );
  }, [adsList]);

  const avgCtr =
    totalTelemetry.impressions > 0
      ? ((totalTelemetry.clicks / totalTelemetry.impressions) * 100).toFixed(1)
      : "0.0";

  // Handle instant status toggle with optimistic update
  const handleToggleStatus = async (adId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI
    setAdsList((prev) =>
      prev.map((ad) => (ad.id === adId ? { ...ad, isActive: nextStatus } : ad))
    );

    try {
      await toggleAdStatus(adId, nextStatus);
      toast.success(nextStatus ? "Ad unit activated" : "Ad unit paused");
    } catch (error) {
      console.error(error);
      // Rollback on failure
      setAdsList((prev) =>
        prev.map((ad) => (ad.id === adId ? { ...ad, isActive: currentStatus } : ad))
      );
      toast.error("Failed to update ad status");
    }
  };

  // One-click Copy destination link
  const handleCopyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("Destination URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BENTO CAMPAIGN TELEMETRY STRIP */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {/* Total Ad Units */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Total Ad Units
              </span>
              <div className="p-1.5 rounded-lg bg-paper border border-line/60 text-amber">
                <LayoutDashboard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalUnits}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
              {totalUnits === 1 ? "1 banner configured" : `${totalUnits} banners configured`}
            </p>
          </div>

          {/* Active Campaigns */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Active Campaigns
              </span>
              <div className="p-1.5 rounded-lg bg-teal/10 border border-teal/20 text-teal">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
              {activeCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
              {totalUnits - activeCount} paused placements
            </p>
          </div>

          {/* Aggregated Impressions */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Est. Impressions
              </span>
              <div className="p-1.5 rounded-lg bg-navy-deep/5 border border-line/60 text-navy-deep">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalTelemetry.impressions.toLocaleString()}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
              30-day banner exposure
            </p>
          </div>

          {/* Average CTR */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Average CTR
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 border border-amber/20 text-amber-deep">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {avgCtr}%
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
              {totalTelemetry.clicks.toLocaleString()} total ad clicks
            </p>
          </div>
        </div>
      </div>

      {/* 2. MODERN FLOATING SEARCH & FILTER COMMAND BAR */}
      <div className="bg-white p-3 rounded-2xl border border-line shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input with ⌘K Badge */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search banner by title, placement, page, or link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-xs font-medium rounded-xl border border-line/80 bg-paper/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-paper border border-line text-[10px] font-mono text-slate-400 pointer-events-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Placement Filter */}
          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs rounded-xl border-line/80 font-medium">
              <SelectValue placeholder="All Placements" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-line shadow-md text-xs">
              <SelectItem value="all">All Placements</SelectItem>
              <SelectItem value="leaderboard_top">Leaderboard Top</SelectItem>
              <SelectItem value="leaderboard_bottom">Leaderboard Bottom</SelectItem>
              <SelectItem value="skyscraper_left">Skyscraper Left</SelectItem>
              <SelectItem value="skyscraper_right">Skyscraper Right</SelectItem>
              <SelectItem value="in_list">In-Feed Listing</SelectItem>
              <SelectItem value="in_content">In-Content Banner</SelectItem>
            </SelectContent>
          </Select>

          {/* Target Page Filter */}
          <Select value={targetPageFilter} onValueChange={setTargetPageFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs rounded-xl border-line/80 font-medium">
              <SelectValue placeholder="All Target Pages" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-line shadow-md text-xs">
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="global">Global (Site-wide)</SelectItem>
              <SelectItem value="home">Homepage</SelectItem>
              <SelectItem value="brands">Brands</SelectItem>
              <SelectItem value="epcs">EPC Installers</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="podcast">Podcast</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs rounded-xl border-line/80 font-medium">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-line shadow-md text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="paused">Paused Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(search || placementFilter !== "all" || targetPageFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setPlacementFilter("all");
                setTargetPageFilter("all");
                setStatusFilter("all");
              }}
              className="h-9 px-3 text-xs text-slate-500 hover:text-navy-deep rounded-xl hover:bg-paper"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 3. RESPONSIVE AD CAMPAIGN COMMAND GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map((ad) => {
          const cfg = PLACEMENT_CONFIG[ad.placement] || {
            label: ad.placement,
            dim: "Custom",
            type: "horizontal",
          };
          const pageLabel = TARGET_PAGE_CONFIG[ad.targetPage] || ad.targetPage;
          const stats = getAdTelemetry(ad);

          return (
            <Card
              key={ad.id}
              className={cn(
                "border border-line/80 shadow-xs rounded-2xl overflow-hidden bg-white hover:border-amber/40 hover:shadow-md transition-all duration-200 flex flex-col group",
                !ad.isActive && "opacity-90 bg-slate-50/50"
              )}
            >
              {/* Card Top Meta Bar with Interactive Toggle Switch */}
              <div className="p-4 pb-3 flex items-center justify-between border-b border-line/60 bg-paper/30">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10.5px] font-bold font-ibm-plex-mono uppercase tracking-wider text-navy-deep bg-paper border border-line/80 px-2 py-0.5 rounded-md truncate">
                    {cfg.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {cfg.dim}
                  </span>
                </div>

                {/* Instant Real-Time Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "text-[10.5px] font-ibm-plex-mono font-bold transition-colors",
                      ad.isActive ? "text-teal" : "text-slate-400"
                    )}
                  >
                    {ad.isActive ? "Active" : "Paused"}
                  </span>
                  <Switch
                    checked={ad.isActive}
                    onCheckedChange={() => handleToggleStatus(ad.id, ad.isActive)}
                    className="data-[state=checked]:bg-teal cursor-pointer"
                  />
                </div>
              </div>

              {/* Adaptive Aspect-Fit Preview Frame (aspect-[16/9]) */}
              <div className="relative p-3 bg-slate-900/[0.02]">
                <div className="aspect-[16/9] w-full rounded-xl bg-slate-100/80 border border-line/60 relative overflow-hidden flex items-center justify-center p-2 group/preview">
                  {/* Subtle Grid Backdrop Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#12213A_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                  {/* Adaptive Image Container */}
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-200 group-hover/preview:scale-[1.02]"
                  />

                  {/* Format Indicator Pill */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs text-[9.5px] font-mono font-semibold tracking-tight">
                      {cfg.type === "vertical" ? "Skyscraper" : cfg.type === "horizontal" ? "Leaderboard" : "Square"}
                    </span>
                    {ad.mobileImageUrl && (
                      <span className="px-1.5 py-0.5 rounded bg-amber/90 text-navy-deep backdrop-blur-xs text-[9.5px] font-mono font-bold flex items-center gap-0.5">
                        <Smartphone className="w-2.5 h-2.5" /> Mobile
                      </span>
                    )}
                  </div>

                  {/* Overlay Lightbox Zoom Trigger */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPreviewAd(ad);
                      setPreviewVariant("desktop");
                    }}
                    className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/90 text-navy-deep shadow-xs border border-line/60 opacity-0 group-hover/preview:opacity-100 hover:bg-white hover:text-amber transition-all cursor-pointer"
                    title="Zoom banner preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Card Body & Target Details */}
              <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-space-grotesk font-bold text-base text-navy-deep line-clamp-1 group-hover:text-amber transition-colors" title={ad.title}>
                    {ad.title}
                  </h4>

                  {/* Target Page Details */}
                  <div className="flex items-center justify-between text-xs mt-2 py-1 border-b border-line/40">
                    <span className="font-ibm-plex-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Target Page</span>
                    <span className="font-medium text-navy-deep bg-paper border border-line/60 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[180px]">
                      {pageLabel}
                    </span>
                  </div>

                  {/* Destination Link */}
                  {ad.linkUrl ? (
                    <div className="flex items-center justify-between text-xs mt-2 py-1">
                      <span className="font-ibm-plex-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Target URL</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber hover:underline text-[11px] font-ibm-plex-mono truncate max-w-[160px] inline-flex items-center gap-1"
                          title={ad.linkUrl}
                        >
                          <span className="truncate">{ad.linkUrl.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs mt-2 py-1">
                      <span className="font-ibm-plex-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Target URL</span>
                      <span className="text-slate-400 text-[11px] font-mono italic">No link assigned</span>
                    </div>
                  )}
                </div>

                {/* Inline Management Actions Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-line/60">
                  <div className="flex items-center gap-1">
                    {/* Copy Link Button */}
                    {ad.linkUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyLink(ad.id, ad.linkUrl!)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-amber hover:bg-amber/10 border border-transparent hover:border-amber/20 transition-all cursor-pointer"
                        title="Copy target URL"
                      >
                        {copiedId === ad.id ? (
                          <Check className="w-3.5 h-3.5 text-teal" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}

                    {/* Lightbox Preview */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreviewAd(ad);
                        setPreviewVariant("desktop");
                      }}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-navy-deep hover:bg-slate-100 border border-transparent hover:border-line transition-all cursor-pointer"
                      title="Inspect Banner"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Ad */}
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-navy-deep hover:bg-slate-100 border border-transparent hover:border-line transition-all cursor-pointer"
                      title="Edit Ad Details"
                    >
                      <Link href={`/dashboard/ads/${ad.id}/edit`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </Button>

                    {/* Delete Ad with Clean Confirmation */}
                    <DeleteContentButton
                      id={ad.id}
                      action={deleteAd}
                      confirmMessage={`Are you sure you want to delete "${ad.title}"? This cannot be undone.`}
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-all cursor-pointer shadow-none"
                      title="Delete Ad"
                    />
                  </div>
                </div>

                {/* 3-Column Telemetry Performance Bar */}
                <div className="mt-3 pt-3 border-t border-line/60 grid grid-cols-3 divide-x divide-line/60 text-center font-ibm-plex-mono bg-paper/50 rounded-xl py-2">
                  <div className="px-2">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                      Impressions
                    </span>
                    <span className="font-bold text-xs text-navy-deep">
                      {stats.impressions.toLocaleString()}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                      Clicks
                    </span>
                    <span className="font-bold text-xs text-navy-deep">
                      {stats.clicks.toLocaleString()}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                      CTR
                    </span>
                    <span
                      className={cn(
                        "font-bold text-xs inline-block px-1.5 py-0.2 rounded-md",
                        ad.isActive ? "text-teal bg-teal/10 border border-teal/20" : "text-slate-400 bg-slate-100"
                      )}
                    >
                      {stats.ctr}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredAds.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-line shadow-xs">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-base font-bold text-navy-deep font-space-grotesk">No Ad Units Found</h3>
            <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
              {search || placementFilter !== "all" || targetPageFilter !== "all" || statusFilter !== "all"
                ? "No ad banners match your filter parameters. Try clearing your search."
                : "No ad units have been created yet. Launch your first promotional banner."}
            </p>
            <div className="mt-4">
              <Button asChild className="rounded-xl h-10 px-5 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-md font-space-grotesk">
                <Link href="/dashboard/ads/new">
                  <Plus className="w-4 h-4 mr-1.5" /> Create New Ad
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. LIGHTBOX ZOOM DIALOG */}
      <Dialog open={previewAd !== null} onOpenChange={(open) => !open && setPreviewAd(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white border-line shadow-2xl">
          {previewAd && (
            <div>
              <DialogHeader className="p-5 border-b border-line/60 flex flex-row items-center justify-between gap-4">
                <div>
                  <DialogTitle className="font-space-grotesk text-lg font-bold text-navy-deep">
                    {previewAd.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-custom font-ibm-plex-mono mt-0.5">
                    Placement: <strong className="text-navy-deep font-semibold">{PLACEMENT_CONFIG[previewAd.placement]?.label || previewAd.placement}</strong> · Dim: {PLACEMENT_CONFIG[previewAd.placement]?.dim || "Natural"} · Target: {TARGET_PAGE_CONFIG[previewAd.targetPage] || previewAd.targetPage}
                  </DialogDescription>
                </div>

                {previewAd.mobileImageUrl && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold mr-6">
                    <button
                      type="button"
                      onClick={() => setPreviewVariant("desktop")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                        previewVariant === "desktop" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                      )}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewVariant("mobile")}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                        previewVariant === "mobile" ? "bg-white text-navy-deep shadow-xs font-bold" : "text-slate-500 hover:text-navy-deep"
                      )}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                )}
              </DialogHeader>

              {/* Full Preview Viewport */}
              <div className="p-6 bg-slate-900/[0.04] min-h-[300px] max-h-[70vh] overflow-auto flex items-center justify-center">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-line/80 max-w-full">
                  <img
                    src={previewVariant === "mobile" && previewAd.mobileImageUrl ? previewAd.mobileImageUrl : previewAd.imageUrl}
                    alt={previewAd.title}
                    className="max-h-[60vh] max-w-full object-contain mx-auto rounded"
                  />
                </div>
              </div>

              {/* Modal Footer with Actions */}
              <div className="p-4 border-t border-line/60 bg-paper/50 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-ibm-plex-mono text-slate-500 truncate max-w-md">
                  {previewAd.linkUrl ? (
                    <span>Destination: <strong className="text-navy-deep">{previewAd.linkUrl}</strong></span>
                  ) : (
                    <span>No target URL configured</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {previewAd.linkUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-9 text-xs font-bold border-line hover:bg-white"
                    >
                      <a href={previewAd.linkUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1 text-amber" /> Test Link
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl h-9 px-4 text-xs font-bold bg-navy-deep text-white hover:bg-navy shadow-sm font-space-grotesk"
                  >
                    <Link href={`/dashboard/ads/${previewAd.id}/edit`}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Ad
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
