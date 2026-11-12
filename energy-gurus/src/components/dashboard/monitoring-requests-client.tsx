"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Phone,
  Mail,
  Zap,
  Activity,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  X,
  MessageCircle,
  ChevronDown,
  Layers,
  ShieldCheck,
  CreditCard,
  MapPin,
  Building2,
  FileText,
} from "lucide-react";
import { updateMonitoringStatus } from "@/lib/actions/monitoring-actions";

export type MonitoringStatus = "pending" | "contacted" | "active" | "rejected";

export interface MonitoringRequestItem {
  id: string;
  customerName: string;
  designation?: string | null;
  company?: string | null;
  city?: string | null;
  address?: string | null;
  contactNo: string;
  email: string;
  cnic?: string | null;
  customerType?: string | null;
  systemSize?: string | null;
  package?: string | null;
  monitoringHours?: string | null;
  paymentPlan?: string | null;
  amountPayable?: string | null;
  remarks?: string | null;
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
  contact: "31 kW+ (Custom)",
  "1": "1 – 10 kW",
  "1.25": "10 – 20 kW",
  "1.5": "20 – 30 kW",
};

const PACKAGE_LABELS: Record<string, { name: string; frequency: string; audits: string }> = {
  "1": { name: "Basic", frequency: "Annual", audits: "1x / yr" },
  "1.2": { name: "Moderate", frequency: "Bi-Annual", audits: "2x / yr" },
  "1.4": { name: "Comprehensive", frequency: "Quarterly", audits: "4x / yr" },
  "1000": { name: "Basic", frequency: "Annual", audits: "1x / yr" },
  "1800": { name: "Moderate", frequency: "Bi-Annual", audits: "2x / yr" },
  "3000": { name: "Comprehensive", frequency: "Quarterly", audits: "4x / yr" },
};

const SYSTEM_TYPE_LABELS: Record<string, { label: string; desc: string }> = {
  "1": { label: "Grid Tied", desc: "Net-metered without storage" },
  "1.2": { label: "Hybrid", desc: "Battery backup + Solar telemetry" },
};

const PAYMENT_PLAN_LABELS: Record<string, { title: string; discountBadge: string | null }> = {
  "0": { title: "Monthly", discountBadge: null },
  "0.07": { title: "Quarterly Advance", discountBadge: "7% off" },
  "0.15": { title: "Bi-Annual Advance", discountBadge: "15% off" },
  "0.2": { title: "Quarterly Advance", discountBadge: "Legacy" },
  "0.3": { title: "Annual Advance", discountBadge: "30% off" },
};

const STATUS_CONFIG: Record<
  MonitoringStatus,
  {
    label: string;
    sublabel: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  pending: {
    label: "PENDING",
    sublabel: "Needs initial contact & review",
    badgeClass: "bg-amber-50/80 text-amber-800 border-amber-200/80 hover:bg-amber-100/60",
    dotClass: "bg-amber-500 animate-pulse",
  },
  contacted: {
    label: "CONTACTED",
    sublabel: "Outreach sent / in discussion",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60",
    dotClass: "bg-slate-600",
  },
  active: {
    label: "ACTIVE LIVE",
    sublabel: "Contract confirmed & live",
    badgeClass: "bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/60",
    dotClass: "bg-emerald-600",
  },
  rejected: {
    label: "REJECTED",
    sublabel: "Archived / invalid inquiry",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/60",
    dotClass: "bg-slate-400",
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
    setToastMessage(`Copied ${toastLabel}`);
    setTimeout(() => setCopiedField(null), 2000);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStatusChange = async (id: string, newStatus: MonitoringStatus) => {
    setUpdatingId(id);
    setOpenStatusDropdownId(null);

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
        (req.designation || "").toLowerCase().includes(q) ||
        (req.company || "").toLowerCase().includes(q) ||
        (req.city || "").toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.contactNo.toLowerCase().includes(q) ||
        (req.cnic || "").toLowerCase().includes(q) ||
        (req.address || "").toLowerCase().includes(q) ||
        (req.remarks || "").toLowerCase().includes(q) ||
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

  const formatPriceDisplay = (amountStr: string | null | undefined) => {
    if (!amountStr) return "Custom Quote";
    const primaryPart = amountStr.split(/\s*\(billed|\s*-\s*approx/i)[0].trim();
    return primaryPart
      .replace(/per year/i, "/ yr")
      .replace(/per month/i, "/ mo")
      .replace(/per quarter/i, "/ qtr");
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl border border-slate-700 text-xs font-mono flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Page Header with HUD Title & Unified Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Activity className="w-5 h-5 text-slate-800" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-space-grotesk">
              Solar Monitoring Setup Inquiries
            </h1>
          </div>
          <p className="text-slate-500 text-xs md:text-sm mt-1.5 font-sans">
            Real-time telemetry and commercial proposals requested through EnergyGurus public monitoring portal.
          </p>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Total Inquiries
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Platform Telemetry</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {stats.pending}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Needs initial contact</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              Contacted
            </span>
            <Phone className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {stats.contacted}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Under discussion</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Active Live
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-space-grotesk mt-2">
            {stats.active}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Contract confirmed</div>
        </div>
      </div>

      {/* 3. Search and Segmented Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, city, contact, remarks..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-sans text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto text-xs font-mono font-medium border border-slate-200">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("contacted")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "contacted"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            Contacted ({stats.contacted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "active"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Active ({stats.active})
          </button>
        </div>
      </div>

      {/* 4. Enterprise Clean SaaS Data Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer & Inquiry Ref</th>
                <th className="px-4 py-3 font-semibold">Contact Details</th>
                <th className="px-4 py-3 font-semibold">City & Address</th>
                <th className="px-4 py-3 font-semibold">Specification / Remarks</th>
                <th className="px-4 py-3 font-semibold">Commercials</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    No monitoring inquiries found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const inquiryRef = getInquiryRef(req);
                  const formattedDate = new Date(req.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const sizeLabel = req.systemSize ? (SYSTEM_SIZE_LABELS[req.systemSize] || `${req.systemSize} kW`) : null;
                  const pkgData = req.package ? (PACKAGE_LABELS[req.package] || {
                    name: req.package,
                    frequency: "Checkup",
                    audits: "Standard",
                  }) : null;
                  const typeData = req.monitoringHours ? (SYSTEM_TYPE_LABELS[req.monitoringHours] || {
                    label: req.monitoringHours,
                    desc: "System",
                  }) : null;
                  const planData = req.paymentPlan ? (PAYMENT_PLAN_LABELS[req.paymentPlan] || {
                    title: req.paymentPlan,
                    discountBadge: null,
                  }) : null;
                  const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                  const isDropdownOpen = openStatusDropdownId === req.id;
                  const formattedPrice = formatPriceDisplay(req.amountPayable);
                  const displayLocation = req.city || req.address || "—";

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReq(req)}
                    >
                      {/* 1. Customer & Inquiry Ref */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-space-grotesk font-semibold text-slate-900 text-[13.5px]">
                          {req.customerName}
                        </div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">
                          #{inquiryRef} • {req.city || req.customerType || "Residential"} • {formattedDate}
                        </div>
                        {(req.designation || req.company) && (
                          <div className="font-mono text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                            {req.designation}{req.designation && req.company ? " at " : ""}{req.company}
                          </div>
                        )}
                      </td>

                      {/* 2. Contact Details (Hover-only Copy Icons) */}
                      <td className="px-4 py-3.5 align-top space-y-0.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${req.contactNo}`}
                            className="font-mono text-xs font-semibold text-slate-900 hover:underline"
                          >
                            {req.contactNo}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(req.contactNo, `phone-${req.id}`, "Phone Number")}
                            className={`text-slate-400 hover:text-slate-700 p-0.5 rounded transition-all cursor-pointer ${
                              copiedField === `phone-${req.id}`
                                ? "opacity-100 text-emerald-600"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                            title="Copy Phone"
                          >
                            {copiedField === `phone-${req.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`mailto:${req.email}`}
                            className="text-xs text-slate-500 hover:text-slate-900 hover:underline truncate max-w-[170px]"
                          >
                            {req.email}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(req.email, `email-${req.id}`, "Email Address")}
                            className={`text-slate-400 hover:text-slate-700 p-0.5 rounded transition-all cursor-pointer ${
                              copiedField === `email-${req.id}`
                                ? "opacity-100 text-emerald-600"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                            title="Copy Email"
                          >
                            {copiedField === `email-${req.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {req.cnic ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 pt-0.5">
                            <span>CNIC {req.cnic}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.cnic || "", `cnic-${req.id}`, "CNIC Number")}
                              className={`text-slate-400 hover:text-slate-700 p-0.5 rounded transition-all cursor-pointer ${
                                copiedField === `cnic-${req.id}` ? "opacity-100 text-emerald-600" : "opacity-0 group-hover:opacity-100"
                              }`}
                              title="Copy CNIC"
                            >
                              {copiedField === `cnic-${req.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : req.company ? (
                          <div className="text-[11px] font-mono text-slate-500 pt-0.5 truncate max-w-[170px]">
                            {req.company}
                          </div>
                        ) : null}
                      </td>

                      {/* 3. City & Address */}
                      <td className="px-4 py-3.5 align-top max-w-[210px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 leading-relaxed">
                          <span className="line-clamp-2">{displayLocation}</span>
                          {displayLocation !== "—" && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(displayLocation, `addr-${req.id}`, "Location")}
                              className={`text-slate-400 hover:text-slate-700 shrink-0 mt-0.5 p-0.5 rounded transition-all cursor-pointer ${
                                copiedField === `addr-${req.id}` ? "opacity-100 text-emerald-600" : "opacity-0 group-hover:opacity-100"
                              }`}
                              title="Copy Address"
                            >
                              {copiedField === `addr-${req.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 4. Specification / Remarks */}
                      <td className="px-4 py-3.5 align-top max-w-[220px]">
                        {sizeLabel ? (
                          <>
                            <div className="font-mono text-xs font-semibold text-slate-900">
                              {sizeLabel} {typeData?.label ? `• ${typeData.label}` : ""}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {pkgData?.name} {pkgData?.frequency ? `(${pkgData.frequency})` : ""}
                            </div>
                          </>
                        ) : req.remarks ? (
                          <div className="text-xs text-slate-700 line-clamp-2 italic">
                            "{req.remarks}"
                          </div>
                        ) : (
                          <div className="font-mono text-xs text-slate-700">
                            Request to Contact
                          </div>
                        )}
                      </td>

                      {/* 5. Commercials */}
                      <td className="px-4 py-3.5 align-top">
                        {req.amountPayable ? (
                          <>
                            <div className="font-mono text-xs font-bold text-slate-900">
                              {formattedPrice}
                            </div>
                            {planData && (
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                                <span>{planData.title}</span>
                                {planData.discountBadge && (
                                  <span className="text-emerald-700 font-medium font-mono">
                                    ({planData.discountBadge})
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="font-mono text-xs text-slate-700">
                            Consultation
                          </div>
                        )}
                      </td>

                      {/* 6. Status Dropdown */}
                      <td className="px-4 py-3.5 align-top relative" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button
                            type="button"
                            disabled={updatingId === req.id}
                            onClick={() =>
                              setOpenStatusDropdownId(isDropdownOpen ? null : req.id)
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors cursor-pointer ${statusConf.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} />
                            <span>{statusConf.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                          </button>

                          {isDropdownOpen && (
                            <div
                              ref={dropdownRef}
                              className="absolute left-0 mt-1.5 w-60 bg-white shadow-xl border border-slate-200 rounded-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2.5 py-1 border-b border-slate-100">
                                Change Status
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
                                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between cursor-pointer text-xs ${
                                        isCurrent
                                          ? "bg-slate-100 font-semibold text-slate-900"
                                          : "hover:bg-slate-50 text-slate-700"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2 font-mono text-[11px]">
                                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`} />
                                        <span>{conf.label}</span>
                                      </span>
                                      {isCurrent && <Check className="w-3 h-3 text-emerald-600" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 7. Action Strip */}
                      <td className="px-4 py-3.5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedReq(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
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
      </div>

      {/* 5. Clean Enterprise Inquiry Detail Modal */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-100"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-slate-200 bg-white flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-space-grotesk text-xl font-bold text-slate-900">
                    {selectedReq.customerName}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${STATUS_CONFIG[selectedReq.status]?.badgeClass}`}>
                    {STATUS_CONFIG[selectedReq.status]?.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  #{getInquiryRef(selectedReq)} • {selectedReq.city || selectedReq.customerType || "Residential"} •{" "}
                  {new Date(selectedReq.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Outreach Actions Bar */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                Outreach:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:${selectedReq.contactNo}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${formatCleanPhone(selectedReq.contactNo)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#25D366] text-white text-xs font-medium hover:bg-[#20ba5a] transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={`mailto:${selectedReq.email}?subject=Regarding%20Your%20EnergyGurus%20Monitoring%20Request`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </div>
            </div>

            {/* Modal Body: Grid */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(92vh-220px)] bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Contact & Identity Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      Contact Details
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Customer: ${selectedReq.customerName}\nDesignation: ${selectedReq.designation || 'N/A'}\nCompany: ${selectedReq.company || 'N/A'}\nCity: ${selectedReq.city || selectedReq.address || 'N/A'}\nPhone: ${selectedReq.contactNo}\nEmail: ${selectedReq.email}`,
                          "copy-all-contact",
                          "Contact Card"
                        )
                      }
                      className="text-[11px] text-slate-500 hover:text-slate-900 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Phone:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {selectedReq.contactNo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">Email:</span>
                      <span className="text-slate-900 font-medium truncate max-w-[190px]">
                        {selectedReq.email}
                      </span>
                    </div>
                    {selectedReq.designation && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-mono">Designation:</span>
                        <span className="text-slate-900 font-medium">
                          {selectedReq.designation}
                        </span>
                      </div>
                    )}
                    {selectedReq.company && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-mono">Company:</span>
                        <span className="text-slate-900 font-medium">
                          {selectedReq.company}
                        </span>
                      </div>
                    )}
                    {selectedReq.cnic && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-mono">CNIC:</span>
                        <span className="font-mono text-slate-900 font-medium">
                          {selectedReq.cnic}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-slate-500 font-mono text-[11px] mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> City / Address:
                      </div>
                      <div className="text-slate-700 leading-relaxed text-xs">
                        {selectedReq.city || selectedReq.address || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Remarks / Requirements */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Inquiry Remarks & Notes
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {selectedReq.remarks ? (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed text-xs whitespace-pre-wrap">
                        {selectedReq.remarks}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-xs py-2">
                        No specific remarks provided by customer.
                      </div>
                    )}

                    {selectedReq.systemSize && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-slate-500 font-mono text-[11px]">System Size:</div>
                        <div className="font-space-grotesk font-bold text-slate-900 text-sm mt-0.5">
                          {SYSTEM_SIZE_LABELS[selectedReq.systemSize] || `${selectedReq.systemSize} kW`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. System & Commercial Spec (if present) */}
                {(selectedReq.package || selectedReq.amountPayable) && (
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Package & Financial Breakdown
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {selectedReq.package && (
                        <div>
                          <div className="text-slate-500 font-mono text-[11px]">Package Tier:</div>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {PACKAGE_LABELS[selectedReq.package]?.name || selectedReq.package}
                          </div>
                        </div>
                      )}
                      {selectedReq.amountPayable && (
                        <div>
                          <div className="text-slate-500 font-mono text-[11px]">Estimated Amount:</div>
                          <div className="font-mono font-bold text-slate-900 mt-0.5">
                            {selectedReq.amountPayable}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-semibold uppercase text-slate-500">
                  Update:
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
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? `${conf.badgeClass} border`
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
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
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer shadow-2xs"
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
