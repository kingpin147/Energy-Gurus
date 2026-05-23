"use client";

import { useState } from "react";
import { updateEpcProfile } from "@/lib/actions/epc";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface EpcProfileFormProps {
    epcId: string;
    defaultCompanyName: string;
    defaultCeoName?: string;
    defaultSectors?: string[];
    defaultCertifications?: string[];
    defaultAbout: string;
    defaultWebsite: string;
}

export function EpcProfileForm({ epcId, defaultCompanyName, defaultCeoName, defaultSectors = [], defaultCertifications = [], defaultAbout, defaultWebsite }: EpcProfileFormProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedSectors, setSelectedSectors] = useState<string[]>(defaultSectors);
    const [selectedCertifications, setSelectedCertifications] = useState<string[]>(defaultCertifications);

    const sectors = ["Residential", "Commercial", "Industrial", "Agriculture"];
    const certificationsList = [
        "GoodWe", "Huawei", "Growatt", "Solis", "Sungrow", 
        "Dyness", "Paylontech", "EY Power", "Hystorix", 
        "Longi", "JINKO", "TRINA", "Canadian", "JA"
    ];

    const toggleSector = (sector: string) => {
        setSelectedSectors(prev => 
            prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
        );
    };

    const toggleCertification = (cert: string) => {
        setSelectedCertifications(prev => 
            prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
        );
    };

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        setErrorMsg("");
        try {
            formData.set("sectors", JSON.stringify(selectedSectors));
            formData.set("certifications", JSON.stringify(selectedCertifications));
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">CEO / Owner Name</label>
                    <input
                        name="ceoName"
                        defaultValue={defaultCeoName}
                        className="w-full border rounded-xl p-3 bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Sectors Covered</label>
                <div className="flex flex-wrap gap-2">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            type="button"
                            onClick={() => toggleSector(sector)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                selectedSectors.includes(sector) 
                                ? "bg-primary text-white" 
                                : "bg-secondary/10 text-muted-foreground hover:bg-secondary/20"
                            }`}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Certifications</label>
                <div className="flex flex-wrap gap-3 bg-secondary/5 border rounded-2xl p-4">
                    {certificationsList.map(cert => {
                        const isChecked = selectedCertifications.includes(cert);
                        return (
                            <label
                                key={cert}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                    isChecked
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-background hover:bg-secondary/5 border-border text-muted-foreground"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCertification(cert)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                />
                                <span>{cert}</span>
                            </label>
                        );
                    })}
                </div>
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

