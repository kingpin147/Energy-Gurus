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
const BUSINESS_TYPES = [
    { value: 'sole', label: 'Sole Ownership' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'private-ltd', label: 'Private Limited Company' },
    { value: 'public-ltd', label: 'Public Limited Company' },
];
const SYSTEM_TYPES = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'agriculture', label: 'Agriculture' },
];

type TeamMember = { name: string; designation: string; linkedIn: string; imageUrl: string; };
type ProjectEntry = { youtubeUrl: string; entryType: string; installationDate: string; systemType: string; customerName: string; companyName: string; city: string; country: string; description: string; };
type OfficeEntry = { address: string; area: string; city: string; country: string; coordinates: string; };
type UploadedDoc = { url: string; name: string; };



export function EpcOnboardingForm({ isPublic = false }: { isPublic?: boolean } = {}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const { uploadFile, isUploading } = useR2Upload();
    const [logoUrl, setLogoUrl] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
    const [solarCertDocs, setSolarCertDocs] = useState<UploadedDoc[]>([]);
    const [inverterCertDocs, setInverterCertDocs] = useState<UploadedDoc[]>([]);
    const [batteryCertDocs, setBatteryCertDocs] = useState<UploadedDoc[]>([]);
    
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

    // Projects & Testimonials (unified)
    const [projects, setProjects] = useState<ProjectEntry[]>([{ youtubeUrl: '', entryType: '', installationDate: '', systemType: '', customerName: '', companyName: '', city: '', country: '', description: '' }]);

    const handleLogoUpload = async (file: File) => {
        try {
            const { publicUrl } = await uploadFile(file, "epc-logos");
            setLogoUrl(publicUrl);
            toast.success("Logo uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload logo");
        }
    };

    const handlePhotoUpload = async (file: File) => {
        try {
            const { publicUrl } = await uploadFile(file, "epc-photos");
            setPhotos(prev => [...prev, publicUrl]);
            toast.success("Photo uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload photo");
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

    const handleBrandCertUpload = async (file: File, category: 'solar' | 'inverter' | 'battery') => {
        try {
            const { publicUrl } = await uploadFile(file, "epc-brand-certs");
            const doc = { url: publicUrl, name: file.name };
            if (category === 'solar') setSolarCertDocs(prev => [...prev, doc]);
            else if (category === 'inverter') setInverterCertDocs(prev => [...prev, doc]);
            else setBatteryCertDocs(prev => [...prev, doc]);
            toast.success(`${file.name} uploaded`);
        } catch (error) {
            toast.error("Failed to upload certificate");
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
        formData.append("photos", JSON.stringify(photos));
        formData.append("licenceDocuments", JSON.stringify(uploadedDocs.map(d => d.url)));
        formData.append("solarCertDocuments", JSON.stringify(solarCertDocs.map(d => d.url)));
        formData.append("inverterCertDocuments", JSON.stringify(inverterCertDocs.map(d => d.url)));
        formData.append("batteryCertDocuments", JSON.stringify(batteryCertDocs.map(d => d.url)));
        formData.append("tier", selectedTier);
        selectedSectors.forEach(s => formData.append("sectors", s));
        selectedCerts.forEach(c => formData.append("certifications", c));
        solarBrands.forEach(b => formData.append("solarBrands", b));
        inverterBrands.forEach(b => formData.append("inverterBrands", b));
        batteryBrands.forEach(b => formData.append("batteryBrands", b));
        
        formData.append("offices", JSON.stringify(offices.filter(o => o.city || o.address || o.area)));
        formData.append("team", JSON.stringify(team.filter(t => t.name || t.designation)));
        formData.append("projects", JSON.stringify(projects.filter(p => p.youtubeUrl || p.customerName || p.companyName || p.description)));

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
            <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 bg-[rgba(47,110,98,0.1)] text-teal rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h2 className="font-space-grotesk text-[1.6rem] font-bold text-ink">
                    {isPublic ? "Application Submitted Successfully!" : "EPC Installer Onboarded!"}
                </h2>
                <p className="text-slate-custom max-w-md mx-auto">
                    {isPublic 
                        ? "Thank you for applying. Our verification team will review your details and contact you within 3-5 business days."
                        : "The EPC installer profile has been created. They can now log in using the generated credentials."}
                </p>

                {generatedPassword && (
                    <div className="bg-[rgba(232,163,61,0.15)] border border-[rgba(232,163,61,0.3)] p-4 rounded-[6px] max-w-sm mx-auto mt-6 text-left">
                        <p className="text-sm text-slate-700 mb-1">Your temporary password is:</p>
                        <p className="font-mono text-lg font-bold text-ink">{generatedPassword}</p>
                        <p className="text-xs text-slate-500 mt-2">Please save this password. You will need it to log in.</p>
                    </div>
                )}
                <div className="mt-4">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Submit Another Application
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form action={onSubmit} id="onboardForm">
            <div className="form-progress">
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
                <div className="step-dot done"></div>
            </div>

            {/* 1. Basic Information */}
            <div className="form-card">
                <h2><span className="section-num">1</span>Basic Information</h2>
                <p className="section-sub">Tell us about you and your company.</p>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="ceoName">Name</label>
                        <input type="text" id="ceoName" name="ceoName" required />
                    </div>
                    <div className="field">
                        <label htmlFor="designation">Designation</label>
                        <input type="text" id="designation" name="designation" placeholder="e.g. Owner, Sales Manager" />
                    </div>
                    <div className="field">
                        <label htmlFor="companyName">Company Name</label>
                        <input type="text" id="companyName" name="companyName" required />
                    </div>
                    <div className="field">
                        <label htmlFor="businessType">Business Type</label>
                        <select id="businessType" name="businessType" required>
                            <option value="" disabled>Select business type</option>
                            <option value="sole">Sole Ownership</option>
                            <option value="partnership">Partnership</option>
                            <option value="private-ltd">Private Limited Company</option>
                            <option value="public-ltd">Public Limited Company</option>
                        </select>
                    </div>
                    <div className="field">
                        <label htmlFor="yearsInBusiness">Years in Business</label>
                        <input type="number" id="yearsInBusiness" name="yearsInBusiness" min="0" required />
                    </div>
                    <div className="field full">
                        <label>Company Logo / Photo</label>
                        <div className="entry-cards">
                            {/* Logo */}
                            <div className="entry-card">
                                <UploadZone 
                                    onUpload={handleLogoUpload} 
                                    isUploading={isUploading}
                                    value={logoUrl}
                                    accept="image/*"
                                    title="Click to upload logo"
                                    description="PNG or JPG, up to 5MB"
                                />
                            </div>
                            {/* Additional photos */}
                            {photos.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {photos.map((p, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-lg border border-line overflow-hidden group">
                                            <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setPhotos(photos.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="button" className="add-team-btn mt-3" onClick={() => document.getElementById('additionalPhotoUpload')?.click()}>+ Add Another Photo</button>
                        <input type="file" id="additionalPhotoUpload" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); e.target.value = ''; }} />
                    </div>
                    <div className="field full">
                        <label htmlFor="about">Short Bio</label>
                        <textarea id="about" name="about" required placeholder="Tell homeowners what makes your company a good fit — specialties, experience, service philosophy."></textarea>
                    </div>
                </div>
            </div>

            {/* 2. Location */}
            <div className="form-card">
                <h2><span className="section-num">2</span>Location</h2>
                <p className="section-sub">Where do you operate?</p>
                <div className="form-grid">
                    <div className="field full">
                        <label htmlFor="address">Full Address</label>
                        <input type="text" id="address" name="address" required />
                    </div>
                    <div className="field">
                        <label htmlFor="area">Area / Society</label>
                        <input type="text" id="area" name="area" required />
                    </div>
                    <div className="field">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" name="city" required />
                    </div>
                    <div className="field">
                        <label htmlFor="country">Country</label>
                        <input type="text" id="country" name="country" defaultValue="Pakistan" required />
                    </div>
                    <div className="field full">
                        <label htmlFor="coordinates">Location Coordinates (Latitude, Longitude)</label>
                        <input type="text" id="coordinates" name="coordinates" placeholder="e.g. 31.5204, 74.3587" />
                        <p className="hint">Optional — helps customers find you accurately on the map. You can copy this from Google Maps by right-clicking your location.</p>
                    </div>
                </div>

                <div className="field full" style={{ marginTop: '22px' }}>
                    <label>Additional Office Locations (If Any)</label>
                    <p className="hint" style={{ margin: '-2px 0 14px' }}>Add another entry for each additional office you operate from.</p>
                    
                    <div className="entry-cards">
                        {offices.map((office, idx) => (
                            <div key={idx} className="entry-card">
                                <button type="button" className="entry-card-remove" onClick={() => setOffices(offices.filter((_, i) => i !== idx))}>✕</button>
                                <div className="entry-card-grid">
                                    <div className="entry-card-field full">
                                        <label>Full Address</label>
                                        <input type="text" value={office.address} onChange={(e) => { const no = [...offices]; no[idx].address = e.target.value; setOffices(no); }} />
                                    </div>
                                    <div className="entry-card-field">
                                        <label>Area / Society</label>
                                        <input type="text" value={office.area} onChange={(e) => { const no = [...offices]; no[idx].area = e.target.value; setOffices(no); }} />
                                    </div>
                                    <div className="entry-card-field">
                                        <label>City</label>
                                        <input type="text" value={office.city} onChange={(e) => { const no = [...offices]; no[idx].city = e.target.value; setOffices(no); }} />
                                    </div>
                                    <div className="entry-card-field">
                                        <label>Country</label>
                                        <input type="text" value={office.country} onChange={(e) => { const no = [...offices]; no[idx].country = e.target.value; setOffices(no); }} placeholder="Pakistan" />
                                    </div>
                                    <div className="entry-card-field full">
                                        <label>Location Coordinates (Latitude, Longitude)</label>
                                        <input type="text" value={office.coordinates} onChange={(e) => { const no = [...offices]; no[idx].coordinates = e.target.value; setOffices(no); }} placeholder="e.g. 31.5204, 74.3587" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button type="button" className="add-team-btn" style={{ marginTop: '14px' }} onClick={() => setOffices([...offices, { address: '', area: '', city: '', country: 'Pakistan', coordinates: '' }])}>+ Add Office</button>
                </div>
            </div>

            {/* 3. Contact Details */}
            <div className="form-card">
                <h2><span className="section-num">3</span>Contact Details</h2>
                <p className="section-sub">How customers and our team will reach you.</p>
                <div className="form-grid">
                    <div className="field">
                        <label htmlFor="contactNo">Voice Number</label>
                        <input type="tel" id="contactNo" name="contactNo" placeholder="e.g. 042-111-000-111 or 03XX-XXXXXXX" required />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">WhatsApp Number</label>
                        <input type="tel" id="whatsapp" name="whatsapp" placeholder="e.g. 03XX-XXXXXXX" />
                    </div>
                    <div className="field">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="field">
                        <label htmlFor="website">Website</label>
                        <input type="text" id="website" name="website" placeholder="www.yourcompany.com" />
                    </div>
                    <div className="field">
                        <label htmlFor="facebook">Facebook</label>
                        <input type="text" id="facebook" name="facebook" placeholder="Profile URL" />
                    </div>
                    <div className="field">
                        <label htmlFor="instagram">Instagram</label>
                        <input type="text" id="instagram" name="instagram" placeholder="Profile URL" />
                    </div>
                    <div className="field">
                        <label htmlFor="linkedin">LinkedIn</label>
                        <input type="text" id="linkedin" name="linkedin" placeholder="Profile URL" />
                    </div>
                    <div className="field full">
                        <label htmlFor="youtube">YouTube</label>
                        <input type="text" id="youtube" name="youtube" placeholder="Channel URL" />
                    </div>
                </div>
            </div>

            {/* 4. Specialties */}
            <div className="form-card">
                <h2><span className="section-num">4</span>Specialties</h2>
                <p className="section-sub">What systems do you install?</p>
                <div className="field full">
                    <label>System Type</label>
                    <div className="chip-group">
                        {DEFAULT_SECTORS.map(sector => (
                            <label key={sector} className="chip-check">
                                <input type="checkbox" checked={selectedSectors.includes(sector)} onChange={() => toggleArray(sector, selectedSectors, setSelectedSectors)} /> 
                                {sector}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Meet The Team */}
            <div className="form-card">
                <h2><span className="section-num">5</span>Meet The Team</h2>
                <p className="section-sub">Add the people customers will meet — owners, sales, technical, or after-sales staff.</p>

                <div className="team-members">
                    {team.map((member, idx) => (
                        <div key={idx} className="team-member-row">
                            <label className="team-photo-upload" htmlFor={`team-photo-${idx}`} style={{ backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none', backgroundSize: 'cover' }}>
                                {!member.imageUrl && '📷'}
                                <input type="file" id={`team-photo-${idx}`} accept="image/*" onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        try {
                                            const { publicUrl } = await uploadFile(e.target.files[0], "epc-team");
                                            const nt = [...team]; nt[idx].imageUrl = publicUrl; setTeam(nt);
                                        } catch(err) { toast.error("Failed"); }
                                    }
                                }} />
                            </label>
                            <div className="team-fields">
                                <div className="team-fields-row">
                                    <input type="text" placeholder="Name" value={member.name} onChange={(e) => { const nt = [...team]; nt[idx].name = e.target.value; setTeam(nt); }} />
                                    <input type="text" placeholder="Designation" value={member.designation} onChange={(e) => { const nt = [...team]; nt[idx].designation = e.target.value; setTeam(nt); }} />
                                </div>
                                <input type="text" placeholder="LinkedIn Profile URL" value={member.linkedIn} onChange={(e) => { const nt = [...team]; nt[idx].linkedIn = e.target.value; setTeam(nt); }} />
                            </div>
                            <button type="button" className="team-remove-btn" onClick={() => setTeam(team.filter((_, i) => i !== idx))}>✕</button>
                        </div>
                    ))}
                </div>
                <button type="button" className="add-team-btn" onClick={() => setTeam([...team, { name: '', designation: '', linkedIn: '', imageUrl: '' }])}>+ Add Team Member</button>
            </div>

            {/* 6. Projects & Testimonials */}
            <div className="form-card">
                <h2><span className="section-num">6</span>Projects &amp; Testimonials</h2>
                <p className="section-sub">Show off completed work and let real customers vouch for it. Select whether each entry is a Project or a Testimonial, and add as many as you like.</p>

                <div className="entry-cards">
                    {projects.map((proj, idx) => (
                        <div key={idx} className="entry-card">
                            <button type="button" className="entry-card-remove" onClick={() => setProjects(projects.filter((_, i) => i !== idx))}>✕</button>
                            <div className="entry-card-grid">
                                <div className="entry-card-field full">
                                    <label>YouTube Link</label>
                                    <input type="text" value={proj.youtubeUrl} onChange={(e) => { const np = [...projects]; np[idx].youtubeUrl = e.target.value; setProjects(np); }} placeholder="https://youtube.com/watch?v=..." />
                                </div>
                                <div className="entry-card-field">
                                    <label>Entry Type</label>
                                    <select value={proj.entryType} onChange={(e) => { const np = [...projects]; np[idx].entryType = e.target.value; setProjects(np); }}>
                                        <option value="" disabled>Select entry type</option>
                                        <option value="project">Project</option>
                                        <option value="testimonial">Testimonial</option>
                                    </select>
                                </div>
                                <div className="entry-card-field">
                                    <label>Date of Installation</label>
                                    <input type="date" value={proj.installationDate} onChange={(e) => { const np = [...projects]; np[idx].installationDate = e.target.value; setProjects(np); }} />
                                </div>
                                <div className="entry-card-field">
                                    <label>System Type</label>
                                    <select value={proj.systemType} onChange={(e) => { const np = [...projects]; np[idx].systemType = e.target.value; setProjects(np); }}>
                                        <option value="" disabled>Select type</option>
                                        {SYSTEM_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div className="entry-card-field">
                                    <label>Customer Name</label>
                                    <input type="text" value={proj.customerName} onChange={(e) => { const np = [...projects]; np[idx].customerName = e.target.value; setProjects(np); }} />
                                </div>
                                <div className="entry-card-field">
                                    <label>Company Name</label>
                                    <input type="text" value={proj.companyName} onChange={(e) => { const np = [...projects]; np[idx].companyName = e.target.value; setProjects(np); }} />
                                </div>
                                <div className="entry-card-field">
                                    <label>City</label>
                                    <input type="text" value={proj.city} onChange={(e) => { const np = [...projects]; np[idx].city = e.target.value; setProjects(np); }} />
                                </div>
                                <div className="entry-card-field">
                                    <label>Country</label>
                                    <input type="text" value={proj.country} onChange={(e) => { const np = [...projects]; np[idx].country = e.target.value; setProjects(np); }} />
                                </div>
                                <div className="entry-card-field full">
                                    <label>Short Description</label>
                                    <textarea value={proj.description} onChange={(e) => { const np = [...projects]; np[idx].description = e.target.value; setProjects(np); }}></textarea>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" className="add-team-btn" onClick={() => setProjects([...projects, { youtubeUrl: '', entryType: '', installationDate: '', systemType: '', customerName: '', companyName: '', city: '', country: '', description: '' }])}>+ Add Entry</button>
            </div>

            {/* 7. Certifications & Documents */}
            <div className="form-card">
                <h2><span className="section-num">7</span>Certifications &amp; Documents</h2>
                <p className="section-sub">Upload proof — this speeds up verification.</p>
                <div className="form-grid">
                    <div className="field full">
                        <label>Certifications Held</label>
                        <div className="chip-group">
                            {DEFAULT_CERTIFICATIONS.map(cert => (
                                <label key={cert} className="chip-check">
                                    <input type="checkbox" checked={selectedCerts.includes(cert)} onChange={() => toggleArray(cert, selectedCerts, setSelectedCerts)} /> 
                                    {cert}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="regNumber">Business Registration / CNIC Number</label>
                        <input type="text" id="regNumber" name="regNumber" required />
                    </div>
                    <div className="field">
                        <label>Upload Licence / Certification Documents</label>
                        <UploadZone 
                            onUpload={handleDocUpload} 
                            isUploading={isUploading}
                            title="Click to upload"
                            description="PDF or image, up to 10MB each"
                            accept=".pdf,image/*"
                        />
                        {uploadedDocs.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {uploadedDocs.map((doc, i) => (
                                    <div key={i} className="text-xs text-slate-custom bg-slate-50 p-2 rounded flex justify-between">
                                        <span className="truncate">{doc.name}</span>
                                        <button type="button" onClick={() => setUploadedDocs(uploadedDocs.filter((_, idx) => idx !== i))} className="text-red-500 hover:underline">Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="field full">
                        <label>Brands You Are Certified to Install</label>
                        <p className="hint" style={{ margin: '-4px 0 16px' }}>Type a brand name and click Add. You can add multiple entries per category.</p>

                        <div className="entry-builder">
                            <div className="entry-builder-label">Solar Panels</div>
                            <div className="entry-row">
                                <input type="text" placeholder="e.g. LONGi Solar" value={tempSolarBrand} onChange={e => setTempSolarBrand(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(tempSolarBrand, solarBrands, setSolarBrands, () => setTempSolarBrand('')); } }} />
                                <button type="button" className="entry-add-btn" onClick={() => addCustomItem(tempSolarBrand, solarBrands, setSolarBrands, () => setTempSolarBrand(''))}>+ Add</button>
                            </div>
                            <div className="entry-tags">
                                {solarBrands.map(b => (
                                    <span key={b} className="entry-tag">{b} <button type="button" onClick={() => setSolarBrands(solarBrands.filter(i => i !== b))}>✕</button></span>
                                ))}
                            </div>
                            <div className="mt-2">
                                <UploadZone 
                                    onUpload={(f) => handleBrandCertUpload(f, 'solar')} 
                                    isUploading={isUploading}
                                    title="Upload Certificate(s)"
                                    description="PDF or image, per brand certification"
                                    accept=".pdf,image/*"
                                />
                            </div>
                        </div>

                        <div className="entry-builder">
                            <div className="entry-builder-label">Inverters</div>
                            <div className="entry-row">
                                <input type="text" placeholder="e.g. Huawei" value={tempInverterBrand} onChange={e => setTempInverterBrand(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(tempInverterBrand, inverterBrands, setInverterBrands, () => setTempInverterBrand('')); } }} />
                                <button type="button" className="entry-add-btn" onClick={() => addCustomItem(tempInverterBrand, inverterBrands, setInverterBrands, () => setTempInverterBrand(''))}>+ Add</button>
                            </div>
                            <div className="entry-tags">
                                {inverterBrands.map(b => (
                                    <span key={b} className="entry-tag">{b} <button type="button" onClick={() => setInverterBrands(inverterBrands.filter(i => i !== b))}>✕</button></span>
                                ))}
                            </div>
                            <div className="mt-2">
                                <UploadZone 
                                    onUpload={(f) => handleBrandCertUpload(f, 'inverter')} 
                                    isUploading={isUploading}
                                    title="Upload Certificate(s)"
                                    description="PDF or image, per brand certification"
                                    accept=".pdf,image/*"
                                />
                            </div>
                        </div>

                        <div className="entry-builder">
                            <div className="entry-builder-label">Batteries</div>
                            <div className="entry-row">
                                <input type="text" placeholder="e.g. CoreCell Energy" value={tempBatteryBrand} onChange={e => setTempBatteryBrand(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(tempBatteryBrand, batteryBrands, setBatteryBrands, () => setTempBatteryBrand('')); } }} />
                                <button type="button" className="entry-add-btn" onClick={() => addCustomItem(tempBatteryBrand, batteryBrands, setBatteryBrands, () => setTempBatteryBrand(''))}>+ Add</button>
                            </div>
                            <div className="entry-tags">
                                {batteryBrands.map(b => (
                                    <span key={b} className="entry-tag">{b} <button type="button" onClick={() => setBatteryBrands(batteryBrands.filter(i => i !== b))}>✕</button></span>
                                ))}
                            </div>
                            <div className="mt-2">
                                <UploadZone 
                                    onUpload={(f) => handleBrandCertUpload(f, 'battery')} 
                                    isUploading={isUploading}
                                    title="Upload Certificate(s)"
                                    description="PDF or image, per brand certification"
                                    accept=".pdf,image/*"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8. Verification Tier */}
            <div className="form-card">
                <h2><span className="section-num">8</span>Verification Tier</h2>
                <p className="section-sub">Choose the tier you're applying for.</p>
                <div className="radio-tier">
                    <label className="tier-option">
                        <input type="radio" name="tier" value="silver" checked={selectedTier === 'silver'} onChange={() => setSelectedTier('silver')} />
                        <div>
                            <div className="tier-name">Silver — Verified</div>
                            <div className="tier-desc">Licence/certification checks, independent site audits, site videos, and customer testimonials — plus on-call or physical surveys with customers to gather feedback.</div>
                        </div>
                    </label>
                    <label className="tier-option">
                        <input type="radio" name="tier" value="gold" checked={selectedTier === 'gold'} onChange={() => setSelectedTier('gold')} />
                        <div>
                            <div className="tier-name">Gold — Verified + Featured</div>
                            <div className="tier-desc">Everything in Silver, plus featured placement.</div>
                        </div>
                    </label>
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
            <p className="form-note">Our team typically reviews applications within 3–5 business days.</p>
        </form>

    );
}
