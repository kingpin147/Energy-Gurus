"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Pencil,
  Power,
  PowerOff,
  Clock,
  CheckCircle2,
  Newspaper,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteContentButton } from "@/components/dashboard/delete-content-button";
import { deleteNews, toggleNewsStatus } from "@/lib/actions/news";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  authorName?: string | null;
  authorDesignation?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  viewCount?: number;
}

interface NewsTableClientProps {
  initialNews: NewsItem[];
}

const ITEMS_PER_PAGE = 10;

export function NewsTableClient({ initialNews }: NewsTableClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K to focus search input
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

  // Extract distinct categories
  const categories = Array.from(new Set(initialNews.map((item) => item.category).filter(Boolean)));

  // Calculate metrics
  const totalCount = initialNews.length;
  const liveCount = initialNews.filter(
    (a) => Boolean(a.isPublished || (a.publishedAt && new Date(a.publishedAt) <= now))
  ).length;
  const scheduledCount = initialNews.filter((a) => {
    const isLive = Boolean(a.isPublished || (a.publishedAt && new Date(a.publishedAt) <= now));
    return Boolean(!isLive && a.publishedAt && new Date(a.publishedAt) > now);
  }).length;
  const draftCount = totalCount - liveCount - scheduledCount;
  const totalViews = initialNews.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  // Filter articles
  const filtered = initialNews.filter((article) => {
    const isLive = Boolean(article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= now));
    const isScheduled = Boolean(!isLive && article.publishedAt && new Date(article.publishedAt) > now);
    const isDraft = Boolean(!isLive && !isScheduled);

    // Search query
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(searchLower) ||
      article.content.toLowerCase().includes(searchLower) ||
      (article.authorName && article.authorName.toLowerCase().includes(searchLower)) ||
      article.category.toLowerCase().includes(searchLower);

    // Category filter
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "live") matchesStatus = isLive;
    if (statusFilter === "scheduled") matchesStatus = isScheduled;
    if (statusFilter === "draft") matchesStatus = isDraft;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedArticles = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* 1. CONSOLIDATED BENTO METRICS CONTAINER */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {/* Total Articles */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Total Articles
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <Newspaper className="w-3.5 h-3.5 text-amber" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Platform news repo</p>
          </div>

          {/* Live Posts */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Live Posts
              </span>
              <div className="p-1.5 rounded-lg bg-teal/10 text-teal border border-teal/20 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
              {liveCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Published &amp; live</p>
          </div>

          {/* Scheduled */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Scheduled
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep border border-amber/25 group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber-deep tracking-tight">
              {scheduledCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Pending publish date</p>
          </div>

          {/* Drafts */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Drafts
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 group-hover:scale-105 transition-transform">
                <Pencil className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-slate-700 tracking-tight">
              {draftCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Work in progress</p>
          </div>

          {/* Total Views */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors col-span-2 sm:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Total Views
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <Eye className="w-3.5 h-3.5 text-navy-deep" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Cumulative readers</p>
          </div>
        </div>
      </div>

      {/* 2. UPGRADED SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Sleek Floating Pill Search Bar with ⌘K Badge */}
          <div className="relative w-full sm:w-80 group">
            <div className="flex items-center w-full h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs focus-within:ring-2 focus-within:ring-amber/20 focus-within:border-amber transition-all px-3">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-amber transition-colors shrink-0 mr-2.5" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search title, author, category..."
                className="w-full bg-transparent border-none text-xs text-navy-deep placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-line/70 rounded-md select-none shrink-0 ml-1">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-navy-deep w-full sm:w-44 focus:ring-amber/20 focus:border-amber font-sans">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-navy-deep w-full sm:w-36 focus:ring-amber/20 focus:border-amber font-sans">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher (Table vs Grid) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line/50 shrink-0 self-end md:self-auto text-xs font-ibm-plex-mono">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "table" ? "bg-white text-navy-deep shadow-xs border border-line/60" : "text-slate-500 hover:text-navy-deep"
            }`}
            title="Compact Table View"
          >
            <ListIcon className="w-3.5 h-3.5" /> Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "grid" ? "bg-white text-navy-deep shadow-xs border border-line/60" : "text-slate-500 hover:text-navy-deep"
            }`}
            title="Cards Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
      </div>

      {/* 3. TABLE / GRID CONTENT */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-paper/80 border-b border-line/60">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono py-3.5">
                  Article Title &amp; Category
                </TableHead>
                <TableHead className="font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono py-3.5">
                  Author
                </TableHead>
                <TableHead className="font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono py-3.5">
                  Status
                </TableHead>
                <TableHead className="font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono py-3.5">
                  Views
                </TableHead>
                <TableHead className="font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono py-3.5">
                  Publish Date
                </TableHead>
                <TableHead className="font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono py-3.5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.map((article) => {
                const isLive = Boolean(article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= now));
                const isScheduled = Boolean(!isLive && article.publishedAt && new Date(article.publishedAt) > now);

                return (
                  <TableRow
                    key={article.id}
                    className="border-b border-line/40 last:border-0 hover:bg-paper/50 transition-colors duration-150 group"
                  >
                    {/* Title & Refined Modern Thumbnail */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3 max-w-md">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-line/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs group-hover:border-amber/40 transition-colors">
                          {article.imageUrl ? (
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                          ) : (
                            <Newspaper className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/dashboard/news/${article.id}/edit`}
                            className="font-bold text-sm text-navy-deep hover:text-amber transition-colors line-clamp-1"
                          >
                            {article.title}
                          </Link>
                          <span className="inline-block text-[10px] font-ibm-plex-mono font-medium text-slate-500 bg-paper border border-line/60 rounded-md px-2 py-0.5 mt-1">
                            {article.category}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Author */}
                    <TableCell className="py-3.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-navy-deep">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{article.authorName || "Energy Gurus"}</span>
                      </div>
                      {article.authorDesignation && (
                        <p className="text-[10.5px] text-slate-400 font-ibm-plex-mono truncate max-w-[140px] pl-5">
                          {article.authorDesignation}
                        </p>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-ibm-plex-mono px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                          <CheckCircle2 className="w-3 h-3 text-teal" /> Live
                        </span>
                      ) : isScheduled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-ibm-plex-mono px-2 py-0.5 rounded-full bg-amber/10 text-amber-deep border border-amber/25">
                          <Clock className="w-3 h-3 text-amber" /> Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold font-ibm-plex-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Draft
                        </span>
                      )}
                    </TableCell>

                    {/* Views */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-deep font-mono">
                        <Eye className="w-3.5 h-3.5 text-amber shrink-0" />
                        <span>{(article.viewCount || 0).toLocaleString()}</span>
                      </div>
                    </TableCell>

                    {/* Publish Date */}
                    <TableCell className="py-3.5 text-xs text-slate-custom font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {article.publishedAt
                            ? format(new Date(article.publishedAt), "MMM d, yyyy h:mm a")
                            : "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Muted Ghost Actions */}
                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Button */}
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-navy-deep hover:bg-slate-100 border border-transparent hover:border-line transition-all"
                          title="Edit Article"
                        >
                          <Link href={`/dashboard/news/${article.id}/edit`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </Button>

                        {/* Toggle Status Ghost Button */}
                        <form
                          action={async () => {
                            await toggleNewsStatus(article.id, !isLive);
                          }}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-lg border border-transparent transition-all ${
                              isLive
                                ? "text-slate-400 hover:text-amber-deep hover:bg-amber/10 hover:border-amber/20"
                                : "text-slate-400 hover:text-teal hover:bg-teal/10 hover:border-teal/20"
                            }`}
                            title={isLive ? "Unpublish Article" : "Publish Article Immediately"}
                          >
                            {isLive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </Button>
                        </form>

                        {/* Muted Ghost Delete Button */}
                        <DeleteContentButton
                          id={article.id}
                          action={deleteNews}
                          confirmMessage={`Are you sure you want to delete "${article.title}"?`}
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                          title="Delete Article"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-custom font-ibm-plex-mono">
                    <Newspaper className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-semibold text-navy-deep">No news articles found</p>
                    <p className="text-xs text-slate-custom mt-0.5">Try adjusting your search query or filters.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* GRID VIEW (Modern Bento Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedArticles.map((article) => {
            const isLive = Boolean(article.isPublished || (article.publishedAt && new Date(article.publishedAt) <= now));
            const isScheduled = Boolean(!isLive && article.publishedAt && new Date(article.publishedAt) > now);

            return (
              <Card
                key={article.id}
                className="border-line shadow-xs rounded-2xl overflow-hidden bg-white flex flex-col hover:border-amber/40 hover:shadow-sm transition-all duration-200"
              >
                <div className="aspect-[16/9] bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-line p-2">
                  {article.imageUrl ? (
                    <>
                      <img
                        src={article.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none"
                      />
                      <img src={article.imageUrl} alt={article.title} className="relative z-10 w-full h-full object-contain" />
                    </>
                  ) : (
                    <Newspaper className="w-8 h-8 text-slate-400" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-sm border border-white/20">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-slate-600 hover:text-navy-deep hover:bg-slate-100"
                      title="Edit Article"
                    >
                      <Link href={`/dashboard/news/${article.id}/edit`}>
                        <Pencil className="w-3 h-3" />
                      </Link>
                    </Button>
                    <form
                      action={async () => {
                        await toggleNewsStatus(article.id, !isLive);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded-lg ${
                          isLive
                            ? "text-slate-600 hover:text-amber-deep hover:bg-amber/10"
                            : "text-slate-600 hover:text-teal hover:bg-teal/10"
                        }`}
                        title={isLive ? "Unpublish" : "Publish"}
                      >
                        {isLive ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                      </Button>
                    </form>
                    <DeleteContentButton
                      id={article.id}
                      action={deleteNews}
                      confirmMessage={`Delete "${article.title}"?`}
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                      title="Delete Article"
                    />
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-ibm-plex-mono font-medium text-slate-500 bg-paper border border-line/60 rounded-md px-2 py-0.5">
                        {article.category}
                      </span>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-ibm-plex-mono px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                          Live
                        </span>
                      ) : isScheduled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-ibm-plex-mono px-2 py-0.5 rounded-full bg-amber/10 text-amber-deep border border-amber/25">
                          Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold font-ibm-plex-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Draft
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/news/${article.id}/edit`}
                      className="font-bold text-sm text-navy-deep line-clamp-2 hover:text-amber transition-colors"
                    >
                      {article.title}
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-line/60 text-[11px] text-slate-custom flex items-center justify-between font-mono">
                    <div className="flex items-center gap-3">
                      <span>
                        {article.publishedAt ? format(new Date(article.publishedAt), "MMM d, yyyy") : "Draft"}
                      </span>
                      <span className="flex items-center gap-1 text-navy-deep font-semibold">
                        <Eye className="w-3 h-3 text-amber" /> {(article.viewCount || 0).toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/news/${article.id}/edit`}
                      className="text-amber font-bold hover:underline flex items-center gap-0.5"
                    >
                      Edit <Pencil className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-line shadow-xs flex items-center justify-between">
          <p className="text-xs text-slate-custom font-medium font-ibm-plex-mono">
            Showing <strong className="text-navy-deep font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
            <strong className="text-navy-deep font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of{" "}
            <strong className="text-navy-deep font-bold">{filtered.length}</strong> articles
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 rounded-xl text-xs font-semibold gap-1 border-line"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <span className="text-xs font-bold text-navy-deep px-2 font-ibm-plex-mono">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 rounded-xl text-xs font-semibold gap-1 border-line"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
