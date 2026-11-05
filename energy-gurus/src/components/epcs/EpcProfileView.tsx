"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/contact-form";
import { trackEngagement } from "@/components/shared/AnalyticsTracker";
import { FileText, ExternalLink, ShieldCheck, Award, CheckCircle2 } from "lucide-react";

// Known brand keywords to automatically separate equipment brands from regulatory licenses
const KNOWN_BRANDS = [
  "longi", "jinko", "ja", "trina", "canadian", "huawei", "growatt", "growwatt",
  "goodwe", "sungrow", "solis", "dyness", "foxess", "hystorix", "yinergy",
  "inverex", "tesla", "byd", "deye", "fronius", "sma", "solaredge", "chint",
  "tbea", "crown", "knox", "maxpower", "voltronic", "must", "felicity",
  "pylontech", "narada", "bsl", "ginlong", "sunsynk", "sofar", "invt", "astronergy", "risen"
];

function isLikelyEquipmentBrand(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const lower = name.toLowerCase().trim();
  if (KNOWN_BRANDS.some(b => lower.includes(b))) return true;
  if (/solar|panel|inverter|battery|pv|storage|module/i.test(lower)) return true;
  return false;
}

function normalizeBrandName(name: string): string {
  if (!name || typeof name !== "string") return "";
  const lower = name.toLowerCase().trim();
  if (lower.includes("longi")) return "LONGi Solar";
  if (lower.includes("canadian")) return "Canadian Solar";
  if (lower.includes("jinko")) return "JinkoSolar";
  if (lower === "ja" || lower.includes("ja solar")) return "JA Solar";
  if (lower.includes("trina")) return "Trina Solar";
  if (lower.includes("huawei")) return "Huawei";
  if (lower.includes("growatt") || lower.includes("growwatt")) return "Growatt";
  if (lower.includes("goodwe")) return "GoodWe";
  if (lower.includes("sungrow")) return "Sungrow";
  if (lower.includes("solis")) return "Solis";
  if (lower.includes("dyness")) return "Dyness";
  if (lower.includes("foxess") || lower.includes("fox-ess")) return "FoxESS";
  if (lower.includes("hystorix")) return "Hystorix";
  if (lower.includes("yinergy")) return "Yinergy";
  if (lower.includes("deye")) return "Deye";
  if (lower.includes("inverex")) return "Inverex";
  if (lower.includes("byd")) return "BYD";
  if (lower.includes("pylontech")) return "Pylontech";
  if (lower.includes("fronius")) return "Fronius";
  if (lower.includes("sma")) return "SMA";
  if (lower.includes("solaredge")) return "SolarEdge";
  if (lower.includes("tbea")) return "TBEA";
  if (lower.includes("chint")) return "Chint";
  return name.trim().replace(/\b\w/g, c => c.toUpperCase());
}

function getBrandCategory(brandName: string): string {
  const lower = brandName.toLowerCase();
  if (["longi", "canadian", "jinko", "ja", "trina", "astronergy", "risen", "panel"].some(k => lower.includes(k))) {
    return "Solar Panels";
  }
  if (["dyness", "pylontech", "byd", "narada", "bsl", "battery", "storage"].some(k => lower.includes(k))) {
    return "Energy Storage";
  }
  if (["foxess", "hystorix"].some(k => lower.includes(k))) {
    return "Storage & Inverters";
  }
  return "Inverters";
}

export function EpcProfileView({
  installer,
  offices,
  projects,
  rating,
  count,
  isActive,
  isPreview = false
}: any) {
  const [activeTab, setActiveTab] = useState("profile");

  const primaryCity = offices[0]?.city || installer.city || "Lahore";
  const yearsInBusiness = Math.max(1, new Date().getFullYear() - new Date(installer.createdAt).getFullYear());

  const brandsCertified = Array.isArray(installer.brandsCertified) ? installer.brandsCertified : [];
  const solarBrands = Array.isArray(installer.solarBrands) ? installer.solarBrands : [];
  const inverterBrands = Array.isArray(installer.inverterBrands) ? installer.inverterBrands : [];
  const batteryBrands = Array.isArray(installer.batteryBrands) ? installer.batteryBrands : [];
  const rawCertifications = Array.isArray(installer.certifications) ? installer.certifications : [];

  // Intelligently separate equipment brands from true regulatory licenses
  const brandsFromCertifications: string[] = [];
  const realCertifications: string[] = [];

  rawCertifications.forEach((item: string) => {
    if (isLikelyEquipmentBrand(item)) {
      brandsFromCertifications.push(item);
    } else {
      realCertifications.push(item);
    }
  });

  // Combine and normalize all authentic equipment brands
  const allRawEquipment = [
    ...brandsCertified,
    ...solarBrands,
    ...inverterBrands,
    ...batteryBrands,
    ...brandsFromCertifications
  ].filter(Boolean);

  const normalizedBrandsMap = new Map<string, { name: string; category: string; isOfficial: boolean }>();

  allRawEquipment.forEach((raw: string) => {
    const cleanName = normalizeBrandName(raw);
    if (!cleanName) return;
    const isOfficial = brandsCertified.some(
      (b: string) => normalizeBrandName(b).toLowerCase() === cleanName.toLowerCase()
    );
    const existing = normalizedBrandsMap.get(cleanName.toLowerCase());
    if (!existing) {
      normalizedBrandsMap.set(cleanName.toLowerCase(), {
        name: cleanName,
        category: getBrandCategory(cleanName),
        isOfficial
      });
    } else if (isOfficial) {
      existing.isOfficial = true;
    }
  });

  const allEquipmentBrands = Array.from(normalizedBrandsMap.values());

  const licenceDocuments = Array.isArray(installer.licenceDocuments) ? installer.licenceDocuments : [];
  const solarCertDocuments = Array.isArray(installer.solarCertDocuments) ? installer.solarCertDocuments : [];
  const inverterCertDocuments = Array.isArray(installer.inverterCertDocuments) ? installer.inverterCertDocuments : [];
  const batteryCertDocuments = Array.isArray(installer.batteryCertDocuments) ? installer.batteryCertDocuments : [];
  const allEquipmentDocs = [...solarCertDocuments, ...inverterCertDocuments, ...batteryCertDocuments];

  const team = (installer.team as { name: string; designation: string; linkedIn: string; imageUrl: string }[]) || [];
  const sectorsList = (installer.sectors as string[])?.length > 0
    ? (installer.sectors as string[])
    : ["Residential", "Commercial", "Industrial", "Agriculture"];

  const displayRating = rating && rating > 0 ? rating.toFixed(1) : "5.0";

  return (
    <div className="installer-profile-page bg-[#F7F4EC] min-h-screen">
      {isPreview && (
        <div className="bg-amber text-ink px-4 py-3 sticky top-0 z-50 border-b border-amber-600 shadow-md flex flex-wrap items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            <span className="bg-navy-deep text-white text-[11px] px-2.5 py-1 rounded font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber" /> Admin Preview Mode
            </span>
            <span>
              This profile is <strong>NOT LIVE</strong> to the public until approved (Status:{" "}
              <span className="uppercase font-bold text-navy-deep">{installer.status || "Pending"}</span>).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/admin/onboard-epc/${installer.id}`}
              className="px-3.5 py-1.5 bg-navy-deep hover:bg-ink text-white text-xs font-bold rounded shadow transition-all flex items-center gap-1.5"
            >
              <span>Review &amp; Approve in Dashboard &rarr;</span>
            </Link>
          </div>
        </div>
      )}

      <div className="sitebar bg-ink">
        <div className="wrap">
          <div className="crumbs">
            <Link href="/epcs">Find an Installer</Link> &nbsp;/&nbsp; {installer.companyName}
          </div>
        </div>
      </div>

      <header className="header bg-ink">
        <div className="wrap">
          <div className="header-top">
            <div className="avatar-lg bg-white p-2">
              {installer.logoUrl ? (
                <Image
                  src={installer.logoUrl}
                  alt={installer.companyName}
                  width={92}
                  height={92}
                  className="object-contain w-full h-full rounded-full"
                />
              ) : (
                installer.companyName.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="header-info">
              <div className="name-row">
                <h1 className="text-white">{installer.companyName}</h1>
                {installer.isVerified && (
                  <span className="tier-pill">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 12.5l5.5 5.5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {installer.tier ? installer.tier.charAt(0).toUpperCase() + installer.tier.slice(1) : "Verified"} Installer
                  </span>
                )}
              </div>
              <div className="loc-line">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {installer.address || `${primaryCity}, ${installer.country || "Pakistan"}`} · serving {primaryCity}
              </div>
              <div className="rating-row">
                <div className="rating-block">
                  <div>
                    <span className="num">{count > 0 ? displayRating : "New"}</span>
                    {count > 0 && <span className="stars">★★★★★</span>}
                  </div>
                  <div className="lbl">
                    {count > 0 ? `Customer rating · ${count} review${count !== 1 ? 's' : ''}` : "Customer rating · No reviews yet"}
                  </div>
                </div>
                {installer.egRating ? (
                  <>
                    <div className="rating-divider"></div>
                    <div className="rating-block">
                      <div>
                        <span className="num">{installer.egRating}</span>
                        <span style={{ color: "#9FADB8", fontSize: "13px" }}>/10</span>
                      </div>
                      <div className="lbl">EnergyGurus team rating</div>
                    </div>
                  </>
                ) : null}
                {installer.tier ? (
                  <>
                    <div className="rating-divider"></div>
                    <div className="rating-block">
                      <div>
                        <span className="num capitalize text-amber-deep">★ {installer.tier}</span>
                      </div>
                      <div className="lbl">Verification Tier</div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className="header-actions">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="btn btn-amber w-full"
                    onClick={() => trackEngagement("epc_contact_click", { epcId: installer.id, companyName: installer.companyName })}
                  >
                    Request a Quote
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[4px] p-0 overflow-hidden border border-line text-ink bg-white">
                  <div className="bg-navy-deep p-6 text-white">
                    <h3 className="text-xl font-bold font-fraunces">Contact {installer.companyName}</h3>
                    <p className="text-paper/70 text-xs mt-1">Send a direct inquiry for your solar installation project.</p>
                  </div>
                  <div className="p-6 bg-white">
                    <ContactForm receiverId={installer.userId} receiverName={installer.companyName} />
                  </div>
                </DialogContent>
              </Dialog>
              {installer.whatsapp && (
                <a
                  href={`https://wa.me/${installer.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20would%20like%20a%20quote`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline text-center"
                >
                  Message on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
        <nav className="tabbar bg-ink">
          <div className="wrap">
            <button className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
            <button className={`tab ${activeTab === "team" ? "active" : ""}`} onClick={() => setActiveTab("team")}>Team</button>
            <button className={`tab ${activeTab === "offices" ? "active" : ""}`} onClick={() => setActiveTab("offices")}>Offices &amp; Outlets</button>
            <button className={`tab ${activeTab === "certifications" ? "active" : ""}`} onClick={() => setActiveTab("certifications")}>
              Certifications &amp; Brands
            </button>
            <button className={`tab ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>Projects ({projects?.length || 0})</button>
            <button className={`tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews ({count || 0})</button>
          </div>
        </nav>
      </header>

      <main className="main">
        <div className="wrap">

          {/* PROFILE */}
          <section className={`panel ${activeTab === "profile" ? "active" : ""}`} id="profile">
            <div className="grid-2">
              <div className="card">
                <h2>About the Company</h2>
                <p>{installer.about || "Verified solar EPC installer providing high-efficiency renewable energy systems in Pakistan."}</p>
                <div className="spec-row">
                  <span className="spec-label">Years in Business</span>
                  <span className="spec-val">{installer.yearsInBusiness || yearsInBusiness} {installer.yearsInBusiness === 1 ? 'year' : 'years'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Head Office</span>
                  <span className="spec-val">{primaryCity}, Pakistan</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Registered Sectors</span>
                  <span className="spec-val">{sectorsList.join(", ")}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Completed Projects</span>
                  <span className="spec-val">{projects?.length || 0} registered</span>
                </div>
              </div>
              <div>
                <div className="card">
                  <h2>Sectors Served</h2>
                  <div className="chip-row">
                    {sectorsList.map((sector: string, i: number) => (
                      <span key={i} className="chip">{sector}</span>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ marginTop: "20px" }}>
                  <h2>Contact &amp; Connect</h2>
                  {installer.contactNo && (
                    <div className="contact-line">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M4 5h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2C10 21 3 14 3 7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" /></svg>
                      {installer.contactNo}
                    </div>
                  )}
                  {installer.email && (
                    <div className="contact-line">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" /><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" /></svg>
                      <a href={`mailto:${installer.email}`}>{installer.email}</a>
                    </div>
                  )}
                  {installer.website && (
                    <div className="contact-line">
                      <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="1.5" /></svg>
                      <a href={installer.website.startsWith("http") ? installer.website : `https://${installer.website}`} target="_blank" rel="noopener noreferrer">Visit Website ↗</a>
                    </div>
                  )}
                  {installer.socialLinks && Array.isArray(installer.socialLinks) && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                      {installer.socialLinks.map((link: any, i: number) => {
                        if (link.platform.toLowerCase() === "facebook") {
                          return (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy-deep)" }}>
                              <svg viewBox="0 0 24 24" fill="none" style={{ width: "14px", height: "14px" }}><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </a>
                          );
                        }
                        if (link.platform.toLowerCase() === "instagram") {
                          return (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy-deep)" }}>
                              <svg viewBox="0 0 24 24" fill="none" style={{ width: "14px", height: "14px" }}><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
                            </a>
                          );
                        }
                        if (link.platform.toLowerCase() === "linkedin") {
                          return (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy-deep)" }}>
                              <svg viewBox="0 0 24 24" fill="none" style={{ width: "14px", height: "14px" }}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 10v6M8 7.5v.01M12 16v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section className={`panel ${activeTab === "team" ? "active" : ""}`} id="team">
            <div className="section-head" style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: "600" }}>Team</h2>
              <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", marginTop: "4px" }}>The people customers are likely to meet on-site or deal with directly.</p>
            </div>
            <div className="team-grid-people">
              {team.length > 0 ? (
                team.map((member: any, i: number) => (
                  <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="avatar-lg bg-cream" style={{ width: "56px", height: "56px", fontSize: "18px" }}>
                      {member.imageUrl ? <Image src={member.imageUrl} width={56} height={56} className="object-cover w-full h-full rounded-full" alt={member.name} /> : member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--navy-deep)" }}>{member.name}</span>
                        {member.linkedIn && (
                          <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" style={{ color: "var(--navy-deep)", opacity: .6 }}>
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: "14px", height: "14px" }}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 10v6M8 7.5v.01M12 16v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                          </a>
                        )}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--ink-soft)", marginTop: "2px" }}>{member.designation}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-custom text-sm">Team information not provided.</p>
              )}
            </div>
          </section>

          {/* OFFICES & OUTLETS */}
          <section className={`panel ${activeTab === "offices" ? "active" : ""}`} id="offices">
            <div className="section-head" style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: "600" }}>Offices &amp; Outlets</h2>
              <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", marginTop: "4px" }}>Every location this installer operates from, and the areas each one serves.</p>
            </div>
            <div className="office-grid">
              {offices.length > 0 ? (
                offices.map((office: any, i: number) => (
                  <div key={i} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Head Office - {office.city}</h3>
                      {office.coordinates && (
                        <a href={`https://maps.google.com/?q=${office.coordinates}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--amber-deep)", textDecoration: "none" }}>View on map</a>
                      )}
                    </div>
                    <div className="contact-line">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.5" /></svg>
                      {office.address || `${office.area || ''}, ${office.city}, ${office.country || 'Pakistan'}`}
                    </div>
                    {office.phone && (
                      <div className="contact-line">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M4 5h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2C10 21 3 14 3 7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" /></svg>
                        {office.phone}
                      </div>
                    )}
                    <div className="chip-row" style={{ marginTop: "12px" }}>
                      <span className="chip">{office.city}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Head Office - {primaryCity}</h3>
                  </div>
                  <div className="contact-line">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.5" /></svg>
                    {installer.address || primaryCity}
                  </div>
                  <div className="chip-row" style={{ marginTop: "12px" }}>
                    <span className="chip">{primaryCity}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* CERTIFICATIONS & BRANDS */}
          <section className={`panel ${activeTab === "certifications" ? "active" : ""}`} id="certifications">
            <div className="grid-2">
              {/* Left Card: Equipment & Brands Portfolio */}
              <div className="card">
                <h2>Equipment &amp; Brands Portfolio</h2>
                <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "16px" }}>
                  Equipment and solar brands supplied, installed, and supported by {installer.companyName}.
                </p>

                {allEquipmentBrands.length > 0 ? (
                  <div className="space-y-3">
                    {allEquipmentBrands.map((brand, i) => (
                      <div key={i} className="cert-brand-row">
                        <div className="cert-brand-main">
                          <div
                            className="cert-brand-mark"
                            style={{
                              background: ["Growatt", "Huawei", "LONGi", "Jinko", "Solis"].some(k => brand.name.toLowerCase().includes(k.toLowerCase()))
                                ? "var(--navy)"
                                : "#1F2937",
                            }}
                          >
                            {brand.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="cert-brand-name">{brand.name}</div>
                            <div className="cert-brand-since">{brand.category}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className={`tier-badge ${brand.isOfficial ? "tier-gold" : "tier-silver"}`}>
                            {brand.isOfficial ? "Official Partner" : "Authorized"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-custom text-sm">No equipment brands listed yet.</p>
                )}

                {/* Uploaded Brand Certification Documents */}
                {allEquipmentDocs.length > 0 && (
                  <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--navy-deep)", marginBottom: "10px" }}>
                      OEM Authorization Letters &amp; Certificates ({allEquipmentDocs.length})
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {allEquipmentDocs.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-slate-100 border border-line rounded-[4px] text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber" />
                          <span>Certificate {idx + 1}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Card: Regulatory Licences */}
              <div className="card">
                <h2>Regulatory Licences &amp; Compliance</h2>
                <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "16px" }}>
                  Verified government registrations, statutory engineering licenses, and regulatory compliance.
                </p>

                {/* PEC Licence */}
                <div className="licence-row">
                  <div>
                    <div className="licence-name">Pakistan Engineering Council (PEC)</div>
                    <div className="licence-num">
                      {installer.regNumber ? `Registration #${installer.regNumber}` : "Professional Engineering License"}
                    </div>
                  </div>
                  <span className="verified-check">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>{" "}
                    {installer.isVerified ? "Verified" : "On File"}
                  </span>
                </div>

                {/* AEDB Accreditation */}
                <div className="licence-row">
                  <div>
                    <div className="licence-name">AEDB Solar Installer Certification</div>
                    <div className="licence-num">Alternative Energy Development Board (AEDB)</div>
                  </div>
                  <span className="verified-check">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>{" "}
                    {installer.isVerified ? "V1 / Certified" : "Registered"}
                  </span>
                </div>

                {/* Any real non-brand statutory certifications (e.g. ISO, SECP) */}
                {realCertifications.map((cert: string, i: number) => (
                  <div key={i} className="licence-row">
                    <div>
                      <div className="licence-name">{cert}</div>
                      <div className="licence-num">Regulatory Certification</div>
                    </div>
                    <span className="verified-check">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>{" "}
                      Verified
                    </span>
                  </div>
                ))}

                {/* Uploaded Company Licence & Legal Documents */}
                {licenceDocuments.length > 0 && (
                  <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--navy-deep)", marginBottom: "10px" }}>
                      Verified Company Legal Documents ({licenceDocuments.length})
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {licenceDocuments.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-blue-50 border border-line rounded-[4px] text-xs font-semibold text-blue-600 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Legal Document {idx + 1}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card: Verification Status */}
              <div className="card" style={{ marginTop: "20px" }}>
                <h2>Trust &amp; Verification Status</h2>
                <div className="licence-row">
                  <div className="licence-name">Customer Reviews</div>
                  <span style={{ color: "var(--amber-deep)", fontWeight: "600", fontSize: "14px" }}>
                    {count > 0 ? `${displayRating} ★ (${count} reviews)` : "No customer reviews yet"}
                  </span>
                </div>
                {installer.egRating ? (
                  <div className="licence-row">
                    <div className="licence-name">EnergyGurus Team Assessment</div>
                    <span style={{ color: "var(--amber-deep)", fontWeight: "600", fontSize: "14px" }}>
                      {installer.egRating} / 10
                    </span>
                  </div>
                ) : null}
                <div className="licence-row">
                  <div className="licence-name">Platform Tier</div>
                  <span style={{ color: "var(--amber-deep)", fontWeight: "600", fontSize: "14px", textTransform: "capitalize" }}>
                    ★ {installer.tier || "Bronze"} Tier
                  </span>
                </div>
                <div className="licence-row">
                  <div className="licence-name">Years in Business</div>
                  <span style={{ color: "var(--navy-deep)", fontWeight: "600", fontSize: "14px" }}>
                    {installer.yearsInBusiness || yearsInBusiness} Years
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECTS */}
          <section className={`panel ${activeTab === "projects" ? "active" : ""}`} id="projects">
            <div className="project-grid">
              {projects && projects.length > 0 ? (
                projects.map((project: any, i: number) => (
                  <div key={i} className="project-card">
                    <div className="project-media">
                      {project.images && project.images[0] && (
                        <Image src={project.images[0]} alt={project.name} fill className="object-cover" />
                      )}
                      <span className="project-size-tag">{project.systemSize || "10 kW"} · {project.segmentType?.[0] || "Residential"}</span>
                    </div>
                    <div className="project-body">
                      <h4>{project.name}</h4>
                      <div className="project-meta">{project.installationDate ? new Date(project.installationDate).toISOString().split('T')[0] : ""} · {project.city || primaryCity}</div>
                      <p>{project.description || `${project.systemType || "Hybrid"} system installed.`}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <p className="text-slate-custom text-sm">No projects listed yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* REVIEWS */}
          <section className={`panel ${activeTab === "reviews" ? "active" : ""}`} id="reviews">
            <div className="grid-2">
              <div>
                <div className="card">
                  <h2>Customer Reviews</h2>
                  <div className="review-summary">
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: "34px", fontWeight: "600", color: "var(--navy-deep)", lineHeight: "1" }}>
                        {count > 0 ? displayRating : "—"}
                      </div>
                      {count > 0 && <div style={{ color: "var(--amber-deep)", fontSize: "14px", marginTop: "4px" }}>★★★★★</div>}
                      <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>
                        {count > 0 ? `${count} review${count !== 1 ? 's' : ''}` : "No reviews yet"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {count > 0 ? (
                      <p className="text-slate-custom text-sm">Customer feedback submitted on EnergyGurus platform.</p>
                    ) : (
                      <p className="text-slate-custom text-sm">No customer reviews yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
