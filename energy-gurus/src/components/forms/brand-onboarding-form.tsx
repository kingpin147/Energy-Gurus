"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardBrandAction } from "@/lib/actions/admin-brand-actions";
import { UploadZone } from "@/components/ui/upload-zone";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Building2,
  Package,
  Users,
  Store,
  Wrench,
  Globe,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Check
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Inverters",
  "Solar Panels",
  "Batteries",
  "BESS",
  "EV Chargers",
  "Mounting Structures",
  "Circuit Breakers"
];

interface ProductInput {
  name: string;
  category: string;
  series?: string;
  description?: string;
  datasheetUrl?: string;
  manualUrl?: string;
  warrantyYears?: string;
}

interface TeamMemberInput {
  name: string;
  designation: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

interface DistributorInput {
  name: string;
  city: string;
  territory: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

interface RetailerInput {
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp?: string;
}

interface ServiceCentreInput {
  name: string;
  city: string;
  address: string;
  phone: string;
  hotline?: string;
  hours?: string;
}

export function BrandOnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [createdBrandName, setCreatedBrandName] = useState<string>("");
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);

  const { uploadFile, isUploading } = useR2Upload();
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Inverters"]);
  const [customCategory, setCustomCategory] = useState("");

  // Repeatable sections
  const [team, setTeam] = useState<TeamMemberInput[]>([]);
  const [distributors, setDistributors] = useState<DistributorInput[]>([]);
  const [retailers, setRetailers] = useState<RetailerInput[]>([]);
  const [serviceCentres, setServiceCentres] = useState<ServiceCentreInput[]>([]);
  const [products, setProducts] = useState<ProductInput[]>([]);

  const handleLogoUpload = async (file: File) => {
    try {
      const { publicUrl } = await uploadFile(file, "brand-logos");
      setLogoUrl(publicUrl);
      toast.success("Brand logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload brand logo");
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) return;
    if (!selectedCategories.includes(customCategory.trim())) {
      setSelectedCategories((prev) => [...prev, customCategory.trim()]);
    }
    setCustomCategory("");
  };

  // Add item helpers
  const addTeamMember = () => {
    setTeam([...team, { name: "", designation: "", email: "", phone: "", linkedIn: "" }]);
  };
  const removeTeamMember = (idx: number) => {
    setTeam(team.filter((_, i) => i !== idx));
  };

  const addDistributor = () => {
    setDistributors([
      ...distributors,
      { name: "", city: "", territory: "All Pakistan", contactPerson: "", phone: "", email: "", address: "" }
    ]);
  };
  const removeDistributor = (idx: number) => {
    setDistributors(distributors.filter((_, i) => i !== idx));
  };

  const addRetailer = () => {
    setRetailers([...retailers, { name: "", city: "", address: "", phone: "", whatsapp: "" }]);
  };
  const removeRetailer = (idx: number) => {
    setRetailers(retailers.filter((_, i) => i !== idx));
  };

  const addServiceCentre = () => {
    setServiceCentres([...serviceCentres, { name: "", city: "", address: "", phone: "", hotline: "", hours: "9 AM - 6 PM" }]);
  };
  const removeServiceCentre = (idx: number) => {
    setServiceCentres(serviceCentres.filter((_, i) => i !== idx));
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", category: selectedCategories[0] || "Inverters", series: "", description: "", datasheetUrl: "", warrantyYears: "5" }
    ]);
  };
  const removeProduct = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setHasCopiedPassword(true);
    toast.success("Password copied to clipboard!");
    setTimeout(() => setHasCopiedPassword(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formEl = e.currentTarget;
      const formData = new FormData(formEl);

      if (logoUrl) {
        formData.set("logoUrl", logoUrl);
      }

      // Append multi-select categories
      formData.delete("categories");
      selectedCategories.forEach((cat) => formData.append("categories", cat));

      // Append JSON lists
      formData.set("team", JSON.stringify(team.filter((t) => t.name.trim())));
      formData.set("distributors", JSON.stringify(distributors.filter((d) => d.name.trim())));
      formData.set("retailers", JSON.stringify(retailers.filter((r) => r.name.trim())));
      formData.set("serviceCentres", JSON.stringify(serviceCentres.filter((s) => s.name.trim())));
      formData.set("products", JSON.stringify(products.filter((p) => p.name.trim())));

      const brandNameVal = formData.get("brandName") as string;
      const res = await onboardBrandAction(formData);

      if (res.success) {
        setCreatedBrandName(brandNameVal || "Brand");
        setGeneratedPassword(res.password || null);
        setIsSubmitted(true);
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to onboard brand");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-line rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-ink">Brand Successfully Onboarded!</h2>
          <p className="text-sm text-slate-custom">
            <strong>{createdBrandName}</strong> has been registered with a completed dashboard profile and marked verified & live.
          </p>
        </div>

        {generatedPassword && (
          <div className="bg-paper p-6 rounded-2xl border border-line text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-custom">
                Generated Account Password
              </span>
              <span className="text-xs text-amber font-bold">Share with Brand Representative</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                readOnly
                value={generatedPassword}
                className="font-mono text-sm bg-white border-line select-all"
              />
              <Button
                type="button"
                onClick={handleCopyPassword}
                variant="outline"
                className="rounded-xl shrink-0 gap-2 font-bold"
              >
                {hasCopiedPassword ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setGeneratedPassword(null);
            }}
            variant="outline"
            className="rounded-xl font-bold"
          >
            Onboard Another Brand
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/dashboard/admin/onboard-brand")}
            className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold"
          >
            View Onboarded Brands Table
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* 1. Account & Brand Information */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber/15 text-amber-deep flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">1. Account & Basic Brand Information</h3>
            <p className="text-xs text-slate-custom">Login credentials and primary corporate identity details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Admin / Representative Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="representative@solarmaker.com"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-custom">Used for Clerk authentication. A secure password will be auto-generated.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Brand Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brandName"
              name="brandName"
              required
              placeholder="e.g. Huawei Digital Power, Growatt, Longi"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Tagline / Slogan
            </Label>
            <Input
              id="tagline"
              name="tagline"
              placeholder="e.g. Leading Renewable Energy Worldwide"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfOrigin" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Country of Origin
            </Label>
            <Input
              id="countryOfOrigin"
              name="countryOfOrigin"
              defaultValue="China"
              placeholder="e.g. China, Germany, USA"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headquarters" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Headquarters Location
            </Label>
            <Input
              id="headquarters"
              name="headquarters"
              placeholder="e.g. Shenzhen, China"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="founded" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Year Founded
            </Label>
            <Input
              id="founded"
              name="founded"
              placeholder="e.g. 2005"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Website URL
            </Label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="website"
                name="website"
                placeholder="https://www.brand-solar.com"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warrantyUrl" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Warranty Portal URL
            </Label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                id="warrantyUrl"
                name="warrantyUrl"
                placeholder="https://warranty.brand-solar.com"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-line text-sm"
              />
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
            Equipment Categories
          </Label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CATEGORIES.map((cat) => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? "bg-amber text-ink border-amber shadow-sm"
                      : "bg-slate-50 text-slate-custom border-line hover:border-slate-300"
                  }`}
                >
                  {cat} {active && "✓"}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 max-w-sm pt-1">
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Add other category..."
              className="h-9 rounded-xl text-xs bg-slate-50 border-line"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomCategory}
              className="rounded-xl h-9 font-bold"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Brand Logo Upload */}
        <div className="space-y-2 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-custom">
            Brand Logo
          </Label>
          <UploadZone
            onUpload={handleLogoUpload}
            isUploading={isUploading}
            value={logoUrl}
            title="Upload Brand Logo"
            description="PNG, SVG or JPG format with transparent or white background"
            accept="image/*"
          />
        </div>
      </div>

      {/* 2. Contact & Regional Presence */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">2. Local Support & Corporate Office</h3>
            <p className="text-xs text-slate-custom">Customer care numbers, regional head office, and leaders.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="customerCare" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Customer Care Hotline
            </Label>
            <Input
              id="customerCare"
              name="customerCare"
              placeholder="e.g. 0800-SOLAR / +92 42 111 000 111"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCareEmail" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Customer Care Email
            </Label>
            <Input
              id="customerCareEmail"
              name="customerCareEmail"
              type="email"
              placeholder="service.pk@solarmaker.com"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryHead" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Country Manager / Head
            </Label>
            <Input
              id="countryHead"
              name="countryHead"
              placeholder="e.g. Engr. Hamza Malik"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCareHead" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Head of Customer Service
            </Label>
            <Input
              id="customerCareHead"
              name="customerCareHead"
              placeholder="e.g. Tariq Javed"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="headOffice" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              Pakistan Head Office Address
            </Label>
            <Input
              id="headOffice"
              name="headOffice"
              placeholder="e.g. Suite 402, Al-Tahir Mall, Gulberg III, Lahore, Pakistan"
              className="h-11 rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="about" className="text-xs font-bold uppercase tracking-wider text-slate-custom">
              About the Brand
            </Label>
            <Textarea
              id="about"
              name="about"
              rows={4}
              placeholder="Provide an overview of the brand's history, technological achievements, and Tier-1 market standing..."
              className="rounded-xl bg-slate-50 border-line text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Representatives & Local Team */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">3. Local Team & Key Representatives</h3>
              <p className="text-xs text-slate-custom">Technical, commercial, and after-sales representatives in Pakistan.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTeamMember}
            className="rounded-xl font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>

        {team.length === 0 ? (
          <p className="text-xs text-slate-custom italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-line">
            No team members added yet. Click &quot;Add Member&quot; to include regional contacts.
          </p>
        ) : (
          <div className="space-y-4">
            {team.map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-line relative space-y-4">
                <button
                  type="button"
                  onClick={() => removeTeamMember(idx)}
                  className="absolute top-3 right-3 text-slate-custom hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Name *"
                    value={m.name}
                    onChange={(e) => {
                      const updated = [...team];
                      updated[idx].name = e.target.value;
                      setTeam(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                  <Input
                    placeholder="Designation (e.g. Regional Sales Head)"
                    value={m.designation}
                    onChange={(e) => {
                      const updated = [...team];
                      updated[idx].designation = e.target.value;
                      setTeam(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                  <Input
                    placeholder="Email"
                    value={m.email || ""}
                    onChange={(e) => {
                      const updated = [...team];
                      updated[idx].email = e.target.value;
                      setTeam(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Authorized Distributors */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">4. Authorized National Distributors</h3>
              <p className="text-xs text-slate-custom">Official warranty and supply partners across Pakistan.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDistributor}
            className="rounded-xl font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Distributor
          </Button>
        </div>

        {distributors.length === 0 ? (
          <p className="text-xs text-slate-custom italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-line">
            No distributors added. Click &quot;Add Distributor&quot; to list partners.
          </p>
        ) : (
          <div className="space-y-4">
            {distributors.map((d, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-line relative space-y-3">
                <button
                  type="button"
                  onClick={() => removeDistributor(idx)}
                  className="absolute top-3 right-3 text-slate-custom hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Distributor Company Name *"
                    value={d.name}
                    onChange={(e) => {
                      const updated = [...distributors];
                      updated[idx].name = e.target.value;
                      setDistributors(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                  <Input
                    placeholder="City (e.g. Lahore, Karachi)"
                    value={d.city}
                    onChange={(e) => {
                      const updated = [...distributors];
                      updated[idx].city = e.target.value;
                      setDistributors(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                  <Input
                    placeholder="Phone"
                    value={d.phone}
                    onChange={(e) => {
                      const updated = [...distributors];
                      updated[idx].phone = e.target.value;
                      setDistributors(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Initial Product Catalog */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-line shadow-sm space-y-6">
        <div className="border-b border-line pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber/15 text-amber-deep flex items-center justify-center">
              <Package className="w-5 h-5 text-amber" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">5. Product Models & Equipment</h3>
              <p className="text-xs text-slate-custom">Catalog solar panels, inverters, or battery models manufactured by the brand.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProduct}
            className="rounded-xl font-bold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-xs text-slate-custom italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-line">
            No products added yet. Products can also be added or managed anytime in the brand edit view.
          </p>
        ) : (
          <div className="space-y-4">
            {products.map((p, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-line relative space-y-3">
                <button
                  type="button"
                  onClick={() => removeProduct(idx)}
                  className="absolute top-3 right-3 text-slate-custom hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Model Name (e.g. SUN2000-100KTL-M2) *"
                    value={p.name}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[idx].name = e.target.value;
                      setProducts(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line font-medium"
                  />
                  <Input
                    placeholder="Category (e.g. Inverters)"
                    value={p.category}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[idx].category = e.target.value;
                      setProducts(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                  <Input
                    placeholder="Series (e.g. High-Voltage Commercial)"
                    value={p.series || ""}
                    onChange={(e) => {
                      const updated = [...products];
                      updated[idx].series = e.target.value;
                      setProducts(updated);
                    }}
                    className="h-10 rounded-xl bg-white text-xs border-line"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-line">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/admin/onboard-brand")}
          className="rounded-xl font-bold h-12 px-6"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-amber text-ink hover:bg-amber/90 rounded-xl font-bold h-12 px-8 shadow-lg shadow-amber/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning Account...
            </>
          ) : (
            "Complete Brand Onboarding"
          )}
        </Button>
      </div>
    </form>
  );
}
