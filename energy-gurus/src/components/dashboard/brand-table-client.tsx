"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Eye,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  ShieldCheck,
  Package,
  Store,
  Users,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  adminUpdateBrandFull,
  adminUpdateBrandStatusActionDirect,
  deleteBrandAction,
  getBrandFullDetails,
} from "@/lib/actions/admin-brand-actions";
import { useRouter } from "next/navigation";

export interface BrandListItem {
  id: string;
  userId: string;
  brandName: string;
  slug: string | null;
  tagline: string | null;
  categories: string[] | null;
  countryHead: string | null;
  customerCareHead: string | null;
  logoUrl: string | null;
  about: string | null;
  countryOfOrigin: string | null;
  headquarters: string | null;
  founded: string | null;
  website: string | null;
  warrantyUrl: string | null;
  customerCare: string | null;
  customerCareEmail: string | null;
  headOffice: string | null;
  status: "draft" | "pending_review" | "changes_requested" | "live" | null;
  isVerified: boolean | null;
  adminFeedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  distributors: any;
  retailers: any;
  serviceCentres: any;
  certifiedInstallers: any;
  team: any;
  reps: any;
  socialLinks: any;
  userIsActive: boolean | null;
  userEmail: string | null;
  productsCount: number;
}

export function BrandTableClient({ initialBrands }: { initialBrands: BrandListItem[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandListItem[]>(initialBrands);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // View modal state
  const [viewingBrand, setViewingBrand] = useState<any | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Edit modal state
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingBrand, setDeletingBrand] = useState<BrandListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editBrandName, setEditBrandName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editCountryOfOrigin, setEditCountryOfOrigin] = useState("China");
  const [editHeadquarters, setEditHeadquarters] = useState("");
  const [editFounded, setEditFounded] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editWarrantyUrl, setEditWarrantyUrl] = useState("");
  const [editCustomerCare, setEditCustomerCare] = useState("");
  const [editCustomerCareEmail, setEditCustomerCareEmail] = useState("");
  const [editHeadOffice, setEditHeadOffice] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editIsVerified, setEditIsVerified] = useState(true);
  const [editStatus, setEditStatus] = useState<"draft" | "pending_review" | "changes_requested" | "live">("live");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editDistributors, setEditDistributors] = useState<any[]>([]);
  const [editProducts, setEditProducts] = useState<any[]>([]);

  // Filtering
  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.brandName.toLowerCase().includes(search.toLowerCase()) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (b.countryOfOrigin && b.countryOfOrigin.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "verified" && b.isVerified) ||
      (selectedStatus === "live" && b.status === "live") ||
      (selectedStatus === "pending" && b.status === "pending_review") ||
      (selectedStatus === "draft" && b.status === "draft");

    return matchesSearch && matchesStatus;
  });

  const handleOpenView = async (b: BrandListItem) => {
    setIsViewLoading(true);
    setViewingBrand(b);
    try {
      const details = await getBrandFullDetails(b.id);
      if (details) {
        setViewingBrand(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (b: BrandListItem) => {
    setIsEditLoading(true);
    try {
      const details = await getBrandFullDetails(b.id);
      const data: any = details || b;
      setEditingBrand(data);
      setEditBrandName(data.brandName || "");
      setEditTagline(data.tagline || "");
      setEditCountryOfOrigin(data.countryOfOrigin || "China");
      setEditHeadquarters(data.headquarters || "");
      setEditFounded(data.founded || "");
      setEditWebsite(data.website || "");
      setEditWarrantyUrl(data.warrantyUrl || "");
      setEditCustomerCare(data.customerCare || "");
      setEditCustomerCareEmail(data.customerCareEmail || "");
      setEditHeadOffice(data.headOffice || "");
      setEditAbout(data.about || "");
      setEditIsVerified(!!data.isVerified);
      setEditStatus(data.status || "live");
      setEditCategories(Array.isArray(data.categories) ? data.categories : ["Inverters"]);
      setEditDistributors(Array.isArray(data.distributors) ? data.distributors : []);
      setEditProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      toast.error("Failed to load brand details for editing");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingBrand) return;
    if (!editBrandName.trim()) {
      toast.error("Brand name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const res = await adminUpdateBrandFull(editingBrand.id, {
        brandName: editBrandName.trim(),
        tagline: editTagline.trim() || null,
        countryOfOrigin: editCountryOfOrigin.trim() || null,
        headquarters: editHeadquarters.trim() || null,
        founded: editFounded.trim() || null,
        website: editWebsite.trim() || null,
        warrantyUrl: editWarrantyUrl.trim() || null,
        customerCare: editCustomerCare.trim() || null,
        customerCareEmail: editCustomerCareEmail.trim() || null,
        headOffice: editHeadOffice.trim() || null,
        about: editAbout.trim() || null,
        isVerified: editIsVerified,
        status: editStatus,
        categories: editCategories,
        distributors: editDistributors,
        products: editProducts,
      });

      if (res.success) {
        toast.success(res.message);
        setBrands((prev) =>
          prev.map((item) =>
            item.id === editingBrand.id
              ? {
                  ...item,
                  brandName: editBrandName.trim(),
                  tagline: editTagline.trim() || null,
                  countryOfOrigin: editCountryOfOrigin.trim() || null,
                  isVerified: editIsVerified,
                  status: editStatus,
                  categories: editCategories,
                  productsCount: editProducts.length,
                }
              : item
          )
        );
        setEditingBrand(null);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update brand");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    setIsDeleting(true);
    try {
      const res = await deleteBrandAction(deletingBrand.id, deletingBrand.userId);
      if (res.success) {
        toast.success(res.message);
        setBrands((prev) => prev.filter((b) => b.id !== deletingBrand.id));
        setDeletingBrand(null);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete brand");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete brand");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-line shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand name, email, or country..."
            className="pl-10 h-10 rounded-xl bg-slate-50 border-line text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Brands", val: "all" },
            { label: "Verified", val: "verified" },
            { label: "Live", val: "live" },
            { label: "In Review", val: "pending" },
            { label: "Drafts", val: "draft" },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setSelectedStatus(item.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedStatus === item.val
                  ? "bg-amber text-ink shadow-sm"
                  : "bg-slate-100 text-slate-custom hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-sm">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-custom/40 mx-auto" />
            <h3 className="font-bold text-base text-ink">No Brands Found</h3>
            <p className="text-xs text-slate-custom">
              {search || selectedStatus !== "all"
                ? "Try adjusting your search criteria."
                : "No brands have been onboarded yet. Use the Onboard New Brand tab to register companies."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-line text-[11px] font-black uppercase tracking-wider text-slate-custom">
                  <th className="p-5">Brand</th>
                  <th className="p-5">Origin / HQ</th>
                  <th className="p-5">Equipment</th>
                  <th className="p-5">Products</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredBrands.map((b) => {
                  const isLive = b.status === "live";
                  const isPending = b.status === "pending_review";
                  const isChangesReq = b.status === "changes_requested";

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3.5">
                          <Avatar className="h-11 w-11 rounded-xl border border-line bg-white shadow-sm shrink-0">
                            <AvatarImage src={b.logoUrl || undefined} className="object-contain p-1" />
                            <AvatarFallback className="bg-amber/15 text-amber-deep font-bold rounded-xl text-xs">
                              {b.brandName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-ink">{b.brandName}</span>
                              {b.isVerified && (
                                <span title="Verified Brand">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-custom line-clamp-1">
                              {b.tagline || b.userEmail || "Solar Manufacturer"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-xs text-slate-custom">
                        <span className="font-semibold text-ink">{b.countryOfOrigin || "China"}</span>
                        {b.headquarters && <p className="text-[11px] text-slate-custom line-clamp-1">{b.headquarters}</p>}
                      </td>

                      <td className="p-5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(b.categories || ["Inverters"]).slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-line"
                            >
                              {cat}
                            </span>
                          ))}
                          {(b.categories?.length || 0) > 2 && (
                            <span className="text-[10px] text-slate-custom font-semibold">
                              +{(b.categories?.length || 0) - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber/10 text-amber-900 border border-amber/20">
                          <Package className="w-3.5 h-3.5 text-amber" /> {b.productsCount || 0} Models
                        </span>
                      </td>

                      <td className="p-5">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Live
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber/15 text-amber-deep border border-amber/30">
                            Pending Review
                          </span>
                        ) : isChangesReq ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                            Changes Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenView(b)}
                            title="View Brand Profile"
                            className="h-8 w-8 p-0 rounded-lg text-slate-custom hover:text-ink hover:bg-slate-100"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Profile"
                            className="h-8 w-8 p-0 rounded-lg text-slate-custom hover:text-amber-deep hover:bg-amber/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingBrand(b)}
                            title="Delete Brand"
                            className="h-8 w-8 p-0 rounded-lg text-slate-custom hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW BRAND PROFILE DIALOG */}
      <Dialog open={!!viewingBrand} onOpenChange={(open) => !open && setViewingBrand(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          {viewingBrand && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border border-line bg-white shadow-md shrink-0">
                    <AvatarImage src={viewingBrand.logoUrl || undefined} className="object-contain p-2" />
                    <AvatarFallback className="bg-amber/15 text-amber-deep font-bold rounded-2xl text-lg">
                      {viewingBrand.brandName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-ink">{viewingBrand.brandName}</h2>
                      {viewingBrand.isVerified && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-custom mt-0.5">{viewingBrand.tagline || "Renewable Energy Manufacturer"}</p>
                  </div>
                </div>

                <Button asChild size="sm" className="rounded-xl font-bold bg-amber text-ink hover:bg-amber/90 gap-1.5 shrink-0">
                  <Link href={`/brands/${viewingBrand.slug || viewingBrand.id}`} target="_blank">
                    <ExternalLink className="w-3.5 h-3.5" /> View Public Page
                  </Link>
                </Button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-line space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">Origin & Headquarters</span>
                  <p className="font-semibold text-ink text-sm">{viewingBrand.countryOfOrigin || "China"}</p>
                  <p className="text-slate-custom">{viewingBrand.headquarters || "Global Headquarters"}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-line space-y-1">
                  <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">Account Contact</span>
                  <p className="font-semibold text-ink text-sm">{viewingBrand.userEmail || "No email linked"}</p>
                  <p className="text-slate-custom">{viewingBrand.customerCare || "Customer hotline not specified"}</p>
                </div>

                {viewingBrand.headOffice && (
                  <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-line space-y-1">
                    <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">Pakistan Head Office</span>
                    <p className="text-ink font-medium">{viewingBrand.headOffice}</p>
                  </div>
                )}

                {viewingBrand.about && (
                  <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-line space-y-1">
                    <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">About Brand</span>
                    <p className="text-ink leading-relaxed whitespace-pre-line">{viewingBrand.about}</p>
                  </div>
                )}
              </div>

              {/* Products preview */}
              {viewingBrand.products && viewingBrand.products.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber" /> Cataloged Products ({viewingBrand.products.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingBrand.products.map((p: any) => (
                      <div key={p.id || p.name} className="p-3 bg-white border border-line rounded-xl text-xs space-y-1 shadow-2xs">
                        <p className="font-bold text-ink">{p.name}</p>
                        <p className="text-slate-custom text-[11px]">{p.category} {p.series && `• ${p.series}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT BRAND PROFILE DIALOG */}
      <Dialog open={!!editingBrand} onOpenChange={(open) => !open && setEditingBrand(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          <DialogHeader className="border-b border-line pb-4">
            <DialogTitle className="text-xl font-bold text-ink flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber" /> Edit Brand Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-custom">
              Modify corporate information, equipment categories, distributors, products, and verification status.
            </DialogDescription>
          </DialogHeader>

          {editingBrand && (
            <div className="space-y-6 pt-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
                  <TabsTrigger value="general" className="rounded-lg text-xs font-bold">General Info</TabsTrigger>
                  <TabsTrigger value="presence" className="rounded-lg text-xs font-bold">Support & Office</TabsTrigger>
                  <TabsTrigger value="distributors" className="rounded-lg text-xs font-bold">Distributors ({editDistributors.length})</TabsTrigger>
                  <TabsTrigger value="products" className="rounded-lg text-xs font-bold">Products ({editProducts.length})</TabsTrigger>
                </TabsList>

                {/* Tab: General */}
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Brand Name *</Label>
                      <Input
                        value={editBrandName}
                        onChange={(e) => setEditBrandName(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm font-semibold border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Tagline</Label>
                      <Input
                        value={editTagline}
                        onChange={(e) => setEditTagline(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Country of Origin</Label>
                      <Input
                        value={editCountryOfOrigin}
                        onChange={(e) => setEditCountryOfOrigin(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Headquarters</Label>
                      <Input
                        value={editHeadquarters}
                        onChange={(e) => setEditHeadquarters(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Website</Label>
                      <Input
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Warranty Portal URL</Label>
                      <Input
                        value={editWarrantyUrl}
                        onChange={(e) => setEditWarrantyUrl(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-line flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-ink">Verified Profile Badge</p>
                        <p className="text-[11px] text-slate-custom">Displays green verified badge across directory</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editIsVerified}
                        onChange={(e) => setEditIsVerified(e.target.checked)}
                        className="w-5 h-5 rounded accent-amber cursor-pointer"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-line space-y-1">
                      <Label className="text-xs font-bold text-ink">Profile Publication Status</Label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full h-9 rounded-xl bg-white border border-line text-xs font-bold px-2"
                      >
                        <option value="live">Live (Publicly visible)</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="changes_requested">Changes Requested</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-bold text-slate-custom uppercase">About / Company History</Label>
                    <Textarea
                      rows={4}
                      value={editAbout}
                      onChange={(e) => setEditAbout(e.target.value)}
                      className="rounded-xl bg-slate-50 text-sm border-line"
                    />
                  </div>
                </TabsContent>

                {/* Tab: Support & Office */}
                <TabsContent value="presence" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Customer Care Hotline</Label>
                      <Input
                        value={editCustomerCare}
                        onChange={(e) => setEditCustomerCare(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Customer Care Email</Label>
                      <Input
                        value={editCustomerCareEmail}
                        onChange={(e) => setEditCustomerCareEmail(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-custom uppercase">Pakistan Head Office Address</Label>
                      <Input
                        value={editHeadOffice}
                        onChange={(e) => setEditHeadOffice(e.target.value)}
                        className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Distributors */}
                <TabsContent value="distributors" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-custom">National and regional supply distributors.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditDistributors([
                          ...editDistributors,
                          { name: "", city: "", phone: "", contactPerson: "", territory: "All Pakistan" }
                        ])
                      }
                      className="rounded-xl h-8 text-xs font-bold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Distributor
                    </Button>
                  </div>

                  {editDistributors.map((d, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-line grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
                      <Input
                        placeholder="Company Name"
                        value={d.name}
                        onChange={(e) => {
                          const updated = [...editDistributors];
                          updated[idx].name = e.target.value;
                          setEditDistributors(updated);
                        }}
                        className="h-9 bg-white text-xs border-line rounded-lg"
                      />
                      <Input
                        placeholder="City"
                        value={d.city}
                        onChange={(e) => {
                          const updated = [...editDistributors];
                          updated[idx].city = e.target.value;
                          setEditDistributors(updated);
                        }}
                        className="h-9 bg-white text-xs border-line rounded-lg"
                      />
                      <div className="flex gap-1 items-center">
                        <Input
                          placeholder="Phone"
                          value={d.phone || ""}
                          onChange={(e) => {
                            const updated = [...editDistributors];
                            updated[idx].phone = e.target.value;
                            setEditDistributors(updated);
                          }}
                          className="h-9 bg-white text-xs border-line rounded-lg flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setEditDistributors(editDistributors.filter((_, i) => i !== idx))}
                          className="text-slate-custom hover:text-red-600 p-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Tab: Products */}
                <TabsContent value="products" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-custom">Solar inverters, panels, batteries manufactured by brand.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditProducts([
                          ...editProducts,
                          { name: "", category: "Inverters", series: "", description: "" }
                        ])
                      }
                      className="rounded-xl h-8 text-xs font-bold gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Model
                    </Button>
                  </div>

                  {editProducts.map((p, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-line grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
                      <Input
                        placeholder="Model Name"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...editProducts];
                          updated[idx].name = e.target.value;
                          setEditProducts(updated);
                        }}
                        className="h-9 bg-white text-xs border-line rounded-lg font-bold"
                      />
                      <Input
                        placeholder="Category"
                        value={p.category || "Inverters"}
                        onChange={(e) => {
                          const updated = [...editProducts];
                          updated[idx].category = e.target.value;
                          setEditProducts(updated);
                        }}
                        className="h-9 bg-white text-xs border-line rounded-lg"
                      />
                      <div className="flex gap-1 items-center">
                        <Input
                          placeholder="Series (e.g. Commercial)"
                          value={p.series || ""}
                          onChange={(e) => {
                            const updated = [...editProducts];
                            updated[idx].series = e.target.value;
                            setEditProducts(updated);
                          }}
                          className="h-9 bg-white text-xs border-line rounded-lg flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setEditProducts(editProducts.filter((_, i) => i !== idx))}
                          className="text-slate-custom hover:text-red-600 p-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <DialogFooter className="border-t border-line pt-4 flex gap-3">
                <Button variant="outline" onClick={() => setEditingBrand(null)} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold shadow-md shadow-amber/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deletingBrand} onOpenChange={(open) => !open && setDeletingBrand(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Delete Brand Profile?</h3>
              <p className="text-xs text-slate-custom mt-1 leading-relaxed">
                Are you sure you want to delete <strong>{deletingBrand?.brandName}</strong>? All associated products, cataloged datasheets, and user login credentials will be removed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingBrand(null)}
                disabled={isDeleting}
                className="rounded-xl font-bold flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl font-bold flex-1"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Yes, Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
