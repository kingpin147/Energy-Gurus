"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
// import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Mic, Search, Globe, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
    { key: "podcast", href: "/podcast" },
    { key: "audit", href: "/audit" },
    { key: "monitoring", href: "/monitoring" },
    { key: "om", href: "/om" },
    { key: "resources", href: "/resources" },
    { key: "about", href: "/about" },
    { key: "dashboard", href: "/dashboard" },
];

export function Navbar() {
    const t = useTranslations("Navbar");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const toggleLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
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
                <Link href="/" className="flex items-center space-x-2">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <Mic className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">EnergyGurus</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center space-x-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            {t(link.key)}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                        </Button>
                    </div>

                    <Button variant="accent" size="sm" className="hidden md:flex font-semibold" asChild>
                        <Link href="/audit">Request Audit</Link>
                    </Button>

                    {/* Auth Actions Hidden */}
                    {/* <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button size="sm" variant="outline">Sign In</Button>
                        </SignInButton>
                    </SignedOut> */}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-muted-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isOpen && (
                <div className="lg:hidden border-t bg-background p-4 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className="block text-base font-medium text-muted-foreground hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            {t(link.key)}
                        </Link>
                    ))}
                    <Button variant="accent" className="w-full font-semibold" asChild>
                        <Link href="/audit">Request Audit</Link>
                    </Button>
                </div>
            )}
        </header>
    );
}
