import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Mic,
    Zap,
    BarChart3,
    Settings2,
    ArrowRight,
    ShieldCheck,
    Users,
    CheckCircle2,
    Play,
    FileText,
    TrendingUp,
    Mail
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export default function Homepage() {
    const t = useTranslations("HomePage");

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-40 overflow-hidden bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white leading-[1.1]">
                            {t.rich('title', {
                                br: () => <br />,
                                accent: (chunks) => <span className="text-accent italic">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-10 leading-relaxed max-w-2xl">
                            {t('subtitle')}
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Button size="lg" variant="accent" className="font-bold h-14 px-8 text-lg rounded-full" asChild>
                                <Link href="/podcast">{t('cta_podcast')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary h-14 px-8 text-lg rounded-full font-bold" asChild>
                                <Link href="/audit">{t('cta_audit')}</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 -skew-x-12 transform translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* Latest Podcast Preview - Sticky Bar / Small Section */}
            <section className="bg-secondary/20 py-12 border-b">
                <div className="container mx-auto px-4">
                    <Card className="bg-card border-none shadow-xl overflow-hidden">
                        <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                            <div className="flex-1 p-8 md:p-12 space-y-6">
                                <span className="text-accent font-bold uppercase tracking-widest text-xs">Latest Podcast Episode</span>
                                <h2 className="text-3xl font-bold font-heading">Building Pakistan's Solar Future</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    In this episode, we talk with leading policy experts about the current state of net-metering and what it means for consumers in 2026.
                                </p>
                                <div className="flex items-center gap-6">
                                    <Button variant="primary" size="lg" className="rounded-full gap-2 px-6 font-bold" asChild>
                                        <Link href="/podcast/e1"><Play className="w-4 h-4 fill-current" /> Play Now</Link>
                                    </Button>
                                    <Button variant="link" className="text-primary font-bold p-0" asChild>
                                        <Link href="/podcast/e1">Show Notes & Transcript →</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 bg-slate-200 min-h-[300px] relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <Mic className="w-32 h-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-4xl font-bold mb-4">Our Services</h2>
                        <p className="text-muted-foreground text-lg">Comprehensive solutions for the entire energy asset lifecycle.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <ServiceCard
                            title="Energy Audit"
                            description="Site visits, load analysis, and solar feasibility for residential & commercial sites."
                            icon={<Zap className="w-10 h-10 text-primary" />}
                            link="/audit"
                            bullets={["Solar feasibility", "Load profile logging", "ROI analysis"]}
                        />
                        <ServiceCard
                            title="Online Monitoring"
                            description="Real-time telemetry & dashboards for power, energy, and performance tracking."
                            icon={<BarChart3 className="w-10 h-10 text-primary" />}
                            link="/monitoring"
                            bullets={["Live power flow", "Historical analytics", "Smart SMS alerts"]}
                        />
                        <ServiceCard
                            title="O&M Services"
                            description="Preventive and corrective maintenance with transparent SLAs and guarantees."
                            icon={<Settings2 className="w-10 h-10 text-primary" />}
                            link="/om"
                            bullets={["Quarterly inspections", "Inverter health checks", "24h Response SLA"]}
                        />
                    </div>
                </div>
            </section>

            {/* Why EnergyGurus / Trust Points */}
            <section className="py-24 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold leading-tight">Why do stakeholders trust EnergyGurus?</h2>
                            <div className="space-y-6">
                                <TrustPoint icon={<ShieldCheck className="w-7 h-7" />} title="Independent Analysis" description="Unbiased commentary on policy and technology for regulators and end-users." />
                                <TrustPoint icon={<Users className="w-7 h-7" />} title="Policy Engagement" description="Actively participating in whitepapers and policy notes for Pakistan's energy transition." />
                                <TrustPoint icon={<CheckCircle2 className="w-7 h-7" />} title="Certified Auditors" description="All audits are performed by engineers with decades of combined field experience." />
                            </div>
                        </div>
                        <div className="bg-primary rounded-3xl p-10 text-primary-foreground space-y-10 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6">Real Results, Delivered.</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Metric icon={<TrendingUp />} value="98.5%" label="Uptime Improvement" />
                                <Metric icon={<Zap />} value="~25%" label="Avg. Bill Reduction" />
                                <Metric icon={<CheckCircle2 />} value="500+" label="Audits Completed" />
                                <Metric icon={<Users />} value="10k+" label="Monthly Listeners" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Resource Carousel Preview */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex items-end justify-between mb-16">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-bold mb-4">Latest Insights & Policy Briefs</h2>
                            <p className="text-muted-foreground">Stay informed with our long-form analysis and technical resources.</p>
                        </div>
                        <Button variant="outline" className="hidden md:flex gap-2" asChild>
                            <Link href="/resources">View all resources <ArrowRight className="w-4 h-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard title="Net-Metering 2.0" category="Policy Note" excerpt="Analyzing the impact of the upcoming 2026 regulatory changes..." />
                        <ResourceCard title="Battery Storage Guide" category="Technical" excerpt="Choosing the right storage architecture for industrial backup..." />
                        <ResourceCard title="Annual Energy Outlook" category="Whitepaper" excerpt="A comprehensive review of Pakistan's grid stability in 2025..." />
                    </div>
                </div>
            </section>

            {/* Newsletter / Social Subscribe */}
            <section className="py-24 bg-accent/10 border-t">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="p-8 md:p-16 bg-white rounded-3xl shadow-xl border space-y-8">
                        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold">Stay Powered Up</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                            Subscribe to our newsletter for weekly podcast summaries, policy alerts, and energy-saving tips delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full">
                            <NewsletterForm />
                        </div>
                        <p className="text-sm text-muted-foreground">Join 5,000+ energy stakeholders in Pakistan.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ServiceCard({ title, description, icon, link, bullets }: { title: string, description: string, icon: React.ReactNode, link: string, bullets: string[] }) {
    return (
        <Card className="hover:shadow-xl transition-all border-none bg-secondary/10 group rounded-2xl flex flex-col items-stretch overflow-hidden">
            <CardContent className="pt-10 p-8 flex flex-col h-full">
                <div className="mb-6 p-4 bg-background rounded-xl inline-block shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-muted-foreground mb-8 text-base">{description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                    {bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {b}
                        </li>
                    ))}
                </ul>
                <Button variant="primary" className="w-full font-bold group" asChild>
                    <Link href={link}>
                        Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function TrustPoint({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-6 group">
            <div className="flex-shrink-0 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function Metric({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent">
                <div className="p-1 bg-accent/20 rounded">{icon}</div>
                <span className="text-4xl font-bold tracking-tighter">{value}</span>
            </div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function ResourceCard({ title, category, excerpt }: { title: string, category: string, excerpt: string }) {
    return (
        <Card className="hover:shadow-lg transition-all border-none bg-secondary/10 p-8 group">
            <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">{category}</span>
            <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed">{excerpt}</p>
            <Button variant="link" className="p-0 h-auto text-primary font-bold" asChild>
                <Link href="/resources">Read Full Brief →</Link>
            </Button>
        </Card>
    );
}
