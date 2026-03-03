"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    CreditCard,
    History,
    Zap,
    ShieldCheck,
    Globe,
    AlertCircle,
    ArrowUpRight
} from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings & Billing</h1>
                    <p className="text-muted-foreground">Manage your subscription, billing details, and account preferences.</p>
                </div>
            </div>

            {/* Current Plan Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 overflow-hidden border-primary/20 shadow-md">
                    <CardHeader className="bg-primary/5 pb-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 mb-2">
                                    Current Plan
                                </div>
                                <CardTitle className="text-4xl font-bold">Pro Account</CardTitle>
                                <CardDescription className="text-base">
                                    Full access to real-time telemetry and advanced analytics.
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">$15</div>
                                <div className="text-sm text-muted-foreground font-medium">per month</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Plan Features</h4>
                                <ul className="space-y-3">
                                    <FeatureItem label="Real-time telemetry updates" />
                                    <FeatureItem label="Unlimited historical data" />
                                    <FeatureItem label="Custom SMS & Email alerts" />
                                    <FeatureItem label="Fleet-wide monitoring (up to 5 sites)" />
                                </ul>
                            </div>
                            <div className="bg-secondary/10 rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <h4 className="font-bold">Payment Method</h4>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                                        <div className="text-sm">•••• 4242</div>
                                    </div>
                                    <Button variant="link" size="sm" className="font-bold text-primary">Edit</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Next billing date: **April 03, 2026**</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" /> Billing History
                        </CardTitle>
                        <CardDescription>Recent invoices and activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <InvoiceItem date="Mar 03, 2026" amount="$15.00" status="Paid" />
                        <InvoiceItem date="Feb 03, 2026" amount="$15.00" status="Paid" />
                        <InvoiceItem date="Jan 03, 2026" amount="$15.00" status="Paid" />
                        <Button variant="outline" className="w-full mt-4 font-bold border-2">Download All PDF</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Plan Options */}
            <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-accent" /> Available Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlanCard
                        title="Essential"
                        price="Free"
                        description="Basic monitoring for a single residential site."
                        features={["1-minute updates", "7-day history", "Basic analytics"]}
                        active={false}
                    />
                    <PlanCard
                        title="Pro"
                        price="$15/mo"
                        description="Advanced analysis and alerting for proactive owners."
                        features={["Real-time updates", "Unlimited history", "SMS Alerts"]}
                        active={true}
                    />
                    <PlanCard
                        title="Portfolio"
                        price="Custom"
                        description="Enterprise-grade fleet management for O&M providers."
                        features={["Unlimited sites", "White-labeling", "API access"]}
                        active={false}
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                            <h3 className="font-bold text-destructive">Cancel Subscription</h3>
                            <p className="text-sm text-muted-foreground">Once cancelled, you will lose access to Pro features at the end of your billing cycle.</p>
                        </div>
                    </div>
                    <Button variant="destructive" className="font-bold px-8">Cancel Subscription</Button>
                </CardContent>
            </Card>
        </div>
    );
}

function FeatureItem({ label }: { label: string }) {
    return (
        <li className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{label}</span>
        </li>
    );
}

function InvoiceItem({ date, amount, status }: { date: string, amount: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer group">
            <div className="space-y-1">
                <div className="text-sm font-bold tracking-tight">{date}</div>
                <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{status}</div>
            </div>
            <div className="text-right">
                <div className="text-sm font-bold mb-1">{amount}</div>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors inline" />
            </div>
        </div>
    );
}

function PlanCard({ title, price, description, features, active }: { title: string, price: string, description: string, features: string[], active: boolean }) {
    return (
        <Card className={`relative flex flex-col p-6 transition-all hover:shadow-xl ${active ? 'border-primary border-2 ring-4 ring-primary/5' : ''}`}>
            {active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Current Active
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-lg">{title}</h4>
                <div className="text-right">
                    <div className="font-bold text-xl text-primary">{price}</div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mb-6 line-clamp-2">{description}</p>
            <ul className="space-y-3 mb-8 flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-primary opacity-60" /> {f}
                    </li>
                ))}
            </ul>
            <Button variant={active ? "secondary" : "outline"} disabled={active} className="w-full font-bold">
                {active ? "Active" : "Switch to Plan"}
            </Button>
        </Card>
    );
}
