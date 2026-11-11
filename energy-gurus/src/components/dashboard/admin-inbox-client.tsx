"use client";

import React, { useState, useRef, useEffect, useMemo, useTransition, useOptimistic } from "react";
import { format } from "date-fns";
import {
  Inbox,
  Globe,
  Mail,
  Phone,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Search,
  CheckSquare,
  Square,
  MoreHorizontal,
  Download,
  ArrowLeft,
  Send,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  User,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markInquiryAsRead,
  deleteInquiry,
  replyToInquiry,
  bulkDeleteInquiries,
  bulkMarkInquiriesAsRead,
} from "@/lib/actions/inquiry";
import { toast } from "sonner";

export interface InquiryItem {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  subject: string | null;
  message: string;
  inquiryType: "client" | "support" | "public" | string;
  status: string;
  isRead: boolean;
  reply: string | null;
  metadata?: any;
  createdAt: Date | string;
}

interface AdminInboxClientProps {
  initialInquiries: InquiryItem[];
}

export function AdminInboxClient({ initialInquiries }: AdminInboxClientProps) {
  const [channelTab, setChannelTab] = useState<"support" | "public">("support");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [mobileDetailView, setMobileDetailView] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Optimistic Inquiries
  const [optimisticInquiries, setOptimisticInquiries] = useOptimistic(
    initialInquiries,
    (
      current,
      {
        action,
        id,
        ids,
        reply,
      }: {
        action: "markRead" | "delete" | "bulkMarkRead" | "bulkDelete" | "reply";
        id?: string;
        ids?: string[];
        reply?: string;
      }
    ) => {
      if (action === "markRead") {
        return current.map((i) => (i.id === id ? { ...i, isRead: true } : i));
      }
      if (action === "delete") {
        return current.filter((i) => i.id !== id);
      }
      if (action === "bulkMarkRead") {
        return current.map((i) => (ids?.includes(i.id) ? { ...i, isRead: true } : i));
      }
      if (action === "bulkDelete") {
        return current.filter((i) => !ids?.includes(i.id));
      }
      if (action === "reply") {
        return current.map((i) =>
          i.id === id ? { ...i, reply: reply || null, status: "replied", isRead: true } : i
        );
      }
      return current;
    }
  );

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

  // Metrics
  const partnerInquiries = useMemo(
    () => optimisticInquiries.filter((i) => i.inquiryType === "support"),
    [optimisticInquiries]
  );
  const publicInquiries = useMemo(
    () => optimisticInquiries.filter((i) => i.inquiryType === "public"),
    [optimisticInquiries]
  );
  const partnerUnread = useMemo(() => partnerInquiries.filter((i) => !i.isRead).length, [partnerInquiries]);
  const publicUnread = useMemo(() => publicInquiries.filter((i) => !i.isRead).length, [publicInquiries]);
  const totalUnread = partnerUnread + publicUnread;

  // Active channel items
  const channelItems = channelTab === "support" ? partnerInquiries : publicInquiries;

  // Filtered by status and search
  const filteredInquiries = useMemo(() => {
    return channelItems.filter((i) => {
      const matchesStatus =
        statusFilter === "all" ? true : statusFilter === "read" ? i.isRead : !i.isRead;

      const q = search.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        (i.guestName && i.guestName.toLowerCase().includes(q)) ||
        (i.guestEmail && i.guestEmail.toLowerCase().includes(q)) ||
        (i.subject && i.subject.toLowerCase().includes(q)) ||
        i.message.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [channelItems, statusFilter, search]);

  // Set default selected inquiry on desktop
  useEffect(() => {
    if (!selectedInquiryId && filteredInquiries.length > 0) {
      setSelectedInquiryId(filteredInquiries[0].id);
    } else if (selectedInquiryId && !filteredInquiries.find((i) => i.id === selectedInquiryId)) {
      setSelectedInquiryId(filteredInquiries[0]?.id || null);
    }
  }, [filteredInquiries, selectedInquiryId]);

  const activeInquiry = useMemo(
    () => optimisticInquiries.find((i) => i.id === selectedInquiryId) || null,
    [optimisticInquiries, selectedInquiryId]
  );

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInquiries.length) setSelectedIds([]);
    else setSelectedIds(filteredInquiries.map((i) => i.id));
  };

  // Actions
  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      try {
        setOptimisticInquiries({ action: "markRead", id });
        await markInquiryAsRead(id);
        toast.success("Marked as read");
      } catch (error) {
        toast.error("Failed to update inquiry");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    startTransition(async () => {
      try {
        setOptimisticInquiries({ action: "delete", id });
        await deleteInquiry(id);
        toast.success("Inquiry deleted");
        if (selectedInquiryId === id) {
          setSelectedInquiryId(null);
          setMobileDetailView(false);
        }
      } catch (error) {
        toast.error("Failed to delete inquiry");
      }
    });
  };

  const handleBulkMarkRead = () => {
    if (!selectedIds.length) return;
    startTransition(async () => {
      try {
        setOptimisticInquiries({ action: "bulkMarkRead", ids: selectedIds });
        const res = await bulkMarkInquiriesAsRead(selectedIds);
        if (res.success) {
          toast.success(res.message);
          setSelectedIds([]);
        } else toast.error(res.message);
      } catch (error) {
        toast.error("Failed to update inquiries");
      }
    });
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} inquiries?`)) return;
    startTransition(async () => {
      try {
        setOptimisticInquiries({ action: "bulkDelete", ids: selectedIds });
        const res = await bulkDeleteInquiries(selectedIds);
        if (res.success) {
          toast.success(res.message);
          setSelectedIds([]);
          setSelectedInquiryId(null);
        } else toast.error(res.message);
      } catch (error) {
        toast.error("Failed to delete inquiries");
      }
    });
  };

  const handleSendReply = async () => {
    if (!activeInquiry || !replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }
    setIsReplying(true);
    try {
      setOptimisticInquiries({ action: "reply", id: activeInquiry.id, reply: replyText });
      const res = await replyToInquiry(activeInquiry.id, replyText);
      if (res.success) {
        toast.success("Reply delivered successfully");
        setReplyText("");
      } else {
        toast.error(res.message || "Failed to send reply");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to deliver reply");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER-FIRST FLOW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">
              Admin Support Inbox
            </h1>
            <p className="text-slate-custom text-xs md:text-sm mt-0.5 font-ibm-plex-mono">
              Central communications hub for partner tickets and public inquiries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a href="/api/reports?type=inquiries" download>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl gap-2 font-bold text-xs border-line hover:bg-paper whitespace-nowrap shadow-2xs font-ibm-plex-mono"
            >
              <Download className="w-3.5 h-3.5 text-navy-deep" /> Export CSV
            </Button>
          </a>

          {totalUnread > 0 && (
            <div className="flex items-center gap-2 bg-amber/15 text-amber-deep border border-amber/30 px-3.5 py-2 rounded-xl text-xs font-bold font-ibm-plex-mono shadow-xs">
              <Mail className="w-3.5 h-3.5 text-amber" />
              <span>{totalUnread} Unread Requests</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. BENTO METRICS BAR */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {/* Total Volume */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Total Volume
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-3.5 h-3.5 text-navy-deep" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {optimisticInquiries.length}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">All communications received</p>
          </div>

          {/* Active Partner Support */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Partner Support
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber border border-amber/20 group-hover:scale-105 transition-transform">
                <Inbox className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {partnerInquiries.length}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
              {partnerUnread} unread partner tickets
            </p>
          </div>

          {/* Public Pulse */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Public Pulse
              </span>
              <div className="p-1.5 rounded-lg bg-teal/10 text-teal border border-teal/20 group-hover:scale-105 transition-transform">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
              {publicInquiries.length}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
              {publicUnread} unread website leads
            </p>
          </div>
        </div>
      </div>

      {/* 3. UNIFIED COMMAND TOOLBAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Channel Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line/50 text-xs font-ibm-plex-mono w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setChannelTab("support");
              setSelectedIds([]);
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              channelTab === "support"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-amber" />
            Partner Support
            {partnerUnread > 0 && (
              <span className="px-1.5 py-0.2 bg-amber text-navy-deep text-[9.5px] font-bold rounded-full">
                {partnerUnread}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setChannelTab("public");
              setSelectedIds([]);
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              channelTab === "public"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-teal" />
            Public Inquiries
            {publicUnread > 0 && (
              <span className="px-1.5 py-0.2 bg-teal text-white text-[9.5px] font-bold rounded-full">
                {publicUnread}
              </span>
            )}
          </button>
        </div>

        {/* Status Filters + Search + Bulk Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 justify-end flex-wrap">
          {/* Status Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line/50 text-xs font-ibm-plex-mono">
            {(["all", "unread", "read"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition-all capitalize cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-navy-deep shadow-xs border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 group">
            <div className="flex items-center w-full h-9 rounded-xl bg-white border border-slate-200/80 shadow-xs focus-within:ring-2 focus-within:ring-amber/20 focus-within:border-amber transition-all px-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber transition-colors shrink-0 mr-2" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inbox..."
                className="w-full bg-transparent border-none text-xs text-navy-deep placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1 py-0.2 text-[9.5px] font-mono font-bold text-slate-400 bg-slate-100 border border-line/70 rounded select-none shrink-0 ml-1">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Bulk Actions Dropdown */}
          {selectedIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-xl text-xs font-bold border-line shadow-2xs">
                  <span className="text-amber font-mono font-bold">{selectedIds.length}</span>
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-xl font-ibm-plex-mono text-xs">
                <DropdownMenuItem onClick={handleBulkMarkRead} className="gap-2 cursor-pointer">
                  <Eye className="w-3.5 h-3.5 text-teal" /> Mark as Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDelete} className="gap-2 text-red-600 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 4. RESPONSIVE INBOX ARCHITECTURE (SPLIT LAYOUT ON DESKTOP, COLLAPSIBLE ON MOBILE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Inbox Message Feed */}
        <div
          className={`lg:col-span-5 space-y-3 ${
            mobileDetailView ? "hidden lg:block" : "block"
          }`}
        >
          {/* List Header */}
          <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
            <div className="p-3 border-b border-line/60 bg-paper/60 flex items-center justify-between text-xs font-ibm-plex-mono">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-slate-500 hover:text-navy-deep cursor-pointer font-bold select-none"
              >
                {selectedIds.length === filteredInquiries.length && filteredInquiries.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-amber" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({filteredInquiries.length})</span>
              </button>

              <span className="text-[11px] text-slate-400">
                {channelTab === "support" ? "Partner Channel" : "Public Web Leads"}
              </span>
            </div>

            {/* Message List Rows */}
            <div className="divide-y divide-line/40 max-h-[640px] overflow-y-auto">
              {filteredInquiries.map((inq) => {
                const isSelected = selectedInquiryId === inq.id;

                return (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiryId(inq.id);
                      setMobileDetailView(true);
                      if (!inq.isRead) handleMarkRead(inq.id);
                    }}
                    className={`p-4 transition-all duration-150 cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-amber/5 border-l-4 border-l-amber shadow-2xs"
                        : inq.isRead
                        ? "hover:bg-paper/40 bg-white"
                        : "bg-paper/60 hover:bg-paper font-semibold"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(inq.id);
                      }}
                      className="mt-0.5 p-0.5 rounded hover:bg-paper transition-colors text-slate-400 hover:text-navy-deep cursor-pointer"
                    >
                      {selectedIds.includes(inq.id) ? (
                        <CheckSquare className="w-4 h-4 text-amber" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    {/* Unread Pip */}
                    <div className="mt-1.5 shrink-0">
                      <span
                        className={`block w-2 h-2 rounded-full ${
                          inq.isRead ? "bg-transparent border border-slate-300" : "bg-amber shadow-xs"
                        }`}
                      />
                    </div>

                    {/* Message Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-navy-deep truncate">
                          {inq.guestName || "Anonymous Sender"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-ibm-plex-mono shrink-0">
                          {format(new Date(inq.createdAt), "MMM d")}
                        </span>
                      </div>

                      <p className="text-xs text-navy-deep/90 truncate mb-1">
                        {inq.subject ? (
                          <strong className="text-navy-deep">{inq.subject}: </strong>
                        ) : null}
                        {inq.message}
                      </p>

                      <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-ibm-plex-mono">
                        {inq.status === "replied" ? (
                          <span className="text-teal font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Replied
                          </span>
                        ) : (
                          <span>Status: {inq.status}</span>
                        )}
                        {inq.guestEmail && (
                          <span className="truncate max-w-[120px]">· {inq.guestEmail}</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 self-center shrink-0 lg:hidden" />
                  </div>
                );
              })}

              {filteredInquiries.length === 0 && (
                <div className="p-12 text-center text-slate-custom font-ibm-plex-mono">
                  <Mail className="w-10 h-10 mx-auto mb-2 opacity-20 text-navy-deep" />
                  <p className="text-sm font-bold text-navy-deep">No inquiries found</p>
                  <p className="text-xs text-slate-custom mt-0.5">
                    No {statusFilter} tickets match your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Full Detail Preview & Direct Reply (Desktop & Mobile Active) */}
        <div
          className={`lg:col-span-7 ${
            !mobileDetailView ? "hidden lg:block" : "block"
          }`}
        >
          {activeInquiry ? (
            <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden space-y-4">
              {/* Mobile Back Button Bar */}
              <div className="lg:hidden p-3 bg-paper/60 border-b border-line/60 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileDetailView(false)}
                  className="gap-1.5 text-xs font-bold text-navy-deep"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Inbox
                </Button>
                <span className="text-[11px] font-mono text-slate-400">Message Detail</span>
              </div>

              {/* Detail Header */}
              <div className="p-5 pb-4 border-b border-line/60 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/20 text-navy-deep flex items-center justify-center font-bold text-sm shrink-0 font-space-grotesk">
                      {(activeInquiry.guestName || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-space-grotesk text-base font-bold text-navy-deep">
                        {activeInquiry.guestName || "Anonymous Sender"}
                      </h3>
                      <p className="text-xs text-slate-400 font-ibm-plex-mono flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Received {format(new Date(activeInquiry.createdAt), "MMM d, yyyy h:mm a")}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5">
                    {!activeInquiry.isRead && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(activeInquiry.id)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-teal hover:bg-teal/10"
                        title="Mark as Read"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(activeInquiry.id)}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Sender Contact Pills */}
                <div className="flex items-center gap-2 flex-wrap text-xs font-ibm-plex-mono">
                  {activeInquiry.guestEmail && (
                    <a
                      href={`mailto:${activeInquiry.guestEmail}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line/70 text-navy-deep hover:border-amber transition-colors font-medium"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber" />
                      <span>{activeInquiry.guestEmail}</span>
                    </a>
                  )}

                  {activeInquiry.guestPhone && (
                    <a
                      href={`tel:${activeInquiry.guestPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-line/70 text-navy-deep hover:border-teal transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal" />
                      <span>{activeInquiry.guestPhone}</span>
                    </a>
                  )}

                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Channel: {activeInquiry.inquiryType}
                  </span>
                </div>
              </div>

              {/* Inquiry Message Body */}
              <div className="p-5 pt-0 space-y-4">
                {activeInquiry.subject && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-ibm-plex-mono">Subject</span>
                    <h4 className="font-bold text-sm text-navy-deep mt-0.5">{activeInquiry.subject}</h4>
                  </div>
                )}

                {/* Inquiry Specifications / Metadata */}
                {activeInquiry.metadata &&
                  typeof activeInquiry.metadata === "object" &&
                  Object.keys(activeInquiry.metadata).length > 0 && (
                    <div className="p-3.5 bg-paper/60 border border-line/60 rounded-xl space-y-1.5 text-xs font-ibm-plex-mono">
                      <span className="text-[10px] uppercase font-bold text-amber block">Inquiry Specifications</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(activeInquiry.metadata).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-400 capitalize text-[10.5px] block">
                              {k.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="font-semibold text-navy-deep">{String(v || "-")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Full Message Text */}
                <div className="p-4 bg-paper/40 rounded-xl border border-line/50 text-xs md:text-sm text-navy-deep leading-relaxed whitespace-pre-wrap font-sans">
                  {activeInquiry.message}
                </div>

                {/* Existing Reply Display */}
                {activeInquiry.reply && (
                  <div className="p-4 bg-teal/5 border border-teal/20 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-teal font-bold font-ibm-plex-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Official Staff Reply Sent:</span>
                    </div>
                    <p className="text-navy-deep leading-relaxed whitespace-pre-wrap pl-5">
                      {activeInquiry.reply}
                    </p>
                  </div>
                )}

                {/* Reply Composer (Only for partner support or when repliable) */}
                {channelTab === "support" && (
                  <div className="pt-3 border-t border-line/60 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy-deep font-ibm-plex-mono flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-amber" /> Reply to Partner Ticket
                    </span>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response to this partner ticket here..."
                      className="w-full text-xs p-3 bg-paper/40 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber text-navy-deep leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleSendReply}
                        disabled={isReplying || !replyText.trim()}
                        className="h-9 px-4 rounded-xl gap-2 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-xs font-space-grotesk cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isReplying ? "Delivering..." : "Deliver Response"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 border border-line text-center text-slate-custom font-ibm-plex-mono shadow-xs">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-20 text-navy-deep" />
              <p className="text-base font-bold text-navy-deep">No message selected</p>
              <p className="text-xs text-slate-custom mt-1">
                Select an inquiry from the inbox feed to view full details and compose responses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

