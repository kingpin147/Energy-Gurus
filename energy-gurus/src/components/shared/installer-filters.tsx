"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface InstallerFiltersProps {
  totalCount: number;
  children: React.ReactNode;
}

export function InstallerFilters({ totalCount, children }: InstallerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentMinRating = searchParams.get("minRating") || "1";
  const currentMaxRating = searchParams.get("maxRating") || "5";

  // Handle cert checkboxes (we'll just use a single 'certs' param with comma-separated values)
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
        ? currentCerts.filter(c => c !== certName)
        : [...currentCerts, certName];
    updateParam("certs", newCerts.length > 0 ? newCerts.join(",") : null);
  };

  return (
    <section className="py-[48px] pb-[96px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-9 items-start">
                
                <aside className="bg-white border border-line rounded-[6px] p-6 sticky top-[88px]">
                    
                    <div className="mb-6 pb-5 border-b border-line">
                        <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-ink font-semibold mb-3">Search Nearby</div>
                        <input
                            type="text"
                            placeholder="Enter your address or area"
                            defaultValue={currentQ}
                            onBlur={(e) => updateParam("q", e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateParam("q", e.currentTarget.value)}
                            className="w-full border border-line rounded-[3px] px-3 py-2 text-[0.88rem] mb-3 text-graphite placeholder:text-slate-custom/60"
                        />
                        <button type="button" className="w-full bg-[rgba(232,163,61,0.1)] text-amber border border-amber/30 rounded-[3px] py-2 text-[0.84rem] font-semibold hover:bg-[rgba(232,163,61,0.2)] transition-colors">
                            📍 Use My Location
                        </button>
                    </div>

                    <div className="mb-6 pb-5 border-b border-line">
                        <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-ink font-semibold mb-3">Star Rating</div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                min="1" max="5" step="0.1" 
                                value={currentMinRating}
                                onChange={(e) => updateParam("minRating", e.target.value)}
                                className="w-[64px] border border-line rounded-[3px] p-2 font-ibm-plex-mono text-[0.82rem] text-ink"
                            />
                            <span className="text-[0.8rem] text-slate-custom">to</span>
                            <input 
                                type="number" 
                                min="1" max="5" step="0.1" 
                                value={currentMaxRating}
                                onChange={(e) => updateParam("maxRating", e.target.value)}
                                className="w-[64px] border border-line rounded-[3px] p-2 font-ibm-plex-mono text-[0.82rem] text-ink"
                            />
                            <span className="text-[0.78rem] text-slate-custom">★</span>
                        </div>
                    </div>

                    <div className="mb-6 pb-5 border-b border-line">
                        <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-ink font-semibold mb-3">Certifications</div>
                        
                        {["AEDB Licence", "PEC Licence", "Manufacturer Certified", "PSA - Energy Nexus Certified"].map(cert => (
                            <label key={cert} className="flex items-center gap-2 text-[0.88rem] text-slate-custom py-1 cursor-pointer hover:text-ink">
                                <input 
                                    type="checkbox" 
                                    className="accent-teal w-[15px] h-[15px]" 
                                    checked={currentCerts.includes(cert)}
                                    onChange={() => toggleCert(cert)}
                                /> {cert}
                            </label>
                        ))}
                    </div>

                    <button 
                        onClick={() => router.push(pathname)}
                        className="w-full bg-transparent text-slate-custom p-2.5 rounded-[3px] text-[0.84rem] border border-line hover:border-ink hover:text-ink transition-colors"
                    >
                        Clear All
                    </button>
                </aside>

                <div className="panels-main">
                    <div className="flex justify-between items-center mb-5">
                        <span className="font-ibm-plex-mono text-[0.82rem] text-slate-custom">
                            {totalCount} {totalCount === 1 ? "installer" : "installers"} near you
                        </span>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    </section>
  );
}
