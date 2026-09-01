'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function PricingSection() {
    const [size, setSize] = useState<string>('800');
    const [hours, setHours] = useState<number>(1);
    const [discount, setDiscount] = useState<number>(0);

    const calculatePrice = (tierMultiplier: number, exact: boolean = false) => {
        if (size === 'contact') return 'Contact Us';
        const sizeBasePrice = parseFloat(size);
        const value = Math.round((sizeBasePrice * tierMultiplier * hours * (1 - discount)) / 10) * 10;
        const formatted = value.toLocaleString('en-US');
        return `PKR ${formatted}/mo`;
    };

    const getPrepayClass = (val: number) => 
        discount === val 
            ? 'border-teal shadow-[0_0_0_1px_var(--color-teal)]' 
            : 'border-line';
            
    const getPrepayTextClass = (val: number) => 
        discount === val ? 'text-teal' : 'text-slate-custom';

    return (
        <section className="py-[80px]">
            <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                <div className="max-w-[640px] mb-12">
                    <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-[18px]">
                        <span className="w-5 h-[1px] bg-teal"></span>
                        Pricing
                    </p>
                    <h2 className="font-space-grotesk font-semibold text-[clamp(1.5rem,3vw,2.1rem)] text-ink tracking-[-0.01em]">
                        Choose your coverage level.
                    </h2>
                    <p className="text-slate-custom text-[1.02rem] mt-4">
                        Every tier includes remote monitoring, automated fault alerts, and a guaranteed fault response window — coverage scales with how often we're physically checking and optimizing your system.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 my-6 mb-8">
                    <div className="flex flex-col gap-1">
                        <label className="font-ibm-plex-mono text-[0.78rem] tracking-[0.06em] uppercase text-slate-custom">System Size</label>
                        <select 
                            className="border border-line rounded-[3px] py-[9px] px-[14px] font-sans text-[0.9rem] bg-white text-ink outline-none focus-visible:ring-2 focus-visible:ring-amber"
                            value={size} 
                            onChange={(e) => setSize(e.target.value)}
                        >
                            <option value="800">1 – 5 kW</option>
                            <option value="1200">6 – 10 kW</option>
                            <option value="1600">11 – 15 kW</option>
                            <option value="2000">16 – 20 kW</option>
                            <option value="2500">21 – 25 kW</option>
                            <option value="3000">26 – 30 kW</option>
                            <option value="contact">31 kW & Above (Contact Us)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-ibm-plex-mono text-[0.78rem] tracking-[0.06em] uppercase text-slate-custom">System Type</label>
                        <select 
                            className="border border-line rounded-[3px] py-[9px] px-[14px] font-sans text-[0.9rem] bg-white text-ink outline-none focus-visible:ring-2 focus-visible:ring-amber"
                            value={hours} 
                            onChange={(e) => setHours(parseFloat(e.target.value))}
                        >
                            <option value="1">Grid Tied</option>
                            <option value="1.2">Hybrid</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-ibm-plex-mono text-[0.78rem] tracking-[0.06em] uppercase text-slate-custom">Payment Plan</label>
                        <select 
                            className="border border-line rounded-[3px] py-[9px] px-[14px] font-sans text-[0.9rem] bg-white text-ink outline-none focus-visible:ring-2 focus-visible:ring-amber"
                            value={discount} 
                            onChange={(e) => setDiscount(parseFloat(e.target.value))}
                        >
                            <option value="0">Monthly</option>
                            <option value="0.07">Quarterly Advance (7% off)</option>
                            <option value="0.15">Bi-Annual Advance (15% off)</option>
                            <option value="0.3">Annual Advance (30% off)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border border-line rounded-[6px] bg-white">
                    <table className="w-full border-collapse min-w-[760px]">
                        <thead>
                            <tr>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-paper align-top font-semibold">Feature</th>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-paper align-top font-semibold">
                                    Basic
                                </th>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-paper align-top font-semibold">
                                    Moderate
                                </th>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-[rgba(232,163,61,0.06)] align-top font-semibold border-t-2 border-t-amber">
                                    <span className="inline-block bg-amber text-ink font-ibm-plex-mono text-[0.62rem] tracking-[0.06em] uppercase px-2 py-[3px] rounded-[20px] mb-1.5 font-bold">Most Popular</span>
                                    <br />
                                    Comprehensive
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Price</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">{calculatePrice(1, true)}</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">{calculatePrice(1.2, true)}</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">{calculatePrice(1.4, true)}</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Onboarding Charges</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">PKR 3,000</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">PKR 3,000</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">PKR 3,000</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Free Detailed On-Site Audits / Year</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">1</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">2</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">4</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Performance report</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">Monthly</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">Fortnightly</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">Weekly</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Fault response time</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">8 hours</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">6 hours</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">4 hours</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Visit to Troubleshoot/Repair/Replace Equipments</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">Billed separately</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">Billed separately</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">Billed separately</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Best for</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">Newer systems</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">Standard residential</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">Consistent performance assurance</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left text-[0.88rem] font-semibold text-ink whitespace-nowrap border-none"></td>
                                <td className="p-[16px_18px] text-left text-[0.88rem] border-none"><button onClick={() => { 
                                    document.dispatchEvent(new CustomEvent('selectPackage', { detail: { pkg: '1', size, hours: hours.toString(), plan: discount.toString() } }));
                                    document.getElementById('request-form')?.scrollIntoView({behavior: 'smooth'}) 
                                }} className="px-4 py-[9px] rounded-[3px] text-[0.82rem] bg-paper border border-line text-ink whitespace-nowrap font-semibold hover:bg-line transition-colors">Select Basic</button></td>
                                <td className="p-[16px_18px] text-left text-[0.88rem] border-none"><button onClick={() => { 
                                    document.dispatchEvent(new CustomEvent('selectPackage', { detail: { pkg: '1.2', size, hours: hours.toString(), plan: discount.toString() } }));
                                    document.getElementById('request-form')?.scrollIntoView({behavior: 'smooth'}) 
                                }} className="px-4 py-[9px] rounded-[3px] text-[0.82rem] bg-paper border border-line text-ink whitespace-nowrap font-semibold hover:bg-line transition-colors">Select Moderate</button></td>
                                <td className="p-[16px_18px] text-left text-[0.88rem] border-none bg-[rgba(232,163,61,0.06)]"><button onClick={() => { 
                                    document.dispatchEvent(new CustomEvent('selectPackage', { detail: { pkg: '1.4', size, hours: hours.toString(), plan: discount.toString() } }));
                                    document.getElementById('request-form')?.scrollIntoView({behavior: 'smooth'}) 
                                }} className="px-4 py-[9px] rounded-[3px] text-[0.82rem] bg-ink border border-ink text-white whitespace-nowrap font-semibold hover:bg-ink/90 transition-colors">Select Comprehensive</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <p className="text-slate-custom text-[0.9rem] mt-[18px] max-w-[640px]">
                    Onboarding Charges (PKR 3,000) are a one-time fee, billed at sign-up. Any visit to troubleshoot, repair, or replace equipment is billed separately from the monthly package on every tier.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0.3)}`} onClick={() => setDiscount(0.3)}>
                        <div className="font-ibm-plex-mono text-[2.1rem] text-teal">30%</div>
                        <div className="text-[0.88rem] text-ink font-semibold mt-2">Off — Pay Annually</div>
                        <div className="text-[0.78rem] text-slate-custom mt-1">Best savings, one payment/year</div>
                    </div>
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0.15)}`} onClick={() => setDiscount(0.15)}>
                        <div className={`font-ibm-plex-mono text-[2.1rem] ${getPrepayTextClass(0.15)}`}>15%</div>
                        <div className="text-[0.88rem] text-ink font-semibold mt-2">Off — Pay Bi-Annually</div>
                        <div className="text-[0.78rem] text-slate-custom mt-1">Two payments/year</div>
                    </div>
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0.07)}`} onClick={() => setDiscount(0.07)}>
                        <div className={`font-ibm-plex-mono text-[2.1rem] ${getPrepayTextClass(0.07)}`}>7%</div>
                        <div className="text-[0.88rem] text-ink font-semibold mt-2">Off — Pay Quarterly</div>
                        <div className="text-[0.78rem] text-slate-custom mt-1">Four payments/year</div>
                    </div>
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0)}`} onClick={() => setDiscount(0)}>
                        <div className={`font-ibm-plex-mono text-[2.1rem] ${getPrepayTextClass(0)}`}>0%</div>
                        <div className="text-[0.88rem] text-ink font-semibold mt-2">Monthly</div>
                        <div className="text-[0.78rem] text-slate-custom mt-1">Full listed price</div>
                    </div>
                </div>

                <div className="mt-10 bg-white border border-line rounded-[6px] p-[24px_28px]">
                    <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-4">
                        Standard Package Pricing by System Size
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem] first:border-none">
                        <span className="text-ink font-semibold">1 – 5 kW</span><span className="font-ibm-plex-mono text-teal">PKR 800/mo</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">6 – 10 kW</span><span className="font-ibm-plex-mono text-teal">PKR 1,200/mo</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">11 – 15 kW</span><span className="font-ibm-plex-mono text-teal">PKR 1,600/mo</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">16 – 20 kW</span><span className="font-ibm-plex-mono text-teal">PKR 2,000/mo</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">21 – 25 kW</span><span className="font-ibm-plex-mono text-teal">PKR 2,500/mo</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">26 – 30 kW</span><span className="font-ibm-plex-mono text-teal">PKR 3,000/mo</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">31 kW & Above</span><span className="font-ibm-plex-mono text-teal">Dealt separately — contact us</span>
                    </div>
                </div>

            </div>
        </section>
    );
}

