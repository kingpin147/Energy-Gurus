import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, TrendingUp, Calendar, Filter, Users, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
    return (
        <div className="p-6 space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
                    <p className="text-muted-foreground">Download and analyze system performance and maintenance records.</p>
                </div>
            </div>

            {/* Operational Data Exports Panel */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Operational Data Exports</h2>
                    <p className="text-sm text-muted-foreground font-medium">Download live Excel-compatible spreadsheets containing active platform records.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow border-none shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100/50 text-blue-600 border border-blue-200 px-2 py-1 rounded-full">CSV Matrix</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">User Base Roster</h3>
                                <p className="text-xs text-muted-foreground">Full roster of all registered admin, EPC, and brand accounts with login states.</p>
                            </div>
                            <Button asChild variant="outline" className="w-full gap-2 rounded-xl font-bold h-11 border-blue-200 text-blue-600 hover:bg-blue-50">
                                <a href="/api/export/users" download>
                                    <Download className="w-4 h-4" /> Download Users CSV
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow border-none shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-green-100/50 text-green-600 border border-green-200 px-2 py-1 rounded-full">CSV Matrix</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">InMail Leads & Inquiries</h3>
                                <p className="text-xs text-muted-foreground">Historical records of guest leads, corporate questions, and dialog histories.</p>
                            </div>
                            <Button asChild variant="outline" className="w-full gap-2 rounded-xl font-bold h-11 border-green-200 text-green-600 hover:bg-green-50">
                                <a href="/api/export/inquiries" download>
                                    <Download className="w-4 h-4" /> Download Inquiries CSV
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow border-none shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                                    <Star className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-orange-100/50 text-orange-600 border border-orange-200 px-2 py-1 rounded-full">CSV Matrix</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Customer Reviews Feed</h3>
                                <p className="text-xs text-muted-foreground">Complete feed of rating scores, author emails, comments, and replies.</p>
                            </div>
                            <Button asChild variant="outline" className="w-full gap-2 rounded-xl font-bold h-11 border-orange-200 text-orange-600 hover:bg-orange-50">
                                <a href="/api/export/reviews" download>
                                    <Download className="w-4 h-4" /> Download Reviews CSV
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Historical Audit PDF Archives</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ReportCard
                        title="February 2026 Audit"
                        date="Feb 28, 2026"
                        type="Audit Report"
                        status="Finalized"
                    />
                    <ReportCard
                        title="Q1 Maintenance Log"
                        date="Feb 15, 2026"
                        type="O&M Log"
                        status="Signed"
                    />
                    <ReportCard
                        title="Annual Yield Analysis"
                        date="Jan 30, 2026"
                        type="Performance"
                        status="Draft"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Form Submissions (Leads)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs uppercase bg-secondary/20">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Service</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <LeadRow name="Ahmed Khan" email="ahmed@example.com" service="Residential Audit" date="Mar 02, 2026" status="New" />
                                <LeadRow name="Maria Siddiqui" email="maria.s@company.pk" service="O&M Quote" date="Mar 01, 2026" status="Contacted" />
                                <LeadRow name="Zain Ali" email="zain.ali@solar.com" service="Monitoring Trial" date="Feb 28, 2026" status="Qualified" />
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ReportCard({ title, date, type, status }: { title: string, date: string, type: string, status: string }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">{status}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{type} • {date}</p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                    <Download className="w-3 h-3" /> Download PDF
                </Button>
            </CardContent>
        </Card>
    );
}

function LeadRow({ name, email, service, date, status }: { name: string, email: string, service: string, date: string, status: string }) {
    return (
        <tr className="border-b hover:bg-secondary/10 transition-colors">
            <td className="px-6 py-4 font-medium text-foreground">{name}</td>
            <td className="px-6 py-4">{email}</td>
            <td className="px-6 py-4">{service}</td>
            <td className="px-6 py-4">{date}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${status === 'New' ? 'bg-blue-100 text-blue-700' :
                        status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {status}
                </span>
            </td>
        </tr>
    );
}
