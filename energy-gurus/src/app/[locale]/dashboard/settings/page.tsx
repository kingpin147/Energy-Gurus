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
    ArrowUpRight,
    User,
    Bell,
    Lock
} from "lucide-react";

import { UserProfile, useUser } from "@clerk/nextjs";

export default function SettingsPage() {
    const { user } = useUser();

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your personal information, security, and preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-secondary/5 border-b">
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                        <CardDescription>Your public and private account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                                {user?.firstName?.charAt(0) || user?.emailAddresses[0].emailAddress.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{user?.fullName || "Energy Guru"}</h3>
                                <p className="text-muted-foreground">{user?.emailAddresses[0].emailAddress}</p>
                                <span className="mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                    System Administrator
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60">First Name</label>
                                <div className="p-3 bg-secondary/10 rounded-xl border font-medium">{user?.firstName || "N/A"}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Last Name</label>
                                <div className="p-3 bg-secondary/10 rounded-xl border font-medium">{user?.lastName || "N/A"}</div>
                            </div>
                        </div>

                        <Button variant="outline" className="rounded-xl font-bold h-12 gap-2 border-2" onClick={() => window.open(user?.id ? `https://accounts.clerk.com` : '#', '_blank')}>
                            <Lock className="w-4 h-4" /> Edit Account Security
                        </Button>
                    </CardContent>
                </Card>

                {/* Preferences Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" /> Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <PreferenceToggle label="Inquiry Emails" active={true} />
                            <PreferenceToggle label="System Alerts" active={true} />
                            <PreferenceToggle label="Weekly Reports" active={false} />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-secondary/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" /> Locale
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select className="w-full bg-white border rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-primary">
                                <option>English (United States)</option>
                                <option>Urdu (Pakistan)</option>
                            </select>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function PreferenceToggle({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-secondary'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
            </div>
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
