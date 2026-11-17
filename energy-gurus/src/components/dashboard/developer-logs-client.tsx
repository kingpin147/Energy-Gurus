"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  RefreshCw,
  Terminal,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  User,
  Database,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  getDeveloperLogs,
  TimeframeOption,
  LogTypeFilter,
} from "@/lib/actions/developer-logs-actions";

interface DeveloperLogItem {
  id: string;
  logType: "activity" | "error";
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
      activities: number;
      errors: number;
      today: number;
    };
  };
}

export function DeveloperLogsClient({ initialData }: DeveloperLogsClientProps) {
  const [data, setData] = useState(initialData);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("7d");
  const [logType, setLogType] = useState<LogTypeFilter>("all");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [selectedLog, setSelectedLog] = useState<DeveloperLogItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");

  const loadLogs = (newTimeframe = timeframe, newType = logType, newAction = actionFilter, newSearch = search, newPage = page) => {
    startTransition(async () => {
      try {
        const res = await getDeveloperLogs({
          timeframe: newTimeframe,
          logType: newType,
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
    loadLogs(timeframe, logType, actionFilter, search, page);
  };

  const handleTimeframeChange = (tf: TimeframeOption) => {
    setTimeframe(tf);
    setPage(1);
    loadLogs(tf, logType, actionFilter, search, 1);
  };

  const handleTypeChange = (type: LogTypeFilter) => {
    setLogType(type);
    setPage(1);
    loadLogs(timeframe, type, actionFilter, search, 1);
  };

  const handleActionChange = (act: string) => {
    setActionFilter(act);
    setPage(1);
    loadLogs(timeframe, logType, act, search, 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs(timeframe, logType, actionFilter, search, 1);
  };

  const handleCopyJson = (jsonObj: any) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadgeClass = (action: string, type: "activity" | "error") => {
    if (type === "error") {
      return "text-rose-700 bg-rose-50 border border-rose-200/80";
    }
    const act = action.toUpperCase();
    if (act.includes("DELETE")) {
      return "text-red-700 bg-red-50 border border-red-200/80";
    }
    if (act.includes("CREATE") || act.includes("INSERT")) {
      return "text-emerald-700 bg-emerald-50 border border-emerald-200/80";
    }
    if (act.includes("UPDATE")) {
      return "text-blue-700 bg-blue-50 border border-blue-200/80";
    }
    return "text-slate-700 bg-slate-100 border border-slate-200";
  };

  const getRoleBadgeClass = (role: string | null) => {
    const r = (role || "").toLowerCase();
    if (r === "super-admin") return "text-amber-800 bg-amber-50 border-amber-200/70";
    if (r === "admin") return "text-indigo-800 bg-indigo-50 border-indigo-200/70";
    if (r === "epc") return "text-teal-800 bg-teal-50 border-teal-200/70";
    if (r === "brand") return "text-sky-800 bg-sky-50 border-sky-200/70";
    return "text-slate-600 bg-slate-100 border-slate-200";
  };

  return (
    <div className="space-y-6 font-sans select-none text-slate-900">
      {/* 1. Header with Title & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              <Terminal className="w-5 h-5 text-slate-800" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-space-grotesk">
              Developer Logs
            </h1>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1.5 font-sans">
            Real-time audit telemetry for database writes, updates, deletes, and operational error events.
          </p>
        </div>

        {/* Refresh & Retention Badge */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            Retention: <span className="text-slate-700 font-semibold">Latest 7 Days</span> (Auto-Pruned)
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh latest developer logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              ({lastRefreshed})
            </span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (Uniform 1px solid border, 6px status dots) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Total In Period
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {data.stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {timeframe === "1d" ? "Past 24 Hours" : timeframe === "3d" ? "Past 3 Days" : "Past 7 Days"}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              DB Activities
            </span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {data.stats.activities}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Create, Update, Delete</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Errors & Exceptions
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {data.stats.errors}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">API & Database Errors</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Today (24h)
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {data.stats.today}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Recent Activity Pace</div>
        </div>
      </div>

      {/* 3. Filter Controls: Timeframe, Log Types, Action Filter, Search */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Left: Timeframe Segments + Type Segments */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Filter (1 Day, 3 Days, 7 Days) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono font-medium border border-slate-200">
            <button
              type="button"
              onClick={() => handleTimeframeChange("1d")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === "1d"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              1 Day
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("3d")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === "3d"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              3 Days
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("7d")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === "7d"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Type Filter (All, Activity, Error) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono font-medium border border-slate-200">
            <button
              type="button"
              onClick={() => handleTypeChange("all")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                logType === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("activity")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                logType === "activity"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Activity
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("error")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                logType === "error"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Errors
            </button>
          </div>

          {/* Action Quick Selector */}
          <div className="flex items-center gap-1">
            <select
              value={actionFilter}
              onChange={(e) => handleActionChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="WRITE">WRITE</option>
              <option value="API_ERROR">API_ERROR</option>
              <option value="DB_ERROR">DB_ERROR</option>
              <option value="AUTH_ERROR">AUTH_ERROR</option>
            </select>
          </div>
        </div>

        {/* Right: Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search summary, table, actor..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-sans text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* 4. Enterprise Clean SaaS Data Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action & Type</th>
                <th className="px-4 py-3 font-semibold">Affected Table / Target</th>
                <th className="px-4 py-3 font-semibold">Event Summary</th>
                <th className="px-4 py-3 font-semibold">Actor / Role</th>
                <th className="px-4 py-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {data.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-400 italic font-mono text-xs">
                    No developer logs recorded for this timeframe.
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
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* 1. Timestamp */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-slate-900">
                          {formattedTime}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {formattedDate}
                        </div>
                      </td>

                      {/* 2. Action & Type */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase ${getActionBadgeClass(
                              log.action,
                              log.logType
                            )}`}
                          >
                            {log.action}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                          {log.logType}
                        </div>
                      </td>

                      {/* 3. Affected Table / Target */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-800 flex items-center gap-1.5">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span>{log.tableName || "general"}</span>
                        </div>
                        {log.recordId && (
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                            ID: {log.recordId}
                          </div>
                        )}
                      </td>

                      {/* 4. Event Summary */}
                      <td className="px-4 py-3 align-top max-w-[340px]">
                        <div className="text-xs text-slate-900 font-medium line-clamp-2 leading-relaxed">
                          {log.summary}
                        </div>
                      </td>

                      {/* 5. Actor / Role */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{log.userName || "System"}</span>
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-medium border ${getRoleBadgeClass(
                              log.userRole
                            )}`}
                          >
                            {log.userRole || "system"}
                          </span>
                        </div>
                      </td>

                      {/* 6. Action: Inspect */}
                      <td className="px-4 py-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-mono font-medium shadow-2xs transition-colors cursor-pointer"
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

        {/* Pagination Strip */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{data.logs.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{data.total}</span> matching logs
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isPending}
              onClick={() => {
                const nextP = page - 1;
                setPage(nextP);
                loadLogs(timeframe, logType, actionFilter, search, nextP);
              }}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages || isPending}
              onClick={() => {
                const nextP = page + 1;
                setPage(nextP);
                loadLogs(timeframe, logType, actionFilter, search, nextP);
              }}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Diagnostic Payload Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-100"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-200 bg-white flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase ${getActionBadgeClass(
                      selectedLog.action,
                      selectedLog.logType
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {selectedLog.tableName ? `Table: ${selectedLog.tableName}` : "General"}
                  </span>
                </div>
                <h3 className="font-space-grotesk text-base font-bold text-slate-900 pt-1">
                  {selectedLog.summary}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Log ID: {selectedLog.id} •{" "}
                  {new Date(selectedLog.createdAt).toLocaleString("en-US")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-160px)] bg-slate-50/50">
              {/* Actor Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2 text-xs font-mono">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Actor Information
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                  <div>
                    <span className="text-slate-400">Name:</span>{" "}
                    <span className="font-semibold text-slate-900">{selectedLog.userName || "System"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Role:</span>{" "}
                    <span className="font-semibold text-slate-900">{selectedLog.userRole || "system"}</span>
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
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500">
                    Diagnostic Payload & Metadata
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyJson(selectedLog.metadata || {})}
                    className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-md text-[11px] font-mono overflow-x-auto max-h-[300px] leading-relaxed">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer shadow-2xs"
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
