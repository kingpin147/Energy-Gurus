"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Package,
  Store,
  Wrench,
  Users,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Upload,
  Loader2,
  Save,
  Send,
  FileText,
  HelpCircle,
  Eye,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { updateBrandProfile, submitBrandForReviewAction, addProductModel, deleteProductModel } from "@/lib/actions/brand";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BrandSubmissionEditorProps {
  brand: any;
  products: any[];
  currentUser: any;
}

export function BrandSubmissionEditor({
  brand,
  products: initialProducts,
  currentUser
}: BrandSubmissionEditorProps) {
  const router = useRouter();
  const { uploadFile, isUploading } = useR2Upload();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [brandName, setBrandName] = useState(brand.brandName || "");
  const [website, setWebsite] = useState(brand.website || "");
  const [founded, setFounded] = useState(brand.founded || "");
  const [headquarters, setHeadquarters] = useState(brand.headquarters || "");
  const [countryOfOrigin, setCountryOfOrigin] = useState(brand.countryOfOrigin || "China");
  const [warrantyUrl, setWarrantyUrl] = useState(brand.warrantyUrl || "");
  const [customerCare, setCustomerCare] = useState(brand.customerCare || "");
  const [customerCareEmail, setCustomerCareEmail] = useState(brand.customerCareEmail || "");
  const [headOffice, setHeadOffice] = useState(brand.headOffice || "");
  const [about, setAbout] = useState(brand.about || "");
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || "");

  // Repeatable JSON lists
  const [team, setTeam] = useState<any[]>(brand.team || brand.reps || []);
  const [distributors, setDistributors] = useState<any[]>(brand.distributors || []);
  const [retailers, setRetailers] = useState<any[]>(brand.retailers || []);
  const [serviceCentres, setServiceCentres] = useState<any[]>(brand.serviceCentres || []);
  const [certifiedInstallers, setCertifiedInstallers] = useState<any[]>(brand.certifiedInstallers || []);
  const [socialLinks, setSocialLinks] = useState<any[]>(brand.socialLinks || []);
  const [categories, setCategories] = useState<string[]>(brand.categories || ["Inverters"]);

  // Products modal / add product state
  const [productsList, setProductsList] = useState<any[]>(initialProducts);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Inverters");
  const [newProdSeries, setNewProdSeries] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdEfficiency, setNewProdEfficiency] = useState("");
  const [newProdPower, setNewProdPower] = useState("");
  const [newProdWarranty, setNewProdWarranty] = useState("5");
  const [newProdProtection, setNewProdProtection] = useState("IP65");
  const [newProdDatasheet, setNewProdDatasheet] = useState<File | null>(null);
  const [newProdImage, setNewProdImage] = useState<File | null>(null);

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.info("Uploading brand logo to R2...");
      const res = await uploadFile(file, "brand-logos");
      setLogoUrl(res.publicUrl);
      toast.success("Logo uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Logo upload failed");
    }
  };

  // Save all draft data
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await updateBrandProfile({
        userId: brand.userId,
        brandName,
        website,
        founded,
        headquarters,
        countryOfOrigin,
        warrantyUrl,
        customerCare,
        customerCareEmail,
        headOffice,
        about,
        logoUrl,
        team,
        distributors,
        retailers,
        serviceCentres,
        certifiedInstallers,
        socialLinks,
        categories
      });
      toast.success("Draft saved successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit profile for Admin Review
  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      // First save all changes
      await updateBrandProfile({
        userId: brand.userId,
        brandName,
        website,
        founded,
        headquarters,
        countryOfOrigin,
        warrantyUrl,
        customerCare,
        customerCareEmail,
        headOffice,
        about,
        logoUrl,
        team,
        distributors,
        retailers,
        serviceCentres,
        certifiedInstallers,
        socialLinks,
        categories
      });

      const res = await submitBrandForReviewAction(brand.id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Product Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    try {
      let datasheetUrl: string | null = null;
      let imageUrl: string | null = null;

      if (newProdDatasheet) {
        toast.info("Uploading product datasheet to R2...");
        const res = await uploadFile(newProdDatasheet, "product-datasheets");
        datasheetUrl = res.publicUrl;
      }

      if (newProdImage) {
        toast.info("Uploading product image to R2...");
        const res = await uploadFile(newProdImage, "product-images");
        imageUrl = res.publicUrl;
      }

      const fd = new FormData();
      fd.append("name", newProdName);
      fd.append("category", newProdCategory);
      fd.append("series", newProdSeries);
      fd.append("description", newProdDesc);
      fd.append("efficiency", newProdEfficiency);
      fd.append("powerRange", newProdPower);
      fd.append("warrantyYears", newProdWarranty);
      fd.append("protectionRating", newProdProtection);
      if (datasheetUrl) fd.append("datasheetUrl", datasheetUrl);
      if (imageUrl) fd.append("imageUrl", imageUrl);

      await addProductModel(fd);
      toast.success("Product added successfully!");
      setShowAddProduct(false);
      setNewProdName("");
      setNewProdSeries("");
      setNewProdDesc("");
      setNewProdDatasheet(null);
      setNewProdImage(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add product");
    }
  };

  const status = brand.status || "live";
  const approvalHistory = (brand.approvalHistory as any[]) || [];

  return (
    <div className="bg-cream text-ink min-h-screen pb-24">

      {/* Changes Requested Banner */}
      {status === "changes_requested" && (
        <div className="bg-danger-bg border-b border-danger/30 text-danger p-4 shadow-sm animate-in fade-in">
          <div className="max-w-[1180px] mx-auto flex items-start gap-3 px-5 md:px-8">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <b className="font-bold text-sm block">Changes requested by EnergyGurus Admin</b>
              <p className="text-xs text-danger/90 mt-0.5 whitespace-pre-line">
                {brand.adminFeedback || "Please update missing distributor contact numbers and ensure all technical product datasheets are attached before resubmitting."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Action & Status Bar */}
      <div className="bg-white border-b border-line sticky top-0 z-30 py-4 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <h1 className="font-fraunces text-xl md:text-2xl font-bold text-navy-deep">
              {brandName || "Brand Portal"}
            </h1>
            
            {/* Status Pill */}
            {status === "live" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-good-bg text-good border border-good/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-good" /> Live & Published
              </span>
            )}
            {status === "pending_review" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber/15 text-amber-deep border border-amber/40 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-deep" /> Pending Review
              </span>
            )}
            {status === "changes_requested" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-danger-bg text-danger border border-danger/30 px-3 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" /> Changes Requested
              </span>
            )}
            {status === "draft" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-100 text-slate-custom border border-gray-300 px-3 py-1 rounded-full">
                Draft Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/brands/${brand.id}`}
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold bg-cream border border-line rounded-[3px] text-navy-deep hover:bg-paper inline-flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Public Page
            </Link>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isUploading}
              className="px-4 py-2 text-xs font-bold bg-navy text-white hover:bg-navy-deep rounded-[3px] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Draft
            </button>

            <button
              onClick={handleSubmitForReview}
              disabled={isSubmitting || isUploading}
              className="px-5 py-2 text-xs font-bold bg-amber hover:bg-amber-deep text-navy-deep rounded-[3px] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit for Review
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Editor Layout */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <aside className="bg-white border border-line rounded-[4px] p-3 sticky top-[80px] space-y-1 shadow-sm">
          <a
            href="#sec-profile"
            className="flex items-center justify-between p-2.5 rounded text-xs font-bold text-navy-deep hover:bg-cream transition-colors border-l-3 border-amber"
          >
            <span>Core Profile & Story</span>
          </a>
          <a
            href="#sec-products"
            className="flex items-center justify-between p-2.5 rounded text-xs font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep transition-colors"
          >
            <span>Products</span>
            <span className="text-[10.5px] bg-cream border border-line px-2 py-0.5 rounded-full font-bold">
              {productsList.length}
            </span>
          </a>
          <a
            href="#sec-distributors"
            className="flex items-center justify-between p-2.5 rounded text-xs font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep transition-colors"
          >
            <span>Distributors</span>
            <span className="text-[10.5px] bg-cream border border-line px-2 py-0.5 rounded-full font-bold">
              {distributors.length}
            </span>
          </a>
          <a
            href="#sec-retailers"
            className="flex items-center justify-between p-2.5 rounded text-xs font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep transition-colors"
          >
            <span>Retailers & Dealers</span>
            <span className="text-[10.5px] bg-cream border border-line px-2 py-0.5 rounded-full font-bold">
              {retailers.length}
            </span>
          </a>
          <a
            href="#sec-centres"
            className="flex items-center justify-between p-2.5 rounded text-xs font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep transition-colors"
          >
            <span>Service Centres</span>
            <span className="text-[10.5px] bg-cream border border-line px-2 py-0.5 rounded-full font-bold">
              {serviceCentres.length}
            </span>
          </a>
          <a
            href="#sec-team"
            className="flex items-center justify-between p-2.5 rounded text-xs font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep transition-colors"
          >
            <span>Local Pakistan Team</span>
            <span className="text-[10.5px] bg-cream border border-line px-2 py-0.5 rounded-full font-bold">
              {team.length}
            </span>
          </a>
          <a
            href="#sec-history"
            className="flex items-center justify-between p-2.5 rounded text-xs font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep transition-colors"
          >
            <span>Approval History</span>
          </a>
        </aside>

        {/* Right Editor Panels */}
        <div className="space-y-8">
          
          {/* SECTION 1: PROFILE */}
          <section id="sec-profile" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="border-b border-line pb-4">
              <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                1. Core Brand Profile & Identity
              </h2>
              <p className="text-xs text-slate-custom mt-1">
                Publicly visible brand details, founding information, and official contact numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Official Website</label>
                <input
                  type="url"
                  placeholder="https://growatt.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Year Founded</label>
                <input
                  type="text"
                  placeholder="e.g. 2010"
                  value={founded}
                  onChange={(e) => setFounded(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Headquarters</label>
                <input
                  type="text"
                  placeholder="e.g. Shenzhen, China"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Country of Origin</label>
                <select
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                >
                  <option value="China">China</option>
                  <option value="Germany">Germany</option>
                  <option value="USA">USA</option>
                  <option value="Japan">Japan</option>
                  <option value="Austria">Austria</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Warranty & RMA Policy URL</label>
                <input
                  type="url"
                  placeholder="https://brand.com/warranty"
                  value={warrantyUrl}
                  onChange={(e) => setWarrantyUrl(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>
            </div>

            {/* After-Sales Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line">
              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Customer Care Hotline (Pakistan)</label>
                <input
                  type="text"
                  placeholder="+92 42 111 000 000"
                  value={customerCare}
                  onChange={(e) => setCustomerCare(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-deep mb-1">Customer Care Email</label>
                <input
                  type="email"
                  placeholder="service.pk@brand.com"
                  value={customerCareEmail}
                  onChange={(e) => setCustomerCareEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-navy-deep mb-1">Head Office Address (Pakistan)</label>
                <input
                  type="text"
                  placeholder="Office # 401, Solar Heights, Gulberg III, Lahore"
                  value={headOffice}
                  onChange={(e) => setHeadOffice(e.target.value)}
                  className="w-full text-xs p-2.5 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                />
              </div>
            </div>

            {/* Company About */}
            <div className="pt-4 border-t border-line">
              <label className="block text-xs font-bold text-navy-deep mb-1">Company Overview & Background</label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe your manufacturing history, patents, global presence, and local market commitment..."
                className="w-full text-xs p-3 bg-paper border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none leading-relaxed"
              />
            </div>

            {/* Logo Upload */}
            <div className="pt-4 border-t border-line bg-cream p-4 rounded-[3px]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border border-line rounded flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <Image src={logoUrl} alt="Logo" width={64} height={64} className="object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-custom/40" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-deep">Brand Logo</label>
                  <p className="text-[11px] text-slate-custom mt-0.5">
                    Recommended: Square PNG/SVG on transparent or white background (min 200x200).
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mt-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-white hover:file:bg-navy-deep file:cursor-pointer text-slate-custom"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: PRODUCTS */}
          <section id="sec-products" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                  2. Registered Products & Datasheets ({productsList.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  List models, technical specifications, and attach downloadable PDF datasheets.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="px-3.5 py-1.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Model
              </button>
            </div>

            {/* Add Product Inline Form */}
            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="p-4 bg-cream border border-line rounded-[4px] space-y-4 animate-in fade-in">
                <h3 className="text-xs font-bold text-navy-deep uppercase tracking-wider">
                  New Product Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MIN 5000TL-X"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full text-xs p-2 bg-paper border border-line rounded text-ink focus:border-amber focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full text-xs p-2 bg-paper border border-line rounded text-ink focus:border-amber focus:outline-none"
                    >
                      <option value="Inverters">Inverters (On-Grid / Hybrid / Off-Grid)</option>
                      <option value="Solar Panels">Solar Panels (Mono PERC / TOPCon / HJT)</option>
                      <option value="Batteries">Batteries (Lithium Storage)</option>
                      <option value="EV Chargers">EV Chargers</option>
                      <option value="Mounting & Structure">Mounting & Structure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Series / Sub-Family</label>
                    <input
                      type="text"
                      placeholder="e.g. MIN Series / TOPCon 585W"
                      value={newProdSeries}
                      onChange={(e) => setNewProdSeries(e.target.value)}
                      className="w-full text-xs p-2 bg-paper border border-line rounded text-ink focus:border-amber focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Rated Power / Capacity</label>
                    <input
                      type="text"
                      placeholder="e.g. 5kW / 585W"
                      value={newProdPower}
                      onChange={(e) => setNewProdPower(e.target.value)}
                      className="w-full text-xs p-2 bg-paper border border-line rounded text-ink focus:border-amber focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Max Efficiency</label>
                    <input
                      type="text"
                      placeholder="e.g. 98.4%"
                      value={newProdEfficiency}
                      onChange={(e) => setNewProdEfficiency(e.target.value)}
                      className="w-full text-xs p-2 bg-paper border border-line rounded text-ink focus:border-amber focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Warranty (Years)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 or 10 or 25"
                      value={newProdWarranty}
                      onChange={(e) => setNewProdWarranty(e.target.value)}
                      className="w-full text-xs p-2 bg-paper border border-line rounded text-ink focus:border-amber focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Datasheet PDF (R2)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setNewProdDatasheet(e.target.files?.[0] || null)}
                      className="text-xs file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-navy file:text-white file:cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-deep mb-1">Product Photo (R2)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewProdImage(e.target.files?.[0] || null)}
                      className="text-xs file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-navy file:text-white file:cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-3 py-1.5 text-xs text-slate-custom hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-navy text-white text-xs font-bold rounded hover:bg-navy-deep cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            )}

            {/* Products List */}
            <div className="space-y-3">
              {productsList.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3.5 bg-paper border border-line rounded-[3px] hover:border-amber transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cream rounded border border-line flex items-center justify-center shrink-0 overflow-hidden">
                      {prod.imageUrl ? (
                        <Image src={prod.imageUrl} alt={prod.name} width={40} height={40} className="object-contain" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-custom/50" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy-deep">{prod.name}</h4>
                      <span className="text-[11px] text-slate-custom">
                        {prod.category} {prod.series ? `· ${prod.series}` : ""} {prod.powerRange ? `· ${prod.powerRange}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {prod.datasheetUrl && (
                      <a
                        href={prod.datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-amber-deep hover:underline inline-flex items-center gap-1 mr-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Datasheet
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete product ${prod.name}?`)) {
                          await deleteProductModel(prod.id);
                          setProductsList(productsList.filter((p) => p.id !== prod.id));
                          toast.success("Product deleted");
                        }
                      }}
                      className="p-1.5 text-danger hover:bg-danger-bg rounded cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: DISTRIBUTORS */}
          <section id="sec-distributors" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                  3. Authorized Distributors in Pakistan ({distributors.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  Officially appointed national and provincial channel partners.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDistributors([
                    ...distributors,
                    { name: "", city: "Lahore", territory: "Nationwide", contactPerson: "", phone: "", email: "", address: "" }
                  ])
                }
                className="px-3.5 py-1.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Distributor
              </button>
            </div>

            <div className="space-y-4">
              {distributors.map((dist, idx) => (
                <div key={idx} className="p-4 bg-paper border border-line rounded-[3px] space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                      Distributor #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDistributors(distributors.filter((_, i) => i !== idx))}
                      className="text-danger hover:text-red-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Company Name *</label>
                      <input
                        type="text"
                        value={dist.name}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].name = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">City</label>
                      <input
                        type="text"
                        value={dist.city}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].city = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Territory / Scope</label>
                      <input
                        type="text"
                        value={dist.territory}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].territory = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={dist.contactPerson}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].contactPerson = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={dist.phone}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].phone = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Email</label>
                      <input
                        type="email"
                        value={dist.email}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].email = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Office Address</label>
                      <input
                        type="text"
                        value={dist.address}
                        onChange={(e) => {
                          const list = [...distributors];
                          list[idx].address = e.target.value;
                          setDistributors(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: SERVICE CENTRES */}
          <section id="sec-centres" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                  4. Flagship Stores & Service Centres ({serviceCentres.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  Official repair, RMA collection, and in-person diagnostics locations.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setServiceCentres([
                    ...serviceCentres,
                    { name: "", type: "Flagship Service Centre", city: "Lahore", address: "", phone: "", hours: "Mon-Sat: 9am-6pm", services: ["Diagnostics", "Component Replacement", "RMA Claim Handover"] }
                  ])
                }
                className="px-3.5 py-1.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Service Centre
              </button>
            </div>

            <div className="space-y-4">
              {serviceCentres.map((centre, idx) => (
                <div key={idx} className="p-4 bg-paper border border-line rounded-[3px] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                      Location #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServiceCentres(serviceCentres.filter((_, i) => i !== idx))}
                      className="text-danger hover:text-red-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Centre Name *</label>
                      <input
                        type="text"
                        value={centre.name}
                        onChange={(e) => {
                          const list = [...serviceCentres];
                          list[idx].name = e.target.value;
                          setServiceCentres(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Type</label>
                      <select
                        value={centre.type}
                        onChange={(e) => {
                          const list = [...serviceCentres];
                          list[idx].type = e.target.value;
                          setServiceCentres(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      >
                        <option>Flagship Service Centre</option>
                        <option>Warranty Claim Drop-off Point</option>
                        <option>Authorized Repair Partner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">City</label>
                      <input
                        type="text"
                        value={centre.city}
                        onChange={(e) => {
                          const list = [...serviceCentres];
                          list[idx].city = e.target.value;
                          setServiceCentres(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Address</label>
                      <input
                        type="text"
                        value={centre.address}
                        onChange={(e) => {
                          const list = [...serviceCentres];
                          list[idx].address = e.target.value;
                          setServiceCentres(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-navy-deep mb-1">Operating Hours</label>
                      <input
                        type="text"
                        value={centre.hours}
                        onChange={(e) => {
                          const list = [...serviceCentres];
                          list[idx].hours = e.target.value;
                          setServiceCentres(list);
                        }}
                        className="w-full text-xs p-2 bg-white border border-line rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: APPROVAL HISTORY */}
          <section id="sec-history" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-4 scroll-mt-24">
            <h2 className="font-fraunces text-lg font-bold text-navy-deep border-b border-line pb-3">
              5. Submission & Approval Audit History
            </h2>
            {approvalHistory.length === 0 ? (
              <p className="text-xs text-slate-custom italic py-2">
                No past audit actions recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {approvalHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-amber pl-3 py-1">
                    <div>
                      <span className="font-bold text-navy-deep block">{item.action}</span>
                      <span className="text-[11px] text-slate-custom">
                        {new Date(item.date).toLocaleString()}
                      </span>
                      {item.note && (
                        <p className="text-xs text-ink/80 mt-1 bg-cream p-2 rounded border border-line">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
