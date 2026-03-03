import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, BarChart, Search, Zap, PieChart, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";

export default function AuditPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Professional Energy Audits for Pakistan</h1>
                        <p className="text-xl opacity-90 mb-8 leading-relaxed">
                            Our energy audits combine on-site measurements and data analytics to reveal how you can reduce bills, increase uptime and maximize ROI from solar and storage investments.
                        </p>
                        <Button size="lg" variant="accent" className="font-bold px-8">
                            Request Your Audit
                        </Button>
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">What's included in an Energy Audit?</h2>
                        <p className="text-muted-foreground">We provide a comprehensive technical and financial overview of your site's energy health.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureItem icon={<Search className="text-primary w-10 h-10" />} title="Site Visit" description="Physical inspection of electrical systems and structural feasibility for solar." />
                        <FeatureItem icon={<BarChart className="text-primary w-10 h-10" />} title="Data Logging" description="High-precision telemetry to capture real load profile over 24-48 hours." />
                        <FeatureItem icon={<Zap className="text-primary w-10 h-10" />} title="Solar Feasibility" description="Detailed shade analysis and multi-scenario system design." />
                        <FeatureItem icon={<PieChart className="text-primary w-10 h-10" />} title="Load Analysis" description="Identification of energy-intensive appliances and inefficiency points." />
                    </div>
                </div>
            </section>

            {/* Audit Process */}
            <section className="py-20 bg-secondary/20">
                <div className="container mx-auto px-4 focus-visible:outline-none">
                    <h2 className="text-3xl font-bold text-center mb-16">Our Proven Audit Process</h2>
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/10 -translate-y-1/2 hidden lg:block" />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <ProcessStep step="1" title="Discovery" description="Initial consultation and document review." />
                            <ProcessStep step="2" title="Data Collection" description="On-site measurements and logging." />
                            <ProcessStep step="3" title="Analysis" description="Advanced engineering and ROI modeling." />
                            <ProcessStep step="4" title="Recommendations" description="Prioritized energy-saving interventions." />
                            <ProcessStep step="5" title="Final Report" description="Comprehensive PDF and walkthrough." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Lead Capture form */}
            <section className="py-20 bg-background border-t">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Request Your Custom Audit</h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Ready to take control of your energy bills? Fill out the form below and our certified auditors will get back to you within 24 hours.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <ShieldCheck className="text-primary w-6 h-6" />
                                    <span className="font-semibold text-lg">Certified Auditors</span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <ShieldCheck className="text-primary w-6 h-6" />
                                    <span className="font-semibold text-lg">Guaranteed Savings Roadmap</span>
                                </div>
                            </div>
                        </div>

                        <Card className="shadow-2xl">
                            <CardContent className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <Input placeholder="+92 3XX XXXXXXX" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Site Address</label>
                                    <Input placeholder="Plot #, Street, City" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Energy Goal</label>
                                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option>Reduce Monthly Bills</option>
                                        <option>Solar Feasibility</option>
                                        <option>Power Backup/UPS Audit</option>
                                        <option>Commercial Efficiency</option>
                                    </select>
                                </div>
                                <Button className="w-full font-bold" size="lg">Submit Audit Request</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Case Studies / Downloads */}
            <section className="py-20 bg-primary/5">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-8">See What You Get</h3>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <Button variant="outline" className="h-auto py-6 px-10 gap-3 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold">
                            <FileText className="w-6 h-6" /> Download Sample Report (PDF)
                        </Button>
                        <Button variant="outline" className="h-auto py-6 px-10 gap-3 border-2 border-accent text-accent hover:bg-accent hover:text-black transition-all font-bold">
                            <Zap className="w-6 h-6" /> View Case Study: Residential 15kW
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="p-4 bg-primary/5 rounded-2xl">{icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

function ProcessStep({ step, title, description }: { step: string, title: string, description: string }) {
    return (
        <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform">
                {step}
            </div>
            <h4 className="font-bold text-lg mb-2">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
