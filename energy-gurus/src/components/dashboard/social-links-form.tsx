"use client";

import { useState } from "react";
import { updateEpcProfile } from "@/lib/actions/epc";
import { updateBrandProfile } from "@/lib/actions/brand";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialLinksFormProps {
    type: "epc" | "brand";
    initialLinks: any[];
}

export function SocialLinksForm({ type, initialLinks }: SocialLinksFormProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        setErrorMsg("");
        try {
            if (type === "epc") {
                const links = [
                    { platform: "Facebook", url: formData.get("facebook") as string },
                    { platform: "LinkedIn", url: formData.get("linkedin") as string },
                    { platform: "Instagram", url: formData.get("instagram") as string },
                    { platform: "Twitter", url: formData.get("twitter") as string },
                    { platform: "WhatsApp", url: formData.get("whatsapp") as string },
                ].filter(l => l.url);
                await updateEpcProfile({ socialLinks: links });
            } else {
                const links = [
                    { platform: "Facebook", url: formData.get("facebook") as string },
                    { platform: "LinkedIn", url: formData.get("linkedin") as string },
                    { platform: "Instagram", url: formData.get("instagram") as string },
                    { platform: "YouTube", url: formData.get("youtube") as string },
                    { platform: "WhatsApp", url: formData.get("whatsapp") as string },
                ].filter(l => l.url);
                await updateBrandProfile({ socialLinks: links });
            }
            setStatus("success");
            setTimeout(() => setStatus("idle"), 4000);
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err?.message || "Something went wrong.");
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    if (type === "epc") {
        return (
            <form action={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">Facebook</span>
                  <input name="facebook" placeholder="https://facebook.com/yourpage" defaultValue={initialLinks?.find(l => l.platform === "Facebook")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">LinkedIn</span>
                  <input name="linkedin" placeholder="https://linkedin.com/company/yourpage" defaultValue={initialLinks?.find(l => l.platform === "LinkedIn")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">Instagram</span>
                  <input name="instagram" placeholder="https://instagram.com/yourprofile" defaultValue={initialLinks?.find(l => l.platform === "Instagram")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">Twitter</span>
                  <input name="twitter" placeholder="https://twitter.com/yourhandle" defaultValue={initialLinks?.find(l => l.platform === "Twitter")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 w-20 shrink-0">WhatsApp</span>
                  <input name="whatsapp" placeholder="+92 3XX XXXXXXX" defaultValue={initialLinks?.find(l => l.platform === "WhatsApp")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                </div>

                {status === "success" && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in fade-in slide-in-from-top-2 mt-4">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-semibold">Socials updated successfully!</p>
                    </div>
                )}
                {status === "error" && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-in fade-in slide-in-from-top-2 mt-4">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-semibold">{errorMsg}</p>
                    </div>
                )}

                <button type="submit" disabled={status === "loading"} className="w-full bg-secondary text-secondary-foreground h-10 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                    {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Social Links"}
                </button>
            </form>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="facebook" placeholder="Facebook URL" defaultValue={initialLinks?.find(l => l.platform === "Facebook")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                <input name="linkedin" placeholder="LinkedIn URL" defaultValue={initialLinks?.find(l => l.platform === "LinkedIn")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                <input name="instagram" placeholder="Instagram URL" defaultValue={initialLinks?.find(l => l.platform === "Instagram")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
                <input name="youtube" placeholder="YouTube URL" defaultValue={initialLinks?.find(l => l.platform === "YouTube")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none" />
            </div>
            <div>
                <label className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mb-2 block">WhatsApp Contact Number</label>
                <input name="whatsapp" placeholder="+92 3XX XXXXXXX" defaultValue={initialLinks?.find(l => l.platform === "WhatsApp")?.url || ""} className="w-full border rounded-xl p-3 bg-secondary/5 text-sm outline-none font-bold text-green-600" />
            </div>

            {status === "success" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">Socials updated successfully!</p>
                </div>
            )}
            {status === "error" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">{errorMsg}</p>
                </div>
            )}

            <Button type="submit" disabled={status === "loading"} className="w-full bg-secondary text-secondary-foreground rounded-xl font-bold h-11 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Network Links"}
            </Button>
        </form>
    );
}
