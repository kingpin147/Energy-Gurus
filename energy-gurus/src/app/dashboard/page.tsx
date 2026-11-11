import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Battery, Sun, AlertTriangle, Users, MessageSquare, Package, ShieldCheck, FileText, Award } from "lucide-react";
import { getUserRole } from "@/lib/roles";
import { db } from "@/db";
import { users, inquiries, epcInstallers, brands, products, writerProfiles, news } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchGoogleAnalyticsDashboardData } from "@/lib/google-analytics";
import { GoogleAnalyticsSection } from "@/components/dashboard/GoogleAnalyticsSection";
import { LiveAnalyticsHeaderBadge } from "@/components/dashboard/LiveAnalyticsHeaderBadge";
import { CommandPaletteTrigger } from "@/components/dashboard/command-palette-trigger";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
    const role = await getUserRole();
    if (!role) {
        redirect("/access-denied");
    }
    const { userId: clerkId } = await auth();

    // Fetch common data if needed, or role-specific data
    let stats = [];
    let title = "Monitoring Dashboard";
    let subtitle = "Real-time telemetry and system performance overview.";

    const isAdmin = role === 'admin' || role === 'super-admin';
    let gaData: any = null;

    if (role === 'epc') {
        title = "EPC Overview";
        subtitle = "Track your company's performance and customer engagement.";
        const [user] = clerkId ? await db.select().from(users).where(eq(users.clerkId, clerkId)) : [];
        if (!user) {
            stats = [
                { title: "Welcome", value: "—", unit: "Setting up your profile…", icon: <Activity className="w-4 h-4 text-amber" /> },
            ];
        } else {
            const inquiryStats = await db.select({
                total: sql<number>`count(*)`,
                newLeads: sql<number>`count(*) filter (where status = 'new')`
            }).from(inquiries).where(eq(inquiries.receiverId, user.id));

            stats = [
                { title: "Total Inquiries", value: inquiryStats[0].total.toString(), unit: "Customer leads", icon: <MessageSquare className="w-4 h-4 text-amber" /> },
                { title: "New Leads", value: inquiryStats[0].newLeads.toString(), unit: "Action required", icon: <Activity className="w-4 h-4 text-orange-500" /> },
                { title: "Avg. Rating", value: "4.8", unit: "Out of 5", icon: <Sun className="w-4 h-4 text-yellow-500" /> },
                { title: "Profile Views", value: "1.2k", unit: "This month", icon: <Users className="w-4 h-4 text-blue-500" /> },
            ];
        }
    } else if (role === 'brand') {
        title = "Brand Center";
        subtitle = "Manage your product ecosystem and brand reputation.";
        const [user] = clerkId ? await db.select().from(users).where(eq(users.clerkId, clerkId)) : [];
        if (!user) {
            stats = [
                { title: "Welcome", value: "—", unit: "Setting up your brand profile…", icon: <Activity className="w-4 h-4 text-amber" /> },
            ];
        } else {
            const [brand] = await db.select().from(brands).where(eq(brands.userId, user.id));
            const productCount = brand ? await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.brandId, brand.id)) : [{ count: 0 }];
            const inquiryCount = await db.select({ count: sql<number>`count(*)` }).from(inquiries).where(eq(inquiries.receiverId, user.id));

            stats = [
                { title: "Active Products", value: (productCount[0]?.count ?? 0).toString(), unit: "In directory", icon: <Package className="w-4 h-4 text-amber" /> },
                { title: "Brand Status", value: brand?.isVerified ? "Verified" : (brand?.status || "Draft").toUpperCase(), unit: "Verification", icon: <ShieldCheck className="w-4 h-4 text-green-500" /> },
                { title: "Brand Inquiries", value: (inquiryCount[0]?.count ?? 0).toString(), unit: "Total received", icon: <MessageSquare className="w-4 h-4 text-amber" /> },
                { title: "Catalog Status", value: brand ? "Active" : "Pending Setup", unit: "Account Health", icon: <AlertTriangle className="w-4 h-4 text-amber" /> },
            ];
        }
    } else if (isAdmin) {
        title = "Admin Console";
        subtitle = "Global platform management and oversight.";
        
        const [
            userCount,
            epcCount,
            brandCount,
            writerCount,
            globalInquiries,
            fetchedGaData
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(users),
            db.select({ count: sql<number>`count(*)` }).from(epcInstallers),
            db.select({ count: sql<number>`count(*)` }).from(brands),
            db.select({ count: sql<number>`count(*)` }).from(writerProfiles),
            db.select({ count: sql<number>`count(*)` }).from(inquiries),
            fetchGoogleAnalyticsDashboardData()
        ]);

        gaData = fetchedGaData;

        stats = [
            { title: "Total Users", value: userCount[0].count.toString(), unit: "Registered", icon: <Users className="w-3.5 h-3.5 text-amber" />, accentColor: "bg-amber" },
            { title: "Verified EPCs", value: epcCount[0].count.toString(), unit: "Installers", icon: <ShieldCheck className="w-3.5 h-3.5 text-navy-deep" />, accentColor: "bg-navy-deep" },
            { title: "Brands", value: brandCount[0].count.toString(), unit: "Partners", icon: <Award className="w-3.5 h-3.5 text-amber-deep" />, accentColor: "bg-amber-deep" },
            { title: "Writers", value: writerCount[0].count.toString(), unit: "Authors", icon: <FileText className="w-3.5 h-3.5 text-navy" />, accentColor: "bg-navy" },
            { title: "Inquiries", value: globalInquiries[0].count.toString(), unit: "Platform leads", icon: <MessageSquare className="w-3.5 h-3.5 text-amber" />, accentColor: "bg-amber" },
            { title: "System Health", value: "99.9%", unit: "Operational", icon: <Activity className="w-3.5 h-3.5 text-teal" />, accentColor: "bg-teal" },
        ];
    } else if (role === 'writer') {
        title = "Writer Desk";
        subtitle = "Write, manage, and submit renewable energy articles for editorial approval.";
        const [user] = clerkId ? await db.select().from(users).where(eq(users.clerkId, clerkId)) : [];
        if (!user) {
            stats = [
                { title: "Welcome", value: "—", unit: "Setting up your writer profile…", icon: <Activity className="w-4 h-4 text-amber" /> },
            ];
        } else {
            const [profile] = await db.select().from(writerProfiles).where(eq(writerProfiles.userId, user.id));
            const articleStats = await db.select({
                total: sql<number>`count(*)`,
                published: sql<number>`count(*) filter (where is_published = true)`,
                pending: sql<number>`count(*) filter (where is_published = false and status = 'pending_review')`
            }).from(news).where(eq(news.authorId, user.id));

            const profileStatus = profile?.status || 'draft';
            const formattedStatus = profileStatus === 'approved' ? 'Verified' : profileStatus === 'pending_review' ? 'In Review' : 'Needs Setup';

            stats = [
                { title: "Profile Status", value: formattedStatus, unit: profileStatus === 'approved' ? "Approved to write" : "Admin review required", icon: <ShieldCheck className="w-4 h-4 text-purple-600" /> },
                { title: "Total Articles", value: (articleStats[0]?.total ?? 0).toString(), unit: "Written posts", icon: <FileText className="w-4 h-4 text-amber" /> },
                { title: "Published", value: (articleStats[0]?.published ?? 0).toString(), unit: "Live on platform", icon: <Activity className="w-4 h-4 text-green-500" /> },
                { title: "Pending Review", value: (articleStats[0]?.pending ?? 0).toString(), unit: "Awaiting approval", icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> },
            ];
        }
    } else {
        // Fallback: redirect unknown roles to access-denied
        stats = [
            { title: "No Access", value: "—", unit: "Contact admin", icon: <Activity className="w-4 h-4 text-slate-custom" /> },
        ];
    }

    // Fetch 7-day Trend Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let trendFilter = sql`true`;
    if (role === 'epc' || role === 'brand') {
        const [u] = await db.select().from(users).where(eq(users.clerkId, clerkId!));
        if (u) trendFilter = eq(inquiries.receiverId, u.id);
    }

    const trendsRaw = await db.select({
        date: sql<string>`TO_CHAR(${inquiries.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`
    })
        .from(inquiries)
        .where(and(sql`${inquiries.createdAt} >= ${sevenDaysAgo}`, trendFilter))
        .groupBy(sql`TO_CHAR(${inquiries.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`TO_CHAR(${inquiries.createdAt}, 'YYYY-MM-DD')`);

    // Fill in missing days for the chart
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const match = trendsRaw.find(t => t.date === dateStr);
        days.push({
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            value: match ? Number(match.count) : 0,
            date: dateStr
        });
    }

    const maxValue = Math.max(...days.map(d => d.value), 10);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="font-space-grotesk text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-ink">{title}</h1>
                    <p className="text-slate-custom text-base md:text-lg">{subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <CommandPaletteTrigger />
                    {isAdmin ? (
                        <LiveAnalyticsHeaderBadge />
                    ) : (
                        <div className="w-fit bg-[rgba(47,110,98,0.1)] text-teal px-4 py-2 rounded-[20px] text-[0.7rem] font-ibm-plex-mono font-semibold flex items-center gap-2 border border-teal/20 uppercase tracking-widest">
                            <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                            LIVE ANALYTICS
                        </div>
                    )}
                </div>
            </div>

            <div className={isAdmin ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"}>
                {stats.map((s, i) => (
                    <StatCard
                        key={i}
                        title={s.title}
                        value={s.value}
                        unit={s.unit}
                        icon={s.icon}
                        compact={isAdmin}
                        accentColor={(s as any).accentColor}
                    />
                ))}
            </div>

            {/* MAIN BENTO SECTION - FULL WIDTH ANALYTICS */}
            <div className="w-full">
                {isAdmin ? (
                    <GoogleAnalyticsSection data={gaData} />
                ) : (
                    <Card className="border border-line/80 shadow-xs rounded-2xl overflow-hidden bg-white hover:border-teal/40 hover:shadow-sm transition-all duration-200">
                        <CardHeader className="p-6 md:p-8 pb-4 border-b border-line/60 flex flex-row items-center justify-between">
                            <CardTitle className="font-space-grotesk text-xl font-bold flex items-center gap-2 text-navy-deep">
                                <Activity className="w-5 h-5 text-teal" />
                                {'Engagement Trends (7d)'}
                            </CardTitle>
                            <span className="text-[11px] font-ibm-plex-mono text-slate-custom uppercase tracking-wider">Inquiries Telemetry</span>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 pt-6">
                            <div className="h-[250px] md:h-[350px] w-full bg-paper rounded-xl flex items-end p-6 md:p-8 gap-3 md:gap-6 border border-line relative overflow-hidden group">
                                {/* Background Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 pointer-events-none opacity-20">
                                    {[1, 2, 3, 4].map(line => <div key={line} className="w-full h-px bg-slate-custom/30 border-t border-dashed" />)}
                                </div>

                                {days.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center gap-3 h-full justify-end group/bar z-10"
                                    >
                                        <div
                                            className="w-full max-w-[40px] bg-gradient-to-t from-teal/80 to-teal rounded-t-md transition-all duration-500 ease-out hover:brightness-110 relative"
                                            style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: d.value > 0 ? '4px' : '0px' }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-navy-deep backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all transform scale-90 group-hover/bar:scale-100 z-20 shadow-xl border border-white/10 whitespace-nowrap font-ibm-plex-mono">
                                                {d.value} {d.value === 1 ? 'Inquiry' : 'Inquiries'}
                                            </div>
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-teal/20 blur-md -z-10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="font-ibm-plex-mono text-[10px] md:text-[0.7rem] font-semibold text-slate-custom uppercase tracking-widest opacity-70 group-hover/bar:opacity-100 group-hover/bar:text-teal transition-all">
                                            {d.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    unit,
    icon,
    compact = false,
    accentColor = "bg-amber"
}: {
    title: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    compact?: boolean;
    accentColor?: string;
}) {
    if (compact) {
        return (
            <div className="bg-white rounded-2xl p-4 border border-line shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200">
                <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />
                <div className="flex items-center justify-between mb-2 pt-0.5">
                    <span className="font-ibm-plex-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 truncate max-w-[75%]">
                        {title}
                    </span>
                    <div className="p-1.5 rounded-lg bg-paper text-navy-deep border border-line/60 group-hover:scale-105 transition-transform">
                        {icon}
                    </div>
                </div>
                <div className="font-space-grotesk text-2xl font-bold tracking-tight text-navy-deep">
                    {value}
                </div>
                <p className="font-ibm-plex-mono text-[10.5px] font-medium text-slate-400 mt-1 truncate">
                    {unit}
                </p>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-2xl p-6 border border-line shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200">
            <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />
            <div className="flex items-center justify-between mb-3">
                <span className="font-ibm-plex-mono text-[11px] uppercase font-bold tracking-widest text-slate-500">{title}</span>
                <div className="p-2 bg-paper rounded-xl text-teal border border-line group-hover:scale-105 transition-transform">
                    {icon}
                </div>
            </div>
            <div className="font-space-grotesk text-3xl font-bold tracking-tight mb-1 text-navy-deep">{value}</div>
            <p className="font-ibm-plex-mono text-[11px] font-medium text-slate-400 tracking-wider">{unit}</p>
        </div>
    );
}

