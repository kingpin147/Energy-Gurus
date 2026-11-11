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
  PenTool
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
  brandLogo?: string | null;
  epcLogo?: string | null;
}

interface UserManagementClientProps {
  initialUsers: DashboardUser[];
  initialPendingInvites: any[];
  userRole: string;
}

const ITEMS_PER_PAGE = 12;

export function UserManagementClient({
  initialUsers,
  initialPendingInvites,
  userRole,
}: UserManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "invites">("users");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalMode, setInviteModalMode] = useState<"single" | "bulk">("single");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "alpha">("latest");
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

  // Filter & sort registered users
  const filteredUsers = useMemo(() => {
    let result = [...initialUsers];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Sort order
    if (sortOrder === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === "alpha") {
      result.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
    }

    return result;
  }, [initialUsers, search, roleFilter, sortOrder]);

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-red-50 text-red-700 border-red-200";
      case "admin":
        return "bg-navy-deep/10 text-navy-deep border-navy-deep/20";
      case "epc":
        return "bg-teal/10 text-teal border-teal/20";
      case "brand":
        return "bg-amber/10 text-amber-deep border-amber/25";
      case "writer":
        return "bg-navy/10 text-navy border-navy/20";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & GLOBAL ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-amber text-navy-deep rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <UsersIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold tracking-tight text-navy-deep">
              User Management
            </h1>
            <p className="text-slate-custom text-xs md:text-sm mt-0.5 font-ibm-plex-mono">
              Manage platform access, roles, and administrative permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a href="/api/reports?type=users" download>
            <Button
              variant="outline"
              className="h-10 rounded-xl gap-2 font-bold text-xs border-line hover:bg-paper whitespace-nowrap cursor-pointer shadow-2xs font-ibm-plex-mono"
            >
              <Download className="w-3.5 h-3.5 text-navy-deep" /> Export CSV
            </Button>
          </a>

          <Button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="h-10 px-4 rounded-xl gap-2 font-bold text-xs bg-amber text-navy-deep hover:bg-amber-deep shadow-md font-space-grotesk cursor-pointer transition-all hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" /> Invite &amp; Import
          </Button>
        </div>
      </div>

      {/* 2. CONSOLIDATED BENTO METRICS BAR */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          {/* Total Registered */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Registered Users
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <UsersIcon className="w-3.5 h-3.5 text-amber" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {totalUsersCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Active platform accounts</p>
          </div>

          {/* Pending Invites */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Pending Invites
              </span>
              <div className="p-1.5 rounded-lg bg-amber/10 text-amber-deep border border-amber/25 group-hover:scale-105 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber-deep tracking-tight">
              {pendingCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Awaiting activation</p>
          </div>

          {/* EPC Installers */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                EPC Installers
              </span>
              <div className="p-1.5 rounded-lg bg-teal/10 text-teal border border-teal/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
              {epcCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Contractor network</p>
          </div>

          {/* Solar Brands */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Solar Brands
              </span>
              <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                <Award className="w-3.5 h-3.5 text-navy-deep" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
              {brandCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Hardware partners</p>
          </div>

          {/* Writers */}
          <div className="p-4 sm:p-5 relative overflow-hidden group hover:bg-paper/40 transition-colors col-span-2 sm:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400" />
            <div className="flex items-center justify-between mb-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
                Article Writers
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 group-hover:scale-105 transition-transform">
                <PenTool className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-slate-700 tracking-tight">
              {writerCount}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">Editorial team</p>
          </div>
        </div>
      </div>

      {/* 3. ADAPTIVE SEGMENTED TABS */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 text-xs font-ibm-plex-mono">
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
        </div>

        {activeTab === "users" && (
          <span className="text-xs text-slate-custom font-ibm-plex-mono">
            Showing <strong className="text-navy-deep">{filteredUsers.length}</strong> matching records
          </span>
        )}
      </div>

      {/* 4. ACTIVE TAB CONTENT */}
      {activeTab === "users" ? (
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
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-line/70 rounded-md select-none shrink-0 ml-1">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Role Filter */}
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
                onValueChange={(val: "latest" | "oldest" | "alpha") => setSortOrder(val)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-navy-deep w-full sm:w-36 focus:ring-amber/20 focus:border-amber">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
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
                                  userName={user.name || ""}
                                  userEmail={user.email}
                                />
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-custom font-ibm-plex-mono">
                        <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-semibold text-navy-deep">No users found</p>
                        <p className="text-xs text-slate-custom mt-0.5">Try adjusting your search query or filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE STACKED CARD FALLBACK (visible on < md, hidden on md+) */}
          <div className="md:hidden space-y-3">
            {paginatedUsers.map((user) => {
              const whitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];
              const isSuperAdmin = whitelist.includes(user.email.toLowerCase()) || user.role === "super-admin";
              const displayRole = isSuperAdmin ? "super-admin" : user.role;
              const userLogo = user.brandLogo || user.epcLogo;

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-4 border border-line shadow-xs space-y-3"
                >
                  {/* Card Header: Avatar, Name, Role */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-line shrink-0">
                        <AvatarImage src={userLogo || undefined} />
                        <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs">
                          <UserIcon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-navy-deep truncate">
                          {user.name || "N/A"}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9.5px] font-semibold font-ibm-plex-mono uppercase tracking-wider border mt-0.5 ${getRoleBadgeStyle(
                            displayRole
                          )}`}
                        >
                          {displayRole.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    {!isSuperAdmin &&
                      (userRole === "super-admin" ||
                        (userRole === "admin" &&
                          user.role !== "admin" &&
                          user.role !== "super-admin")) && (
                        <DeleteUserButton
                          userId={user.id}
                          userName={user.name || ""}
                          userEmail={user.email}
                        />
                      )}
                  </div>

                  {/* Card Middle: Email */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-paper/60 p-2.5 rounded-xl border border-line/60 break-all">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  {/* Card Footer: Status & Quick Link */}
                  <div className="flex items-center justify-between pt-1 gap-2 border-t border-line/40">
                    <div>
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

                    <div className="flex items-center gap-1.5">
                      {user.role === "epc" && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs font-bold border-line"
                        >
                          <Link href="/dashboard/admin/onboard-epc">EPC Hub</Link>
                        </Button>
                      )}
                      {user.role === "brand" && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs font-bold border-line"
                        >
                          <Link href="/dashboard/admin/onboard-brand">Brand Hub</Link>
                        </Button>
                      )}
                      {user.role === "writer" && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs font-bold border-line"
                        >
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
      ) : (
        /* PENDING INVITATIONS TAB (100% Full Width) */
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

