"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";

interface InstallerFiltersProps {
  totalCount: number;
  children: React.ReactNode;
}

export function InstallerFilters({ totalCount, children }: InstallerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentQ = searchParams.get("q") || "";
  const currentMinRating = searchParams.get("minRating") || "1";
  const currentMaxRating = searchParams.get("maxRating") || "5";
  const currentCerts = searchParams.get("certs")?.split(",") || [];

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleCert = (certName: string) => {
    const newCerts = currentCerts.includes(certName)
      ? currentCerts.filter((c) => c !== certName)
      : [...currentCerts, certName];
    updateParam("certs", newCerts.length > 0 ? newCerts.join(",") : null);
  };

  return (
    <section className="max-w-[1180px] mx-auto px-5 md:px-8 py-8 md:py-10">
      {/* Mobile filter bar */}
      <div className="lg:hidden mb-5 flex items-center justify-between bg-white p-3.5 border border-line rounded-[6px] shadow-xs">
        <span className="text-xs font-semibold text-ink">
          {totalCount} {totalCount === 1 ? "verified installer" : "verified installers"}
        </span>
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-slate-100 border border-line rounded-[4px] text-xs font-semibold text-ink transition-colors cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-amber" />
          <span>{mobileFilterOpen ? "Hide Filters" : "Filter Directory"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Filter Sidebar */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden lg:block"
          } bg-white border border-[#e5e5dc] rounded-[6px] p-5 shadow-xs space-y-6 lg:sticky lg:top-24`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber" /> Filters
            </h3>
            <button
              type="button"
              onClick={() => router.push(pathname)}
              className="text-[11px] font-semibold text-slate-custom hover:text-amber transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Nearby */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink block">Search Location or Name</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-custom absolute left-3 top-3" />
              <input
                type="text"
                placeholder="City (e.g. Lahore, Karachi) or company"
                defaultValue={currentQ}
                onBlur={(e) => updateParam("q", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateParam("q", e.currentTarget.value)}
                className="w-full pl-8 pr-3 py-2 bg-paper/30 border border-line rounded-[4px] text-xs text-ink placeholder:text-slate-custom focus:outline-none focus:border-amber focus:bg-white transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    () => updateParam("q", "Lahore"),
                    () => alert("Unable to retrieve location.")
                  );
                }
              }}
              className="w-full py-2 px-3 bg-paper hover:bg-slate-100 border border-line rounded-[4px] text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-amber" />
              <span>Use My Location</span>
            </button>
          </div>

          {/* Star Rating */}
          <div className="space-y-2 pt-2 border-t border-line">
            <label className="text-xs font-semibold text-ink block">Star Rating Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                defaultValue={currentMinRating}
                onBlur={(e) => updateParam("minRating", e.target.value)}
                className="w-20 px-2.5 py-1.5 bg-paper/30 border border-line rounded-[4px] text-xs text-ink font-semibold focus:outline-none focus:border-amber"
              />
              <span className="text-xs text-slate-custom">to</span>
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                defaultValue={currentMaxRating}
                onBlur={(e) => updateParam("maxRating", e.target.value)}
                className="w-20 px-2.5 py-1.5 bg-paper/30 border border-line rounded-[4px] text-xs text-ink font-semibold focus:outline-none focus:border-amber"
              />
              <span className="text-amber font-bold text-sm">★</span>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-2.5 pt-2 border-t border-line">
            <label className="text-xs font-semibold text-ink block">Certifications &amp; Licenses</label>
            <div className="space-y-1.5">
              {[
                "AEDB Licence",
                "PEC Licence",
                "Manufacturer Certified",
                "PSA - Energy Nexus Certified",
              ].map((cert) => {
                const isChecked = currentCerts.includes(cert);
                return (
                  <label
                    key={cert}
                    className={`flex items-center gap-2.5 p-2 rounded-[4px] text-xs cursor-pointer transition-colors ${
                      isChecked ? "bg-amber/10 text-ink font-semibold" : "hover:bg-paper/50 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCert(cert)}
                      className="rounded border-line text-amber focus:ring-amber"
                    />
                    <span className="truncate">{cert}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* List Content */}
        <div className="space-y-4">
          <div className="hidden lg:flex justify-between items-center pb-2">
            <p className="text-xs font-medium text-slate-custom">
              Showing <strong className="text-ink font-semibold">{totalCount}</strong> verified solar{" "}
              {totalCount === 1 ? "installer" : "installers"}
            </p>
          </div>

          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
