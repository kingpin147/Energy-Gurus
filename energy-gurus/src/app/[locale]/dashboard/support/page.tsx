import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SupportForm } from "@/components/forms/support-form";
import { db } from "@/db";
import { users, inquiries } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Clock, MessageCircle } from "lucide-react";

export default async function SupportPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) redirect("/sign-in");

    const mySupportRequests = await db.select().from(inquiries)
        .where(and(
            eq(inquiries.senderId, user.id),
            eq(inquiries.inquiryType, "support")
        ))
        .orderBy(desc(inquiries.createdAt));

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
            <SupportForm />

            {mySupportRequests.length > 0 && (
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-amber" />
                        My Support History
                    </h3>
                    <div className="space-y-4">
                        {mySupportRequests.map((req) => (
                            <div key={req.id} className="bg-white border rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-semibold text-sm">{req.subject}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                                            req.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                            req.status === 'replied' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-custom whitespace-pre-wrap mb-4">{req.message}</p>
                                
                                {req.reply && (
                                    <div className="mt-4 p-4 rounded-xl bg-amber/5 text-ink border border-amber/10">
                                        <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Admin Reply</p>
                                        <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap">{req.reply}</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-1 mt-4 text-slate-custom">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs">
                                        {new Date(req.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
