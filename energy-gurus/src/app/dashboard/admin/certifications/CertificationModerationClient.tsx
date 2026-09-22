"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, FileText, AlertCircle, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { adminConfirmCertificationAction, rejectCertificationAction } from "@/lib/actions/certifications";
import { toast } from "sonner";
import { calculateInstallerTier } from "@/lib/utils/tier-calculator";

interface CertificationItem {
  id: string;
  installerId: string;
  brandId?: string | null;
  brandName: string;
  certifiedSince?: string | null;
  proofUrl?: string | null;
  brandRating?: string | null;
  brandStatus: string;
  brandApprovedAt?: Date | null;
  brandNotes?: string | null;
  adminStatus: string;
  adminApprovedAt?: Date | null;
  adminNotes?: string | null;
  status: string;
  createdAt: Date;
  installerName: string;
  installerCity?: string | null;
  installerTier?: string | null;
  installerLogo?: string | null;
}

export function CertificationModerationClient({
  certifications
}: {
  certifications: CertificationItem[];
}) {
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "rejected">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingList = certifications.filter(
    (c) => c.status === "pending_admin" || (c.brandStatus === "approved" && c.adminStatus === "pending")
  );
  const confirmedList = certifications.filter((c) => c.status === "live" || c.adminStatus === "approved");
  const rejectedList = certifications.filter((c) => c.status === "rejected" || c.adminStatus === "rejected" || c.brandStatus === "rejected");

  const currentList =
    activeTab === "pending"
      ? pendingList
      : activeTab === "confirmed"
      ? confirmedList
      : rejectedList;

  const handleConfirm = async (certId: string) => {
    setLoadingId(certId);
    try {
      const res = await adminConfirmCertificationAction(certId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || "Failed to confirm certification.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (certId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setLoadingId(certId);
    try {
      const res = await rejectCertificationAction(certId, rejectReason, false);
      if (res.success) {
        toast.success(res.message);
        setRejectingId(null);
        setRejectReason("");
      } else {
        toast.error(res.message || "Failed to reject certification.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-line mb-6 bg-white rounded-t-[4px] px-4 pt-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "pending"
              ? "border-amber text-navy-deep font-bold"
              : "border-transparent text-slate-custom hover:text-ink"
          }`}
        >
          Awaiting Final Approval
          {pendingList.length > 0 && (
            <span className="bg-amber text-navy-deep text-[11px] font-bold px-2 py-0.5 rounded-full">
              {pendingList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "confirmed"
              ? "border-amber text-navy-deep font-bold"
              : "border-transparent text-slate-custom hover:text-ink"
          }`}
        >
          Confirmed
          <span className="bg-cream border border-line text-ink text-[11px] px-2 py-0.5 rounded-full">
            {confirmedList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "rejected"
              ? "border-amber text-navy-deep font-bold"
              : "border-transparent text-slate-custom hover:text-ink"
          }`}
        >
          Rejected
          <span className="bg-cream border border-line text-ink text-[11px] px-2 py-0.5 rounded-full">
            {rejectedList.length}
          </span>
        </button>
      </div>

      {/* Queue Items */}
      {currentList.length === 0 ? (
        <div className="bg-white border border-line rounded-[4px] p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-good mx-auto mb-3" />
          <h3 className="font-fraunces text-lg font-bold text-navy-deep">No certifications in this queue</h3>
          <p className="text-xs text-slate-custom mt-1">
            {activeTab === "pending"
              ? "All brand certifications have been processed and confirmed."
              : "No items to display."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((cert) => {
            const isLoading = loadingId === cert.id;
            const isRejectOpen = rejectingId === cert.id;

            return (
              <div
                key={cert.id}
                className="bg-white border border-line rounded-[4px] p-6 shadow-sm hover:border-slate-300 transition-colors"
              >
                {/* Top: Installer Info & Brand Pill */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-line">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cream border border-line flex items-center justify-center font-bold text-xs text-navy-deep shrink-0">
                      {cert.installerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-navy-deep">{cert.installerName}</h3>
                      <div className="text-xs text-slate-custom mt-0.5">
                        {cert.installerCity || "Pakistan"} · Current Tier:{" "}
                        <span className="font-semibold text-ink capitalize">
                          {cert.installerTier || "Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-cream border border-line px-3 py-1.5 rounded-full text-xs font-bold text-navy-deep">
                    <div className="w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center">
                      {cert.brandName.slice(0, 1)}
                    </div>
                    {cert.brandName}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                  <div>
                    <span className="text-slate-custom block text-[11px]">Claimed Certified Since</span>
                    <span className="font-bold text-ink mt-0.5 block">{cert.certifiedSince || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-custom block text-[11px]">Brand Partner Status</span>
                    <span className="font-semibold text-good mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved by Brand
                      {cert.brandRating && ` (Rated ${cert.brandRating} ★)`}
                    </span>
                  </div>
                </div>

                {/* Brand Approval Note */}
                {cert.brandNotes && (
                  <div className="bg-good/10 border border-good/20 rounded-[3px] p-3 my-3 text-xs text-ink flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-good shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy-deep">Approved by {cert.brandName}:</strong>{" "}
                      <span>"{cert.brandNotes}"</span>
                    </div>
                  </div>
                )}

                {/* Proof Attachment */}
                {cert.proofUrl ? (
                  <div className="inline-flex items-center gap-2 bg-cream border border-line px-3 py-1.5 rounded-[3px] text-xs font-semibold text-navy-deep mb-4 hover:bg-slate-100 transition-colors">
                    <FileText className="w-3.5 h-3.5 text-amber-deep" />
                    <a href={cert.proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                      View Certificate / Proof Document
                      <ExternalLink className="w-3 h-3 text-slate-custom" />
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-slate-custom italic mb-4">No proof document attached by installer.</div>
                )}

                {/* Admin Action Buttons */}
                {activeTab === "pending" && (
                  <div className="pt-4 border-t border-line flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleConfirm(cert.id)}
                      disabled={isLoading}
                      className="bg-good hover:bg-good/90 text-white font-bold text-xs px-4 py-2 rounded-[3px] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Confirm &amp; Publish to Profile
                    </button>

                    <button
                      onClick={() => {
                        setRejectingId(isRejectOpen ? null : cert.id);
                        setRejectReason("");
                      }}
                      disabled={isLoading}
                      className="bg-transparent border border-line hover:border-danger hover:text-danger text-ink font-semibold text-xs px-4 py-2 rounded-[3px] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Collapsible Reject Drawer */}
                {isRejectOpen && (
                  <div className="mt-4 pt-4 border-t border-dashed border-line">
                    <label className="block text-xs font-bold text-navy-deep mb-1">
                      Reason for Rejection (sent to installer &amp; brand)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Certificate expired or verification document unreadable."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-danger focus:outline-none resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReject(cert.id)}
                        disabled={isLoading}
                        className="bg-danger hover:bg-danger/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-[3px] cursor-pointer"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="bg-transparent border border-line text-slate-custom font-semibold text-xs px-3 py-1.5 rounded-[3px] cursor-pointer hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
