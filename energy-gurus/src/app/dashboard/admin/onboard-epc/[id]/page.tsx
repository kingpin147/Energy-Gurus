import React from "react";
import { getEpcFullDetails } from "@/lib/actions/admin-epc-actions";
import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminReviewSidebar } from "./admin-review-sidebar";
import { Globe, MapPin, Mail, Phone, Calendar, Star, FileText } from "lucide-react";

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const epc = await getEpcFullDetails(id);

  if (!epc) {
    return (
      <div className="p-12 text-center">
        <h2>EPC Installer not found</h2>
        <Link href="/dashboard/admin/onboard-epc" className="text-teal underline mt-4 inline-block">
          Return to Hub
        </Link>
      </div>
    );
  }

  const team = Array.isArray(epc.team) ? epc.team : [];
  const offices = Array.isArray(epc.offices) ? epc.offices : [];
  const projects = Array.isArray(epc.projects) ? epc.projects : [];

  const sectors = Array.isArray(epc.sectors) ? epc.sectors : [];
  const certBrands = Array.isArray(epc.certifications) ? epc.certifications : [];
  const solarBrands = Array.isArray(epc.solarBrands) ? epc.solarBrands : [];
  const inverterBrands = Array.isArray(epc.inverterBrands) ? epc.inverterBrands : [];
  const batteryBrands = Array.isArray(epc.batteryBrands) ? epc.batteryBrands : [];

  return (
    <div className="bg-paper min-h-screen text-graphite font-sans pb-20">
      <nav className="sticky top-0 z-50 bg-ink border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="font-space-grotesk font-bold text-white text-base flex items-center gap-2.5">
            EnergyGurus 
            <span className="font-ibm-plex-mono text-[0.65rem] tracking-[0.08em] uppercase text-amber bg-[rgba(232,163,61,0.15)] px-2 py-1 rounded-[3px]">
              Admin
            </span>
          </div>
          <div className="text-[rgba(245,246,243,0.7)] text-[0.86rem]">
            Reviewing as: Verification Team
          </div>
        </div>
      </nav>

      <div className="page-wrap max-w-[1400px] mx-auto px-8 pt-7 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7">
        
        <div className="top-bar col-span-full flex items-center justify-between mb-2">
          <div className="text-[0.86rem] text-slate-custom">
            <Link href="/dashboard/admin/onboard-epc" className="text-teal hover:underline">Pending Applications</Link> 
            {" / "} {epc.ceoName || epc.companyName} — {epc.companyName}
          </div>
          <span className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full bg-[rgba(232,163,61,0.15)] text-[#a3711c]">
            ⏳ Pending Review
          </span>
        </div>

        <div>
          {/* Applicant Header */}
          <div className="app-header">
            <div className="app-avatar">
              {epc.companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[1.3rem] text-ink font-space-grotesk font-semibold">
                {epc.ceoName || epc.companyName}
              </h1>
              <div className="text-[0.9rem] text-slate-custom mt-1">
                {epc.companyName} {epc.designation && `· ${epc.designation}`}
              </div>
            </div>
            <div className="app-meta">
              <div>Application ID: <span className="font-ibm-plex-mono text-ink">#{epc.id.substring(0, 8).toUpperCase()}</span></div>
              <div>Submitted: {new Date(epc.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* 1. Basic Information */}
          <div className="review-card">
            <h2><span className="num">1</span>Basic Information</h2>
            <div className="review-body">
              <div className="field-grid three">
                <div className="field-row"><label>Name</label><div className="val">{epc.ceoName || "N/A"}</div></div>
                <div className="field-row"><label>Designation</label><div className="val">{epc.designation || "N/A"}</div></div>
                <div className="field-row"><label>Company Name</label><div className="val">{epc.companyName}</div></div>
                <div className="field-row"><label>Business Type</label><div className="val">{epc.businessType || "N/A"}</div></div>
                <div className="field-row"><label>Years in Business</label><div className="val">{epc.yearsInBusiness || 0}</div></div>
              </div>
              <div className="divider"></div>
              <div className="field-row full">
                <label>Short Bio</label>
                <div className="val">{epc.about || <span className="text-[#b0b7c3] italic">Not provided</span>}</div>
              </div>
            </div>
          </div>

          {/* 2. Location */}
          <div className="review-card">
            <h2><span className="num">2</span>Location</h2>
            <div className="review-body">
              <div className="field-grid">
                <div className="field-row full"><label>Full Address</label><div className="val">{epc.address || "N/A"}</div></div>
                <div className="field-row"><label>Area / Society</label><div className="val">{epc.area || "N/A"}</div></div>
                <div className="field-row"><label>City</label><div className="val">{epc.city || "N/A"}</div></div>
                <div className="field-row"><label>Country</label><div className="val">{epc.country || "Pakistan"}</div></div>
              </div>
              
              {offices.length > 0 && (
                <>
                  <div className="divider"></div>
                  <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.05em] uppercase text-slate-custom mb-2.5">
                    Additional Offices ({offices.length})
                  </div>
                  {offices.map((office: any, idx: number) => (
                    <div key={idx} className="repeat-card">
                      <div className="field-grid">
                        <div className="field-row full"><label>Full Address</label><div className="val">{office.address || "N/A"}</div></div>
                        <div className="field-row"><label>City</label><div className="val">{office.city || "N/A"}</div></div>
                        <div className="field-row"><label>Country</label><div className="val">{office.country || "Pakistan"}</div></div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* 3. Contact Details */}
          <div className="review-card">
            <h2><span className="num">3</span>Contact Details</h2>
            <div className="review-body">
              <div className="field-grid three">
                <div className="field-row"><label>Voice Number</label><div className="val">{epc.contactNo || "N/A"}</div></div>
                <div className="field-row"><label>WhatsApp Number</label><div className="val">{(epc as any).whatsapp || "N/A"}</div></div>
                <div className="field-row"><label>Email Address</label><div className="val">{epc.email || "N/A"}</div></div>
                <div className="field-row"><label>Website</label><div className="val">{epc.website || "N/A"}</div></div>
              </div>
            </div>
          </div>

          {/* 4. Specialties */}
          <div className="review-card">
            <h2><span className="num">4</span>Specialties</h2>
            <div className="review-body">
              <div className="tag-row">
                {sectors.map((s, i) => (
                  <span key={i} className="mini-tag">{s}</span>
                ))}
                {sectors.length === 0 && <span className="text-[#b0b7c3] italic">None specified</span>}
              </div>
            </div>
          </div>

          {/* 5. Meet The Team */}
          <div className="review-card">
            <h2><span className="num">5</span>Meet The Team ({team.length})</h2>
            <div className="review-body">
              <div className="team-grid">
                {team.map((member: any, i: number) => (
                  <div key={i} className="team-mini">
                    <div className="ava">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="name">{member.name}</div>
                      <div className="role">{member.designation || "N/A"}</div>
                      {member.linkedIn && <a className="li" href={member.linkedIn} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
                    </div>
                  </div>
                ))}
                {team.length === 0 && <div className="text-[#b0b7c3] italic">No team members added.</div>}
              </div>
            </div>
          </div>

          {/* 6. Projects & Testimonials */}
          <div className="review-card">
            <h2><span className="num">6</span>Projects &amp; Testimonials ({projects.length})</h2>
            <div className="review-body">
              {projects.map((proj: any, idx: number) => (
                <div key={idx} className="repeat-card">
                  <div className="tag-row flex gap-2 mb-2">
                    <span className="mini-tag type bg-[rgba(232,163,61,0.15)] text-[#a3711c]">
                      {proj.entryType === 'testimonial' ? 'Testimonial' : 'Project'}
                    </span>
                    {proj.segmentType && Array.isArray(proj.segmentType) && proj.segmentType.map((s: string, i: number) => (
                      <span key={i} className="mini-tag bg-[rgba(47,110,98,0.1)] text-teal">{s}</span>
                    ))}
                  </div>
                  <div className="field-grid">
                    {proj.youtubeUrl && <div className="field-row"><label>YouTube Link</label><div className="val"><a href={proj.youtubeUrl} target="_blank" rel="noreferrer" className="text-teal">Watch ↗</a></div></div>}
                    <div className="field-row"><label>Date of Installation</label><div className="val">{proj.installationDate || "N/A"}</div></div>
                    <div className="field-row"><label>Customer Name</label><div className="val">{proj.customerName || "N/A"}</div></div>
                    <div className="field-row"><label>Company Name</label><div className="val">{proj.companyName || "N/A"}</div></div>
                    <div className="field-row"><label>City</label><div className="val">{proj.city || "N/A"}</div></div>
                    <div className="field-row full"><label>Short Description</label><div className="val">{proj.description || "N/A"}</div></div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <div className="text-[#b0b7c3] italic">No projects added.</div>}
            </div>
          </div>

          {/* 7. Certifications & Documents */}
          <div className="review-card">
            <h2><span className="num">7</span>Certifications &amp; Brands</h2>
            <div className="review-body">
              <div className="field-grid three">
                <div className="field-row"><label>Licences Held</label><div className="val">{epc.regNumber || "N/A"}</div></div>
              </div>
              <div className="divider"></div>
              
              <div className="font-ibm-plex-mono text-[0.7rem] tracking-[0.05em] uppercase text-slate-custom mb-3">Brands</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[...solarBrands, ...inverterBrands, ...batteryBrands, ...certBrands].map((b, i) => (
                  <span key={i} className="bg-slate-100 px-3 py-1 text-sm rounded-full">{b}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 8. Verification Tier */}
          <div className="review-card">
            <h2><span className="num">8</span>Verification Tier Requested</h2>
            <div className="review-body">
              <span className="tier-badge inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold bg-[rgba(232,163,61,0.12)] text-[#a3711c] border border-[rgba(232,163,61,0.3)]">
                ★ {epc.tier ? epc.tier.charAt(0).toUpperCase() + epc.tier.slice(1) : "Bronze"} Tier
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <AdminReviewSidebar epcId={epc.id} />
      </div>
    </div>
  );
}
