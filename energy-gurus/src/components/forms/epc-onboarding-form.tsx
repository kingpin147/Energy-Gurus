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
import { CheckCircle2 } from 'lucide-react';

const SECTORS = ['Residential', 'Commercial', 'Industrial', 'Agriculture'];
const BRANDS = ['LONGi', 'Jinko', 'Trina', 'JA Solar', 'Huawei', 'Growatt', 'Other'];
const CERTIFICATIONS = ['AEDB Licence', 'PEC Licence', 'Manufacturer Certified', 'PSA - Energy Nexus Certified'];

export function EpcOnboardingForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const { uploadFile, isUploading } = useR2Upload();
    const [logoUrl, setLogoUrl] = useState("");
    const [licenceUrls, setLicenceUrls] = useState<string[]>([]);
    
    // Checkbox states
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [selectedTier, setSelectedTier] = useState<'bronze'|'silver'|'gold'>('bronze');

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
            setLicenceUrls(prev => [...prev, publicUrl]);
            toast.success("Document uploaded successfully");
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

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        
        // Append all the custom state data
        formData.append("logoUrl", logoUrl);
        formData.append("licenceDocuments", JSON.stringify(licenceUrls));
        formData.append("tier", selectedTier);
        selectedSectors.forEach(s => formData.append("sectors", s));
        selectedBrands.forEach(b => formData.append("brandsCertified", b));
        selectedCerts.forEach(c => formData.append("certifications", c));

        const result = await onboardEpcInstaller(formData);
        
        setIsLoading(false);
        
        if (result.success) {
            toast.success("EPC Onboarded successfully");
            setGeneratedPassword(result.password || null);
            setIsSubmitted(true);
        } else {
            toast.error(result.message || "Failed to onboard EPC");
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-teal/10 text-teal flex items-center justify-center mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-space-grotesk font-semibold text-ink mb-2">EPC Onboarded Successfully</h2>
                <p className="text-slate-custom mb-6">The installer's account has been created and profile is live.</p>
                
                {generatedPassword && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-line mb-6 max-w-md w-full">
                        <p className="text-sm font-bold text-slate-custom mb-2">Temporary Password for EPC:</p>
                        <code className="text-lg bg-white px-3 py-1 rounded border border-line">{generatedPassword}</code>
                        <p className="text-xs text-slate-custom mt-2">Please share this securely or rely on the welcome email.</p>
                    </div>
                )}
                
                <Button onClick={() => router.push('/dashboard/users')} className="bg-ink text-white hover:bg-ink/90">
                    Return to Users
                </Button>
            </div>
        );
    }

    return (
        <form action={onSubmit} className="w-full max-w-5xl space-y-6 pb-20">
            
            {/* Basic Information */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">1</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Basic Information</h2>
                        <p className="text-sm text-slate-custom">Details about the company.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="ceoName" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Installer / Contact Name</Label>
                        <Input id="ceoName" name="ceoName" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Company Name</Label>
                        <Input id="companyName" name="companyName" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="yearsInBusiness" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Years in Business</Label>
                        <Input id="yearsInBusiness" name="yearsInBusiness" type="number" min="0" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Company Logo</Label>
                        <UploadZone 
                            onUpload={handleLogoUpload} 
                            isUploading={isUploading}
                            value={logoUrl}
                            accept="image/*"
                            title="Click to upload logo"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="about" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Short Bio</Label>
                        <Textarea id="about" name="about" required placeholder="Specialties, experience, service philosophy..." className="bg-slate-50 border-line min-h-[90px]" />
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">2</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Location</h2>
                        <p className="text-sm text-slate-custom">Operating region.</p>
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
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Country</Label>
                        <Input id="country" name="country" defaultValue="Pakistan" required className="bg-slate-50 border-line" />
                    </div>
                </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">3</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Contact Details</h2>
                        <p className="text-sm text-slate-custom">How customers will reach them.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="contactNo" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Contact No.</Label>
                        <Input id="contactNo" name="contactNo" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Email Address (Used for Login)</Label>
                        <Input id="email" name="email" type="email" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Website</Label>
                        <Input id="website" name="website" placeholder="www.company.com" className="bg-slate-50 border-line" />
                    </div>
                </div>
            </div>

            {/* Specialties */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">4</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Specialties</h2>
                        <p className="text-sm text-slate-custom">System types and brands.</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">System Type</Label>
                        <div className="flex flex-wrap gap-2">
                            {SECTORS.map(s => (
                                <div key={s} className="flex items-center space-x-2 border border-line rounded-full px-3 py-1.5 cursor-pointer hover:bg-slate-50" onClick={() => toggleArray(s, selectedSectors, setSelectedSectors)}>
                                    <input type="checkbox" checked={selectedSectors.includes(s)} className="w-4 h-4 text-teal rounded border-line focus:ring-teal" readOnly />
                                    <label className="text-sm cursor-pointer">{s}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Brands Certified</Label>
                        <div className="flex flex-wrap gap-2">
                            {BRANDS.map(b => (
                                <div key={b} className="flex items-center space-x-2 border border-line rounded-full px-3 py-1.5 cursor-pointer hover:bg-slate-50" onClick={() => toggleArray(b, selectedBrands, setSelectedBrands)}>
                                    <input type="checkbox" checked={selectedBrands.includes(b)} className="w-4 h-4 text-teal rounded border-line focus:ring-teal" readOnly />
                                    <label className="text-sm cursor-pointer">{b}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Certifications & Documents */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">5</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Certifications & Documents</h2>
                        <p className="text-sm text-slate-custom">Licences and proof.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3 md:col-span-2">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Certifications Held</Label>
                        <div className="flex flex-wrap gap-2">
                            {CERTIFICATIONS.map(c => (
                                <div key={c} className="flex items-center space-x-2 border border-line rounded-full px-3 py-1.5 cursor-pointer hover:bg-slate-50" onClick={() => toggleArray(c, selectedCerts, setSelectedCerts)}>
                                    <input type="checkbox" checked={selectedCerts.includes(c)} className="w-4 h-4 text-teal rounded border-line focus:ring-teal" readOnly />
                                    <label className="text-sm cursor-pointer">{c}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="regNumber" className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Business Reg / CNIC</Label>
                        <Input id="regNumber" name="regNumber" required className="bg-slate-50 border-line" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Upload Documents</Label>
                        <UploadZone 
                            onUpload={handleDocUpload} 
                            isUploading={isUploading}
                            accept=".pdf,image/*"
                            title="Upload licence files"
                        />
                        {licenceUrls.length > 0 && (
                            <p className="text-xs text-teal mt-1 font-medium">{licenceUrls.length} file(s) uploaded</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tier */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">6</span>
                    <div>
                        <h2 className="text-lg font-space-grotesk font-semibold text-ink">Verification Tier</h2>
                    </div>
                </div>
                <div className="space-y-3">
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer ${selectedTier === 'bronze' ? 'border-amber bg-amber/5' : 'border-line hover:bg-slate-50'}`}
                        onClick={() => setSelectedTier('bronze')}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTier === 'bronze' ? 'border-amber' : 'border-slate-300'}`}>
                                {selectedTier === 'bronze' && <div className="w-2 h-2 rounded-full bg-amber" />}
                            </div>
                            <span className="font-semibold text-ink">Bronze — Free Listing</span>
                        </div>
                        <p className="text-sm text-slate-custom ml-6">Basic profile in the directory. No verification badge.</p>
                    </div>
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer ${selectedTier === 'silver' ? 'border-amber bg-amber/5' : 'border-line hover:bg-slate-50'}`}
                        onClick={() => setSelectedTier('silver')}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTier === 'silver' ? 'border-amber' : 'border-slate-300'}`}>
                                {selectedTier === 'silver' && <div className="w-2 h-2 rounded-full bg-amber" />}
                            </div>
                            <span className="font-semibold text-ink">Silver — Verified</span>
                        </div>
                        <p className="text-sm text-slate-custom ml-6">Licence check + site visit audit. "Verified" badge on your profile.</p>
                    </div>
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer ${selectedTier === 'gold' ? 'border-amber bg-amber/5' : 'border-line hover:bg-slate-50'}`}
                        onClick={() => setSelectedTier('gold')}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedTier === 'gold' ? 'border-amber' : 'border-slate-300'}`}>
                                {selectedTier === 'gold' && <div className="w-2 h-2 rounded-full bg-amber" />}
                            </div>
                            <span className="font-semibold text-ink">Gold — Verified + Featured</span>
                        </div>
                        <p className="text-sm text-slate-custom ml-6">Everything in Silver, plus featured placement and priority lead routing.</p>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={isLoading || isUploading} className="w-full bg-amber hover:bg-[#f2b458] text-ink font-semibold h-12">
                {isLoading ? 'Onboarding...' : 'Onboard EPC Installer'}
            </Button>
            
        </form>
    );
}
