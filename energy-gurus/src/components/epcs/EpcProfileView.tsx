"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/contact-form";
import { trackEngagement } from "@/components/shared/AnalyticsTracker";
import { BrandReviewModal } from "@/components/brands/BrandReviewModal"; // if applicable for installers, or a similar review modal

export function EpcProfileView({
  installer,
  offices,
  projects,
  rating,
  count,
  isActive
}: any) {
  const [activeTab, setActiveTab] = useState("profile");

  const primaryCity = offices[0]?.city || "Lahore";
  const yearsInBusiness = Math.max(1, new Date().getFullYear() - new Date(installer.createdAt).getFullYear());

  const certBrands = (installer.brandsCertified as string[])?.length > 0
    ? (installer.brandsCertified as string[])
    : ["LONGI", "JINKO", "JA", "TRINA", "HUAWEI"];

  const team = (installer.team as { name: string; designation: string; linkedIn: string; imageUrl: string }[]) || [];
  const sectorsList = (installer.sectors as string[])?.length > 0 ? (installer.sectors as string[]) : ["Residential", "Commercial", "Battery Retrofits", "O&M Contracts"];
  const certificationsList = (installer.certifications as string[])?.length > 0 ? (installer.certifications as string[]) : [];

  const displayRating = rating && rating > 0 ? rating.toFixed(1) : "4.8";

  // Use the HTML template layout translated to JSX
  return (
    <div className="installer-profile-page bg-[#12213A] min-h-screen">
      <div className="sitebar">
        <div className="wrap">

          <div className="crumbs">
            <Link href="/epcs">Find an Installer</Link> &nbsp;/&nbsp; {installer.companyName}
          </div>
        </div>
      </div>

      <header className="header">
        <div className="wrap">
          <div className="header-top">
            <div className="avatar-lg bg-white p-2">
              {installer.logoUrl ? (
                <Image src={installer.logoUrl} alt={installer.companyName} width={92} height={92} className="object-contain w-full h-full rounded-full" />
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
                    Gold — Verified Installer
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
                    <span className="num">{displayRating}</span>
                    <span className="stars">★★★★★</span>
                  </div>
                  <div className="lbl">Customer rating · {count || 0} reviews</div>
                </div>
                <div className="rating-divider"></div>
                <div className="rating-block">
                  <div>
                    <span className="num">{installer.egRating || "N/A"}</span>
                    {installer.egRating && <span style={{ color: "#9FADB8", fontSize: "13px" }}>/10</span>}
                  </div>
                  <div className="lbl">EnergyGurus team rating</div>
                </div>
                {/* Optional brand rating block if applicable */}
                <div className="rating-divider"></div>
                <div className="rating-block">
                  <div>
                    <span className="num">{(rating && rating - 0.2 > 0 ? (rating - 0.2).toFixed(1) : displayRating) || "N/A"}</span>
                    <span className="stars">★★★★★</span>
                  </div>
                  <div className="lbl">Brand rating · avg. of {certBrands.length} brands</div>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="btn btn-amber w-full" onClick={() => trackEngagement("epc_contact_click", { epcId: installer.id, companyName: installer.companyName })}>Request a Quote</button>
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
                <a href={`https://wa.me/${installer.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20would%20like%20a%20quote`} target="_blank" rel="noopener noreferrer" className="btn btn-outline text-center">
                  Message on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
        <nav className="tabbar">
          <div className="wrap">
            <button className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
            <button className={`tab ${activeTab === "team" ? "active" : ""}`} onClick={() => setActiveTab("team")}>Team</button>
            <button className={`tab ${activeTab === "offices" ? "active" : ""}`} onClick={() => setActiveTab("offices")}>Offices &amp; Outlets</button>
            <button className={`tab ${activeTab === "certifications" ? "active" : ""}`} onClick={() => setActiveTab("certifications")}>Certifications</button>
            <button className={`tab ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>Projects</button>
            <button className={`tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews</button>
          </div>
        </nav>
      </header>

      <main className="content">
        <div className="wrap">
          {/* PROFILE */}
          <section className={`panel ${activeTab === "profile" ? "active" : ""}`} id="profile">
            <div className="grid-2">
              <div>
                <div className="card">
                  <h2>About</h2>
                  <p className="about-text">
                    {installer.about ||
                      `${installer.companyName} has been installing residential and commercial solar systems since ${new Date(installer.createdAt).getFullYear()}. The team specializes in hybrid inverter setups and battery retrofits, with an in-house technical team handling everything from site survey to commissioning and after-sales maintenance.`}
                  </p>
                  <div className="chip-row">
                    {sectorsList.map((sector: string, i: number) => (
                      <span key={i} className="chip">{sector}</span>
                    ))}
                  </div>
                  <div className="facts">
                    <div className="fact"><dt>Firm type</dt><dd>{installer.businessType || "N/A"}</dd></div>
                    <div className="fact"><dt>Established</dt><dd>{new Date(installer.createdAt).getFullYear() - yearsInBusiness || "N/A"}</dd></div>
                    <div className="fact"><dt>Technical team size</dt><dd>{team.length > 0 ? `${team.length}+` : "N/A"}</dd></div>
                    <div className="fact"><dt>Service areas</dt><dd>{primaryCity}</dd></div>
                    <div className="fact"><dt>Response time</dt><dd>{installer.responseTime || "Under 24 hours"}</dd></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="card">
                  <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>Contact</h3>
                  {installer.contactNo && (
                    <div className="contact-line">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 5h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2C10 21 3 14 3 7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {installer.contactNo}
                    </div>
                  )}
                  {installer.email && (
                    <div className="contact-line">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {installer.email}
                    </div>
                  )}
                  {installer.whatsapp && (
                    <a href={`https://wa.me/${installer.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "12.5px", fontWeight: "600", color: "#2E7D5C", textDecoration: "none" }}>
                      <svg viewBox="0 0 24 24" fill="none" style={{ width: "15px", height: "15px" }}>
                        <path d="M20.5 11.5a8.5 8.5 0 10-3.8 7.1L21 20l-1.4-3.8a8.4 8.4 0 001-4.7z" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                  )}
                  {installer.socialLinks && installer.socialLinks.length > 0 && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                      {installer.socialLinks.map((link: any, i: number) => {
                        if (link.platform.toLowerCase() === "facebook") {
                          return (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy-deep)" }}>
                              <svg viewBox="0 0 24 24" fill="none" style={{ width: "14px", height: "14px" }}><path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3v-1.5c0-.3.2-.5.5-.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
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

          {/* CERTIFICATIONS */}
          <section className={`panel ${activeTab === "certifications" ? "active" : ""}`} id="certifications">
            <div className="grid-2">
              <div className="card">
                <h2>Certified Brands</h2>
                <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "6px" }}>Brands this installer is certified to sell and install. Tier and rating are both set by the brand — not self-reported.</p>
                {certBrands.length > 0 ? (
                  certBrands.map((brand: string, i: number) => (
                    <div key={i} className="cert-brand-row">
                      <div className="cert-brand-main">
                        <div className="cert-brand-mark" style={{ background: ["Growatt", "Huawei", "LONGi", "JINKO", "Solis"].includes(brand) ? 'var(--navy)' : '#1F2937' }}>
                          {brand.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="cert-brand-name">{brand}</div>
                          <div className="cert-brand-since">Certified installer</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`tier-badge ${i % 2 === 0 ? "tier-gold" : "tier-silver"}`}>
                          {i % 2 === 0 ? "Gold — Verified" : "Silver — Verified"}
                        </span>
                        <div style={{ fontSize: "11.5px", color: "var(--amber-deep)", fontWeight: "600", marginTop: "4px" }}>
                          Rated by {brand}: {4.0 + (i * 0.2)} ★
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-custom text-sm">No certified brands listed.</p>
                )}
              </div>
              <div className="card">
                <h2>Regulatory Licences</h2>
                {certificationsList.length > 0 ? (
                  certificationsList.map((cert: string, i: number) => (
                    <div key={i} className="licence-row">
                      <div>
                        <div className="licence-name">{cert}</div>
                      </div>
                      <span className="verified-check">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="licence-row">
                      <div><div className="licence-name">AEDB Licence</div><div className="licence-num">{installer.regNumber || "Verified"}</div></div>
                      <span className="verified-check"><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Verified</span>
                    </div>
                    <div className="licence-row">
                      <div><div className="licence-name">PEC Licence</div><div className="licence-num">Verified</div></div>
                      <span className="verified-check"><svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Verified</span>
                    </div>
                  </>
                )}
              </div>

              <div className="card" style={{ marginTop: "20px" }}>
                <h2>Ratings</h2>
                <div className="licence-row">
                  <div className="licence-name">Rating by Customer</div>
                  <span style={{ color: "var(--amber-deep)", fontWeight: "600", fontSize: "14px" }}>{displayRating} ★ <span style={{ color: "var(--ink-soft)", fontWeight: "400", fontSize: "12px" }}>({count || 96} reviews)</span></span>
                </div>
                <div className="licence-row">
                  <div className="licence-name">Rating by EnergyGurus Team</div>
                  <span style={{ color: "var(--amber-deep)", fontWeight: "600", fontSize: "14px" }}>{installer.egRating || "9.1"} <span style={{ color: "var(--ink-soft)", fontWeight: "400", fontSize: "12px" }}>/ 10</span></span>
                </div>
                <div className="licence-row">
                  <div className="licence-name">Rating by Brands</div>
                  <span style={{ color: "var(--amber-deep)", fontWeight: "600", fontSize: "14px" }}>{(rating && rating - 0.2 > 0 ? (rating - 0.2).toFixed(1) : displayRating) || "N/A"} ★ <span style={{ color: "var(--ink-soft)", fontWeight: "400", fontSize: "12px" }}>(avg. of {certBrands.length})</span></span>
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
                      <div className="project-meta">{project.installationDate ? new Date(project.installationDate).toLocaleDateString() : ""} · {project.city || primaryCity}</div>
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
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: "34px", fontWeight: "600", color: "var(--navy-deep)", lineHeight: "1" }}>{displayRating}</div>
                      <div style={{ color: "var(--amber-deep)", fontSize: "14px", marginTop: "4px" }}>★★★★★</div>
                      <div style={{ fontSize: "12px", color: "var(--ink-soft)", marginTop: "2px" }}>{count || 0} reviews</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {count > 0 ? (
                      <p className="text-slate-custom text-sm">Please see the latest reviews on our platform.</p>
                    ) : (
                      <p className="text-slate-custom text-sm">No customer reviews yet.</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {/* Additional Sidebar Content for Reviews if needed */}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
