"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle2, ImageIcon } from "lucide-react";
import { updateAd } from "@/lib/actions/ads";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdEditFormProps {
    ad: {
        id: string;
        title: string;
        imageUrl: string;
        mobileImageUrl: string | null;
        linkUrl: string | null;
        placement: string;
        targetPage: string;
        isActive: boolean;
    };
}

export function AdEditForm({ ad }: AdEditFormProps) {
    const [imageUrl, setImageUrl] = useState(ad.imageUrl);
    const [fileName, setFileName] = useState("");
    const [mobileImageUrl, setMobileImageUrl] = useState(ad.mobileImageUrl || "");
    const [mobileFileName, setMobileFileName] = useState("");
    const { uploadFile, isUploading } = useR2Upload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mobileFileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { publicUrl } = await uploadFile(file, "ad-banners");
            setImageUrl(publicUrl);
            setFileName(file.name);
            toast.success("Ad image uploaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload ad image");
        }
    };

    const handleMobileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { publicUrl } = await uploadFile(file, "ad-banners-mobile");
            setMobileImageUrl(publicUrl);
            setMobileFileName(file.name);
            toast.success("Mobile ad image uploaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload mobile ad image");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            await updateAd(ad.id, formData);
            toast.success("Ad updated successfully");
            router.push("/dashboard/ads");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update ad");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Ad Title (Internal Use)</label>
                <input
                    name="title"
                    defaultValue={ad.title}
                    className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                    placeholder="e.g. Summer Solar Panel Promo"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Ad Image</label>
                <div className="flex flex-col gap-3">
                    {/* Always show current image preview */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="w-24 h-12 rounded-lg border bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                            <img src={imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                                <CheckCircle2 className="w-4 h-4" /> {fileName || "Current Image"}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{fileName ? "" : "Click below to replace"}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isSubmitting}
                            className="text-[10px] font-black uppercase text-amber hover:underline disabled:opacity-50"
                        >
                            {isUploading ? "Uploading..." : "Replace"}
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <input type="hidden" name="imageUrl" value={imageUrl} required />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Mobile Ad Image (Optional)</label>
                <div className="flex flex-col gap-3">
                    {/* Always show current image preview */}
                    {mobileImageUrl ? (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="w-24 h-12 rounded-lg border bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                                <img src={mobileImageUrl} className="max-w-full max-h-full object-contain" alt="" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> {mobileFileName || "Current Mobile Image"}
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium truncate">{mobileFileName ? "" : "Click below to replace"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => mobileFileInputRef.current?.click()}
                                disabled={isUploading || isSubmitting}
                                className="text-[10px] font-black uppercase text-amber hover:underline disabled:opacity-50"
                            >
                                {isUploading ? "Uploading..." : "Replace"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMobileImageUrl(""); setMobileFileName(""); }}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <button
                                type="button"
                                onClick={() => mobileFileInputRef.current?.click()}
                                disabled={isUploading || isSubmitting}
                                className="w-full bg-[#003e3e] hover:bg-[#002a2a] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#003e3e]/20"
                            >
                                {isUploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ImageIcon className="w-4 h-4" />
                                )}
                                {isUploading ? "Uploading..." : "Choose Mobile Ad Image"}
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={mobileFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleMobileFileChange}
                    />

                    <input type="hidden" name="mobileImageUrl" value={mobileImageUrl} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Link URL (Optional)</label>
                <input
                    name="linkUrl"
                    defaultValue={ad.linkUrl ?? ""}
                    placeholder="https://example.com"
                    className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Placement Type</label>
                    <select
                        name="placement"
                        defaultValue={ad.placement}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                    >
                        <option value="">Select Placement...</option>
                        <option value="leaderboard_top">Top Leaderboard (728x90)</option>
                        <option value="leaderboard_bottom">Bottom Leaderboard (728x90)</option>
                        <option value="skyscraper_left">Left Skyscraper (160x600)</option>
                        <option value="skyscraper_right">Right Skyscraper (160x600)</option>
                        <option value="in_list">In-List Banner</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Target Page</label>
                    <select
                        name="targetPage"
                        defaultValue={ad.targetPage}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                    >
                        <option value="">Select Page...</option>
                        <option value="global">Global (All Pages)</option>
                        <option value="home">Home Page</option>
                        <option value="brands">Brands Page</option>
                        <option value="epcs">Installers Page</option>
                        <option value="news">News Page</option>
                        <option value="monitoring">Monitoring Page</option>
                        <option value="podcast">Podcast Page</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-paper/50">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    className="w-5 h-5 rounded accent-amber cursor-pointer"
                    defaultChecked={ad.isActive}
                />
                <label htmlFor="isActive" className="text-sm font-bold cursor-pointer">Ad is Active</label>
            </div>

            <Button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="w-full rounded-xl font-bold h-12 gap-2 transition-all bg-amber text-ink hover:bg-amber/90 mt-8"
            >
                {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
            </Button>
        </form>
    );
}
