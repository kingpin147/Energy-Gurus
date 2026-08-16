"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardEpcInstaller } from '@/lib/actions/epc-onboarding';
import { UploadZone } from '@/components/ui/upload-zone';
import { useR2Upload } from '@/lib/hooks/use-r2-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, X, Plus, FileText, Trash2 } from 'lucide-react';

const DEFAULT_SECTORS = ['Residential', 'Commercial', 'Industrial', 'Agriculture'];
const DEFAULT_CERTIFICATIONS = ['AEDB Licence', 'PEC Licence'];

type TeamMember = { name: string; designation: string; linkedIn: string; imageUrl: string; };
type CardEntry = { youtubeUrl: string; installationDate: string; customerName: string; companyName: string; city: string; country: string; description: string; };
type OfficeEntry = { address: string; area: string; city: string; country: string; };
type UploadedDoc = { url: string; name: string; };

export function EpcOnboardingForm({ isPublic = false }: { isPublic?: boolean } = {}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const { uploadFile, isUploading } = useR2Upload();
    const [logoUrl, setLogoUrl] = useState("");
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
    
    // Checkbox & Custom items states
    const [selectedSectors, setSelectedSectors] = useState<string[]>(['Residential']);
    const [tempSector, setTempSector] = useState("");

    const [selectedCerts, setSelectedCerts] = useState<string[]>(['AEDB Licence', 'PEC Licence']);
    const [tempCert, setTempCert] = useState("");

    // Exactly 2 tiers as per design: Silver and Gold
    const [selectedTier, setSelectedTier] = useState<'silver'|'gold'>('silver');

    // Brand states
    const [solarBrands, setSolarBrands] = useState<string[]>([]);
    const [inverterBrands, setInverterBrands] = useState<string[]>([]);
    const [batteryBrands, setBatteryBrands] = useState<string[]>([]);
    const [tempSolarBrand, setTempSolarBrand] = useState("");
    const [tempInverterBrand, setTempInverterBrand] = useState("");
    const [tempBatteryBrand, setTempBatteryBrand] = useState("");

    // Additional Offices state
    const [offices, setOffices] = useState<OfficeEntry[]>([]);

    // Team state
    const [team, setTeam] = useState<TeamMember[]>([{ name: '', designation: '', linkedIn: '', imageUrl: '' }]);

    // Projects state
    const [projects, setProjects] = useState<CardEntry[]>([{ youtubeUrl: '', installationDate: '', customerName: '', companyName: '', city: '', country: '', description: '' }]);

    // Testimonials state
    const [testimonials, setTestimonials] = useState<CardEntry[]>([{ youtubeUrl: '', installationDate: '', customerName: '', companyName: '', city: '', country: '', description: '' }]);

    const handleLogoUpload = async (file: File) => {
        try {
            const { publicUrl } = await uploadFile(file, "epc-logos");
            setLogoUrl(publicUrl);
            toast.success("Logo uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload logo");
        }
    };

    const handleDocUpload = async (file: File) => {
        try {
            const { publicUrl } = await uploadFile(file, "epc-documents");
            setUploadedDocs(prev => [...prev, { url: publicUrl, name: file.name }]);
            toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
            toast.error("Failed to upload document");
        }
    };

    const toggleArray = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (current.includes(item)) {
            setter(current.filter(i => i !== item));
        } else {
            setter([...current, item]);
        }
    };

    const addCustomItem = (value: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, clearInput: () => void) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!current.includes(trimmed)) {
            setter([...current, trimmed]);
        }
        clearInput();
    };

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        
        // Append custom state data
        formData.append("logoUrl", logoUrl);
        formData.append("licenceDocuments", JSON.stringify(uploadedDocs.map(d => d.url)));
        formData.append("tier", selectedTier);
        selectedSectors.forEach(s => formData.append("sectors", s));
        selectedCerts.forEach(c => formData.append("certifications", c));
        solarBrands.forEach(b => formData.append("solarBrands", b));
        inverterBrands.forEach(b => formData.append("inverterBrands", b));
        batteryBrands.forEach(b => formData.append("batteryBrands", b));
        
        formData.append("offices", JSON.stringify(offices.filter(o => o.city || o.address || o.area)));
        formData.append("team", JSON.stringify(team.filter(t => t.name || t.designation)));
        formData.append("projects", JSON.stringify(projects.filter(p => p.youtubeUrl || p.customerName || p.companyName || p.description)));
        formData.append("testimonials", JSON.stringify(testimonials.filter(t => t.youtubeUrl || t.customerName || t.companyName || t.description)));

        const result = await onboardEpcInstaller(formData);
        
        setIsLoading(false);
        
        if (result.success) {
            toast.success(isPublic ? "Application submitted successfully" : "EPC Onboarded successfully");
            setGeneratedPassword(result.password || null);
            setIsSubmitted(true);
        } else {
            toast.error(result.message || "Failed to submit application");
        }
    }

    if (isSubmitted) {
        return (
            <div className="bg-white border border-line rounded-xl p-12 text-center my-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-teal/10 text-teal flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-space-grotesk font-semibold text-ink mb-2">
                    {isPublic ? "Application received" : "EPC Onboarded Successfully"}
                </h2>
                <p className="text-slate-custom mb-6 max-w-md mx-auto">
                    {isPublic 
                        ? "Thanks for applying to join EnergyGurus.Online. Our team will review your profile and reach out within 3–5 business days."
                        : "The installer's account has been created and profile is live in the directory."}
                </p>
                
                {generatedPassword && !isPublic && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-line mb-6 max-w-md w-full mx-auto">
                        <p className="text-sm font-bold text-slate-custom mb-2">Temporary Password for EPC:</p>
                        <code className="text-lg bg-white px-3 py-1 rounded border border-line select-all font-mono text-ink">{generatedPassword}</code>
                        <p className="text-xs text-slate-custom mt-2">Please share this securely or rely on the welcome email.</p>
                    </div>
                )}
                
                <Button 
                    onClick={() => router.push(isPublic ? '/epcs' : '/dashboard/users')} 
                    className="bg-ink text-white hover:bg-ink/90 px-8 py-3 h-auto"
                >
                    {isPublic ? "Back to Directory" : "Return to Users"}
                </Button>
            </div>
        );
    }

    return (
        <form action={onSubmit} className="w-full max-w-5xl space-y-6 pb-20">
            
            {/* 1. Basic Information */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">1</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Basic Information</h2>
                        <p className="text-sm text-slate-custom">Tell us about you and your company.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="ceoName" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Installer / Contact Name</Label>
                        <Input id="ceoName" name="ceoName" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="designation" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Designation</Label>
                        <Input id="designation" name="designation" placeholder="e.g. Owner, Sales Manager" className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Company Name</Label>
                        <Input id="companyName" name="companyName" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="yearsInBusiness" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Years in Business</Label>
                        <Input id="yearsInBusiness" name="yearsInBusiness" type="number" min="0" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Company Logo / Photo</Label>
                        <UploadZone 
                            onUpload={handleLogoUpload} 
                            isUploading={isUploading}
                            value={logoUrl}
                            accept="image/*"
                            title="Click to upload logo"
                            description="PNG or JPG, up to 5MB"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="about" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Short Bio</Label>
                        <Textarea id="about" name="about" required placeholder="Tell homeowners what makes your company a good fit — specialties, experience, service philosophy." className="bg-slate-50 border-line min-h-[90px]" />
                    </div>
                </div>
            </div>

            {/* 2. Location */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">2</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Location</h2>
                        <p className="text-sm text-slate-custom">Where do you operate?</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Full Address</Label>
                        <Input id="address" name="address" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="area" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Area / Society</Label>
                        <Input id="area" name="area" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">City</Label>
                        <Input id="city" name="city" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="country" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Country</Label>
                        <Input id="country" name="country" defaultValue="Pakistan" required className="bg-slate-50 border-line" />
                    </div>
                </div>

                {/* Additional Office Locations */}
                <div className="mt-8 pt-6 border-t border-line space-y-4">
                    <div>
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-ink font-semibold">Additional Office Locations (If Any)</Label>
                        <p className="text-xs text-slate-custom mt-1">Add another entry for each additional office you operate from.</p>
                    </div>

                    {offices.map((office, idx) => (
                        <div key={idx} className="p-5 border border-line rounded-xl relative bg-slate-50/50 space-y-4">
                            <button 
                                type="button" 
                                onClick={() => setOffices(offices.filter((_, i) => i !== idx))} 
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Full Address</Label>
                                    <Input 
                                        value={office.address} 
                                        onChange={(e) => { const no = [...offices]; no[idx].address = e.target.value; setOffices(no); }}
                                        className="bg-white" 
                                        placeholder="Office address" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Area / Society</Label>
                                    <Input 
                                        value={office.area} 
                                        onChange={(e) => { const no = [...offices]; no[idx].area = e.target.value; setOffices(no); }}
                                        className="bg-white" 
                                        placeholder="Area" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">City</Label>
                                    <Input 
                                        value={office.city} 
                                        onChange={(e) => { const no = [...offices]; no[idx].city = e.target.value; setOffices(no); }}
                                        className="bg-white" 
                                        placeholder="City" 
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Country</Label>
                                    <Input 
                                        value={office.country} 
                                        onChange={(e) => { const no = [...offices]; no[idx].country = e.target.value; setOffices(no); }}
                                        className="bg-white" 
                                        defaultValue="Pakistan" 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-dashed"
                        onClick={() => setOffices([...offices, { address: '', area: '', city: '', country: 'Pakistan' }])}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Office
                    </Button>
                </div>
            </div>

            {/* 3. Contact Details */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">3</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Contact Details</h2>
                        <p className="text-sm text-slate-custom">How customers and our team will reach you.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="contactNo" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Contact No.</Label>
                        <Input id="contactNo" name="contactNo" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Email Address (Login Account)</Label>
                        <Input id="email" name="email" type="email" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Website</Label>
                        <Input id="website" name="website" placeholder="www.yourcompany.com" className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="facebook" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Facebook</Label>
                        <Input id="facebook" name="facebook" placeholder="https://facebook.com/profile" className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Instagram</Label>
                        <Input id="instagram" name="instagram" placeholder="https://instagram.com/profile" className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">LinkedIn</Label>
                        <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/profile" className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="youtube" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">YouTube Channel</Label>
                        <Input id="youtube" name="youtube" placeholder="https://youtube.com/@channel" className="bg-slate-50 border-line" />
                    </div>
                </div>
            </div>

            {/* 4. Specialties */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">4</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Specialties</h2>
                        <p className="text-sm text-slate-custom">What systems do you install, and which brands are you certified for?</p>
                    </div>
                </div>
                <div className="space-y-6">
                    {/* System Types / Sectors with multi-select and Add button */}
                    <div className="space-y-3">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">System Type / Sectors</Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedSectors.map(s => (
                                <div 
                                    key={s} 
                                    className="flex items-center gap-2 border border-teal bg-teal/5 text-ink rounded-full px-3.5 py-1.5 cursor-pointer text-sm font-medium"
                                    onClick={() => toggleArray(s, selectedSectors, setSelectedSectors)}
                                >
                                    <span className="text-teal font-bold">✓</span>
                                    <span>{s}</span>
                                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 ml-1" onClick={(e) => { e.stopPropagation(); toggleArray(s, selectedSectors, setSelectedSectors); }} />
                                </div>
                            ))}
                            {DEFAULT_SECTORS.filter(d => !selectedSectors.includes(d)).map(s => (
                                <div 
                                    key={s} 
                                    className="flex items-center gap-2 border border-line bg-white text-slate-custom rounded-full px-3.5 py-1.5 cursor-pointer text-sm hover:border-slate-400"
                                    onClick={() => toggleArray(s, selectedSectors, setSelectedSectors)}
                                >
                                    <span className="text-slate-300">+</span>
                                    <span>{s}</span>
                                </div>
                            ))}
                        </div>

                        {/* Add custom specialty input */}
                        <div className="flex gap-2 max-w-md pt-2">
                            <Input 
                                value={tempSector} 
                                onChange={(e) => setTempSector(e.target.value)} 
                                placeholder="Add custom specialty (e.g. Microgrids, Off-Grid)" 
                                className="bg-slate-50 border-line text-sm"
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addCustomItem(tempSector, selectedSectors, setSelectedSectors, () => setTempSector("")); }}}
                            />
                            <Button type="button" variant="outline" onClick={() => addCustomItem(tempSector, selectedSectors, setSelectedSectors, () => setTempSector(""))}>+ Add</Button>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-line space-y-6">
                        <div>
                            <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom mb-1 block">Brands You Are Certified To Install</Label>
                            <p className="text-sm text-slate-custom mb-4">Type a brand name and click Add. You can add multiple entries per category.</p>
                            
                            {/* Solar Panels */}
                            <div className="space-y-3 mb-5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-ink">Solar Panels</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={tempSolarBrand} 
                                        onChange={(e) => setTempSolarBrand(e.target.value)} 
                                        placeholder="e.g. LONGi Solar" 
                                        className="bg-slate-50 border-line"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempSolarBrand) { setSolarBrands([...solarBrands, tempSolarBrand.trim()]); setTempSolarBrand(""); }}}}
                                    />
                                    <Button type="button" variant="outline" onClick={() => { if (tempSolarBrand) { setSolarBrands([...solarBrands, tempSolarBrand.trim()]); setTempSolarBrand(""); } }}>+ Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {solarBrands.map((b, i) => (
                                        <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full font-medium">
                                            {b} <X className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-red-500" onClick={() => setSolarBrands(solarBrands.filter((_, idx) => idx !== i))} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Inverters */}
                            <div className="space-y-3 mb-5">
                                <Label className="text-xs font-bold uppercase tracking-widest text-ink">Inverters</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={tempInverterBrand} 
                                        onChange={(e) => setTempInverterBrand(e.target.value)} 
                                        placeholder="e.g. Huawei" 
                                        className="bg-slate-50 border-line"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempInverterBrand) { setInverterBrands([...inverterBrands, tempInverterBrand.trim()]); setTempInverterBrand(""); }}}}
                                    />
                                    <Button type="button" variant="outline" onClick={() => { if (tempInverterBrand) { setInverterBrands([...inverterBrands, tempInverterBrand.trim()]); setTempInverterBrand(""); } }}>+ Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {inverterBrands.map((b, i) => (
                                        <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full font-medium">
                                            {b} <X className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-red-500" onClick={() => setInverterBrands(inverterBrands.filter((_, idx) => idx !== i))} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Batteries */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-ink">Batteries</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={tempBatteryBrand} 
                                        onChange={(e) => setTempBatteryBrand(e.target.value)} 
                                        placeholder="e.g. CoreCell Energy" 
                                        className="bg-slate-50 border-line"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempBatteryBrand) { setBatteryBrands([...batteryBrands, tempBatteryBrand.trim()]); setTempBatteryBrand(""); }}}}
                                    />
                                    <Button type="button" variant="outline" onClick={() => { if (tempBatteryBrand) { setBatteryBrands([...batteryBrands, tempBatteryBrand.trim()]); setTempBatteryBrand(""); } }}>+ Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {batteryBrands.map((b, i) => (
                                        <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full font-medium">
                                            {b} <X className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-red-500" onClick={() => setBatteryBrands(batteryBrands.filter((_, idx) => idx !== i))} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Meet The Team */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">5</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Meet The Team</h2>
                        <p className="text-sm text-slate-custom">Add the people customers will meet — owners, sales, technical, or after-sales staff.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {team.map((member, index) => (
                        <div key={index} className="p-4 border border-line rounded-xl flex gap-4 relative bg-slate-50/50">
                            {team.length > 1 && (
                                <button type="button" onClick={() => setTeam(team.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <div className="w-24 shrink-0">
                                <UploadZone 
                                    onUpload={async (f) => {
                                        try {
                                            const { publicUrl } = await uploadFile(f, "team");
                                            const newTeam = [...team];
                                            newTeam[index].imageUrl = publicUrl;
                                            setTeam(newTeam);
                                            toast.success("Photo uploaded");
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
                                        className="bg-white"
                                    />
                                    <Input 
                                        placeholder="Designation" 
                                        value={member.designation}
                                        onChange={(e) => { const nt = [...team]; nt[index].designation = e.target.value; setTeam(nt); }}
                                        className="bg-white"
                                    />
                                </div>
                                <Input 
                                    placeholder="LinkedIn Profile URL" 
                                    value={member.linkedIn}
                                    onChange={(e) => { const nt = [...team]; nt[index].linkedIn = e.target.value; setTeam(nt); }}
                                    className="bg-white w-full"
                                />
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setTeam([...team, { name: '', designation: '', linkedIn: '', imageUrl: '' }])}>
                        <Plus className="w-4 h-4 mr-2" /> Add Team Member
                    </Button>
                </div>
            </div>

            {/* 6. Projects */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">6</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Projects</h2>
                        <p className="text-sm text-slate-custom">Show off completed work. Add as many projects as you like.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {projects.map((project, index) => (
                        <div key={index} className="p-5 border border-line rounded-xl relative bg-slate-50/50 space-y-4">
                            {projects.length > 1 && (
                                <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            
                            <div className="space-y-2 pr-8">
                                <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">YouTube Link</Label>
                                <Input 
                                    placeholder="https://youtube.com/watch?v=..." 
                                    value={project.youtubeUrl}
                                    onChange={(e) => { const np = [...projects]; np[index].youtubeUrl = e.target.value; setProjects(np); }}
                                    className="bg-white"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Date of Installation</Label>
                                    <Input 
                                        type="date"
                                        value={project.installationDate}
                                        onChange={(e) => { const np = [...projects]; np[index].installationDate = e.target.value; setProjects(np); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Customer Name</Label>
                                    <Input 
                                        value={project.customerName}
                                        onChange={(e) => { const np = [...projects]; np[index].customerName = e.target.value; setProjects(np); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Company Name</Label>
                                    <Input 
                                        value={project.companyName}
                                        onChange={(e) => { const np = [...projects]; np[index].companyName = e.target.value; setProjects(np); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">City</Label>
                                    <Input 
                                        value={project.city}
                                        onChange={(e) => { const np = [...projects]; np[index].city = e.target.value; setProjects(np); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Country</Label>
                                    <Input 
                                        value={project.country}
                                        onChange={(e) => { const np = [...projects]; np[index].country = e.target.value; setProjects(np); }}
                                        className="bg-white"
                                        placeholder="Pakistan"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Short Description</Label>
                                <Textarea 
                                    value={project.description}
                                    onChange={(e) => { const np = [...projects]; np[index].description = e.target.value; setProjects(np); }}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setProjects([...projects, { youtubeUrl: '', installationDate: '', customerName: '', companyName: '', city: '', country: '', description: '' }])}>
                        <Plus className="w-4 h-4 mr-2" /> Add Project
                    </Button>
                </div>
            </div>

            {/* 7. Customer Testimonials */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">7</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Customer Testimonials</h2>
                        <p className="text-sm text-slate-custom">Let real customers vouch for your work. Add as many testimonials as you like.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="p-5 border border-line rounded-xl relative bg-slate-50/50 space-y-4">
                            {testimonials.length > 1 && (
                                <button type="button" onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            
                            <div className="space-y-2 pr-8">
                                <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">YouTube Link</Label>
                                <Input 
                                    placeholder="https://youtube.com/watch?v=..." 
                                    value={testimonial.youtubeUrl}
                                    onChange={(e) => { const nt = [...testimonials]; nt[index].youtubeUrl = e.target.value; setTestimonials(nt); }}
                                    className="bg-white"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Date of Installation</Label>
                                    <Input 
                                        type="date"
                                        value={testimonial.installationDate}
                                        onChange={(e) => { const nt = [...testimonials]; nt[index].installationDate = e.target.value; setTestimonials(nt); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Customer Name</Label>
                                    <Input 
                                        value={testimonial.customerName}
                                        onChange={(e) => { const nt = [...testimonials]; nt[index].customerName = e.target.value; setTestimonials(nt); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Company Name</Label>
                                    <Input 
                                        value={testimonial.companyName}
                                        onChange={(e) => { const nt = [...testimonials]; nt[index].companyName = e.target.value; setTestimonials(nt); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">City</Label>
                                    <Input 
                                        value={testimonial.city}
                                        onChange={(e) => { const nt = [...testimonials]; nt[index].city = e.target.value; setTestimonials(nt); }}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Country</Label>
                                    <Input 
                                        value={testimonial.country}
                                        onChange={(e) => { const nt = [...testimonials]; nt[index].country = e.target.value; setTestimonials(nt); }}
                                        className="bg-white"
                                        placeholder="Pakistan"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Short Description</Label>
                                <Textarea 
                                    value={testimonial.description}
                                    onChange={(e) => { const nt = [...testimonials]; nt[index].description = e.target.value; setTestimonials(nt); }}
                                    className="bg-white"
                                    placeholder="Customer feedback or details..."
                                />
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setTestimonials([...testimonials, { youtubeUrl: '', installationDate: '', customerName: '', companyName: '', city: '', country: '', description: '' }])}>
                        <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                    </Button>
                </div>
            </div>

            {/* 8. Certifications & Documents */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">8</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Certifications & Documents</h2>
                        <p className="text-sm text-slate-custom">Upload proof — this speeds up verification.</p>
                    </div>
                </div>
                <div className="space-y-6">
                    {/* Certifications held */}
                    <div className="space-y-3">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Certifications Held</Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedCerts.map(c => (
                                <div 
                                    key={c} 
                                    className="flex items-center gap-2 border border-teal bg-teal/5 text-ink rounded-full px-3.5 py-1.5 cursor-pointer text-sm font-medium"
                                    onClick={() => toggleArray(c, selectedCerts, setSelectedCerts)}
                                >
                                    <span className="text-teal font-bold">✓</span>
                                    <span>{c}</span>
                                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 ml-1" onClick={(e) => { e.stopPropagation(); toggleArray(c, selectedCerts, setSelectedCerts); }} />
                                </div>
                            ))}
                            {DEFAULT_CERTIFICATIONS.filter(d => !selectedCerts.includes(d)).map(c => (
                                <div 
                                    key={c} 
                                    className="flex items-center gap-2 border border-line bg-white text-slate-custom rounded-full px-3.5 py-1.5 cursor-pointer text-sm hover:border-slate-400"
                                    onClick={() => toggleArray(c, selectedCerts, setSelectedCerts)}
                                >
                                    <span className="text-slate-300">+</span>
                                    <span>{c}</span>
                                </div>
                            ))}
                        </div>

                        {/* Add custom certification input */}
                        <div className="flex gap-2 max-w-md pt-2">
                            <Input 
                                value={tempCert} 
                                onChange={(e) => setTempCert(e.target.value)} 
                                placeholder="Add certification (e.g. ISO 9001, Tier 1 Certified)" 
                                className="bg-slate-50 border-line text-sm"
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addCustomItem(tempCert, selectedCerts, setSelectedCerts, () => setTempCert("")); }}}
                            />
                            <Button type="button" variant="outline" onClick={() => addCustomItem(tempCert, selectedCerts, setSelectedCerts, () => setTempCert(""))}>+ Add</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="regNumber" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Business Registration / CNIC Number</Label>
                            <Input id="regNumber" name="regNumber" required className="bg-slate-50 border-line" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Upload Licence / Certification Documents</Label>
                            <UploadZone 
                                onUpload={handleDocUpload} 
                                isUploading={isUploading}
                                accept=".pdf,image/*"
                                title="Click to upload documents"
                                description="PDF or image, up to 10MB each"
                            />
                        </div>
                    </div>

                    {/* Uploaded Documents List */}
                    {uploadedDocs.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Uploaded Documents ({uploadedDocs.length})</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {uploadedDocs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-line rounded-lg text-sm">
                                        <div className="flex items-center gap-2.5 truncate mr-2">
                                            <FileText className="w-4 h-4 text-teal shrink-0" />
                                            <span className="truncate text-ink font-medium">{doc.name}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setUploadedDocs(uploadedDocs.filter((_, i) => i !== idx))}
                                            className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-200 shrink-0"
                                            title="Remove document"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 9. Verification Tier (Exactly 2 Tiers from HTML) */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">9</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Verification Tier</h2>
                        <p className="text-sm text-slate-custom">Choose the tier you're applying for.</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedTier === 'silver' ? 'border-amber bg-amber/5' : 'border-line hover:bg-slate-50'}`}
                        onClick={() => setSelectedTier('silver')}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTier === 'silver' ? 'border-amber' : 'border-slate-300'}`}>
                                {selectedTier === 'silver' && <div className="w-2 h-2 rounded-full bg-amber" />}
                            </div>
                            <span className="font-semibold text-ink">Silver — Verified</span>
                        </div>
                        <p className="text-sm text-slate-custom ml-6">Licence checks, independent site visit audits, site videos, and customer testimonials.</p>
                    </div>
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedTier === 'gold' ? 'border-amber bg-amber/5' : 'border-line hover:bg-slate-50'}`}
                        onClick={() => setSelectedTier('gold')}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTier === 'gold' ? 'border-amber' : 'border-slate-300'}`}>
                                {selectedTier === 'gold' && <div className="w-2 h-2 rounded-full bg-amber" />}
                            </div>
                            <span className="font-semibold text-ink">Gold — Verified + Featured</span>
                        </div>
                        <p className="text-sm text-slate-custom ml-6">Everything in Silver, plus featured placement.</p>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={isLoading || isUploading} className="w-full bg-amber hover:bg-[#f2b458] text-ink font-semibold h-12 text-base">
                {isLoading ? (isPublic ? 'Submitting Application...' : 'Onboarding...') : (isPublic ? 'Submit Application' : 'Onboard EPC Installer')}
            </Button>
            {isPublic && (
                <p className="text-xs text-slate-custom text-center mt-3">
                    Our team typically reviews applications within 3–5 business days.
                </p>
            )}
            
        </form>
    );
}
