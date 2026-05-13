import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ListSort } from "@/components/shared/list-sort";
import { ListSearch } from "@/components/shared/list-search";
import { eq, desc, asc, and, or, like } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, CheckCircle2, Trash2, Mail, User } from "lucide-react";
import { updateInquiryStatus, deleteInquiry } from "@/lib/actions/inquiries";

export default async function InquiriesPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string; status?: string; q?: string }>;
}) {
    const { sort, status, q } = await searchParams;
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) redirect("/dashboard");

    const order = sort === "oldest" ? asc(inquiries.createdAt) : desc(inquiries.createdAt);
    const statusCondition = status ? eq(inquiries.status, status as "new" | "in-progress" | "closed") : undefined;
    const searchCondition = q ? or(like(inquiries.message, `%${q}%`), like(users.name, `%${q}%`)) : undefined;

    const myInquiries = await db.select({
        inquiry: inquiries,
        sender: users
    })
    .from(inquiries)
    .leftJoin(users, eq(inquiries.senderId, users.id))
    .where(and(
        eq(inquiries.receiverId, dbUser.id),
        statusCondition,
        searchCondition
    ))
    .orderBy(order);

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
                        <p className="text-muted-foreground">Track and respond to customer inquiries from your public profile.</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <ListSearch placeholder="Search leads..." />
                    <div className="flex gap-3">
                        <ListSort 
                            label="Filter by Status"
                            defaultValue="all"
                            options={[
                                { label: "All Statuses", value: "" },
                                { label: "New", value: "new" },
                                { label: "In-Progress", value: "in-progress" },
                                { label: "Resolved", value: "closed" },
                            ]} 
                            
                        />
                        <ListSort 
                            options={[
                                { label: "Latest", value: "latest" },
                                { label: "Oldest", value: "oldest" },
                            ]} 
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {myInquiries.map(({ inquiry, sender }) => (
                    <Card key={inquiry.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
                        <div className={`h-2 ${
                            inquiry.status === 'new' ? 'bg-blue-500' :
                            inquiry.status === 'in-progress' ? 'bg-orange-500' :
                            'bg-green-500'
                        }`} />
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{sender?.name || "Anonymous User"}</p>
                                                <p className="text-xs text-muted-foreground">{sender?.email || "No email provided"}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            inquiry.status === 'new' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                            inquiry.status === 'in-progress' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                            'bg-green-100 text-green-600 border-green-200'
                                        }`}>
                                            {inquiry.status}
                                        </span>
                                    </div>

                                    <div className="bg-secondary/5 p-6 rounded-2xl border italic text-muted-foreground">
                                        &quot;{inquiry.message}&quot;
                                    </div>

                                    <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Received {new Date(inquiry.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Actions</p>
                                    
                                    <form action={async () => {
                                        "use server";
                                        await updateInquiryStatus(inquiry.id, 'in-progress');
                                    }}>
                                        <Button variant="outline" className="w-full rounded-xl font-bold h-11 gap-2 border-2" disabled={inquiry.status === 'in-progress'}>
                                            <Clock className="w-4 h-4" /> Mark In-Progress
                                        </Button>
                                    </form>

                                    <form action={async () => {
                                        "use server";
                                        await updateInquiryStatus(inquiry.id, 'closed');
                                    }}>
                                        <Button variant="primary" className="w-full rounded-xl font-bold h-11 gap-2" disabled={inquiry.status === 'closed'}>
                                            <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                                        </Button>
                                    </form>

                                    <form action={async () => {
                                        "use server";
                                        await deleteInquiry(inquiry.id);
                                    }}>
                                        <Button variant="ghost" className="w-full rounded-xl font-bold h-11 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" /> Delete Lead
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {myInquiries.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-secondary/5 space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <Mail className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">No leads yet</h3>
                            <p className="text-muted-foreground">Inquiries from your public profile will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
