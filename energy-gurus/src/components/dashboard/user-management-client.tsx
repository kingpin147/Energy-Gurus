"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Users as UsersIcon,
  ShieldAlert,
  User as UserIcon,
  Plus,
  Search,
  Download,
  Mail,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Award,
  PenTool,
  Radio,
  Zap,
  Filter
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { SingleInvite } from "@/components/dashboard/single-invite";
import { BulkInvite } from "@/components/dashboard/bulk-invite";
import { PendingInvitations } from "@/components/dashboard/pending-invitations";
import { UserStatusButton } from "@/components/dashboard/user-status-button";
import { DeleteUserButton } from "@/components/dashboard/delete-user-button";

export interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  role: "super-admin" | "admin" | "epc" | "brand" | "writer" | string;
  clerkId: string;
  isActive: boolean;
  createdAt: Date | string;
  lastSignInAt?: string | null;
  lastActiveAt?: string | null;
  brandLogo?: string | null;
  epcLogo?: string | null;
}

interface UserManagementClientProps {
  initialUsers: DashboardUser[];
  initialPendingInvites: any[];
  userRole: string;
}

const ITEMS_PER_PAGE = 12;

type ActivityFilter = "all" | "online" | "today" | "24h" | "7d" | "14d" | "30d";

function formatRelativeTime(dateStr: string | Date | null | undefined): { label: string; isOnline: boolean; isRecent: boolean } {
  if (!dateStr) return { label: "No login yet", isOnline: false, isRecent: false };
  const d = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 15) return { label: "Online Now", isOnline: true, isRecent: true };
  if (diffMins < 60) return { label: `${diffMins}m ago`, isOnline: false, isRecent: true };
  if (diffHours < 24) return { label: `${diffHours}h ago`, isOnline: false, isRecent: true };
  if (diffDays === 1) return { label: "Yesterday", isOnline: false, isRecent: false };
  if (diffDays < 30) return { label: `${diffDays}d ago`, isOnline: false, isRecent: false };
  return { label: format(d, "MMM dd, yyyy"), isOnline: false, isRecent: false };
}

function checkUserActivityMatch(user: DashboardUser, filter: ActivityFilter): boolean {
  if (filter === "all") return true;
  const timestamp = user.lastActiveAt || user.lastSignInAt;
  if (!timestamp) return false;
  const time = new Date(timestamp).getTime();
  const now = Date.now();
  const diffHours = (now - time) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (filter === "online") return diffHours <= 0.25; // 15 minutes
  if (filter === "today") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return time >= todayStart.getTime();
  }
  if (filter === "24h") return diffHours <= 24;
  if (filter === "7d") return diffDays <= 7;
  if (filter === "14d") return diffDays <= 14;
  if (filter === "30d") return diffDays <= 30;
  return true;
}

export function UserManagementClient({
  initialUsers,
  initialPendingInvites,
  userRole,
}: UserManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "invites" | "activity">("users");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalMode, setInviteModalMode] = useState<"single" | "bulk">("single");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "alpha" | "recent_login">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Compute metrics for Bento bar
  const totalUsersCount = initialUsers.length;
  const pendingCount = initialPendingInvites.length;
  const epcCount = initialUsers.filter((u) => u.role === "epc").length;
  const brandCount = initialUsers.filter((u) => u.role === "brand").length;
  const writerCount = initialUsers.filter((u) => u.role === "writer").length;

  // Real-time online and activity counts
  const onlineNowCount = useMemo(() => {
    return initialUsers.filter((u) => {
      const ts = u.lastActiveAt || u.lastSignInAt;
      if (!ts) return false;
      return Date.now() - new Date(ts).getTime() <= 15 * 60 * 1000;
    }).length;
  }, [initialUsers]);

  const activeTodayCount = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return initialUsers.filter((u) => {
      const ts = u.lastActiveAt || u.lastSignInAt;
      if (!ts) return false;
      return new Date(ts).getTime() >= todayStart.getTime();
    }).length;
  }, [initialUsers]);

  const active24hCount = useMemo(() => {
    return initialUsers.filter((u) => {
      const ts = u.lastActiveAt || u.lastSignInAt;
      if (!ts) return false;
      return Date.now() - new Date(ts).getTime() <= 24 * 60 * 60 * 1000;
    }).length;
  }, [initialUsers]);

  const active7dCount = useMemo(() => {
    return initialUsers.filter((u) => {
      const ts = u.lastActiveAt || u.lastSignInAt;
      if (!ts) return false;
      return Date.now() - new Date(ts).getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;
  }, [initialUsers]);

  const active14dCount = useMemo(() => {
    return initialUsers.filter((u) => {
      const ts = u.lastActiveAt || u.lastSignInAt;
      if (!ts) return false;
      return Date.now() - new Date(ts).getTime() <= 14 * 24 * 60 * 60 * 1000;
    }).length;
  }, [initialUsers]);

  const active30dCount = useMemo(() => {
    return initialUsers.filter((u) => {
      const ts = u.lastActiveAt || u.lastSignInAt;
      if (!ts) return false;
      return Date.now() - new Date(ts).getTime() <= 30 * 24 * 60 * 60 * 1000;
    }).length;
  }, [initialUsers]);

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch =
        search === "" ||
        (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Activity tab specific filter
      const matchesActivity =
        activeTab !== "activity" || checkUserActivityMatch(user, activityFilter);

      return matchesSearch && matchesRole && matchesActivity;
    }).sort((a, b) => {
      if (sortOrder === "alpha") {
        return (a.name || a.email).localeCompare(b.name || b.email);
      }
      if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOrder === "recent_login") {
        const aTime = a.lastActiveAt || a.lastSignInAt ? new Date(a.lastActiveAt || a.lastSignInAt!).getTime() : 0;
        const bTime = b.lastActiveAt || b.lastSignInAt ? new Date(b.lastActiveAt || b.lastSignInAt!).getTime() : 0;
        return bTime - aTime;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [initialUsers, search, roleFilter, sortOrder, activeTab, activityFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-navy-deep text-white border-navy-deep";
      case "admin":
        return "bg-slate-800 text-white border-slate-800";
      case "epc":
        return "bg-amber/15 text-amber-deep border-amber/30";
      case "brand":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "writer":
        return "bg-teal/15 text-teal border-teal/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER ROW WITH DIRECT ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold tracking-tight text-navy-deep">
              User Management
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20 font-ibm-plex-mono">
              Directory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-custom font-ibm-plex-mono">
            Provision, manage roles, audit live online presence, and track user authentication.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => {
              setInviteModalMode("bulk");
              setIsInviteModalOpen(true);
            }}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 rounded-xl border-line text-xs font-bold text-navy-deep hover:bg-paper gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber" />
            Bulk CSV Upload
          </Button>
          <Button
            onClick={() => {
              setInviteModalMode("single");
              setIsInviteModalOpen(true);
            }}
            size="sm"
            className="h-9 px-4 rounded-xl bg-amber hover:bg-amber-deep text-navy-deep text-xs font-bold gap-1.5 shadow-sm transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* 2. UNIFIED BENTO METRIC ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Registered Users
            </span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber group-hover:scale-105 transition-transform">
              <UsersIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
            {totalUsersCount}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Active database profiles</p>
        </div>

        {/* Online Now */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-teal/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Online Now
            </span>
            <div className="p-1.5 rounded-lg bg-teal/10 text-teal group-hover:scale-105 transition-transform flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
            {onlineNowCount}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Active in last 15 mins</p>
        </div>

        {/* EPC Installers */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber-deep/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              EPC Installers
            </span>
            <div className="p-1.5 rounded-lg bg-amber-deep/10 text-amber-deep group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber-deep tracking-tight">
            {epcCount}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Solar contractors</p>
        </div>

        {/* Solar Brands */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Solar Brands
            </span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber group-hover:scale-105 transition-transform">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
            {brandCount}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">OEM partners</p>
        </div>

        {/* Article Writers */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-navy-deep/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Writers &amp; Invites
            </span>
            <div className="p-1.5 rounded-lg bg-navy-deep/10 text-navy-deep group-hover:scale-105 transition-transform">
              <PenTool className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
            {writerCount} <span className="text-xs font-normal text-slate-400">({pendingCount} pend)</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Editorial columnists</p>
        </div>
      </div>

      {/* 3. ADAPTIVE SEGMENTED TABS (Including New Online & Activity Tab) */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 text-xs font-ibm-plex-mono flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5 text-amber" />
            Registered Users ({totalUsersCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invites")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "invites"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-deep" />
            Pending Invitations ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "activity"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            Online &amp; Activity ({onlineNowCount} online)
          </button>
        </div>

        <span className="text-xs text-slate-custom font-ibm-plex-mono">
          Showing <strong className="text-navy-deep">{filteredUsers.length}</strong> matching records
        </span>
      </div>

      {/* 4. ACTIVE TAB CONTENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              {/* Floating Pill Search Input */}
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
                    placeholder="Search name or email..."
                    className="w-full bg-transparent border-none text-xs text-navy-deep placeholder:text-slate-400 focus:outline-none"
                  />
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Role Dropdown */}
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-navy-deep w-full sm:w-44 focus:ring-amber/20 focus:border-amber">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="epc">EPC Installer</SelectItem>
                  <SelectItem value="brand">Solar Brand</SelectItem>
                  <SelectItem value="writer">Writer</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select
                value={sortOrder}
                onValueChange={(val: "latest" | "oldest" | "alpha" | "recent_login") => setSortOrder(val)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-navy-deep w-full sm:w-40 focus:ring-amber/20 focus:border-amber">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Registered</SelectItem>
                  <SelectItem value="recent_login">Recent Login</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="alpha">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DESKTOP BORDERLESS DATA TABLE (hidden on mobile, visible md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-paper/80 border-b border-line/60">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      User Profile
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Email Address
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Role &amp; Badge
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Account Status
                    </th>
                    {/* NEW COLUMN: Last Active / Registered */}
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Last Active / Registered
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {paginatedUsers.map((user) => {
                    const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
                    const isSuperAdmin = whitelist.includes(user.email.toLowerCase()) || user.role === "super-admin";
                    const displayRole = isSuperAdmin ? "super-admin" : user.role;
                    const userLogo = user.brandLogo || user.epcLogo;
                    const activeTs = user.lastActiveAt || user.lastSignInAt;
                    const { label: activeLabel, isOnline } = formatRelativeTime(activeTs);

                    return (
                      <tr key={user.id} className="hover:bg-paper/50 transition-colors duration-150 group">
                        {/* Profile */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-line/80 shadow-2xs group-hover:border-amber/40 transition-colors">
                              <AvatarImage src={userLogo || undefined} />
                              <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs">
                                <UserIcon className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-sm text-navy-deep group-hover:text-amber transition-colors line-clamp-1">
                              {user.name || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-5 text-xs text-slate-custom font-mono">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold font-ibm-plex-mono uppercase tracking-wider border ${getRoleBadgeStyle(
                              displayRole
                            )}`}
                          >
                            {displayRole.replace("-", " ")}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-5">
                          {!isSuperAdmin && (user.role === "epc" || user.role === "brand" || user.role === "writer") ? (
                            <UserStatusButton
                              userId={user.id}
                              initialActive={user.isActive}
                              userName={user.name || user.email}
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-ibm-plex-mono text-teal">
                              <ShieldCheck className="w-3.5 h-3.5" /> Active
                            </span>
                          )}
                        </td>

                        {/* NEW COLUMN: Last Active / Registered */}
                        <td className="py-3.5 px-5">
                          <div className="space-y-0.5">
                            {isOnline ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20 text-[10.5px] font-bold font-ibm-plex-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                                Online Now
                              </div>
                            ) : activeTs ? (
                              <div className="text-xs font-semibold text-navy-deep font-ibm-plex-mono flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{activeLabel}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 font-ibm-plex-mono italic">
                                No login recorded
                              </div>
                            )}
                            <div className="text-[10.5px] text-slate-400 font-ibm-plex-mono">
                              Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.role === "epc" && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 rounded-lg text-xs font-bold border-line text-slate-600 hover:text-navy-deep hover:bg-paper"
                              >
                                <Link href="/dashboard/admin/onboard-epc">
                                  EPC Hub
                                </Link>
                              </Button>
                            )}
                            {user.role === "brand" && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 rounded-lg text-xs font-bold border-line text-slate-600 hover:text-navy-deep hover:bg-paper"
                              >
                                <Link href="/dashboard/admin/onboard-brand">
                                  Brand Hub
                                </Link>
                              </Button>
                            )}
                            {user.role === "writer" && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 rounded-lg text-xs font-bold border-line text-slate-600 hover:text-navy-deep hover:bg-paper"
                              >
                                <Link href="/dashboard/admin/onboard-writer">
                                  Writer Hub
                                </Link>
                              </Button>
                            )}

                            {!isSuperAdmin &&
                              (userRole === "super-admin" ||
                                (userRole === "admin" &&
                                  user.role !== "admin" &&
                                  user.role !== "super-admin")) && (
                                <DeleteUserButton
                                  userId={user.id}
                                  userName={user.name || user.email}
                                  userEmail={user.email}
                                />
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginatedUsers.length === 0 && (
                <div className="py-12 text-center text-slate-custom font-ibm-plex-mono">
                  <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-semibold text-navy-deep">No users matching filter criteria</p>
                  <p className="text-xs text-slate-custom mt-0.5">Try searching with a different keyword or role.</p>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE ADAPTIVE BENTO STACK CARDS (visible on mobile <md) */}
          <div className="md:hidden space-y-3">
            {paginatedUsers.map((user) => {
              const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
              const isSuperAdmin = whitelist.includes(user.email.toLowerCase()) || user.role === "super-admin";
              const displayRole = isSuperAdmin ? "super-admin" : user.role;
              const userLogo = user.brandLogo || user.epcLogo;
              const activeTs = user.lastActiveAt || user.lastSignInAt;
              const { label: activeLabel, isOnline } = formatRelativeTime(activeTs);

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-4 border border-line shadow-xs space-y-3 hover:border-amber/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-line/80 shadow-2xs">
                        <AvatarImage src={userLogo || undefined} />
                        <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs">
                          <UserIcon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-sm text-navy-deep line-clamp-1">{user.name || "N/A"}</h3>
                        <p className="text-xs text-slate-custom font-mono truncate">{user.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-ibm-plex-mono uppercase tracking-wider border ${getRoleBadgeStyle(
                        displayRole
                      )}`}
                    >
                      {displayRole.replace("-", " ")}
                    </span>
                  </div>

                  {/* 2-Column Details Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line/40 text-xs">
                    <div className="p-2.5 rounded-xl bg-paper/60 border border-line/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-ibm-plex-mono block">Status</span>
                      <div className="mt-1">
                        {!isSuperAdmin && (user.role === "epc" || user.role === "brand" || user.role === "writer") ? (
                          <UserStatusButton
                            userId={user.id}
                            initialActive={user.isActive}
                            userName={user.name || user.email}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-ibm-plex-mono text-teal">
                            <ShieldCheck className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-paper/60 border border-line/40">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-ibm-plex-mono block">Last Active</span>
                      <div className="mt-1">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1 text-teal font-bold font-mono text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-navy-deep font-ibm-plex-mono">
                            {activeLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-line/40">
                    <span className="text-[10.5px] text-slate-400 font-ibm-plex-mono">
                      Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {user.role === "epc" && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-bold border-line">
                          <Link href="/dashboard/admin/onboard-epc">EPC Hub</Link>
                        </Button>
                      )}
                      {user.role === "brand" && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-bold border-line">
                          <Link href="/dashboard/admin/onboard-brand">Brand Hub</Link>
                        </Button>
                      )}
                      {user.role === "writer" && (
                        <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-bold border-line">
                          <Link href="/dashboard/admin/onboard-writer">Writer Hub</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {paginatedUsers.length === 0 && (
              <div className="bg-white rounded-2xl p-8 border border-line text-center text-slate-custom font-ibm-plex-mono">
                <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-semibold text-navy-deep">No users found</p>
                <p className="text-xs text-slate-custom mt-0.5">Try adjusting your search query or filters.</p>
              </div>
            )}
          </div>

          {/* PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-line shadow-xs flex items-center justify-between">
              <p className="text-xs text-slate-custom font-medium font-ibm-plex-mono">
                Showing <strong className="text-navy-deep font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
                <strong className="text-navy-deep font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</strong> of{" "}
                <strong className="text-navy-deep font-bold">{filteredUsers.length}</strong> users
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
      )}

      {/* NEW TAB: ONLINE & ACTIVITY TELEMETRY */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          {/* Activity Filter Navigation Bar */}
          <div className="bg-white p-4 rounded-2xl border border-line shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal animate-pulse" />
                <h3 className="font-space-grotesk text-base font-bold text-navy-deep">
                  User Presence &amp; Login Activity
                </h3>
              </div>
              <span className="text-xs text-slate-custom font-ibm-plex-mono">
                Select timeframe to filter users by authentication and activity
              </span>
            </div>

            {/* Time Filter Pills: currently online, today online, 24hr, 7 days, 14 days, 30 days */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActivityFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  activityFilter === "all"
                    ? "bg-white text-navy-deep shadow-xs font-bold border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                All Users ({totalUsersCount})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("online")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] flex items-center gap-1.5 ${
                  activityFilter === "online"
                    ? "bg-white text-teal shadow-xs font-bold border border-teal/30"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                Currently Online ({onlineNowCount})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("today")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  activityFilter === "today"
                    ? "bg-white text-navy-deep shadow-xs font-bold border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                Today Online ({activeTodayCount})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("24h")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  activityFilter === "24h"
                    ? "bg-white text-navy-deep shadow-xs font-bold border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                Last 24 Hours ({active24hCount})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("7d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  activityFilter === "7d"
                    ? "bg-white text-navy-deep shadow-xs font-bold border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                Last 7 Days ({active7dCount})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("14d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  activityFilter === "14d"
                    ? "bg-white text-navy-deep shadow-xs font-bold border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                Last 14 Days ({active14dCount})
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter("30d")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-ibm-plex-mono text-[11px] ${
                  activityFilter === "30d"
                    ? "bg-white text-navy-deep shadow-xs font-bold border border-line/60"
                    : "text-slate-500 hover:text-navy-deep"
                }`}
              >
                Last 30 Days ({active30dCount})
              </button>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-paper/80 border-b border-line/60">
                  <tr>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      User
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Role
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Live Presence
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Last Active / Signed In
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono">
                      Account Registered
                    </th>
                    <th className="py-3.5 px-5 font-bold text-navy-deep text-[11px] uppercase tracking-wider font-ibm-plex-mono text-right">
                      Directory Link
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {filteredUsers.map((user) => {
                    const activeTs = user.lastActiveAt || user.lastSignInAt;
                    const { label: activeLabel, isOnline } = formatRelativeTime(activeTs);
                    const userLogo = user.brandLogo || user.epcLogo;

                    return (
                      <tr key={user.id} className="hover:bg-paper/50 transition-colors group">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-line/80 shadow-2xs">
                              <AvatarImage src={userLogo || undefined} />
                              <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs">
                                <UserIcon className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-sm text-navy-deep group-hover:text-amber transition-colors">
                                {user.name || "N/A"}
                              </div>
                              <div className="text-xs text-slate-custom font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold font-ibm-plex-mono uppercase tracking-wider border ${getRoleBadgeStyle(
                              user.role
                            )}`}
                          >
                            {user.role.replace("-", " ")}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal/10 text-teal border border-teal/20 text-xs font-bold font-ibm-plex-mono">
                              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                              Online Now
                            </span>
                          ) : activeTs ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper text-slate-custom border border-line text-xs font-semibold font-ibm-plex-mono">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              Offline
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber/10 text-amber-deep border border-amber/25 text-xs font-semibold font-ibm-plex-mono">
                              <span className="w-2 h-2 rounded-full bg-amber-deep" />
                              Dormant
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="text-xs font-semibold text-navy-deep font-ibm-plex-mono">
                            {activeLabel}
                          </div>
                          {activeTs && (
                            <div className="text-[10.5px] text-slate-400 font-mono">
                              {format(new Date(activeTs), "MMM dd, yyyy • hh:mm a")}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-xs text-slate-custom font-ibm-plex-mono">
                          {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {user.role === "epc" && (
                            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-bold border-line">
                              <Link href="/dashboard/admin/onboard-epc">EPC Hub</Link>
                            </Button>
                          )}
                          {user.role === "brand" && (
                            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-bold border-line">
                              <Link href="/dashboard/admin/onboard-brand">Brand Hub</Link>
                            </Button>
                          )}
                          {user.role === "writer" && (
                            <Button asChild variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-bold border-line">
                              <Link href="/dashboard/admin/onboard-writer">Writer Hub</Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-slate-custom font-ibm-plex-mono">
                  <Radio className="w-10 h-10 mx-auto mb-2 opacity-20 text-slate-400" />
                  <p className="text-sm font-semibold text-navy-deep">No users found for this activity timeframe</p>
                  <p className="text-xs text-slate-custom mt-0.5">Try selecting a broader timeframe like "Last 30 Days" or "All Users".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PENDING INVITATIONS TAB */}
      {activeTab === "invites" && (
        <div className="space-y-4">
          <PendingInvitations initialInvites={initialPendingInvites} />
        </div>
      )}

      {/* 5. INVITE & BULK IMPORT MODAL */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-line/60 pb-3">
            <DialogTitle className="font-space-grotesk text-xl font-bold text-navy-deep flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber" />
              Invite &amp; Import Users
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-custom font-ibm-plex-mono">
              Send single platform invitations or upload bulk CSV user batches.
            </DialogDescription>
          </DialogHeader>

          {/* Segmented Mode Switcher inside Modal */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 text-xs font-ibm-plex-mono my-2">
            <button
              type="button"
              onClick={() => setInviteModalMode("single")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                inviteModalMode === "single"
                  ? "bg-white text-navy-deep shadow-xs border border-line/60"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              Single User Invite
            </button>
            <button
              type="button"
              onClick={() => setInviteModalMode("bulk")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                inviteModalMode === "bulk"
                  ? "bg-white text-navy-deep shadow-xs border border-line/60"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              Bulk CSV Import
            </button>
          </div>

          <div className="pt-2">
            {inviteModalMode === "single" ? (
              <SingleInvite />
            ) : (
              <BulkInvite />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
