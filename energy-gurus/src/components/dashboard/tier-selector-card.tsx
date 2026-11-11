"use client";

import React from "react";
import { Check, ShieldCheck, Sparkles, Award, Star, Info, CheckCircle2 } from "lucide-react";
import { calculateInstallerTier, InstallerTier } from "@/lib/utils/tier-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TierInfo {
  tier: InstallerTier;
  title: string;
  minCerts: number;
  maxCerts?: number;
  certRange: string;
  requirements: string[];
}

export const TIERS_CONFIG: TierInfo[] = [
  {
    tier: "silver",
    title: "Silver",
    minCerts: 1,
    maxCerts: 2,
    certRange: "1–2 brand certifications",
    requirements: [
      "Independent site visit audit",
      "Site photos and customer testimonials",
      "1–2 brand certifications"
    ]
  },
  {
    tier: "gold",
    title: "Gold",
    minCerts: 3,
    maxCerts: 4,
    certRange: "3–4 brand certifications",
    requirements: [
      "All of Silver's requirements",
      "3–4 brand certifications"
    ]
  },
  {
    tier: "diamond",
    title: "Diamond",
    minCerts: 5,
    maxCerts: 6,
    certRange: "5–6 brand certifications",
    requirements: [
      "All of Gold's requirements",
      "5–6 brand certifications"
    ]
  },
  {
    tier: "platinum",
    title: "Platinum",
    minCerts: 7,
    certRange: "7–8+ brand certifications",
    requirements: [
      "All of Diamond's requirements",
      "7–8 brand certifications"
    ]
  }
];

interface TierSelectorCardProps {
  currentTier: string;
  onTierChange: (tier: string) => void;
  confirmedCertsCount?: number;
  confirmedBrandNames?: string[];
  pendingBrandNames?: string[];
  rejectedBrandNames?: string[];
  compact?: boolean;
}

export function TierSelectorCard({
  currentTier,
  onTierChange,
  confirmedCertsCount = 0,
  confirmedBrandNames = [],
  pendingBrandNames = [],
  rejectedBrandNames = [],
  compact = false
}: TierSelectorCardProps) {
  const normalizedTier = (currentTier || "bronze").toLowerCase();

  // Calculate recommended tier
  const recommended = calculateInstallerTier(confirmedCertsCount, true);

  // Build descriptive summary matching Image 4
  const buildTierExplanation = () => {
    const certsStr = confirmedBrandNames.length > 0
      ? ` (${confirmedBrandNames.join(", ")})`
      : "";

    let message = `Current tier: ${normalizedTier.charAt(0).toUpperCase() + normalizedTier.slice(1)} — based on ${confirmedCertsCount} confirmed certification${confirmedCertsCount === 1 ? "" : "s"}${certsStr}.`;

    if (pendingBrandNames.length > 0) {
      message += ` ${pendingBrandNames.join(", ")} is pending EnergyGurus' final approval.`;
    }

    if (rejectedBrandNames.length > 0) {
      message += ` ${rejectedBrandNames.join(", ")} was rejected.`;
    }

    if (recommended.nextTier) {
      message += ` Need ${recommended.nextTier.certsNeeded} more confirmed certification${recommended.nextTier.certsNeeded === 1 ? "" : "s"} to reach ${recommended.nextTier.name}.`;
    }

    return message;
  };

  const handleAutoApplyRecommended = () => {
    onTierChange(recommended.tier);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. Current Tier Banner (Matching Image 4) ──────────────── */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed text-emerald-950">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">
            <strong className="font-bold text-emerald-900">
              Current tier: {normalizedTier.charAt(0).toUpperCase() + normalizedTier.slice(1)}
            </strong>{" "}
            — {buildTierExplanation().replace(/^Current tier: [^—]+— /, "")}
          </p>

          {/* Quick link button to auto apply */}
          {normalizedTier !== recommended.tier && (
            <div className="mt-2.5 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAutoApplyRecommended}
                className="h-7 text-[11px] font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-set to {recommended.label}
              </Button>
              <span className="text-[10px] text-emerald-800">
                (Recommended based on {confirmedCertsCount} verified brand certifications)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. The 4 Tier Cards (Silver, Gold, Diamond, Platinum) ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TIERS_CONFIG.map((t) => {
          const isSelected = normalizedTier === t.tier;

          return (
            <div
              key={t.tier}
              onClick={() => onTierChange(t.tier)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "border-amber bg-amber/5 shadow-sm ring-1 ring-amber/50"
                  : "border-line bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-ink">{t.title}</h4>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-amber text-ink flex items-center justify-center text-xs font-black shadow-xs">
                      ✓
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>

                <ul className="space-y-2 text-xs text-slate-custom">
                  {t.requirements.map((req, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-line/60">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isSelected ? "text-amber font-extrabold" : "text-slate-400"
                }`}>
                  {t.certRange}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unverified / Bronze Base Option */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-custom font-semibold">Other Tier Statuses:</span>
          <button
            type="button"
            onClick={() => onTierChange("bronze")}
            className={`px-3 py-1 rounded-xl font-bold border transition-colors ${
              normalizedTier === "bronze"
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-slate-100 text-slate-700 border-line hover:bg-slate-200"
            }`}
          >
            Bronze (Entry Level)
          </button>
          <button
            type="button"
            onClick={() => onTierChange("unverified")}
            className={`px-3 py-1 rounded-xl font-bold border transition-colors ${
              normalizedTier === "unverified"
                ? "bg-rose-100 text-rose-900 border-rose-300"
                : "bg-slate-100 text-slate-700 border-line hover:bg-slate-200"
            }`}
          >
            Unverified (Pending Audit)
          </button>
        </div>

        <div className="text-[11px] text-slate-custom">
          Brand certifications directly govern tier level: 1–2 = Silver, 3–4 = Gold, 5–6 = Diamond, 7+ = Platinum
        </div>
      </div>
    </div>
  );
}
