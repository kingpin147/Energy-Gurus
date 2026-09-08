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
    <section className="list-section">
        <div className="wrap panels-layout">
            <aside className="filter-sidebar">
                
                <div className="filter-block">
                    <div className="filter-title">Search Nearby</div>
                    <input
                        type="text"
                        placeholder="Enter your address or area"
                        defaultValue={currentQ}
                        onBlur={(e) => updateParam("q", e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateParam("q", e.currentTarget.value)}
                    />
                    <button type="button" className="btn-locate">
                        📍 Use My Location
                    </button>
                    <div className="locate-status"></div>
                </div>

                <div className="filter-block">
                    <div className="filter-title">Star Rating</div>
                    <div className="num-range-row">
                        <input 
                            type="number" 
                            min="1" max="5" step="0.1" 
                            defaultValue={currentMinRating}
                            onBlur={(e) => updateParam("minRating", e.target.value)}
                        />
                        <span className="to">to</span>
                        <input 
                            type="number" 
                            min="1" max="5" step="0.1" 
                            defaultValue={currentMaxRating}
                            onBlur={(e) => updateParam("maxRating", e.target.value)}
                        />
                        <span className="unit">★</span>
                    </div>
                </div>

                <div className="filter-block">
                    <div className="filter-title">Certifications</div>
                    
                    <div className="check-scroll">
                        {["AEDB Licence", "PEC Licence", "Manufacturer Certified", "PSA - Energy Nexus Certified"].map(cert => (
                            <label key={cert} className="check-row">
                                <input 
                                    type="checkbox" 
                                    checked={currentCerts.includes(cert)}
                                    onChange={() => toggleCert(cert)}
                                /> {cert}
                            </label>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => router.push(pathname)}
                    className="btn-clear"
                >
                    Clear All
                </button>
            </aside>

            <div>
                <div className="result-count" style={{ marginBottom: '16px' }}>
                    {totalCount} {totalCount === 1 ? "installer" : "installers"} near you
                </div>

                <div className="installer-list">
                    {children}
                </div>
            </div>
        </div>
    </section>
  );
}
