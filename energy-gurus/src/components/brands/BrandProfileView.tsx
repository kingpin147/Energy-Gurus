"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Globe,
  Star,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Search,
  Clock,
  Wrench,
  Store,
  Briefcase,
  Layers,
  MessageSquare,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  Music2,
  Download,
  ArrowRight,
  Sparkles,
  PackageX
} from "lucide-react";
import { BrandReviewModal } from "@/components/brands/BrandReviewModal";
import { CompareToggle } from "@/components/shared/compare-toggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/contact-form";
import { trackEngagement } from "@/components/shared/AnalyticsTracker";

interface BrandProfileViewProps {
  brand: any;
  products: any[];
  reviews: any[];
  news?: any[];
  rating: number;
  reviewCount: number;
}

export function BrandProfileView({
  brand,
  products = [],
  reviews = [],
  rating = 0,
  reviewCount = 0
}: BrandProfileViewProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "products" | "distributors" | "retailers" | "centres" | "installers"
  >("profile");

  // Filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const [distributorSearch, setDistributorSearch] = useState("");
  const [distributorRegionFilter, setDistributorRegionFilter] = useState("all");

  const [retailerSearch, setRetailerSearch] = useState("");
  const [retailerCityFilter, setRetailerCityFilter] = useState("all");

  const [installerSearch, setInstallerSearch] = useState("");
  const [installerCityFilter, setInstallerCityFilter] = useState("all");
  const [installerTierFilter, setInstallerTierFilter] = useState("all");

  // PostHog Tracking
  useEffect(() => {
    if (brand?.brandName) {
      trackEngagement("brand_portfolio_view", {
        brandId: brand.id,
        brandName: brand.brandName
      });
    }
  }, [brand?.id, brand?.brandName]);

  // 100% Dynamic entity arrays (No hardcoded fallback entries)
  const distributors: any[] = Array.isArray(brand.distributors) ? brand.distributors : [];
  const retailers: any[] = Array.isArray(brand.retailers) ? brand.retailers : [];
  const serviceCentres: any[] = Array.isArray(brand.serviceCentres) ? brand.serviceCentres : [];
  const certifiedInstallers: any[] = Array.isArray(brand.certifiedInstallers) ? brand.certifiedInstallers : [];
  const team: any[] = Array.isArray(brand.localTeam) && brand.localTeam.length > 0
    ? brand.localTeam
    : Array.isArray(brand.team)
      ? brand.team
      : [];
  const worldwideProjects: any[] = Array.isArray(brand.worldwideProjects) ? brand.worldwideProjects : [];
  const displayProducts: any[] = Array.isArray(products) ? products : [];
  const offices: any[] = Array.isArray(brand.offices) ? brand.offices : [];
  const manufacturingFacilities: any[] = Array.isArray(brand.manufacturingFacilities) ? brand.manufacturingFacilities : [];

  // Filtered lists
  const filteredProducts = displayProducts.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.series?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === "all" ||
      (p.category || "").toLowerCase().includes(productCategoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const filteredDistributors = distributors.filter((d) => {
    const matchesSearch =
      !distributorSearch ||
      d.name?.toLowerCase().includes(distributorSearch.toLowerCase()) ||
      d.city?.toLowerCase().includes(distributorSearch.toLowerCase()) ||
      d.address?.toLowerCase().includes(distributorSearch.toLowerCase());
    const matchesRegion =
      distributorRegionFilter === "all" ||
      (d.region || "").toLowerCase() === distributorRegionFilter.toLowerCase() ||
      (d.city || "").toLowerCase() === distributorRegionFilter.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  const filteredRetailers = retailers.filter((r) => {
    const matchesSearch =
      !retailerSearch ||
      r.name?.toLowerCase().includes(retailerSearch.toLowerCase()) ||
      r.city?.toLowerCase().includes(retailerSearch.toLowerCase()) ||
      r.address?.toLowerCase().includes(retailerSearch.toLowerCase());
    const matchesCity =
      retailerCityFilter === "all" ||
      (r.city || "").toLowerCase() === retailerCityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const filteredInstallers = certifiedInstallers.filter((inst) => {
    const matchesSearch =
      !installerSearch ||
      inst.installerName?.toLowerCase().includes(installerSearch.toLowerCase()) ||
      inst.name?.toLowerCase().includes(installerSearch.toLowerCase()) ||
      inst.city?.toLowerCase().includes(installerSearch.toLowerCase());
    const matchesCity =
      installerCityFilter === "all" ||
      (inst.city || "").toLowerCase() === installerCityFilter.toLowerCase();
    const matchesTier =
      installerTierFilter === "all" ||
      (inst.tier || "").toLowerCase() === installerTierFilter.toLowerCase();
    return matchesSearch && matchesCity && matchesTier;
  });

  // Dynamic capacity calculation (only if populated)
  let parsedCapacity: string | null = null;
  if (typeof brand.annualCapacity === "string" && brand.annualCapacity.trim()) {
    parsedCapacity = brand.annualCapacity.trim();
  } else if (brand.annualCapacity && typeof brand.annualCapacity === "object") {
    const cap = brand.annualCapacity as Record<string, any>;
    const val = cap.inverters || cap.panels || cap.batteries || cap.bess || Object.values(cap).find((v: any) => typeof v === "string" && v.trim());
    if (typeof val === "string" && val.trim()) {
      parsedCapacity = val.trim();
    }
  }

  // Real review star breakdown
  const actualReviewCount = reviewCount || reviews.length;
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(Number(r.rating || 5)) === star).length;
    const pct = actualReviewCount > 0 ? Math.round((count / actualReviewCount) * 100) : 0;
    return { star, count, pct };
  });

  // Primary customer care contact
  const primaryPhone = brand.customerCare || offices[0]?.phone || null;
  const primaryEmail = brand.customerCareEmail || offices[0]?.email || null;
  const primaryWhatsapp = offices[0]?.whatsapp || brand.customerCare || null;
  const cleanWhatsappNumber = primaryWhatsapp ? primaryWhatsapp.replace(/[^0-9]/g, "") : null;

  return (
    <div className="bg-cream text-ink min-h-screen">
      
      {/* Top Minimal Breadcrumb Bar */}
      <div className="bg-navy-deep text-paper/70 text-xs py-2.5 border-b border-white/10">
        <div className="max-w-[1080px] mx-auto px-5 md:px-7 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/brands" className="hover:text-white transition-colors">
              Brands
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">{brand.brandName}</span>
          </div>
        </div>
      </div>

      {/* Brand Profile Hero Header */}
      <header className="bg-navy text-white pt-11 pb-0 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(1200px 240px at 85% -40%, rgba(224,167,59,0.25), transparent 60%)"
          }}
        />
        <div className="max-w-[1080px] mx-auto px-5 md:px-7 relative z-10">
          <div className="flex flex-col md:flex-row gap-7 items-start justify-between pb-8 border-b border-white/15">
            
            {/* Left: Brandmark + Title Info */}
            <div className="flex gap-6 items-start">
              <div className="w-[92px] h-[92px] bg-white rounded-[3px] p-2 flex items-center justify-center font-fraunces font-bold text-3xl text-navy shrink-0 shadow-lg border border-line">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.brandName}
                    width={92}
                    height={92}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  brand.brandName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-fraunces text-2xl md:text-[32px] font-semibold text-white tracking-tight">
                    {brand.brandName}
                  </h1>
                  {brand.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber/15 text-amber border border-amber/55 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber" /> Verified Brand
                    </span>
                  )}
                </div>

                {brand.tagline && (
                  <p className="text-[#C7D0D8] text-sm md:text-[15px] mt-2 max-w-[560px] leading-relaxed">
                    {brand.tagline}
                  </p>
                )}

                {/* Header Dynamic Stats */}
                <div className="flex gap-8 md:gap-9 mt-5 flex-wrap">
                  {brand.founded && (
                    <div>
                      <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                        {brand.founded}
                      </span>
                      <span className="text-[#9FADB8] text-xs">Founded</span>
                    </div>
                  )}

                  {(brand.countriesServed || brand.globalLocations) && (
                    <div>
                      <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                        {brand.countriesServed || brand.globalLocations}
                      </span>
                      <span className="text-[#9FADB8] text-xs">Global Presence</span>
                    </div>
                  )}

                  {parsedCapacity && (
                    <div>
                      <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                        {parsedCapacity}
                      </span>
                      <span className="text-[#9FADB8] text-xs">Annual Capacity</span>
                    </div>
                  )}

                  <div>
                    <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                      {actualReviewCount > 0 ? `${rating.toFixed(1)} / 5` : "New"}
                    </span>
                    <span className="text-[#9FADB8] text-xs">
                      {actualReviewCount > 0 ? `${actualReviewCount} reviews` : "Customer rating"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    onClick={() => {
                      trackEngagement("brand_contact_click", {
                        brandId: brand.id,
                        brandName: brand.brandName
                      });
                    }}
                    className="w-full justify-center bg-amber hover:bg-[#eab857] text-navy-deep font-semibold text-xs md:text-sm rounded-[3px] py-2.5 px-5 shadow-sm cursor-pointer transition-colors"
                  >
                    Request a Quote
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[4px] p-0 overflow-hidden border border-line text-ink bg-white">
                  <div className="bg-navy-deep p-6 text-white">
                    <h3 className="text-xl font-bold font-fraunces">Direct Inquiry to {brand.brandName}</h3>
                    <p className="text-paper/70 text-xs mt-1">Send a direct procurement or pricing inquiry to official representatives.</p>
                  </div>
                  <div className="p-6 bg-white">
                    <ContactForm receiverId={brand.userId} receiverName={brand.brandName} />
                  </div>
                </DialogContent>
              </Dialog>

              {displayProducts.length > 0 && (
                <button
                  onClick={() => setActiveTab("products")}
                  className="w-full justify-center bg-transparent hover:border-white border border-white/40 text-white font-semibold text-xs md:text-sm rounded-[3px] py-2 px-4 cursor-pointer transition-colors"
                >
                  View Products ({displayProducts.length})
                </button>
              )}

              <div className="flex items-center justify-between gap-2 mt-1">
                <BrandReviewModal brandId={brand.id} brandName={brand.brandName} products={displayProducts} />
                <div className="flex items-center justify-center p-1.5 bg-white/10 rounded border border-white/15 text-xs text-white">
                  <CompareToggle id={brand.id} name={brand.brandName} type="brand" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <nav className="bg-navy border-t border-white/10 mt-1">
          <div className="max-w-[1080px] mx-auto px-5 md:px-7 flex gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "profile", label: "Profile" },
              { id: "products", label: `Products (${displayProducts.length})` },
              { id: "distributors", label: `Distributors (${distributors.length})` },
              { id: "retailers", label: `Retailers (${retailers.length})` },
              { id: "centres", label: `Stores & CSS (${serviceCentres.length})` },
              { id: "installers", label: `Certified Installers (${certifiedInstallers.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs md:text-sm font-medium border-b-[3px] whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "text-white border-amber font-semibold"
                    : "text-[#A9B6BF] border-transparent hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Tab Panels */}
      <main className="max-w-[1080px] mx-auto px-5 md:px-7 py-10 pb-28">
        
        {/* TAB 1: PROFILE / OVERVIEW */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
              
              {/* Left Column */}
              <div className="space-y-6">
                {/* About Card */}
                <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                  <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-3.5">
                    About {brand.brandName}
                  </h2>
                  <p className="text-sm text-ink leading-relaxed">
                    {brand.about || `${brand.brandName} is a verified manufacturer and technology partner in the Pakistan renewable energy sector.`}
                  </p>

                  {/* Facts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-line text-xs">
                    {brand.headquarters && (
                      <div>
                        <span className="text-slate-custom block text-[11px]">Headquarters</span>
                        <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                          {brand.headquarters}
                        </strong>
                      </div>
                    )}
                    
                    {brand.countryOfOrigin && (
                      <div>
                        <span className="text-slate-custom block text-[11px]">Country of origin</span>
                        <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                          {brand.countryOfOrigin}
                        </strong>
                      </div>
                    )}

                    {brand.website && (
                      <div>
                        <span className="text-slate-custom block text-[11px]">Official Website</span>
                        <a
                          href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            trackEngagement("brand_website_click", {
                              brandId: brand.id,
                              brandName: brand.brandName,
                              url: brand.website
                            });
                          }}
                          className="text-navy-deep font-semibold text-sm block mt-0.5 hover:underline truncate"
                        >
                          {brand.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}

                    {brand.globalLocations && (
                      <div>
                        <span className="text-slate-custom block text-[11px]">Global locations</span>
                        <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                          {brand.globalLocations}
                        </strong>
                      </div>
                    )}

                    {manufacturingFacilities.length > 0 && (
                      <div>
                        <span className="text-slate-custom block text-[11px]">Manufacturing facilities</span>
                        <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                          {manufacturingFacilities.length} {manufacturingFacilities.length === 1 ? "facility" : "facilities"}
                        </strong>
                      </div>
                    )}

                    {Array.isArray(brand.categories) && brand.categories.length > 0 && (
                      <div>
                        <span className="text-slate-custom block text-[11px]">Product categories</span>
                        <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                          {brand.categories.join(", ")}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Product Chips row (only if categories exist) */}
                  {Array.isArray(brand.categories) && brand.categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-line">
                      {brand.categories.map((chip: string, i: number) => (
                        <span
                          key={i}
                          className="bg-cream border border-line text-ink text-xs px-2.5 py-1 rounded-full"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Social row (only dynamic links) */}
                  <div className="flex gap-2.5 mt-5">
                    {brand.website && (
                      <a
                        href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Website"
                        className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-navy-deep hover:bg-amber transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {Array.isArray(brand.socialLinks) && brand.socialLinks.map((s: any, idx: number) => {
                      if (!s.url) return null;
                      return (
                        <a
                          key={idx}
                          href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.platform || "Social Link"}
                          className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-navy-deep hover:bg-amber transition-colors"
                        >
                          {s.platform?.toLowerCase() === "facebook" ? <Facebook className="w-4 h-4" /> :
                           s.platform?.toLowerCase() === "twitter" || s.platform?.toLowerCase() === "x" ? <Twitter className="w-4 h-4" /> :
                           s.platform?.toLowerCase() === "youtube" ? <Youtube className="w-4 h-4" /> :
                           <Linkedin className="w-4 h-4" />}
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Key Worldwide Projects Card (Only rendered if dynamic records exist) */}
                {worldwideProjects.length > 0 && (
                  <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                    <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-3.5">
                      Key Worldwide Projects
                    </h2>
                    <div className="space-y-3.5">
                      {worldwideProjects.map((p, idx) => (
                        <div key={idx} className="flex gap-3.5 pb-3.5 border-b border-line last:border-b-0 last:pb-0">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.title}
                              width={64}
                              height={48}
                              className="w-16 h-12 rounded-[2px] object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-[2px] bg-gradient-to-br from-navy to-navy-deep shrink-0 flex items-center justify-center text-white/50 text-[10px] font-mono font-bold">
                              Project
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-sm text-navy-deep">{p.title}</h4>
                            {p.location && (
                              <span className="text-[11px] text-amber-deep font-medium block mt-0.5">
                                {p.location}
                              </span>
                            )}
                            <p className="text-xs text-slate-custom mt-1 leading-relaxed">{p.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Dynamic Offices & Facilities */}
              <div className="space-y-6">
                
                {/* Offices Card */}
                {(offices.length > 0 || brand.headOffice || primaryPhone || primaryEmail) && (
                  <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm space-y-4">
                    <h3 className="font-fraunces text-base font-semibold text-navy-deep">Offices &amp; Contact</h3>
                    
                    {offices.map((office: any, idx: number) => (
                      <div key={idx} className="pb-4 border-b border-dashed border-line last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-xs text-navy-deep">
                            {office.name || office.type || "Regional Office"}
                          </span>
                          {office.mapUrl && (
                            <a
                              href={office.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11.5px] font-semibold text-amber-deep hover:underline"
                            >
                              View on map
                            </a>
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs text-ink">
                          {office.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                              <span>{office.address || office.city}</span>
                            </div>
                          )}
                          {office.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                              <a href={`tel:${office.phone}`} className="hover:underline">{office.phone}</a>
                            </div>
                          )}
                          {office.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                              <a href={`mailto:${office.email}`} className="hover:underline">{office.email}</a>
                            </div>
                          )}
                        </div>
                        {office.whatsapp && (
                          <a
                            href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20need%20information%20about%20${encodeURIComponent(brand.brandName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D5C] mt-2.5 hover:underline"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp
                          </a>
                        )}
                      </div>
                    ))}

                    {/* Global Head Office (if specified in brand) */}
                    {brand.headOffice && (
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-xs text-navy-deep">Head Office — Global</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink">
                          <MapPin className="w-3.5 h-3.5 text-amber-deep shrink-0" /> {brand.headOffice}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manufacturing Facility Card (Only rendered if actual facilities exist) */}
                {manufacturingFacilities.length > 0 && (
                  <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                    <h3 className="font-fraunces text-base font-semibold text-navy-deep mb-3">Manufacturing Facilities</h3>
                    <div className="space-y-3">
                      {manufacturingFacilities.map((facility: any, fIdx: number) => (
                        <div key={fIdx} className="border-b border-line last:border-b-0 pb-3 last:pb-0">
                          {facility.imageUrl ? (
                            <Image
                              src={facility.imageUrl}
                              alt={facility.name}
                              width={320}
                              height={112}
                              className="w-full h-28 object-cover rounded-[2px] mb-2"
                            />
                          ) : null}
                          <div className="font-semibold text-xs text-navy-deep">{facility.name}</div>
                          {facility.location && (
                            <div className="text-[11px] text-slate-custom mt-0.5">{facility.location}</div>
                          )}
                          {facility.description && (
                            <p className="text-xs text-slate-custom mt-1 leading-relaxed">{facility.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Annual Manufacturing Capacity Card (Only rendered if dynamic capacity exists) */}
                {brand.annualCapacity && typeof brand.annualCapacity === "object" && Object.values(brand.annualCapacity).some((v) => Boolean(v)) && (
                  <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                    <h3 className="font-fraunces text-base font-semibold text-navy-deep mb-3">Annual Manufacturing Capacity</h3>
                    <div className="space-y-2.5 text-xs">
                      {brand.annualCapacity.panels && (
                        <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                          <span className="text-slate-custom">Solar Panels</span>
                          <strong className="text-navy-deep font-semibold">{brand.annualCapacity.panels}</strong>
                        </div>
                      )}
                      {brand.annualCapacity.inverters && (
                        <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                          <span className="text-slate-custom">Inverters</span>
                          <strong className="text-navy-deep font-semibold">{brand.annualCapacity.inverters}</strong>
                        </div>
                      )}
                      {brand.annualCapacity.batteries && (
                        <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                          <span className="text-slate-custom">Batteries</span>
                          <strong className="text-navy-deep font-semibold">{brand.annualCapacity.batteries}</strong>
                        </div>
                      )}
                      {brand.annualCapacity.bess && (
                        <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                          <span className="text-slate-custom">BESS</span>
                          <strong className="text-navy-deep font-semibold">{brand.annualCapacity.bess}</strong>
                        </div>
                      )}
                      {brand.annualCapacity.breakers && (
                        <div className="flex justify-between">
                          <span className="text-slate-custom">Breakers</span>
                          <strong className="text-navy-deep font-semibold">{brand.annualCapacity.breakers}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Local Team Card (Only rendered if actual members exist) */}
            {team.length > 0 && (
              <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-1">Local Team</h2>
                <p className="text-xs text-slate-custom mb-5">
                  Regional contacts supporting installers and distributors in Pakistan.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sales Team */}
                  {team.filter((t: any) => t.department === "sales" || !t.department).length > 0 && (
                    <div>
                      <h4 className="text-[12.5px] font-semibold text-amber-deep uppercase tracking-wider pb-2 border-b-2 border-line mb-3">
                        Sales Team
                      </h4>
                      <div className="space-y-3">
                        {team.filter((t: any) => t.department === "sales" || !t.department).map((member: any, i: number) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <div className="w-9 h-9 rounded-full bg-cream border border-line flex items-center justify-center font-bold text-xs text-navy-deep shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-ink">{member.name}</span>
                                {member.linkedIn && (
                                  <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-navy-deep opacity-60 hover:opacity-100">
                                    <Linkedin className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-custom block mt-0.5">{member.role || member.designation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Team */}
                  {team.filter((t: any) => t.department === "technical").length > 0 && (
                    <div>
                      <h4 className="text-[12.5px] font-semibold text-amber-deep uppercase tracking-wider pb-2 border-b-2 border-line mb-3">
                        Technical Team
                      </h4>
                      <div className="space-y-3">
                        {team.filter((t: any) => t.department === "technical").map((member: any, i: number) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <div className="w-9 h-9 rounded-full bg-cream border border-line flex items-center justify-center font-bold text-xs text-navy-deep shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-ink">{member.name}</span>
                                {member.linkedIn && (
                                  <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-navy-deep opacity-60 hover:opacity-100">
                                    <Linkedin className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-custom block mt-0.5">{member.role || member.designation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* After-Sales Team */}
                  {team.filter((t: any) => t.department === "aftersales" || t.department === "afterSales").length > 0 && (
                    <div>
                      <h4 className="text-[12.5px] font-semibold text-amber-deep uppercase tracking-wider pb-2 border-b-2 border-line mb-3">
                        After-Sales Team
                      </h4>
                      <div className="space-y-3">
                        {team.filter((t: any) => t.department === "aftersales" || t.department === "afterSales").map((member: any, i: number) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <div className="w-9 h-9 rounded-full bg-cream border border-line flex items-center justify-center font-bold text-xs text-navy-deep shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-ink">{member.name}</span>
                              </div>
                              <span className="text-[11px] text-slate-custom block mt-0.5">{member.role || member.designation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Reviews Card (100% Dynamic from database) */}
            <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-5">
                <div>
                  <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-1">Customer Reviews</h2>
                  <p className="text-xs text-slate-custom">
                    {reviews.length > 0
                      ? "From verified customers and installers in Pakistan."
                      : "Be the first verified customer or installer to review this brand."}
                  </p>
                </div>
                <BrandReviewModal brandId={brand.id} brandName={brand.brandName} products={displayProducts} />
              </div>

              {actualReviewCount > 0 ? (
                <>
                  {/* Rating Summary Breakdown */}
                  <div className="flex gap-8 items-center flex-wrap pb-5 mb-5 border-b border-line">
                    <div className="text-center">
                      <div className="font-fraunces text-4xl font-semibold text-navy-deep leading-none">
                        {rating > 0 ? rating.toFixed(1) : "—"}
                      </div>
                      <div className="text-amber-deep text-sm mt-1">
                        {"★".repeat(Math.round(rating || 0)) + "☆".repeat(Math.max(0, 5 - Math.round(rating || 0)))}
                      </div>
                      <div className="text-xs text-slate-custom mt-0.5">
                        {actualReviewCount} {actualReviewCount === 1 ? "review" : "reviews"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-1.5 text-xs text-slate-custom">
                      {starCounts.map((row) => (
                        <div key={row.star} className="flex items-center gap-2">
                          <span className="w-3">{row.star}</span>
                          <div className="flex-1 h-1.5 bg-cream rounded-full overflow-hidden">
                            <div className="h-full bg-amber" style={{ width: `${row.pct}%` }} />
                          </div>
                          <span className="w-8 text-right">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="pb-4 border-b border-line last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="font-semibold text-xs text-navy-deep">
                              {rev.authorName || rev.author?.name || "Verified Customer"}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-custom">
                              <span className="text-amber-deep">{"★".repeat(rev.rating || 5)}</span>
                              <span>· {rev.city || "Pakistan"} {rev.productUsed ? `· ${rev.productUsed}` : ""}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-custom">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-ink mt-2 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center border-t border-line">
                  <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-navy-deep">No reviews yet for {brand.brandName}</p>
                  <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
                    Have you used {brand.brandName} solar products? Share your feedback to help the community.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCTS (100% Dynamic) */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Products</h2>
              <p className="text-xs text-slate-custom mt-1">
                {brand.brandName}'s official product catalog verified on EnergyGurus.
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by model or series"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-[3px] text-xs focus:outline-none focus:border-amber"
                />
              </div>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All categories</option>
                <option value="solar panels">Solar Panels</option>
                <option value="inverters">Inverters</option>
                <option value="batteries">Batteries</option>
                <option value="bess">BESS</option>
                <option value="breakers">Breakers</option>
              </select>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p, idx) => {
                  const specs = p.specs || {};

                  return (
                    <div key={idx} className="bg-white border border-line rounded-[3px] overflow-hidden flex flex-col shadow-sm">
                      {/* Media */}
                      <div className="h-36 bg-gradient-to-br from-navy to-navy-deep relative flex items-center justify-center p-3">
                        <span className="absolute top-2.5 left-2.5 text-[10.5px] font-semibold bg-white/90 text-navy-deep px-2.5 py-0.5 rounded-full">
                          {p.category || "Solar Equipment"}
                        </span>
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            width={140}
                            height={100}
                            className="object-contain max-h-28"
                          />
                        ) : (
                          <span className="text-white/40 font-mono text-xs">{p.name}</span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-fraunces font-bold text-base text-navy-deep">
                            {p.name}
                          </h3>
                          {p.series && (
                            <div className="text-xs text-slate-custom mt-0.5 mb-3">
                              {p.series}
                            </div>
                          )}

                          {p.description && (
                            <p className="text-xs text-slate-custom mt-1 mb-3 line-clamp-2">
                              {p.description}
                            </p>
                          )}

                          {/* Specs Grid (only if specs exist) */}
                          {Object.keys(specs).length > 0 && (
                            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                              {Object.entries(specs).slice(0, 4).map(([key, val]: [string, any], sIdx) => (
                                <div key={sIdx} className="text-slate-custom">
                                  <span>{key}</span>
                                  <strong className="block text-ink font-semibold mt-0.5">{val}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-line">
                          <div className="flex gap-2">
                            {cleanWhatsappNumber ? (
                              <a
                                href={`https://wa.me/${cleanWhatsappNumber}?text=Hi%2C%20I%20am%20interested%20in%20pricing%20for%20${encodeURIComponent(p.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-amber hover:bg-[#eab857] text-navy-deep font-semibold text-xs py-2 px-2.5 rounded-[3px] flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Click for Price
                              </a>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex-1 bg-amber hover:bg-[#eab857] text-navy-deep font-semibold text-xs py-2 px-2.5 rounded-[3px] flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Request Price
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-[4px] p-0 overflow-hidden border border-line text-ink bg-white">
                                  <div className="bg-navy-deep p-6 text-white">
                                    <h3 className="text-xl font-bold font-fraunces">Inquire about {p.name}</h3>
                                    <p className="text-paper/70 text-xs mt-1">Send a direct procurement inquiry for this model.</p>
                                  </div>
                                  <div className="p-6 bg-white">
                                    <ContactForm receiverId={brand.userId} receiverName={brand.brandName} />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {p.datasheetUrl && (
                              <a
                                href={p.datasheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-cream hover:bg-[#EFEADC] border border-line text-ink font-semibold text-xs py-2 px-2.5 rounded-[3px] flex items-center justify-center gap-1.5 transition-colors"
                              >
                                Datasheet
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-line rounded-[3px] p-10 text-center">
                <PackageX className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h3 className="font-semibold text-sm text-navy-deep">No products listed</h3>
                <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
                  {displayProducts.length === 0
                    ? `No product models have been uploaded for ${brand.brandName} yet.`
                    : "No products matched your search filter."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTHORIZED DISTRIBUTORS */}
        {activeTab === "distributors" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Authorized Distributors</h2>
              <p className="text-xs text-slate-custom mt-1">
                Official distribution partners authorized by {brand.brandName} in Pakistan.
              </p>
            </div>

            {/* Toolbar */}
            {distributors.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-custom absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by company or city"
                    value={distributorSearch}
                    onChange={(e) => setDistributorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-[3px] text-xs focus:outline-none focus:border-amber"
                  />
                </div>
              </div>
            )}

            {/* Entity List */}
            {filteredDistributors.length > 0 ? (
              <div className="bg-white border border-line rounded-[3px] divide-y divide-line overflow-hidden shadow-sm">
                {filteredDistributors.map((d, i) => (
                  <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                    <div className="flex-1 min-w-[240px]">
                      <h3 className="font-semibold text-sm text-navy-deep">{d.name}</h3>
                      <p className="text-xs text-slate-custom mt-0.5">{d.address || d.city}</p>
                    </div>
                    {d.region && (
                      <div className="text-xs">
                        <span className="text-slate-custom block text-[11px]">Region</span>
                        <strong className="text-ink font-semibold">{d.region}</strong>
                      </div>
                    )}
                    {d.since && (
                      <div className="text-xs">
                        <span className="text-slate-custom block text-[11px]">Since</span>
                        <strong className="text-ink font-semibold">{d.since}</strong>
                      </div>
                    )}
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#FBF0DA] text-[#96701A] px-2.5 py-0.5 rounded-full">
                        {d.status || "Authorized"}
                      </span>
                    </div>
                    {d.mapUrl && (
                      <div className="flex items-center gap-3 text-xs font-semibold text-navy-deep">
                        <a href={d.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View Map
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-line rounded-[3px] p-10 text-center">
                <Store className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h3 className="font-semibold text-sm text-navy-deep">No distributors listed</h3>
                <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
                  Official distributor network for {brand.brandName} will appear here once registered.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CERTIFIED RETAILERS */}
        {activeTab === "retailers" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Authorized Retailers</h2>
              <p className="text-xs text-slate-custom mt-1">
                Retail outlets authorized to sell genuine {brand.brandName} products directly to consumers.
              </p>
            </div>

            {filteredRetailers.length > 0 ? (
              <div className="bg-white border border-line rounded-[3px] divide-y divide-line overflow-hidden shadow-sm">
                {filteredRetailers.map((r, i) => (
                  <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                    <div className="flex-1 min-w-[240px]">
                      <h3 className="font-semibold text-sm text-navy-deep">{r.name}</h3>
                      <p className="text-xs text-slate-custom mt-0.5">{r.address || r.city}</p>
                    </div>
                    {r.type && (
                      <div className="text-xs">
                        <span className="text-slate-custom block text-[11px]">Type</span>
                        <strong className="text-ink font-semibold">{r.type}</strong>
                      </div>
                    )}
                    {r.since && (
                      <div className="text-xs">
                        <span className="text-slate-custom block text-[11px]">Since</span>
                        <strong className="text-ink font-semibold">{r.since}</strong>
                      </div>
                    )}
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EEF0F2] text-[#54606A] px-2.5 py-0.5 rounded-full">
                        {r.status || "Authorized"}
                      </span>
                    </div>
                    {r.mapUrl && (
                      <a href={r.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-navy-deep hover:underline">
                        View Map
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-line rounded-[3px] p-10 text-center">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h3 className="font-semibold text-sm text-navy-deep">No retailers listed</h3>
                <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
                  Authorized retail outlets for {brand.brandName} will appear here once verified.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FLAGSHIP STORES & CSS */}
        {activeTab === "centres" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Flagship Stores &amp; Customer Service Centres</h2>
              <p className="text-xs text-slate-custom mt-1">
                Official locations for product demonstrations, warranty claims, and technical service.
              </p>
            </div>

            {serviceCentres.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {serviceCentres.map((c, i) => (
                  <div key={i} className="bg-white border border-line rounded-[3px] p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-navy-deep">{c.name}</h3>
                      <div className="text-xs font-semibold text-amber-deep mt-0.5 mb-2">{c.area || c.city}</div>
                      <p className="text-xs text-slate-custom mb-3 leading-relaxed">{c.address}</p>
                      
                      {Array.isArray(c.tags || c.services) && (
                        <div className="flex gap-1.5 flex-wrap mb-4">
                          {(c.tags || c.services).map((tag: string, tIdx: number) => (
                            <span key={tIdx} className="text-[11px] bg-cream border border-line text-ink px-2.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-dashed border-line flex justify-between items-center text-xs">
                      <span className="text-slate-custom">{c.hours || "Official Operating Hours"}</span>
                      {c.mapUrl && (
                        <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-deep hover:underline">
                          Get Directions
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-line rounded-[3px] p-10 text-center">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h3 className="font-semibold text-sm text-navy-deep">No service centres registered</h3>
                <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
                  Customer service centres and flagship stores will be listed here once submitted by {brand.brandName}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CERTIFIED INSTALLERS */}
        {activeTab === "installers" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Certified Installers</h2>
              <p className="text-xs text-slate-custom mt-1">
                Installers certified by {brand.brandName} to deploy their product ecosystem.
              </p>
            </div>

            {filteredInstallers.length > 0 ? (
              <div className="bg-white border border-line rounded-[3px] divide-y divide-line overflow-hidden shadow-sm">
                {filteredInstallers.map((inst, i) => (
                  <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                    <div className="flex-1 min-w-[240px]">
                      <h3 className="font-semibold text-sm text-navy-deep">{inst.installerName || inst.name}</h3>
                      <p className="text-xs text-slate-custom mt-0.5">{inst.city || "Pakistan"}</p>
                    </div>
                    {inst.rating && (
                      <div className="text-xs">
                        <span className="text-slate-custom block text-[11px]">Rating</span>
                        <strong className="text-ink font-semibold flex items-center gap-1">
                          <span className="text-amber-deep">★</span> {inst.rating}
                        </strong>
                      </div>
                    )}
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FBF0DA] text-[#96701A]">
                        {inst.tier || "Certified"} Installer
                      </span>
                    </div>
                    {inst.installerId || inst.slug ? (
                      <Link
                        href={`/epcs/${inst.installerId || inst.slug}`}
                        className="text-xs font-semibold text-navy-deep hover:underline"
                      >
                        View Profile
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-line rounded-[3px] p-10 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <h3 className="font-semibold text-sm text-navy-deep">No certified installers listed</h3>
                <p className="text-xs text-slate-custom mt-1 max-w-sm mx-auto">
                  Certified EPC installers authorized for {brand.brandName} will appear here once vetted.
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
