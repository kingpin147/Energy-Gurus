import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Battery, Sun, AlertTriangle } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
                    <p className="text-muted-foreground">Real-time telemetry and system performance overview.</p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Systems Online
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Power Output" value="4.2 kW" unit="Current" icon={<Sun className="w-4 h-4 text-primary" />} />
                <StatCard title="Daily Energy" value="28.5 kWh" unit="Total" icon={<BarChart3 className="w-4 h-4 text-primary" />} />
                <StatCard title="Battery SOC" value="82%" unit="Standard" icon={<Battery className="w-4 h-4 text-primary" />} />
                <StatCard title="Active Alerts" value="0" unit="All clear" icon={<AlertTriangle className="w-4 h-4 text-primary" />} />
            </div>

            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Power Yield (Last 24h)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-secondary/20 rounded-lg flex items-end p-4 gap-2">
                        {[40, 60, 45, 70, 85, 100, 90, 75, 50, 30].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-primary rounded-t-sm transition-all hover:bg-accent"
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-muted-foreground px-2">
                        <span>06:00 AM</span>
                        <span>12:00 PM</span>
                        <span>06:00 PM</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, unit, icon }: { title: string, value: string, unit: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{unit}</p>
            </CardContent>
        </Card>
    );
}
