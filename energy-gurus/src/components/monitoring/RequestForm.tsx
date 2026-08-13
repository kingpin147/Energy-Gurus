'use client';

import React, { useState, useEffect } from 'react';
import { submitMonitoringRequest } from '@/app/(public)/monitoring/actions';

export default function RequestForm() {
    const [size, setSize] = useState<string>('');
    const [pkg, setPkg] = useState<string>('');
    const [hours, setHours] = useState<string>('');
    const [plan, setPlan] = useState<string>('');
    
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [cnic, setCnic] = useState<string>('');

    useEffect(() => {
        const handleSelectPackage = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { pkg: newPkg, size: newSize, hours: newHours, plan: newPlan } = customEvent.detail;
            setPkg(newPkg);
            setSize(newSize);
            setHours(newHours);
            setPlan(newPlan);
            
            if (newSize === 'contact') {
                setShowModal(true);
            }
        };

        document.addEventListener('selectPackage', handleSelectPackage);
        return () => document.removeEventListener('selectPackage', handleSelectPackage);
    }, []);

    const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 13) val = val.slice(0, 13);
        let formatted = val;
        if (val.length > 5 && val.length <= 12) {
            formatted = val.slice(0, 5) + '-' + val.slice(5);
        } else if (val.length > 12) {
            formatted = val.slice(0, 5) + '-' + val.slice(5, 12) + '-' + val.slice(12);
        }
        setCnic(formatted);
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSize(val);
        if (val === 'contact') {
            setShowModal(true);
        }
    };

    const getAmountLabel = () => {
        if (!pkg || !size || !hours || !plan) {
            return { text: 'Select package, size, hours & plan above', ready: false };
        }
        if (size === 'contact') {
            return { text: 'Systems 30 kW & above are priced individually — our team will contact you with a custom quote.', ready: false };
        }
        
        const base = parseFloat(pkg);
        const sizeMult = parseFloat(size);
        const hoursMult = parseFloat(hours);
        const discount = parseFloat(plan);
        const monthly = Math.round((base * sizeMult * hoursMult * (1 - discount)) / 10) * 10;
        
        let periodLabel = 'per month';
        let payableNow = monthly;
        if (discount === 0.1) { periodLabel = 'per quarter (billed every 3 months)'; payableNow = monthly * 3; }
        else if (discount === 0.2) { periodLabel = 'per half-year (billed every 6 months)'; payableNow = monthly * 6; }
        else if (discount === 0.4) { periodLabel = 'per year (billed annually)'; payableNow = monthly * 12; }
        
        return { 
            text: `PKR ${payableNow.toLocaleString('en-US')} ${periodLabel} — approx. PKR ${monthly.toLocaleString('en-US')}/mo equivalent`, 
            ready: true,
            payableNow
        };
    };

    const amountData = getAmountLabel();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const formData = new FormData(e.currentTarget);
        if (amountData.ready) {
             formData.append('amountPayable', amountData.text);
        }
        
        const result = await submitMonitoringRequest(formData);
        
        if (result.success) {
            setIsSubmitted(true);
            setShowModal(false);
        } else {
            setError(result.error || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    const submitLargeSystem = () => {
        const form = document.getElementById('monitoringForm') as HTMLFormElement;
        if (form) {
             if (form.reportValidity()) {
                 form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
             }
        }
    };

    return (
        <section className="text-center py-[96px]" id="request-form">
            <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative">
                <div className="max-w-[600px] mx-auto mb-8 text-center">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center justify-center gap-2.5 mb-[18px]">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        Request Monitoring
                    </p>
                    <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.3rem)] text-ink mb-2 tracking-[-0.01em]">
                        Keep your system performing at its best.
                    </h2>
                    <p className="text-slate-custom mt-2">
                        Fill in your details and we'll follow up to confirm your package and schedule setup.
                    </p>
                </div>

                <form id="monitoringForm" className="bg-white border border-line rounded-[6px] p-[28px_22px] md:p-[44px] max-w-[720px] mx-auto text-left" onSubmit={handleSubmit}>
                    {!isSubmitted ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                                <div className="md:col-span-2">
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Customer Name</label>
                                    <input type="text" name="customerName" required className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Address</label>
                                    <textarea name="address" required className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber resize-y min-h-[70px]"></textarea>
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Contact No.</label>
                                    <input type="tel" name="contactNo" required className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" />
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Email Address</label>
                                    <input type="email" name="email" required pattern="[^@\s]+@[^@\s]+\.[^@\s]+" title="Please enter a valid email address" className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" />
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">CNIC Number</label>
                                    <input type="text" name="cnic" placeholder="XXXXX-XXXXXXX-X" value={cnic} onChange={handleCnicChange} pattern="^\d{5}-\d{7}-\d{1}$" title="Format: XXXXX-XXXXXXX-X" required className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" />
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Customer Type</label>
                                    <select name="customerType" required className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber">
                                        <option value="">Select...</option>
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Industrial">Industrial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">System Size</label>
                                    <select name="systemSize" required value={size} onChange={handleSizeChange} className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber">
                                        <option value="">Select...</option>
                                        <option value="1">1 – 10 kW</option>
                                        <option value="1.25">10 – 20 kW</option>
                                        <option value="1.5">20 – 30 kW</option>
                                        <option value="contact">30 kW & Above (Contact Us)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Package</label>
                                    <select name="package" required value={pkg} onChange={(e) => setPkg(e.target.value)} className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber">
                                        <option value="">Select...</option>
                                        <option value="1000">Basic (Annual Checkup)</option>
                                        <option value="1800">Moderate (Bi-Annual Checkup)</option>
                                        <option value="3000">Comprehensive (Quarterly Checkup)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Monitoring Hrs</label>
                                    <select name="monitoringHours" required value={hours} onChange={(e) => setHours(e.target.value)} className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber">
                                        <option value="">Select...</option>
                                        <option value="1">12 Hours</option>
                                        <option value="2">24 Hours</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">Advance Payment Plan</label>
                                    <select name="paymentPlan" required value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber">
                                        <option value="">Select...</option>
                                        <option value="0">Monthly</option>
                                        <option value="0.1">Quarterly Advance (10% off)</option>
                                        <option value="0.2">Bi-Annual Advance (20% off)</option>
                                        <option value="0.4">Annual Advance (40% off)</option>
                                    </select>
                                </div>
                            </div>

                            <div className={`mt-7 p-[20px_22px] rounded-[4px] bg-paper border border-line flex flex-col gap-1.5 ${amountData.ready ? 'bg-[rgba(47,110,98,0.06)] border-teal' : ''}`}>
                                <span className="font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-slate-custom">Estimated Amount Payable</span>
                                <span className={`font-space-grotesk font-bold text-[1.15rem] ${amountData.ready ? 'text-teal' : 'text-ink'}`}>
                                    {amountData.text}
                                </span>
                            </div>
                            
                            {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}

                            <button type="submit" disabled={isSubmitting} className="mt-7 w-full p-[15px] rounded-[3px] font-semibold text-[0.95rem] bg-amber text-ink hover:bg-[#f2b458] transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <p className="text-[0.8rem] text-slate-custom mt-3.5 text-center">
                                We'll contact you to confirm details before setup begins.
                            </p>
                        </>
                    ) : (
                        <div className="text-center p-5 py-8">
                            <h3 className="text-teal font-space-grotesk font-semibold text-[1.2rem] mb-2 tracking-[-0.01em]">Request received</h3>
                            <p className="text-slate-custom text-[0.92rem]">Thanks — our team will reach out shortly to confirm your monitoring package.</p>
                        </div>
                    )}
                </form>
            </div>

            {/* Custom Quote Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-[rgba(18,33,58,0.55)] flex items-center justify-center p-5">
                    <div className="bg-white rounded-[6px] p-8 max-w-[400px] w-full border-t-[3px] border-t-amber text-left">
                        <h3 className="text-ink font-space-grotesk font-semibold text-[1.15rem] mb-3 tracking-[-0.01em]">Custom Quote Needed</h3>
                        <p className="text-slate-custom text-[0.92rem] mb-6">
                            Systems 30 kW and above are priced individually based on site requirements. Our team will contact you directly to prepare a custom quote — no need to select a package below.
                        </p>
                        <button type="button" onClick={submitLargeSystem} className="bg-ink text-white p-[11px_22px] rounded-[3px] font-semibold text-[0.88rem] hover:bg-ink/90 transition-colors">
                            Submit Request
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
