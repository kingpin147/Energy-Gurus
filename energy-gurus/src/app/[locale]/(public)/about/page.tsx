import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Handshake, Newspaper, ArrowRight, ShieldCheck, Mail, Globe, MapPin } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20 lg:py-32">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Independent Energy Insights for Pakistan</h1>
                    <p className="text-xl opacity-90 leading-relaxed mb-8">
                        EnergyGurus is a professional platform dedicated to delivering data-driven analysis, expert commentary, and engineering excellence across Pakistan's energy sector.
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
                            <ShieldCheck className="w-4 h-4 text-accent" /> Professional Integrity
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
                            <Globe className="w-4 h-4 text-accent" /> Locally Optimized
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Our Mission</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We believe that an informed energy transition is the key to Pakistan's economic stability. By bridging the gap between complex engineering data and policy-level decision making, we empower stakeholders at every level—from homeowners to regulators—to make smarter energy choices.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Whether through our weekly podcast, physical energy audits, or real-time monitoring platforms, our goal remains consistent: **clarity, action, and impact.**
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-primary/5 rounded-2xl flex items-center justify-center p-8 text-center flex-col gap-4">
                                <span className="text-4xl font-bold text-primary">500+</span>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Audits Done</span>
                            </div>
                            <div className="aspect-square bg-primary/10 rounded-2xl flex items-center justify-center p-8 text-center flex-col gap-4">
                                <span className="text-4xl font-bold text-primary">20MW+</span>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Monitored</span>
                            </div>
                            <div className="aspect-square bg-accent/10 rounded-2xl flex items-center justify-center p-8 text-center flex-col gap-4">
                                <span className="text-4xl font-bold text-primary">50+</span>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Team Experts</span>
                            </div>
                            <div className="aspect-square bg-primary/5 rounded-2xl flex items-center justify-center p-8 text-center flex-col gap-4">
                                <span className="text-4xl font-bold text-primary">100+</span>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Podcast Episodes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team/Leadership Section */}
            <section className="py-24 bg-primary/5">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Leadership Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <TeamMember name="Engr. M. Nouman" role="Technical Director" bio="Expert in distributed generation and grid integration with over 15 years of industrial experience." />
                        <TeamMember name="Dr. Ayesha Malik" role="Policy Lead" bio="Ph.D. in Energy Economics, advising regulators on net-metering and tariff structures." />
                        <TeamMember name="Sarmad Khan" role="Operations Manager" bio="Specialist in O&M logistics and field engineering for large-scale industrial portfolios." />
                    </div>
                </div>
            </section>

            {/* Partners & Sponsors Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Our Partners & Sponsors</h2>
                    <p className="text-muted-foreground mb-16">Collaborating with global leaders in energy technology and policy.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-50 grayscale hover:grayscale-0 transition-all">
                        {/* Replace with actual partner logos */}
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-12 bg-primary/5 rounded flex items-center justify-center font-bold text-xs">PARTNER LOGO</div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function TeamMember({ name, role, bio }: { name: string, role: string, bio: string }) {
    return (
        <Card className="border-none shadow-lg overflow-hidden group">
            <div className="aspect-[4/5] bg-primary/5" />
            <CardContent className="p-8">
                <h4 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{name}</h4>
                <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">{role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
            </CardContent>
        </Card>
    );
}
