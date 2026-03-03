import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ShieldCheck,
    Settings2,
    Wrench,
    Truck,
    Clock,
    FileCheck,
    CheckCircle2,
    HelpCircle,
    ArrowRight,
    TrendingUp,
    Inbox
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";

export default function OMPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20 lg:py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Maximize Uptime. Protect Your Investment.</h1>
                        <p className="text-xl opacity-90 mb-8 leading-relaxed">
                            Professional Operations & Maintenance (O&M) services for solar and storage systems. Transparent SLAs, guaranteed response times, and proactive performance optimization.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" variant="accent" className="font-bold px-8">Request a Quote</Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold">View Packages</Button>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/20 -skew-x-12 transform translate-x-1/2" />
            </section>

            {/* Offerings Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl font-bold mb-4">Comprehensive O&M Solutions</h2>
                        <p className="text-muted-foreground">From individual sites to entire portfolios, we ensure your energy assets perform at their peak.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <Card className="border-none bg-secondary/10 overflow-hidden group">
                            <CardContent className="p-8 space-y-6">
                                <div className="p-4 bg-background rounded-2xl inline-block shadow-sm"><Settings2 className="w-10 h-10 text-primary" /></div>
                                <h3 className="text-2xl font-bold">Preventive Maintenance</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Scheduled site visits, thermal imaging of panels, string testing, inverter health checks, and connection tightening to prevent failures before they happen.
                                </p>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Quarterly site inspections</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Array cleaning & debris removal</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Firmware updates & performance tuning</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-secondary/10 overflow-hidden">
                            <CardContent className="p-8 space-y-6">
                                <div className="p-4 bg-background rounded-2xl inline-block shadow-sm"><Wrench className="w-10 h-10 text-primary" /></div>
                                <h3 className="text-2xl font-bold">Corrective Maintenance</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Rapid-response troubleshooting and repair. Our technicians are available for emergency dispatch to resolve inverter faults, string failures, or grid-tie issues.
                                </p>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 24/48-hour response guarantees</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Spare parts management & logistics</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Warranty claiming support</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* SLA Section */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-16">Transparent Performance SLAs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <SLACard icon={<Clock className="w-8 h-8" />} title="Response Time" value="< 24 Hours" description="For critical system failures." />
                        <SLACard icon={<TrendingUp className="w-8 h-8" />} title="Uptime Guarantee" value="98.5%" description="Guaranteed system availability." />
                        <SLACard icon={<FileCheck className="w-8 h-8" />} title="Reporting" value="Monthly" description="Detailed performance health reports." />
                    </div>
                </div>
            </section>

            {/* Contract Models / Pricing */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Flexible Contract Models</h2>
                        <p className="text-muted-foreground">Choose a plan that fits your risk profile and technical requirements.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PackageCard
                            title="Basic Care"
                            price="Pay-per-visit"
                            description="Best for standard residential systems. On-demand support when you need it."
                            features={["Site inspection", "Panel cleaning", "Health report"]}
                        />
                        <PackageCard
                            title="Premium Secure"
                            price="Retainer-based"
                            description="Complete peace of mind. Proactive monitoring and guaranteed maintenance visits."
                            features={["Quarterly visits", "Priority dispatch", "Full history logs", "Performance ROI guard"]}
                            featured={true}
                        />
                        <PackageCard
                            title="Enterprise"
                            price="Outcome-based"
                            description="For industrial & commercial portfolios. We share the risk with performance guarantees."
                            features={["Fleet-wide management", "Whitelabel dashboard", "Uptime penalty/bonus", "Dedicated engineer"]}
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA / Form */}
            <section className="py-24 bg-secondary/20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Card className="p-8 md:p-12 shadow-xl border-none">
                        <h2 className="text-3xl font-bold text-center mb-4">Get an O&M Proposal</h2>
                        <p className="text-center text-muted-foreground mb-12">Submit your site details and we'll prepare a custom maintenance strategy within 2 business days.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Name</label>
                                <Input placeholder="Your Name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input placeholder="+92 XXX XXXXXXX" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">System Size (kW)</label>
                                <Input type="number" placeholder="e.g., 15" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Inverter Brand</label>
                                <Input placeholder="e.g., Sungrow, Growatt" />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Brief description of requirements</label>
                                <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="I need a quarterly cleaning schedule or corrective repair..." />
                            </div>
                            <Button className="col-span-1 md:col-span-2 font-bold py-6 text-lg" size="lg">Send Request</Button>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function SLACard({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) {
    return (
        <div className="flex flex-col items-center p-6 space-y-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <div className="p-3 bg-accent/20 rounded-full text-accent">{icon}</div>
            <h4 className="font-bold text-lg mb-0">{title}</h4>
            <div className="text-3xl font-light text-accent">{value}</div>
            <p className="text-sm opacity-80">{description}</p>
        </div>
    );
}

function PackageCard({ title, price, description, features, featured = false }: { title: string, price: string, description: string, features: string[], featured?: boolean }) {
    return (
        <Card className={`p-8 flex flex-col ${featured ? 'border-primary border-2 shadow-xl' : ''}`}>
            <h4 className={`text-sm font-bold uppercase tracking-widest mb-2 ${featured ? 'text-primary' : 'text-muted-foreground'}`}>{title}</h4>
            <div className="text-2xl font-bold mb-4">{price}</div>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{description}</p>
            <ul className="space-y-4 mb-8 text-sm flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                    </li>
                ))}
            </ul>
            <Button variant={featured ? 'primary' : 'outline'} className="w-full font-bold">Request Quotation</Button>
        </Card>
    );
}
