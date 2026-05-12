"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { UserButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { Mic, Search, Globe, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const publicNavLinks = [
    { key: "home", href: "/" },
    { key: "podcast", href: "/podcast" },
    { key: "epcs", href: "/epcs" },
    { key: "brands", href: "/brands" },
    { key: "live_qa", href: "/live-qa" },
    { key: "about", href: "/about" },
];

export function Navbar() {
    const t = useTranslations("Navbar");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useAuth();

    const toggleLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    const handleDashboardClick = () => {
        setIsOpen(false);
        if (isSignedIn) {
            router.push("/dashboard" as any);
        } else {
            router.push("/sign-in" as any);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Topbar / Utility */}
            <div className="bg-secondary/30 h-10 border-b hidden sm:flex items-center">
                <div className="container mx-auto px-4 flex justify-between items-center text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            <button
                                onClick={() => toggleLocale('en')}
                                className={`hover:text-primary transition-colors ${locale === 'en' ? 'text-primary font-bold' : ''}`}
                            >
                                English
                            </button>
                            <span className="opacity-30">|</span>
                            <button
                                onClick={() => toggleLocale('ur')}
                                className={`hover:text-primary transition-colors ${locale === 'ur' ? 'text-primary font-bold' : ''}`}
                            >
                                اردو
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="opacity-50 font-bold uppercase tracking-tighter text-[10px]">Contact:</span>
                            <span className="text-primary">+92 21 3XXX XXXX</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/audit" className="bg-accent/20 hover:bg-accent/30 text-accent-foreground px-3 py-1 rounded transition-colors">
                            Quick Request Audit
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 shrink-0">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <Mic className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">EnergyGurus</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                    {publicNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className={`text-sm font-medium px-2 lg:px-3 py-1.5 rounded-md transition-colors hover:text-primary hover:bg-primary/5 ${
                                pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                            }`}
                        >
                            {t(link.key)}
                        </Link>
                    ))}

                    {/* Dashboard link — smart: prompts sign-in for guests */}
                    <button
                        onClick={handleDashboardClick}
                        className={`text-sm font-medium px-2 lg:px-3 py-1.5 rounded-md transition-colors hover:text-primary hover:bg-primary/5 flex items-center gap-1.5 ${
                            pathname === "/dashboard" ? "text-primary bg-primary/5" : "text-muted-foreground"
                        }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {t("dashboard")}
                    </button>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                    <div className="hidden sm:flex items-center">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                        </Button>
                    </div>

                    <Button variant="accent" size="sm" className="hidden lg:flex font-semibold" asChild>
                        <Link href="/audit">Request Audit</Link>
                    </Button>

                    {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...' && (
                            <>
                                <SignedIn>
                                    <UserButton afterSignOutUrl="/" />
                                </SignedIn>
                                <SignedOut>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href="/sign-in">Sign In</Link>
                                    </Button>
                                </SignedOut>
                            </>
                        )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-muted-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isOpen && (
                <div className="md:hidden border-t bg-background p-4 space-y-1">
                    {publicNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className={`flex items-center text-base font-medium px-3 py-2.5 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${
                                pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground"
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            {t(link.key)}
                        </Link>
                    ))}

                    {/* Dashboard — smart for mobile too */}
                    <button
                        onClick={handleDashboardClick}
                        className={`w-full flex items-center gap-2 text-base font-medium px-3 py-2.5 rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${
                            pathname === "/dashboard" ? "text-primary bg-primary/5" : "text-muted-foreground"
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        {t("dashboard")}
                    </button>

                    <div className="pt-2 border-t mt-2">
                        <Button variant="accent" className="w-full font-semibold" asChild>
                            <Link href="/audit" onClick={() => setIsOpen(false)}>Request Audit</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
