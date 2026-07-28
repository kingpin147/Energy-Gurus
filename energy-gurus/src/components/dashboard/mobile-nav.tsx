"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Menu, X, Mic, ArrowLeft } from "lucide-react";
import Sidebar from "@/app/[locale]/dashboard/Sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { UserRole } from "@/db/schema";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export function MobileDashboardNav({ role }: { role: UserRole }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-40">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="bg-amber text-ink p-1 rounded-lg">
                        <Mic className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-amber">EnergyGurus</span>
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 text-slate-custom bg-transparent border-none cursor-pointer"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
                    {/* Backdrop */}
                    <div
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-64 max-w-[80%] h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="h-16 flex items-center justify-between px-6 border-b">
                            <span className="font-bold text-amber">Menu</span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-custom bg-transparent border-none cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
                            <Sidebar role={role} />
                        </div>

                        <div className="p-4 border-t space-y-4">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 text-sm text-slate-custom hover:text-amber transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Site</span>
                            </Link>
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-medium uppercase text-slate-custom px-1">Account</span>
                                <UserNav />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
