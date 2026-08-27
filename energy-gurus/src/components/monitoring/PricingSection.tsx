'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function PricingSection() {
    const [size, setSize] = useState<string>('1');
    const [hours, setHours] = useState<number>(1);
    const [discount, setDiscount] = useState<number>(0);

    const calculatePrice = (base: number, exact: boolean = false) => {
        if (size === 'contact') return 'Contact Us';
        const sizeMultiplier = parseFloat(size);
        const value = Math.round((base * sizeMultiplier * hours * (1 - discount)) / 10) * 10;
        const formatted = value.toLocaleString('en-US');
        return `${exact ? '' : '~'}PKR ${formatted}/mo`;
    };

    const coverageText = hours === 1.2 ? '24/7' : '12-hour cycle';

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
                        Every tier includes remote monitoring, automated fault alerts, and 24-hour fault response — coverage scales with how often we're physically checking and optimizing your system.
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
                            <option value="1">1 – 10 kW (Base price)</option>
                            <option value="1.15">10 – 20 kW (+15%)</option>
                            <option value="1.3">20 – 30 kW (+30%)</option>
                            <option value="contact">30 kW & Above (Contact Us)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-ibm-plex-mono text-[0.78rem] tracking-[0.06em] uppercase text-slate-custom">Monitoring Hours</label>
                        <select 
                            className="border border-line rounded-[3px] py-[9px] px-[14px] font-sans text-[0.9rem] bg-white text-ink outline-none focus-visible:ring-2 focus-visible:ring-amber"
                            value={hours} 
                            onChange={(e) => setHours(parseFloat(e.target.value))}
                        >
                            <option value="1">12 Hours</option>
                            <option value="1.2">24 Hours</option>
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
                            <option value="0.1">Quarterly Advance (10% off)</option>
                            <option value="0.2">Bi-Annual Advance (20% off)</option>
                            <option value="0.4">Annual Advance (40% off)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border border-line rounded-[6px] bg-white">
                    <table className="w-full border-collapse min-w-[760px]">
                        <thead>
                            <tr>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-paper align-top font-semibold">Feature</th>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-paper align-top font-semibold">
                                    Basic <span className="block font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal mt-1 font-medium">Annual</span>
                                </th>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-paper align-top font-semibold">
                                    Moderate <span className="block font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal mt-1 font-medium">Bi-Annual</span>
                                </th>
                                <th className="p-[16px_18px] text-left border-b border-line font-space-grotesk text-[1rem] text-ink bg-[rgba(232,163,61,0.06)] align-top font-semibold border-t-2 border-t-amber">
                                    <span className="inline-block bg-amber text-ink font-ibm-plex-mono text-[0.62rem] tracking-[0.06em] uppercase px-2 py-[3px] rounded-[20px] mb-1.5 font-bold">Most Popular</span>
                                    <br />
                                    Comprehensive
                                    <span className="block font-ibm-plex-mono text-[0.7rem] tracking-[0.06em] uppercase text-teal mt-1 font-medium">Quarterly</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Price</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">{calculatePrice(1200, true)}</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">{calculatePrice(1600, true)}</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">{calculatePrice(2000, true)}</td>
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
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Monitoring coverage</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">{coverageText}</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">{coverageText}</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">{coverageText}</td>
                            </tr>
                            <tr>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] font-semibold text-ink whitespace-nowrap">Fault alerts</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">SMS</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom">SMS</td>
                                <td className="p-[16px_18px] text-left border-b border-line text-[0.88rem] text-slate-custom bg-[rgba(232,163,61,0.06)]">SMS</td>
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
                                    document.dispatchEvent(new CustomEvent('selectPackage', { detail: { pkg: '1200', size, hours: hours.toString(), plan: discount.toString() } }));
                                    document.getElementById('request-form')?.scrollIntoView({behavior: 'smooth'}) 
                                }} className="px-4 py-[9px] rounded-[3px] text-[0.82rem] bg-paper border border-line text-ink whitespace-nowrap font-semibold hover:bg-line transition-colors">Select Basic</button></td>
                                <td className="p-[16px_18px] text-left text-[0.88rem] border-none"><button onClick={() => { 
                                    document.dispatchEvent(new CustomEvent('selectPackage', { detail: { pkg: '1600', size, hours: hours.toString(), plan: discount.toString() } }));
                                    document.getElementById('request-form')?.scrollIntoView({behavior: 'smooth'}) 
                                }} className="px-4 py-[9px] rounded-[3px] text-[0.82rem] bg-paper border border-line text-ink whitespace-nowrap font-semibold hover:bg-line transition-colors">Select Moderate</button></td>
                                <td className="p-[16px_18px] text-left text-[0.88rem] border-none bg-[rgba(232,163,61,0.06)]"><button onClick={() => { 
                                    document.dispatchEvent(new CustomEvent('selectPackage', { detail: { pkg: '2000', size, hours: hours.toString(), plan: discount.toString() } }));
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
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0.4)}`} onClick={() => setDiscount(0.4)}>
                        <div className="font-ibm-plex-mono text-[2.1rem] text-teal">40%</div>
                        <div className="text-[0.88rem] text-ink font-semibold mt-2">Off — Pay Annually</div>
                        <div className="text-[0.78rem] text-slate-custom mt-1">Best savings, one payment/year</div>
                    </div>
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0.2)}`} onClick={() => setDiscount(0.2)}>
                        <div className={`font-ibm-plex-mono text-[2.1rem] ${getPrepayTextClass(0.2)}`}>20%</div>
                        <div className="text-[0.88rem] text-ink font-semibold mt-2">Off — Pay Bi-Annually</div>
                        <div className="text-[0.78rem] text-slate-custom mt-1">Two payments/year</div>
                    </div>
                    <div className={`bg-white border rounded-[6px] p-[24px_20px] text-center cursor-pointer transition-colors ${getPrepayClass(0.1)}`} onClick={() => setDiscount(0.1)}>
                        <div className={`font-ibm-plex-mono text-[2.1rem] ${getPrepayTextClass(0.1)}`}>10%</div>
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
                        Pricing Applies to 1–10 kW Systems — Larger Systems Scale Up
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem] first:border-none">
                        <span className="text-ink font-semibold">1 – 10 kW</span><span className="font-ibm-plex-mono text-teal">Base price</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">10 – 20 kW</span><span className="font-ibm-plex-mono text-teal">+15%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">20 – 30 kW</span><span className="font-ibm-plex-mono text-teal">+30%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-line text-[0.92rem]">
                        <span className="text-ink font-semibold">30 kW & Above</span><span className="font-ibm-plex-mono text-teal">Dealt separately — contact us</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
