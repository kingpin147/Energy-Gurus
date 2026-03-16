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
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20 lg:py-32 overflow-hidden relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Real-Time Telemetry for Peak Performance</h1>
                        <p className="text-xl opacity-90 mb-8 leading-relaxed">
                            Monitor power, energy, SOC, and inverter status in real-time. Our platform provides the data-driven insights you need to maximize uptime and efficiency.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" variant="accent" className="font-bold px-8 shadow-lg shadow-accent/20" asChild>
                                <Link href="/dashboard">Access Live Demo & Dashboard</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent font-bold border-white text-white hover:bg-white hover:text-primary transition-all">
                                Request Trial
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
                        <p className="text-muted-foreground">Everything you need to manage one site or an entire portfolio of energy assets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <MonitoringFeature
                            icon={<Activity className="w-8 h-8 text-primary" />}
                            title="Real-time Telemetry"
                            description="Power, energy, state-of-charge (SOC), and comprehensive inverter health status updated every second."
                        />
                        <MonitoringFeature
                            icon={<Bell className="w-8 h-8 text-primary" />}
                            title="Smart Alerts"
                            description="Instant notifications via SMS, email, or Webhooks for critical system faults or performance drops."
                        />
                        <MonitoringFeature
                            icon={<LayoutDashboard className="w-8 h-8 text-primary" />}
                            title="Custom Dashboards"
                            description="Tiered views for homeowners, O&M providers, and portfolio investors to see exactly what matters."
                        />
                        <MonitoringFeature
                            icon={<Code2 className="w-8 h-8 text-primary" />}
                            title="API & Integrations"
                            description="Connect with major inverter brands, IoT gateways, and weather data for advanced analytical modeling."
                        />
                        <MonitoringFeature
                            icon={<PieChart className="w-8 h-8 text-primary" />}
                            title="Performance Ratio (PR)"
                            description="Track yield vs expected performance using local irradiance data and site-specific efficiency metrics."
                        />
                        <MonitoringFeature
                            icon={<Smartphone className="w-8 h-8 text-primary" />}
                            title="Role-Based Access"
                            description="Secure permissions for owners, technicians, and administrators to ensure data integrity."
                        />
                    </div>
                </div>
            </section>

            {/* Analytics Breakdown */}
            <section className="py-24 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">Advanced Analytics at your fingertips</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our platform doesn't just show data; it provides actionable intelligence. From downtime tracking to yield comparisons, we help you understand the *why* behind the numbers.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Downtime tracking & root-cause analysis",
                                    "Yield vs. Expected performance modeling",
                                    "Weekly & Monthly automated health reports",
                                    "Fleet-wide portfolio comparisons"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button size="lg" className="mt-4 font-bold">Request a Full Demo</Button>
                        </div>
                        <div className="flex-1 w-full aspect-square md:aspect-video bg-card border rounded-2xl shadow-2xl overflow-hidden relative p-8">
                            {/* Visualization Mockup */}
                            <div className="flex justify-between items-end h-full gap-2">
                                {[30, 50, 45, 80, 70, 95, 85, 60, 40, 55, 75, 90].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing / CTA */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12">Flexible Subscription Tiers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingCard tier="Essential" price="Free" features={["1-minute updates", "7-day history", "Basic alerts"]} />
                        <PricingCard tier="Pro" price="$15/mo" features={["Real-time updates", "Full history", "Advanced analytics", "SMS Alerts"]} featured={true} />
                        <PricingCard tier="Portfolio" price="Custom" features={["Unlimited sites", "API access", "White-label reports", "Dedicated support"]} />
                    </div>
                </div>
            </section>
        </div>
    );
}

function MonitoringFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="hover:shadow-lg transition-all border-none bg-secondary/10 group p-4">
            <CardContent className="pt-8">
                <div className="mb-6 p-4 bg-background rounded-xl inline-block shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );
}

function PricingCard({ tier, price, features, featured = false }: { tier: string, price: string, features: string[], featured?: boolean }) {
    return (
        <Card className={`p-8 flex flex-col items-center ${featured ? 'border-primary border-2 shadow-xl scale-105' : ''}`}>
            <h4 className="text-lg font-bold mb-2 uppercase tracking-widest">{tier}</h4>
            <div className="text-3xl font-bold mb-6">{price}</div>
            <ul className="space-y-4 mb-8 text-sm text-muted-foreground w-full">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                    </li>
                ))}
            </ul>
            <Button variant={featured ? 'primary' : 'outline'} className="w-full font-bold">Get Started</Button>
        </Card>
    );
}
