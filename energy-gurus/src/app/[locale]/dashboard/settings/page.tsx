"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, User, Save, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

const roleLabels: Record<string, string> = {
    "super-admin": "System Administrator",
    "admin": "Administrator",
    "epc": "EPC Installer",
    "brand": "Brand Partner",
    "user": "Member",
};

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Populate once user loads
    useEffect(() => {
        if (isLoaded && user && firstName === "" && lastName === "") {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
        }
    }, [isLoaded, user]);

    const role = (user?.publicMetadata?.role as string) || "user";
    const roleLabel = roleLabels[role] || "Member";

    const handleSaveName = async () => {
        if (!user) return;

        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        if (trimmedFirstName === "" || trimmedLastName === "") {
            alert("Names cannot be empty or contain only spaces.");
            return;
        }

        setSaving(true);
        try {
            await user.update({
                firstName: trimmedFirstName,
                lastName: trimmedLastName
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            console.error("Failed to update name:", e);
            alert(e.errors?.[0]?.longMessage || "Failed to update name. Please check your inputs.");
        } finally {
            setSaving(false);
        }
    };

    const handleLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber/10 text-ink rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-amber" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-slate-custom">Manage your personal information and preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-paper/5 border-b">
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                        <CardDescription>Your public account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Avatar + identity */}
                        <div className="flex items-center gap-6">
                            <Avatar className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl shrink-0">
                                <AvatarImage src={(user?.publicMetadata?.brandLogo as string) || user?.imageUrl} />
                                <AvatarFallback className="bg-amber text-ink text-white text-2xl font-bold">
                                    {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold">{user?.fullName || "Energy Guru"}</h3>
                                <p className="text-slate-custom text-sm">{user?.emailAddresses[0]?.emailAddress}</p>
                                <span className="mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber/10 text-ink text-amber border border-amber/20">
                                    {roleLabel}
                                </span>
                            </div>
                        </div>

                        {/* Name edit form */}
                        <div className="space-y-6 pt-6 border-t">
                            <h4 className="text-sm font-bold uppercase tracking-widest opacity-60">Update Your Name</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">First Name</label>
                                    <input
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        className="w-full p-3 border rounded-xl bg-paper/5 focus:ring-2 focus:ring-primary outline-none font-medium"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest opacity-60">Last Name</label>
                                    <input
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        className="w-full p-3 border rounded-xl bg-paper/5 focus:ring-2 focus:ring-primary outline-none font-medium"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSaveName}
                                disabled={saving}
                                className="h-12 px-8 rounded-xl font-bold gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saved ? "Saved!" : saving ? "Saving..." : "Save Name"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Locale Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-paper/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="w-5 h-5 text-amber" /> Locale
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={locale}
                                onChange={(e) => handleLocaleChange(e.target.value)}
                                className="w-full bg-white border rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                            >
                                <option value="en">English (United States)</option>
                                <option value="ur">Urdu (Pakistan)</option>
                            </select>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
