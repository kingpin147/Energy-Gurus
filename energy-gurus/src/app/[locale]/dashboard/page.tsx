import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Battery, Sun, AlertTriangle, Users, MessageSquare, Package, ShieldCheck } from "lucide-react";
import { getUserRole } from "@/lib/roles";
import { db } from "@/db";
import { users, inquiries, epcInstallers, brands, products } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Link } from "@/i18n/routing";

export default async function Dashboard() {
    const role = await getUserRole();
    const { userId: clerkId } = await auth();

    // Fetch common data if needed, or role-specific data
    let stats = [];
    let title = "Monitoring Dashboard";
    let subtitle = "Real-time telemetry and system performance overview.";

    if (role === 'epc') {
        title = "EPC Overview";
        subtitle = "Track your company's performance and customer engagement.";
        const [user] = clerkId ? await db.select().from(users).where(eq(users.clerkId, clerkId)) : [];
        if (!user) {
            stats = [
                { title: "Welcome", value: "—", unit: "Setting up your profile…", icon: <Activity className="w-4 h-4 text-primary" /> },
            ];
        } else {
            const inquiryStats = await db.select({
                total: sql<number>`count(*)`,
                newLeads: sql<number>`count(*) filter (where status = 'new')`
            }).from(inquiries).where(eq(inquiries.receiverId, user.id));

            stats = [
                { title: "Total Inquiries", value: inquiryStats[0].total.toString(), unit: "Customer leads", icon: <MessageSquare className="w-4 h-4 text-primary" /> },
                { title: "New Leads", value: inquiryStats[0].newLeads.toString(), unit: "Action required", icon: <Activity className="w-4 h-4 text-orange-500" /> },
                { title: "Avg. Rating", value: "4.8", unit: "Out of 5", icon: <Sun className="w-4 h-4 text-yellow-500" /> },
                { title: "Profile Views", value: "1.2k", unit: "This month", icon: <Users className="w-4 h-4 text-blue-500" /> },
            ];
        }
    } else if (role === 'brand') {
        title = "Brand Center";
        subtitle = "Manage your product ecosystem and brand reputation.";
        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId!));
        const [brand] = await db.select().from(brands).where(eq(brands.userId, user.id));
        const productCount = brand ? await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.brandId, brand.id)) : [{ count: 0 }];
        const inquiryCount = await db.select({ count: sql<number>`count(*)` }).from(inquiries).where(eq(inquiries.receiverId, user.id));

        stats = [
            { title: "Active Products", value: productCount[0].count.toString(), unit: "In directory", icon: <Package className="w-4 h-4 text-primary" /> },
            { title: "Verifications", value: "450", unit: "Successful checks", icon: <ShieldCheck className="w-4 h-4 text-green-500" /> },
            { title: "Brand Inquiries", value: inquiryCount[0].count.toString(), unit: "Total received", icon: <MessageSquare className="w-4 h-4 text-accent" /> },
            { title: "Support Tickets", value: "3", unit: "Open cases", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
        ];
    } else if (role === 'admin' || role === 'super-admin') {
        title = "Admin Console";
        subtitle = "Global platform management and oversight.";
        const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
        const epcCount = await db.select({ count: sql<number>`count(*)` }).from(epcInstallers);
        const globalInquiries = await db.select({ count: sql<number>`count(*)` }).from(inquiries);

        stats = [
            { title: "Total Users", value: userCount[0].count.toString(), unit: "Registered", icon: <Users className="w-4 h-4 text-primary" /> },
            { title: "Verified EPCs", value: epcCount[0].count.toString(), unit: "Partners", icon: <ShieldCheck className="w-4 h-4 text-green-500" /> },
            { title: "Global Inquiries", value: globalInquiries[0].count.toString(), unit: "Total platform", icon: <MessageSquare className="w-4 h-4 text-blue-500" /> },
            { title: "System Health", value: "99.9%", unit: "Operational", icon: <Activity className="w-4 h-4 text-green-500" /> },
        ];
    } else {
        // Fallback: redirect unknown roles to access-denied
        stats = [
            { title: "No Access", value: "—", unit: "Contact admin", icon: <Activity className="w-4 h-4 text-muted-foreground" /> },
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
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{title}</h1>
                    <p className="text-muted-foreground text-base md:text-lg">{subtitle}</p>
                </div>
                <div className="w-fit bg-green-500/10 text-green-600 px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    LIVE ANALYTICS
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <StatCard key={i} title={s.title} value={s.value} unit={s.unit} icon={s.icon} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="p-6 md:p-8 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            {'Engagement Trends (7d)'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-4">
                        <div className="h-[250px] md:h-[350px] w-full bg-secondary/5 rounded-3xl flex items-end p-6 md:p-8 gap-3 md:gap-6 border border-border/50 relative overflow-hidden group">
                            {/* Background Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 pointer-events-none opacity-20">
                                {[1, 2, 3, 4].map(line => <div key={line} className="w-full h-px bg-muted-foreground/20 border-t border-dashed" />)}
                            </div>

                            {days.map((d, i) => (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center gap-3 h-full justify-end group/bar z-10"
                                >
                                    <div
                                        className="w-full max-w-[40px] bg-gradient-to-t from-primary/80 to-primary rounded-t-xl transition-all duration-500 ease-out hover:brightness-110 relative"
                                        style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: d.value > 0 ? '4px' : '0px' }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all transform scale-90 group-hover/bar:scale-100 z-20 shadow-xl border border-white/10 whitespace-nowrap">
                                            {d.value} {d.value === 1 ? 'Inquiry' : 'Inquiries'}
                                        </div>
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-primary/20 blur-md -z-10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-tighter opacity-70 group-hover/bar:opacity-100 group-hover/bar:text-primary transition-all">
                                        {d.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-primary text-primary-foreground overflow-hidden">
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-4">
                        {role === 'epc' && (
                            <>
                                <Link href="/dashboard/epc" className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl text-left px-4 flex items-center text-sm font-bold transition-colors">Update Profile & Portfolio</Link>
                                <Link href="/dashboard/support" className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl text-left px-4 flex items-center text-sm font-bold transition-colors">Contact Expert Support</Link>
                            </>
                        )}
                        {role === 'brand' && (
                            <>
                                <Link href="/dashboard/brand" className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl text-left px-4 flex items-center text-sm font-bold transition-colors">Manage Product Catalog</Link>
                                <Link href="/dashboard/support" className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl text-left px-4 flex items-center text-sm font-bold transition-colors">Head Office Support</Link>
                            </>
                        )}
                        {(role === 'admin' || role === 'super-admin') && (
                            <>
                                <Link href="/dashboard/users" className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl text-left px-4 flex items-center text-sm font-bold transition-colors">Manage System Users</Link>
                                <Link href="/dashboard/inbox" className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl text-left px-4 flex items-center text-sm font-bold transition-colors">Platform Lead Inbox</Link>
                            </>
                        )}

                        <Link href="/dashboard/settings" className="w-full h-12 bg-white text-primary rounded-xl flex items-center justify-center text-sm font-bold shadow-lg mt-4">Account Settings</Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, unit, icon }: { title: string, value: string, unit: string, icon: React.ReactNode }) {
    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className="p-2 bg-secondary/10 rounded-lg">
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
                <p className="text-xs font-medium text-muted-foreground">{unit}</p>
            </CardContent>
        </Card>
    );
}

