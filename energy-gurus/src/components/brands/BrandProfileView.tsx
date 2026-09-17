"use client";

import { useState } from "react";
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
  Download
} from "lucide-react";
import { BrandReviewModal } from "@/components/brands/BrandReviewModal";
import { CompareToggle } from "@/components/shared/compare-toggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/contact-form";

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
    "overview" | "products" | "news" | "distributors" | "installers" | "retailers" | "centres" | "reviews"
  >("overview");

  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [distributorSearch, setDistributorSearch] = useState("");
  const [retailerSearch, setRetailerSearch] = useState("");
  const [centreSearch, setCentreSearch] = useState("");

  const distributors = (brand.distributors as any[]) || [];
  const retailers = (brand.retailers as any[]) || [];
  const serviceCentres = (brand.serviceCentres as any[]) || [];
  const certifiedInstallers = (brand.certifiedInstallers as any[]) || [];
  const team = (brand.team as any[]) || (brand.reps as any[]) || [];
  const socialLinks = (brand.socialLinks as any[]) || [];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.series?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === "all" ||
      p.category?.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // Filter distributors
  const filteredDistributors = distributors.filter(
    (d) =>
      !distributorSearch ||
      d.name?.toLowerCase().includes(distributorSearch.toLowerCase()) ||
      d.city?.toLowerCase().includes(distributorSearch.toLowerCase()) ||
      d.territory?.toLowerCase().includes(distributorSearch.toLowerCase())
  );

  // Filter retailers
  const filteredRetailers = retailers.filter(
    (r) =>
      !retailerSearch ||
      r.name?.toLowerCase().includes(retailerSearch.toLowerCase()) ||
      r.city?.toLowerCase().includes(retailerSearch.toLowerCase())
  );

  // Filter service centres
  const filteredCentres = serviceCentres.filter(
    (c) =>
      !centreSearch ||
      c.name?.toLowerCase().includes(centreSearch.toLowerCase()) ||
      c.city?.toLowerCase().includes(centreSearch.toLowerCase())
  );

  const productCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="bg-cream text-ink min-h-screen">
      
      {/* Top Minimal Breadcrumb Bar */}
      <div className="bg-navy-deep text-paper/70 text-xs py-2.5 border-b border-white/10">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/brands" className="hover:text-white transition-colors">
              Brands
            </Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-white transition-colors">
              Directory
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">{brand.brandName}</span>
          </div>
        </div>
      </div>

      {/* Brand Profile Hero Header */}
      <header className="bg-navy text-white pt-10 pb-0 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(1200px 300px at 85% -30%, rgba(224,167,59,0.3), transparent 60%)"
          }}
        />
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-between pb-8 border-b border-white/10">
            
            {/* Left: Brandmark + Title Info */}
            <div className="flex gap-5 md:gap-6 items-start">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[4px] p-2 flex items-center justify-center font-fraunces font-bold text-2xl text-navy shrink-0 shadow-lg border border-line">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.brandName}
                    width={96}
                    height={96}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  brand.brandName.slice(0, 2).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-fraunces text-2xl md:text-4xl font-bold text-white">
                    {brand.brandName}
                  </h1>
                  {brand.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber/15 text-amber border border-amber/40 px-3 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber" /> Verified Manufacturer
                    </span>
                  )}
                </div>

                <p className="text-paper/80 text-xs md:text-sm mt-2 max-w-[580px] leading-relaxed">
                  {brand.about?.slice(0, 180) ||
                    "Leading solar energy manufacturer providing clean, efficient solar solutions."}
                </p>

                {/* Header Stats */}
                <div className="flex gap-6 md:gap-10 mt-4 flex-wrap text-xs">
                  <div>
                    <span className="font-fraunces text-lg md:text-xl font-bold text-white block">
                      {brand.founded || "2010"}
                    </span>
                    <span className="text-paper/60 text-[11px]">Founded</span>
                  </div>
                  <div>
                    <span className="font-fraunces text-lg md:text-xl font-bold text-white block">
                      {brand.countryOfOrigin || brand.headquarters || "Global"}
                    </span>
                    <span className="text-paper/60 text-[11px]">Origin</span>
                  </div>
                  <div>
                    <span className="font-fraunces text-lg md:text-xl font-bold text-white block">
                      {products.length}
                    </span>
                    <span className="text-paper/60 text-[11px]">Registered Products</span>
                  </div>
                  <div>
                    <span className="font-fraunces text-lg md:text-xl font-bold text-amber block flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber" />
                      {rating > 0 ? rating.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-paper/60 text-[11px]">({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full justify-center bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs md:text-sm rounded-[3px] py-2.5 px-4 shadow-sm cursor-pointer transition-colors">
                    Request Quote
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

              <BrandReviewModal brandId={brand.id} brandName={brand.brandName} />
              <div className="flex items-center justify-center p-2 bg-navy-deep/60 rounded border border-white/10 text-xs text-white">
                <CompareToggle id={brand.id} name={brand.brandName} type="brand" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-navy-deep border-t border-white/10 mt-4">
          <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "overview", label: "Profile & Overview" },
              { id: "products", label: `Products (${products.length})` },
              { id: "news", label: `News (${news.length})` },
              { id: "distributors", label: `Distributors (${distributors.length})` },
              { id: "installers", label: `Installers (${certifiedInstallers.length})` },
              { id: "retailers", label: `Retailers (${retailers.length})` },
              { id: "centres", label: `Service Centres (${serviceCentres.length})` },
              { id: "reviews", label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs md:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "text-white border-amber bg-white/5"
                    : "text-paper/65 border-transparent hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Tab Panels */}
      <main className="max-w-[1180px] mx-auto px-5 md:px-8 py-10 pb-28">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
            
            {/* Left: About & Facts */}
            <div className="space-y-6">
              <div className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm">
                <h2 className="font-fraunces text-xl font-bold text-navy-deep mb-4">
                  About {brand.brandName}
                </h2>
                <div className="text-sm text-ink leading-relaxed whitespace-pre-line">
                  {brand.about ||
                    `${brand.brandName} is a globally recognized manufacturer of renewable energy equipment, specialized in residential, commercial, and utility-scale solar solutions.`}
                </div>

                {/* Quick Facts Grid */}
                <div className="mt-8 pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-custom uppercase tracking-wider text-[10.5px] block font-semibold">
                      Founded
                    </span>
                    <strong className="text-navy-deep font-bold text-sm">
                      {brand.founded || "2010"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-custom uppercase tracking-wider text-[10.5px] block font-semibold">
                      Headquarters
                    </span>
                    <strong className="text-navy-deep font-bold text-sm">
                      {brand.headquarters || "Shenzhen, China"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-custom uppercase tracking-wider text-[10.5px] block font-semibold">
                      Official Website
                    </span>
                    {brand.website ? (
                      <a
                        href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-deep font-bold text-xs inline-flex items-center gap-1 hover:underline"
                      >
                        {brand.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-custom">Not specified</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-custom uppercase tracking-wider text-[10.5px] block font-semibold">
                      Warranty Policy & Claims
                    </span>
                    {brand.warrantyUrl ? (
                      <a
                        href={brand.warrantyUrl.startsWith("http") ? brand.warrantyUrl : `https://${brand.warrantyUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-deep font-bold text-xs inline-flex items-center gap-1 hover:underline"
                      >
                        View RMA Terms <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-custom">Standard Manufacturer Warranty</span>
                    )}
                  </div>
                </div>

                {/* Categories */}
                {brand.categories && (brand.categories as string[]).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-line">
                    <span className="text-xs font-bold text-navy-deep block mb-2 uppercase tracking-wider">
                      Product Categories
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {(brand.categories as string[]).map((c, i) => (
                        <span
                          key={i}
                          className="bg-cream border border-line text-navy-deep text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Local Pakistan Team Section */}
              {team.length > 0 && (
                <div className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm">
                  <h3 className="font-fraunces text-lg font-bold text-navy-deep mb-4">
                    Local Representatives & Support Team (Pakistan)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {team.map((person, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 bg-paper rounded-[3px] border border-line"
                      >
                        <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border">
                          {person.photoUrl ? (
                            <Image
                              src={person.photoUrl}
                              alt={person.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            person.name?.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-navy-deep truncate">
                              {person.name}
                            </h4>
                            {person.linkedIn && (
                              <a
                                href={person.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-navy-deep hover:text-amber-deep"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-custom mt-0.5">
                            {person.designation || "Brand Representative"}
                          </p>
                          {person.email && (
                            <a
                              href={`mailto:${person.email}`}
                              className="text-[10.5px] text-amber-deep block mt-1 hover:underline"
                            >
                              {person.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Contact & Pakistan Head Office */}
            <div className="space-y-6">
              
              {/* Pakistan Office Card */}
              <div className="bg-white border border-line rounded-[4px] p-6 shadow-sm">
                <h3 className="font-fraunces text-base font-bold text-navy-deep mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-deep" />
                  Pakistan Head Office & Contacts
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 pb-2.5 border-b border-line/60">
                    <MapPin className="w-4 h-4 text-amber-deep shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-navy-deep block">Office Address</span>
                      <span className="text-slate-custom leading-relaxed">
                        {brand.headOffice || "Lahore, Pakistan"}
                      </span>
                    </div>
                  </div>

                  {brand.customerCare && (
                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-line/60">
                      <Phone className="w-4 h-4 text-amber-deep shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-deep block">Customer Care Hotline</span>
                        <a href={`tel:${brand.customerCare}`} className="text-navy-deep hover:underline font-bold">
                          {brand.customerCare}
                        </a>
                      </div>
                    </div>
                  )}

                  {brand.customerCareEmail && (
                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-line/60">
                      <Mail className="w-4 h-4 text-amber-deep shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-deep block">Support Email</span>
                        <a href={`mailto:${brand.customerCareEmail}`} className="text-amber-deep hover:underline font-bold">
                          {brand.customerCareEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links Row */}
                {socialLinks.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-line">
                    <span className="text-[11px] font-semibold text-slate-custom block mb-2">
                      Connect with {brand.brandName}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {socialLinks.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-cream border border-line flex items-center justify-center text-navy-deep hover:bg-amber hover:text-navy-deep transition-colors"
                        >
                          {s.platform?.toLowerCase().includes("linkedin") && <Linkedin className="w-4 h-4" />}
                          {s.platform?.toLowerCase().includes("facebook") && <Facebook className="w-4 h-4" />}
                          {s.platform?.toLowerCase().includes("twitter") || s.platform?.toLowerCase().includes("x") ? <Twitter className="w-4 h-4" /> : null}
                          {s.platform?.toLowerCase().includes("youtube") && <Youtube className="w-4 h-4" />}
                          {s.platform?.toLowerCase().includes("tiktok") && <Music2 className="w-4 h-4" />}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Points Summary */}
              <div className="bg-navy text-white rounded-[4px] p-6 shadow-sm">
                <h4 className="font-fraunces text-base font-bold text-white mb-3">
                  Verified Local Network
                </h4>
                <p className="text-xs text-paper/75 mb-4 leading-relaxed">
                  EnergyGurus maintains an up-to-date registry of authorized channel partners and service locations for {brand.brandName}.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/10 p-3 rounded-[3px]">
                    <span className="font-fraunces text-xl font-bold text-amber block">
                      {distributors.length}
                    </span>
                    <span className="text-[11px] text-paper/80">Distributors</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-[3px]">
                    <span className="font-fraunces text-xl font-bold text-amber block">
                      {serviceCentres.length}
                    </span>
                    <span className="text-[11px] text-paper/80">Service Centres</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div>
            {/* Products Toolbar */}
            <div className="bg-white border border-line rounded-[4px] p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by model name or series..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-paper border border-line rounded-[3px] text-ink focus:outline-none focus:border-amber"
                />
              </div>

              {productCategories.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setProductCategoryFilter("all")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] border cursor-pointer ${
                      productCategoryFilter === "all"
                        ? "bg-navy text-white border-navy"
                        : "bg-paper text-slate-custom border-line hover:border-navy"
                    }`}
                  >
                    All Types
                  </button>
                  {productCategories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[3px] border cursor-pointer ${
                        productCategoryFilter === cat
                          ? "bg-navy text-white border-navy"
                          : "bg-paper text-slate-custom border-line hover:border-navy"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <FileText className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">No Products Found</h4>
                <p className="text-xs text-slate-custom mt-1">
                  No registered products matched your active filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-line rounded-[4px] p-5 flex flex-col justify-between hover:border-amber hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Product Image / Placeholder */}
                      <div className="w-full h-40 bg-cream rounded-[3px] border border-line mb-4 flex items-center justify-center overflow-hidden relative">
                        {prod.imageUrl ? (
                          <Image
                            src={prod.imageUrl}
                            alt={prod.name}
                            width={300}
                            height={200}
                            className="object-contain w-full h-full p-3 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Layers className="w-8 h-8 text-amber mx-auto mb-1 opacity-70" />
                            <span className="text-[11px] font-bold text-slate-custom uppercase tracking-wider">
                              {prod.category || "Solar Product"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Category & Series */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10.5px] font-bold text-amber-deep uppercase tracking-wider">
                          {prod.category || "Inverter"}
                        </span>
                        {prod.series && (
                          <span className="text-[10px] font-medium bg-cream border border-line px-2 py-0.5 rounded text-navy-deep">
                            {prod.series}
                          </span>
                        )}
                      </div>

                      <h3 className="font-fraunces font-bold text-base text-navy-deep mb-2">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-slate-custom line-clamp-2 mb-4 leading-relaxed">
                        {prod.description || "High efficiency solar inverter engineered for maximum energy yield."}
                      </p>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-line text-[11px] text-slate-custom">
                        {prod.efficiency && (
                          <div>
                            <span className="block text-[10px] text-slate-custom/70">Efficiency</span>
                            <strong className="text-navy-deep font-bold">{prod.efficiency}</strong>
                          </div>
                        )}
                        {prod.warrantyYears && (
                          <div>
                            <span className="block text-[10px] text-slate-custom/70">Warranty</span>
                            <strong className="text-navy-deep font-bold">{prod.warrantyYears} Years</strong>
                          </div>
                        )}
                        {prod.powerRange && (
                          <div>
                            <span className="block text-[10px] text-slate-custom/70">Rated Power</span>
                            <strong className="text-navy-deep font-bold">{prod.powerRange}</strong>
                          </div>
                        )}
                        {prod.protectionRating && (
                          <div>
                            <span className="block text-[10px] text-slate-custom/70">Protection</span>
                            <strong className="text-navy-deep font-bold">{prod.protectionRating}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Download Datasheet Link */}
                    <div className="mt-5 pt-3 border-t border-line flex items-center justify-between gap-2">
                      {prod.datasheetUrl ? (
                        <a
                          href={prod.datasheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center py-2 px-3 bg-navy hover:bg-navy-deep text-white text-xs font-bold rounded-[3px] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Datasheet
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-custom italic">
                          Datasheet available upon request
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NEWS & UPDATES */}
        {activeTab === "news" && (
          <div>
            {news.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <Newspaper className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">No News Available</h4>
                <p className="text-xs text-slate-custom mt-1">
                  Official announcements from {brand.brandName} will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-line rounded-[4px] p-6 flex flex-col justify-between hover:border-amber transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-custom mb-2">
                        <span className="font-bold text-amber-deep uppercase tracking-wider text-[11px]">
                          {item.category || "Press Release"}
                        </span>
                        <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <h3 className="font-fraunces font-bold text-lg text-navy-deep mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-custom line-clamp-3 leading-relaxed">
                        {item.content?.replace(/<[^>]*>?/gm, "") || ""}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line">
                      <Link
                        href={`/news/${item.slug || item.id}`}
                        className="text-xs font-bold text-navy-deep hover:text-amber-deep inline-flex items-center gap-1"
                      >
                        Read Full Article <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AUTHORIZED DISTRIBUTORS */}
        {activeTab === "distributors" && (
          <div>
            <div className="bg-white border border-line rounded-[4px] p-4 mb-6 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search distributors by company name, city, or territory..."
                  value={distributorSearch}
                  onChange={(e) => setDistributorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-paper border border-line rounded-[3px] text-ink focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            {filteredDistributors.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <Store className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">No Distributors Listed</h4>
                <p className="text-xs text-slate-custom mt-1">
                  Contact {brand.brandName} directly for authorized distribution queries.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDistributors.map((dist, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-line rounded-[4px] p-5 flex flex-col justify-between hover:border-amber transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-good bg-good-bg px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Authorized Partner
                        </span>
                        <span className="text-xs font-semibold text-navy-deep">
                          {dist.city || "Pakistan"}
                        </span>
                      </div>

                      <h3 className="font-fraunces font-bold text-base text-navy-deep mb-1">
                        {dist.name}
                      </h3>
                      <p className="text-xs text-amber-deep font-semibold mb-3">
                        Territory: {dist.territory || "Nationwide"}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-custom pt-3 border-t border-line">
                        {dist.contactPerson && (
                          <div>
                            <span className="text-[10.5px] text-slate-custom/70 block">Contact Person</span>
                            <strong className="text-navy-deep">{dist.contactPerson}</strong>
                          </div>
                        )}
                        {dist.phone && (
                          <div className="flex items-center gap-2 pt-1">
                            <Phone className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                            <a href={`tel:${dist.phone}`} className="text-navy-deep hover:underline font-bold">
                              {dist.phone}
                            </a>
                          </div>
                        )}
                        {dist.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                            <a href={`mailto:${dist.email}`} className="text-amber-deep hover:underline">
                              {dist.email}
                            </a>
                          </div>
                        )}
                        {dist.address && (
                          <div className="flex items-start gap-2 pt-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-amber-deep shrink-0 mt-0.5" />
                            <span>{dist.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CERTIFIED EPC INSTALLERS */}
        {activeTab === "installers" && (
          <div>
            {certifiedInstallers.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <Briefcase className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">Certified Installers</h4>
                <p className="text-xs text-slate-custom mt-1">
                  Certified solar EPC installers for {brand.brandName} will appear in this registry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certifiedInstallers.map((inst, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-line rounded-[4px] p-5 shadow-sm hover:border-amber transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10.5px] font-bold text-amber-deep uppercase tracking-wider bg-amber/10 px-2 py-0.5 rounded">
                        Tier {inst.tier || "1"} Partner
                      </span>
                      <span className="text-xs font-semibold text-slate-custom">
                        {inst.city || "Pakistan"}
                      </span>
                    </div>
                    <h3 className="font-fraunces font-bold text-base text-navy-deep">
                      {inst.installerName}
                    </h3>
                    <p className="text-xs text-slate-custom mt-1">
                      Certified installer trained for {brand.brandName} warranty compliant installations.
                    </p>
                    {inst.installerId && (
                      <div className="mt-4 pt-3 border-t border-line">
                        <Link
                          href={`/epcs/${inst.installerId}`}
                          className="text-xs font-bold text-navy-deep hover:text-amber-deep inline-flex items-center gap-1"
                        >
                          View EPC Profile <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: AUTHORIZED RETAILERS */}
        {activeTab === "retailers" && (
          <div>
            <div className="bg-white border border-line rounded-[4px] p-4 mb-6 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search retail stores and dealers by store name or city..."
                  value={retailerSearch}
                  onChange={(e) => setRetailerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-paper border border-line rounded-[3px] text-ink focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            {filteredRetailers.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <Store className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">No Retailers Registered</h4>
                <p className="text-xs text-slate-custom mt-1">
                  Local dealer & shop points will be listed here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRetailers.map((ret, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-line rounded-[4px] p-5 flex flex-col justify-between shadow-sm hover:border-amber transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-navy-deep bg-cream border border-line px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-2">
                        {ret.city || "Retail Point"}
                      </span>
                      <h3 className="font-fraunces font-bold text-base text-navy-deep mb-1">
                        {ret.name}
                      </h3>
                      <p className="text-xs text-slate-custom leading-relaxed mb-3">
                        {ret.address}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
                      {ret.phone && (
                        <a href={`tel:${ret.phone}`} className="font-bold text-navy-deep hover:underline">
                          {ret.phone}
                        </a>
                      )}
                      {ret.whatsapp && (
                        <a
                          href={`https://wa.me/${ret.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-good hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                      {ret.mapUrl && (
                        <a
                          href={ret.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-deep font-bold hover:underline"
                        >
                          Directions
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SERVICE CENTRES */}
        {activeTab === "centres" && (
          <div>
            <div className="bg-white border border-line rounded-[4px] p-4 mb-6 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-custom absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search service centres and flagship stores by location..."
                  value={centreSearch}
                  onChange={(e) => setCentreSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-paper border border-line rounded-[3px] text-ink focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            {filteredCentres.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <Wrench className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">No Service Centres Listed</h4>
                <p className="text-xs text-slate-custom mt-1">
                  Contact {brand.brandName} customer care for official warranty claims and drop-off points.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCentres.map((centre, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-line rounded-[4px] p-6 shadow-sm hover:border-amber transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-deep bg-amber/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {centre.type || "Flagship Service Centre"}
                      </span>
                      <span className="text-xs font-bold text-navy-deep">
                        {centre.city}
                      </span>
                    </div>

                    <h3 className="font-fraunces font-bold text-lg text-navy-deep mb-1">
                      {centre.name}
                    </h3>
                    <p className="text-xs text-slate-custom leading-relaxed mb-4">
                      {centre.address}
                    </p>

                    {/* Services Offered */}
                    {centre.services && centre.services.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10.5px] font-bold text-slate-custom uppercase tracking-wider block mb-1.5">
                          Services Provided
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {centre.services.map((srv: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="text-[11px] bg-cream border border-line px-2 py-0.5 rounded text-navy-deep font-medium"
                            >
                              ✓ {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hours & Contact */}
                    <div className="pt-4 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {centre.hours && (
                        <div className="flex items-center gap-1.5 text-slate-custom">
                          <Clock className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                          <span>{centre.hours}</span>
                        </div>
                      )}
                      {centre.phone && (
                        <div className="flex items-center gap-1.5 text-navy-deep font-bold">
                          <Phone className="w-3.5 h-3.5 text-amber-deep shrink-0" />
                          <a href={`tel:${centre.phone}`} className="hover:underline">
                            {centre.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: CUSTOMER REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            
            {/* Review Summary Card */}
            <div className="bg-white border border-line rounded-[4px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="text-center md:text-left">
                  <span className="font-fraunces text-4xl md:text-5xl font-bold text-navy-deep block">
                    {rating > 0 ? rating.toFixed(1) : "5.0"}
                  </span>
                  <div className="flex items-center gap-1 text-amber mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-custom mt-1 block">
                    Based on {reviews.length} customer reviews
                  </span>
                </div>
              </div>

              <BrandReviewModal brandId={brand.id} brandName={brand.brandName} />
            </div>

            {/* Review List */}
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-white border border-line rounded-[4px]">
                <MessageSquare className="w-12 h-12 text-slate-custom/30 mx-auto mb-3" />
                <h4 className="font-fraunces font-semibold text-lg text-navy-deep">No Reviews Yet</h4>
                <p className="text-xs text-slate-custom mt-1">
                  Be the first to review your experience with {brand.brandName} equipment!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-line rounded-[4px] p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-fraunces font-bold text-sm md:text-base text-navy-deep">
                            {rev.authorName || rev.author?.name || "Verified Customer"}
                          </h4>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold bg-good-bg text-good px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-good" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-custom">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-ink leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>

                    {rev.proofUrl && (
                      <div className="mt-3 pt-3 border-t border-line/60">
                        <a
                          href={rev.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-amber-deep hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Verified Purchase Document
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
