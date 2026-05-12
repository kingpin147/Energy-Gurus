"use client";

import { useState } from "react";
import { updateEpcProfile } from "@/lib/actions/epc";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface EpcProfileFormProps {
    epcId: string;
    defaultCompanyName: string;
    defaultAbout: string;
    defaultWebsite: string;
}

export function EpcProfileForm({ epcId, defaultCompanyName, defaultAbout, defaultWebsite }: EpcProfileFormProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        setErrorMsg("");
        try {
            await updateEpcProfile(formData);
            setStatus("success");
            setTimeout(() => setStatus("idle"), 4000);
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err?.message || "Something went wrong. Please try again.");
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={epcId} />

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Company Name</label>
                <input
                    name="companyName"
                    defaultValue={defaultCompanyName}
                    className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">About Company</label>
                <textarea
                    name="about"
                    defaultValue={defaultAbout}
                    rows={4}
                    className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none resize-none"
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Website URL</label>
                <input
                    name="website"
                    defaultValue={defaultWebsite}
                    className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                />
            </div>

            {/* Feedback messages */}
            {status === "success" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">Profile updated successfully!</p>
                </div>
            )}

            {status === "error" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-semibold">{errorMsg}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    "Save Changes"
                )}
            </button>
        </form>
    );
}
