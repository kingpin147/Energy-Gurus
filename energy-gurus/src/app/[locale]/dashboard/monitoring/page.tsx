import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, TrendingUp, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MonitoringDashboardPage() {
    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Telemetry</h1>
                    <p className="text-muted-foreground">High-resolution performance data from your energy assets.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Site: DHA Phase 6</Button>
                    <Button variant="accent" size="sm">Live View</Button>
                </div>
            </div>

            {/* Grid of Gauges/Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GaugeCard title="Total Power Flow" value="12.8" unit="kW" trend="+2.4% vs last hour" color="text-yellow-500" />
                <GaugeCard title="Grid Export" value="8.4" unit="kW" trend="Net Metering Active" color="text-green-500" />
                <GaugeCard title="Self-Consumption" value="94%" unit="Ratio" trend="Optimal" color="text-primary" />
            </div>

            {/* Chart Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Inverter Performance (Strings 1-4)</CardTitle>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-full" /> String 1</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-accent rounded-full" /> String 2</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full bg-secondary/5 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground italic">
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
                        <HealthItem label="Inverter A (Main)" status="Online" temp="42°C" efficiency="97.8%" />
                        <HealthItem label="Inverter B (Backyard)" status="Online" temp="38°C" efficiency="98.2%" />
                        <HealthItem label="Battery BMS" status="Online" temp="26°C" voltage="52.4V" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Log / Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <AlertItem icon={<CheckCircle2 className="text-green-500" />} message="Grid sync successful" time="2 mins ago" />
                            <AlertItem icon={<Clock className="text-yellow-500" />} message="Scheduled maintenance in 4 days" time="1 hour ago" />
                            <AlertItem icon={<AlertCircle className="text-red-500" />} message="Low cloud coverage detected - Yield reduced" time="3 hours ago" />
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
                <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-4xl font-bold ${color}`}>{value}</h2>
                    <span className="text-muted-foreground font-medium">{unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1 font-medium italic underline decoration-accent/50">
                    {trend}
                </p>
            </CardContent>
        </Card>
    );
}

function HealthItem({ label, status, temp, efficiency, voltage }: { label: string, status: string, temp: string, efficiency?: string, voltage?: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
            <div>
                <p className="font-bold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{efficiency || voltage} • {temp}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-green-100 text-green-700 rounded-full">
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
                <p className="text-xs text-muted-foreground">{time}</p>
            </div>
        </div>
    );
}
