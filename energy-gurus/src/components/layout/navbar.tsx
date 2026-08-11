"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UserNav } from "@/components/layout/user-nav";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";

const navLinks = [
    { label: "Solar Brands", href: "/brands" },
    { label: "Find an Installer", href: "/epcs" },
    { label: "Monitoring & O&M", href: "/monitoring" },
    { label: "Podcast", href: "/podcast" },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useAuth();

    const goToDashboard = () => {
        setIsOpen(false);
        router.push(isSignedIn ? "/dashboard" as any : "/sign-in" as any);
    };

    return (
        <nav className="sticky top-0 z-50 bg-paper/92 backdrop-blur-[8px] border-b border-line">
            <div className="flex items-center justify-between max-w-[1180px] mx-auto px-5 md:px-8 h-[72px]">
                {/* Logo */}
                <Logo />

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-8 items-center text-[0.92rem] font-medium text-slate-custom">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href as any}
                            className="hover:text-ink transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side: User nav + mobile toggle + CTA */}
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/dashboard" className="hidden md:block bg-ink text-paper px-5 py-[11px] rounded-[3px] text-[0.88rem] font-semibold hover:bg-teal transition-colors">
                        Get Started
                    </Link>

                    {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_..." && (
                            <UserNav />
                        )}
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex items-center justify-center p-2 text-slate-custom"
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="md:hidden border-t border-line bg-paper px-6 py-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href as any}
                                className={`block text-sm font-medium px-4 py-3 rounded-[3px] ${pathname === link.href ? "text-ink bg-line" : "text-slate-custom hover:text-ink"}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={goToDashboard}
                            className="w-full flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-[3px] text-slate-custom hover:text-ink text-left"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
