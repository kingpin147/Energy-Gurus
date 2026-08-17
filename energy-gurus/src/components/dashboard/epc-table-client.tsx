"use client";

import React, { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  Users,
  FolderGit2,
  Star,
  FileText,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  Globe,
  Calendar,
  AlertCircle,
  Maximize2,
  Minimize2,
  Plus,
  X
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
  getEpcFullDetails,
  adminUpdateEpcInstaller,
  deleteEpcInstallerAction,
} from "@/lib/actions/admin-epc-actions";

type EpcListItem = {
  id: string;
  userId: string;
  companyName: string;
  ceoName: string | null;
  email: string | null;
  contactNo: string | null;
  address: string | null;
  area: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  logoUrl: string | null;
  tier: string | null;
  isVerified: boolean | null;
  yearsInBusiness: number | null;
  regNumber: string | null;
  sectors: string[] | null;
  certifications: string[] | null;
  solarBrands: string[] | null;
  inverterBrands: string[] | null;
  batteryBrands: string[] | null;
  about: string | null;
  team: any;
  licenceDocuments: any;
  createdAt: Date;
  userIsActive: boolean | null;
  userEmail: string | null;
};

type TeamMemberInput = {
  name: string;
  designation: string;
  linkedIn: string;
  imageUrl: string;
};

type OfficeInput = {
  officeNumber: string;
  area: string;
  city: string;
};

type ProjectInput = {
  name: string;
  customerName: string;
  companyName: string;
  installationDate: string;
  city: string;
  country: string;
  systemSize: string;
  description: string;
  youtubeUrl: string;
};

export function EpcTableClient({ initialEpcs }: { initialEpcs: EpcListItem[] }) {
  const [epcs, setEpcs] = useState<EpcListItem[]>(initialEpcs);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");

  // View state
  const [viewEpcId, setViewEpcId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Edit state
  const [editEpc, setEditEpc] = useState<EpcListItem | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editTeam, setEditTeam] = useState<TeamMemberInput[]>([]);
  const [editOffices, setEditOffices] = useState<OfficeInput[]>([]);
  const [editProjects, setEditProjects] = useState<ProjectInput[]>([]);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<EpcListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter logic
  const filteredEpcs = epcs.filter((epc) => {
    const matchesSearch =
      !search ||
      epc.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (epc.ceoName && epc.ceoName.toLowerCase().includes(search.toLowerCase())) ||
      (epc.city && epc.city.toLowerCase().includes(search.toLowerCase())) ||
      (epc.email && epc.email.toLowerCase().includes(search.toLowerCase()));

    const matchesTier =
      tierFilter === "all" || epc.tier?.toLowerCase() === tierFilter.toLowerCase();

    const matchesVerified =
      verifiedFilter === "all"
        ? true
        : verifiedFilter === "verified"
        ? epc.isVerified === true
        : epc.isVerified !== true;

    return matchesSearch && matchesTier && matchesVerified;
  });

  // Handle View Click
  const handleOpenView = async (epcId: string) => {
    setViewEpcId(epcId);
    setIsLoadingView(true);
    setViewData(null);
    try {
      const data = await getEpcFullDetails(epcId);
      setViewData(data);
    } catch (err) {
      toast.error("Failed to load installer full details.");
    } finally {
      setIsLoadingView(false);
    }
  };

  // Handle Edit Click
  const handleOpenEdit = async (epc: EpcListItem) => {
    setEditEpc(epc);
    setIsLoadingEdit(true);
    setEditFormData({
      companyName: epc.companyName || "",
      ceoName: epc.ceoName || "",
      email: epc.email || epc.userEmail || "",
      contactNo: epc.contactNo || "",
      address: epc.address || "",
      area: epc.area || "",
      city: epc.city || "",
      country: epc.country || "Pakistan",
      website: epc.website || "",
      tier: epc.tier || "bronze",
      isVerified: epc.isVerified ?? false,
      yearsInBusiness: epc.yearsInBusiness ?? 0,
      regNumber: epc.regNumber || "",
      about: epc.about || "",
      sectors: epc.sectors ? epc.sectors.join(", ") : "",
      certifications: epc.certifications ? epc.certifications.join(", ") : "",
      solarBrands: epc.solarBrands ? epc.solarBrands.join(", ") : "",
      inverterBrands: epc.inverterBrands ? epc.inverterBrands.join(", ") : "",
      batteryBrands: epc.batteryBrands ? epc.batteryBrands.join(", ") : "",
    });

    setEditTeam(Array.isArray(epc.team) ? epc.team : []);
    setEditOffices([]);
    setEditProjects([]);

    try {
      const fullDetails = await getEpcFullDetails(epc.id);
      if (fullDetails) {
        if (Array.isArray(fullDetails.team)) setEditTeam(fullDetails.team);
        if (Array.isArray(fullDetails.offices)) {
          setEditOffices(
            fullDetails.offices.map((o: any) => ({
              officeNumber: o.officeNumber || "",
              area: o.area || "",
              city: o.city || "",
            }))
          );
        }
        if (Array.isArray(fullDetails.projects)) {
          setEditProjects(
            fullDetails.projects.map((p: any) => ({
              name: p.name || "",
              customerName: p.customerName || "",
              companyName: p.companyName || "",
              installationDate: p.installationDate || "",
              city: p.city || "",
              country: p.country || "Pakistan",
              systemSize: p.systemSize || "",
              description: p.description || "",
              youtubeUrl: p.youtubeUrl || "",
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Failed to fetch full details for edit:", err);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEpc) return;

    setIsUpdating(true);
    const sectorsArr = editFormData.sectors
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const certsArr = editFormData.certifications
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const solarArr = editFormData.solarBrands
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const inverterArr = editFormData.inverterBrands
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const batteryArr = editFormData.batteryBrands
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    const payload = {
      companyName: editFormData.companyName,
      ceoName: editFormData.ceoName,
      email: editFormData.email,
      contactNo: editFormData.contactNo,
      address: editFormData.address,
      area: editFormData.area,
      city: editFormData.city,
      country: editFormData.country,
      website: editFormData.website,
      tier: editFormData.tier as 'bronze' | 'silver' | 'gold',
      isVerified: editFormData.isVerified,
      yearsInBusiness: parseInt(editFormData.yearsInBusiness) || 0,
      regNumber: editFormData.regNumber,
      about: editFormData.about,
      sectors: sectorsArr,
      certifications: certsArr,
      solarBrands: solarArr,
      inverterBrands: inverterArr,
      batteryBrands: batteryArr,
      team: editTeam.filter((t) => t.name || t.designation),
      offices: editOffices.filter((o) => o.city || o.officeNumber || o.area),
      projects: editProjects.filter((p) => p.name || p.customerName || p.description),
    };

    const res = await adminUpdateEpcInstaller(editEpc.id, payload);
    setIsUpdating(false);

    if (res.success) {
      toast.success("Installer updated successfully");
      setEpcs((prev) =>
        prev.map((item) =>
          item.id === editEpc.id
            ? {
                ...item,
                ...payload,
                sectors: sectorsArr,
                certifications: certsArr,
                solarBrands: solarArr,
                inverterBrands: inverterArr,
                batteryBrands: batteryArr,
                team: editTeam,
              }
            : item
        )
      );
      setEditEpc(null);
    } else {
      toast.error(res.message || "Failed to update installer");
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const res = await deleteEpcInstallerAction(deleteTarget.id, deleteTarget.userId);
    setIsDeleting(false);

    if (res.success) {
      toast.success("Installer deleted successfully");
      setEpcs((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      toast.error(res.message || "Failed to delete installer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-line shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-custom" />
          <Input
            placeholder="Search company, CEO, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-line text-sm rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-custom" />
            <span className="text-xs font-semibold text-slate-custom uppercase tracking-wider">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="h-10 text-xs rounded-xl bg-slate-50 border border-line px-3 font-medium text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
            >
              <option value="all">All Tiers</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-custom uppercase tracking-wider">Status:</span>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="h-10 text-xs rounded-xl bg-slate-50 border border-line px-3 font-medium text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-line">
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-custom">Company</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-custom">CEO / Contact</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-custom">Location</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-custom">Tier</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-custom">Status</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-custom text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredEpcs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-custom">
                    <Building2 className="w-12 h-12 mx-auto text-slate-custom/40 mb-3" />
                    <p className="font-medium text-ink">No EPC Installers found</p>
                    <p className="text-xs text-slate-custom mt-1">Try adjusting search parameters or onboarding a new installer.</p>
                  </td>
                </tr>
              ) : (
                filteredEpcs.map((epc) => (
                  <tr key={epc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-line shadow-sm rounded-xl">
                          <AvatarImage src={epc.logoUrl || undefined} />
                          <AvatarFallback className="bg-amber/10 text-amber font-bold text-xs">
                            {epc.companyName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-ink text-sm group-hover:text-amber transition-colors">
                            {epc.companyName}
                          </div>
                          <div className="text-xs text-slate-custom flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {epc.email || epc.userEmail || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm">
                      <div className="font-semibold text-slate-700">{epc.ceoName || "N/A"}</div>
                      {epc.contactNo && (
                        <div className="text-xs text-slate-custom flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {epc.contactNo}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-sm text-slate-custom">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-custom shrink-0" />
                        {epc.city || "Pakistan"}
                      </div>
                      {epc.area && <div className="text-xs text-slate-custom truncate max-w-[150px]">{epc.area}</div>}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                          epc.tier === "gold"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : epc.tier === "silver"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        {epc.tier || "bronze"}
                      </span>
                    </td>

                    <td className="p-4">
                      {epc.isVerified ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs py-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs py-0.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </Badge>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(epc.id)}
                          className="h-8 px-2.5 rounded-lg text-slate-custom hover:text-ink hover:bg-slate-100"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="sr-only">View</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(epc)}
                          className="h-8 px-2.5 rounded-lg text-slate-custom hover:text-ink hover:bg-slate-100"
                          title="Edit Installer"
                        >
                          <Pencil className="w-4 h-4 text-amber-600" />
                          <span className="sr-only">Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(epc)}
                          className="h-8 px-2.5 rounded-lg text-slate-custom hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Installer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC EXPANDABLE VIEW MODAL */}
      <Dialog open={!!viewEpcId} onOpenChange={(open) => !open && setViewEpcId(null)}>
        <DialogContent
          className={`transition-all duration-300 rounded-3xl p-6 sm:p-8 ${
            isExpanded
              ? "sm:max-w-[96vw] md:max-w-[96vw] lg:max-w-[96vw] max-w-[96vw] w-[96vw] h-[92vh]"
              : "sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-[92vw] max-h-[90vh]"
          }`}
        >
          {isLoadingView || !viewData ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber mx-auto" />
              <p className="text-sm font-medium text-slate-custom">Loading complete installer profile details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-line pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-line rounded-2xl shadow-sm shrink-0">
                    <AvatarImage src={viewData.logoUrl || undefined} />
                    <AvatarFallback className="bg-amber/10 text-amber font-bold text-xl">
                      {viewData.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-ink">{viewData.companyName}</h2>
                      {viewData.isVerified ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Verified</Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                      )}
                      <Badge className="capitalize font-bold text-xs px-3 py-1 bg-amber/10 text-amber border-amber/30">
                        {viewData.tier || "Bronze"} Tier
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-custom flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-amber" /> CEO / Leader: <span className="font-semibold text-slate-700">{viewData.ceoName || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-9 px-3 rounded-xl gap-2 text-xs font-bold border-line hover:bg-slate-100"
                  >
                    {isExpanded ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" /> Normal View
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" /> Fullscreen View
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tabs for detail sections */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
                  <TabsTrigger value="overview" className="rounded-xl text-xs font-bold px-4 py-2">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="team" className="rounded-xl text-xs font-bold px-4 py-2">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Team Members ({viewData.team?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="rounded-xl text-xs font-bold px-4 py-2">
                    <FolderGit2 className="w-3.5 h-3.5 mr-1.5" /> Completed Projects ({viewData.projects?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="offices" className="rounded-xl text-xs font-bold px-4 py-2">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" /> Additional Offices ({viewData.offices?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-xl text-xs font-bold px-4 py-2">
                    <Star className="w-3.5 h-3.5 mr-1.5" /> Reviews ({viewData.reviews?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-line space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom border-b border-line pb-2">
                        Contact & Business Info
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-xs font-bold text-slate-custom block uppercase">Email</span>
                          <span className="text-ink font-medium flex items-center gap-2 mt-0.5">
                            <Mail className="w-4 h-4 text-amber shrink-0" /> {viewData.email || "N/A"}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-custom block uppercase">Contact Phone</span>
                          <span className="text-ink font-medium flex items-center gap-2 mt-0.5">
                            <Phone className="w-4 h-4 text-amber shrink-0" /> {viewData.contactNo || "N/A"}
                          </span>
                        </div>

                        {viewData.website && (
                          <div>
                            <span className="text-xs font-bold text-slate-custom block uppercase">Website</span>
                            <a
                              href={viewData.website.startsWith("http") ? viewData.website : `https://${viewData.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 font-medium flex items-center gap-2 mt-0.5 hover:underline"
                            >
                              <Globe className="w-4 h-4 text-blue-600 shrink-0" /> {viewData.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        <div>
                          <span className="text-xs font-bold text-slate-custom block uppercase">Address</span>
                          <span className="text-ink font-medium flex items-start gap-2 mt-0.5">
                            <MapPin className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                            <span>
                              {viewData.address || "N/A"}
                              {viewData.area ? `, ${viewData.area}` : ""}
                              {viewData.city ? `, ${viewData.city}` : ""}
                              {viewData.country ? `, ${viewData.country}` : ""}
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
                          <div>
                            <span className="text-xs font-bold text-slate-custom block uppercase">Experience</span>
                            <span className="text-ink font-semibold flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-amber" /> {viewData.yearsInBusiness ?? "N/A"} years
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-bold text-slate-custom block uppercase">Reg #</span>
                            <span className="text-ink font-semibold flex items-center gap-1.5 mt-0.5">
                              <FileText className="w-3.5 h-3.5 text-amber" /> {viewData.regNumber || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom">About Company</h4>
                        <div className="text-sm text-slate-700 bg-white p-5 rounded-2xl border border-line leading-relaxed min-h-[100px]">
                          {viewData.about || "No company description provided."}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 border border-line rounded-2xl bg-white space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom">Sectors</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {viewData.sectors && viewData.sectors.length > 0 ? (
                              viewData.sectors.map((sec: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-slate-100 font-semibold">{sec}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-custom">None specified</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 border border-line rounded-2xl bg-white space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom">Certifications</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {viewData.certifications && viewData.certifications.length > 0 ? (
                              viewData.certifications.map((cert: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">{cert}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-custom">None specified</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border border-line rounded-2xl bg-slate-50/50 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom">Brands Portfolio</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-700 block">Solar Panels:</span>
                            <div className="flex flex-wrap gap-1">
                              {viewData.solarBrands && viewData.solarBrands.length > 0 ? (
                                viewData.solarBrands.map((b: string, i: number) => (
                                  <Badge key={i} className="text-[11px] bg-white border-line font-medium text-slate-800">{b}</Badge>
                                ))
                              ) : (
                                <span className="text-xs text-slate-custom">-</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-700 block">Inverters:</span>
                            <div className="flex flex-wrap gap-1">
                              {viewData.inverterBrands && viewData.inverterBrands.length > 0 ? (
                                viewData.inverterBrands.map((b: string, i: number) => (
                                  <Badge key={i} className="text-[11px] bg-white border-line font-medium text-slate-800">{b}</Badge>
                                ))
                              ) : (
                                <span className="text-xs text-slate-custom">-</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-700 block">Batteries:</span>
                            <div className="flex flex-wrap gap-1">
                              {viewData.batteryBrands && viewData.batteryBrands.length > 0 ? (
                                viewData.batteryBrands.map((b: string, i: number) => (
                                  <Badge key={i} className="text-[11px] bg-white border-line font-medium text-slate-800">{b}</Badge>
                                ))
                              ) : (
                                <span className="text-xs text-slate-custom">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {viewData.licenceDocuments && viewData.licenceDocuments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-custom">License Documents</h4>
                          <div className="flex flex-wrap gap-3">
                            {viewData.licenceDocuments.map((docUrl: string, idx: number) => (
                              <a
                                key={idx}
                                href={docUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-3 bg-white border border-line rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                              >
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span>Document {idx + 1}</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* TEAM TAB */}
                <TabsContent value="team" className="mt-6">
                  {!viewData.team || viewData.team.length === 0 ? (
                    <div className="p-12 text-center text-slate-custom border border-dashed border-line rounded-2xl">
                      <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-medium">No team members listed for this installer.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {viewData.team.map((m: any, idx: number) => (
                        <div key={idx} className="p-4 border border-line rounded-2xl bg-white flex items-center gap-3.5 shadow-sm">
                          <Avatar className="h-12 w-12 border border-line shrink-0 rounded-xl">
                            <AvatarImage src={m.imageUrl || undefined} />
                            <AvatarFallback className="bg-amber/10 text-amber font-bold">{m.name ? m.name.substring(0, 2).toUpperCase() : "TM"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-ink text-sm truncate">{m.name || "Team Member"}</div>
                            <div className="text-xs text-slate-custom truncate">{m.designation || "Executive"}</div>
                            {m.linkedIn && (
                              <a href={m.linkedIn} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline block truncate mt-1">
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* PROJECTS TAB */}
                <TabsContent value="projects" className="mt-6">
                  {!viewData.projects || viewData.projects.length === 0 ? (
                    <div className="p-12 text-center text-slate-custom border border-dashed border-line rounded-2xl">
                      <FolderGit2 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-medium">No completed projects added yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {viewData.projects.map((proj: any) => (
                        <div key={proj.id} className="p-5 border border-line rounded-2xl bg-white space-y-3 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <h4 className="font-bold text-ink text-base">{proj.name}</h4>
                              {proj.systemSize && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">{proj.systemSize}</Badge>}
                            </div>
                            {proj.customerName && <p className="text-xs font-medium text-slate-custom">Client: {proj.customerName} {proj.companyName ? `(${proj.companyName})` : ''}</p>}
                            {proj.description && <p className="text-xs text-slate-700 leading-relaxed mt-2 line-clamp-4">{proj.description}</p>}
                          </div>
                          {proj.youtubeUrl && (
                            <a href={proj.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 pt-2 border-t border-line">
                              <ExternalLink className="w-3.5 h-3.5" /> Watch Project Video
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* OFFICES TAB */}
                <TabsContent value="offices" className="mt-6">
                  {!viewData.offices || viewData.offices.length === 0 ? (
                    <div className="p-12 text-center text-slate-custom border border-dashed border-line rounded-2xl">
                      <MapPin className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-medium">No additional office locations listed.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {viewData.offices.map((off: any) => (
                        <div key={off.id} className="p-5 border border-line rounded-2xl bg-white space-y-2 shadow-sm">
                          <div className="font-bold text-ink text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-amber" /> {off.city} Office
                          </div>
                          <p className="text-xs text-slate-custom">{off.officeNumber || off.block ? `${off.officeNumber || ''} ${off.block || ''}` : "Main Branch"}</p>
                          {off.area && <p className="text-xs font-medium text-slate-700">Area: {off.area}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* REVIEWS TAB */}
                <TabsContent value="reviews" className="mt-6">
                  {!viewData.reviews || viewData.reviews.length === 0 ? (
                    <div className="p-12 text-center text-slate-custom border border-dashed border-line rounded-2xl">
                      <Star className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-medium">No customer reviews recorded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewData.reviews.map((rev: any) => (
                        <div key={rev.id} className="p-5 border border-line rounded-2xl bg-white space-y-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-ink text-sm">{rev.authorName || "Verified Homeowner"}</div>
                            <div className="flex items-center gap-1 text-amber">
                              <Star className="w-4 h-4 fill-amber text-amber" />
                              <span className="text-xs font-bold">{rev.rating} / 5</span>
                            </div>
                          </div>
                          {rev.comment && <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FULL-FEATURED COMPREHENSIVE EDIT MODAL WITH TABS */}
      <Dialog open={!!editEpc} onOpenChange={(open) => !open && setEditEpc(null)}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-[94vw] max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader className="border-b border-line pb-4">
            <DialogTitle className="text-2xl font-bold text-ink">Edit EPC Installer</DialogTitle>
            <DialogDescription className="text-xs text-slate-custom">
              Edit all installer profile details, brands, team members, office locations, and completed projects.
            </DialogDescription>
          </DialogHeader>

          {isLoadingEdit ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber mx-auto" />
              <p className="text-xs font-medium text-slate-custom">Loading installer details for editing...</p>
            </div>
          ) : editEpc && (
            <form onSubmit={handleSaveEdit} className="space-y-6 mt-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
                  <TabsTrigger value="general" className="rounded-xl text-xs font-bold px-4 py-2">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" /> General Info
                  </TabsTrigger>
                  <TabsTrigger value="brands" className="rounded-xl text-xs font-bold px-4 py-2">
                    <Award className="w-3.5 h-3.5 mr-1.5" /> Brands & Sectors
                  </TabsTrigger>
                  <TabsTrigger value="team" className="rounded-xl text-xs font-bold px-4 py-2">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Team Members ({editTeam.length})
                  </TabsTrigger>
                  <TabsTrigger value="offices" className="rounded-xl text-xs font-bold px-4 py-2">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" /> Offices ({editOffices.length})
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="rounded-xl text-xs font-bold px-4 py-2">
                    <FolderGit2 className="w-3.5 h-3.5 mr-1.5" /> Projects ({editProjects.length})
                  </TabsTrigger>
                </TabsList>

                {/* EDIT TAB 1: GENERAL INFO */}
                <TabsContent value="general" className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Company Name *</Label>
                      <Input
                        required
                        value={editFormData.companyName}
                        onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">CEO / Owner Name</Label>
                      <Input
                        value={editFormData.ceoName}
                        onChange={(e) => setEditFormData({ ...editFormData, ceoName: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Email Address</Label>
                      <Input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Contact Number</Label>
                      <Input
                        value={editFormData.contactNo}
                        onChange={(e) => setEditFormData({ ...editFormData, contactNo: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">City</Label>
                      <Input
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Country</Label>
                      <Input
                        value={editFormData.country}
                        onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Full Address</Label>
                      <Input
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Area / Society</Label>
                      <Input
                        value={editFormData.area}
                        onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Tier</Label>
                      <select
                        value={editFormData.tier}
                        onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-line px-3 text-sm font-medium focus:outline-none"
                      >
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Verification Status</Label>
                      <select
                        value={editFormData.isVerified ? "true" : "false"}
                        onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.value === "true" })}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-line px-3 text-sm font-medium focus:outline-none"
                      >
                        <option value="false">Unverified (Pending)</option>
                        <option value="true">Verified</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Years in Business</Label>
                      <Input
                        type="number"
                        value={editFormData.yearsInBusiness}
                        onChange={(e) => setEditFormData({ ...editFormData, yearsInBusiness: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Reg Number</Label>
                      <Input
                        value={editFormData.regNumber}
                        onChange={(e) => setEditFormData({ ...editFormData, regNumber: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Website URL</Label>
                      <Input
                        value={editFormData.website}
                        onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-3">
                      <Label className="text-xs font-bold uppercase text-slate-custom">About / Bio</Label>
                      <Textarea
                        value={editFormData.about}
                        onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })}
                        rows={4}
                        className="bg-slate-50 border-line"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* EDIT TAB 2: BRANDS & SECTORS */}
                <TabsContent value="brands" className="mt-6 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Sectors (Comma Separated)</Label>
                      <Input
                        value={editFormData.sectors}
                        onChange={(e) => setEditFormData({ ...editFormData, sectors: e.target.value })}
                        placeholder="Residential, Commercial, Industrial, Agriculture"
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Certifications (Comma Separated)</Label>
                      <Input
                        value={editFormData.certifications}
                        onChange={(e) => setEditFormData({ ...editFormData, certifications: e.target.value })}
                        placeholder="AEDB Licence, PEC Licence"
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Solar Panel Brands (Comma Separated)</Label>
                      <Input
                        value={editFormData.solarBrands}
                        onChange={(e) => setEditFormData({ ...editFormData, solarBrands: e.target.value })}
                        placeholder="Longi, Jinko, Canadian Solar, Trina"
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Inverter Brands (Comma Separated)</Label>
                      <Input
                        value={editFormData.inverterBrands}
                        onChange={(e) => setEditFormData({ ...editFormData, inverterBrands: e.target.value })}
                        placeholder="Huawei, GoodWe, Sungrow, Growatt, Inverex"
                        className="bg-slate-50 border-line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-slate-custom">Battery Brands (Comma Separated)</Label>
                      <Input
                        value={editFormData.batteryBrands}
                        onChange={(e) => setEditFormData({ ...editFormData, batteryBrands: e.target.value })}
                        placeholder="Pylontech, Narada, BYD, Soluna"
                        className="bg-slate-50 border-line"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* EDIT TAB 3: TEAM MEMBERS */}
                <TabsContent value="team" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-ink">Manage Team Members</h4>
                      <p className="text-xs text-slate-custom">Add, edit, or remove executive and engineering team members.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditTeam([...editTeam, { name: "", designation: "", linkedIn: "", imageUrl: "" }])}
                      className="gap-1.5 text-xs font-bold rounded-xl border-line"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber" /> Add Team Member
                    </Button>
                  </div>

                  {editTeam.length === 0 ? (
                    <p className="text-xs text-slate-custom py-6 text-center border border-dashed border-line rounded-xl">No team members added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {editTeam.map((member, idx) => (
                        <div key={idx} className="p-4 border border-line rounded-2xl bg-slate-50/50 relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-custom">Member Name</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => {
                                const copy = [...editTeam];
                                copy[idx].name = e.target.value;
                                setEditTeam(copy);
                              }}
                              placeholder="e.g. Ali Ahmed"
                              className="bg-white border-line h-9 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-custom">Designation</Label>
                            <Input
                              value={member.designation}
                              onChange={(e) => {
                                const copy = [...editTeam];
                                copy[idx].designation = e.target.value;
                                setEditTeam(copy);
                              }}
                              placeholder="e.g. Lead Solar Engineer"
                              className="bg-white border-line h-9 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-custom">LinkedIn URL</Label>
                            <Input
                              value={member.linkedIn}
                              onChange={(e) => {
                                const copy = [...editTeam];
                                copy[idx].linkedIn = e.target.value;
                                setEditTeam(copy);
                              }}
                              placeholder="https://linkedin.com/in/..."
                              className="bg-white border-line h-9 text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-4 sm:pt-0">
                            <div className="space-y-1 flex-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">Photo URL</Label>
                              <Input
                                value={member.imageUrl}
                                onChange={(e) => {
                                  const copy = [...editTeam];
                                  copy[idx].imageUrl = e.target.value;
                                  setEditTeam(copy);
                                }}
                                placeholder="Image link"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditTeam(editTeam.filter((_, i) => i !== idx))}
                              className="h-9 px-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* EDIT TAB 4: ADDITIONAL OFFICES */}
                <TabsContent value="offices" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-ink">Manage Office Locations</h4>
                      <p className="text-xs text-slate-custom">Add or edit additional office branches across cities.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOffices([...editOffices, { city: "", officeNumber: "", area: "" }])}
                      className="gap-1.5 text-xs font-bold rounded-xl border-line"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber" /> Add Office Location
                    </Button>
                  </div>

                  {editOffices.length === 0 ? (
                    <p className="text-xs text-slate-custom py-6 text-center border border-dashed border-line rounded-xl">No additional office locations added.</p>
                  ) : (
                    <div className="space-y-3">
                      {editOffices.map((office, idx) => (
                        <div key={idx} className="p-4 border border-line rounded-2xl bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-custom">City *</Label>
                            <Input
                              value={office.city}
                              onChange={(e) => {
                                const copy = [...editOffices];
                                copy[idx].city = e.target.value;
                                setEditOffices(copy);
                              }}
                              placeholder="e.g. Lahore"
                              className="bg-white border-line h-9 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-custom">Office # / Address</Label>
                            <Input
                              value={office.officeNumber}
                              onChange={(e) => {
                                const copy = [...editOffices];
                                copy[idx].officeNumber = e.target.value;
                                setEditOffices(copy);
                              }}
                              placeholder="e.g. Office 302, Building A"
                              className="bg-white border-line h-9 text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="space-y-1 flex-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">Area / Sector</Label>
                              <Input
                                value={office.area}
                                onChange={(e) => {
                                  const copy = [...editOffices];
                                  copy[idx].area = e.target.value;
                                  setEditOffices(copy);
                                }}
                                placeholder="e.g. Gulberg III"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditOffices(editOffices.filter((_, i) => i !== idx))}
                              className="h-9 px-2 text-rose-600 hover:bg-rose-50 rounded-lg mt-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* EDIT TAB 5: COMPLETED PROJECTS */}
                <TabsContent value="projects" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-ink">Manage Completed Projects</h4>
                      <p className="text-xs text-slate-custom">Add, edit, or remove project portfolio items.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditProjects([
                          ...editProjects,
                          {
                            name: "",
                            customerName: "",
                            companyName: "",
                            installationDate: "",
                            city: "",
                            country: "Pakistan",
                            systemSize: "",
                            description: "",
                            youtubeUrl: "",
                          },
                        ])
                      }
                      className="gap-1.5 text-xs font-bold rounded-xl border-line"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber" /> Add Project
                    </Button>
                  </div>

                  {editProjects.length === 0 ? (
                    <p className="text-xs text-slate-custom py-6 text-center border border-dashed border-line rounded-xl">No projects added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {editProjects.map((proj, idx) => (
                        <div key={idx} className="p-4 border border-line rounded-2xl bg-slate-50/50 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => setEditProjects(editProjects.filter((_, i) => i !== idx))}
                            className="absolute right-3 top-3 text-rose-600 hover:bg-rose-50 p-1 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">Project / Company Name *</Label>
                              <Input
                                value={proj.name}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].name = e.target.value;
                                  setEditProjects(copy);
                                }}
                                placeholder="e.g. 50kW Commercial Solar"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">Client / Customer Name</Label>
                              <Input
                                value={proj.customerName}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].customerName = e.target.value;
                                  setEditProjects(copy);
                                }}
                                placeholder="e.g. Tariq Textiles"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">System Size</Label>
                              <Input
                                value={proj.systemSize}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].systemSize = e.target.value;
                                  setEditProjects(copy);
                                }}
                                placeholder="e.g. 20kW Hybrid"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">Installation Date</Label>
                              <Input
                                value={proj.installationDate}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].installationDate = e.target.value;
                                  setEditProjects(copy);
                                }}
                                placeholder="e.g. Jan 2024"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">City</Label>
                              <Input
                                value={proj.city}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].city = e.target.value;
                                  setEditProjects(copy);
                                }}
                                placeholder="e.g. Faisalabad"
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">YouTube Video Link</Label>
                              <Input
                                value={proj.youtubeUrl}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].youtubeUrl = e.target.value;
                                  setEditProjects(copy);
                                }}
                                placeholder="https://youtube.com/watch?v=..."
                                className="bg-white border-line h-9 text-xs"
                              />
                            </div>

                            <div className="space-y-1 sm:col-span-3">
                              <Label className="text-[10px] uppercase font-bold text-slate-custom">Project Description</Label>
                              <Textarea
                                value={proj.description}
                                onChange={(e) => {
                                  const copy = [...editProjects];
                                  copy[idx].description = e.target.value;
                                  setEditProjects(copy);
                                }}
                                rows={2}
                                placeholder="Brief project summary..."
                                className="bg-white border-line text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-4 border-t border-line gap-2">
                <Button type="button" variant="outline" onClick={() => setEditEpc(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating} className="bg-amber text-ink hover:bg-amber/90 font-bold">
                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save All Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete EPC Installer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-custom pt-2">
              Are you sure you want to delete <strong className="text-ink">{deleteTarget?.companyName}</strong>? This action will permanently remove their profile, associated account, media, and projects.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-line gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
