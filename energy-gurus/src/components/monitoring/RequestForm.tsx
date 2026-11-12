'use client';

import React, { useState } from 'react';
import { submitMonitoringRequest } from '@/app/(public)/monitoring/actions';

export default function RequestForm() {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const formData = new FormData(e.currentTarget);
        
        const result = await submitMonitoringRequest(formData);
        
        if (result.success) {
            setIsSubmitted(true);
        } else {
            setError(result.error || 'Something went wrong. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <section className="text-center py-[96px]" id="request-form">
            <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative">
                <div className="max-w-[600px] mx-auto mb-8 text-center">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center justify-center gap-2.5 mb-[18px]">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        Request to Contact
                    </p>
                    <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.3rem)] text-ink mb-2 tracking-[-0.01em]">
                        Keep your system performing at its best.
                    </h2>
                    <p className="text-slate-custom mt-2">
                        Fill in your details and we'll follow up to confirm further details.
                    </p>
                </div>

                <form id="monitoringForm" className="bg-white border border-line rounded-[6px] p-[28px_22px] md:p-[44px] max-w-[720px] mx-auto text-left shadow-xs" onSubmit={handleSubmit}>
                    {!isSubmitted ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        Name <span className="text-amber">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="customerName" 
                                        required 
                                        placeholder="Full Name" 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" 
                                    />
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        Designation
                                    </label>
                                    <input 
                                        type="text" 
                                        name="designation" 
                                        placeholder="e.g. Director, Manager, Homeowner" 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" 
                                    />
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        Company
                                    </label>
                                    <input 
                                        type="text" 
                                        name="company" 
                                        placeholder="Company / Organization Name" 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" 
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        City <span className="text-amber">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="city" 
                                        required 
                                        placeholder="e.g. Lahore, Karachi, Islamabad" 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" 
                                    />
                                </div>

                                {/* Contact No */}
                                <div>
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        Contact No. <span className="text-amber">*</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="contactNo" 
                                        required 
                                        placeholder="03XX XXXXXXX" 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" 
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="md:col-span-2">
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        Email Address <span className="text-amber">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required 
                                        placeholder="name@example.com" 
                                        pattern="[^@\s]+@[^@\s]+\.[^@\s]+" 
                                        title="Please enter a valid email address" 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber" 
                                    />
                                </div>

                                {/* Remarks */}
                                <div className="md:col-span-2">
                                    <label className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                                        Remarks
                                    </label>
                                    <textarea 
                                        name="remarks" 
                                        placeholder="Any specific system size, inverter model, or query..." 
                                        className="w-full p-[12px_14px] border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-paper outline-none focus-visible:ring-2 focus-visible:ring-amber resize-y min-h-[90px]"
                                    ></textarea>
                                </div>
                            </div>

                            {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="mt-7 w-full p-[15px] rounded-[3px] font-semibold text-[0.95rem] bg-amber text-ink hover:bg-[#f2b458] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <p className="text-[0.8rem] text-slate-custom mt-3.5 text-center">
                                We'll contact you to confirm details before setup begins.
                            </p>
                        </>
                    ) : (
                        <div className="text-center p-5 py-8">
                            <h3 className="text-teal font-space-grotesk font-semibold text-[1.2rem] mb-2 tracking-[-0.01em]">
                                Request received
                            </h3>
                            <p className="text-slate-custom text-[0.92rem]">
                                Thanks — our team will reach out shortly to confirm further details.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}
