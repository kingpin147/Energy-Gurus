import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, BarChart, Search, Zap, PieChart, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { AuditRequestForm } from "@/components/forms/audit-request-form";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.energygurus.online";
  const title = "Professional Solar Energy Audits in Pakistan | EnergyGurus";
  const description = "Request comprehensive physical and electrical load audits, solar system feasibility, and energy efficiency inspections across Pakistan.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/audit`,
      languages: {
        en: `${baseUrl}/en/audit`,
        ur: `${baseUrl}/ur/audit`,
        "x-default": `${baseUrl}/en/audit`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/audit`,
      siteName: "EnergyGurus",
      locale: locale === "ur" ? "ur_PK" : "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Energy Audits Pakistan" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`],
    },
  };
}

export default function AuditPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-amber text-ink text-ink py-20">
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
            <section className="py-20 bg-paper">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">What's included in an Energy Audit?</h2>
                        <p className="text-slate-custom">We provide a comprehensive technical and financial overview of your site's energy health.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureItem icon={<Search className="text-amber w-10 h-10" />} title="Site Visit" description="Physical inspection of electrical systems and structural feasibility for solar." />
                        <FeatureItem icon={<BarChart className="text-amber w-10 h-10" />} title="Data Logging" description="High-precision telemetry to capture real load profile over 24-48 hours." />
                        <FeatureItem icon={<Zap className="text-amber w-10 h-10" />} title="Solar Feasibility" description="Detailed shade analysis and multi-scenario system design." />
                        <FeatureItem icon={<PieChart className="text-amber w-10 h-10" />} title="Load Analysis" description="Identification of energy-intensive appliances and inefficiency points." />
                    </div>
                </div>
            </section>

            {/* Audit Process */}
            <section className="py-20 bg-paper/20">
                <div className="container mx-auto px-4 focus-visible:outline-none">
                    <h2 className="text-3xl font-bold text-center mb-16">Our Proven Audit Process</h2>
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-amber/10 text-ink -translate-y-1/2 hidden lg:block" />

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
            <section className="py-20 bg-paper border-t">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Request Your Custom Audit</h2>
                            <p className="text-lg text-slate-custom mb-8">
                                Ready to take control of your energy bills? Fill out the form below and our certified auditors will get back to you within 24 hours.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <ShieldCheck className="text-amber w-6 h-6" />
                                    <span className="font-semibold text-lg">Certified Auditors</span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <ShieldCheck className="text-amber w-6 h-6" />
                                    <span className="font-semibold text-lg">Guaranteed Savings Roadmap</span>
                                </div>
                            </div>
                        </div>

                        <Card className="shadow-2xl">
                            <AuditRequestForm />
                        </Card>
                    </div>
                </div>
            </section>

            {/* Case Studies / Downloads */}
            <section className="py-20 bg-amber/5 text-ink">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-8">See What You Get</h3>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <Button variant="outline" className="h-auto py-6 px-10 gap-3 border-2 border-amber text-amber hover:bg-amber text-ink hover:text-white transition-all font-bold">
                            <FileText className="w-6 h-6" /> Download Sample Report (PDF)
                        </Button>
                        <Button variant="outline" className="h-auto py-6 px-10 gap-3 border-2 border-accent text-amber hover:bg-paper hover:text-black transition-all font-bold">
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
            <div className="p-4 bg-amber/5 text-ink rounded-2xl">{icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-slate-custom leading-relaxed">{description}</p>
        </div>
    );
}

function ProcessStep({ step, title, description }: { step: string, title: string, description: string }) {
    return (
        <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-amber text-ink flex items-center justify-center text-white font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform">
                {step}
            </div>
            <h4 className="font-bold text-lg mb-2">{title}</h4>
            <p className="text-sm text-slate-custom">{description}</p>
        </div>
    );
}
