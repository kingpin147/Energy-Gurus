import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart3,
    Bell,
    LayoutDashboard,
    Code2,
    PieChart,
    ShieldCheck,
    Activity,
    Smartphone,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { Link } from "@/i18n/routing";

export default function MonitoringOverviewPage() {
    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
            
            <header className="bg-ink text-white pt-[88px] pb-[60px] relative overflow-hidden">
                <div 
                    className="absolute inset-0 pointer-events-none z-0" 
                    style={{ background: 'radial-gradient(ellipse 800px 460px at 85% 0%, rgba(232,163,61,0.14), transparent 60%)' }}
                />
                <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-10 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
                    <div>
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[18px]">
                            <span className="w-5 h-[1px] bg-amber"></span>
                            Monitoring & O&M
                        </p>
                        <h1 className="font-space-grotesk font-semibold text-[clamp(2rem,4vw,2.9rem)] tracking-[-0.01em]">
                            Solar doesn't stop at installation.
                        </h1>
                        <p className="text-paper/72 max-w-[480px] mt-[18px] mb-[30px] text-[1.05rem]">
                            Protect your investment long after the panels go up — with real-time performance monitoring, proactive maintenance, and fast fault detection.
                        </p>
                        <button className="bg-amber text-ink px-[26px] py-[15px] rounded-[3px] font-semibold text-[0.95rem] hover:bg-[#f2b458] transition-colors">
                            Request Monitoring Setup
                        </button>
                    </div>
                    <div className="border border-paper/15 rounded-[4px] p-[26px] bg-paper/5">
                        <div className="font-ibm-plex-mono text-[0.72rem] tracking-[0.08em] uppercase text-paper/50 mb-[14px]">
                            Live System Status
                        </div>
                        <div className="flex justify-between items-center py-[13px] border-b border-paper/10 font-ibm-plex-mono text-[0.85rem]">
                            <span>System Output</span><span>4.82 kW</span>
                        </div>
                        <div className="flex justify-between items-center py-[13px] border-b border-paper/10 font-ibm-plex-mono text-[0.85rem]">
                            <span>Panel Health</span><span className="text-teal bg-[rgba(47,110,98,0.18)] px-2.5 py-[3px] rounded-[20px] text-[0.72rem]">Nominal</span>
                        </div>
                        <div className="flex justify-between items-center py-[13px] border-b border-paper/10 font-ibm-plex-mono text-[0.85rem]">
                            <span>Last Fault Check</span><span>2 min ago</span>
                        </div>
                        <div className="flex justify-between items-center py-[13px] font-ibm-plex-mono text-[0.85rem]">
                            <span>Uptime (30d)</span><span>99.8%</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-[80px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
                    <div>
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-[18px]">
                            <span className="w-5 h-[1px] bg-teal"></span>
                            Why It Matters
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.5rem,3vw,2.1rem)] text-ink mb-4 tracking-[-0.01em]">
                            Every system degrades without oversight.
                        </h2>
                        <p className="text-slate-custom text-[1.02rem]">
                            Panels lose efficiency, inverters fail silently, and small faults compound into major repairs when nobody's watching. Monitoring is what turns a one-time install into decades of reliable output.
                        </p>
                    </div>
                    <div className="bg-white border border-line rounded-[4px] p-6">
                        <svg viewBox="0 0 400 160" className="w-full h-auto block">
                            <line x1="0" y1="140" x2="400" y2="140" stroke="#12213A" strokeOpacity="0.12" />
                            <path d="M0,20 C80,30 120,35 180,50 C260,68 320,90 400,130" fill="none" stroke="#4A5A73" strokeWidth="2" strokeDasharray="5 5" />
                            <path d="M0,20 C80,24 140,28 200,32 C280,38 340,42 400,46" fill="none" stroke="#E8A33D" strokeWidth="2.5" />
                            <text x="0" y="12" fontFamily="IBM Plex Mono" fontSize="10" fill="#4A5A73">Output Over Time</text>
                            <text x="300" y="140" fontFamily="IBM Plex Mono" fontSize="9" fill="#4A5A73">Unmonitored</text>
                            <text x="300" y="42" fontFamily="IBM Plex Mono" fontSize="9" fill="#E8A33D">Monitored</text>
                        </svg>
                    </div>
                </div>
            </section>

            <section className="py-[80px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="max-w-[640px] mb-12">
                        <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-[18px]">
                            <span className="w-5 h-[1px] bg-teal"></span>
                            What's Included
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.5rem,3vw,2.1rem)] text-ink tracking-[-0.01em]">
                            Three layers of protection for your system.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-line border border-line rounded-[4px] overflow-hidden">
                        <div className="bg-paper p-8 px-7">
                            <div className="w-[38px] h-[38px] rounded-[6px] bg-ink text-amber flex items-center justify-center font-ibm-plex-mono font-semibold mb-4.5">01</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.1rem] text-ink mb-2 tracking-[-0.01em]">Real-Time Monitoring</h3>
                            <p className="text-slate-custom text-[0.93rem]">Track output, panel health, and system performance from anywhere, with alerts the moment something looks off.</p>
                        </div>
                        <div className="bg-paper p-8 px-7">
                            <div className="w-[38px] h-[38px] rounded-[6px] bg-ink text-amber flex items-center justify-center font-ibm-plex-mono font-semibold mb-4.5">02</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.1rem] text-ink mb-2 tracking-[-0.01em]">Proactive Maintenance</h3>
                            <p className="text-slate-custom text-[0.93rem]">Scheduled inspections and cleaning keep your system performing at peak efficiency year-round.</p>
                        </div>
                        <div className="bg-paper p-8 px-7">
                            <div className="w-[38px] h-[38px] rounded-[6px] bg-ink text-amber flex items-center justify-center font-ibm-plex-mono font-semibold mb-4.5">03</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.1rem] text-ink mb-2 tracking-[-0.01em]">Fast Fault Detection</h3>
                            <p className="text-slate-custom text-[0.93rem]">Automated diagnostics catch issues early — before they cost you performance or money.</p>
                        </div>
                    </div>
                </div>
            </section>

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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white border border-line rounded-[6px] p-8">
                            <h3 className="font-space-grotesk font-semibold text-[1.2rem] text-ink mb-3.5 tracking-[-0.01em]">Essential</h3>
                            <ul className="my-4.5 mb-6.5 list-none">
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line first:border-t-0">Remote monitoring</li>
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line">Annual inspection</li>
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line">Email fault alerts</li>
                            </ul>
                            <button className="w-full py-[13px] rounded-[3px] font-semibold text-[0.9rem] bg-paper border border-line text-ink hover:bg-line transition-colors">
                                Select Essential
                            </button>
                        </div>
                        <div className="bg-white border border-amber rounded-[6px] p-8 shadow-[0_0_0_1px_var(--color-amber)] relative">
                            <span className="absolute -top-3 left-[26px] bg-amber text-ink font-ibm-plex-mono text-[0.68rem] tracking-[0.06em] uppercase px-2.5 py-1 rounded-[20px] font-semibold">
                                Most Popular
                            </span>
                            <h3 className="font-space-grotesk font-semibold text-[1.2rem] text-ink mb-3.5 tracking-[-0.01em]">Plus</h3>
                            <ul className="my-4.5 mb-6.5 list-none">
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line first:border-t-0">Everything in Essential</li>
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line">Biannual maintenance</li>
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line">Priority fault response</li>
                            </ul>
                            <button className="w-full py-[13px] rounded-[3px] font-semibold text-[0.9rem] bg-ink border border-ink text-white hover:bg-ink/90 transition-colors">
                                Select Plus
                            </button>
                        </div>
                        <div className="bg-white border border-line rounded-[6px] p-8">
                            <h3 className="font-space-grotesk font-semibold text-[1.2rem] text-ink mb-3.5 tracking-[-0.01em]">Pro</h3>
                            <ul className="my-4.5 mb-6.5 list-none">
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line first:border-t-0">Everything in Plus</li>
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line">Guaranteed uptime SLA</li>
                                <li className="text-[0.9rem] text-slate-custom py-2 border-t border-line">Dedicated account contact</li>
                            </ul>
                            <button className="w-full py-[13px] rounded-[3px] font-semibold text-[0.9rem] bg-paper border border-line text-ink hover:bg-line transition-colors">
                                Select Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-ink text-white py-0">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] border-l border-r border-paper/15 border-transparent sm:border-paper/15">
                        <div className="p-9 px-7 border-b sm:border-b-0 sm:border-r border-paper/15">
                            <div className="font-ibm-plex-mono text-[2rem] text-amber">99.8%</div>
                            <div className="text-[0.82rem] text-paper/60 uppercase tracking-[0.06em] mt-1.5">Uptime Guarantee</div>
                        </div>
                        <div className="p-9 px-7 border-b sm:border-b-0 sm:border-r border-paper/15">
                            <div className="font-ibm-plex-mono text-[2rem] text-amber">&lt;2 hrs</div>
                            <div className="text-[0.82rem] text-paper/60 uppercase tracking-[0.06em] mt-1.5">Avg. Fault Response Time</div>
                        </div>
                        <div className="p-9 px-7 border-b sm:border-b-0 border-paper/15">
                            <div className="font-ibm-plex-mono text-[2rem] text-amber">3,400+</div>
                            <div className="text-[0.82rem] text-paper/60 uppercase tracking-[0.06em] mt-1.5">Systems Monitored</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="text-center py-[96px]">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.3rem)] text-ink mb-6 tracking-[-0.01em]">
                        Keep your system performing at its best.
                    </h2>
                    <button className="bg-amber text-ink px-[26px] py-[15px] rounded-[3px] font-semibold text-[0.95rem] hover:bg-[#f2b458] transition-colors">
                        Request Monitoring Setup
                    </button>
                </div>
            </section>

        </div>
    );
}
