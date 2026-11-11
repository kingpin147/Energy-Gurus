"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Video,
  Mic,
  Plus,
  Search,
  Youtube,
  Calendar,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clock,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PodcastForm } from "@/components/forms/podcast-form";
import { LiveQAForm } from "@/components/forms/live-qa-form";
import { DeleteContentButton } from "@/components/dashboard/delete-content-button";
import { deletePodcast, deleteLiveQA } from "@/lib/actions/content";
import { LiveQAStatusSelect } from "@/components/dashboard/live-qa-status-select";
import { EditPodcastDialog } from "@/components/dashboard/edit-podcast-dialog";

export interface PodcastItem {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  guestName: string | null;
  createdAt: Date | string;
}

export interface LiveQAItem {
  id: string;
  topic: string;
  description: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  expertName: string | null;
  expertPhotoUrl?: string | null;
  sessionDate: Date | string | null;
  status: "upcoming" | "live" | "archived";
  createdAt: Date | string;
}

interface ContentManagementClientProps {
  initialPodcasts: PodcastItem[];
  initialLiveQA: LiveQAItem[];
}

export function ContentManagementClient({
  initialPodcasts,
  initialLiveQA,
}: ContentManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"podcasts" | "liveqa">("podcasts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Filtered podcasts
  const filteredPodcasts = useMemo(() => {
    let result = [...initialPodcasts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.guestName && p.guestName.toLowerCase().includes(q)) ||
          p.youtubeUrl.toLowerCase().includes(q)
      );
    }
    if (sortOrder === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return result;
  }, [initialPodcasts, search, sortOrder]);

  // Filtered Live QA sessions
  const filteredLiveQA = useMemo(() => {
    let result = [...initialLiveQA];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (qa) =>
          qa.topic.toLowerCase().includes(q) ||
          (qa.expertName && qa.expertName.toLowerCase().includes(q)) ||
          qa.youtubeUrl.toLowerCase().includes(q)
      );
    }
    if (sortOrder === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return result;
  }, [initialLiveQA, search, sortOrder]);

  // Metrics
  const totalPodcasts = initialPodcasts.length;
  const totalLiveQA = initialLiveQA.length;
  const scheduledCount = initialLiveQA.filter((qa) => qa.status === "upcoming" || (qa.status as string) === "scheduled").length;
  const liveCount = initialLiveQA.filter((qa) => qa.status === "live").length;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & MODAL TRIGGER ACTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">
              Content Management
            </h1>
            <p className="text-slate-custom text-xs md:text-sm mt-0.5 font-ibm-plex-mono">
              Manage YouTube video broadcasts, podcast episodes, and live Q&amp;A sessions.
            </p>
          </div>
        </div>

        {/* Dynamic Action Button based on Active Tab */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-xl gap-2 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-md font-space-grotesk cursor-pointer transition-all hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "podcasts" ? "Add New Podcast" : "Schedule Live Q&A"}
          </Button>
        </div>
      </div>

      {/* 2. CONSOLIDATED BENTO METRICS BAR */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {/* Total Podcasts */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Total Podcasts
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <Mic className="w-3.5 h-3.5 text-amber" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalPodcasts}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Published podcast episodes</p>
          </div>

          {/* Total Live QA */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Live Q&amp;A Sessions
              </span>
              <div className="p-1.5 rounded-lg bg-teal/10 text-teal border border-teal/20 group-hover:scale-105 transition-transform">
                <Video className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
              {totalLiveQA}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Expert interactive sessions</p>
          </div>

          {/* Scheduled Sessions */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Upcoming / Scheduled
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep border border-amber/25 group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber-deep tracking-tight">
              {scheduledCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Pending live broadcast</p>
          </div>

          {/* Active Live */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Live Broadcasts
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <Youtube className="w-3.5 h-3.5 text-navy-deep" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {liveCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Currently streaming</p>
          </div>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS & SEARCH TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Segmented Tab Pill */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line/50 text-xs font-ibm-plex-mono w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("podcasts");
              setSearch("");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "podcasts"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber" />
            Podcasts ({totalPodcasts})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("liveqa");
              setSearch("");
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "liveqa"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-teal" />
            Live Q&amp;A ({totalLiveQA})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 justify-end">
          <div className="relative w-full sm:w-72 group">
            <div className="flex items-center w-full h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs focus-within:ring-2 focus-within:ring-amber/20 focus-within:border-amber transition-all px-3">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-amber transition-colors shrink-0 mr-2.5" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "podcasts" ? "Search episode or guest..." : "Search QA topic or expert..."}
                className="w-full bg-transparent border-none text-xs text-navy-deep placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-line/70 rounded-md select-none shrink-0 ml-1">
                ⌘K
              </kbd>
            </div>
          </div>

          <Select
            value={sortOrder}
            onValueChange={(val: "latest" | "oldest") => setSortOrder(val)}
          >
            <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-navy-deep w-36 focus:ring-amber/20 focus:border-amber font-sans">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. FULL-WIDTH 3-COLUMN BENTO GRID CONTENT (100% Screen Width) */}
      {activeTab === "podcasts" ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts.map((podcast) => (
              <Card
                key={podcast.id}
                className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white flex flex-col hover:border-amber/40 hover:shadow-sm transition-all duration-200 group"
              >
                {/* 16:9 Video Thumbnail */}
                <div className="aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {podcast.thumbnailUrl ? (
                    <img
                      src={podcast.thumbnailUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={podcast.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <Youtube className="w-10 h-10 text-red-500" />
                      <span className="text-[11px] font-mono">No Thumbnail</span>
                    </div>
                  )}

                  {/* Corner Actions Overlay */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-xl p-1 shadow-md border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
                    <EditPodcastDialog podcast={podcast} />
                    <DeleteContentButton
                      id={podcast.id}
                      action={deletePodcast}
                      confirmMessage={`Are you sure you want to delete "${podcast.title}"?`}
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg text-white/70 hover:text-red-400 hover:bg-white/10"
                      title="Delete Podcast"
                    />
                  </div>

                  {/* YouTube Tag */}
                  <div className="absolute bottom-2.5 left-2.5 bg-navy-deep/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                    <Youtube className="w-3 h-3 text-red-500" /> Episode
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-space-grotesk font-bold text-base text-navy-deep line-clamp-2 group-hover:text-amber transition-colors">
                      {podcast.title}
                    </h3>
                    {podcast.guestName && (
                      <p className="text-xs text-slate-500 mt-1 font-ibm-plex-mono flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber" />
                        <span>Guest: <strong className="text-navy-deep">{podcast.guestName}</strong></span>
                      </p>
                    )}
                    {podcast.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {podcast.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-line/60 flex items-center justify-between gap-2 text-xs font-ibm-plex-mono">
                    <span className="text-[11px] text-slate-400">
                      {format(new Date(podcast.createdAt), "MMM d, yyyy")}
                    </span>

                    <a
                      href={podcast.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber hover:text-amber-deep hover:underline"
                    >
                      <span>Watch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPodcasts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-line text-center text-slate-custom font-ibm-plex-mono shadow-xs">
              <Mic className="w-10 h-10 mx-auto mb-2 opacity-20 text-navy-deep" />
              <p className="text-sm font-semibold text-navy-deep">No podcast episodes found</p>
              <p className="text-xs text-slate-custom mt-0.5">Click &quot;Add New Podcast&quot; above to publish your first episode.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLiveQA.map((session) => (
              <Card
                key={session.id}
                className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white flex flex-col hover:border-teal/40 hover:shadow-sm transition-all duration-200 group"
              >
                {/* 16:9 Live QA Thumbnail */}
                <div className="aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {session.thumbnailUrl ? (
                    <img
                      src={session.thumbnailUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={session.topic}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <Calendar className="w-10 h-10 text-amber" />
                      <span className="text-[11px] font-mono">No Thumbnail</span>
                    </div>
                  )}

                  {/* Top-Right Delete Action */}
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md rounded-xl p-1 shadow-md border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
                    <DeleteContentButton
                      id={session.id}
                      action={deleteLiveQA}
                      confirmMessage={`Are you sure you want to delete session "${session.topic}"?`}
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg text-white/70 hover:text-red-400 hover:bg-white/10"
                      title="Delete Session"
                    />
                  </div>

                  {/* Bottom Status Selector Overlay */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <LiveQAStatusSelect id={session.id} initialStatus={session.status} />
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-space-grotesk font-bold text-base text-navy-deep line-clamp-2 group-hover:text-teal transition-colors">
                      {session.topic}
                    </h3>
                    {session.expertName && (
                      <p className="text-xs text-slate-500 mt-1 font-ibm-plex-mono flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-teal" />
                        <span>Host/Expert: <strong className="text-navy-deep">{session.expertName}</strong></span>
                      </p>
                    )}
                    {session.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-line/60 flex items-center justify-between gap-2 text-xs font-ibm-plex-mono">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {session.sessionDate
                        ? format(new Date(session.sessionDate), "MMM d, yyyy")
                        : "TBD"}
                    </span>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 border-line text-navy-deep hover:bg-paper"
                    >
                      <Link href={`/dashboard/content/live-qa/${session.id}/questions`}>
                        <MessageSquare className="w-3 h-3 text-teal" /> Questions
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLiveQA.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-line text-center text-slate-custom font-ibm-plex-mono shadow-xs">
              <Video className="w-10 h-10 mx-auto mb-2 opacity-20 text-navy-deep" />
              <p className="text-sm font-semibold text-navy-deep">No Live Q&amp;A sessions found</p>
              <p className="text-xs text-slate-custom mt-0.5">Click &quot;Schedule Live Q&amp;A&quot; above to schedule an interactive broadcast.</p>
            </div>
          )}
        </div>
      )}

      {/* 5. SLIDE-OVER MODAL FOR SUBMISSIONS (PODCAST / LIVE QA) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-line/60 pb-3">
            <DialogTitle className="font-space-grotesk text-xl font-bold text-navy-deep flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber" />
              {activeTab === "podcasts" ? "Add New Podcast Episode" : "Schedule Live Q&A Broadcast"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-custom font-ibm-plex-mono">
              {activeTab === "podcasts"
                ? "Embed a new YouTube podcast recording with guest details and custom thumbnail."
                : "Schedule an upcoming live interactive Q&A session with an industry solar expert."}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            {activeTab === "podcasts" ? (
              <PodcastForm />
            ) : (
              <LiveQAForm />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
