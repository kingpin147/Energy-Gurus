import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Handshake, Newspaper, ArrowRight, ShieldCheck, Mail, Globe, MapPin, Zap, Award, Target, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ }> }): Promise<Metadata> {
  
  const baseUrl = "https://www.energygurus.online";
  const title = "About EnergyGurus | Pakistan's Independent Energy Platform";
  const description = "Learn about EnergyGurus' mission to bring transparency, engineering standards, verified installer directories, and data analytics to Pakistan's solar industry.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/about`,
      
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/about`,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner_2.jpg`, width: 1200, height: 630, alt: "About EnergyGurus" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner_2.jpg`]
    }
    };
}

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-amber/20 text-ink">
            {/* ─── HERO SECTION ─── */}
            <section className="relative w-full py-24 lg:py-48 flex items-center justify-center overflow-hidden border-b border-slate-100">
                {/* Premium Abstract Network Asset */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/new_hero_banner_2.jpg"
                        alt="Network Background"
                        fill
                        priority
                        className="object-cover opacity-100 transition-opacity duration-1000 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60"></div>
                </div>

                <div className="container mx-auto px-6 text-center max-w-5xl relative z-10 animate-reveal">
                    <div className="inline-flex items-center gap-3 bg-amber/80 text-ink backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-soft-float shadow-sm">
                        <Award className="w-4 h-4" /> Engineering Excellence
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black mb-8 text-white drop-shadow-lg tracking-tighter leading-[1] uppercase md:px-0 px-4">
                        Independent Energy <span className="text-amber drop-shadow-md">Insights</span> for Pakistan
                    </h1>
                    <p className="text-lg md:text-2xl text-white drop-shadow-md font-medium leading-relaxed mb-12 opacity-90 max-w-3xl mx-auto">
                        EnergyGurus is a professional platform dedicated to delivering data-driven analysis, expert commentary, and engineering standards across Pakistan&apos;s energy sector.
                    </p>
                    <div className="flex flex-wrap justify-center gap-5">
                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 shadow-lg border border-white/60">
                            <ShieldCheck className="w-5 h-5 text-amber" /> Professional Integrity
                        </div>
                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 shadow-lg border border-white/60">
                            <Globe className="w-5 h-5 text-amber" /> Locally Optimized
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── MISSION SECTION ─── */}
            <section className="py-24 md:py-40 bg-white relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
                        <div className="space-y-10 animate-reveal">
                            <div className="space-y-4">
                                <span className="text-amber font-black uppercase tracking-[0.3em] text-[10px]">Technical Vision</span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">Our Mission</h2>
                            </div>
                            <div className="space-y-6">
                                <p className="text-xl text-slate-500 font-medium leading-relaxed opacity-90">
                                    We believe that an informed energy transition is the key to Pakistan&apos;s economic stability. By bridging the gap between complex engineering data and policy-level decision making, we empower stakeholders at every level to make smarter energy choices.
                                </p>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed opacity-90">
                                    Whether through our technical podcasts, physical energy audits, or real-time monitoring platforms, our goal remains consistent: <span className="text-slate-900 font-black tracking-tight uppercase underline decoration-primary decoration-4 underline-offset-8">Clarity, Action, and Impact.</span>
                                </p>
                            </div>
                            <Button className="bg-slate-900 text-white h-16 px-12 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all border-none">
                                Review Standards <ArrowRight className="ml-3 w-5 h-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 md:gap-10">
                            <StatCard value="500+" label="Audits Verified" icon={<ShieldCheck className="w-6 h-6" />} color="primary" />
                            <StatCard value="20MW+" label="Load Monitored" icon={<Zap className="w-6 h-6" />} color="accent" />
                            <StatCard value="50+" label="Board Experts" icon={<Users className="w-6 h-6" />} color="accent" />
                            <StatCard value="100+" label="Deep Dives" icon={<TrendingUp className="w-6 h-6" />} color="primary" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── LEADERSHIP SECTION ─── */}
            <section className="py-24 md:py-40 bg-slate-50/50 border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center space-y-4 mb-20 md:mb-32">
                        <span className="text-amber font-black uppercase tracking-[0.3em] text-[10px]">The Engineering Board</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">Leadership Team</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                        <TeamMember name="Engr. M. Nouman" role="Technical Director" bio="Expert in distributed generation and grid integration with over 15 years of industrial experience." />
                        <TeamMember name="Dr. Ayesha Malik" role="Policy Lead" bio="Ph.D. in Energy Economics, advising regulators on net-metering and tariff structures." />
                        <TeamMember name="Sarmad Khan" role="Operations Manager" bio="Specialist in O&M logistics and field engineering for large-scale industrial portfolios." />
                    </div>
                </div>
            </section>

            {/* ─── PARTNERS SECTION ─── */}
            <section className="py-24 md:py-40 bg-white">
                <div className="container mx-auto px-6 max-w-7xl text-center">
                    <div className="space-y-4 mb-20 md:mb-32">
                        <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Global Synergy</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Partners & Sponsors</h2>
                        <p className="text-slate-500 font-medium text-lg lg:max-w-xl mx-auto">Collaborating with global leaders in energy technology and policy to ensure technical excellence.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center opacity-40 grayscale group hover:opacity-100 transition-all duration-700">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="glass h-20 px-6 rounded-[2rem] border border-white/60 flex items-center justify-center font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-amber hover:border-amber/30 hover:scale-110 transition-all duration-300 shadow-sm cursor-default">
                                Node {i}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function StatCard({ value, label, icon, color }: { value: string, label: string, icon: any, color: 'primary' | 'accent' }) {
    return (
        <div className="glass aspect-square flex flex-col items-center justify-center p-8 text-center gap-6 rounded-[2.5rem] border border-white/60 shadow-xl group hover:-translate-y-2 transition-all duration-500">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm border ${color === 'primary' ? 'bg-amber/10 text-ink border-amber/20 text-amber' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
            </div>
        </div>
    );
}

function TeamMember({ name, role, bio }: { name: string, role: string, bio: string }) {
    return (
        <Card className="glass border border-white/60 shadow-2xl overflow-hidden group rounded-[3.5rem] hover:-translate-y-3 transition-all duration-500">
            <div className="aspect-[4/5] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <Image src="/logo.png" alt="EnergyGurus" width={120} height={120} className="opacity-10 group-hover:scale-125 transition-transform duration-1000 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
            </div>
            <CardContent className="p-10 md:p-14 relative bg-white/40 backdrop-blur-3xl">
                <h4 className="text-2xl font-black mb-2 text-slate-900 tracking-tight group-hover:text-amber transition-colors">{name}</h4>
                <p className="text-[10px] font-black text-amber uppercase tracking-[0.2em] mb-8">{role}</p>
                <p className="text-base text-slate-500 font-medium leading-relaxed opacity-80">{bio}</p>
            </CardContent>
        </Card>
    );
}
