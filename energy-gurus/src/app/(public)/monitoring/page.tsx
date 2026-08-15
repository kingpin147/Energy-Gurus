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
import Link from "next/link";
import type { Metadata } from "next";
import PricingSection from "@/components/monitoring/PricingSection";
import RequestForm from "@/components/monitoring/RequestForm";

export async function generateMetadata({ params }: { params: Promise<{ }> }): Promise<Metadata> {
  
  const baseUrl = "https://www.energygurus.online";
  const title = "Real-Time Solar System Monitoring & Telemetry | EnergyGurus";
  const description = "Monitor live solar generation, battery storage, fault alerts, and grid export metrics with EnergyGurus solar telemetry platform.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/monitoring`,
      
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/monitoring`,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Solar Telemetry Monitoring" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`]
    }
  };
}



export default function MonitoringOverviewPage() {
    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
            
            {/* Skyscraper Ads */}
            <div className="hidden [@media(min-width:1560px)]:block fixed top-1/2 -translate-y-1/2 w-[120px] z-40 left-3">
                <div className="border border-dashed border-line rounded-[6px] bg-[rgba(18,33,58,0.02)] flex flex-col items-center justify-center text-center py-4 px-2.5 min-h-[400px] gap-2">
                    <span className="font-ibm-plex-mono text-[0.6rem] tracking-[0.08em] uppercase text-slate-custom/60 [writing-mode:vertical-rl]">Ad</span>
                    <span className="font-space-grotesk text-[0.8rem] text-slate-custom/75">160×600</span>
                </div>
            </div>
            <div className="hidden [@media(min-width:1560px)]:block fixed top-1/2 -translate-y-1/2 w-[120px] z-40 right-3">
                <div className="border border-dashed border-line rounded-[6px] bg-[rgba(18,33,58,0.02)] flex flex-col items-center justify-center text-center py-4 px-2.5 min-h-[400px] gap-2">
                    <span className="font-ibm-plex-mono text-[0.6rem] tracking-[0.08em] uppercase text-slate-custom/60 [writing-mode:vertical-rl]">Ad</span>
                    <span className="font-space-grotesk text-[0.8rem] text-slate-custom/75">160×600</span>
                </div>
            </div>
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
                        <a href="#request-form" className="inline-block bg-amber text-ink px-[26px] py-[15px] rounded-[3px] font-semibold text-[0.95rem] hover:bg-[#f2b458] transition-colors">
                            Request Monitoring Setup
                        </a>
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

            {/* Top Ad Banner */}
            <div className="max-w-[1180px] mx-auto my-7 px-8">
                <div className="border border-dashed border-line rounded-[6px] bg-[rgba(18,33,58,0.02)] flex flex-col items-center justify-center text-center py-7 px-5 min-h-[110px]">
                    <span className="font-ibm-plex-mono text-[0.66rem] tracking-[0.1em] uppercase text-slate-custom/60 mb-1.5">Advertisement</span>
                    <span className="font-space-grotesk text-[0.95rem] text-slate-custom/80">Your ad here — 728×90 leaderboard</span>
                </div>
            </div>

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
                            How It Works
                        </p>
                        <h2 className="font-space-grotesk font-semibold text-[clamp(1.5rem,3vw,2.1rem)] text-ink tracking-[-0.01em]">
                            From sign-up to a system that watches itself.
                        </h2>
                        <p className="text-slate-custom text-[1.02rem] mt-4">
                            Once you're onboarded, you never need to call us about a problem — we call you.
                        </p>
                    </div>

                    <div className="relative max-w-[720px] mx-auto before:content-[''] before:absolute before:left-[23px] before:top-[8px] before:bottom-[8px] before:w-[1px] before:bg-line">
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-paper border-[1.5px] border-teal text-teal flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">1</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Registration & payment</h3>
                            <p className="text-slate-custom text-[0.94rem]">Our sales representative fills out your customer registration form — contact details, CNIC, address, phone number, email, and the package you've selected — along with the payment slip you deposit at our official bank account.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-paper border-[1.5px] border-teal text-teal flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">2</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Site survey</h3>
                            <p className="text-slate-custom text-[0.94rem]">Our technical team visits your premises to document your complete system — panels, inverters, batteries, structure, breakers, cables, earthing, lightning arrestors, installation date, and overall system health.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-paper border-[1.5px] border-teal text-teal flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">3</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">CRM profile created</h3>
                            <p className="text-slate-custom text-[0.94rem]">Everything collected is entered into our database, creating your permanent customer profile.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-paper border-[1.5px] border-teal text-teal flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">4</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Customer ID created</h3>
                            <p className="text-slate-custom text-[0.94rem]">A unique customer ID is generated for your account.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-paper border-[1.5px] border-teal text-teal flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">5</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Inverter connection</h3>
                            <p className="text-slate-custom text-[0.94rem]">Your inverter is connected to our Network Operations Monitoring System using the credentials collected on-site.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-ink border-[1.5px] border-amber text-amber flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">6</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Live NOC monitoring</h3>
                            <p className="text-slate-custom text-[0.94rem]">That's it — your system is connected to our Network Operations Centre, which keeps an eye on it and dispatches the team the moment it spots a discrepancy.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-ink border-[1.5px] border-amber text-amber flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">7</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Proactive resolution</h3>
                            <p className="text-slate-custom text-[0.94rem]">Now you don't need to call anyone. We proactively manage it — routing the right resource for diagnosis and rectification.</p>
                        </div>
                        <div className="relative pl-[64px] mb-[34px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-ink border-[1.5px] border-amber text-amber flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">8</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Remote coordination</h3>
                            <p className="text-slate-custom text-[0.94rem]">For most issues, we coordinate directly with the manufacturer to sort it out remotely.</p>
                        </div>
                        <div className="relative pl-[64px]">
                            <div className="absolute left-0 top-0 w-[48px] h-[48px] rounded-full bg-ink border-[1.5px] border-amber text-amber flex items-center justify-center font-ibm-plex-mono font-semibold text-[0.95rem]">9</div>
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-1.5 tracking-[-0.01em]">Priority repair</h3>
                            <p className="text-slate-custom text-[0.94rem]">For major issues, equipment is sent to the manufacturer's repair centre and handled on a priority basis. You don't need to follow it up — our team keeps you updated on every step, and gets it reinstalled once the repair is complete.</p>
                        </div>
                    </div>

                    <div className="mt-8 p-[24px_26px] bg-ink rounded-[8px] flex gap-[18px] items-start max-w-[720px] mx-auto">
                        <div className="shrink-0 w-[40px] h-[40px] rounded-full bg-[rgba(232,163,61,0.15)] flex items-center justify-center text-amber text-[1.1rem]">✉</div>
                        <div>
                            <h4 className="text-white font-space-grotesk font-semibold text-[0.98rem] mb-1.5 tracking-[-0.01em]">Every step is tracked — nothing falls through the cracks.</h4>
                            <p className="text-[rgba(245,246,243,0.72)] text-[0.9rem]">Our complaint management system logs every activity through a ticketing system, from the moment an issue is raised to the moment it's resolved. If a ticket runs into delay, it automatically escalates to higher management — so resolution never stalls.</p>
                        </div>
                    </div>
                </div>
            </section>

            <PricingSection />

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

            <RequestForm />

            {/* Bottom Ad Banner */}
            <div className="max-w-[1180px] mx-auto my-7 px-8">
                <div className="border border-dashed border-line rounded-[6px] bg-[rgba(18,33,58,0.02)] flex flex-col items-center justify-center text-center py-7 px-5 min-h-[110px]">
                    <span className="font-ibm-plex-mono text-[0.66rem] tracking-[0.1em] uppercase text-slate-custom/60 mb-1.5">Advertisement</span>
                    <span className="font-space-grotesk text-[0.95rem] text-slate-custom/80">Your ad here — 728×90 leaderboard</span>
                </div>
            </div>

        </div>
    );
}
