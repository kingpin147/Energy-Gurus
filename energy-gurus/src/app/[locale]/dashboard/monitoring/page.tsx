import { Activity, Zap, TrendingUp, AlertCircle, Clock, CheckCircle2, ShieldCheck, ShieldAlert, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { monitoringStats } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";

export default async function MonitoringDashboardPage() {
    const [latestStats] = await db.select().from(monitoringStats).orderBy(desc(monitoringStats.updatedAt)).limit(1);

    if (!latestStats) {
        return <div className="p-8 text-center text-slate-custom italic">No monitoring data available.</div>;
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Site: DHA Phase 6</Button>
                    <a href="/api/reports?type=monitoring" download>
                        <Button variant="outline" size="sm" className="gap-2">
                            <TrendingUp className="w-4 h-4" /> Export CSV
                        </Button>
                    </a>
                    <Button variant="accent" size="sm">Live View</Button>
                </div>
            </div>

            {/* Grid of Gauges/Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GaugeCard title="Total Power Flow" value={latestStats.totalPowerFlow} unit="kW" trend="+2.4% vs last hour" color="text-yellow-500" />
                <GaugeCard title="Grid Export" value={latestStats.gridExport} unit="kW" trend="Net Metering Active" color="text-green-500" />
                <GaugeCard title="Self-Consumption" value={`${latestStats.selfConsumption}%`} unit="Ratio" trend="Optimal" color="text-amber" />
            </div>

            {/* Chart Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Inverter Performance (Strings 1-4)</CardTitle>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber text-ink rounded-full" /> String 1</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-paper rounded-full" /> String 2</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full bg-paper/5 rounded-xl border border-dashed flex items-center justify-center text-slate-custom italic">
                        [ Interactive Power Curve Graph Rendering ]
                    </div>
                </CardContent>
            </Card>

            {/* Status & Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Inverter Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {latestStats.inverterHealth.map((inv: any, i: number) => (
                            <HealthItem
                                key={i}
                                label={`Inverter ${String.fromCharCode(65 + i)}`}
                                status={inv.status === 'optimal' ? 'Online' : 'Check'}
                                temp={`${inv.temp}°C`}
                                efficiency={`${inv.efficiency}%`}
                                color={inv.status === 'optimal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                            />
                        ))}
                        <HealthItem label="Battery BMS" status="Online" temp="26°C" voltage="52.4V" color="bg-green-100 text-green-700" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Log / Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {latestStats.alerts.map((alert: any, i: number) => (
                                <AlertItem
                                    key={i}
                                    icon={
                                        alert.type === 'critical' ? <AlertCircle className="text-red-500" /> :
                                            alert.type === 'warning' ? <ShieldAlert className="text-yellow-500" /> :
                                                <ShieldCheck className="text-blue-500" />
                                    }
                                    message={alert.message}
                                    time={formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function GaugeCard({ title, value, unit, trend, color }: { title: string, value: string, unit: string, trend: string, color: string }) {
    return (
        <Card className="border-t-4 border-t-primary">
            <CardContent className="pt-6">
                <p className="text-sm font-medium text-slate-custom mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-4xl font-bold ${color}`}>{value}</h2>
                    <span className="text-slate-custom font-medium">{unit}</span>
                </div>
                <p className="text-xs text-slate-custom mt-4 flex items-center gap-1 font-medium italic underline decoration-accent/50">
                    {trend}
                </p>
            </CardContent>
        </Card>
    );
}

function HealthItem({ label, status, temp, efficiency, voltage, color }: { label: string, status: string, temp: string, efficiency?: string, voltage?: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-paper/10 rounded-lg">
            <div>
                <p className="font-bold text-sm text-graphite">{label}</p>
                <p className="text-xs text-slate-custom">{efficiency || voltage} • {temp}</p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${color}`}>
                {status}
            </span>
        </div>
    );
}

function AlertItem({ icon, message, time }: { icon: React.ReactNode, message: string, time: string }) {
    return (
        <div className="flex gap-4 border-b border-dashed pb-4 last:border-0 last:pb-0">
            <div className="mt-1">{icon}</div>
            <div>
                <p className="text-sm font-medium">{message}</p>
                <p className="text-xs text-slate-custom">{time}</p>
            </div>
        </div>
    );
}
