import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { users, inquiries } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { InquiriesTable } from "@/components/dashboard/inquiries-table";
import { Inbox, Mail, ShieldAlert, Globe, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
        redirect("/dashboard");
    }

    // Fetch all inquiries and filter in memory to avoid query issues
    const allInquiries = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

    const partnerInquiries = allInquiries.filter(i => i.inquiryType === "support");
    const publicInquiries = allInquiries.filter(i => i.inquiryType === "public");


    const partnerUnreadCount = partnerInquiries.filter(i => !i.isRead).length;
    const publicUnreadCount = publicInquiries.filter(i => !i.isRead).length;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-line/60 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-custom opacity-60 mb-1">Total Volume</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black">{allInquiries.length}</span>
                        <span className="text-xs font-bold text-slate-custom mb-1">Received</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-line/60 shadow-sm border-l-4 border-l-primary">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber opacity-80 mb-1">Active Support</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-amber">{partnerInquiries.length}</span>
                        <span className="text-xs font-bold text-slate-custom mb-1">Partner Tickets</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-line/60 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-custom opacity-60 mb-1">Public Pulse</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black">{publicInquiries.length}</span>
                        <span className="text-xs font-bold text-slate-custom mb-1">Web Leads</span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-7 h-7 text-amber" />
                        Admin Inbox
                    </h1>
                    <p className="text-slate-custom text-sm mt-1">
                        Manage support requests and public inquiries
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/api/reports?type=inquiries" download>
                        <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2 font-bold whitespace-nowrap">
                            <MessageSquare className="w-4 h-4" /> Export CSV
                        </Button>
                    </a>
                    {(partnerUnreadCount + publicUnreadCount) > 0 && (
                        <div className="w-fit flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                            <Mail className="w-4 h-4" />
                            {(partnerUnreadCount + publicUnreadCount)} unread request{(partnerUnreadCount + publicUnreadCount) !== 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="partner" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                    <TabsTrigger value="partner" className="relative">
                        <Inbox className="w-4 h-4 mr-2" />
                        Partner Support
                        {partnerUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                                {partnerUnreadCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="public" className="relative">
                        <Globe className="w-4 h-4 mr-2" />
                        Public Inquiries
                        {publicUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                                {publicUnreadCount}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="partner" className="space-y-4">
                    <div className="bg-amber/5 text-ink border border-amber/10 rounded-2xl p-6 mb-4">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-amber" />
                            <h3 className="font-bold">Partner Support Tickets</h3>
                        </div>
                        <p className="text-sm text-slate-custom mt-1">
                            Direct messages from EPC Installers and Brands. You can reply to these directly within the platform.
                        </p>
                    </div>
                    <InquiriesTable inquiries={partnerInquiries} />
                </TabsContent>

                <TabsContent value="public" className="space-y-4">
                    <div className="bg-paper/20 border border-paper rounded-2xl p-6 mb-4">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-amber" />
                            <h3 className="font-bold">Public Website Inquiries</h3>
                        </div>
                        <p className="text-sm text-slate-custom mt-1">
                            Messages from the Contact Us form on the public website. These users do not have dashboards; please contact them via the provided email or phone.
                        </p>
                    </div>
                    <InquiriesTable inquiries={publicInquiries} hideReply={true} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
