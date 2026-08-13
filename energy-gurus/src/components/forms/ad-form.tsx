"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, ImageIcon } from "lucide-react";
import { createAd } from "@/lib/actions/ads";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdForm() {
    const [imageUrl, setImageUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const { uploadFile, isUploading } = useR2Upload();
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData(e.currentTarget);
            await createAd(formData);
            toast.success("Ad created successfully");
            router.push("/dashboard/ads");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create ad");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Ad Title (Internal Use)</label>
                <input name="title" className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" required placeholder="e.g. Summer Solar Panel Promo" />
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Ad Image (Required)</label>
                <div className="flex flex-col gap-3">
                    {!imageUrl ? (
                        <div className="w-full">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isSubmitting}
                                className="w-full bg-[#003e3e] hover:bg-[#002a2a] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#003e3e]/20"
                            >
                                {isUploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ImageIcon className="w-4 h-4" />
                                )}
                                {isUploading ? "Uploading..." : "Choose Ad Image"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-1">
                            <div className="w-24 h-12 rounded-lg border bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                                <img src={imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> Image Ready
                                </div>
                                <p className="text-[10px] text-green-700/60 font-medium truncate">{fileName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setImageUrl(""); setFileName(""); }}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    <input type="hidden" name="imageUrl" value={imageUrl} required />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Link URL (Optional)</label>
                <input name="linkUrl" placeholder="https://example.com" className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Placement Type</label>
                    <select name="placement" className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" required>
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
                    <select name="targetPage" className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all" required>
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
                <input type="checkbox" id="isActive" name="isActive" className="w-5 h-5 rounded accent-amber cursor-pointer" defaultChecked />
                <label htmlFor="isActive" className="text-sm font-bold cursor-pointer">Activate this ad immediately</label>
            </div>

            <Button
                type="submit"
                disabled={isUploading || isSubmitting || !imageUrl}
                className="w-full rounded-xl font-bold h-12 gap-2 transition-all bg-amber text-ink hover:bg-amber/90 mt-8"
            >
                {isSubmitting ? "Creating..." : <><Plus className="w-4 h-4" /> Create Ad</>}
            </Button>
        </form>
    );
}
