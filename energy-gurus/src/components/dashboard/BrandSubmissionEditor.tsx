"use client";

import { useState, useEffect } from "react";
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
  Mail,
  Newspaper,
  Award,
  Star,
  Lock
} from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { updateBrandProfile, submitBrandForReviewAction, addProductModel, deleteProductModel, submitBrandNewsAction } from "@/lib/actions/brand";
import { brandApproveCertificationAction, rejectCertificationAction } from "@/lib/actions/certifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BrandSubmissionEditorProps {
  brand: any;
  products: any[];
  currentUser: any;
  brandArticles?: any[];
  brandCertifications?: any[];
}

export function BrandSubmissionEditor({
  brand,
  products: initialProducts,
  currentUser,
  brandArticles = [],
  brandCertifications = []
}: BrandSubmissionEditorProps) {
  const router = useRouter();
  const { uploadFile, isUploading } = useR2Upload();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("sec-profile");

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super-admin";
  const status = brand.status || "live";
  const isLiveLocked = status === "live" && !isAdmin;

  // News & Updates State
  const [articles, setArticles] = useState<any[]>(brandArticles);
  const [showAddNews, setShowAddNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState("Product Launch");
  const [newsContent, setNewsContent] = useState("");
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [isSubmittingNews, setIsSubmittingNews] = useState(false);

  // Installer Certifications Review & Rating State
  const [certsList, setCertsList] = useState<any[]>(brandCertifications);
  const [ratingCertId, setRatingCertId] = useState<string | null>(null);
  const [qInstallation, setQInstallation] = useState<number>(5);
  const [qAfterSales, setQAfterSales] = useState<number>(5);
  const [qTraining, setQTraining] = useState<number>(5);
  const [certNotes, setCertNotes] = useState("");
  const [isProcessingCert, setIsProcessingCert] = useState(false);
  const [rejectingCertId, setRejectingCertId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      if (id) {
        setActiveTab(id);
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, []);

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

  // Submit Brand News & Updates
  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      toast.error("Please provide both title and details for the announcement.");
      return;
    }

    setIsSubmittingNews(true);
    try {
      let imageUrl: string | null = null;
      if (newsImageFile) {
        toast.info("Uploading announcement image to R2...");
        const res = await uploadFile(newsImageFile, "brand-news");
        imageUrl = res.publicUrl;
      }

      const fd = new FormData();
      fd.append("title", newsTitle.trim());
      fd.append("category", newsCategory);
      fd.append("content", newsContent.trim());
      if (imageUrl) fd.append("imageUrl", imageUrl);

      const res = await submitBrandNewsAction(fd);
      if (res.success) {
        toast.success(res.message);
        if (res.article) {
          setArticles([res.article, ...articles]);
        }
        setShowAddNews(false);
        setNewsTitle("");
        setNewsContent("");
        setNewsImageFile(null);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit announcement");
    } finally {
      setIsSubmittingNews(false);
    }
  };

  // Approve Installer Certification with 3 Grounds Rating
  const handleApproveCert = async (certId: string) => {
    setIsProcessingCert(true);
    try {
      const res = await brandApproveCertificationAction(
        certId,
        certNotes || "Approved by Brand Partner",
        {
          installationQuality: qInstallation,
          afterSalesQuality: qAfterSales,
          trainingParticipation: qTraining,
        }
      );
      if (res.success) {
        toast.success(res.message);
        setCertsList((prev) =>
          prev.map((c) =>
            c.id === certId
              ? {
                  ...c,
                  brandStatus: "approved",
                  brandRating: ((qInstallation + qAfterSales + qTraining) / 3).toFixed(1),
                  brandRatings: {
                    installationQuality: qInstallation,
                    afterSalesQuality: qAfterSales,
                    trainingParticipation: qTraining,
                  },
                  brandNotes: certNotes,
                  status: "pending_admin",
                }
              : c
          )
        );
        setRatingCertId(null);
        setCertNotes("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve certification");
    } finally {
      setIsProcessingCert(false);
    }
  };

  // Reject Installer Certification
  const handleRejectCert = async (certId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsProcessingCert(true);
    try {
      const res = await rejectCertificationAction(certId, rejectReason, true);
      if (res.success) {
        toast.success(res.message);
        setCertsList((prev) =>
          prev.map((c) =>
            c.id === certId ? { ...c, brandStatus: "rejected", status: "rejected" } : c
          )
        );
        setRejectingCertId(null);
        setRejectReason("");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject certification");
    } finally {
      setIsProcessingCert(false);
    }
  };

  const approvalHistory = (brand.approvalHistory as any[]) || [];

  return (
    <div className="bg-cream text-ink min-h-screen pb-24">

      {/* Profile Live & Locked Banner for Non-Admins */}
      {isLiveLocked && (
        <div className="bg-amber/15 border-b border-amber/40 text-navy-deep p-4 shadow-sm animate-in fade-in">
          <div className="max-w-[1180px] mx-auto flex items-start gap-3 px-5 md:px-8">
            <Lock className="w-5 h-5 text-amber-deep shrink-0 mt-0.5" />
            <div>
              <b className="font-bold text-sm block">Profile is Live &amp; Published</b>
              <p className="text-xs text-slate-custom mt-0.5">
                In accordance with platform integrity regulations, live brand profile edit rights are exclusively managed by EnergyGurus.online administrators. You can still post updates to <b>News &amp; Updates</b> and review <b>Certified Installers</b> below. To request changes to your brand profile, please contact EnergyGurus Support.
              </p>
            </div>
          </div>
        </div>
      )}

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
            {isLiveLocked ? (
              <span className="px-4 py-2 text-xs font-bold bg-amber/15 text-navy-deep border border-amber/40 rounded-[3px] inline-flex items-center gap-1.5 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-deep" />
                Live Profile (Admin Controlled)
              </span>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Editor Layout */}
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <aside className="bg-white border border-line rounded-[4px] p-3 sticky top-[80px] space-y-1 shadow-sm">
          {[
            { id: "sec-profile", label: "Core Profile & Story", count: null },
            { id: "sec-products", label: "Products", count: productsList.length },
            { id: "sec-news", label: "News & Updates", count: articles.length },
            { id: "sec-installer-certs", label: "Certified Installers & Rating", count: certsList.filter(c => c.brandStatus === 'pending').length || null },
            { id: "sec-distributors", label: "Distributors", count: distributors.length },
            { id: "sec-retailers", label: "Retailers & Dealers", count: retailers.length },
            { id: "sec-centres", label: "Service Centres", count: serviceCentres.length },
            { id: "sec-team", label: "Local Pakistan Team", count: team.length },
            { id: "sec-history", label: "Approval History", count: null },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded text-xs transition-all cursor-pointer text-left ${
                  isActive
                    ? "font-bold text-navy-deep bg-cream border-l-4 border-amber shadow-xs"
                    : "font-semibold text-slate-custom hover:bg-cream hover:text-navy-deep"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== null && (
                  <span
                    className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold border ${
                      isActive
                        ? "bg-amber/20 border-amber/40 text-navy-deep"
                        : "bg-cream border-line text-slate-custom"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
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

            <fieldset disabled={isLiveLocked} className="space-y-6">
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
            </fieldset>
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

              {!isLiveLocked && (
                <button
                  type="button"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="px-3.5 py-1.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Model
                </button>
              )}
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
                    {!isLiveLocked && (
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: NEWS & UPDATES */}
          <section id="sec-news" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-amber-deep" />
                  News &amp; Updates ({articles.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  Post pictures and details about product launches, outlet openings, special projects, announcements, and events.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddNews(!showAddNews)}
                className="px-3.5 py-1.5 bg-navy hover:bg-navy-deep text-white text-xs font-bold rounded-[3px] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddNews ? "Cancel" : "Post Announcement"}
              </button>
            </div>

            <div className="bg-cream/60 border border-line/60 rounded p-3.5 text-xs text-slate-custom space-y-1">
              <p className="font-bold text-navy-deep">Editorial &amp; Review Policy</p>
              <p>
                All brand announcements are submitted for review and approval by <b>energygurus.online</b> administrators before appearing on the live platform. Once published, edit rights remain exclusively with EnergyGurus administrators to maintain journalistic integrity.
              </p>
            </div>

            {/* Post Announcement Form */}
            {showAddNews && (
              <form onSubmit={handlePostNews} className="bg-paper border border-line rounded-[4px] p-5 space-y-4 animate-in fade-in">
                <h3 className="font-bold text-sm text-navy-deep">Create New Announcement / News Update</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-deep mb-1">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                    >
                      <option value="Product Launch">Product Launch</option>
                      <option value="Outlet Opening">Outlet Opening</option>
                      <option value="Special Projects Go Live">Special Projects Go Live</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Events">Events</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-deep mb-1">
                      Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Launching our New 10kW Hybrid Inverter Series"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-deep mb-1">
                    Announcement Picture / Banner
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewsImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs p-2 bg-white border border-line rounded-[3px] text-slate-custom file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cream file:text-navy-deep hover:file:bg-amber/20"
                  />
                  <span className="text-[11px] text-slate-custom mt-0.5 block">High-resolution banner of the product, store, or event (PNG/JPG).</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-deep mb-1">
                    Details &amp; Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide full details, specifications, dates, locations, or notes about this announcement..."
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-line rounded-[3px] text-ink focus:border-amber focus:outline-none resize-y"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNews(false)}
                    className="px-4 py-2 text-xs font-bold border border-line hover:bg-cream rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNews}
                    className="px-5 py-2 text-xs font-bold bg-amber hover:bg-amber-deep text-navy-deep rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    {isSubmittingNews ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Submit for EnergyGurus Review
                  </button>
                </div>
              </form>
            )}

            {/* Articles List */}
            {articles.length === 0 ? (
              <p className="text-xs text-slate-custom italic py-2">
                No news updates or announcements posted yet. Click &quot;Post Announcement&quot; above to submit your first update.
              </p>
            ) : (
              <div className="space-y-3">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="flex flex-col sm:flex-row items-start justify-between gap-4 p-4 border border-line rounded-[4px] bg-paper/50 hover:bg-paper transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {art.imageUrl ? (
                        <div className="w-16 h-16 rounded overflow-hidden relative shrink-0 border border-line bg-white">
                          <Image
                            src={art.imageUrl}
                            alt={art.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-cream border border-line flex items-center justify-center shrink-0 text-slate-custom">
                          <Newspaper className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cream border border-line text-navy-deep">
                            {art.category}
                          </span>
                          <span className="text-[11px] text-slate-custom">
                            {new Date(art.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-navy-deep mt-1">{art.title}</h4>
                        <p className="text-xs text-slate-custom mt-1 line-clamp-2">{art.content}</p>
                      </div>
                    </div>

                    <div className="shrink-0 sm:self-center">
                      {art.status === "published" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-good bg-good-bg border border-good/30 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Live &amp; Published
                        </span>
                      ) : art.status === "pending_review" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-deep bg-amber/15 border border-amber/30 px-2.5 py-1 rounded-full">
                          <Clock className="w-3 h-3" /> Under Admin Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-custom bg-cream border border-line px-2.5 py-1 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION: CERTIFIED INSTALLERS & RATING */}
          <section id="sec-installer-certs" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="border-b border-line pb-4">
              <h2 className="font-fraunces text-lg font-bold text-navy-deep flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-deep" />
                Certified Installers &amp; Brand Ratings ({certsList.length})
              </h2>
              <p className="text-xs text-slate-custom mt-1">
                Verify and rate EPC installers claiming authorization for your brand. Approved claims directly define installer tier categorization on EnergyGurus.
              </p>
            </div>

            <div className="bg-cream/60 border border-line/60 rounded p-3.5 text-xs text-slate-custom space-y-1">
              <p className="font-bold text-navy-deep">Installer Categorization &amp; Rating Mechanism</p>
              <p>
                First, certifications and 3-ground ratings are reviewed &amp; approved by you (the brand). Final approval is given by energygurus.online, which unlocks installer category badges:
              </p>
              <ul className="list-disc list-inside text-[11px] pt-1 space-y-0.5 text-ink/80">
                <li><b>Silver:</b> 1 - 2 Brand Certifications</li>
                <li><b>Gold:</b> 3 - 4 Brand Certifications</li>
                <li><b>Diamond:</b> 5 - 6 Brand Certifications</li>
                <li><b>Platinum:</b> 7 - 8+ Brand Certifications</li>
              </ul>
            </div>

            {certsList.length === 0 ? (
              <p className="text-xs text-slate-custom italic py-2">
                No installers have submitted certification claims for {brandName || "your brand"} yet.
              </p>
            ) : (
              <div className="space-y-4">
                {certsList.map((cert) => {
                  const isRatingThis = ratingCertId === cert.id;
                  const isRejectingThis = rejectingCertId === cert.id;
                  const avgRating = ((qInstallation + qAfterSales + qTraining) / 3).toFixed(1);

                  return (
                    <div
                      key={cert.id}
                      className="border border-line rounded-[4px] p-5 bg-paper/30 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cream border border-line flex items-center justify-center font-bold text-xs text-navy-deep shrink-0">
                            {cert.installerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-navy-deep">{cert.installerName}</h4>
                            <p className="text-xs text-slate-custom">
                              {cert.installerCity || "Pakistan"} · Current Tier:{" "}
                              <span className="font-semibold text-ink capitalize">
                                {cert.installerTier || "Unverified"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div>
                          {cert.brandStatus === "approved" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-good bg-good-bg border border-good/30 px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved by Brand ({cert.brandRating || "5.0"} ★)
                            </span>
                          ) : cert.brandStatus === "rejected" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-danger bg-danger-bg border border-danger/30 px-3 py-1 rounded-full">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Claim Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-deep bg-amber/15 border border-amber/40 px-3 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Your Review
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-custom block text-[11px]">Claimed Certified Since:</span>
                          <span className="font-bold text-ink">{cert.certifiedSince || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-slate-custom block text-[11px]">Uploaded Certificate Proof:</span>
                          {cert.proofUrl ? (
                            <a
                              href={cert.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-deep hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <span>View Certificate Document</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-custom italic">None attached</span>
                          )}
                        </div>
                      </div>

                      {/* Display already approved ratings */}
                      {cert.brandStatus === "approved" && (
                        <div className="bg-cream p-3 rounded border border-line text-xs space-y-1">
                          <p className="font-bold text-navy-deep">Brand Ratings Given:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div>Quality of Installation: <b>{cert.brandRatings?.installationQuality ?? cert.brandRating ?? 5} / 5 ★</b></div>
                            <div>After-Sales Services: <b>{cert.brandRatings?.afterSalesQuality ?? cert.brandRating ?? 5} / 5 ★</b></div>
                            <div>Training Participation: <b>{cert.brandRatings?.trainingParticipation ?? cert.brandRating ?? 5} / 5 ★</b></div>
                          </div>
                          {cert.brandNotes && (
                            <p className="text-[11px] text-slate-custom pt-1">
                              Note: &quot;{cert.brandNotes}&quot;
                            </p>
                          )}
                          <div className="pt-1 text-[11px]">
                            EnergyGurus Confirmation Status:{" "}
                            <b>{cert.adminStatus === "approved" ? "Confirmed (Live)" : "Pending Admin Confirmation"}</b>
                          </div>
                        </div>
                      )}

                      {/* Interactive Rating Form for Pending Certifications */}
                      {cert.brandStatus === "pending" && !isRatingThis && !isRejectingThis && (
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRatingCertId(cert.id);
                              setRejectingCertId(null);
                            }}
                            className="px-4 py-2 text-xs font-bold bg-amber hover:bg-amber-deep text-navy-deep rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Rate &amp; Approve Installer
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingCertId(cert.id);
                              setRatingCertId(null);
                            }}
                            className="px-4 py-2 text-xs font-bold border border-danger/40 text-danger hover:bg-danger-bg rounded transition-colors cursor-pointer"
                          >
                            Reject Claim
                          </button>
                        </div>
                      )}

                      {/* Rating Form Mode */}
                      {isRatingThis && (
                        <div className="bg-white border-2 border-amber/40 rounded p-4 space-y-4 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-line pb-2">
                            <h4 className="font-bold text-xs text-navy-deep uppercase tracking-wider">
                              Rate Installer Across 3 Brand Grounds (1 to 5 Stars)
                            </h4>
                            <span className="font-bold text-xs text-amber-deep bg-amber/15 px-2 py-0.5 rounded border border-amber/30">
                              Average: {avgRating} ★
                            </span>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <div className="flex justify-between font-semibold mb-1">
                                <span>1. Quality of Installation</span>
                                <span className="font-bold text-amber-deep">{qInstallation} / 5 ★</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={qInstallation}
                                onChange={(e) => setQInstallation(Number(e.target.value))}
                                className="w-full accent-amber cursor-pointer"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between font-semibold mb-1">
                                <span>2. Quality of After-Sales Services</span>
                                <span className="font-bold text-amber-deep">{qAfterSales} / 5 ★</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={qAfterSales}
                                onChange={(e) => setQAfterSales(Number(e.target.value))}
                                className="w-full accent-amber cursor-pointer"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between font-semibold mb-1">
                                <span>3. Active Participation in Training Sessions</span>
                                <span className="font-bold text-amber-deep">{qTraining} / 5 ★</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={qTraining}
                                onChange={(e) => setQTraining(Number(e.target.value))}
                                className="w-full accent-amber cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-navy-deep mb-1">
                                Brand Verification Notes / Remarks
                              </label>
                              <textarea
                                rows={2}
                                placeholder="e.g. Completed 2026 authorized product training course and verified 5 commercial installations."
                                value={certNotes}
                                onChange={(e) => setCertNotes(e.target.value)}
                                className="w-full text-xs p-2.5 bg-paper border border-line rounded focus:border-amber focus:outline-none"
                              ></textarea>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => setRatingCertId(null)}
                              className="px-3.5 py-1.5 text-xs font-bold border border-line hover:bg-cream rounded transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isProcessingCert}
                              onClick={() => handleApproveCert(cert.id)}
                              className="px-4 py-1.5 text-xs font-bold bg-amber hover:bg-amber-deep text-navy-deep rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                            >
                              {isProcessingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Confirm &amp; Submit Rating ({avgRating} ★)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reject Form Mode */}
                      {isRejectingThis && (
                        <div className="bg-white border-2 border-danger/30 rounded p-4 space-y-3 animate-in fade-in">
                          <h4 className="font-bold text-xs text-danger uppercase tracking-wider">
                            Reject Certification Claim
                          </h4>
                          <div>
                            <label className="block text-xs font-bold text-navy-deep mb-1">
                              Reason for Rejection <span className="text-danger">*</span>
                            </label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Expired credentials, no record of certificate issue in local distributor records..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="w-full text-xs p-2.5 bg-paper border border-line rounded focus:border-danger focus:outline-none"
                              required
                            ></textarea>
                          </div>
                          <div className="flex justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={() => setRejectingCertId(null)}
                              className="px-3.5 py-1.5 text-xs font-bold border border-line hover:bg-cream rounded transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isProcessingCert}
                              onClick={() => handleRejectCert(cert.id)}
                              className="px-4 py-1.5 text-xs font-bold bg-danger hover:bg-danger/90 text-white rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                            >
                              {isProcessingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

              {!isLiveLocked && (
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
              )}
            </div>

            <fieldset disabled={isLiveLocked} className="space-y-4">
            <div className="space-y-4">
              {distributors.map((dist, idx) => (
                <div key={idx} className="p-4 bg-paper border border-line rounded-[3px] space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                      Distributor #{idx + 1}
                    </span>
                    {!isLiveLocked && (
                      <button
                        type="button"
                        onClick={() => setDistributors(distributors.filter((_, i) => i !== idx))}
                        className="text-danger hover:text-red-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
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
            </fieldset>
          </section>

          {/* SECTION 4: RETAILERS & DEALERS */}
          <section id="sec-retailers" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                  4. Authorized Retailers &amp; Solar Shops ({retailers.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  Verified retail partner shops, market dealers, and local authorized stockists.
                </p>
              </div>

              {!isLiveLocked && (
                <button
                  type="button"
                  onClick={() =>
                    setRetailers([
                      ...retailers,
                      { name: "", city: "Lahore", address: "", phone: "", whatsapp: "", mapUrl: "" }
                    ])
                  }
                  className="px-3.5 py-1.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Retailer
                </button>
              )}
            </div>

            <fieldset disabled={isLiveLocked} className="space-y-4">

            {retailers.length === 0 ? (
              <p className="text-xs text-slate-custom italic py-2">
                No retailers added yet. Click &quot;Add Retailer&quot; above to list authorized shops and local dealers.
              </p>
            ) : (
              <div className="space-y-4">
                {retailers.map((ret, idx) => (
                  <div key={idx} className="p-4 bg-paper border border-line rounded-[3px] space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                        Retailer / Dealer #{idx + 1}
                      </span>
                      {!isLiveLocked && (
                        <button
                          type="button"
                          onClick={() => setRetailers(retailers.filter((_, i) => i !== idx))}
                          className="text-danger hover:text-red-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Shop / Business Name *</label>
                        <input
                          type="text"
                          value={ret.name || ""}
                          placeholder="e.g. Al-Madina Solar Traders"
                          onChange={(e) => {
                            const list = [...retailers];
                            list[idx].name = e.target.value;
                            setRetailers(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">City</label>
                        <input
                          type="text"
                          value={ret.city || ""}
                          placeholder="e.g. Rawalpindi"
                          onChange={(e) => {
                            const list = [...retailers];
                            list[idx].city = e.target.value;
                            setRetailers(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={ret.phone || ""}
                          placeholder="0300-1234567"
                          onChange={(e) => {
                            const list = [...retailers];
                            list[idx].phone = e.target.value;
                            setRetailers(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={ret.whatsapp || ""}
                          placeholder="+92 300 1234567"
                          onChange={(e) => {
                            const list = [...retailers];
                            list[idx].whatsapp = e.target.value;
                            setRetailers(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Google Maps Link</label>
                        <input
                          type="url"
                          value={ret.mapUrl || ""}
                          placeholder="https://maps.google.com/..."
                          onChange={(e) => {
                            const list = [...retailers];
                            list[idx].mapUrl = e.target.value;
                            setRetailers(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Shop Address</label>
                        <input
                          type="text"
                          value={ret.address || ""}
                          placeholder="Shop # 12, Hall Road, Lahore"
                          onChange={(e) => {
                            const list = [...retailers];
                            list[idx].address = e.target.value;
                            setRetailers(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </fieldset>
          </section>

          {/* SECTION 5: SERVICE CENTRES */}
          <section id="sec-centres" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                  5. Flagship Stores &amp; Service Centres ({serviceCentres.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  Official repair, RMA collection, and in-person diagnostics locations.
                </p>
              </div>

              {!isLiveLocked && (
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
              )}
            </div>

            <fieldset disabled={isLiveLocked} className="space-y-4">
            <div className="space-y-4">
              {serviceCentres.map((centre, idx) => (
                <div key={idx} className="p-4 bg-paper border border-line rounded-[3px] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                      Location #{idx + 1}
                    </span>
                    {!isLiveLocked && (
                      <button
                        type="button"
                        onClick={() => setServiceCentres(serviceCentres.filter((_, i) => i !== idx))}
                        className="text-danger hover:text-red-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
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
            </fieldset>
          </section>

          {/* SECTION 6: LOCAL PAKISTAN TEAM */}
          <section id="sec-team" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-fraunces text-lg font-bold text-navy-deep">
                  6. Local Pakistan Team &amp; Key Representatives ({team.length})
                </h2>
                <p className="text-xs text-slate-custom mt-1">
                  Country managers, sales directors, and technical support leads based in Pakistan.
                </p>
              </div>

              {!isLiveLocked && (
                <button
                  type="button"
                  onClick={() =>
                    setTeam([
                      ...team,
                      { name: "", designation: "Country Manager - Pakistan", email: "", phone: "", linkedIn: "", photoUrl: "" }
                    ])
                  }
                  className="px-3.5 py-1.5 bg-amber hover:bg-amber-deep text-navy-deep font-bold text-xs rounded-[3px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Team Member
                </button>
              )}
            </div>

            <fieldset disabled={isLiveLocked} className="space-y-4">
            {team.length === 0 ? (
              <p className="text-xs text-slate-custom italic py-2">
                No team members listed yet. Click &quot;Add Team Member&quot; above to list key representatives in Pakistan.
              </p>
            ) : (
              <div className="space-y-4">
                {team.map((member, idx) => (
                  <div key={idx} className="p-4 bg-paper border border-line rounded-[3px] space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-amber-deep uppercase tracking-wider">
                        Team Member #{idx + 1}
                      </span>
                      {!isLiveLocked && (
                        <button
                          type="button"
                          onClick={() => setTeam(team.filter((_, i) => i !== idx))}
                          className="text-danger hover:text-red-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={member.name || ""}
                          placeholder="e.g. Engr. Ahmad Khan"
                          onChange={(e) => {
                            const list = [...team];
                            list[idx].name = e.target.value;
                            setTeam(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Designation / Role *</label>
                        <input
                          type="text"
                          value={member.designation || ""}
                          placeholder="e.g. Head of Technical Support"
                          onChange={(e) => {
                            const list = [...team];
                            list[idx].designation = e.target.value;
                            setTeam(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Official Email</label>
                        <input
                          type="email"
                          value={member.email || ""}
                          placeholder="ahmad@brand.com"
                          onChange={(e) => {
                            const list = [...team];
                            list[idx].email = e.target.value;
                            setTeam(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">Phone / WhatsApp</label>
                        <input
                          type="text"
                          value={member.phone || ""}
                          placeholder="+92 300 0000000"
                          onChange={(e) => {
                            const list = [...team];
                            list[idx].phone = e.target.value;
                            setTeam(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-navy-deep mb-1">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          value={member.linkedIn || ""}
                          placeholder="https://linkedin.com/in/..."
                          onChange={(e) => {
                            const list = [...team];
                            list[idx].linkedIn = e.target.value;
                            setTeam(list);
                          }}
                          className="w-full text-xs p-2 bg-white border border-line rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </fieldset>
          </section>

          {/* SECTION 7: APPROVAL HISTORY */}
          <section id="sec-history" className="bg-white border border-line rounded-[4px] p-6 md:p-8 shadow-sm space-y-4 scroll-mt-24">
            <h2 className="font-fraunces text-lg font-bold text-navy-deep border-b border-line pb-3">
              7. Submission & Approval Audit History
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
                          &quot;{item.note}&quot;
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
