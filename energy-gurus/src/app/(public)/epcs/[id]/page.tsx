import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEpcCompleteness } from "@/lib/utils/completeness";
import {
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Play,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReviewForm } from "@/components/forms/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { getProfileRating, getTeamRating } from "@/lib/actions/reviews";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { InferSelectModel } from "drizzle-orm";
import { InstallerQuoteForm } from "@/components/forms/installer-quote-form";

import { isUUID, slugify } from "@/lib/utils/slug";
import { or, ilike } from "drizzle-orm";

type EpcInstaller = InferSelectModel<typeof epcInstallers>;
type EpcOffice = InferSelectModel<typeof epcOffices>;
type EpcProject = InferSelectModel<typeof epcProjects>;

interface EpcProfileData {
  installer: EpcInstaller;
  offices: EpcOffice[];
  projects: EpcProject[];
  rating: number | null;
  count: number;
  isActive: boolean;
}

async function getInstallerByParam(param: string) {
  const decoded = decodeURIComponent(param).trim();
  if (isUUID(decoded)) {
    const installer = await db.query.epcInstallers.findFirst({
      where: eq(epcInstallers.id, decoded),
      with: { user: true }
    });
    if (installer) return installer;
  }

  const normalizedName = decoded.replace(/-/g, " ");
  const installerBySlug = await db.query.epcInstallers.findFirst({
    where: or(eq(epcInstallers.slug, decoded), ilike(epcInstallers.companyName, normalizedName), ilike(epcInstallers.companyName, decoded)),
    with: { user: true }
  });

  return installerBySlug || null;
}

export async function generateMetadata({
  params
    }: {
  params: Promise<{ id: string; locale?: string }>;
}): Promise<Metadata> {
  const { id, locale = "en" } = await params;
  const installer = await getInstallerByParam(id);

  if (!installer) return {};

  const baseUrl = "https://www.energygurus.online";
  const slug = installer.slug || slugify(installer.companyName);
  const title = `${installer.companyName} | Verified Solar EPC | EnergyGurus`;
  const description = installer.about?.slice(0, 160) || `Learn more about ${installer.companyName}, a certified solar installer providing high-quality energy solutions.`;
  const url = `${baseUrl}/installers/${slug}`;

  return {
    title,
    description,
    keywords: [
      "best solar installers in Pakistan",
      "top solar companies in Pakistan",
      "solar installation near me",
      "verified EPC installers",
      installer.companyName
    ],
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "EnergyGurus",
      type: "website",
      images: installer.logoUrl ? [{ url: installer.logoUrl, width: 800, height: 800, alt: installer.companyName }] : [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: installer.companyName }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: installer.logoUrl ? [installer.logoUrl] : [`${baseUrl}/new_hero_banner.jpg`]
    }
  };
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  return "★".repeat(Math.min(5, fullStars)) + "☆".repeat(Math.max(0, 5 - fullStars));
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
  return match ? match[1] : null;
}

export default async function EpcProfilePage({
  params
    }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const installer = await getInstallerByParam(id);

  if (!installer || !(installer as any).user?.isActive) return notFound();

  const realId = installer.id;
  const cacheKey = CACHE_KEYS.EPC_DETAILS(realId);

  let profileData: EpcProfileData | null = await redis.get<EpcProfileData>(cacheKey);

  if (!profileData) {

    const offices = await db.select().from(epcOffices).where(eq(epcOffices.epcId, realId));
    const projects = await db.select().from(epcProjects).where(eq(epcProjects.epcId, realId));
    const { rating, count } = await getProfileRating(realId);

    profileData = { installer, offices, projects, rating, count, isActive: (installer as any).user?.isActive || false };
    await redis.set(cacheKey, profileData, { ex: 3600 });
  }

  if (!profileData || !profileData.isActive) return notFound();

  const { offices, projects, rating, count } = profileData;

  const { score } = getEpcCompleteness(installer, offices.length, projects.length);
  if (score < 50) notFound();

  const { rating: teamRating, count: teamCount } = await getTeamRating(installer.id, "epc");

  const primaryCity = offices[0]?.city || "Lahore";
  const yearsInBusiness = Math.max(1, new Date().getFullYear() - new Date(installer.createdAt).getFullYear());

  const certBrands = (installer.brandsCertified as string[])?.length > 0 
    ? (installer.brandsCertified as string[]) 
    : ["LONGI", "JINKO", "JA", "TRINA", "HUAWEI"];

  const solarBrands = (installer.solarBrands as string[]) || [];
  const inverterBrands = (installer.inverterBrands as string[]) || [];
  const batteryBrands = (installer.batteryBrands as string[]) || [];

  const team = (installer.team as { name: string; designation: string; linkedIn: string; imageUrl: string }[]) || [];

  const sectorsList = (installer.sectors as string[])?.length > 0
    ? (installer.sectors as string[])
    : ["Residential", "Commercial", "Industrial", "Agriculture"];

  const certificationsList = (installer.certifications as string[])?.length > 0
    ? (installer.certifications as string[])
    : [];

  const socialLinks = (installer.socialLinks as { platform: string; url: string }[] | null) || [];
  const websiteUrl = installer.website || socialLinks.find(l => l.platform.toLowerCase() === "website")?.url || "#";
  const facebookUrl = socialLinks.find(l => l.platform.toLowerCase() === "facebook")?.url || "#";
  const instagramUrl = socialLinks.find(l => l.platform.toLowerCase() === "instagram")?.url || "#";
  const linkedinUrl = socialLinks.find(l => l.platform.toLowerCase() === "linkedin")?.url || "#";
  const youtubeUrl = socialLinks.find(l => l.platform.toLowerCase() === "youtube")?.url || "#";
  const photos = (installer.photos as string[] | null) || [];
  const reviewVideos = (installer.reviewVideos as string[] | null) || [];
  const testimonialProjects = projects.filter((project) => project.entryType === "testimonial" || project.customerName || project.companyName || project.youtubeUrl);
  const customerVideoEntries = testimonialProjects.length > 0 ? testimonialProjects.slice(0, 3) : reviewVideos.slice(0, 3).map((url, index) => ({
    id: `${index}-review-video`,
    name: `Customer Testimonial ${index + 1}`,
    customerName: `Verified customer ${index + 1}`,
    city: primaryCity,
    youtubeUrl: url,
  }));
  const portfolioFallback = photos.length > 0 ? photos : projects.flatMap((project) => project.images || []);

  return (
    <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 min-h-screen">
      
      {/* Breadcrumb */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 pt-5 text-[0.84rem] text-slate-custom">
        <Link href="/epcs" className="text-teal hover:underline">Find an Installer</Link> / {installer.companyName}
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="wrap profile-top">
          
          {/* Avatar LG */}
          <div className="avatar-lg">
            {installer.logoUrl ? (
              <Image src={installer.logoUrl} alt={installer.companyName} width={120} height={120} className="object-cover w-full h-full rounded-[10px]" />
            ) : (
              installer.companyName.substring(0, 2).toUpperCase()
            )}
          </div>

          {/* Profile Name & Meta */}
          <div className="profile-name">
            <h1>
              {installer.ceoName || installer.companyName}
              {installer.isVerified && <span className="verified-tag gold" title="Verified Installer">★ Gold Verified</span>}
            </h1>
            <div className="company">
              {installer.companyName}
              {installer.designation && installer.businessType ? ` · ${installer.designation} · ${installer.businessType}` : ''}
            </div>
            
            <div className="location-line">
              <span>📍 {primaryCity}</span>
              <span>· {yearsInBusiness} yrs in business</span>
              {installer.tier === 'silver' && <span className="ml-2 bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Silver</span>}
            </div>
            
            {(installer.contactNo || installer.whatsapp || installer.address) && (
              <div className="text-sm text-slate-custom mb-3 space-y-1">
                {installer.contactNo && <div>Phone: {installer.contactNo}</div>}
                {installer.whatsapp && <div>WhatsApp: {installer.whatsapp}</div>}
                {installer.address && <div>Address: {installer.address}</div>}
              </div>
            )}
            
            <div className="cert-brands">
              {(solarBrands.length > 0 || inverterBrands.length > 0 || batteryBrands.length > 0) ? (
                <>
                  {solarBrands.length > 0 && (
                    <>
                      <span className="cert-label">Solar</span>
                      {solarBrands.map((brand, i) => (
                        <span key={i} className="cert-logo">{brand}</span>
                      ))}
                    </>
                  )}
                  {inverterBrands.length > 0 && (
                    <>
                      <span className="cert-label">Inverters</span>
                      {inverterBrands.map((brand, i) => (
                        <span key={i} className="cert-logo">{brand}</span>
                      ))}
                    </>
                  )}
                  {batteryBrands.length > 0 && (
                    <>
                      <span className="cert-label">Batteries</span>
                      {batteryBrands.map((brand, i) => (
                        <span key={i} className="cert-logo">{brand}</span>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="cert-label">Certified By</span>
                  {certBrands.map((brand, i) => (
                    <span key={i} className="cert-logo">{brand}</span>
                  ))}
                </>
              )}
            </div>

            <div className="type-tags">
              {sectorsList.map((sector, i) => (
                <span key={i} className="type-tag">{sector}</span>
              ))}
              {certificationsList.map((cert, i) => (
                <span key={i} className="type-tag">{cert}</span>
              ))}
            </div>

            <div className="social-row">
              {websiteUrl !== "#" && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="social-btn">
                  <Globe />
                </a>
              )}
              {facebookUrl !== "#" && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn">
                  <Facebook />
                </a>
              )}
              {instagramUrl !== "#" && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-btn">
                  <Instagram />
                </a>
              )}
              {linkedinUrl !== "#" && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-btn">
                  <Linkedin />
                </a>
              )}
              {youtubeUrl !== "#" && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-btn">
                  <Youtube />
                </a>
              )}
            </div>
          </div>

          {/* Profile CTA */}
          <div className="profile-actions">
            <a href="#quote" className="btn-primary">
              Request a Quote
            </a>
          </div>
        </div>

          {/* Rating Cards */}
          <div className="wrap">
            <div className="rating-block">
              <div className="rating-card">
                <div className="rating-num">
                  {rating ? rating.toFixed(1) : "5.0"}
                </div>
                <div className="rating-meta">
                  <div className="stars">
                    {renderStars(rating || 5.0)}
                  </div>
                  <div className="rating-label">
                    Customer Rating · {count} {count === 1 ? "Review" : "Reviews"}
                  </div>
                </div>
              </div>

              <div className="rating-card team">
                <div className="rating-num">
                  {teamRating ? teamRating.toFixed(1) : "5.0"}
                </div>
                <div className="rating-meta">
                  <div className="stars">
                    {renderStars(teamRating || 5.0)}
                  </div>
                  <div className="rating-label">
                    EnergyGurus Team Rating {teamCount > 0 ? `· ${teamCount} ${teamCount === 1 ? "Review" : "Reviews"}` : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Portfolio — Project Videos */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Portfolio</div>
            <h2>Project Videos</h2>
          </div>

          <div className="video-grid">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((project) => {
                const videoId = (project as any).youtubeUrl ? getYouTubeId((project as any).youtubeUrl) : null;
                return (
                  <div key={project.id} className="video-card">
                    <div className="video-thumb group">
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={project.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity absolute inset-0"
                        />
                      ) : project.images && project.images.length > 0 ? (
                        <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover opacity-80 absolute inset-0" />
                      ) : null}
                      {(project as any).youtubeUrl && (
                        <a
                          href={(project as any).youtubeUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="play shadow-md group-hover:scale-110 transition-transform absolute z-10"
                        >
                          ▶
                        </a>
                      )}
                    </div>
                    <div className="video-body">
                      <h3>{project.name}</h3>
                      <p>
                        {project.systemSize || project.systemType || (Array.isArray(project.segmentType) && project.segmentType.length ? project.segmentType.join(", ") : "Solar project installation")}
                      </p>
                      {project.customerName && (
                        <p className="text-[0.75rem] text-slate-500 mt-2">
                          Client: {project.companyName || project.customerName}
                        </p>
                      )}
                      {(project.inverterModel || project.batteryModel || project.solarPanelModel) && (
                        <p className="text-[0.75rem] text-slate-500 mt-2">
                          {project.inverterModel && `Inverter: ${project.inverterModel}`} {project.solarPanelModel && ` | Panels: ${project.solarPanelModel}`} {project.batteryModel && ` | Battery: ${project.batteryModel}`}
                        </p>
                      )}
                      {project.description && (
                        <p className="text-[0.8rem] text-slate-600 mt-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : portfolioFallback.length > 0 ? (
              portfolioFallback.slice(0, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="video-card">
                  <div className="video-thumb">
                    <img src={image} alt={`${installer.companyName} portfolio ${index + 1}`} className="w-full h-full object-cover opacity-80 absolute inset-0" />
                  </div>
                  <div className="video-body">
                    <h3>Project Portfolio</h3>
                    <p>Recent installation showcase</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="video-card">
                  <div className="video-thumb">
                    <div className="play">▶</div>
                  </div>
                  <div className="video-body">
                    <h3>Residential Rooftop Install</h3>
                    <p>Home solar system completed in 3 days.</p>
                  </div>
                </div>
                <div className="video-card">
                  <div className="video-thumb">
                    <div className="play">▶</div>
                  </div>
                  <div className="video-body">
                    <h3>Commercial Plaza System</h3>
                    <p>Commercial rooftop installation.</p>
                  </div>
                </div>
                <div className="video-card">
                  <div className="video-thumb">
                    <div className="play">▶</div>
                  </div>
                  <div className="video-body">
                    <h3>Industrial Ground-Mount</h3>
                    <p>Utility-scale clean energy installation.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Customer Video Testimonials */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">In Their Words</div>
            <h2>Customer Video Testimonials</h2>
          </div>

          <div className="video-grid">
            {customerVideoEntries.length > 0 ? customerVideoEntries.map((entry: any) => {
              const videoId = entry.youtubeUrl ? getYouTubeId(entry.youtubeUrl) : null;
              return (
                <div key={entry.id || entry.name} className="video-card testimonial-card">
                  <div className="video-thumb group">
                    {videoId ? (
                      <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt={entry.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity absolute inset-0" />
                    ) : null}
                    {entry.youtubeUrl && (
                      <a href={entry.youtubeUrl} target="_blank" rel="noreferrer" className="play shadow-md group-hover:scale-110 transition-transform absolute z-10">▶</a>
                    )}
                  </div>
                  <div className="testimonial-body">
                    <div className="cust-name">{entry.customerName || entry.name}</div>
                    <div className="cust-loc">{entry.city || entry.companyName || "Verified Customer"}</div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-sm text-slate-custom border border-dashed rounded-xl p-8 text-center">No customer testimonial videos uploaded yet.</div>
            )}
          </div>

          {/* Written Reviews & Submission */}
          <div className="mt-8">
            <h3 className="font-space-grotesk font-semibold text-[1.2rem] text-ink mb-6">
              Customer Reviews & Ratings
            </h3>
            <div className="mb-6">
              <ReviewForm targetId={id} targetType="epc" />
            </div>
            <ReviewList targetId={id} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">About</div>
            <h2>{installer.companyName}</h2>
          </div>

          <div className="about-box">
            <p>
              {installer.about || `${installer.companyName} has been designing and installing solar systems across Pakistan, serving homeowners, businesses, and agricultural clients. The team specializes in rooftop residential systems and commercial solar installations.`}
            </p>

            {(installer.businessType || installer.designation || installer.address) && (
              <div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-custom">
                {installer.businessType && <span className="bg-slate-100 px-3 py-1 rounded-full">{installer.businessType}</span>}
                {installer.designation && <span className="bg-slate-100 px-3 py-1 rounded-full">{installer.designation}</span>}
                {installer.address && <span className="bg-slate-100 px-3 py-1 rounded-full">{installer.address}</span>}
              </div>
            )}

            <div className="cred-grid">
              <div className="cred-item">
                <div className="cred-val">{yearsInBusiness} yrs</div>
                <div className="cred-label">In Business</div>
              </div>
              <div className="cred-item">
                <div className="cred-val">{projects.length > 0 ? `${projects.length}+` : "340+"}</div>
                <div className="cred-label">Systems Installed</div>
              </div>
              <div className="cred-item">
                <div className="cred-val">{certificationsList.length || "NABCEP"}</div>
                <div className="cred-label">Certified Team</div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-8">
                <h3 className="font-space-grotesk font-semibold text-[1.1rem] text-ink mb-4">Company Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.slice(0, 8).map((photo, index) => (
                    <div key={`${photo}-${index}`} className="overflow-hidden rounded-xl border border-line bg-white">
                      <img src={photo} alt={`${installer.companyName} media ${index + 1}`} className="w-full h-32 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(installer.solarCertDocuments?.length || installer.inverterCertDocuments?.length || installer.batteryCertDocuments?.length) && (
              <div className="mt-8">
                <h3 className="font-space-grotesk font-semibold text-[1.1rem] text-ink mb-4">Certification Documents</h3>
                <div className="flex flex-wrap gap-3">
                  {[...(installer.solarCertDocuments as string[] || []), ...(installer.inverterCertDocuments as string[] || []), ...(installer.batteryCertDocuments as string[] || [])]
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((doc, idx) => (
                      <a key={`${doc}-${idx}`} href={doc} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-line bg-white px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        Certificate {idx + 1}
                      </a>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-2.5 flex-wrap pt-6 border-t border-line mt-[28px]">
              {websiteUrl !== "#" && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="Website" aria-label="Website">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {facebookUrl !== "#" && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="Facebook" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagramUrl !== "#" && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="Instagram" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {linkedinUrl !== "#" && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="LinkedIn" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl !== "#" && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-[38px] h-[38px] rounded-full border border-line text-ink flex items-center justify-center hover:border-teal hover:text-teal transition-colors" title="YouTube" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-[56px] border-t border-line bg-white/50">
          <div className="max-w-[1180px] mx-auto px-5 md:px-8">
            <div className="mb-8 text-center max-w-[560px] mx-auto">
              <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center justify-center gap-2.5 mb-2">
                <span className="w-5 h-[1px] bg-amber"></span>
                Meet The Team
              </p>
              <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink">
                The Experts Behind {installer.companyName}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div key={i} className="text-center group">
                  <div className="w-[120px] h-[120px] mx-auto rounded-full overflow-hidden border-2 border-line group-hover:border-amber transition-colors mb-4">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-paper flex items-center justify-center text-slate-custom font-space-grotesk text-2xl font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h4 className="font-space-grotesk font-semibold text-[1.1rem] text-ink">{member.name}</h4>
                  <p className="text-slate-custom text-[0.85rem] mt-1">{member.designation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Request a Quote Section */}
      <section className="quote-section" id="quote">
        <div className="wrap">
          <div className="section-head text-center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Request a Quote</div>
            <h2>Get a quote from {installer.ceoName || installer.companyName}</h2>
            <p style={{ color: 'var(--slate)', marginTop: '10px' }}>
              Share a few details and {installer.companyName} will follow up directly.
            </p>
          </div>

          <InstallerQuoteForm
            receiverId={installer.userId}
            receiverName={installer.companyName}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="wrap">
          <h2>Ready to work with {installer.companyName}?</h2>
          <a href="#quote" className="btn-primary">
            Request a Quote From {installer.ceoName || installer.companyName}
          </a>
        </div>
      </section>

    </div>
  );
}
