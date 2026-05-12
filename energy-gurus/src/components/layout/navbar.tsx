"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { UserButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
    { label: "Home",      href: "/" },
    { label: "Podcast",   href: "/podcast" },
    { label: "Installers",href: "/epcs" },
    { label: "Brands",    href: "/brands" },
    { label: "Live QA",   href: "/live-qa" },
    { label: "About Us",  href: "/about" },
];

export function Navbar() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { isSignedIn } = useAuth();

    // Detect mobile reliably via JS — avoids Tailwind responsive class issues
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const toggleLocale = (l: string) => router.replace(pathname, { locale: l });

    const goToDashboard = () => {
        setIsOpen(false);
        router.push(isSignedIn ? "/dashboard" as any : "/sign-in" as any);
    };

    const activeClass = "text-[#005353] border-b-2 border-[#7a5900] pb-0.5 font-bold";
    const inactiveClass = "text-[#3e4948] hover:text-[#005353] transition-colors duration-200";

    return (
        <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #bec9c8", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", gap: "32px" }}>

                {/* Logo */}
                <Link href="/" style={{ fontWeight: 700, fontSize: "18px", color: "#005353", whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}>
                    EnergyGurus.Online
                </Link>

                {/* Desktop Nav */}
                {!isMobile && (
                    <nav style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, justifyContent: "center" }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href as any}
                                className={`text-sm font-semibold whitespace-nowrap ${pathname === link.href ? activeClass : inactiveClass}`}
                                style={{ textDecoration: "none" }}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={goToDashboard}
                            className={`text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 ${pathname === "/dashboard" ? activeClass : inactiveClass}`}
                        >
                            <LayoutDashboard style={{ width: 14, height: 14 }} />
                            Dashboard
                        </button>
                    </nav>
                )}

                {/* Right: Auth + Mobile Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_..." && (
                            <>
                                <SignedIn>
                                    <UserButton afterSignOutUrl="/" />
                                </SignedIn>
                                <SignedOut>
                                    <Link
                                        href="/sign-in"
                                        style={{ backgroundColor: "#006d6d", color: "#c8f5f5", padding: "6px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", textDecoration: "none", display: "inline-block" }}
                                    >
                                        Sign In
                                    </Link>
                                </SignedOut>
                            </>
                        )}

                    {isMobile && (
                        <button onClick={() => setIsOpen(!isOpen)} style={{ padding: "8px", color: "#3e4948", background: "none", border: "none", cursor: "pointer" }}>
                            {isOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobile && isOpen && (
                <div style={{ borderTop: "1px solid #bec9c8", backgroundColor: "#ffffff", padding: "12px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className={`flex items-center text-sm font-semibold px-3 py-2.5 rounded-lg ${pathname === link.href ? "text-[#005353] bg-[#006d6d]/10" : "text-[#3e4948] hover:text-[#005353]"}`}
                            onClick={() => setIsOpen(false)}
                            style={{ textDecoration: "none", display: "flex" }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button
                        onClick={goToDashboard}
                        className="w-full flex items-center gap-2 text-sm font-semibold px-3 py-2.5 rounded-lg text-[#3e4948] hover:text-[#005353]"
                    >
                        <LayoutDashboard style={{ width: 16, height: 16 }} />
                        Dashboard
                    </button>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #bec9c8" }}>
                        <button onClick={() => toggleLocale("en")} style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: locale === "en" ? "#005353" : "#e8f6f6", color: locale === "en" ? "#fff" : "#3e4948" }}>English</button>
                        <button onClick={() => toggleLocale("ur")} style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: locale === "ur" ? "#005353" : "#e8f6f6", color: locale === "ur" ? "#fff" : "#3e4948" }}>اردو</button>
                    </div>
                </div>
            )}
        </header>
    );
}
