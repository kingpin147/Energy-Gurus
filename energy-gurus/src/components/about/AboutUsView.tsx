import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Award, Eye, CheckCircle2 } from "lucide-react";
import { AdBanner } from "@/components/shared/AdBanner";

export function AboutUsView() {
    return (
        <div className="font-sans text-graphite bg-paper leading-relaxed selection:bg-amber/20 overflow-x-hidden min-h-screen">
            <AdBanner placement="skyscraper_left" targetPage="home" />
            <AdBanner placement="skyscraper_right" targetPage="home" />

            {/* ---- HERO HEADER ---- */}
            <header className="bg-ink text-white pt-20 pb-14 text-center relative overflow-hidden">
                <div 
                    className="absolute inset-0 pointer-events-none z-0" 
                    style={{ background: 'radial-gradient(ellipse 800px 460px at 50% 0%, rgba(232,163,61,0.14), transparent 60%)' }}
                />
                <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-10">
                    <div className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center justify-center gap-2.5 mb-4">
                        <span className="w-5 h-[1px] bg-amber"></span>
                        About Us
                    </div>
                    <h1 className="font-space-grotesk font-semibold text-[clamp(2.1rem,4.5vw,3rem)] text-white max-w-[760px] mx-auto leading-tight">
                        Building trust into every solar &amp; storage decision.
                    </h1>
                    <p className="text-paper/70 max-w-[560px] mx-auto mt-4 text.1.05rem]">
                        EnergyGurus.Online exists so customers never have to guess how and when to go for Solar &amp; Storage — with reliable brands, workmanship, and after-sales services.
                    </p>
                </div>
            </header>

            {/* Top Ad Banner */}
            <div className="max-w-[1180px] mx-auto my-7 px-8">
                <AdBanner placement="leaderboard_top" targetPage="home" />
            </div>

            {/* ---- MISSION & VISION ---- */}
            <section className="py-16">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-line rounded-[6px] p-9">
                            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-3">
                                <span className="w-5 h-[1px] bg-amber"></span>
                                Our Mission
                            </p>
                            <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink mb-4">
                                Confidence, Not Guesswork.
                            </h2>
                            <p className="text-slate-custom text-[1rem]">
                                Our mission is to make solar &amp; storage adoption simple, transparent, and reliable—connecting customers with verified brands, certified installers, trusted information, quality checks, monitoring, and dependable O&amp;M, so every investment is made with confidence.
                            </p>
                        </div>
                        <div className="bg-white border border-line rounded-[6px] p-9">
                            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-teal flex items-center gap-2.5 mb-3">
                                <span className="w-5 h-[1px] bg-teal"></span>
                                Our Vision
                            </p>
                            <h2 className="font-space-grotesk font-semibold text-[1.4rem] text-ink mb-4">
                                Authenticity, end to end.
                            </h2>
                            <p className="text-slate-custom text-[1rem]">
                                To ensure that every step of the journey — from sourcing to installation to monitoring and operations &amp; maintenance — is backed by authentic data, verified sources, and dependable workmanship.
                            </p>
                        </div>
                    </div>

                    {/* ---- PILLARS ---- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-line border border-line rounded-[6px] overflow-hidden mt-12">
                        <div className="bg-paper p-8">
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-2.5">Awareness</h3>
                            <p className="text-slate-custom text-[0.92rem]">Our podcast brings authentic insights from energy experts, straight from the source.</p>
                        </div>
                        <div className="bg-paper p-8">
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-2.5">Authenticity</h3>
                            <p className="text-slate-custom text-[0.92rem]">Every brand and installer listed is verified, not just paid-for placement.</p>
                        </div>
                        <div className="bg-paper p-8">
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-2.5">Transparency</h3>
                            <p className="text-slate-custom text-[0.92rem]">Real pricing, real specs, real reviews — no hidden markups.</p>
                        </div>
                        <div className="bg-paper p-8">
                            <h3 className="font-space-grotesk font-semibold text-[1.05rem] text-ink mb-2.5">Accountability</h3>
                            <p className="text-slate-custom text-[0.92rem]">Monitoring and O&amp;M that outlasts the sale.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- CEO SECTION ---- */}
            <section className="bg-white border-y border-line py-16">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
                        <div>
                            <div className="w-[200px] h-[200px] md:w-full md:h-[280px] rounded-[8px] overflow-hidden relative">
                                <Image 
                                    src="/Aaffaq Ali Khan.jpeg" 
                                    alt="Aafaaq Ali Khan, Founder & CEO" 
                                    fill
                                    className="object-cover object-top"
                                />
                            </div>
                            <div className="font-space-grotesk font-semibold text-[1.3rem] text-ink mt-4">
                                <a href="https://www.linkedin.com/in/aafaaq/" target="_blank" rel="noopener noreferrer" className="hover:text-teal transition-colors">
                                    Aafaaq Ali Khan
                                </a>
                            </div>
                            <div className="text-[0.92rem] text-teal mt-0.5 font-medium">
                                Founder &amp; CEO, EnergyGurus.Online
                            </div>
                            <div className="text-[0.82rem] text-slate-custom mt-2.5 leading-relaxed">
                                20+ Years Experience in Telecom &amp; Solar Industry, Sales, Marketing and Customer Care
                            </div>
                        </div>
                        <div>
                            <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-4">
                                <span className="w-5 h-[1px] bg-amber"></span>
                                A Note From Our CEO
                            </p>
                            <div className="text-slate-custom text-[0.98rem] space-y-4">
                                <p>
                                    Having spent over two decades in this Telecom &amp; Solar industry and represented Pakistan's Solar Industry as Vice Chairman of the Pakistan Solar Association, I've seen firsthand where trust tends to break down — in product quality, in workmanship, in after-sales support, and in the ongoing monitoring and maintenance a solar system needs long after it's installed. What's been missing is authenticity, backed by an independent verification mechanism.
                                </p>
                                <p>
                                    EnergyGurus.Online is built to close these gaps. Every installer on this platform is vetted. Every brand listing is backed by real specs, not marketing copy. And our Monitoring &amp; O&amp;M team stays accountable long after your system is switched on — because a good install means nothing if nobody's watching six months later.
                                </p>
                                <p>
                                    We're still early. But everything we build here is measured against one question: would I trust this enough to recommend it to my own family? If the answer isn't yes, we don't ship it.
                                </p>
                                <p className="font-space-grotesk font-semibold text-ink text-[1.05rem] pt-2">
                                    — Aafaaq Ali Khan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- FINAL CTA ---- */}
            <section className="py-20 text-center">
                <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                    <h2 className="font-space-grotesk font-semibold text-[clamp(1.6rem,3vw,2.2rem)] text-ink mb-6">
                        Ready to protect your solar investment?
                    </h2>
                    <div className="flex flex-wrap gap-3.5 justify-center">
                        <Link href="/monitoring#request-form" className="bg-amber text-ink px-6 py-3.5 rounded-[3px] font-semibold text-[0.95rem] hover:bg-[#f2b458] transition-colors">
                            Get a Monitoring &amp; O&amp;M Quote
                        </Link>
                    </div>
                </div>
            </section>

            {/* Bottom Ad Banner */}
            <div className="max-w-[1180px] mx-auto my-7 px-8">
                <AdBanner placement="leaderboard_bottom" targetPage="home" />
            </div>
        </div>
    );
}
