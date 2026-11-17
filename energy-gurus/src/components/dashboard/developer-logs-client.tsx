"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Terminal,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  User,
  Users,
  Database,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  getDeveloperLogs,
  TimeframeOption,
  LogTypeFilter,
} from "@/lib/actions/developer-logs-actions";

interface DeveloperLogItem {
  id: string;
  logType: "activity" | "user_activity" | "error";
  action: string;
  tableName: string | null;
  recordId: string | null;
  summary: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date | string;
}

interface DeveloperLogsClientProps {
  initialData: {
    logs: DeveloperLogItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: {
      total: number;
      userActivities: number;
      devActivities: number;
      errors: number;
      today: number;
    };
  };
}

export function DeveloperLogsClient({ initialData }: DeveloperLogsClientProps) {
  const [data, setData] = useState(initialData);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("7d");
  const [logType, setLogType] = useState<LogTypeFilter>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [selectedLog, setSelectedLog] = useState<DeveloperLogItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");
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

  const loadLogs = (
    newTimeframe = timeframe,
    newType = logType,
    newRole = roleFilter,
    newAction = actionFilter,
    newSearch = search,
    newPage = page
  ) => {
    startTransition(async () => {
      try {
        const res = await getDeveloperLogs({
          timeframe: newTimeframe,
          logType: newType,
          roleFilter: newRole,
          action: newAction,
          search: newSearch,
          page: newPage,
          limit: 50,
        });
        setData(res as any);
        const now = new Date();
        setLastRefreshed(
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    });
  };

  const handleRefresh = () => {
    loadLogs(timeframe, logType, roleFilter, actionFilter, search, page);
  };

  const handleTimeframeChange = (tf: TimeframeOption) => {
    setTimeframe(tf);
    setPage(1);
    loadLogs(tf, logType, roleFilter, actionFilter, search, 1);
  };

  const handleTabChange = (type: LogTypeFilter) => {
    setLogType(type);
    setPage(1);
    loadLogs(timeframe, type, roleFilter, actionFilter, search, 1);
  };

  const handleRoleChange = (role: string) => {
    setRoleFilter(role);
    setPage(1);
    loadLogs(timeframe, logType, role, actionFilter, search, 1);
  };

  const handleActionChange = (act: string) => {
    setActionFilter(act);
    setPage(1);
    loadLogs(timeframe, logType, roleFilter, act, search, 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs(timeframe, logType, roleFilter, actionFilter, search, 1);
  };

  const handleCopyJson = (jsonObj: any) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadgeStyle = (role: string | null) => {
    switch ((role || "").toLowerCase()) {
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

  const getActionBadgeClass = (action: string, type: "activity" | "user_activity" | "error") => {
    if (type === "error") {
      return "text-rose-700 bg-rose-50 border border-rose-200";
    }
    const act = action.toUpperCase();
    if (act.includes("DELETE") || act.includes("REJECT")) {
      return "text-red-700 bg-red-50 border border-red-200";
    }
    if (act.includes("CREATE") || act.includes("INSERT") || act.includes("SIGNUP")) {
      return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    }
    if (act.includes("LOGIN") || act.includes("AUTH")) {
      return "text-teal-700 bg-teal-50 border border-teal-200";
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return "text-blue-700 bg-blue-50 border border-blue-200";
    }
    if (act.includes("INQUIRY") || act.includes("SUBMISSION") || act.includes("REVIEW")) {
      return "text-amber-800 bg-amber/15 border border-amber/30";
    }
    return "text-slate-700 bg-slate-100 border border-slate-200";
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 font-sans select-none text-slate-900">
      {/* 1. HEADER ROW WITH DIRECT ACTION BUTTONS (Matches User Management) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold tracking-tight text-navy-deep">
              Developer &amp; User Logs
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20 font-ibm-plex-mono">
              Audit Vault
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-custom font-ibm-plex-mono">
            Audit database activity, track user interactions, and inspect system telemetry (capped to 7 days).
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            Auto-Pruned: <span className="text-slate-700 font-semibold">Latest 7 Days</span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-9 px-4 rounded-xl bg-amber hover:bg-amber-deep text-navy-deep text-xs font-bold gap-1.5 shadow-sm transition-all active:scale-98 inline-flex items-center cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-navy-deep ${isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
            <span className="text-[10px] opacity-75 font-mono hidden md:inline">
              ({lastRefreshed})
            </span>
          </button>
        </div>
      </div>

      {/* 2. UNIFIED BENTO METRIC ROW (Exact User Management Bento style) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total In Period */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Total In Period
            </span>
            <div className="p-1.5 rounded-lg bg-amber/10 text-amber group-hover:scale-105 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
            {data.stats.total}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            {timeframe === "1d" ? "Past 24 Hours" : timeframe === "3d" ? "Past 3 Days" : "Past 7 Days"}
          </p>
        </div>

        {/* User Activity Logs */}
        <div
          onClick={() => handleTabChange("user_activity")}
          className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-teal/60 hover:shadow-sm transition-all duration-200 cursor-pointer select-none"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              User Activity
            </span>
            <div className="p-1.5 rounded-lg bg-teal/10 text-teal group-hover:scale-105 transition-transform flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-teal" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-teal tracking-tight">
            {data.stats.userActivities}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            Logins, inquiries, submissions
          </p>
        </div>

        {/* DB Writes & Developer Logs */}
        <div
          onClick={() => handleTabChange("activity")}
          className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber-deep/40 hover:shadow-sm transition-all duration-200 cursor-pointer select-none"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-deep" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              DB &amp; Dev Actions
            </span>
            <div className="p-1.5 rounded-lg bg-amber-deep/10 text-amber-deep group-hover:scale-105 transition-transform">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-amber-deep tracking-tight">
            {data.stats.devActivities}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            Create, Update, Delete
          </p>
        </div>

        {/* Errors & Exceptions */}
        <div
          onClick={() => handleTabChange("error")}
          className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-rose-400 hover:shadow-sm transition-all duration-200 cursor-pointer select-none"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Errors &amp; Alerts
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {data.stats.errors}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            API &amp; DB exceptions
          </p>
        </div>

        {/* Today (24h) */}
        <div className="p-4 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-navy-deep/40 hover:shadow-sm transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy-deep" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono truncate">
              Today (24h)
            </span>
            <div className="p-1.5 rounded-lg bg-navy-deep/10 text-navy-deep group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-space-grotesk text-2xl sm:text-3xl font-black text-navy-deep tracking-tight">
            {data.stats.today}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5 font-ibm-plex-mono truncate">
            Live velocity today
          </p>
        </div>
      </div>

      {/* 3. ADAPTIVE SEGMENTED TABS (User Logs vs Developer Logs vs Errors) */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/50 text-xs font-ibm-plex-mono flex-wrap gap-1">
          {/* User Activity Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("user_activity")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              logType === "user_activity"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal" />
            User Activity ({data.stats.userActivities})
          </button>

          {/* Developer / DB Logs Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("activity")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              logType === "activity"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-deep" />
            Developer &amp; DB Logs ({data.stats.devActivities})
          </button>

          {/* Errors Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("error")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              logType === "error"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Errors &amp; Alerts ({data.stats.errors})
          </button>

          {/* All Combined Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              logType === "all"
                ? "bg-white text-navy-deep shadow-xs border border-line/60"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber" />
            All Combined ({data.stats.total})
          </button>
        </div>

        <span className="text-xs text-slate-custom font-ibm-plex-mono">
          Showing <strong className="text-navy-deep">{data.logs.length}</strong> of{" "}
          <strong className="text-navy-deep">{data.total}</strong> records
        </span>
      </div>

      {/* 4. SEARCH & FILTERS BAR (Matches User Management pill style) */}
      <div className="bg-white p-3.5 rounded-2xl border border-line shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input with Cmd+K */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-amber transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, summary, table..."
              className="w-full pl-9 pr-14 py-2 text-xs font-medium bg-slate-50/80 border border-line rounded-xl focus:bg-white focus:border-amber focus:ring-2 focus:ring-amber/15 outline-none transition-all placeholder:text-slate-400 text-navy-deep"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-ibm-plex-mono bg-white text-slate-400 border border-line px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          </form>

          {/* Timeframe Filter (1 Day, 3 Days, 7 Days) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-line/60 text-xs font-ibm-plex-mono">
            <button
              type="button"
              onClick={() => handleTimeframeChange("1d")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === "1d"
                  ? "bg-white text-navy-deep shadow-2xs"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              1 Day
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("3d")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === "3d"
                  ? "bg-white text-navy-deep shadow-2xs"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              3 Days
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("7d")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeframe === "7d"
                  ? "bg-white text-navy-deep shadow-2xs"
                  : "text-slate-500 hover:text-navy-deep"
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 text-xs font-semibold bg-slate-50/80 border border-line rounded-xl text-navy-deep outline-none focus:border-amber focus:bg-white transition-all cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="super-admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="epc">EPC Installer</option>
            <option value="brand">Solar Brand</option>
            <option value="writer">Writer</option>
            <option value="guest">Guest / Client</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => handleActionChange(e.target.value)}
            className="w-full sm:w-auto h-9 px-3 text-xs font-semibold bg-slate-50/80 border border-line rounded-xl text-navy-deep outline-none focus:border-amber focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="INQUIRY">INQUIRY</option>
            <option value="SUBMISSION">SUBMISSION</option>
            <option value="REVIEW">REVIEW</option>
            <option value="API_ERROR">API_ERROR</option>
            <option value="DB_ERROR">DB_ERROR</option>
          </select>
        </div>
      </div>

      {/* 5. DATA TABLE (Matches User Management Table Craft) */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-line text-[11px] font-bold font-ibm-plex-mono uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User / Actor</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Action &amp; Type</th>
                <th className="px-5 py-3.5">Event Summary</th>
                <th className="px-5 py-3.5">Target / Module</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 font-sans text-xs">
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-400 italic font-mono text-xs">
                    No logs found matching the selected timeframe and filters.
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => {
                  const dateObj = new Date(log.createdAt);
                  const formattedTime = dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* 1. User / Actor with Initial Avatar */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center shrink-0 border border-amber/20 font-bold text-xs font-ibm-plex-mono">
                            {getUserInitials(log.userName)}
                          </div>
                          <div>
                            <div className="font-bold text-navy-deep group-hover:text-amber transition-colors">
                              {log.userName || "System / Guest"}
                            </div>
                            <div className="text-[11px] text-slate-400 font-ibm-plex-mono truncate max-w-[170px]">
                              {log.userId ? `ID: ${log.userId.slice(0, 14)}...` : "System Telemetry"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role Badge */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border font-ibm-plex-mono ${getRoleBadgeStyle(
                            log.userRole || "guest"
                          )}`}
                        >
                          {log.userRole || "guest"}
                        </span>
                      </td>

                      {/* 3. Action & Type */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-ibm-plex-mono ${getActionBadgeClass(
                            log.action,
                            log.logType
                          )}`}
                        >
                          {log.action}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                          {log.logType === "user_activity"
                            ? "USER ACTION"
                            : log.logType === "error"
                            ? "ERROR EVENT"
                            : "DB ACTIVITY"}
                        </div>
                      </td>

                      {/* 4. Event Summary */}
                      <td className="px-5 py-4 align-top max-w-[280px]">
                        <div className="text-slate-800 font-medium leading-relaxed line-clamp-2">
                          {log.summary}
                        </div>
                      </td>

                      {/* 5. Target / Module */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <div className="font-mono text-xs text-navy-deep font-semibold flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.tableName || "platform"}</span>
                        </div>
                        {log.recordId && (
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]">
                            #{log.recordId.slice(0, 8)}
                          </div>
                        )}
                      </td>

                      {/* 6. Timestamp */}
                      <td className="px-5 py-4 align-top whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-slate-800">
                          {formattedTime}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {formattedDate}
                        </div>
                      </td>

                      {/* 7. Action: Inspect Button */}
                      <td className="px-5 py-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 rounded-xl border border-line hover:border-amber/60 hover:bg-amber/5 text-navy-deep text-xs font-semibold shadow-2xs transition-all cursor-pointer font-ibm-plex-mono"
                        >
                          Payload
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip (Matches User Management) */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-line flex items-center justify-between text-xs font-ibm-plex-mono text-slate-500">
          <div>
            Showing <strong className="text-navy-deep">{data.logs.length}</strong> of{" "}
            <strong className="text-navy-deep">{data.total}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() => {
                const nextP = page - 1;
                setPage(nextP);
                loadLogs(timeframe, logType, roleFilter, actionFilter, search, nextP);
              }}
              className="p-1.5 rounded-lg border border-line bg-white hover:bg-paper disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page <strong className="text-navy-deep">{data.page}</strong> of{" "}
              <strong className="text-navy-deep">{data.totalPages}</strong>
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages || isPending}
              onClick={() => {
                const nextP = page + 1;
                setPage(nextP);
                loadLogs(timeframe, logType, roleFilter, actionFilter, search, nextP);
              }}
              className="p-1.5 rounded-lg border border-line bg-white hover:bg-paper disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Diagnostic Payload Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-line bg-gradient-to-r from-slate-50 via-white to-amber-50/20 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-ibm-plex-mono ${getActionBadgeClass(
                      selectedLog.action,
                      selectedLog.logType
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                  <span className="font-ibm-plex-mono text-xs text-slate-500">
                    {selectedLog.tableName ? `Target: ${selectedLog.tableName}` : "System Operation"}
                  </span>
                </div>
                <h3 className="font-space-grotesk text-base sm:text-lg font-bold text-navy-deep pt-1">
                  {selectedLog.summary}
                </h3>
                <p className="text-xs text-slate-400 font-ibm-plex-mono">
                  Log ID: {selectedLog.id} • {new Date(selectedLog.createdAt).toLocaleString("en-US")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-navy-deep rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-160px)] bg-slate-50/40">
              {/* Actor Card */}
              <div className="bg-white border border-line rounded-xl p-4 shadow-2xs space-y-2 text-xs font-ibm-plex-mono">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Actor &amp; Context
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <div>
                    <span className="text-slate-400">Name:</span>{" "}
                    <strong className="text-navy-deep">{selectedLog.userName || "System"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Role:</span>{" "}
                    <span
                      className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold uppercase border ${getRoleBadgeStyle(
                        selectedLog.userRole || "guest"
                      )}`}
                    >
                      {selectedLog.userRole || "guest"}
                    </span>
                  </div>
                  {selectedLog.userId && (
                    <div className="col-span-2 truncate">
                      <span className="text-slate-400">User ID:</span> {selectedLog.userId}
                    </div>
                  )}
                  {selectedLog.recordId && (
                    <div className="col-span-2 truncate">
                      <span className="text-slate-400">Record ID:</span> {selectedLog.recordId}
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnostic Payload JSON */}
              <div className="bg-white border border-line rounded-xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-xs font-bold font-ibm-plex-mono uppercase tracking-wider text-slate-500">
                    Diagnostic Payload &amp; Metadata
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyJson(selectedLog.metadata || {})}
                    className="text-xs font-ibm-plex-mono text-teal hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-navy-deep text-emerald-400 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[300px] leading-relaxed border border-line">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-white border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-navy-deep hover:bg-navy-deep/90 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
