"use client";

import { useState, useEffect } from "react";
import { updateEpcProfile } from "@/lib/actions/epc";
import { CheckCircle2, AlertCircle, Loader2, X, Plus } from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { UploadZone } from "@/components/ui/upload-zone";
import { MultiPhotoUpload, MultiDocumentUpload } from "@/components/dashboard/multi-media-upload";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EpcProfileFormProps {
    epcId: string;
    defaultCompanyName: string;
    defaultCeoName?: string;
    defaultDesignation?: string;
    defaultBusinessType?: string;
    defaultContactNo?: string;
    defaultWhatsapp?: string;
    defaultAddress?: string;
    defaultArea?: string;
    defaultCity?: string;
    defaultCountry?: string;
    defaultSectors?: string[];
    defaultCertifications?: string[];
    defaultSolarBrands?: string[];
    defaultInverterBrands?: string[];
    defaultBatteryBrands?: string[];
    defaultPhotos?: string[];
    defaultSolarCertDocuments?: string[];
    defaultInverterCertDocuments?: string[];
    defaultBatteryCertDocuments?: string[];
    defaultTeam?: any[];
    defaultAbout: string;
    defaultWebsite: string;
}

export function EpcProfileForm({ 
    epcId, 
    defaultCompanyName, 
    defaultCeoName,
    defaultDesignation = "",
    defaultBusinessType = "",
    defaultContactNo = "",
    defaultWhatsapp = "",
    defaultAddress = "",
    defaultArea = "",
    defaultCity = "",
    defaultCountry = "Pakistan",
    defaultSectors = [], 
    defaultCertifications = [], 
    defaultSolarBrands = [],
    defaultInverterBrands = [],
    defaultBatteryBrands = [],
    defaultPhotos = [],
    defaultSolarCertDocuments = [],
    defaultInverterCertDocuments = [],
    defaultBatteryCertDocuments = [],
    defaultTeam = [],
    defaultAbout, 
    defaultWebsite 
}: EpcProfileFormProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Controlled form states so inputs never disappear or reset on submit
    const [companyName, setCompanyName] = useState(defaultCompanyName || "");
    const [ceoName, setCeoName] = useState(defaultCeoName || "");
    const [designation, setDesignation] = useState(defaultDesignation || "");
    const [businessType, setBusinessType] = useState(defaultBusinessType || "");
    const [contactNo, setContactNo] = useState(defaultContactNo || "");
    const [whatsapp, setWhatsapp] = useState(defaultWhatsapp || "");
    const [address, setAddress] = useState(defaultAddress || "");
    const [area, setArea] = useState(defaultArea || "");
    const [city, setCity] = useState(defaultCity || "");
    const [country, setCountry] = useState(defaultCountry || "Pakistan");
    const [about, setAbout] = useState(defaultAbout || "");
    const [website, setWebsite] = useState(defaultWebsite || "");

    const [selectedSectors, setSelectedSectors] = useState<string[]>(defaultSectors);
    const [selectedCertifications, setSelectedCertifications] = useState<string[]>(defaultCertifications);

    const [solarBrands, setSolarBrands] = useState<string[]>(defaultSolarBrands);
    const [inverterBrands, setInverterBrands] = useState<string[]>(defaultInverterBrands);
    const [batteryBrands, setBatteryBrands] = useState<string[]>(defaultBatteryBrands);
    const [photos, setPhotos] = useState<string[]>(defaultPhotos);
    const [solarCertDocuments, setSolarCertDocuments] = useState<string[]>(defaultSolarCertDocuments);
    const [inverterCertDocuments, setInverterCertDocuments] = useState<string[]>(defaultInverterCertDocuments);
    const [batteryCertDocuments, setBatteryCertDocuments] = useState<string[]>(defaultBatteryCertDocuments);
    const [tempSolarBrand, setTempSolarBrand] = useState("");
    const [tempInverterBrand, setTempInverterBrand] = useState("");
    const [tempBatteryBrand, setTempBatteryBrand] = useState("");

    const [team, setTeam] = useState<{name: string, designation: string, linkedIn: string, imageUrl: string}[]>(defaultTeam || []);
    
    const { uploadFile, isUploading } = useR2Upload();

    // Synchronize default values when props change without wiping entered data
    useEffect(() => {
        if (defaultCompanyName && !companyName) setCompanyName(defaultCompanyName);
    }, [defaultCompanyName]);
    useEffect(() => {
        if (defaultCeoName && !ceoName) setCeoName(defaultCeoName);
    }, [defaultCeoName]);
    useEffect(() => {
        if (defaultBusinessType && !businessType) setBusinessType(defaultBusinessType);
    }, [defaultBusinessType]);

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

    const parseFields = (value: string | undefined) =>
        value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            if (!companyName.trim()) {
                throw new Error("Company Name is required.");
            }

            const formData = new FormData();
            formData.set("id", epcId);
            formData.set("companyName", companyName.trim());
            formData.set("ceoName", ceoName.trim());
            formData.set("designation", designation.trim());
            formData.set("businessType", businessType.trim());
            formData.set("contactNo", contactNo.trim());
            formData.set("whatsapp", whatsapp.trim());
            formData.set("address", address.trim());
            formData.set("area", area.trim());
            formData.set("city", city.trim());
            formData.set("country", country.trim() || "Pakistan");
            formData.set("about", about.trim());
            formData.set("website", website.trim());

            formData.set("sectors", JSON.stringify(selectedSectors));
            formData.set("certifications", JSON.stringify(selectedCertifications));
            formData.set("solarBrands", JSON.stringify(solarBrands));
            formData.set("inverterBrands", JSON.stringify(inverterBrands));
            formData.set("batteryBrands", JSON.stringify(batteryBrands));
            formData.set("photos", JSON.stringify(photos));
            formData.set("solarCertDocuments", JSON.stringify(solarCertDocuments));
            formData.set("inverterCertDocuments", JSON.stringify(inverterCertDocuments));
            formData.set("batteryCertDocuments", JSON.stringify(batteryCertDocuments));
            formData.set("team", JSON.stringify(team.filter(t => t.name || t.designation)));
            
            await updateEpcProfile(formData);
            setStatus("success");
            toast.success("Profile updated successfully!");
            setTimeout(() => setStatus("idle"), 5000);
        } catch (err: any) {
            console.error("EPC Profile update error:", err);
            const msg = err?.message || "Something went wrong while saving. Please try again.";
            setStatus("error");
            setErrorMsg(msg);
            toast.error(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={epcId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                        Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">CEO / Owner Name</label>
                    <input
                        name="ceoName"
                        value={ceoName}
                        onChange={(e) => setCeoName(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Designation</label>
                    <input
                        name="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Owner / Sales Manager"
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Business Type</label>
                    <select
                        name="businessType"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="">Select business type</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="Partnership">Partnership</option>
                        <option value="LLC">LLC</option>
                        <option value="SME">SME</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Voice Number</label>
                    <input
                        name="contactNo"
                        type="tel"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">WhatsApp Number</label>
                    <input
                        name="whatsapp"
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Address</label>
                    <input
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address"
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Area</label>
                    <input
                        name="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">City</label>
                    <input
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Country</label>
                    <input
                        name="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
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
                                ? "bg-amber text-ink text-white" 
                                : "bg-paper/10 text-slate-custom hover:bg-paper/20"
                            }`}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Certifications</label>
                <div className="flex flex-wrap gap-3 bg-paper/5 border rounded-2xl p-4">
                    {certificationsList.map(cert => {
                        const isChecked = selectedCertifications.includes(cert);
                        return (
                            <label
                                key={cert}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                    isChecked
                                    ? "bg-amber/5 text-ink border-amber text-amber"
                                    : "bg-paper hover:bg-paper/5 border-line text-slate-custom"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCertification(cert)}
                                    className="w-4 h-4 rounded border-gray-300 text-amber focus:ring-primary accent-primary"
                                />
                                <span>{cert}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Brands Certified To Install</label>
                <div className="bg-paper/5 border rounded-2xl p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink">Solar Panels</label>
                        <div className="flex gap-2">
                            <Input 
                                value={tempSolarBrand} 
                                onChange={(e) => setTempSolarBrand(e.target.value)} 
                                placeholder="e.g. LONGI Solar" 
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempSolarBrand.trim()) { setSolarBrands([...solarBrands, tempSolarBrand.trim()]); setTempSolarBrand(""); }}}}
                            />
                            <button type="button" className="px-4 border rounded-xl hover:bg-slate-50 font-semibold" onClick={() => { if (tempSolarBrand.trim()) { setSolarBrands([...solarBrands, tempSolarBrand.trim()]); setTempSolarBrand(""); } }}>+ Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {solarBrands.map((b, i) => (
                                <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full">
                                    {b} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSolarBrands(solarBrands.filter((_, idx) => idx !== i))} />
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink">Inverters</label>
                        <div className="flex gap-2">
                            <Input 
                                value={tempInverterBrand} 
                                onChange={(e) => setTempInverterBrand(e.target.value)} 
                                placeholder="e.g. Huawei" 
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempInverterBrand.trim()) { setInverterBrands([...inverterBrands, tempInverterBrand.trim()]); setTempInverterBrand(""); }}}}
                            />
                            <button type="button" className="px-4 border rounded-xl hover:bg-slate-50 font-semibold" onClick={() => { if (tempInverterBrand.trim()) { setInverterBrands([...inverterBrands, tempInverterBrand.trim()]); setTempInverterBrand(""); } }}>+ Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {inverterBrands.map((b, i) => (
                                <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full">
                                    {b} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setInverterBrands(inverterBrands.filter((_, idx) => idx !== i))} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink">Batteries</label>
                        <div className="flex gap-2">
                            <Input 
                                value={tempBatteryBrand} 
                                onChange={(e) => setTempBatteryBrand(e.target.value)} 
                                placeholder="e.g. CoreCell Energy" 
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempBatteryBrand.trim()) { setBatteryBrands([...batteryBrands, tempBatteryBrand.trim()]); setTempBatteryBrand(""); }}}}
                            />
                            <button type="button" className="px-4 border rounded-xl hover:bg-slate-50 font-semibold" onClick={() => { if (tempBatteryBrand.trim()) { setBatteryBrands([...batteryBrands, tempBatteryBrand.trim()]); setTempBatteryBrand(""); } }}>+ Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {batteryBrands.map((b, i) => (
                                <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full">
                                    {b} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setBatteryBrands(batteryBrands.filter((_, idx) => idx !== i))} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-4 border-t">
                <MultiPhotoUpload
                    label="Company Photos"
                    description="Upload showcase gallery photos of office facilities, installations, or site setups."
                    urls={photos}
                    onChange={setPhotos}
                    folder="epc-photos"
                />

                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-60">Brand Certification Documents</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MultiDocumentUpload
                            label="Solar Panel Certs"
                            description="PDF/images for LONGi, Jinko, Canadian Solar, etc."
                            urls={solarCertDocuments}
                            onChange={setSolarCertDocuments}
                            folder="epc-brand-certs"
                        />
                        <MultiDocumentUpload
                            label="Inverter Certs"
                            description="PDF/images for GoodWe, Huawei, Sungrow, etc."
                            urls={inverterCertDocuments}
                            onChange={setInverterCertDocuments}
                            folder="epc-brand-certs"
                        />
                        <MultiDocumentUpload
                            label="Battery Certs"
                            description="PDF/images for Pylontech, BYD, Narada, etc."
                            urls={batteryCertDocuments}
                            onChange={setBatteryCertDocuments}
                            folder="epc-brand-certs"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Meet The Team</label>
                <div className="space-y-4">
                    {team.map((member, index) => (
                        <div key={index} className="p-4 border rounded-xl flex gap-4 relative bg-paper/5">
                            <button type="button" onClick={() => setTeam(team.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-20 shrink-0">
                                <UploadZone 
                                    onUpload={async (f) => {
                                        try {
                                            const { publicUrl } = await uploadFile(f, "team");
                                            const newTeam = [...team];
                                            newTeam[index].imageUrl = publicUrl;
                                            setTeam(newTeam);
                                            toast.success("Image uploaded");
                                        } catch (e) {
                                            toast.error("Upload failed");
                                        }
                                    }} 
                                    isUploading={isUploading}
                                    value={member.imageUrl}
                                    accept="image/*"
                                    title="Photo"
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-3 pr-8">
                                    <Input 
                                        placeholder="Name" 
                                        value={member.name}
                                        onChange={(e) => { const nt = [...team]; nt[index].name = e.target.value; setTeam(nt); }}
                                    />
                                    <Input 
                                        placeholder="Designation" 
                                        value={member.designation}
                                        onChange={(e) => { const nt = [...team]; nt[index].designation = e.target.value; setTeam(nt); }}
                                    />
                                </div>
                                <Input 
                                    placeholder="LinkedIn Profile URL" 
                                    value={member.linkedIn}
                                    onChange={(e) => { const nt = [...team]; nt[index].linkedIn = e.target.value; setTeam(nt); }}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    ))}
                    <button type="button" className="w-full border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-slate-50 font-semibold" onClick={() => setTeam([...team, { name: '', designation: '', linkedIn: '', imageUrl: '' }])}>
                        <Plus className="w-4 h-4" /> Add Team Member
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">About Company</label>
                <textarea
                    name="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={4}
                    className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none resize-none"
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Website URL</label>
                <input
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full border rounded-xl p-3 bg-paper/5 focus:ring-2 focus:ring-primary outline-none"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-amber text-ink h-12 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                    </>
                ) : (
                    "Save Changes"
                )}
            </button>

            {/* Clear Persistent Feedback Alerts Below Submit Button */}
            {status === "error" && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-red-800">Unable to save profile</p>
                        <p className="text-xs text-red-700 font-medium">{errorMsg}</p>
                    </div>
                </div>
            )}

            {status === "success" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
                    <p className="text-sm font-semibold">Profile updated successfully!</p>
                </div>
            )}
        </form>
    );
}
