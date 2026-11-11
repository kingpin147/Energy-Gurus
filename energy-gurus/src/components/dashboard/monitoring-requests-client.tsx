"use client";

import React, { useState, useMemo } from "react";
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
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { updateMonitoringStatus } from "@/lib/actions/monitoring-actions";

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
  status: "pending" | "contacted" | "active";
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

const PACKAGE_LABELS: Record<string, string> = {
  "1": "Basic (Annual Checkup)",
  "1.2": "Moderate (Bi-Annual Checkup)",
  "1.4": "Comprehensive (Quarterly Checkup)",
  "1000": "Basic (Annual Checkup)",
  "1800": "Moderate (Bi-Annual Checkup)",
  "3000": "Comprehensive (Quarterly Checkup)",
};

const SYSTEM_TYPE_LABELS: Record<string, string> = {
  "1": "Grid Tied",
  "1.2": "Hybrid",
};

const PAYMENT_PLAN_LABELS: Record<string, string> = {
  "0": "Monthly",
  "0.07": "Quarterly Advance (7% off)",
  "0.15": "Bi-Annual Advance (15% off)",
  "0.2": "Quarterly Advance",
  "0.3": "Annual Advance (30% off)",
};

export function MonitoringRequestsClient({
  initialRequests,
}: {
  initialRequests: MonitoringRequestItem[];
}) {
  const [requests, setRequests] = useState<MonitoringRequestItem[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "contacted" | "active">("all");
  const [selectedReq, setSelectedReq] = useState<MonitoringRequestItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (id: string, newStatus: "pending" | "contacted" | "active") => {
    setUpdatingId(id);
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq({ ...selectedReq, status: newStatus });
    }

    try {
      await updateMonitoringStatus(id, newStatus);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-navy-deep flex items-center gap-2.5 font-space-grotesk">
            <span className="p-2 rounded-xl bg-amber/10 text-amber border border-amber/20">
              <FileText className="w-6 h-6" />
            </span>
            Solar Monitoring Setup Inquiries
          </h1>
          <p className="text-slate-custom text-sm mt-1 font-sans">
            Comprehensive customer inquiries submitted from the public monitoring portal.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 font-sans">
        <div className="bg-white border border-line rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-custom font-ibm-plex-mono">
            Total Inquiries
          </div>
          <div className="text-2xl font-bold text-navy-deep font-space-grotesk mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-custom mt-0.5">All time submissions</div>
        </div>

        <div className="bg-white border border-amber/30 rounded-xl p-4 shadow-xs bg-amber/5">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber font-ibm-plex-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            Pending
          </div>
          <div className="text-2xl font-bold text-amber font-space-grotesk mt-1">
            {stats.pending}
          </div>
          <div className="text-[11px] text-slate-custom mt-0.5">Needs initial contact</div>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-ibm-plex-mono">
            Contacted
          </div>
          <div className="text-2xl font-bold text-blue-700 font-space-grotesk mt-1">
            {stats.contacted}
          </div>
          <div className="text-[11px] text-slate-custom mt-0.5">Under discussion</div>
        </div>

        <div className="bg-white border border-teal/30 rounded-xl p-4 shadow-xs bg-teal/5">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal font-ibm-plex-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
            Active
          </div>
          <div className="text-2xl font-bold text-teal font-space-grotesk mt-1">
            {stats.active}
          </div>
          <div className="text-[11px] text-slate-custom mt-0.5">Contract confirmed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, CNIC, phone, email, address..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-line rounded-xl text-sm font-sans text-graphite placeholder:text-slate-400 outline-none focus:border-amber focus:ring-2 focus:ring-amber/10 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-ibm-plex-mono font-medium">
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
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "pending"
                ? "bg-white text-amber shadow-xs font-bold"
                : "text-slate-500 hover:text-amber"
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("contacted")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "contacted"
                ? "bg-white text-blue-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            Contacted ({stats.contacted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-white text-teal shadow-xs font-bold"
                : "text-slate-500 hover:text-teal"
            }`}
          >
            Active ({stats.active})
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-ibm-plex-mono uppercase tracking-wider text-slate-500 bg-slate-50/80 border-b border-line">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Date & Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Contact & CNIC</th>
                  <th className="px-5 py-3.5 font-semibold">Site Address</th>
                  <th className="px-5 py-3.5 font-semibold">System & Package</th>
                  <th className="px-5 py-3.5 font-semibold">Commercials</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 font-sans">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-custom italic font-sans">
                      No monitoring requests found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const sizeLabel = SYSTEM_SIZE_LABELS[req.systemSize] || `${req.systemSize} kW`;
                    const pkgLabel = PACKAGE_LABELS[req.package] || req.package;
                    const typeLabel = SYSTEM_TYPE_LABELS[req.monitoringHours] || req.monitoringHours;
                    const planLabel = PAYMENT_PLAN_LABELS[req.paymentPlan] || req.paymentPlan;

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                        onClick={() => setSelectedReq(req)}
                      >
                        {/* Date & Customer */}
                        <td className="px-5 py-4 align-top">
                          <div className="text-[11px] font-ibm-plex-mono text-slate-400 mb-1">
                            {new Date(req.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="font-bold text-navy-deep text-[14px]">
                            {req.customerName}
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {req.customerType || "Residential"}
                          </span>
                        </td>

                        {/* Contact & CNIC */}
                        <td className="px-5 py-4 align-top space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 text-graphite font-medium text-xs">
                            <Phone className="w-3.5 h-3.5 text-teal shrink-0" />
                            <a
                              href={`tel:${req.contactNo}`}
                              className="hover:text-teal hover:underline font-mono"
                            >
                              {req.contactNo}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-custom text-xs">
                            <Mail className="w-3.5 h-3.5 text-amber shrink-0" />
                            <a
                              href={`mailto:${req.email}`}
                              className="hover:text-navy-deep hover:underline truncate max-w-[170px]"
                            >
                              {req.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                            <span className="font-semibold text-slate-400">CNIC:</span>
                            <span>{req.cnic}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(req.cnic, `cnic-${req.id}`)}
                              className="text-slate-400 hover:text-navy-deep ml-1 cursor-pointer"
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

                        {/* Address */}
                        <td className="px-5 py-4 align-top max-w-[200px]">
                          <div className="flex items-start gap-1.5 text-xs text-graphite line-clamp-3">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{req.address}</span>
                          </div>
                        </td>

                        {/* System & Package */}
                        <td className="px-5 py-4 align-top space-y-1">
                          <div className="font-space-grotesk font-bold text-teal text-[13px] flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            {sizeLabel}
                          </div>
                          <div className="text-xs text-navy-deep font-semibold">
                            {pkgLabel}
                          </div>
                          <div className="text-[11px] text-slate-custom flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {typeLabel}
                          </div>
                        </td>

                        {/* Commercials */}
                        <td className="px-5 py-4 align-top max-w-[220px]">
                          <div className="text-xs font-semibold text-slate-700">
                            {planLabel}
                          </div>
                          {req.amountPayable ? (
                            <div className="text-[11px] font-mono text-amber font-semibold mt-1 line-clamp-2">
                              {req.amountPayable}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">
                              Custom Quote
                            </div>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-5 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={req.status}
                            disabled={updatingId === req.id}
                            onChange={(e) =>
                              handleStatusChange(
                                req.id,
                                e.target.value as "pending" | "contacted" | "active"
                              )
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-ibm-plex-mono border cursor-pointer outline-none transition-all ${
                              req.status === "pending"
                                ? "bg-amber/15 text-amber border-amber/30"
                                : req.status === "contacted"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-teal/15 text-teal border-teal/30"
                            }`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="contacted">CONTACTED</option>
                            <option value="active">ACTIVE</option>
                          </select>
                        </td>

                        {/* Action View */}
                        <td className="px-5 py-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedReq(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-deep text-white text-xs font-semibold hover:bg-navy-deep/90 transition-all cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
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

      {/* Detail Modal showing ALL 11 collected fields */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-line flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-line flex items-start justify-between bg-slate-50/60 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-amber/10 text-amber border border-amber/20">
                  <Zap className="w-6 h-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-space-grotesk text-xl font-bold text-navy-deep">
                      {selectedReq.customerName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-700">
                      {selectedReq.customerType || "Residential"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-custom mt-0.5 font-ibm-plex-mono">
                    Inquiry submitted on{" "}
                    {new Date(selectedReq.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="p-2 text-slate-400 hover:text-navy-deep rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - All 11 Form Fields Detailed */}
            <div className="p-6 space-y-6">
              {/* Quick Actions (Call, WhatsApp, Email) */}
              <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-amber/5 border border-amber/20">
                <span className="text-xs font-semibold text-navy-deep font-ibm-plex-mono uppercase tracking-wider mr-1">
                  Direct Outreach:
                </span>
                <a
                  href={`tel:${selectedReq.contactNo}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </a>
                <a
                  href={`https://wa.me/${formatCleanPhone(selectedReq.contactNo)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba5a] transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={`mailto:${selectedReq.email}?subject=Regarding%20Your%20Solar%20Monitoring%20Request%20-%20EnergyGurus`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-deep text-white text-xs font-semibold hover:bg-navy-deep/90 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Email
                </a>
              </div>

              {/* Grid of All Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Customer Name */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    Customer Name & Type
                  </div>
                  <div className="font-bold text-navy-deep text-sm mt-1">
                    {selectedReq.customerName}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Type: <span className="font-semibold">{selectedReq.customerType || "Residential"}</span>
                  </div>
                </div>

                {/* 2. CNIC Number */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    CNIC Number
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-navy-deep text-sm">
                      {selectedReq.cnic}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedReq.cnic, "modal-cnic")}
                      className="text-xs text-slate-500 hover:text-navy-deep flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "modal-cnic" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    Contact Phone Number
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <a
                      href={`tel:${selectedReq.contactNo}`}
                      className="font-mono font-bold text-teal text-sm hover:underline"
                    >
                      {selectedReq.contactNo}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedReq.contactNo, "modal-phone")}
                      className="text-xs text-slate-500 hover:text-navy-deep flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "modal-phone" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                </div>

                {/* 4. Email Address */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    Email Address
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <a
                      href={`mailto:${selectedReq.email}`}
                      className="text-navy-deep font-semibold text-sm hover:underline truncate max-w-[200px]"
                    >
                      {selectedReq.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedReq.email, "modal-email")}
                      className="text-xs text-slate-500 hover:text-navy-deep flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "modal-email" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                </div>

                {/* 5. Complete Physical Address (Span 2) */}
                <div className="md:col-span-2 p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber" />
                      Site / Installation Physical Address
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedReq.address, "modal-address")}
                      className="text-xs text-slate-500 hover:text-navy-deep flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "modal-address" ? (
                        <Check className="w-3.5 h-3.5 text-teal" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy Address
                    </button>
                  </div>
                  <div className="text-sm font-medium text-navy-deep mt-1 leading-relaxed">
                    {selectedReq.address}
                  </div>
                </div>

                {/* 6. System Size */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    Solar System Size
                  </div>
                  <div className="font-space-grotesk font-bold text-teal text-base mt-1">
                    {SYSTEM_SIZE_LABELS[selectedReq.systemSize] || `${selectedReq.systemSize} kW`}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Raw code: {selectedReq.systemSize}
                  </div>
                </div>

                {/* 7. Package Chosen */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    Monitoring Package
                  </div>
                  <div className="font-bold text-navy-deep text-sm mt-1">
                    {PACKAGE_LABELS[selectedReq.package] || selectedReq.package}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Plan rate: {selectedReq.package}
                  </div>
                </div>

                {/* 8. System Type (Grid Tied / Hybrid) */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    System Architecture / Type
                  </div>
                  <div className="font-bold text-navy-deep text-sm mt-1">
                    {SYSTEM_TYPE_LABELS[selectedReq.monitoringHours] || selectedReq.monitoringHours}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Multiplier: {selectedReq.monitoringHours}
                  </div>
                </div>

                {/* 9. Advance Payment Plan */}
                <div className="p-3.5 rounded-xl border border-line bg-slate-50/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase font-ibm-plex-mono tracking-wider">
                    Advance Payment Schedule
                  </div>
                  <div className="font-bold text-navy-deep text-sm mt-1">
                    {PAYMENT_PLAN_LABELS[selectedReq.paymentPlan] || selectedReq.paymentPlan}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Discount factor: {selectedReq.paymentPlan}
                  </div>
                </div>

                {/* 10. Estimated Amount Payable (Span 2) */}
                <div className="md:col-span-2 p-4 rounded-xl border border-amber/30 bg-amber/5">
                  <div className="text-[11px] font-semibold text-amber uppercase font-ibm-plex-mono tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber" />
                    Estimated Amount Payable & Billing Breakdown
                  </div>
                  <div className="text-base font-bold text-navy-deep font-space-grotesk mt-1.5">
                    {selectedReq.amountPayable || "System 30 kW+ custom quote requested"}
                  </div>
                </div>
              </div>

              {/* Status Updater Section */}
              <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 font-ibm-plex-mono uppercase">
                    Status:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={updatingId === selectedReq.id}
                      onClick={() => handleStatusChange(selectedReq.id, "pending")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-ibm-plex-mono transition-all cursor-pointer ${
                        selectedReq.status === "pending"
                          ? "bg-amber text-ink shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      PENDING
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedReq.id}
                      onClick={() => handleStatusChange(selectedReq.id, "contacted")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-ibm-plex-mono transition-all cursor-pointer ${
                        selectedReq.status === "contacted"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      CONTACTED
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === selectedReq.id}
                      onClick={() => handleStatusChange(selectedReq.id, "active")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-ibm-plex-mono transition-all cursor-pointer ${
                        selectedReq.status === "active"
                          ? "bg-teal text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      ACTIVE
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

