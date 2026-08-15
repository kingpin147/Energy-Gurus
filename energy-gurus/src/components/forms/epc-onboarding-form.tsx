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
import { CheckCircle2, X, Plus } from 'lucide-react';

const SECTORS = ['Residential', 'Commercial', 'Industrial', 'Agriculture'];
const CERTIFICATIONS = ['AEDB Licence', 'PEC Licence', 'Manufacturer Certified', 'PSA - Energy Nexus Certified'];

type TeamMember = { name: string; designation: string; linkedIn: string; imageUrl: string; };
type ProjectData = { youtubeUrl: string; installationDate: string; customerName: string; companyName: string; city: string; country: string; description: string; };

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
    const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
    const [selectedTier, setSelectedTier] = useState<'bronze'|'silver'|'gold'>('bronze');

    // Brand states
    const [solarBrands, setSolarBrands] = useState<string[]>([]);
    const [inverterBrands, setInverterBrands] = useState<string[]>([]);
    const [batteryBrands, setBatteryBrands] = useState<string[]>([]);
    const [tempSolarBrand, setTempSolarBrand] = useState("");
    const [tempInverterBrand, setTempInverterBrand] = useState("");
    const [tempBatteryBrand, setTempBatteryBrand] = useState("");

    // Team state
    const [team, setTeam] = useState<TeamMember[]>([{ name: '', designation: '', linkedIn: '', imageUrl: '' }]);

    // Projects state
    const [projects, setProjects] = useState<ProjectData[]>([{ youtubeUrl: '', installationDate: '', customerName: '', companyName: '', city: '', country: '', description: '' }]);

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
        selectedCerts.forEach(c => formData.append("certifications", c));
        solarBrands.forEach(b => formData.append("solarBrands", b));
        inverterBrands.forEach(b => formData.append("inverterBrands", b));
        batteryBrands.forEach(b => formData.append("batteryBrands", b));
        
        formData.append("team", JSON.stringify(team.filter(t => t.name || t.designation)));
        formData.append("projects", JSON.stringify(projects.filter(p => p.youtubeUrl || p.customerName || p.companyName)));

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
                        <p className="text-sm text-slate-custom">What systems do you install, and which brands are you certified for?</p>
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
                                        placeholder="e.g. LONGI Solar" 
                                        className="bg-slate-50 border-line"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempSolarBrand) { setSolarBrands([...solarBrands, tempSolarBrand]); setTempSolarBrand(""); }}}}
                                    />
                                    <Button type="button" variant="outline" onClick={() => { if (tempSolarBrand) { setSolarBrands([...solarBrands, tempSolarBrand]); setTempSolarBrand(""); } }}>+ Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {solarBrands.map((b, i) => (
                                        <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full">
                                            {b} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSolarBrands(solarBrands.filter((_, idx) => idx !== i))} />
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
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempInverterBrand) { setInverterBrands([...inverterBrands, tempInverterBrand]); setTempInverterBrand(""); }}}}
                                    />
                                    <Button type="button" variant="outline" onClick={() => { if (tempInverterBrand) { setInverterBrands([...inverterBrands, tempInverterBrand]); setTempInverterBrand(""); } }}>+ Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {inverterBrands.map((b, i) => (
                                        <span key={i} className="flex items-center bg-teal/10 text-teal text-sm px-3 py-1 rounded-full">
                                            {b} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setInverterBrands(inverterBrands.filter((_, idx) => idx !== i))} />
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
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); if (tempBatteryBrand) { setBatteryBrands([...batteryBrands, tempBatteryBrand]); setTempBatteryBrand(""); }}}}
                                    />
                                    <Button type="button" variant="outline" onClick={() => { if (tempBatteryBrand) { setBatteryBrands([...batteryBrands, tempBatteryBrand]); setTempBatteryBrand(""); } }}>+ Add</Button>
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
                </div>
            </div>

            {/* Meet The Team */}
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

            {/* Projects */}
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
                                <div className="space-y-2">
                                    <Label className="text-xs font-ibm-plex-mono uppercase tracking-wider text-slate-custom">Country</Label>
                                    <Input 
                                        value={project.country}
                                        onChange={(e) => { const np = [...projects]; np[index].country = e.target.value; setProjects(np); }}
                                        className="bg-white"
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

            {/* Certifications & Documents */}
            <div className="bg-white border border-line rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">7</span>
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
                    <span className="w-7 h-7 rounded-full bg-slate-50 border border-line flex items-center justify-center font-ibm-plex-mono text-xs font-semibold text-teal">8</span>
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
