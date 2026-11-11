"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  X,
  MessageCircle,
  ChevronDown,
  Layers,
  Calendar,
  Share2,
  ShieldCheck,
  Building,
  Home,
  Factory,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { updateMonitoringStatus } from "@/lib/actions/monitoring-actions";

export type MonitoringStatus = "pending" | "contacted" | "active" | "rejected";

export interface MonitoringRequestItem {
  id: string;
  customerName: string;
  address: string;
  contactNo: string;
  email: string;
  cnic: string;
  customerType: string;
  systemSize: string;
  package: string;
  monitoringHours: string;
  paymentPlan: string;
  amountPayable: string | null;
  status: MonitoringStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const SYSTEM_SIZE_LABELS: Record<string, string> = {
  "800": "1 – 5 kW",
  "1200": "6 – 10 kW",
  "1600": "11 – 15 kW",
  "2000": "16 – 20 kW",
  "2500": "21 – 25 kW",
  "3000": "26 – 30 kW",
  contact: "31 kW & Above (Custom Quote)",
  "1": "1 – 10 kW",
  "1.25": "10 – 20 kW",
  "1.5": "20 – 30 kW",
};

const PACKAGE_LABELS: Record<string, { name: string; frequency: string; audits: string }> = {
  "1": { name: "Basic", frequency: "Annual Checkup", audits: "1x per year" },
  "1.2": { name: "Moderate", frequency: "Bi-Annual Checkup", audits: "2x per year" },
  "1.4": { name: "Comprehensive", frequency: "Quarterly Checkup", audits: "4x per year" },
  "1000": { name: "Basic", frequency: "Annual Checkup", audits: "1x per year" },
  "1800": { name: "Moderate", frequency: "Bi-Annual Checkup", audits: "2x per year" },
  "3000": { name: "Comprehensive", frequency: "Quarterly Checkup", audits: "4x per year" },
};

const SYSTEM_TYPE_LABELS: Record<string, { label: string; desc: string }> = {
  "1": { label: "Grid Tied", desc: "Net-metered without storage" },
  "1.2": { label: "Hybrid", desc: "Battery backup + Solar telemetry" },
};

const PAYMENT_PLAN_LABELS: Record<string, { title: string; discountBadge: string | null }> = {
  "0": { title: "Monthly", discountBadge: null },
  "0.07": { title: "Quarterly Advance", discountBadge: "7% Off" },
  "0.15": { title: "Bi-Annual Advance", discountBadge: "15% Off" },
  "0.2": { title: "Quarterly Advance", discountBadge: "Legacy" },
  "0.3": { title: "Annual Advance", discountBadge: "30% Off" },
};

const STATUS_CONFIG: Record<
  MonitoringStatus,
  {
    label: string;
    sublabel: string;
    pillClass: string;
    dotClass: string;
    borderClass: string;
    icon: string;
  }
> = {
  pending: {
    label: "PENDING",
    sublabel: "Needs initial contact & review",
    pillClass: "bg-amber-50/90 text-amber-700 border-amber-200/80 hover:bg-amber-100/70",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse",
    borderClass: "border-l-amber-500",
    icon: "●",
  },
  contacted: {
    label: "CONTACTED",
    sublabel: "Outreach sent / in discussion",
    pillClass: "bg-blue-50/90 text-blue-700 border-blue-200/80 hover:bg-blue-100/70",
    dotClass: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
    borderClass: "border-l-blue-500",
    icon: "●",
  },
  active: {
    label: "ACTIVE",
    sublabel: "Contract confirmed & monitoring live",
    pillClass: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse",
    borderClass: "border-l-emerald-500",
    icon: "●",
  },
  rejected: {
    label: "REJECTED",
    sublabel: "Archived / invalid inquiry",
    pillClass: "bg-rose-50/90 text-rose-700 border-rose-200/80 hover:bg-rose-100/70",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    borderClass: "border-l-rose-500",
    icon: "✕",
  },
};

export function MonitoringRequestsClient({
  initialRequests,
}: {
  initialRequests: MonitoringRequestItem[];
}) {
  const [requests, setRequests] = useState<MonitoringRequestItem[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MonitoringStatus>("all");
  const [selectedReq, setSelectedReq] = useState<MonitoringRequestItem | null>(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close status dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenStatusDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenStatusDropdownId(null);
        setSelectedReq(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const copyToClipboard = (text: string, fieldKey: string, toastLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setToastMessage(`Copied ${toastLabel} to clipboard`);
    setTimeout(() => setCopiedField(null), 2200);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStatusChange = async (id: string, newStatus: MonitoringStatus) => {
    setUpdatingId(id);
    setOpenStatusDropdownId(null);

    // Optimistic state update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq({ ...selectedReq, status: newStatus });
    }

    try {
      await updateMonitoringStatus(id, newStatus);
      setToastMessage(`Status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to update status");
      setTimeout(() => setToastMessage(null), 2500);
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      contacted: requests.filter((r) => r.status === "contacted").length,
      active: requests.filter((r) => r.status === "active").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== "all" && req.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        req.customerName.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.contactNo.toLowerCase().includes(q) ||
        req.cnic.toLowerCase().includes(q) ||
        req.address.toLowerCase().includes(q) ||
        (req.amountPayable || "").toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter]);

  const formatCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, "");
  };

  const getInquiryRef = (req: MonitoringRequestItem) => {
    const year = new Date(req.createdAt).getFullYear();
    const shortCode = req.id.replace(/-/g, "").slice(0, 4).toUpperCase();
    return `MON-${year}-${shortCode}`;
  };

  const getCustomerTypeIcon = (type: string) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("comm")) return <Building className="w-3 h-3" />;
    if (lower.includes("indus")) return <Factory className="w-3 h-3" />;
    return <Home className="w-3 h-3" />;
  };

  const getCustomerTypeBadgeStyle = (type: string) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("comm"))
      return "bg-blue-50/90 text-blue-700 border-blue-200/70";
    if (lower.includes("indus"))
      return "bg-purple-50/90 text-purple-700 border-purple-200/70";
    return "bg-emerald-50/90 text-emerald-700 border-emerald-200/70";
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="backdrop-blur-md bg-navy-deep/90 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 text-xs font-ibm-plex-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Page Header with HUD Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber/10 text-amber border border-amber/20 shadow-xs">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-navy-deep font-space-grotesk">
              Solar Monitoring Setup Inquiries
            </h1>
          </div>
          <p className="text-slate-custom text-xs md:text-sm mt-1.5 font-sans">
            Real-time telemetry and commercial proposals requested through EnergyGurus public monitoring portal.
          </p>
        </div>
      </div>

      {/* 2. Bento Telemetry Cards (Metrics Top Bar) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Inquiries Card */}
        <div className="bg-white border border-line rounded-2xl p-4.5 shadow-xs border-t-2 border-t-slate-800 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">
            <span>Total Inquiries</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-navy-deep font-space-grotesk mt-2">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Platform Telemetry</div>
        </div>

        {/* Pending Card */}
        <div className="bg-white border border-amber-200/60 rounded-2xl p-4.5 shadow-xs border-t-2 border-t-amber transition-all hover:shadow-sm bg-gradient-to-b from-amber-50/30 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber font-ibm-plex-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
              Pending
            </span>
            <Clock className="w-3.5 h-3.5 text-amber" />
          </div>
          <div className="text-2xl font-bold text-amber font-space-grotesk mt-2">
            {stats.pending}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1 font-mono">Needs initial contact</div>
        </div>

        {/* Contacted Card */}
        <div className="bg-white border border-blue-200/60 rounded-2xl p-4.5 shadow-xs border-t-2 border-t-blue-500 transition-all hover:shadow-sm bg-gradient-to-b from-blue-50/20 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-blue-600 font-ibm-plex-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Contacted
            </span>
            <Phone className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700 font-space-grotesk mt-2">
            {stats.contacted}
          </div>
          <div className="text-[11px] text-blue-700/80 mt-1 font-mono">Under discussion</div>
        </div>

        {/* Active Live Card */}
        <div className="bg-white border border-emerald-200/60 rounded-2xl p-4.5 shadow-xs border-t-2 border-t-emerald-500 transition-all hover:shadow-sm bg-gradient-to-b from-emerald-50/25 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-700 font-ibm-plex-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              Active Live
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-space-grotesk mt-2">
            {stats.active}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1 font-mono">Contract confirmed</div>
        </div>
      </div>

      {/* 3. Search and Status Filter Pill Strip */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, CNIC, phone, address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-line rounded-xl text-sm font-sans text-graphite placeholder:text-slate-400 outline-none focus:border-amber focus:ring-2 focus:ring-amber/15 transition-all shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl self-start md:self-auto text-xs font-ibm-plex-mono font-medium border border-line/60">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-navy-deep shadow-xs font-bold"
                : "text-slate-500 hover:text-navy-deep"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-white text-amber shadow-xs font-bold"
                : "text-slate-500 hover:text-amber"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            Pending ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("contacted")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "contacted"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Contacted ({stats.contacted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "active"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-slate-500 hover:text-emerald-700"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active ({stats.active})
          </button>
        </div>
      </div>

      {/* 4. Bento-Glass Data Table */}
      <Card className="border border-line shadow-xs rounded-2xl overflow-visible bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-ibm-plex-mono uppercase tracking-wider text-slate-500 bg-slate-50/90 border-b border-line">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Customer & Inquiry Ref</th>
                  <th className="px-5 py-3.5 font-semibold">Contact & CNIC</th>
                  <th className="px-5 py-3.5 font-semibold">Site Address</th>
                  <th className="px-5 py-3.5 font-semibold">System & Package Spec</th>
                  <th className="px-5 py-3.5 font-semibold">Commercial Terms</th>
                  <th className="px-5 py-3.5 font-semibold">Lifecycle Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Action Strip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 font-sans">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-custom italic">
                      No monitoring inquiries found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const inquiryRef = getInquiryRef(req);
                    const sizeLabel = SYSTEM_SIZE_LABELS[req.systemSize] || `${req.systemSize} kW`;
                    const pkgData = PACKAGE_LABELS[req.package] || {
                      name: req.package,
                      frequency: "Checkup",
                      audits: "Standard",
                    };
                    const typeData = SYSTEM_TYPE_LABELS[req.monitoringHours] || {
                      label: req.monitoringHours,
                      desc: "System",
                    };
                    const planData = PAYMENT_PLAN_LABELS[req.paymentPlan] || {
                      title: req.paymentPlan,
                      discountBadge: null,
                    };
                    const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                    const isDropdownOpen = openStatusDropdownId === req.id;

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => setSelectedReq(req)}
                      >
                        {/* 1. Customer & Date */}
                        <td className="px-5 py-4 align-top">
                          <div className="font-ibm-plex-mono text-[11px] text-slate-400 font-medium mb-1">
                            {new Date(req.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="font-space-grotesk font-bold text-navy-deep text-[14.5px] group-hover:text-amber transition-colors">
                            {req.customerName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getCustomerTypeBadgeStyle(
                                req.customerType
                              )}`}
                            >
                              {getCustomerTypeIcon(req.customerType)}
                              {req.customerType || "Residential"}
                            </span>
                            <span className="font-ibm-plex-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                              #{inquiryRef}
                            </span>
                          </div>
                        </td>

                        {/* 2. Contact & CNIC Info */}
                        <td className="px-5 py-4 align-top space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${req.contactNo}`}
                              className="font-mono text-xs font-semibold text-teal hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-teal shrink-0" />
                              {req.contactNo}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.contactNo, `phone-${req.id}`, "Phone Number")}
                              className="text-slate-400 hover:text-navy-deep p-0.5 rounded hover:bg-slate-100 transition-colors"
                              title="Copy Phone"
                            >
                              {copiedField === `phone-${req.id}` ? (
                                <Check className="w-3 h-3 text-teal" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={`mailto:${req.email}`}
                              className="text-xs text-slate-600 hover:text-navy-deep hover:underline truncate max-w-[160px] flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3 text-amber shrink-0" />
                              {req.email}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.email, `email-${req.id}`, "Email Address")}
                              className="text-slate-400 hover:text-navy-deep p-0.5 rounded hover:bg-slate-100 transition-colors"
                              title="Copy Email"
                            >
                              {copiedField === `email-${req.id}` ? (
                                <Check className="w-3 h-3 text-teal" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70 w-fit">
                            <span className="font-semibold text-slate-400">CNIC:</span>
                            <span className="font-semibold text-navy-deep">{req.cnic}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.cnic, `cnic-${req.id}`, "CNIC Number")}
                              className="text-slate-400 hover:text-navy-deep ml-0.5"
                              title="Copy CNIC"
                            >
                              {copiedField === `cnic-${req.id}` ? (
                                <Check className="w-3 h-3 text-teal" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 3. Site Address */}
                        <td className="px-5 py-4 align-top max-w-[210px]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-start gap-1.5 text-xs text-graphite group/addr">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-3 leading-relaxed">{req.address}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.address, `addr-${req.id}`, "Address")}
                              className="text-slate-400 hover:text-navy-deep shrink-0 mt-0.5"
                              title="Copy Address"
                            >
                              {copiedField === `addr-${req.id}` ? (
                                <Check className="w-3 h-3 text-teal" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 4. System & Package Telemetry Micro-Chips */}
                        <td className="px-5 py-4 align-top space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-ibm-plex-mono text-xs font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-md border border-teal/20 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {sizeLabel}
                            </span>
                            <span className="font-ibm-plex-mono text-[11px] font-semibold text-navy-deep bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                              {typeData.label}
                            </span>
                          </div>
                          <div className="text-xs text-navy-deep font-semibold">
                            {pkgData.name}{" "}
                            <span className="text-slate-400 font-normal">({pkgData.frequency})</span>
                          </div>
                        </td>

                        {/* 5. Commercial Breakdown */}
                        <td className="px-5 py-4 align-top max-w-[220px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-navy-deep">
                              {planData.title}
                            </span>
                            {planData.discountBadge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-ibm-plex-mono bg-amber/15 text-amber border border-amber/30">
                                {planData.discountBadge}
                              </span>
                            )}
                          </div>
                          {req.amountPayable ? (
                            <div className="text-[11px] font-ibm-plex-mono font-bold text-amber mt-1 line-clamp-2">
                              {req.amountPayable}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">
                              Custom Quote Requested
                            </div>
                          )}
                        </td>

                        {/* 6. Bento-Glass Status Dropdown */}
                        <td className="px-5 py-4 align-top relative" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <button
                              type="button"
                              disabled={updatingId === req.id}
                              onClick={() =>
                                setOpenStatusDropdownId(isDropdownOpen ? null : req.id)
                              }
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold font-ibm-plex-mono tracking-wider border backdrop-blur-xs transition-all shadow-2xs cursor-pointer ${statusConf.pillClass}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusConf.dotClass}`} />
                              <span>{statusConf.label}</span>
                              <ChevronDown className="w-3 h-3 text-slate-400 transition-transform group-hover:translate-y-0.5" />
                            </button>

                            {/* Floating Glass Popover */}
                            {isDropdownOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute left-0 mt-2 w-64 backdrop-blur-md bg-white/95 shadow-2xl border border-slate-200/90 rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                              >
                                <div className="text-[10px] font-ibm-plex-mono uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-line/60">
                                  Update Status
                                </div>
                                <div className="space-y-0.5 mt-1">
                                  {(
                                    ["pending", "contacted", "active", "rejected"] as MonitoringStatus[]
                                  ).map((stKey) => {
                                    const conf = STATUS_CONFIG[stKey];
                                    const isCurrent = req.status === stKey;

                                    return (
                                      <button
                                        key={stKey}
                                        type="button"
                                        onClick={() => handleStatusChange(req.id, stKey)}
                                        className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer text-xs ${
                                          isCurrent
                                            ? `bg-slate-100/90 font-bold ${conf.borderClass} border-l-3`
                                            : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${conf.dotClass}`} />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-ibm-plex-mono uppercase font-bold text-navy-deep text-[11px]">
                                              {conf.label}
                                            </span>
                                            {isCurrent && <Check className="w-3.5 h-3.5 text-teal" />}
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-sans mt-0.5 leading-snug">
                                            {conf.sublabel}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 7. Action Button [ 👁 Inspect Inquiry ] */}
                        <td className="px-5 py-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedReq(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:border-amber/60 hover:bg-amber/5 text-navy-deep text-xs font-semibold shadow-2xs transition-all cursor-pointer group/btn"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-amber transition-colors" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Inquiry Detail Modal with Modern Bento-Glass HUD Architecture */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200/90 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Hero Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-line bg-gradient-to-r from-slate-50 via-white to-amber-50/20 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-amber text-lg">⚡</span>
                  <h3 className="font-space-grotesk text-xl sm:text-2xl font-bold text-navy-deep">
                    {selectedReq.customerName}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getCustomerTypeBadgeStyle(
                      selectedReq.customerType
                    )}`}
                  >
                    {getCustomerTypeIcon(selectedReq.customerType)}
                    {selectedReq.customerType || "Residential"}
                  </span>
                  <span className="font-ibm-plex-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                    {new Date(selectedReq.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-ibm-plex-mono flex items-center gap-2">
                  <span className="text-navy-deep font-semibold">
                    Inquiry #{getInquiryRef(selectedReq)}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-md">{selectedReq.address}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="p-2 text-slate-400 hover:text-navy-deep rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sticky Outreach Action Bar */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50/80 border-b border-line/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] font-ibm-plex-mono font-bold uppercase tracking-wider text-slate-500">
                Direct Outreach Actions:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:${selectedReq.contactNo}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal/90 shadow-2xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Call {selectedReq.contactNo}
                </a>
                <a
                  href={`https://wa.me/${formatCleanPhone(selectedReq.contactNo)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba5a] shadow-2xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Direct
                </a>
                <a
                  href={`mailto:${selectedReq.email}?subject=Regarding%20Your%20Solar%20Monitoring%20Request%20-%20EnergyGurus`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-deep text-white text-xs font-semibold hover:bg-navy-deep/90 shadow-2xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Email
                </a>
              </div>
            </div>

            {/* Scrollable Bento Feature Grid (2x2) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(92vh-220px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BENTO CARD 1: CUSTOMER METADATA & SITE */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-line/60 pb-2">
                    <span className="text-xs font-bold font-ibm-plex-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                      Customer Metadata
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Customer: ${selectedReq.customerName}\nPhone: ${selectedReq.contactNo}\nEmail: ${selectedReq.email}\nCNIC: ${selectedReq.cnic}\nAddress: ${selectedReq.address}`,
                          "copy-all-contact",
                          "Full Contact Card"
                        )
                      }
                      className="text-[11px] text-teal hover:underline font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono">CNIC:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-navy-deep text-[13px]">
                          {selectedReq.cnic}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedReq.cnic, "modal-cnic", "CNIC")}
                          className="text-slate-400 hover:text-navy-deep"
                        >
                          {copiedField === "modal-cnic" ? (
                            <Check className="w-3.5 h-3.5 text-teal" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono">Email:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-navy-deep truncate max-w-[190px]">
                          {selectedReq.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedReq.email, "modal-email", "Email")}
                          className="text-slate-400 hover:text-navy-deep"
                        >
                          {copiedField === "modal-email" ? (
                            <Check className="w-3.5 h-3.5 text-teal" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-mono">Phone:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-teal text-[13px]">
                          {selectedReq.contactNo}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedReq.contactNo, "modal-phone", "Phone")}
                          className="text-slate-400 hover:text-navy-deep"
                        >
                          {copiedField === "modal-phone" ? (
                            <Check className="w-3.5 h-3.5 text-teal" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line/60">
                      <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber" /> Site Address:
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedReq.address, "modal-address", "Address")}
                          className="text-[11px] text-amber hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="text-navy-deep font-medium leading-relaxed bg-white/70 p-2 rounded-lg border border-line/60 text-xs">
                        {selectedReq.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BENTO CARD 2: SYSTEM & GRID ARCHITECTURE SPEC */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs space-y-3">
                  <div className="border-b border-line/60 pb-2">
                    <span className="text-xs font-bold font-ibm-plex-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber" />
                      System & Grid Spec
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-mono text-[11px]">System Generation Capacity</div>
                      <div className="font-space-grotesk font-bold text-teal text-lg mt-0.5">
                        {SYSTEM_SIZE_LABELS[selectedReq.systemSize] || `${selectedReq.systemSize} kW`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Raw scale key: {selectedReq.systemSize}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line/60">
                      <div className="text-slate-400 font-mono text-[11px]">Grid Integration Architecture</div>
                      <div className="font-space-grotesk font-bold text-navy-deep text-sm mt-0.5">
                        {SYSTEM_TYPE_LABELS[selectedReq.monitoringHours]?.label || selectedReq.monitoringHours}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {SYSTEM_TYPE_LABELS[selectedReq.monitoringHours]?.desc || "Standard Grid telemetry"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BENTO CARD 3: MONITORING PACKAGE SPEC */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs space-y-3">
                  <div className="border-b border-line/60 pb-2">
                    <span className="text-xs font-bold font-ibm-plex-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Monitoring Package
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-mono text-[11px]">Package Tier</div>
                      <div className="font-space-grotesk font-bold text-navy-deep text-base mt-0.5">
                        {PACKAGE_LABELS[selectedReq.package]?.name || selectedReq.package}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line/60">
                      <div className="text-slate-400 font-mono text-[11px]">Audit / Checkup Frequency</div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {PACKAGE_LABELS[selectedReq.package]?.frequency || "Annual Audit"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        Audits: {PACKAGE_LABELS[selectedReq.package]?.audits || "1x / year"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BENTO CARD 4: COMMERCIAL BREAKDOWN */}
                <div className="bg-amber-50/30 border border-amber-200/70 rounded-2xl p-4.5 shadow-2xs space-y-3">
                  <div className="border-b border-amber-200/60 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold font-ibm-plex-mono uppercase tracking-wider text-amber flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber" />
                      Commercial Breakdown
                    </span>
                    {PAYMENT_PLAN_LABELS[selectedReq.paymentPlan]?.discountBadge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-ibm-plex-mono bg-amber text-ink">
                        {PAYMENT_PLAN_LABELS[selectedReq.paymentPlan].discountBadge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="text-slate-500 font-mono text-[11px]">Payment Schedule</div>
                      <div className="font-semibold text-navy-deep text-sm mt-0.5">
                        {PAYMENT_PLAN_LABELS[selectedReq.paymentPlan]?.title || selectedReq.paymentPlan}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/50">
                      <div className="text-slate-500 font-mono text-[11px]">Estimated Amount Payable</div>
                      <div className="font-space-grotesk font-bold text-navy-deep text-base mt-0.5 leading-snug">
                        {selectedReq.amountPayable || "System 30 kW+ Custom Quote"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Status & Audit Trail */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-ibm-plex-mono uppercase text-slate-500">
                  Update Status:
                </span>
                <div className="flex items-center gap-1.5">
                  {(["pending", "contacted", "active", "rejected"] as MonitoringStatus[]).map((st) => {
                    const isSelected = selectedReq.status === st;
                    const conf = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={updatingId === selectedReq.id}
                        onClick={() => handleStatusChange(selectedReq.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-ibm-plex-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? `${conf.pillClass} shadow-xs font-bold border`
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`} />
                        <span>{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-5 py-2 rounded-xl bg-navy-deep hover:bg-navy-deep/90 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
