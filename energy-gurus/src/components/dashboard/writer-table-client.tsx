"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Eye,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  FileText,
  Mail,
  Briefcase,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Music,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Clock,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  adminUpdateWriterFull,
  deleteWriterAction,
  getWriterFullDetails,
} from "@/lib/actions/admin-writer-actions";
import { useRouter } from "next/navigation";

export interface WriterListItem {
  id: string;
  userId: string;
  name: string;
  pictureUrl: string | null;
  designation: string | null;
  bio: string | null;
  socialLinks: any;
  status: "draft" | "pending_review" | "changes_requested" | "approved";
  adminFeedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  userEmail: string;
  userIsActive: boolean;
  articlesCount: number;
}

export function WriterTableClient({ initialWriters }: { initialWriters: WriterListItem[] }) {
  const router = useRouter();
  const [writers, setWriters] = useState<WriterListItem[]>(initialWriters);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // View modal state
  const [viewingWriter, setViewingWriter] = useState<any | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);

  // Edit modal state
  const [editingWriter, setEditingWriter] = useState<any | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingWriter, setDeletingWriter] = useState<WriterListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editPictureUrl, setEditPictureUrl] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "pending_review" | "changes_requested" | "approved">("approved");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  const [editTiktok, setEditTiktok] = useState("");

  const editWords = editBio.trim() ? editBio.trim().split(/\s+/).filter(Boolean) : [];
  const editWordCount = editWords.length;

  // Filtering
  const filteredWriters = writers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (w.designation && w.designation.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "approved" && w.status === "approved") ||
      (selectedStatus === "pending" && w.status === "pending_review") ||
      (selectedStatus === "changes" && w.status === "changes_requested");

    return matchesSearch && matchesStatus;
  });

  const handleOpenView = async (w: WriterListItem) => {
    setIsViewLoading(true);
    setViewingWriter(w);
    try {
      const details = await getWriterFullDetails(w.id);
      if (details) {
        setViewingWriter(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleOpenEdit = async (w: WriterListItem) => {
    setIsEditLoading(true);
    try {
      const details = await getWriterFullDetails(w.id);
      const data = details || w;
      setEditingWriter(data);
      setEditName(data.name || "");
      setEditDesignation(data.designation || "");
      setEditPictureUrl(data.pictureUrl || "");
      setEditBio(data.bio || "");
      setEditStatus(data.status || "approved");
      setEditLinkedin(data.socialLinks?.linkedin || "");
      setEditFacebook(data.socialLinks?.facebook || "");
      setEditInstagram(data.socialLinks?.instagram || "");
      setEditTwitter(data.socialLinks?.twitter || "");
      setEditTiktok(data.socialLinks?.tiktok || "");
    } catch (err) {
      toast.error("Failed to load writer details for editing");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingWriter) return;
    if (!editName.trim()) {
      toast.error("Author name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const socialLinks = {
        ...(editLinkedin.trim() ? { linkedin: editLinkedin.trim() } : {}),
        ...(editFacebook.trim() ? { facebook: editFacebook.trim() } : {}),
        ...(editInstagram.trim() ? { instagram: editInstagram.trim() } : {}),
        ...(editTwitter.trim() ? { twitter: editTwitter.trim() } : {}),
        ...(editTiktok.trim() ? { tiktok: editTiktok.trim() } : {}),
      };

      const res = await adminUpdateWriterFull(editingWriter.id, {
        name: editName.trim(),
        designation: editDesignation.trim() || null,
        pictureUrl: editPictureUrl.trim() || null,
        bio: editBio.trim() || null,
        status: editStatus,
        socialLinks,
      });

      if (res.success) {
        toast.success(res.message);
        setWriters((prev) =>
          prev.map((item) =>
            item.id === editingWriter.id
              ? {
                  ...item,
                  name: editName.trim(),
                  designation: editDesignation.trim() || null,
                  pictureUrl: editPictureUrl.trim() || null,
                  bio: editBio.trim() || null,
                  status: editStatus,
                  socialLinks,
                }
              : item
          )
        );
        setEditingWriter(null);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update writer");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWriter) return;
    setIsDeleting(true);
    try {
      const res = await deleteWriterAction(deletingWriter.id, deletingWriter.userId);
      if (res.success) {
        toast.success(res.message);
        setWriters((prev) => prev.filter((w) => w.id !== deletingWriter.id));
        setDeletingWriter(null);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete writer");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete writer");
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
            placeholder="Search author name, email, or designation..."
            className="pl-10 h-10 rounded-xl bg-slate-50 border-line text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Writers", val: "all" },
            { label: "Approved", val: "approved" },
            { label: "In Review", val: "pending" },
            { label: "Changes Needed", val: "changes" },
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
        {filteredWriters.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-custom/40 mx-auto" />
            <h3 className="font-bold text-base text-ink">No Writers Found</h3>
            <p className="text-xs text-slate-custom">
              {search || selectedStatus !== "all"
                ? "Try adjusting your search query."
                : "No contributing writers onboarded yet. Use the Onboard New Writer tab to register authors."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-line text-[11px] font-black uppercase tracking-wider text-slate-custom">
                  <th className="p-5">Author</th>
                  <th className="p-5">Designation</th>
                  <th className="p-5">Articles</th>
                  <th className="p-5">Social Handles</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredWriters.map((w) => {
                  const isApproved = w.status === "approved";
                  const isPending = w.status === "pending_review";
                  const isChangesReq = w.status === "changes_requested";

                  const socials = w.socialLinks || {};
                  const hasAnySocial = Object.keys(socials).length > 0;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3.5">
                          <Avatar className="h-11 w-11 rounded-xl border border-line bg-white shadow-sm shrink-0">
                            <AvatarImage src={w.pictureUrl || undefined} className="object-cover" />
                            <AvatarFallback className="bg-amber/15 text-amber-deep font-bold rounded-xl text-xs">
                              {w.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-ink">{w.name}</span>
                              {isApproved && (
                                <span title="Approved Contributing Writer">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-custom line-clamp-1">{w.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-xs text-slate-custom max-w-[240px]">
                        <p className="font-medium text-ink line-clamp-1">{w.designation || "Contributing Columnist"}</p>
                        {w.bio && <p className="text-[11px] text-slate-custom line-clamp-1 mt-0.5">{w.bio}</p>}
                      </td>

                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber/10 text-amber-900 border border-amber/20">
                          <FileText className="w-3.5 h-3.5 text-amber" /> {w.articlesCount || 0} Articles
                        </span>
                      </td>

                      <td className="p-5">
                        {hasAnySocial ? (
                          <div className="flex items-center gap-2 text-slate-custom">
                            {socials.linkedin && (
                              <a href={socials.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="hover:text-blue-600">
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {socials.twitter && (
                              <a href={socials.twitter} target="_blank" rel="noreferrer" title="Twitter" className="hover:text-sky-500">
                                <Twitter className="w-4 h-4" />
                              </a>
                            )}
                            {socials.facebook && (
                              <a href={socials.facebook} target="_blank" rel="noreferrer" title="Facebook" className="hover:text-blue-700">
                                <Facebook className="w-4 h-4" />
                              </a>
                            )}
                            {socials.instagram && (
                              <a href={socials.instagram} target="_blank" rel="noreferrer" title="Instagram" className="hover:text-pink-600">
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {socials.tiktok && (
                              <a href={socials.tiktok} target="_blank" rel="noreferrer" title="TikTok" className="hover:text-ink">
                                <Music className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-custom/60 italic">None</span>
                        )}
                      </td>

                      <td className="p-5">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Approved
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber/15 text-amber-deep border border-amber/30">
                            <Clock className="w-3 h-3" /> In Review
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
                            onClick={() => handleOpenView(w)}
                            title="View Author Profile"
                            className="h-8 w-8 p-0 rounded-lg text-slate-custom hover:text-ink hover:bg-slate-100"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(w)}
                            title="Edit Profile"
                            className="h-8 w-8 p-0 rounded-lg text-slate-custom hover:text-amber-deep hover:bg-amber/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingWriter(w)}
                            title="Delete Writer"
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

      {/* VIEW WRITER PROFILE DIALOG */}
      <Dialog open={!!viewingWriter} onOpenChange={(open) => !open && setViewingWriter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          {viewingWriter && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-line pb-6">
                <Avatar className="h-16 w-16 rounded-2xl border border-line bg-white shadow-md shrink-0">
                  <AvatarImage src={viewingWriter.pictureUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-amber/15 text-amber-deep font-bold rounded-2xl text-lg">
                    {viewingWriter.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-ink">{viewingWriter.name}</h2>
                    {viewingWriter.status === "approved" && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-custom mt-0.5">{viewingWriter.designation || "Contributing Writer"}</p>
                  <p className="text-xs text-slate-custom font-mono mt-0.5">{viewingWriter.userEmail}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-line space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">Author Biography</span>
                <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
                  {viewingWriter.bio || "No biography provided yet."}
                </p>
              </div>

              {/* Social handles */}
              {viewingWriter.socialLinks && Object.keys(viewingWriter.socialLinks).length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">Connected Handles</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(viewingWriter.socialLinks).map(([k, val]: [string, any]) => (
                      <a
                        key={k}
                        href={val}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-line text-slate-custom hover:text-ink hover:border-slate-300 font-bold capitalize flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3" /> {k}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Articles */}
              {viewingWriter.articles && viewingWriter.articles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="font-bold uppercase tracking-wider text-slate-custom text-[10px]">
                    Authored Articles ({viewingWriter.articles.length})
                  </span>
                  <div className="space-y-2">
                    {viewingWriter.articles.map((art: any) => (
                      <div key={art.id} className="p-3 bg-white border border-line rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-ink">{art.title}</p>
                          <p className="text-slate-custom text-[11px]">{art.category}</p>
                        </div>
                        {art.isPublished && art.slug && (
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-bold gap-1 text-teal">
                            <Link href={`/news/${art.slug}`} target="_blank">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT WRITER PROFILE DIALOG */}
      <Dialog open={!!editingWriter} onOpenChange={(open) => !open && setEditingWriter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          <DialogHeader className="border-b border-line pb-4">
            <DialogTitle className="text-xl font-bold text-ink flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber" /> Edit Writer Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-custom">
              Update author credentials, professional title, bio, and editorial approval status.
            </DialogDescription>
          </DialogHeader>

          {editingWriter && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-custom uppercase">Author Name *</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 text-sm font-semibold border-line"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-custom uppercase">Professional Designation</Label>
                <Input
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-custom uppercase">Profile Picture URL</Label>
                <Input
                  value={editPictureUrl}
                  onChange={(e) => setEditPictureUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-10 rounded-xl bg-slate-50 text-sm border-line"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-slate-custom uppercase">Author Bio</Label>
                  <span className={`text-[11px] font-mono font-bold ${editWordCount >= 50 && editWordCount <= 100 ? "text-emerald-600" : "text-amber-800"}`}>
                    {editWordCount} words (50–100 recommended)
                  </span>
                </div>
                <Textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="rounded-xl bg-slate-50 text-xs border-line leading-relaxed"
                />
              </div>

              {/* Status */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-line space-y-1">
                <Label className="font-bold text-ink">Editorial Approval Status</Label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full h-9 rounded-xl bg-white border border-line text-xs font-bold px-2"
                >
                  <option value="approved">Approved (Can write & be assigned articles)</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Social Links */}
              <div className="space-y-2 pt-2">
                <Label className="font-bold text-slate-custom uppercase">Social Handles</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="LinkedIn URL"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    className="h-9 bg-slate-50 text-xs border-line rounded-xl"
                  />
                  <Input
                    placeholder="X (Twitter) URL"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    className="h-9 bg-slate-50 text-xs border-line rounded-xl"
                  />
                  <Input
                    placeholder="Facebook URL"
                    value={editFacebook}
                    onChange={(e) => setEditFacebook(e.target.value)}
                    className="h-9 bg-slate-50 text-xs border-line rounded-xl"
                  />
                  <Input
                    placeholder="Instagram URL"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="h-9 bg-slate-50 text-xs border-line rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-line pt-4 flex gap-3">
                <Button variant="outline" onClick={() => setEditingWriter(null)} className="rounded-xl font-bold">
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
      <Dialog open={!!deletingWriter} onOpenChange={(open) => !open && setDeletingWriter(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Delete Writer Profile?</h3>
              <p className="text-xs text-slate-custom mt-1 leading-relaxed">
                Are you sure you want to delete <strong>{deletingWriter?.name}</strong>? Their author credentials and login account will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingWriter(null)}
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
