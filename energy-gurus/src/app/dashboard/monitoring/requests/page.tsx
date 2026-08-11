import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, monitoringRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function MonitoringRequestsPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    // Only allow super-admin or admin to view all requests
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user || (user.role !== 'super-admin' && user.role !== 'admin')) {
        redirect("/dashboard");
    }

    const requests = await db.select().from(monitoringRequests).orderBy(desc(monitoringRequests.createdAt));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="w-7 h-7 text-amber" />
                        Monitoring Setup Requests
                    </h1>
                    <p className="text-slate-custom text-sm mt-1">
                        Requests submitted from the public monitoring page.
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-custom uppercase bg-paper border-b border-line">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">System Size</th>
                                    <th className="px-6 py-4 font-semibold">Package / Hrs</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-custom italic">
                                            No monitoring requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="border-b border-line hover:bg-paper/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-ink">{req.customerName}</div>
                                                <div className="text-slate-custom text-xs">{req.customerType}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>{req.contactNo}</div>
                                                <div className="text-slate-custom text-xs">{req.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-ibm-plex-mono text-teal">
                                                {req.systemSize === '1' ? '1-10kW' : 
                                                 req.systemSize === '1.25' ? '10-20kW' : 
                                                 req.systemSize === '1.5' ? '20-30kW' : '30kW+'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">
                                                    {req.package === '1000' ? 'Basic' : 
                                                     req.package === '1800' ? 'Moderate' : 
                                                     req.package === '3000' ? 'Comprehensive' : 'Contact Us'}
                                                </div>
                                                <div className="text-slate-custom text-xs">{req.monitoringHours === '1' ? '12 Hours' : '24 Hours'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    req.status === 'pending' ? 'bg-amber/20 text-amber' : 
                                                    req.status === 'contacted' ? 'bg-blue-100 text-blue-700' : 
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
