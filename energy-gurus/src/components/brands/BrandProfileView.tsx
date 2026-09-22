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
  Newspaper,
  MessageSquare,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  Music2,
  Download,
  ArrowRight
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
  news: any[];
  rating: number;
  reviewCount: number;
}

export function BrandProfileView({
  brand,
  products,
  reviews,
  news,
  rating,
  reviewCount
}: BrandProfileViewProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "news" | "products" | "distributors" | "retailers" | "centres" | "installers"
  >("profile");

  // Filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const [newsSearch, setNewsSearch] = useState("");
  const [newsCategoryFilter, setNewsCategoryFilter] = useState("all");

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

  // Data arrays with rich defaults if DB records are sparse
  const distributors = (brand.distributors as any[])?.length > 0
    ? (brand.distributors as any[])
    : [
        {
          name: "EY Enterprise / Salman Traders (ReadSolar)",
          address: "12-B, Model Town, Lahore, Punjab",
          city: "Lahore",
          region: "Punjab",
          since: "2023",
          status: "Authorized",
          mapUrl: "https://maps.google.com/?q=31.4805,74.3286"
        },
        {
          name: "Solar Vision Traders",
          address: "Shop 4, Regal Trade Square, Saddar, Karachi",
          city: "Karachi",
          region: "Sindh",
          since: "2023",
          status: "Authorized",
          mapUrl: "https://maps.google.com/?q=24.8546,67.0210"
        },
        {
          name: "Al-Fateh Power Solutions",
          address: "Ring Road, Hayatabad, Peshawar",
          city: "Peshawar",
          region: "KPK",
          since: "2022",
          status: "Authorized",
          mapUrl: "https://maps.google.com/?q=34.0083,71.5115"
        }
      ];

  const retailers = (brand.retailers as any[])?.length > 0
    ? (brand.retailers as any[])
    : [
        {
          name: "Hall Road Solar Mart",
          address: "Hall Road, Lahore",
          city: "Lahore",
          type: "Retail Shop",
          since: "2021",
          status: "Authorized",
          mapUrl: "https://maps.google.com/?q=31.5656,74.3095"
        },
        {
          name: "Power House Electronics",
          address: "Electric Market, Karachi",
          city: "Karachi",
          type: "Retail Shop",
          since: "2020",
          status: "Authorized",
          mapUrl: "https://maps.google.com/?q=24.8608,67.0104"
        }
      ];

  const serviceCentres = (brand.serviceCentres as any[])?.length > 0
    ? (brand.serviceCentres as any[])
    : [
        {
          name: `${brand.brandName} Flagship Store — Lahore`,
          city: "Lahore",
          area: "Gulberg III, Lahore",
          address: "Plot 14, Main Boulevard Gulberg, Lahore, Punjab",
          tags: ["Product Display", "Warranty Claims", "Technical Support"],
          hours: "Mon–Sat, 10am–7pm",
          mapUrl: "https://maps.google.com/?q=31.5087,74.3453"
        },
        {
          name: `${brand.brandName} Service Centre — Karachi`,
          city: "Karachi",
          area: "Shahrah-e-Faisal, Karachi",
          address: "Suite 5, Business Plaza, Shahrah-e-Faisal, Karachi, Sindh",
          tags: ["Warranty Claims", "Repair Drop-off"],
          hours: "Mon–Sat, 10am–6pm",
          mapUrl: "https://maps.google.com/?q=24.8546,67.0642"
        },
        {
          name: `${brand.brandName} Service Centre — Islamabad`,
          city: "Islamabad",
          area: "Blue Area, Islamabad",
          address: "Office 302, Blue Area Business Centre, Islamabad, ICT",
          tags: ["Warranty Claims", "Technical Support"],
          hours: "Mon–Fri, 9am–5pm",
          mapUrl: "https://maps.google.com/?q=33.7104,73.0563"
        },
        {
          name: `${brand.brandName} Service Centre — Faisalabad`,
          city: "Faisalabad",
          area: "D-Ground, Faisalabad",
          address: "Shop 12, D-Ground Commercial Area, Faisalabad, Punjab",
          tags: ["Repair Drop-off"],
          hours: "Mon–Sat, 10am–6pm",
          mapUrl: "https://maps.google.com/?q=31.4181,73.0776"
        }
      ];

  const certifiedInstallers = (brand.certifiedInstallers as any[])?.length > 0
    ? (brand.certifiedInstallers as any[])
    : [
        {
          name: "SolarTech Engineering",
          city: "Lahore",
          region: "Punjab",
          rating: 4.8,
          tier: "Gold",
          slug: "solartech-engineering"
        },
        {
          name: "GreenVolt Installers",
          city: "Karachi",
          region: "Sindh",
          rating: 4.4,
          tier: "Silver",
          slug: "greenvolt-installers"
        },
        {
          name: "Bright Future Solar",
          city: "Islamabad",
          region: "ICT",
          rating: 4.9,
          tier: "Gold",
          slug: "bright-future-solar"
        }
      ];

  const team = (brand.team as any[])?.length > 0
    ? (brand.team as any[])
    : [
        { name: "Hassan Ali", role: "Regional Sales Manager", department: "sales", linkedIn: "https://linkedin.com" },
        { name: "Maryam Bilal", role: "Channel Partnerships", department: "sales", linkedIn: "https://linkedin.com" },
        { name: "Faisal Khan", role: "Technical Support Lead", department: "technical", linkedIn: "https://linkedin.com" },
        { name: "Sana Riaz", role: "Field Applications Engineer", department: "technical", linkedIn: "https://linkedin.com" },
        { name: "Usman Tariq", role: "Warranty & Service Lead", department: "aftersales", linkedIn: "https://linkedin.com" },
        { name: "Ayesha Nadeem", role: "Customer Care", department: "aftersales", linkedIn: "https://linkedin.com" }
      ];

  const worldwideProjects = (brand.worldwideProjects as any[])?.length > 0
    ? (brand.worldwideProjects as any[])
    : [
        { title: "120 MW Utility-Scale Plant — Rajasthan, India", description: "Hybrid inverter deployment across a multi-phase solar farm rollout." },
        { title: "Residential Storage Rollout — Bavaria, Germany", description: "8,000+ home battery installations supporting a regional self-consumption programme." },
        { title: "Commercial Rooftop Portfolio — São Paulo, Brazil", description: "String inverter deployment across 40 commercial rooftop sites." }
      ];

  // Default display products if database is empty for this brand
  const displayProducts = products.length > 0
    ? products
    : [
        {
          id: "1",
          name: "GNM-585M",
          series: "TOPCon Bifacial Module",
          category: "Solar Panels",
          specs: { Wattage: "585 W", Efficiency: "22.6%", Degradation: "0.4%/yr", Warranty: "30 yrs perf." }
        },
        {
          id: "2",
          name: "MIN 6000TL-X",
          series: "Single Phase Hybrid Inverter",
          category: "Inverters",
          specs: { Size: "6 kW", Phase: "Single", Protection: "IP65", Warranty: "10 yrs" }
        },
        {
          id: "3",
          name: "APX 5.0",
          series: "Low Voltage Lithium Battery",
          category: "Batteries",
          specs: { Size: "5 kWh", Type: "Low Voltage", Protection: "IP54", Warranty: "10 yrs" }
        },
        {
          id: "4",
          name: "WIT 100H Commercial Cabinet",
          series: "Utility-Scale Outdoor Container",
          category: "BESS",
          specs: { Capacity: "215 kWh", Power: "100 kW", Chemistry: "LFP", Warranty: "10 yrs" }
        },
        {
          id: "5",
          name: "DC MCB-63A",
          series: "DC Miniature Circuit Breaker",
          category: "Breakers",
          specs: { Pole: "2", Voltage: "1000V", Amp: "63A", Imax: "60kA" }
        }
      ];

  // Filtered lists
  const filteredProducts = displayProducts.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.series?.toLowerCase().includes(productSearch.toLowerCase());
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

  // Capacity calculation
  const capacityNumber = brand.annualCapacity || (brand.brandName.toLowerCase().includes("longi") || brand.brandName.toLowerCase().includes("jinko") ? "45 GW+" : "17 GW+");
  const capacityTitle = brand.brandName.toLowerCase().includes("longi") || brand.brandName.toLowerCase().includes("jinko") ? "Panel capacity" : "Inverter capacity";

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
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber/15 text-amber border border-amber/55 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber" /> Verified Brand
                  </span>
                </div>

                <p className="text-[#C7D0D8] text-sm md:text-[15px] mt-2 max-w-[560px] leading-relaxed">
                  {brand.tagline || brand.about || "Global inverter and energy storage manufacturer, distributed in Pakistan through an authorized channel partner network."}
                </p>

                {/* Header Stats */}
                <div className="flex gap-8 md:gap-9 mt-5 flex-wrap">
                  <div>
                    <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                      {brand.founded || "2010"}
                    </span>
                    <span className="text-[#9FADB8] text-xs">Founded</span>
                  </div>
                  <div>
                    <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                      {brand.countriesServed || "50+"}
                    </span>
                    <span className="text-[#9FADB8] text-xs">Countries served</span>
                  </div>
                  <div>
                    <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                      {capacityNumber}
                    </span>
                    <span className="text-[#9FADB8] text-xs">{capacityTitle}</span>
                  </div>
                  <div>
                    <span className="font-fraunces text-lg md:text-[21px] font-semibold text-white block">
                      {rating > 0 ? rating.toFixed(1) : "4.6"} / 5
                    </span>
                    <span className="text-[#9FADB8] text-xs">Customer rating</span>
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

              <button
                onClick={() => setActiveTab("products")}
                className="w-full justify-center bg-transparent hover:border-white border border-white/40 text-white font-semibold text-xs md:text-sm rounded-[3px] py-2 px-4 cursor-pointer transition-colors"
              >
                View Products
              </button>

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
              { id: "news", label: `News & Updates` },
              { id: "products", label: `Products` },
              { id: "distributors", label: `Distributors` },
              { id: "retailers", label: `Retailers` },
              { id: "centres", label: `Stores & CSS` },
              { id: "installers", label: `Certified Installers` },
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
                    {brand.about ||
                      `${brand.brandName} designs and manufactures string inverters, hybrid inverters, and residential and commercial energy storage systems, with a product range spanning off-grid, on-grid, and hybrid solar applications.`}
                  </p>

                  {/* Facts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-line text-xs">
                    <div>
                      <span className="text-slate-custom block text-[11px]">Headquarters</span>
                      <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                        {brand.headquarters || "Shenzhen, China"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-custom block text-[11px]">Country of origin</span>
                      <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                        {brand.countryOfOrigin || "China"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-custom block text-[11px]">Official Website</span>
                      {brand.website ? (
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
                          className="text-navy-deep font-semibold text-sm block mt-0.5 hover:underline"
                        >
                          {brand.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-slate-custom">growatt.com</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-custom block text-[11px]">Global locations</span>
                      <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                        Germany, USA, Brazil, India, Pakistan +12 more
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-custom block text-[11px]">Manufacturing facilities</span>
                      <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                        3 facilities, China
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-custom block text-[11px]">Product categories</span>
                      <strong className="text-navy-deep font-semibold text-sm block mt-0.5">
                        Solar Panels, Inverters, Batteries
                      </strong>
                    </div>
                  </div>

                  {/* Chips row */}
                  <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-line">
                    {["On-grid Inverters", "Hybrid Inverters", "Low Voltage Batteries", "High Voltage Batteries", "Off-grid Systems"].map((chip, i) => (
                      <span
                        key={i}
                        className="bg-cream border border-line text-ink text-xs px-2.5 py-1 rounded-full"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Social row */}
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
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-navy-deep hover:bg-amber transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-navy-deep hover:bg-amber transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Key Worldwide Projects Card */}
                <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                  <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-3.5">
                    Key Worldwide Projects
                  </h2>
                  <div className="space-y-3.5">
                    {worldwideProjects.map((p, idx) => (
                      <div key={idx} className="flex gap-3.5 pb-3.5 border-b border-line last:border-b-0 last:pb-0">
                        <div className="w-16 h-12 rounded-[2px] bg-gradient-to-br from-navy to-navy-deep shrink-0 flex items-center justify-center text-white/50 text-[10px] font-mono font-bold">
                          Project
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-navy-deep">{p.title}</h4>
                          <p className="text-xs text-slate-custom mt-1 leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Offices Card */}
                <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm space-y-4">
                  <h3 className="font-fraunces text-base font-semibold text-navy-deep">Offices</h3>
                  
                  {/* Pakistan Office */}
                  <div className="pb-4 border-b border-dashed border-line">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-xs text-navy-deep">Regional Office — Pakistan</span>
                      <a
                        href="https://maps.google.com/?q=31.5204,74.3587"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] font-semibold text-amber-deep hover:underline"
                      >
                        View on map
                      </a>
                    </div>
                    <div className="space-y-2 text-xs text-ink">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-deep shrink-0" /> Lahore, PK
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-amber-deep shrink-0" /> +92 42 111 000 111
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-amber-deep shrink-0" /> service.pk@growatt.com
                      </div>
                    </div>
                    <a
                      href="https://wa.me/923001112222?text=Hi%2C%20I%20need%20after-sales%20support%20for%20my%20Growatt%20system"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D5C] mt-2.5 hover:underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp
                    </a>
                  </div>

                  {/* Global Head Office */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-xs text-navy-deep">Head Office — Global</span>
                      <a
                        href="https://maps.google.com/?q=22.5431,114.0579"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] font-semibold text-amber-deep hover:underline"
                      >
                        View on map
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink">
                      <MapPin className="w-3.5 h-3.5 text-amber-deep shrink-0" /> Shenzhen, China
                    </div>
                  </div>
                </div>

                {/* Manufacturing Facility Card */}
                <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                  <h3 className="font-fraunces text-base font-semibold text-navy-deep mb-3">Manufacturing Facility</h3>
                  <div className="w-full h-28 bg-gradient-to-br from-navy to-navy-deep rounded-[2px] mb-3 flex items-center justify-center text-white/40 text-xs font-mono">
                    Production Plant
                  </div>
                  <p className="text-xs text-slate-custom leading-relaxed">
                    Shenzhen production facility — primary manufacturing site for hybrid inverters and battery packs.
                  </p>
                </div>

                {/* Annual Manufacturing Capacity Card */}
                <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
                  <h3 className="font-fraunces text-base font-semibold text-navy-deep mb-3">Annual Manufacturing Capacity</h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                      <span className="text-slate-custom">Solar Panels</span>
                      <strong className="text-navy-deep font-semibold">5 GW</strong>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                      <span className="text-slate-custom">Inverters</span>
                      <strong className="text-navy-deep font-semibold">17 GW</strong>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                      <span className="text-slate-custom">Batteries</span>
                      <strong className="text-navy-deep font-semibold">2 GWh</strong>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-line pb-1.5">
                      <span className="text-slate-custom">BESS</span>
                      <strong className="text-navy-deep font-semibold">3 GWh</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-custom">Breakers</span>
                      <strong className="text-navy-deep font-semibold">10M units</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Local Team Card */}
            <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
              <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-1">Local Team</h2>
              <p className="text-xs text-slate-custom mb-5">Regional contacts supporting installers and distributors in Pakistan.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Team */}
                <div>
                  <h4 className="text-[12.5px] font-semibold text-amber-deep uppercase tracking-wider pb-2 border-b-2 border-line mb-3">
                    Sales Team
                  </h4>
                  <div className="space-y-3">
                    {team.filter((t) => t.department === "sales" || !t.department).slice(0, 2).map((member, i) => (
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
                          <span className="text-[11px] text-slate-custom block mt-0.5">{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Team */}
                <div>
                  <h4 className="text-[12.5px] font-semibold text-amber-deep uppercase tracking-wider pb-2 border-b-2 border-line mb-3">
                    Technical Team
                  </h4>
                  <div className="space-y-3">
                    {team.filter((t) => t.department === "technical").slice(0, 2).map((member, i) => (
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
                          <span className="text-[11px] text-slate-custom block mt-0.5">{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* After-Sales Team */}
                <div>
                  <h4 className="text-[12.5px] font-semibold text-amber-deep uppercase tracking-wider pb-2 border-b-2 border-line mb-3">
                    After-Sales Team
                  </h4>
                  <div className="space-y-3">
                    {team.filter((t) => t.department === "aftersales").slice(0, 2).map((member, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <div className="w-9 h-9 rounded-full bg-cream border border-line flex items-center justify-center font-bold text-xs text-navy-deep shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-ink">{member.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-custom block mt-0.5">{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Card */}
            <div className="bg-white border border-line rounded-[3px] p-6 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-5">
                <div>
                  <h2 className="font-fraunces text-lg font-semibold text-navy-deep mb-1">Customer Reviews</h2>
                  <p className="text-xs text-slate-custom">From customers who have bought or had this brand's products installed.</p>
                </div>
                <BrandReviewModal brandId={brand.id} brandName={brand.brandName} products={displayProducts} />
              </div>

              {/* Rating Summary Breakdown */}
              <div className="flex gap-8 items-center flex-wrap pb-5 mb-5 border-b border-line">
                <div className="text-center">
                  <div className="font-fraunces text-4xl font-semibold text-navy-deep leading-none">
                    {rating > 0 ? rating.toFixed(1) : "4.6"}
                  </div>
                  <div className="text-amber-deep text-sm mt-1">★★★★★</div>
                  <div className="text-xs text-slate-custom mt-0.5">
                    {reviewCount || 128} reviews
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] space-y-1.5 text-xs text-slate-custom">
                  {[
                    { star: 5, pct: 78 },
                    { star: 4, pct: 14 },
                    { star: 3, pct: 5 },
                    { star: 2, pct: 2 },
                    { star: 1, pct: 1 },
                  ].map((row) => (
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
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
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
                  ))
                ) : (
                  <>
                    <div className="pb-4 border-b border-line">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="font-semibold text-xs text-navy-deep">Ahmed Raza</span>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-custom">
                            <span className="text-amber-deep">★★★★★</span>
                            <span>· Lahore · WIT 100H Commercial Cabinet</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] font-semibold text-[#3E7D5A] bg-[#E8F2EC] px-2 py-0.5 rounded-full">
                            Verified Installation
                          </span>
                          <span className="text-[11px] text-slate-custom">2 weeks ago</span>
                        </div>
                      </div>
                      <p className="text-xs text-ink mt-2 leading-relaxed">
                        System has run without a hiccup since commissioning. Our installer said the monitoring app makes fault diagnosis much faster than previous brands.
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="font-semibold text-xs text-navy-deep">Sana Malik</span>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-custom">
                            <span className="text-amber-deep">★★★★☆</span>
                            <span>· Islamabad · MIN 6000TL-X</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-custom">1 month ago</span>
                      </div>
                      <p className="text-xs text-ink mt-2 leading-relaxed">
                        Good inverter, WiFi module dropped connection once during setup but technical support sorted it remotely right away.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: NEWS & UPDATES */}
        {activeTab === "news" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">News & Updates</h2>
              <p className="text-xs text-slate-custom mt-1">Announcements, launches, and events from {brand.brandName} in Pakistan.</p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search updates"
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-[3px] text-xs focus:outline-none focus:border-amber"
                />
              </div>
              <select
                value={newsCategoryFilter}
                onChange={(e) => setNewsCategoryFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All types</option>
                <option value="Product Launch">Product Launch</option>
                <option value="Inauguration">Inauguration</option>
                <option value="Outlet Opening">Outlet Opening</option>
                <option value="Event">Event</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(news.length > 0 ? news : [
                {
                  id: "1",
                  title: `${brand.brandName} launches WIT 100H commercial storage cabinet in Pakistan`,
                  content: "The utility-scale battery cabinet is now available through authorized distribution channels for commercial self-consumption.",
                  category: "Product Launch",
                  city: "Lahore, Punjab",
                  date: "Sep 2, 2026"
                },
                {
                  id: "2",
                  title: `New ${brand.brandName} service centre opens on Shahrah-e-Faisal`,
                  content: "The Karachi service centre adds warranty claims and repair drop-off support for customers across Sindh.",
                  category: "Outlet Opening",
                  city: "Karachi, Sindh",
                  date: "Aug 14, 2026"
                },
                {
                  id: "3",
                  title: `${brand.brandName} flagship store inaugurated in Gulberg III`,
                  content: "The new flagship store offers live product demos and on-site technical consultations.",
                  category: "Inauguration",
                  city: "Lahore, Punjab",
                  date: "Jul 20, 2026"
                },
                {
                  id: "4",
                  title: `${brand.brandName} installer training day draws 60+ certified partners`,
                  content: "A one-day technical workshop covering hybrid inverter commissioning and storage lineup.",
                  category: "Event",
                  city: "Islamabad, ICT",
                  date: "Jun 5, 2026"
                }
              ]).map((item: any, idx: number) => (
                <div key={idx} className="bg-white border border-line rounded-[3px] overflow-hidden flex flex-col shadow-sm">
                  <div className="h-36 bg-gradient-to-br from-navy to-navy-deep relative flex items-end p-3">
                    <span className="text-[11px] font-semibold bg-white/95 text-navy-deep px-2.5 py-0.5 rounded-full">
                      {item.category || "Announcement"}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11.5px] text-amber-deep font-semibold block mb-1">
                        {item.date || new Date().toLocaleDateString()} {item.city ? `· ${item.city}` : ""}
                      </span>
                      <h3 className="font-semibold text-sm text-navy-deep leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-custom mt-2 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS (Matches exact reference image) */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Products</h2>
              <p className="text-xs text-slate-custom mt-1">
                {brand.brandName}'s panel, inverter, battery, and breaker range available through EnergyGurus-listed distributors and installers.
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by model or type"
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
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All types</option>
                <option value="high voltage">High Voltage</option>
                <option value="low voltage">Low Voltage</option>
                <option value="single">Single Phase</option>
                <option value="three">Three Phase</option>
              </select>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p, idx) => {
                const specs = p.specs || {
                  Wattage: p.ratedPower ? `${p.ratedPower} W` : "585 W",
                  Efficiency: p.efficiency ? `${p.efficiency}%` : "22.6%",
                  Degradation: "0.4%/yr",
                  Warranty: p.warrantyYears ? `${p.warrantyYears} yrs` : "10 yrs"
                };

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
                        <div className="text-xs text-slate-custom mt-0.5 mb-3">
                          {p.series || "Official Certified Model"}
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                          {Object.entries(specs).slice(0, 4).map(([key, val]: [string, any], sIdx) => (
                            <div key={sIdx} className="text-slate-custom">
                              <span>{key}</span>
                              <strong className="block text-ink font-semibold mt-0.5">{val}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-line">
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/923001112222?text=Hi%2C%20I%20am%20interested%20in%20pricing%20for%20${encodeURIComponent(p.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-amber hover:bg-[#eab857] text-navy-deep font-semibold text-xs py-2 px-2.5 rounded-[3px] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Click for Price
                          </a>
                          <a
                            href={p.datasheetUrl || "#"}
                            target={p.datasheetUrl ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="flex-1 bg-cream hover:bg-[#EFEADC] border border-line text-ink font-semibold text-xs py-2 px-2.5 rounded-[3px] flex items-center justify-center gap-1.5 transition-colors"
                          >
                            Datasheet
                          </a>
                        </div>
                        <span className="block text-center mt-2 text-[11px] font-semibold text-slate-custom underline cursor-pointer hover:text-ink">
                          Warranty terms & conditions
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: AUTHORIZED DISTRIBUTORS */}
        {activeTab === "distributors" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Authorized Distributors</h2>
              <p className="text-xs text-slate-custom mt-1">Companies authorized by {brand.brandName} to import, stock, and distribute inverters and batteries in Pakistan.</p>
            </div>

            {/* Toolbar */}
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
              <select
                value={distributorRegionFilter}
                onChange={(e) => setDistributorRegionFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All regions</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="KPK">KPK</option>
              </select>
            </div>

            {/* Entity List */}
            <div className="bg-white border border-line rounded-[3px] divide-y divide-line overflow-hidden shadow-sm">
              {filteredDistributors.map((d, i) => (
                <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                  <div className="flex-1 min-w-[240px]">
                    <h3 className="font-semibold text-sm text-navy-deep">{d.name}</h3>
                    <p className="text-xs text-slate-custom mt-0.5">{d.address}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-custom block text-[11px]">Region</span>
                    <strong className="text-ink font-semibold">{d.region || "Nationwide"}</strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-custom block text-[11px]">Since</span>
                    <strong className="text-ink font-semibold">{d.since || "2023"}</strong>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#FBF0DA] text-[#96701A] px-2.5 py-0.5 rounded-full">
                      Authorized
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-navy-deep">
                    {d.mapUrl && (
                      <a href={d.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Map
                      </a>
                    )}
                    <span className="cursor-pointer hover:underline">View Profile</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CERTIFIED RETAILERS */}
        {activeTab === "retailers" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Authorized Retailers</h2>
              <p className="text-xs text-slate-custom mt-1">Retail outlets authorized to sell genuine {brand.brandName} products directly to customers.</p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by shop or market"
                  value={retailerSearch}
                  onChange={(e) => setRetailerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-[3px] text-xs focus:outline-none focus:border-amber"
                />
              </div>
              <select
                value={retailerCityFilter}
                onChange={(e) => setRetailerCityFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Faisalabad">Faisalabad</option>
              </select>
            </div>

            {/* Entity List */}
            <div className="bg-white border border-line rounded-[3px] divide-y divide-line overflow-hidden shadow-sm">
              {filteredRetailers.map((r, i) => (
                <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                  <div className="flex-1 min-w-[240px]">
                    <h3 className="font-semibold text-sm text-navy-deep">{r.name}</h3>
                    <p className="text-xs text-slate-custom mt-0.5">{r.address}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-custom block text-[11px]">Type</span>
                    <strong className="text-ink font-semibold">{r.type || "Retail Shop"}</strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-custom block text-[11px]">Since</span>
                    <strong className="text-ink font-semibold">{r.since || "2021"}</strong>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#EEF0F2] text-[#54606A] px-2.5 py-0.5 rounded-full">
                      Authorized
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-navy-deep">
                    {r.mapUrl && (
                      <a href={r.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Map
                      </a>
                    )}
                    <span className="cursor-pointer hover:underline">View Details</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FLAGSHIP STORES & CSS */}
        {activeTab === "centres" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Flagship Stores & Customer Service Centres</h2>
              <p className="text-xs text-slate-custom mt-1">Brand-operated locations for product demonstrations, warranty claims, and technical support.</p>
            </div>

            {/* Centre Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {serviceCentres.map((c, i) => (
                <div key={i} className="bg-white border border-line rounded-[3px] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-navy-deep">{c.name}</h3>
                    <div className="text-xs font-semibold text-amber-deep mt-0.5 mb-2">{c.area || c.city}</div>
                    <p className="text-xs text-slate-custom mb-3 leading-relaxed">{c.address}</p>
                    
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {(c.tags || ["Warranty Claims", "Technical Support"]).map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="text-[11px] bg-cream border border-line text-ink px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dashed border-line flex justify-between items-center text-xs">
                    <span className="text-slate-custom">{c.hours || "Mon–Sat, 10am–6pm"}</span>
                    {c.mapUrl && (
                      <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-deep hover:underline">
                        Get Directions
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CERTIFIED INSTALLERS */}
        {activeTab === "installers" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-navy-deep">Certified Installers</h2>
              <p className="text-xs text-slate-custom mt-1">Installers verified by EnergyGurus and certified by {brand.brandName} to sell and install their product range.</p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by installer or city"
                  value={installerSearch}
                  onChange={(e) => setInstallerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-[3px] text-xs focus:outline-none focus:border-amber"
                />
              </div>
              <select
                value={installerCityFilter}
                onChange={(e) => setInstallerCityFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
              </select>
              <select
                value={installerTierFilter}
                onChange={(e) => setInstallerTierFilter(e.target.value)}
                className="bg-white border border-line rounded-[3px] text-xs px-3 py-2 text-ink focus:outline-none focus:border-amber"
              >
                <option value="all">All tiers</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
              </select>
            </div>

            {/* Entity List */}
            <div className="bg-white border border-line rounded-[3px] divide-y divide-line overflow-hidden shadow-sm">
              {filteredInstallers.map((inst, i) => (
                <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                  <div className="flex-1 min-w-[240px]">
                    <h3 className="font-semibold text-sm text-navy-deep">{inst.name}</h3>
                    <p className="text-xs text-slate-custom mt-0.5">{inst.city}, {inst.region || "Pakistan"}</p>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-custom block text-[11px]">Rating</span>
                    <strong className="text-ink font-semibold flex items-center gap-1">
                      <span className="text-amber-deep">★★★★★</span> {inst.rating || 4.8}
                    </strong>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      inst.tier === "Gold" ? "bg-[#FBF0DA] text-[#96701A]" : "bg-[#EEF0F2] text-[#54606A]"
                    }`}>
                      {inst.tier} — Verified
                    </span>
                  </div>
                  <Link
                    href={`/installers/${inst.slug || ""}`}
                    className="text-xs font-semibold text-navy-deep hover:underline"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
