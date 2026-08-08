"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface InstallerFiltersProps {
  totalCount: number;
}

export function InstallerFilters({ totalCount }: InstallerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentCert = searchParams.get("cert") || "All";
  const currentSpec = searchParams.get("spec") || "All";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white border-b border-line sticky top-[72px] z-40">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-[18px] flex flex-wrap gap-[20px] items-center">
        {/* Search Box */}
        <div className="flex items-center gap-2 border border-line rounded-[3px] px-[14px] py-[9px] bg-paper min-w-[220px] flex-1 sm:flex-initial">
          <span className="font-ibm-plex-mono text-[0.8rem] text-slate-custom">📍</span>
          <input
            type="text"
            placeholder="Enter ZIP or city..."
            defaultValue={currentQ}
            onChange={(e) => updateParam("q", e.target.value)}
            className="border-none bg-transparent font-sans text-[0.88rem] w-full outline-none text-graphite placeholder:text-slate-custom/60"
          />
        </div>

        {/* Certification Filter */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="cert" className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom whitespace-nowrap">
            Certification
          </label>
          <select
            id="cert"
            value={currentCert}
            onChange={(e) => updateParam("cert", e.target.value)}
            className="border border-line rounded-[3px] px-3 py-2 font-sans text-[0.88rem] bg-paper text-graphite focus:outline-none focus:border-amber cursor-pointer"
          >
            <option value="All">All</option>
            <option value="NABCEP">NABCEP</option>
            <option value="State-Licensed">State-Licensed</option>
            <option value="Manufacturer-Certified">Manufacturer-Certified</option>
          </select>
        </div>

        {/* Specialty Filter */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="spec" className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom whitespace-nowrap">
            Specialty
          </label>
          <select
            id="spec"
            value={currentSpec}
            onChange={(e) => updateParam("spec", e.target.value)}
            className="border border-line rounded-[3px] px-3 py-2 font-sans text-[0.88rem] bg-paper text-graphite focus:outline-none focus:border-amber cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Battery Storage">Battery Storage</option>
          </select>
        </div>

        {/* Result Count */}
        <span className="ml-auto font-ibm-plex-mono text-[0.82rem] text-slate-custom">
          {totalCount} {totalCount === 1 ? "installer" : "installers"} near you
        </span>
      </div>
    </div>
  );
}
