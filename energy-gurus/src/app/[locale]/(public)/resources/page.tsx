import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, BookOpen, Calculator, Download, ArrowRight, Search, Tag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";

export default function ResourcesPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold mb-4">Energy Knowledge Hub</h1>
                <p className="text-lg text-slate-custom">
                    Indepentent analysis, practical guides, and engineering tools for Pakistan's energy transition.
                </p>
            </div>

            {/* Categories Search/Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-2xl mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-custom" />
                    <Input placeholder="Search whitepapers, guides, tools..." className="pl-10 h-11" />
                </div>
                <Button variant="outline" className="h-11 gap-2">
                    <Tag className="w-4 h-4" /> All Topics
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left/Middle Column: Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Featured/Latest Whitepapers */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="text-amber w-6 h-6" /> Whitepapers & Policy Notes
                            </h2>
                            <Button variant="link" className="text-amber font-bold">View all</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResourceCard
                                type="Policy Note"
                                title="Net-Metering 2.0: Navigating the 2026 Regulatory Landscape"
                                description="An in-dept analysis of the upcoming regulatory changes and their impact on solar ROI in Pakistan."
                                date="March 2026"
                                gated={true}
                            />
                            <ResourceCard
                                type="Analysis"
                                title="The Battery Revolution: LFP vs. Sodium-Ion for Industrial Applications"
                                description="Comparing the next generation of industrial energy storage solutions for the local climate."
                                date="Feb 2026"
                                gated={true}
                            />
                        </div>
                    </section>

                    {/* Guides & How-tos */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="text-amber w-6 h-6" /> Guides & How-tos
                            </h2>
                            <Button variant="link" className="text-amber font-bold">View all</Button>
                        </div>
                        <div className="space-y-4">
                            {[
                                "How to read your net-metering bill and spot errors",
                                "Top 5 solar inverter brands available in Pakistan (2026 comparison)",
                                "Maintaining your Lithium battery for 10+ years of life",
                                "Understanding the impact of temperature on solar panel efficiency"
                            ].map((guide, i) => (
                                <Link key={i} href="#" className="flex items-center justify-between p-4 bg-paper/10 rounded-lg hover:bg-paper/20 transition-colors group">
                                    <span className="font-medium group-hover:text-amber transition-colors">{guide}</span>
                                    <ArrowRight className="w-4 h-4 text-slate-custom group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Tools & Calculators */}
                <aside className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Calculator className="text-amber w-6 h-6" /> Engineering Tools
                        </h2>
                        <div className="space-y-4">
                            <ToolCard
                                title="Solar ROI Calculator"
                                description="Calculate payback period based on your current tariff and local irradiance."
                            />
                            <ToolCard
                                title="Battery Sizing Tool"
                                description="Find the right kWh capacity based on your critical load and backup requirements."
                            />
                            <ToolCard
                                title="Net-Metering Savings Estimator"
                                description="Estimate your monthly export value based on the latest K-Electric/IESCO rates."
                            />
                        </div>
                    </section>

                    <Card className="bg-amber text-ink text-ink border-none">
                        <CardContent className="pt-8">
                            <h4 className="text-xl font-bold mb-4">Need a specialized analysis?</h4>
                            <p className="text-sm opacity-90 mb-6 leading-relaxed">
                                Our team provides custom policy recommendations and industrial feasibility studies.
                            </p>
                            <Button variant="accent" className="w-full font-bold">Inquire about Consultation</Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function ResourceCard({ type, title, description, date, gated = false }: { type: string, title: string, description: string, date: string, gated?: boolean }) {
    return (
        <Card className="flex flex-col h-full border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-6 flex flex-col h-full">
                <div className="text-xs font-bold text-amber uppercase tracking-widest mb-3">{type}</div>
                <h4 className="text-lg font-bold mb-3 group-hover:text-amber transition-colors flex-1">{title}</h4>
                <p className="text-sm text-slate-custom line-clamp-3 mb-6">{description}</p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-custom">{date}</span>
                    <Button size="sm" variant={gated ? 'primary' : 'outline'} className="gap-2 font-bold px-4">
                        {gated ? (<><Download className="w-3 h-3" /> Get PDF</>) : 'Read More'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ToolCard({ title, description }: { title: string, description: string }) {
    return (
        <Card className="border-t-4 border-amber hover:bg-paper/5 transition-colors cursor-pointer">
            <CardContent className="p-4">
                <h4 className="font-bold text-sm mb-1">{title}</h4>
                <p className="text-xs text-slate-custom">{description}</p>
            </CardContent>
        </Card>
    );
}
