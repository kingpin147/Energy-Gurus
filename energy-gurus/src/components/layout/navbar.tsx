"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { UserNav } from "@/components/layout/user-nav";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const navLinks = [
    { label: "Home",       href: "/" },
    { label: "Podcast",    href: "/podcast" },
    { label: "Installers", href: "/epcs" },
    { label: "Brands",     href: "/brands" },
    { label: "Live QA",    href: "/live-qa" },
    { label: "About Us",   href: "/about" },
];

export function Navbar() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useAuth();

    const toggleLocale = (l: string) => router.replace(pathname, { locale: l });

    const goToDashboard = () => {
        setIsOpen(false);
        router.push(isSignedIn ? "/dashboard" as any : "/sign-in" as any);
    };

    const activeClass = "text-primary border-b-2 border-accent pb-0.5 font-bold";
    const inactiveClass = "text-muted-foreground hover:text-primary transition-colors duration-200";

    return (
        <header className="bg-white border-b border-[#bec9c8] sticky top-0 z-50">
            <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto px-6 h-16 gap-4">

                {/* Logo */}
                <Link href="/" className="font-bold text-lg text-primary shrink-0 no-underline">
                    EnergyGurus.Online
                </Link>

                {/* Desktop Nav — hidden on small screens via CSS media query in style tag */}
                <nav className="desktop-nav items-center gap-6 flex-1 justify-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className={`text-sm font-semibold whitespace-nowrap no-underline transition-all ${pathname === link.href ? activeClass : inactiveClass}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button
                        onClick={goToDashboard}
                        className={`text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition-all ${pathname.startsWith("/dashboard") ? activeClass : inactiveClass}`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                    </button>
                </nav>

                {/* Right side: User nav + mobile toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_..." && (
                            <UserNav />
                        )}
                    {/* Mobile hamburger — only shown on small screens */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="mobile-menu-btn text-muted-foreground bg-transparent border-none cursor-pointer"
                        style={{ padding: "8px", alignItems: "center", justifyContent: "center" }}
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="mobile-drawer border-t border-[#bec9c8] bg-white px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href as any}
                                className={`flex items-center text-sm font-semibold px-3 py-2.5 rounded-lg no-underline ${pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={goToDashboard}
                            className="w-full flex items-center gap-2 text-sm font-semibold px-3 py-2.5 rounded-lg text-muted-foreground hover:text-primary bg-transparent border-none cursor-pointer text-left"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </button>
                    </nav>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#bec9c8]">
                        <button
                            onClick={() => toggleLocale("en")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition-colors ${locale === "en" ? "bg-primary text-white" : "bg-[#e8f6f6] text-muted-foreground"}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => toggleLocale("ur")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition-colors ${locale === "ur" ? "bg-primary text-white" : "bg-[#e8f6f6] text-muted-foreground"}`}
                        >
                            اردو
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .desktop-nav {
                    display: none;
                }
                .mobile-menu-btn {
                    display: flex;
                }
                .mobile-drawer {
                    display: block;
                }
                @media (min-width: 768px) {
                    .desktop-nav {
                        display: flex;
                    }
                    .mobile-menu-btn {
                        display: none;
                    }
                    .mobile-drawer {
                        display: none;
                    }
                }
            `}</style>
        </header>
    );
}
