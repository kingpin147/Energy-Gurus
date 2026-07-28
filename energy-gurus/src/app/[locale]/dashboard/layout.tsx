import { Link } from "@/i18n/routing";
import { ArrowLeft, Mic } from "lucide-react";
import { getUserRole } from "@/lib/roles";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "@/lib/user";
import { UserNav } from "@/components/layout/user-nav";
import { InvitationCheck } from "@/components/dashboard/invitation-check";
import { SecurityGuard } from "@/components/auth/security-guard";
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav";

import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const role = await getUserRole();
    const user = await getCurrentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    return (
        <div className="dashboard-layout">
            <CommandPalette role={role} />
            {/* Mobile Nav — only visible below 1024px */}
            <div className="mobile-nav-wrapper">
                <MobileDashboardNav role={role} />
            </div>

            {/* Desktop Sidebar — only visible at 1024px+ */}
            <aside className="desktop-sidebar">
                <div className="h-[72px] flex items-center px-6 border-b border-line">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-ink p-1 rounded-lg text-amber font-space-grotesk font-bold">
                            EG
                        </div>
                        <span className="text-lg font-space-grotesk font-bold text-ink">EnergyGurus</span>
                    </Link>
                </div>

                <Sidebar role={role} />

                <div className="p-4 border-t border-line space-y-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-sm text-slate-custom hover:text-ink transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Site</span>
                    </Link>
                    <div className="flex flex-col gap-3">
                        <span className="font-ibm-plex-mono text-[0.7rem] uppercase text-slate-custom px-1 tracking-widest">Account</span>
                        <div className="flex items-center gap-3 px-1">
                            <NotificationBell />
                            <UserNav />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <SecurityGuard locale={locale} />
                {user && email && <InvitationCheck userId={user.id} email={email} />}
                {children}
            </main>

            <style>{`
                .dashboard-layout {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: var(--paper);
                    color: var(--graphite);
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }
                .mobile-nav-wrapper {
                    display: block;
                }
                .desktop-sidebar {
                    display: none;
                    width: 256px;
                    border-right: 1px solid var(--line);
                    background: #fff;
                    flex-direction: column;
                    flex-shrink: 0;
                }
                .dashboard-main {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: var(--paper);
                }
                @media (min-width: 1024px) {
                    .dashboard-layout {
                        flex-direction: row;
                    }
                    .mobile-nav-wrapper {
                        display: none;
                    }
                    .desktop-sidebar {
                        display: flex;
                    }
                }
            `}</style>
        </div>
    );
}
